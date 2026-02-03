import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../utils/api';
import { useToastStore } from '../../../stores/toastStore';

// === UTILS ===
const limparNumero = (valor) => {
    if (valor === undefined || valor === null || valor === '') return 0;
    if (typeof valor === 'number') return valor;

    let texto = String(valor).trim();
    if (texto.includes(',')) {
        texto = texto.replace(/\./g, '').replace(',', '.');
    }
    const numero = parseFloat(texto);
    return isNaN(numero) ? 0 : numero;
};

export const prepararParaD1 = (dados = {}) => {
    let historicoFormatado = "[]";
    try {
        const h = dados.history || dados.historico || [];
        historicoFormatado = typeof h === 'string' ? h : JSON.stringify(h);
    } catch (erro) {
        console.error("Erro ao serializar histórico:", erro);
    }

    return {
        id: dados.id || crypto.randomUUID(),
        nome: (dados.nome || "Nova Unidade").trim(),
        marca: (dados.marca || "Genérica").trim(),
        modelo: (dados.modelo || "FDM").trim(),
        status: dados.status || "idle",
        potencia: limparNumero(dados.potencia),
        preco: limparNumero(dados.preco),
        rendimento_total: limparNumero(dados.rendimento_total),
        horas_totais: limparNumero(dados.horas_totais),
        ultima_manutencao_hora: limparNumero(dados.ultima_manutencao_hora),
        intervalo_manutencao: limparNumero(dados.intervalo_manutencao || 300),
        historico: historicoFormatado,
        versao: dados.versao // Optimistic Locking
    };
};

// === API FUNCTIONS ===
const fetchPrinterModelsApi = async () => {
    const { data } = await api.get('/printers.json', { baseURL: '/' });
    return Array.isArray(data) ? data : [];
};

const fetchPrintersApi = async () => {
    const { data } = await api.get('/impressoras');
    const dadosBrutos = Array.isArray(data) ? data : [];

    return dadosBrutos.map(item => {
        let historicoTratado = [];
        try {
            historicoTratado = typeof item.historico === 'string'
                ? JSON.parse(item.historico)
                : (item.historico || []);
        } catch (_erro) {
            console.warn(`Erro no parse do histórico da impressora ${item.id}`);
        }

        return {
            id: item.id,
            nome: item.nome,
            marca: item.marca,
            modelo: item.modelo,
            status: item.status,
            potencia: item.potencia,
            preco: item.preco,
            rendimento_total: item.rendimento_total,
            horas_totais: item.horas_totais,
            ultima_manutencao_hora: item.ultima_manutencao_hora,
            intervalo_manutencao: item.intervalo_manutencao,
            historico: historicoTratado,
            versao: item.versao // Optimistic Locking
        };
    });
};

const upsertPrinterApi = async (dados) => {
    const payload = prepararParaD1(dados);
    const { data } = await api.post('/impressoras', payload);
    return data;
};

const removePrinterApi = async (id) => {
    await api.delete(`/impressoras?id=${id}`);
    return id;
};

// === HOOKS ===
export const usePrinterModels = () => {
    return useQuery({
        queryKey: ['printerModels'],
        queryFn: fetchPrinterModelsApi,
        staleTime: 1000 * 60 * 60 * 24, // 24h cache (estático)
    });
};

export const usePrinters = () => {
    return useQuery({
        queryKey: ['printers'],
        queryFn: fetchPrintersApi,
    });
};

export const usePrinterMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToastStore();

    const upsertMutation = useMutation({
        mutationFn: upsertPrinterApi,
        onSuccess: () => {
            queryClient.invalidateQueries(['printers']);
            addToast("Impressora salva com sucesso!", "success");
        },
        onError: () => addToast("Erro ao salvar impressora.", "error")
    });

    const removeMutation = useMutation({
        mutationFn: removePrinterApi,
        onSuccess: (idRemovido) => {
            queryClient.setQueryData(['printers'], (old) => old?.filter(p => p.id !== idRemovido));
            addToast("Impressora removida.", "success");
        },
        onError: () => addToast("Erro ao remover impressora.", "error")
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }) => {
            // Requer o objeto completo para o endpoint, então precisamos pegá-lo do cache
            const printers = queryClient.getQueryData(['printers']);
            const printer = printers?.find(p => p.id === id);
            if (!printer) throw new Error("Impressora não encontrada no cache");

            const payload = prepararParaD1({ ...printer, status });
            await api.post('/impressoras', payload);
            return { id, status };
        },
        onMutate: async ({ id, status }) => {
            await queryClient.cancelQueries(['printers']);
            const previousPrinters = queryClient.getQueryData(['printers']);

            // Otimistic update
            queryClient.setQueryData(['printers'], (old) =>
                old?.map(p => p.id === id ? { ...p, status } : p)
            );

            return { previousPrinters };
        },
        onError: (err, newTodo, context) => {
            queryClient.setQueryData(['printers'], context.previousPrinters);
            addToast("Erro ao atualizar status.", "error");
        },
        onSettled: () => {
            queryClient.invalidateQueries(['printers']);
        }
    });

    return {
        upsertPrinter: upsertMutation.mutateAsync,
        removePrinter: removeMutation.mutateAsync,
        updateStatus: updateStatusMutation.mutateAsync,
        isSaving: upsertMutation.isPending || removeMutation.isPending || updateStatusMutation.isPending
    };
};
