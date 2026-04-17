import { Pedido, CriarPedidoInput, AtualizarPedidoInput } from "../tipos";

/**
 * Serviço de comunicação com a API de Pedidos do Cloudflare.
 */
export const apiPedidos = {
    /**
     * Busca todos os pedidos do usuário no D1.
     */
    buscarTodos: async (usuarioId: string): Promise<Pedido[]> => {
        const resposta = await fetch("/api/pedidos", {
            headers: { "x-usuario-id": usuarioId }
        });
        if (!resposta.ok) throw new Error("Erro ao carregar pedidos do banco.");
        return resposta.json();
    },

    /**
     * Salva um novo pedido no D1.
     */
    criar: async (dados: CriarPedidoInput, usuarioId: string): Promise<string> => {
        const resposta = await fetch("/api/pedidos", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "x-usuario-id": usuarioId 
            },
            body: JSON.stringify(dados)
        });
        if (!resposta.ok) throw new Error("Erro ao salvar pedido no banco.");
        const resultado = await resposta.json();
        return resultado.id;
    },

    /**
     * Atualiza um pedido existente.
     */
    atualizar: async (dados: AtualizarPedidoInput, usuarioId: string): Promise<void> => {
        const resposta = await fetch("/api/pedidos", {
            method: "PATCH",
            headers: { 
                "Content-Type": "application/json",
                "x-usuario-id": usuarioId 
            },
            body: JSON.stringify(dados)
        });
        if (!resposta.ok) throw new Error("Erro ao atualizar pedido no banco.");
    },

    /**
     * Exclui um pedido do banco.
     */
    excluir: async (id: string, usuarioId: string): Promise<void> => {
        const resposta = await fetch(`/api/pedidos?id=${id}`, {
            method: "DELETE",
            headers: { "x-usuario-id": usuarioId }
        });
        if (!resposta.ok) throw new Error("Erro ao excluir pedido do banco.");
    }
};
