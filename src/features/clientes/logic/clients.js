import { create } from 'zustand';
import api from '../../../utils/api';
import { useToastStore } from '../../../stores/toastStore';

/**
 * useClientStore - Gestão de Clientes (CRM)
 */
export const useClientStore = create((set, get) => ({
    clients: [],
    isLoading: false,
    isSaving: false,

    // --- BUSCAR CLIENTES ---
    fetchClients: async () => {
        set({ isLoading: true });
        try {
            const { data } = await api.get('/clients');
            const clientesFormatados = Array.isArray(data) ? data : (data?.data || []);
            set({ clients: clientesFormatados, isLoading: false });
        } catch (erro) {
            console.error("Erro ao buscar clientes:", erro);
            useToastStore.getState().addToast("Erro ao carregar clientes.", "error");
            set({ isLoading: false, clients: [] });
        }
    },

    // --- SALVAR/ATUALIZAR CLIENTE ---
    saveClient: async (cliente) => {
        set({ isSaving: true });
        try {
            const isUpdate = !!cliente.id;
            let response;

            // Payload sanitizado
            const payload = {
                nome: cliente.nome,
                empresa: cliente.empresa || "",
                email: cliente.email || "",
                telefone: cliente.telefone || "",
                documento: cliente.documento || "", // CPF/CNPJ
                endereco: cliente.endereco || "",
                observacoes: cliente.observacoes || ""
            };

            if (isUpdate) {
                response = await api.put(`/clients/${cliente.id}`, payload);
            } else {
                response = await api.post('/clients', payload);
            }

            // Atualiza lista local
            await get().fetchClients();

            set({ isSaving: false });
            useToastStore.getState().addToast(`Cliente ${isUpdate ? 'atualizado' : 'cadastrado'} com sucesso!`, "success");
            return true;
        } catch (erro) {
            console.error("Erro ao salvar cliente:", erro);
            useToastStore.getState().addToast("Erro ao salvar cliente.", "error");
            set({ isSaving: false });
            return false;
        }
    },

    // --- REMOVER CLIENTE ---
    deleteClient: async (id) => {
        if (!id) return;

        // Optimistic Update
        const originalList = get().clients;
        set({ clients: originalList.filter(c => c.id !== id) });

        try {
            await api.delete(`/clients/${id}`);
            useToastStore.getState().addToast("Cliente removido.", "info");
        } catch (erro) {
            console.error("Erro ao remover cliente:", erro);
            // Reverte em caso de erro
            set({ clients: originalList });
            useToastStore.getState().addToast("Erro ao remover cliente.", "error");
        }
    },

    // --- HELPER: OBTER CLIENTE POR ID ---
    getClientById: (id) => {
        return get().clients.find(c => String(c.id) === String(id));
    }
}));
