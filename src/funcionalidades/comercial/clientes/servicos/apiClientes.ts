import { Cliente } from "../tipos";
import { servicoBaseApi } from "@/compartilhado/servicos/servicoBaseApi";
import { esquemaCliente } from "../esquemas";

/**
 * Serviço de comunicação com a API de Clientes do Cloudflare D1.
 * Refatorado para usar o servicoBaseApi com autenticação segura via Token e validação Zod.
 */
export const apiClientes = {
    buscarTodos: async (_usuarioId: string): Promise<Cliente[]> => {
        const dados = await servicoBaseApi.get<any[]>("/api/clientes");
        
        // Mapeamento de snake_case para camelCase
        return dados.map((c: any) => ({
            ...c,
            statusComercial: c.status_comercial,
            observacoesCRM: c.observacoes_crm,
            dataCriacao: new Date(c.data_criacao),
            ltvCentavos: c.ltv_centavos || 0,
            totalProdutos: c.total_produtos || 0,
            historico: typeof c.historico === 'string' ? JSON.parse(c.historico) : (c.historico || [])
        }));
    },

    salvar: async (dados: Partial<Cliente>, _usuarioId: string): Promise<Cliente> => {
        // Validação de segurança no cliente
        const dadosValidados = esquemaCliente.partial().parse(dados);
        const metodo = dados.id ? "PATCH" : "POST";

        // Mapeamento para snake_case (D1)
        const payload = {
            ...dadosValidados,
            id: dados.id,
            id_usuario: _usuarioId,
            nome: dados.nome,
            email: dados.email,
            telefone: dados.telefone,
            status_comercial: dados.statusComercial,
            observacoes_crm: dados.observacoesCRM,
            id_consentimento: dados.idConsentimento,
            base_legal: dados.baseLegal,
            finalidade_coleta: dados.finalidadeColeta,
            prazo_retencao_meses: dados.prazoRetencaoMeses,
            ltv_centavos: dados.ltvCentavos,
            total_produtos: dados.totalProdutos,
            historico: dados.historico ? JSON.stringify(dados.historico) : undefined
        };

        return servicoBaseApi.requisicao<Cliente>("/api/clientes", {
            method: metodo,
            body: JSON.stringify(payload)
        });
    },

    remover: async (id: string, _usuarioId: string): Promise<void> => {
        await servicoBaseApi.delete(`/api/clientes?id=${id}`);
    }
};
