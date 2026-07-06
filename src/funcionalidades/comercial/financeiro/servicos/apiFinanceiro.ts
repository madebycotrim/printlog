import { LancamentoFinanceiro, CriarLancamentoInput } from "../tipos";
import { servicoBaseApi } from "@/compartilhado/servicos/servicoBaseApi";
import { criarLancamentoSchema } from "../esquemas";

/**
 * Serviço de comunicação com a API Financeira do Cloudflare D1.
 * Refatorado para usar o servicoBaseApi com autenticação segura via Token e validação Zod.
 */
export const apiFinanceiro = {
    buscarTodos: async (_usuarioId: string): Promise<LancamentoFinanceiro[]> => {
        const dados = await servicoBaseApi.get<any>("/api/financeiro");
        const lista = Array.isArray(dados) 
            ? dados 
            : (dados?.items || dados?.data || []);
        
        return lista.map((l: any) => ({
            ...l,
            idPedido: l.id_pedido,
            idCliente: l.id_cliente,
            valorCentavos: l.valor_centavos,
            dataCriacao: new Date(l.data_criacao)
        }));
    },

    registrar: async (dados: CriarLancamentoInput, _usuarioId: string): Promise<LancamentoFinanceiro> => {
        // Validação de segurança no cliente
        const dadosValidados = criarLancamentoSchema.parse(dados);

        return servicoBaseApi.post<LancamentoFinanceiro>("/api/financeiro", dadosValidados);
    },

    remover: async (id: string, _usuarioId: string): Promise<void> => {
        await servicoBaseApi.delete(`/api/financeiro?id=${id}`);
    },

    atualizar: async (dados: Partial<LancamentoFinanceiro> & { id: string }): Promise<void> => {
        await servicoBaseApi.patch("/api/financeiro", dados);
    }
};
