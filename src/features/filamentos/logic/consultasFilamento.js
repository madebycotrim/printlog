import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../utils/api';
import { useToastStore } from '../../../stores/toastStore';
import { useMemo } from 'react';

// ==================== UTILITÁRIOS ====================

export const normalizarFilamento = (f) => {
    if (!f) return null;

    const pesoTotal = Math.max(0, Number(f.peso_total) || 1000);
    const pesoAtual = Math.min(pesoTotal, Math.max(0, Number(f.peso_atual) || pesoTotal));

    return {
        id: f.id || null,
        nome: String(f.nome || "Novo Material").trim(),
        marca: String(f.marca || "Genérico").trim(),
        material: String(f.material || "PLA").toUpperCase().trim(),
        cor_hex: String(f.cor_hex || "#3b82f6").toLowerCase(),
        peso_total: pesoTotal,
        peso_atual: pesoAtual,
        preco: Math.max(0, Number(f.preco) || 0),
        favorito: Boolean(f.favorito),
        data_abertura: f.created_at || f.data_abertura || new Date().toISOString(),
    };
};

// ==================== FUNÇÕES DE API ====================

const buscarFilamentosApi = async () => {
    const { data } = await api.get('/filaments');
    const listaRaw = Array.isArray(data) ? data : (data?.data || []);
    return listaRaw.map(normalizarFilamento);
};

const salvarFilamentoApi = async (dadosFilamento) => {
    console.log("📥 [API] salvarFilamentoApi chamado com:", dadosFilamento);
    const tratado = normalizarFilamento(dadosFilamento);
    console.log("🔄 [API] Dados normalizados:", tratado);

    // Garantir que ID seja undefined se vazio para prevenir erros 500 na criação
    if (!tratado.id) delete tratado.id;
    console.log("🆔 [API] Dados após check de ID:", tratado);

    let resposta;

    if (tratado.id) {
        console.log(`📡 [API] Enviando PUT /filaments/${tratado.id}`);
        resposta = await api.put(`/filaments/${tratado.id}`, tratado);
    } else {
        console.log("📡 [API] Enviando POST /filaments com payload:", tratado);
        resposta = await api.post('/filaments', tratado);
    }

    console.log("✅ [API] Resposta recebida:", resposta);
    console.log("✅ [API] resposta.data:", resposta.data);

    return normalizarFilamento(resposta.data?.data || resposta.data);
};

const atualizarPesoApi = async ({ id, peso_atual }) => {
    await api.patch(`/filaments/${id}`, { peso_atual });
    return { id, peso_atual };
};

const excluirFilamentoApi = async (id) => {
    await api.delete(`/filaments/${id}`);
    return id;
};

const buscarHistoricoFilamentoApi = async (id) => {
    const { data } = await api.get(`/filaments/${id}/history`);
    return data;
};

export const registrarHistoricoFilamentoApi = async ({ id, tipo, qtd, obs }) => {
    const { data } = await api.post(`/filaments/${id}/history`, { type: tipo, qtd, obs });
    return data;
};

// ==================== HOOKS ====================

export const useHistoricoFilamento = (id) => {
    return useQuery({
        queryKey: ['historico-filamento', id],
        queryFn: () => buscarHistoricoFilamentoApi(id),
        enabled: !!id,
    });
};

export const useFilamentos = () => {
    const consulta = useQuery({
        queryKey: ['filamentos'],
        queryFn: buscarFilamentosApi,
    });

    // Cálculo de estatísticas derivado dos dados da consulta
    const estatisticas = useMemo(() => {
        const filamentos = consulta.data || [];
        return {
            pesoTotal: filamentos.reduce((acc, f) => acc + (f.peso_atual / 1000), 0), // Em KG
            valorTotal: filamentos.reduce((acc, f) => {
                const custoGrama = f.preco / f.peso_total;
                return acc + (custoGrama * f.peso_atual);
            }, 0),
            contagemEstoqueBaixo: filamentos.filter(f => (f.peso_atual / f.peso_total) <= 0.2).length,
            quantidade: filamentos.length
        };
    }, [consulta.data]);

    return { ...consulta, estatisticas };
};

export const useMutacoesFilamento = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToastStore();

    const mutacaoSalvar = useMutation({
        mutationFn: salvarFilamentoApi,
        onSuccess: (itemSalvo) => {
            console.log("🎊 [MUTATION] onSuccess chamado com:", itemSalvo);
            queryClient.setQueryData(['filamentos'], (antigo) => {
                console.log("📝 [MUTATION] Dados antigos:", antigo);
                if (!antigo) return [itemSalvo];
                const existe = antigo.find(f => f.id === itemSalvo.id);
                if (existe) {
                    console.log("✏️ [MUTATION] Atualizando item existente");
                    return antigo.map(f => f.id === itemSalvo.id ? itemSalvo : f);
                } else {
                    console.log("➕ [MUTATION] Adicionando novo item à lista");
                    return [itemSalvo, ...antigo];
                }
            });
            // Invalidar a query para forçar refetch e garantir UI atualizada
            queryClient.invalidateQueries(['filamentos']);
            console.log("🔄 [MUTATION] Query invalidada, UI deve atualizar");
            addToast("Filamento salvo com sucesso!", "success");
        },
        onError: (err) => {
            console.error("❌ Erro detalhado ao salvar filamento:", err);
            console.error("❌ Response data:", err.response?.data);
            console.error("❌ Error message:", err.message);
            const detailedMessage = err.response?.data?.details || err.response?.data?.error || err.message || "Erro desconhecido";
            addToast(`Falha ao salvar: ${detailedMessage}`, "error");
        }
    });

    const mutacaoAtualizarPeso = useMutation({
        mutationFn: atualizarPesoApi,
        onMutate: async ({ id, peso_atual }) => {
            await queryClient.cancelQueries(['filamentos']);
            const filamentosAnteriores = queryClient.getQueryData(['filamentos']);

            queryClient.setQueryData(['filamentos'], (antigo) =>
                antigo?.map(f => f.id === id ? { ...f, peso_atual } : f)
            );

            return { filamentosAnteriores };
        },
        onSuccess: () => {
            addToast("Peso atualizado!", "success");
        },
        onError: (_err, _vars, contexto) => {
            queryClient.setQueryData(['filamentos'], contexto.filamentosAnteriores);
            addToast("Erro ao sincronizar peso.", "error");
        },
        onSettled: () => {
            queryClient.invalidateQueries(['filamentos']);
        }
    });

    const mutacaoRegistrarHistorico = useMutation({
        mutationFn: registrarHistoricoFilamentoApi,
        onSuccess: () => {
            queryClient.invalidateQueries(['historico-filamento']);
        }
    });

    const mutacaoExcluir = useMutation({
        mutationFn: excluirFilamentoApi,
        onSuccess: (idRemovido) => {
            queryClient.setQueryData(['filamentos'], (antigo) => antigo?.filter(f => f.id !== idRemovido));
            addToast("Filamento removido.", "info");
        },
        onError: () => addToast("Erro: O servidor impediu a exclusão.", "error")
    });

    return {
        salvarFilamento: mutacaoSalvar.mutateAsync,
        atualizarPeso: mutacaoAtualizarPeso.mutateAsync,
        excluirFilamento: mutacaoExcluir.mutateAsync,
        registrarHistorico: mutacaoRegistrarHistorico.mutateAsync,
        salvando: mutacaoSalvar.isPending || mutacaoAtualizarPeso.isPending || mutacaoExcluir.isPending || mutacaoRegistrarHistorico.isPending
    };
};
