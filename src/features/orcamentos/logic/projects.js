// src/features/calculadora/logic/projects.js
import { create } from 'zustand';
import api from '../../../utils/api'; 

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
            // Garante que sempre teremos um array, mesmo se o banco estiver vazio
            const projetosFormatados = Array.isArray(data) ? data : [];
            set({ projects: projetosFormatados, isLoading: false });
            return projetosFormatados;
        } catch (erro) {
            console.error("Erro ao buscar histórico no Banco de Dados:", erro);
            set({ isLoading: false, projects: [] });
            return [];
        }
    },

    // 2. SALVAR OU ATUALIZAR PROJETO (Rascunho/Orçamento)
    addHistoryEntry: async ({ id = null, label = "", entradas = {}, resultados = {} }) => {
        set({ isLoading: true });
        try {
            const listaAtual = get().projects;
            
            // Localiza projeto existente para preservar status ou define como rascunho
            const projetoExistente = id ? listaAtual.find(p => String(p.id) === String(id)) : null;
            const statusAtual = projetoExistente?.data?.status || "rascunho";

            // Garante que o label tenha um fallback válido
            const nomeProjeto = label || entradas.nomeProjeto || "Novo Orçamento";

            const payloadParaBanco = {
                id: id, 
                label: nomeProjeto,
                data: { 
                    entradas, 
                    resultados,
                    status: statusAtual,
                    ultimaAtualizacao: new Date().toISOString()
                }
            };

            const { data } = await api.post('/projects', payloadParaBanco);
            
            // Atualização do estado local: remove versão antiga (se houver) e adiciona a nova
            set((estado) => {
                const projetosFiltrados = estado.projects.filter(p => String(p.id) !== String(data.id));
                return { 
                    projects: [data, ...projetosFiltrados], 
                    isLoading: false 
                };
            });
            
            return data;
        } catch (erro) {
            console.error("Erro ao salvar projeto:", erro);
            set({ isLoading: false });
            return null;
        }
    },

    // 3. APROVAR ORÇAMENTO (Move para Produção e abate insumos)
    approveBudget: async (projeto) => {
        if (!projeto || !projeto.data) return false;

        set({ isLoading: true });
        const { entradas, resultados } = projeto.data;
        
        // Normalização da quantidade para evitar cálculos com undefined/NaN
        const quantidade = Number(entradas.quantidade || entradas.qtdPecas || 1);

        // Processamento de materiais para baixa de estoque
        let filamentosParaBaixa = [];
        const material = entradas.material || {};
        
        // Caso 1: Múltiplas Cores (Slots)
        if (material.selectedFilamentId === 'multi' || (material.slots && material.slots.length > 0)) {
            filamentosParaBaixa = (material.slots || [])
                .filter(slot => slot.id && slot.id !== 'manual' && Number(slot.weight || 0) > 0)
                .map(slot => ({ 
                    id: slot.id, 
                    // Soma o peso do slot multiplicado pela quantidade total de peças
                    peso: Number(slot.weight) * quantidade 
                }));
        } 
        // Caso 2: Cor Única
        else if (material.selectedFilamentId && material.selectedFilamentId !== 'manual') {
            // Usa o peso do modelo ou o peso total calculado nos resultados
            const pesoUnitario = Number(material.pesoModelo || resultados.pesoTotal || 0);
            if (pesoUnitario > 0) {
                filamentosParaBaixa = [{ 
                    id: material.selectedFilamentId, 
                    peso: pesoUnitario * quantidade
                }];
            }
        }

        try {
            // Chamada atômica: Atualiza status, abate estoque e registra horas na impressora
            await api.post('/approve-budget', {
                projectId: projeto.id,
                printerId: entradas.selectedPrinterId,
                filaments: filamentosParaBaixa,
                totalTime: Number(resultados.tempoTotalHoras || 0)
            });

            // Atualiza a lista local para refletir a mudança de status (de Orçamento para Produção)
            await get().fetchHistory();
            set({ isLoading: false });
            return true;
        } catch (erro) {
            console.error("Falha na aprovação do orçamento:", erro);
            set({ isLoading: false });
            return false;
        }
    },

    // 4. ATUALIZAR STATUS (Ex: Produção -> Finalizado ou Cancelado)
    updateProjectStatus: async (projetoId, novoStatus) => {
        if (!projetoId) return false;
        
        set({ isLoading: true });
        try {
            const projetoAtual = get().projects.find(p => String(p.id) === String(projetoId));
            if (!projetoAtual) throw new Error("Projeto não encontrado");

            const payloadAtualizado = {
                id: projetoId,
                label: projetoAtual.label,
                data: {
                    ...projetoAtual.data,
                    status: novoStatus,
                    ultimaAtualizacao: new Date().toISOString()
                }
            };

            await api.post('/projects', payloadAtualizado);
            
            // Sincroniza estado local após a alteração de status
            await get().fetchHistory();
            set({ isLoading: false });
            return true;
        } catch (erro) {
            console.error("Erro ao transicionar status:", erro);
            set({ isLoading: false });
            return false;
        }
    },

    // 5. REMOVER ENTRADA DO HISTÓRICO
    removeHistoryEntry: async (id) => {
        if (!id) return false;
        set({ isLoading: true });
        try {
            await api.delete(`/projects?id=${id}`);
            set((estado) => ({
                projects: estado.projects.filter(p => String(p.id) !== String(id)),
                isLoading: false
            }));
            return true;
        } catch (erro) {
            console.error("Erro ao excluir registro:", erro);
            set({ isLoading: false });
            return false;
        }
    },

    // 6. LIMPAR HISTÓRICO COMPLETO
    clearHistory: async () => {
        if (!confirm("Tem certeza que deseja apagar todo o histórico?")) return false;
        
        set({ isLoading: true });
        try {
            await api.delete('/projects'); 
            set({ projects: [], isLoading: false });
            return true;
        } catch (erro) {
            console.error("Erro ao limpar base de dados:", erro);
            set({ isLoading: false });
            return false;
        }
    }
}));