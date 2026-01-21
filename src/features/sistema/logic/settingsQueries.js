import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../utils/api';
import { analisarNumero } from '../../../utils/numbers';
import { useToastStore } from '../../../stores/toastStore';

// === API HELPERS ===
const fetchSettingsApi = async () => {
    const { data } = await api.get('/settings');
    const d = Array.isArray(data) ? data[0] : (data?.results ? data.results[0] : data);

    if (!d) return null;

    // Converte de snake_case (Banco) para camelCase (Aplicação)
    return {
        custoKwh: String(d.custo_kwh ?? ""),
        valorHoraHumana: String(d.valor_hora_humana ?? ""),
        custoHoraMaquina: String(d.custo_hora_maquina ?? ""),
        taxaSetup: String(d.taxa_setup ?? ""),
        consumoKw: String(d.consumo_impressora_kw ?? ""),
        margemLucro: String(d.margem_lucro ?? ""),
        imposto: String(d.imposto ?? ""),
        taxaFalha: String(d.taxa_falha ?? ""),
        desconto: String(d.desconto ?? ""),
        whatsappTemplate: d.whatsapp_template || "Segue o orçamento do projeto *{projeto}*:\n\n💰 Valor: *{valor}*\n⏱️ Tempo estimado: *{tempo}*\n\nPodemos fechar?",
        platforms: d.platforms ? (typeof d.platforms === 'string' ? JSON.parse(d.platforms) : d.platforms) : null
    };
};

const saveSettingsApi = async (novosDados) => {
    // Prepara o objeto para o formato que o Cloudflare Worker espera (snake_case)
    const paraEnviar = {
        custo_kwh: analisarNumero(novosDados.custoKwh),
        valor_hora_humana: analisarNumero(novosDados.valorHoraHumana),
        custo_hora_maquina: analisarNumero(novosDados.custoHoraMaquina),
        taxa_setup: analisarNumero(novosDados.taxaSetup),
        consumo_impressora_kw: analisarNumero(novosDados.consumoKw),
        margem_lucro: analisarNumero(novosDados.margemLucro),
        imposto: analisarNumero(novosDados.imposto),
        taxa_falha: analisarNumero(novosDados.taxaFalha),
        desconto: analisarNumero(novosDados.desconto),
        whatsapp_template: novosDados.whatsappTemplate || "",
        platforms: novosDados.platforms ? JSON.stringify(novosDados.platforms) : null
    };

    const { data } = await api.post('/settings', paraEnviar);
    return data;
};

// === HOOKS ===
export const useSettings = () => {
    return useQuery({
        queryKey: ['settings'],
        queryFn: fetchSettingsApi,
        staleTime: 1000 * 60 * 30, // 30 minutos de cache (config muda pouco)
    });
};

export const useUpdateSettings = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToastStore();

    return useMutation({
        mutationFn: saveSettingsApi,
        onSuccess: (_, variables) => {
            // Atualiza o cache com os novos dados sem precisar refetch
            queryClient.setQueryData(['settings'], (oldData) => ({
                ...oldData,
                ...variables
            }));
            addToast("Configurações salvas!", "success");
        },
        onError: (error) => {
            console.error("Erro ao salvar configurações:", error);
            addToast("Erro ao salvar configurações.", "error");
        }
    });
};
