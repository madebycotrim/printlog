import { Impressora } from "../tipos";

/**
 * Serviço de comunicação com a API de Impressoras do Cloudflare D1.
 */
export const apiImpressoras = {
    buscarTodas: async (usuarioId: string): Promise<Impressora[]> => {
        const resposta = await fetch("/api/impressoras", {
            headers: { "x-usuario-id": usuarioId }
        });
        if (!resposta.ok) throw new Error("Erro ao carregar impressoras do banco.");
        const dados = await resposta.json();
        
        return dados.map((i: any) => ({
            ...i,
            taxaHoraCentavos: i.taxa_hora_centavos,
            horimetroTotalMinutos: i.horimetro_total_minutos,
            dataCriacao: new Date(i.data_criacao),
            dataAtualizacao: new Date()
        }));
    },

    salvar: async (dados: Partial<Impressora>, usuarioId: string): Promise<Impressora> => {
        const metodo = dados.id ? "PATCH" : "POST";
        const resposta = await fetch("/api/impressoras", {
            method: metodo,
            headers: { 
                "Content-Type": "application/json",
                "x-usuario-id": usuarioId 
            },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) throw new Error("Erro ao salvar impressora no banco.");
        return resposta.json();
    },

    remover: async (id: string, usuarioId: string): Promise<void> => {
        const resposta = await fetch(`/api/impressoras?id=${id}`, {
            method: "DELETE",
            headers: { "x-usuario-id": usuarioId }
        });
        if (!resposta.ok) throw new Error("Erro ao remover impressora do banco.");
    }
};
