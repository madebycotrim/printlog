import { RegistroManutencao } from "../tipos";

/**
 * Serviço de comunicação com a API de Manutenções do Cloudflare D1.
 */
export const apiManutencoes = {
    buscarPorImpressora: async (usuarioId: string, idImpressora: string): Promise<RegistroManutencao[]> => {
        const resposta = await fetch(`/api/manutencoes?idImpressora=${idImpressora}`, {
            headers: { "x-usuario-id": usuarioId }
        });
        if (!resposta.ok) {
            const erroJson = await resposta.json().catch(() => ({}));
            throw new Error(`Erro ao carregar manutenções: ${erroJson.erro || resposta.statusText}`);
        }
        const dados = await resposta.json();
        
        return dados.map((m: any) => ({
            ...m,
            custoCentavos: m.custo_centavos,
            idImpressora: m.id_impressora,
            tempoParadaMinutos: m.tempo_parada_minutos,
            pecasTrocadas: m.pecas_trocadas,
            responsavel: m.responsavel,
            horasMaquinaNoMomentoMinutos: m.horas_maquina_atualmente
        }));
    },

    salvar: async (dados: Partial<RegistroManutencao>, usuarioId: string): Promise<void> => {
        const resposta = await fetch("/api/manutencoes", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "x-usuario-id": usuarioId 
            },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) throw new Error("Erro ao salvar manutenção no banco.");
    },

    remover: async (id: string, usuarioId: string): Promise<void> => {
        const resposta = await fetch(`/api/manutencoes?id=${id}`, {
            method: "DELETE",
            headers: { "x-usuario-id": usuarioId }
        });
        if (!resposta.ok) throw new Error("Erro ao remover manutenção do banco.");
    }
};
