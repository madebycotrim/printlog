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
            nome: dados.nome ?? null,
            email: dados.email ?? null,
            telefone: dados.telefone ?? null,
            status_comercial: dados.statusComercial ?? null,
            observacoes_crm: dados.observacoesCRM ?? null,
            id_consentimento: dados.idConsentimento ?? null,
            base_legal: dados.baseLegal ?? null,
            finalidade_coleta: dados.finalidadeColeta ?? null,
            prazo_retencao_meses: dados.prazoRetencaoMeses ?? null,
            ltv_centavos: dados.ltvCentavos ?? null,
            total_produtos: dados.totalProdutos ?? null,
            historico: dados.historico ? JSON.stringify(dados.historico) : null
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
