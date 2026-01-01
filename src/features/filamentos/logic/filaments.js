import { create } from 'zustand';
import api from '../../../utils/api'; // Sua instância configurada do Axios

// --- HELPERS DE MAPEAMENTO E TRATAMENTO DE DADOS ---

/**
 * Garante que os dados vindo do Banco ou do Formulário 
 * estejam nos tipos corretos (Número, String, etc) e com as chaves em PT.
 */
const prepararDados = (f) => {
    // Tratamento de pesos para garantir que sejam números
    const pTotal = Number(f.peso_total) || 0;
    
    // Regra funcional: Se for um cadastro novo (sem peso_atual ou zero), o rolo começa cheio (peso_total)
    // Se for 0, mas o total for > 0 em um cadastro novo, assume-se total.
    const pAtual = (f.peso_atual !== undefined && f.peso_atual !== null) 
        ? Number(f.peso_atual) 
        : pTotal;

    return {
        id: f.id || null, // Deixamos null se for novo para o backend gerar ou lidar
        user_id: f.user_id,
        nome: (f.nome || "Novo Filamento").trim(),
        marca: (f.marca || "Genérico").trim(),
        material: f.material || "PLA",
        cor_hex: f.cor_hex || "#000000",
        peso_total: pTotal,
        peso_atual: pAtual > pTotal ? pTotal : pAtual, // Validação: atual nunca maior que total
        preco: Number(f.preco) || 0,
        data_abertura: f.data_abertura || new Date().toISOString(),
        favorito: f.favorito ? 1 : 0
    };
};

// --- STORE ZUSTAND ---

export const useFilamentStore = create((set, get) => ({
    filaments: [] ,
    loading: false,
    isSaving: false,

    /**
     * Busca todos os filamentos do banco de dados (Cloudflare D1)
     * @param {boolean} silent - Se true, não ativa o estado de loading global (evita flicker na UI)
     */
    fetchFilaments: async (silent = false) => {
        if (!silent) set({ loading: true });
        try {
            const { data } = await api.get('/filaments');
            
            // Tratamos os dados para garantir que a UI receba sempre o formato correto
            const formatados = (Array.isArray(data) ? data : []).map(prepararDados);
            
            set({ 
                filaments: formatados, 
                loading: false 
            });
        } catch (error) {
            console.error("Erro ao carregar filamentos do D1:", error);
            set({ loading: false, filaments: [] });
        }
    },

    /**
     * Salva ou Atualiza um filamento
     * Realiza atualização otimista para feedback instantâneo na UI
     */
    saveFilament: async (filament) => {
        set({ isSaving: true });

        const dadosTratados = prepararDados(filament);
        // Se não tem ID, geramos um temporário para a atualização otimista
        const idTemp = dadosTratados.id || `temp-${Date.now()}`;
        const payloadParaOtimismo = { ...dadosTratados, id: idTemp };
        
        const backup = get().filaments;

        // --- ATUALIZAÇÃO OTIMISTA ---
        const existe = backup.some(f => f.id === filament.id);
        if (existe) {
            set(state => ({
                filaments: state.filaments.map(f => f.id === filament.id ? payloadParaOtimismo : f)
            }));
        } else {
            set(state => ({
                filaments: [payloadParaOtimismo, ...state.filaments]
            }));
        }

        try {
            // Envia para o Backend
            // Nota: Removemos o id se for temporário para o backend não tentar usar string em campo integer
            const payloadParaEnvio = { ...dadosTratados };
            if (typeof payloadParaEnvio.id === 'string' && payloadParaEnvio.id.startsWith('temp-')) {
                delete payloadParaEnvio.id;
            }

            await api.post('/filaments', payloadParaEnvio);
            
            // Sincroniza silenciosamente para obter o ID real e datas do banco
            await get().fetchFilaments(true);
        } catch (error) {
            console.error("Erro ao persistir filamento:", error);
            set({ filaments: backup }); // Reverte para o estado anterior em caso de erro
            throw error;
        } finally {
            set({ isSaving: false });
        }
    },

    /**
     * Função para o ModalBaixaRapida
     * Foca apenas na atualização da massa (peso_atual)
     */
    quickUpdateWeight: async (id, novoPeso) => {
        const pesoNumerico = Number(novoPeso);
        const backup = get().filaments;
        
        // 1. Localiza o item
        const itemOriginal = backup.find(f => f.id === id);
        if (!itemOriginal) return;

        // Validação de segurança: peso não pode ser negativo
        const pesoValidado = pesoNumerico < 0 ? 0 : pesoNumerico;

        // 2. Atualização Otimista local
        set(state => ({
            filaments: state.filaments.map(f => 
                f.id === id ? { ...f, peso_atual: pesoValidado } : f
            )
        }));

        try {
            // 3. Envia o objeto completo atualizado
            const payload = prepararDados({ ...itemOriginal, peso_atual: pesoValidado });
            await api.post('/filaments', payload);
        } catch (error) {
            console.error("Erro na baixa rápida:", error);
            set({ filaments: backup }); // Reverte em caso de erro de conexão
        }
    },

    /**
     * Deleta um filamento permanentemente
     */
    deleteFilament: async (id) => {
        // Se for um ID temporário que ainda não subiu, remove apenas local
        if (typeof id === 'string' && id.startsWith('temp-')) {
            set(state => ({ filaments: state.filaments.filter(f => f.id !== id) }));
            return;
        }

        const backup = get().filaments;

        set(state => ({
            filaments: state.filaments.filter(f => f.id !== id)
        }));

        try {
            await api.delete(`/filaments?id=${id}`);
        } catch (error) {
            console.error("Erro ao deletar filamento:", error);
            set({ filaments: backup }); 
        }
    }
}));