import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../utils/api';
import { useToastStore } from '../../../stores/toastStore';
import { useMemo } from 'react';

// ==================== UTILS ====================

export const normalizeFilament = (f) => {
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

// ==================== API FUNCTIONS ====================

const fetchFilamentsApi = async () => {
    const { data } = await api.get('/filaments');
    const rawList = Array.isArray(data) ? data : (data?.data || []);
    return rawList.map(normalizeFilament);
};

const saveFilamentApi = async (filamentData) => {
    const treated = normalizeFilament(filamentData);



    // Ensure ID is undefined if falsy/empty string to prevent 500 errors on creation
    if (!treated.id) delete treated.id;

    let response;

    if (treated.id) {
        response = await api.put(`/filaments/${treated.id}`, treated);
    } else {
        response = await api.post('/filaments', treated);
    }

    return normalizeFilament(response.data?.data || response.data);
};

const updateWeightApi = async ({ id, peso_atual }) => {
    await api.patch(`/filaments/${id}`, { peso_atual });
    return { id, peso_atual };
};

const deleteFilamentApi = async (id) => {
    await api.delete(`/filaments/${id}`);
    return id;
};

const fetchFilamentHistoryApi = async (id) => {
    const { data } = await api.get(`/filaments/${id}/history`);
    return data;
};

export const registerFilamentHistoryApi = async ({ id, type, qtd, obs }) => {
    const { data } = await api.post(`/filaments/${id}/history`, { type, qtd, obs });
    return data;
};

// ==================== HOOKS ====================

export const useFilamentHistory = (id) => {
    return useQuery({
        queryKey: ['filament-history', id],
        queryFn: () => fetchFilamentHistoryApi(id),
        enabled: !!id,
    });
};

export const useFilaments = () => {
    const query = useQuery({
        queryKey: ['filaments'],
        queryFn: fetchFilamentsApi,
    });

    // Stats calculation derived from query data
    const stats = useMemo(() => {
        const filaments = query.data || [];
        return {
            totalWeight: filaments.reduce((acc, f) => acc + (f.peso_atual / 1000), 0), // Em KG
            totalValue: filaments.reduce((acc, f) => {
                const custoGrama = f.preco / f.peso_total;
                return acc + (custoGrama * f.peso_atual);
            }, 0),
            lowStockCount: filaments.filter(f => (f.peso_atual / f.peso_total) <= 0.2).length,
            count: filaments.length
        };
    }, [query.data]);

    return { ...query, stats };
};

export const useFilamentMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToastStore();

    const saveMutation = useMutation({
        mutationFn: saveFilamentApi,
        onSuccess: (savedItem) => {
            queryClient.setQueryData(['filaments'], (old) => {
                if (!old) return [savedItem];
                const exists = old.find(f => f.id === savedItem.id);
                if (exists) {
                    return old.map(f => f.id === savedItem.id ? savedItem : f);
                } else {
                    return [savedItem, ...old];
                }
            });
            addToast("Filamento salvo com sucesso!", "success");
        },
        onError: (err) => {
            console.error("Erro detalhado ao salvar filamento:", err);
            addToast("Falha ao salvar filamento.", "error");
        }
    });

    const updateWeightMutation = useMutation({
        mutationFn: updateWeightApi,
        onMutate: async ({ id, peso_atual }) => {
            await queryClient.cancelQueries(['filaments']);
            const previousFilaments = queryClient.getQueryData(['filaments']);

            queryClient.setQueryData(['filaments'], (old) =>
                old?.map(f => f.id === id ? { ...f, peso_atual } : f)
            );

            return { previousFilaments };
        },
        onSuccess: () => {
            addToast("Peso atualizado!", "success");
        },
        onError: (_err, _vars, context) => {
            queryClient.setQueryData(['filaments'], context.previousFilaments);
            addToast("Erro ao sincronizar peso.", "error");
        },
        onSettled: () => {
            queryClient.invalidateQueries(['filaments']);
        }
    });

    const registerHistoryMutation = useMutation({
        mutationFn: registerFilamentHistoryApi,
        onSuccess: () => {
            queryClient.invalidateQueries(['filament-history']);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteFilamentApi,
        onSuccess: (idRemovido) => {
            queryClient.setQueryData(['filaments'], (old) => old?.filter(f => f.id !== idRemovido));
            addToast("Filamento removido.", "info");
        },
        onError: () => addToast("Erro: O servidor impediu a exclusão.", "error")
    });

    return {
        saveFilament: saveMutation.mutateAsync,
        updateWeight: updateWeightMutation.mutateAsync,
        deleteFilament: deleteMutation.mutateAsync,
        registerHistory: registerHistoryMutation.mutateAsync,
        isSaving: saveMutation.isPending || updateWeightMutation.isPending || deleteMutation.isPending || registerHistoryMutation.isPending
    };
};
