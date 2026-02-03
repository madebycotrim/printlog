// src/features/calculadora/logic/projects.js
import { create } from 'zustand';
import api from '../../../utils/api';
import { useToastStore } from '../../../stores/toastStore';

/**
 * useProjectsStore - Gestão de Orçamentos e Produção
 * Controla o ciclo de vida do projeto: Rascunho -> Orçamento -> Produção -> Finalizado.
 */
import { registrarHistoricoFilamentoApi } from '../../filamentos/logic/consultasFilamento';

/**
 * useProjectsStore - Gestão de Orçamentos e Produção
 * Controla o ciclo de vida do projeto: Rascunho -> Orçamento -> Produção -> Finalizado.
 */
export const useProjectsStore = create((set, get) => ({
    projects: [],
    isLoading: false,

    // 1. BUSCAR TODOS OS PROJETOS
    fetchHistory: async () => {
        set({ isLoading: true });
        try {
            const { data } = await api.get('/projects');
            // O backend retorna um array de objetos {id, label, data, created_at}
            const projetosFormatados = Array.isArray(data) ? data : [];
            set({ projects: projetosFormatados, isLoading: false });
            return projetosFormatados;
        } catch (erro) {
            console.error("Erro ao buscar histórico no Banco de Dados:", erro);
            useToastStore.getState().addToast("Erro ao carregar projetos.", "error");
            set({ isLoading: false, projects: [] });
            return [];
        }
    },

    // 2. SALVAR OU ATUALIZAR PROJETO (Rascunho/Orçamento)
    addHistoryEntry: async ({ id = null, label = "", entradas = {}, resultados = {} }) => {
        set({ isLoading: true });
        try {
            const listaAtual = get().projects;

            // Localiza projeto existente para preservar status
            const projetoExistente = id ? listaAtual.find(p => String(p.id) === String(id)) : null;
            const statusAtual = projetoExistente?.data?.status || "rascunho";

            // Garante que o label tenha um fallback válido
            const nomeProjeto = label || entradas.nomeProjeto || "Novo Orçamento";

            // PAYLOAD BLINDADO: Nunca enviamos valores undefined ou null para o banco D1
            const payloadParaBanco = {
                id: String(id || crypto.randomUUID()), // Garante String e ID único
                nome: String(nomeProjeto),
                entradas: entradas || {},
                resultados: resultados || {},
                status: statusAtual,
                ultimaAtualizacao: new Date().toISOString()
            };

            const { data } = await api.post('/projects', payloadParaBanco);

            // Atualiza a lista local após salvar com sucesso
            await get().fetchHistory();
            set({ isLoading: false });

            useToastStore.getState().addToast("Projeto salvo com sucesso!", "success");
            return data;
        } catch (erro) {
            console.error("Erro ao salvar projeto (500):", erro);
            useToastStore.getState().addToast("Erro ao salvar projeto.", "error");
            set({ isLoading: false });
            return null;
        }
    },

    // 3. APROVAR ORÇAMENTO (Move para Produção e abate insumos)
    approveBudget: async (projeto) => {
        if (!projeto || !projeto.id) return false;

        set({ isLoading: true });

        // Extração segura dos dados independente da estrutura (data ou flat)
        const d = projeto.data || projeto;
        const entradas = d.entradas || {};
        const resultados = d.resultados || {};

        const quantidade = Math.max(1, Number(entradas.quantidade || entradas.qtdPecas || 1));

        // Processamento de materiais para baixa de estoque
        let filamentosParaBaixa = [];
        const material = entradas.material || {};

        // Caso 1: Multi-material (Slots)
        if (material.slots && material.slots.length > 0) {
            filamentosParaBaixa = material.slots
                .filter(slot => slot.id && slot.id !== 'manual')
                .map(slot => ({
                    id: String(slot.id),
                    peso: Number(slot.weight || 0) * quantidade
                }));
        }
        // Caso 2: Material Único
        else if ((entradas.idFilamentoSelecionado || entradas.selectedFilamentId) && (entradas.idFilamentoSelecionado !== 'manual' && entradas.selectedFilamentId !== 'manual')) {
            const pesoUnitario = Number(entradas.pesoModelo || resultados.custoMaterial > 0 ? (resultados.custoMaterial / (resultados.precoKg / 1000)) : 0);
            if (pesoUnitario > 0) {
                filamentosParaBaixa = [{
                    id: String(entradas.idFilamentoSelecionado || entradas.selectedFilamentId),
                    peso: pesoUnitario * quantidade
                }];
            }
        }

        try {
            // Chamada ao Worker para atualizar status e subtrair estoque (Transação Batch)
            await api.post('/approve-budget', {
                projectId: String(projeto.id),
                printerId: entradas.idImpressoraSelecionada ? String(entradas.idImpressoraSelecionada) : (entradas.selectedPrinterId ? String(entradas.selectedPrinterId) : null),
                filamentos: filamentosParaBaixa,
                // Garante que o tempo nunca seja NaN para não quebrar o Worker
                totalTime: isNaN(Number(resultados.tempoTotalHoras)) ? 0 : Number(resultados.tempoTotalHoras)
            });

            // --- NOVO: Registrar histórico de consumo para cada filamento ---
            await Promise.all(filamentosParaBaixa.map(async (fil) => {
                try {
                    await registrarHistoricoFilamentoApi({
                        id: fil.id,
                        tipo: 'consumo',
                        qtd: fil.peso,
                        obs: `Uso em Projeto: ${projeto.nome || projeto.label || 'Sem Nome'}`
                    });
                } catch (err) {
                    console.error(`Erro ao registrar histórico para filamento ${fil.id}:`, err);
                }
            }));

            // Sincroniza a lista local
            await get().fetchHistory();
            set({ isLoading: false });
            useToastStore.getState().addToast("Orçamento aprovado e enviado para produção!", "success");
            return true;
        } catch (erro) {
            console.error("Falha na aprovação (500):", erro);
            useToastStore.getState().addToast("Falha ao aprovar orçamento.", "error");
            set({ isLoading: false });
            return false;
        }
    },

    // 4. ATUALIZAR STATUS (Ex: Produção -> Finalizado)
    updateProjectStatus: async (projetoId, novoStatus) => {
        if (!projetoId) return false;

        set({ isLoading: true });
        try {
            const lista = get().projects;
            const projetoAtual = lista.find(p => String(p.id) === String(projetoId));
            if (!projetoAtual) throw new Error("Projeto não encontrado");

            const payloadAtualizado = {
                id: String(projetoId),
                nome: String(projetoAtual.nome || projetoAtual.label),
                entradas: projetoAtual.data?.entradas || {},
                resultados: projetoAtual.data?.resultados || {},
                status: String(novoStatus),
                ultimaAtualizacao: new Date().toISOString()
            };

            await api.post('/projects', payloadAtualizado);

            await get().fetchHistory();
            set({ isLoading: false });
            useToastStore.getState().addToast(`Status atualizado para: ${novoStatus}`, "success");
            return true;
        } catch (erro) {
            console.error("Erro ao mudar status (500):", erro);
            useToastStore.getState().addToast("Erro ao atualizar status.", "error");
            set({ isLoading: false });
            return false;
        }
    },

    // 5. REMOVER ENTRADA
    removeHistoryEntry: async (id) => {
        if (!id) return false;
        set({ isLoading: true });
        try {
            await api.delete(`/projects/${id}`);

            set((estado) => ({
                projects: estado.projects.filter(p => String(p.id) !== String(id)),
                isLoading: false
            }));
            useToastStore.getState().addToast("Projeto removido.", "info");
            return true;
        } catch (erro) {
            console.error("Erro ao excluir registro:", erro);
            useToastStore.getState().addToast("Erro ao excluir projeto.", "error");
            set({ isLoading: false });
            return false;
        }
    },

    // 6. LIMPAR HISTÓRICO COMPLETO
    clearHistory: async () => {
        set({ isLoading: true });
        try {
            await api.delete('/projects');
            set({ projects: [], isLoading: false });
            useToastStore.getState().addToast("Todo o histórico foi limpo.", "warning");
            return true;
        } catch (erro) {
            console.error("Erro ao limpar base:", erro);
            useToastStore.getState().addToast("Erro ao limpar histórico.", "error");
            set({ isLoading: false });
            return false;
        }
    }
}));
