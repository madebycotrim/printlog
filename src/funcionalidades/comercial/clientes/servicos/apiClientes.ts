import { Cliente } from "../tipos";

/**
 * Serviço de comunicação com a API de Clientes do Cloudflare D1.
 */
export const apiClientes = {
    buscarTodos: async (usuarioId: string): Promise<Cliente[]> => {
        const resposta = await fetch("/api/clientes", {
            headers: { "x-usuario-id": usuarioId }
        });
        if (!resposta.ok) throw new Error("Erro ao carregar clientes do banco.");
        const dados = await resposta.json();
        
        // Mapeamento de snake_case para camelCase
        return dados.map((c: any) => ({
            ...c,
            statusComercial: c.status_comercial,
            observacoesCRM: c.observacoes_crm,
            dataCriacao: new Date(c.data_criacao),
            ltvCentavos: 0, // Pode ser calculado no futuro
            totalProdutos: 0
        }));
    },

    salvar: async (dados: Partial<Cliente>, usuarioId: string): Promise<Cliente> => {
        const metodo = dados.id ? "PATCH" : "POST";
        const resposta = await fetch("/api/clientes", {
            method: metodo,
            headers: { 
                "Content-Type": "application/json",
                "x-usuario-id": usuarioId 
            },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) throw new Error("Erro ao salvar cliente no banco.");
        return resposta.json();
    },

    remover: async (id: string, usuarioId: string): Promise<void> => {
        const resposta = await fetch(`/api/clientes?id=${id}`, {
            method: "DELETE",
            headers: { "x-usuario-id": usuarioId }
        });
        if (!resposta.ok) throw new Error("Erro ao remover cliente do banco.");
    }
};
