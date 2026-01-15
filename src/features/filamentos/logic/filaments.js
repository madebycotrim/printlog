import { create } from 'zustand';
import api from '../../../utils/api';
import { useToastStore } from '../../../stores/toastStore';

// ==================== UTILITÁRIOS DE NORMALIZAÇÃO ====================

const normalizeFilament = (f) => {
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

// ==================== STORE (ZUSTAND) ====================

export const useFilamentStore = create((set, get) => ({
  filaments: [],
  loading: false,
  isSaving: false,
  error: null,

  // --- ACTIONS: BUSCA ---
  fetchFilaments: async (silent = false) => {
    if (!silent) set({ loading: true, error: null });

    try {
      const { data } = await api.get('/filaments');
      const rawList = Array.isArray(data) ? data : (data?.data || []);
      const normalized = rawList.map(normalizeFilament);

      set({ filaments: normalized, loading: false });
    } catch (error) {
      const msg = "Falha na sincronização com o banco de dados.";
      set({ loading: false, error: msg });
      useToastStore.getState().addToast(msg, "error");
      throw error;
    }
  },

  // --- ACTIONS: SALVAMENTO (CREATE/UPDATE) ---
  saveFilament: async (filamentData) => {
    if (get().isSaving) return;
    set({ isSaving: true, error: null });

    const isUpdate = !!filamentData.id;
    const originalFilaments = [...get().filaments];

    // Preparação Otimista
    const treated = normalizeFilament(filamentData);
    const tempId = isUpdate ? treated.id : `temp-${Date.now()}`;
    const optimisticItem = { ...treated, id: tempId };

    // Aplicação Otimista na UI
    set(state => ({
      filaments: isUpdate
        ? state.filaments.map(f => f.id === treated.id ? optimisticItem : f)
        : [optimisticItem, ...state.filaments]
    }));

    try {
      let response;
      if (isUpdate) {
        // Rota RESTful padrão: PUT /filaments/{id}
        response = await api.put(`/filaments/${treated.id}`, treated);
      } else {
        // Rota RESTful padrão: POST /filaments
        response = await api.post('/filaments', treated);
      }

      const savedItem = normalizeFilament(response.data?.data || response.data);

      // Consolidação: Substitui o temporário pelo real
      set(state => ({
        filaments: state.filaments.map(f => f.id === tempId ? savedItem : f),
        isSaving: false
      }));

      useToastStore.getState().addToast("Filamento salvo com sucesso!", "success");
      return savedItem;
    } catch (error) {
      // Reversão em caso de erro
      set({ filaments: originalFilaments, isSaving: false, error: "Falha ao persistir dados." });
      useToastStore.getState().addToast("Falha ao salvar filamento.", "error");
      throw error;
    }
  },

  // --- ACTIONS: BAIXA RÁPIDA (OPTIMISTIC WEIGHT) ---
  quickUpdateWeight: async (id, novoPeso) => {
    const originalFilaments = [...get().filaments];
    const item = originalFilaments.find(f => f.id === id);
    if (!item) return;

    const pesoFinal = Math.max(0, Math.min(item.peso_total, Number(novoPeso)));

    // Update Otimista
    set(state => ({
      filaments: state.filaments.map(f => f.id === id ? { ...f, peso_atual: pesoFinal } : f)
    }));

    try {
      // Usamos PATCH para atualizações parciais
      await api.patch(`/filaments/${id}`, { peso_atual: pesoFinal });
      useToastStore.getState().addToast("Peso atualizado!", "success");
    } catch (_error) {
      set({ filaments: originalFilaments, error: "Erro ao sincronizar peso." });
      useToastStore.getState().addToast("Erro ao sincronizar peso no servidor.", "error");
    }
  },

  // --- ACTIONS: DELETE ---
  deleteFilament: async (id) => {
    if (!id || String(id).startsWith('temp-')) return;

    const originalFilaments = [...get().filaments];
    set(state => ({ filaments: state.filaments.filter(f => f.id !== id) }));

    try {
      await api.delete(`/filaments/${id}`);
      useToastStore.getState().addToast("Filamento removido.", "info");
    } catch (_error) {
      set({ filaments: originalFilaments, error: "O servidor impediu a exclusão." });
      useToastStore.getState().addToast("Erro: O servidor impediu a exclusão.", "error");
    }
  },

  // --- SELECTORS: CÁLCULOS TÉCNICOS ---
  // Estes métodos ajudam os componentes a exibir dados sem recalcular tudo
  getStats: () => {
    const { filaments } = get();
    return {
      totalWeight: filaments.reduce((acc, f) => acc + (f.peso_atual / 1000), 0), // Em KG
      totalValue: filaments.reduce((acc, f) => {
        const custoGrama = f.preco / f.peso_total;
        return acc + (custoGrama * f.peso_atual);
      }, 0),
      lowStockCount: filaments.filter(f => (f.peso_atual / f.peso_total) <= 0.2).length,
      count: filaments.length
    };
  },

  // Filtro de busca inteligente
  getFilteredFilaments: (search) => {
    const term = search.toLowerCase().trim();
    if (!term) return get().filaments;

    return get().filaments.filter(f =>
      f.nome.toLowerCase().includes(term) ||
      f.marca.toLowerCase().includes(term) ||
      f.material.toLowerCase().includes(term)
    );
  }
}));