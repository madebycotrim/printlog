import { create } from 'zustand';
import api from '../../../utils/api'; 
import axios from 'axios'; 

/**
 * Converte valores para número de forma segura, tratando padrões brasileiros.
 */
const limparNumero = (valor) => {
    if (valor === undefined || valor === null || valor === '') return 0;
    if (typeof valor === 'number') return valor;
    
    let texto = String(valor).trim();
    // Tratamento de padrão brasileiro: 1.200,50 -> 1200.50
    if (texto.includes(',')) {
        texto = texto.replace(/\./g, '').replace(',', '.');
    }
    const numero = parseFloat(texto);
    return isNaN(numero) ? 0 : numero;
};

/**
 * Mapeia do Frontend (Inglês/CamelCase) para o Backend (Português/Snake_Case)
 * Garante que os dados estejam no formato esperado pelo banco de dados D1 (SQLite).
 */
export const prepararParaD1 = (dados = {}) => {
    // Garante que o histórico seja uma string JSON válida para o SQLite
    let historicoFormatado = "[]";
    try {
        const h = dados.history || dados.historico || [];
        historicoFormatado = typeof h === 'string' ? h : JSON.stringify(h);
    } catch (erro) {
        console.error("Erro ao serializar histórico:", erro);
    }

    return {
        id: dados.id || crypto.randomUUID(),
        nome: (dados.name || dados.nome || "Nova Unidade").trim(),
        marca: (dados.brand || dados.marca || "Genérica").trim(),
        modelo: (dados.model || dados.modelo || "FDM").trim(),
        status: dados.status || "idle",
        potencia: limparNumero(dados.power || dados.potencia),
        preco: limparNumero(dados.price || dados.preco),
        rendimento_total: limparNumero(dados.yieldTotal || dados.rendimento_total),
        horas_totais: limparNumero(dados.totalHours || dados.horas_totais),
        ultima_manutencao_hora: limparNumero(dados.lastMaintenanceHour || dados.ultima_manutencao_hora),
        intervalo_manutencao: limparNumero(dados.maintenanceInterval || dados.intervalo_manutencao || 300),
        historico: historicoFormatado
    };
};

export const usePrinterStore = create((set, get) => ({
    printers: [],         
    printerModels: [],    
    loading: false,

    // Busca o catálogo estático de modelos
    fetchPrinterModels: async () => {
        if (get().printerModels.length > 0) return;
        try {
            const resposta = await axios.get('/printers.json');
            set({ printerModels: Array.isArray(resposta.data) ? resposta.data : [] });
        } catch (erro) {
            console.error("Falha ao carregar catálogo de modelos:", erro);
        }
    },

    // Busca as impressoras cadastradas no banco
    fetchPrinters: async () => {
        set({ loading: true });
        try {
            const resposta = await api.get('/impressoras');
            const dadosBrutos = resposta.data || [];

            const impressorasMapeadas = dadosBrutos.map(item => {
                let historicoTratado = [];
                try {
                    historicoTratado = typeof item.historico === 'string' 
                        ? JSON.parse(item.historico) 
                        : (item.historico || []);
                } catch (erro) {
                    console.warn(`Erro no parse do histórico da impressora ${item.id}`);
                }

                return {
                    id: item.id,
                    name: item.nome,
                    brand: item.marca,
                    model: item.modelo,
                    status: item.status,
                    power: item.potencia,
                    price: item.preco,
                    yieldTotal: item.rendimento_total,
                    totalHours: item.horas_totais,
                    lastMaintenanceHour: item.ultima_manutencao_hora,
                    maintenanceInterval: item.intervalo_manutencao,
                    history: historicoTratado
                };
            });

            set({ printers: impressorasMapeadas, loading: false });
        } catch (erro) {
            console.error("Erro ao buscar impressoras:", erro);
            set({ loading: false, printers: [] });
        }
    },

    // Salva ou atualiza uma impressora
    upsertPrinter: async (dados) => {
        try {
            const payload = prepararParaD1(dados);
            await api.post('/impressoras', payload);
            
            // Recarrega a lista para garantir sincronia com o banco
            await get().fetchPrinters();
            return true;
        } catch (erro) {
            console.error("Erro ao salvar impressora:", erro);
            throw erro;
        }
    },

    // Remove do banco e atualiza estado local
    removePrinter: async (id) => {
        try {
            await api.delete(`/impressoras?id=${id}`);
            set(estado => ({
                printers: estado.printers.filter(p => p.id !== id)
            }));
        } catch (erro) {
            console.error("Erro ao remover impressora:", erro);
            throw erro;
        }
    },

    // Atualiza apenas o status (ex: idle -> printing)
    updatePrinterStatus: async (id, novoStatus) => {
        const listaAtual = get().printers;
        const impressora = listaAtual.find(p => p.id === id);
        
        if (impressora) {
            try {
                // Prepara o payload mantendo os dados e alterando apenas o status
                const payload = prepararParaD1({ ...impressora, status: novoStatus });
                await api.post('/impressoras', payload);
                
                // Atualização otimista no estado local
                set({
                    printers: listaAtual.map(p => 
                        p.id === id ? { ...p, status: novoStatus } : p
                    )
                });
            } catch (erro) {
                console.error("Erro ao atualizar status:", erro);
            }
        }
    }
}));