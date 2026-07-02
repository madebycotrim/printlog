import { Cliente } from "../tipos";
import { servicoBaseApi } from "@/compartilhado/servicos/servicoBaseApi";
import { esquemaCliente } from "../esquemas";

const mapearCliente = (c: any): Cliente => ({
    ...c,
    tipo: c.tipo || "B2C",
    fiel: c.fiel === 1 || c.fiel === true,
    observacoesCRM: c.observacoes_crm ?? undefined,
    idConsentimento: c.id_consentimento ?? undefined,
    baseLegal: c.base_legal ?? undefined,
    finalidadeColeta: c.finalidade_coleta ?? undefined,
    prazoRetencaoMeses: c.prazo_retencao_meses ?? undefined,
    ltvCentavos: c.ltv_centavos || 0,
    totalProdutos: c.total_produtos || 0,
    nome: c.nome ?? undefined,
    email: c.email ?? undefined,
    telefone: c.telefone ?? undefined,
    historico: typeof c.historico === 'string' 
        ? JSON.parse(c.historico) 
        : (c.historico || []),
    dataCriacao: new Date(c.data_criacao),
    dataAtualizacao: new Date(c.data_atualizacao)
});

/**
 * Serviço de comunicação com a API de Clientes do Cloudflare D1.
 * Refatorado para usar o servicoBaseApi com autenticação segura via Token e validação Zod.
 */
export const apiClientes = {
    buscarTodos: async (_usuarioId: string): Promise<Cliente[]> => {
        const dados = await servicoBaseApi.get<any[]>("/api/clientes");
        return dados.map(mapearCliente);
    },

    listarPaginado: async ({ limit, offset, search }: { limit: number, offset: number, search?: string }): Promise<{ items: Cliente[], total: number }> => {
        const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString()
        });
        if (search) {
            params.append("search", search);
        }
        
        const dados = await servicoBaseApi.get<any>(`/api/clientes?${params.toString()}`);
        
        // v9.0: Blindagem contra o Worker em produção retornar array plano (legado)
        if (Array.isArray(dados)) {
            const todosClientes = dados.map(mapearCliente);
            const filtrados = search 
                ? todosClientes.filter(c => c.nome.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()))
                : todosClientes;
                
            return {
                items: filtrados.slice(offset, offset + limit),
                total: filtrados.length
            };
        }
        
        return {
            items: (dados.items || []).map(mapearCliente),
            total: dados.total || 0
        };
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
            tipo: dados.tipo ?? "B2C",
            fiel: dados.fiel ?? false,

            observacoesCRM: dados.observacoesCRM ?? null,
            idConsentimento: dados.idConsentimento ?? null,
            baseLegal: dados.baseLegal ?? null,
            finalidadeColeta: dados.finalidadeColeta ?? null,
            prazoRetencaoMeses: dados.prazoRetencaoMeses ?? null,
            ltvCentavos: dados.ltvCentavos ?? null,
            totalProdutos: dados.totalProdutos ?? null,
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
