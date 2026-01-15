import { create } from 'zustand';
import api from '../../../utils/api';
import { useToastStore } from '../../../stores/toastStore';

/**
 * STORE: GERENCIAMENTO DE INSUMOS
 * Centraliza o estado e operações de insumos, conectando com o backend.
 */
export const useSupplyStore = create((set, get) => ({
    supplies: [],
    loading: false,

    // Busca insumos do backend
    fetchSupplies: async () => {
        set({ loading: true });
        try {
            const res = await api.get('/insumos');
            set({ supplies: Array.isArray(res.data) ? res.data : [] });
        } catch (error) {
            console.error("Erro ao buscar insumos:", error);
            useToastStore.getState().addToast("Erro ao carregar insumos.", "error");
        } finally {
            set({ loading: false });
        }
    },

    // Salva ou Atualiza um insumo
    saveSupply: async (supply) => {
        try {
            // Normaliza os dados
            const payload = {
                ...supply,
                price: Number(String(supply.price).replace(',', '.')),
                minStock: Number(supply.minStock || 0),
                currentStock: Number(supply.currentStock || 0)
            };

            const res = await api.post('/insumos', payload);

            if (res.data?.success) {
                await get().fetchSupplies(); // Reload simples
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
            await get().fetchSupplies(); // Reload
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

            const payload = {
                ...currentItem,
                currentStock: Number(newStock)
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
