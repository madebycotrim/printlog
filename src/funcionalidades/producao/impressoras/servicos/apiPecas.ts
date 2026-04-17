import { PecaDesgaste } from "../tipos";

/**
 * Serviço de comunicação com a API de Peças de Desgaste do Cloudflare D1.
 */
export const apiPecas = {
    buscarPorImpressora: async (usuarioId: string, idImpressora: string): Promise<PecaDesgaste[]> => {
        const resposta = await fetch(`/api/pecas-desgaste?idImpressora=${idImpressora}`, {
            headers: { "x-usuario-id": usuarioId }
        });
        if (!resposta.ok) throw new Error("Erro ao carregar peças do banco.");
        const dados = await resposta.json();
        
        return dados.map((p: any) => ({
            ...p,
            idImpressora: p.id_impressora,
            vidaUtilMinutos: p.vida_util_minutos,
            horasUsoAtualMinutos: p.horas_uso_atual_minutos,
            dataUltimaTroca: p.data_ultima_troca
        }));
    },

    salvar: async (dados: Partial<PecaDesgaste>, usuarioId: string): Promise<void> => {
        const metodo = dados.id ? "PATCH" : "POST";
        const resposta = await fetch("/api/pecas-desgaste", {
            method: metodo,
            headers: { 
                "Content-Type": "application/json",
                "x-usuario-id": usuarioId 
            },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) throw new Error("Erro ao salvar peça no banco.");
    },

    remover: async (id: string, usuarioId: string): Promise<void> => {
        const resposta = await fetch(`/api/pecas-desgaste?id=${id}`, {
            method: "DELETE",
            headers: { "x-usuario-id": usuarioId }
        });
        if (!resposta.ok) throw new Error("Erro ao remover peça do banco.");
    }
};
