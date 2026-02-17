import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../utils/api';
import { useToastStore } from '../../../stores/toastStore';
import { useMemo } from 'react';

// ==================== UTILITÁRIOS ====================

export const normalizarMaterial = (f) => {
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
        versao: f.versao || 1, // Optimistic Locking
        tipo: f.tipo || 'FDM',
        unidade: f.unidade || 'g',
        densidade: Number(f.densidade) || 1.25 // Default density for Resin
    };
};

// ==================== FUNÇÕES DE API ====================

const buscarMateriaisApi = async () => {
    const { data } = await api.get('/filaments');
    const listaRaw = Array.isArray(data) ? data : (data?.data || []);
    return listaRaw.map(normalizarMaterial);
};

const salvarMaterialApi = async (dadosMaterial) => {
    const tratado = normalizarMaterial(dadosMaterial);

    // Garantir que ID seja undefined se vazio para prevenir erros 500 na criação
    if (!tratado.id) delete tratado.id;

    let resposta;

    if (tratado.id) {
        resposta = await api.put(`/filaments/${tratado.id}`, tratado);
    } else {
        resposta = await api.post('/filaments', tratado);
    }

    return normalizarMaterial(resposta.data?.data || resposta.data);
};

const atualizarEstoqueApi = async ({ id, peso_atual }) => {
    await api.patch(`/filaments/${id}`, { peso_atual });
    return { id, peso_atual };
};

const excluirMaterialApi = async (id) => {
    await api.delete(`/filaments/${id}`);
    return id;
};

const buscarHistoricoMaterialApi = async (id) => {
    const { data } = await api.get(`/filaments/${id}/history`);
    return data;
};

export const registrarHistoricoMaterialApi = async ({ id, tipo, qtd, obs }) => {
    const { data } = await api.post(`/filaments/${id}/history`, { type: tipo, qtd, obs });
    return data;
};

// ==================== HOOKS ====================

export const useHistoricoMaterial = (id) => {
    return useQuery({
        queryKey: ['historico-material', id],
        queryFn: () => buscarHistoricoMaterialApi(id),
        enabled: !!id,
    });
};

export const useMateriais = () => {
    const consulta = useQuery({
        queryKey: ['materiais'],
        queryFn: buscarMateriaisApi,
    });

    // Cálculo de estatísticas derivado dos dados da consulta
    const estatisticas = useMemo(() => {
        const materiais = consulta.data || [];
        return {
            pesoTotal: materiais.reduce((acc, f) => acc + (f.peso_atual / 1000), 0), // Em KG
            valorTotal: materiais.reduce((acc, f) => {
                const custoGrama = f.preco / f.peso_total;
                return acc + (custoGrama * f.peso_atual);
            }, 0),
            contagemEstoqueBaixo: materiais.filter(f => (f.peso_atual / f.peso_total) <= 0.2).length,
            quantidade: materiais.length
        };
    }, [consulta.data]);

    return { ...consulta, estatisticas };
};

export const useMutacoesMaterial = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToastStore();

    const mutacaoSalvar = useMutation({
        mutationFn: salvarMaterialApi,
        onSuccess: (itemSalvo) => {
            queryClient.setQueryData(['materiais'], (antigo) => {
                if (!antigo) return [itemSalvo];
                const existe = antigo.find(f => f.id === itemSalvo.id);
                if (existe) {
                    return antigo.map(f => f.id === itemSalvo.id ? itemSalvo : f);
                } else {
                    return [itemSalvo, ...antigo];
                }
            });
            // Invalidar a query para forçar refetch e garantir UI atualizada
            queryClient.invalidateQueries(['materiais']);
            addToast("Material salvo com sucesso!", "success");
        },
        onError: (err) => {
            console.error("❌ Erro detalhado ao salvar material:", err);
            const detailedMessage = err.response?.data?.details || err.response?.data?.error || err.message || "Erro desconhecido";
            addToast(`Falha ao salvar: ${detailedMessage}`, "error");
        }
    });

    const mutacaoAtualizarEstoque = useMutation({
        mutationFn: atualizarEstoqueApi,
        onMutate: async ({ id, peso_atual }) => {
            await queryClient.cancelQueries(['materiais']);
            const materiaisAnteriores = queryClient.getQueryData(['materiais']);

            queryClient.setQueryData(['materiais'], (antigo) =>
                antigo?.map(f => f.id === id ? { ...f, peso_atual } : f)
            );

            return { materiaisAnteriores };
        },
        onSuccess: () => {
            addToast("Estoque atualizado!", "success");
        },
        onError: (_err, _vars, contexto) => {
            queryClient.setQueryData(['materiais'], contexto.materiaisAnteriores);
            addToast("Erro ao sincronizar estoque.", "error");
        },
        onSettled: () => {
            queryClient.invalidateQueries(['materiais']);
        }
    });

    const mutacaoRegistrarHistorico = useMutation({
        mutationFn: registrarHistoricoMaterialApi,
        onSuccess: () => {
            queryClient.invalidateQueries(['historico-material']);
        }
    });

    const mutacaoExcluir = useMutation({
        mutationFn: excluirMaterialApi,
        onSuccess: (idRemovido) => {
            queryClient.setQueryData(['materiais'], (antigo) => antigo?.filter(f => f.id !== idRemovido));
            addToast("Material removido com sucesso!", "success");
        },
        onError: () => addToast("Erro: O servidor impediu a exclusão.", "error")
    });

    return {
        salvarMaterial: mutacaoSalvar.mutateAsync,
        atualizarEstoque: mutacaoAtualizarEstoque.mutateAsync,
        excluirMaterial: mutacaoExcluir.mutateAsync,
        registrarHistorico: mutacaoRegistrarHistorico.mutateAsync,
        salvando: mutacaoSalvar.isPending || mutacaoAtualizarEstoque.isPending || mutacaoExcluir.isPending || mutacaoRegistrarHistorico.isPending
    };
};
