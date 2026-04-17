import { LancamentoFinanceiro, CriarLancamentoInput } from "../tipos";

/**
 * Serviço de comunicação com a API Financeira do Cloudflare D1.
 */
export const apiFinanceiro = {
    buscarTodos: async (usuarioId: string): Promise<LancamentoFinanceiro[]> => {
        const resposta = await fetch("/api/financeiro", {
            headers: { "x-usuario-id": usuarioId }
        });
        if (!resposta.ok) throw new Error("Erro ao carregar dados financeiros.");
        const dados = await resposta.json();
        
        return dados.map((l: any) => ({
            ...l,
            idPedido: l.id_pedido,
            idCliente: l.id_cliente,
            valorCentavos: l.valor_centavos,
            dataCriacao: new Date(l.data_criacao)
        }));
    },

    registrar: async (dados: CriarLancamentoInput, usuarioId: string): Promise<LancamentoFinanceiro> => {
        const resposta = await fetch("/api/financeiro", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "x-usuario-id": usuarioId 
            },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) throw new Error("Erro ao registrar no banco.");
        return resposta.json();
    },

    remover: async (id: string, usuarioId: string): Promise<void> => {
        const resposta = await fetch(`/api/financeiro?id=${id}`, {
            method: "DELETE",
            headers: { "x-usuario-id": usuarioId }
        });
        if (!resposta.ok) throw new Error("Erro ao remover do banco.");
    }
};
