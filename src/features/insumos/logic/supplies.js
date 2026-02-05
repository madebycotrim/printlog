import { create } from 'zustand';
import api from '../../../utils/api';
import { useToastStore } from '../../../stores/toastStore';
import { useQuery } from '@tanstack/react-query';

export const useSupplyHistory = (id) => {
    return useQuery({
        queryKey: ['supply-history', id],
        queryFn: async () => {
            // Note: The correct endpoint should be /insumos/:id/history if that is how backend is routed.
            // _supplies.js is mapped to /insumos?
            // Filament logic used /filaments/:id/history.
            // Assuming /insumos/:id/history works via [[path]].js
            const res = await api.get(`/insumos/${id}/history`);
            const rawHistory = res.data?.history || [];

            // Normalize backend (snake_case PT-BR) to frontend (camelCase EN)
            return {
                history: rawHistory.map(log => ({
                    id: log.id,
                    created_at: log.criado_em,
                    notes: log.observacoes,
                    quantity_change: Number(log.mudanca_quantidade),
                    type: (log.tipo === 'manual' && Number(log.mudanca_quantidade) < 0) ? 'consumo' : log.tipo,
                    user_id: log.usuario_id
                }))
            };
        },
        enabled: !!id
    });
};

/**
 * STORE: GERENCIAMENTO DE INSUMOS
 * Centraliza o estado e operações de insumos, conectando com o backend.
 */
export const useSupplyStore = create((set, get) => ({
    supplies: [],
    loading: false,
    lastFetch: 0,

    // Busca insumos do backend
    fetchSupplies: async (force = false) => {
        const now = Date.now();
        const { lastFetch, supplies, loading } = get();

        // Throttling: Se já buscou há menos de 5 segundos e tem dados, não busca de novo.
        // Exceto se for forced ou se loading estiver travado (mas loading false aqui garante que não está)
        if (!force && supplies.length > 0 && (now - lastFetch < 5000) && !loading) {
            return;
        }

        set({ loading: true });
        try {
            const res = await api.get('/insumos');
            const rawData = Array.isArray(res.data) ? res.data : [];

            // Normalizar dados para garantir que campos camelCase existam
            const normalized = rawData.map(item => ({
                ...item,
                currentStock: item.estoque_atual ?? item.current_stock ?? item.currentStock ?? 0,
                minStock: item.estoque_minimo ?? item.min_stock ?? item.minStock ?? 0,
                purchaseLink: item.link_compra ?? item.purchase_link ?? item.purchaseLink ?? '',
                category: item.categoria ?? item.category ?? 'geral',
                brand: item.marca ?? item.brand ?? '',
                usageUnit: item.unidade_uso ?? item.usage_unit ?? item.usageUnit ?? '',
                stockYield: item.rendimento_estoque ?? item.stock_yield ?? item.stockYield ?? 1,
                unit: item.unidade ?? item.unit ?? 'un',
                price: item.preco ?? item.price ?? 0,
                name: item.nome ?? item.name ?? ''
            }));

            set({ supplies: normalized });
        } catch (error) {
            console.error("Erro ao buscar insumos:", error);
            // Don't show toast on 429 loops to avoid spam, or handle gracefully
            if (error.response?.status !== 429) {
                useToastStore.getState().addToast("Erro ao carregar insumos.", "error");
            }
        } finally {
            set({ loading: false, lastFetch: Date.now() });
        }
    },

    // Salva ou Atualiza um insumo
    saveSupply: async (supply) => {
        try {
            // O payload vem em camelCase (frontend), precisamos converter para snake_case (backend PT-BR)
            const payload = {
                id: supply.id,
                nome: supply.name,
                preco: supply.price,
                unidade: supply.unit,
                estoque_minimo: supply.minStock,
                estoque_atual: supply.currentStock,
                categoria: supply.category,
                marca: supply.brand,
                link_compra: supply.purchaseLink,
                descricao: supply.description,
                unidade_uso: supply.usageUnit,
                rendimento_estoque: supply.stockYield
            };

            const res = await api.post('/insumos', payload);

            if (res.data?.success) {
                await get().fetchSupplies(true); // Reload simples
                useToastStore.getState().addToast("Insumo salvo com sucesso!", "success");
                return true;
            }
            return false;
        } catch (error) {
            console.error("Erro ao salvar insumo:", error);
            useToastStore.getState().addToast("Erro ao salvar insumo.", "error");
            throw error;
        }
    },

    // Remove um insumo
    deleteSupply: async (id) => {
        if (!id) return;
        try {
            await api.delete(`/insumos?id=${id}`);
            await get().fetchSupplies(true); // Reload
            useToastStore.getState().addToast("Insumo removido.", "success");
        } catch (error) {
            console.error("Erro ao remover insumo:", error);
            useToastStore.getState().addToast("Erro ao remover insumo.", "error");
            throw error;
        }
    },

    // Atualização Rápida de Estoque (Para Calculator Sync)
    quickUpdateStock: async (id, newStock) => {
        try {
            const currentItem = get().supplies.find(s => String(s.id) === String(id));
            if (!currentItem) return;

            // Converter para PT-BR
            const payload = {
                id: currentItem.id,
                nome: currentItem.name,
                preco: currentItem.price,
                unidade: currentItem.unit,
                estoque_minimo: currentItem.minStock,
                estoque_atual: Number(newStock),
                categoria: currentItem.category,
                marca: currentItem.brand,
                link_compra: currentItem.purchaseLink,
                descricao: currentItem.description,
                unidade_uso: currentItem.usageUnit,
                rendimento_estoque: currentItem.stockYield
            };

            // Reusa o saveSupply mas sem toast explicito (ou opcional)
            // Aqui fazemos direto update local otimista + api
            const res = await api.post('/insumos', payload);
            if (res.data?.success) {
                // Update Local Otimista
                set(state => ({
                    supplies: state.supplies.map(s => String(s.id) === String(id) ? { ...s, currentStock: newStock } : s)
                }));
                return true;
            }
        } catch (error) {
            console.error("Quick stock update failed:", error);
        }
        return false;
    }
}));
