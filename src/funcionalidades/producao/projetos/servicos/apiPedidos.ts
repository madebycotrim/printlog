import { Pedido } from "../tipos";
import { servicoBaseApi } from "@/compartilhado/servicos/servicoBaseApi";
import { criarPedidoSchema, atualizarPedidoSchema, CriarPedidoInput, AtualizarPedidoInput } from "../esquemas";

/**
 * Serviço de comunicação com a API de Pedidos do Cloudflare.
 * Refatorado para usar o servicoBaseApi com autenticação segura via Token e validação Zod.
 */
export const apiPedidos = {
    /**
     * Busca todos os pedidos do usuário no D1.
     * O backend deve extrair o ID do usuário do Token de Autenticação.
     */
    buscarTodos: async (_usuarioId: string): Promise<Pedido[]> => {
        // Nota: O usuarioId não é mais enviado via header customizado inseguro.
        // O servicoBaseApi injeta o Bearer Token que contém o ID validado.
        return servicoBaseApi.get<Pedido[]>("/api/pedidos");
    },

    /**
     * Mapeia um objeto de pedido do frontend (camelCase) para o formato do banco (snake_case).
     * Garante que apenas colunas existentes no banco sejam enviadas.
     */
    mapearParaBanco: (dados: any) => {
        const mapeado: any = {};
        
        // Mapeamento explícito de colunas conhecidas no D1
        if (dados.id) mapeado.id = dados.id;
        if (dados.idUsuario) mapeado.id_usuario = dados.idUsuario;
        if (dados.idCliente) mapeado.id_cliente = dados.idCliente;
        if (dados.descricao) mapeado.descricao = dados.descricao;
        if (dados.valorCentavos !== undefined) mapeado.valor_centavos = dados.valorCentavos;
        if (dados.status) mapeado.status = dados.status; 
        if (dados.observacoes !== undefined) mapeado.observacoes = dados.observacoes;
        if (dados.material !== undefined) mapeado.material = dados.material;
        if (dados.pesoGramas !== undefined) mapeado.peso_gramas = dados.pesoGramas;
        if (dados.tempoMinutos !== undefined) mapeado.tempo_minutos = dados.tempoMinutos;
        if (dados.idImpressora !== undefined) mapeado.id_impressora = dados.idImpressora;
        
        // Tratamento de Datas
        if (dados.dataCriacao) mapeado.data_criacao = dados.dataCriacao instanceof Date ? dados.dataCriacao.toISOString() : dados.dataCriacao;
        if (dados.dataConclusao) mapeado.data_conclusao = dados.dataConclusao instanceof Date ? dados.dataConclusao.toISOString() : dados.dataConclusao;
        if (dados.prazoEntrega) mapeado.prazo_entrega = dados.prazoEntrega instanceof Date ? dados.prazoEntrega.toISOString() : dados.prazoEntrega;

        // Insumos Secundários
        if (dados.insumosSecundarios) {
            mapeado.insumos_secundarios = JSON.stringify(dados.insumosSecundarios);
        }

        return mapeado;
    },

    /**
     * Salva um novo pedido no D1 com validação de esquema e mapeamento de campos.
     */
    criar: async (dados: CriarPedidoInput, _usuarioId: string): Promise<string> => {
        const dadosValidados = criarPedidoSchema.parse(dados);
        const paraBanco = apiPedidos.mapearParaBanco(dadosValidados);
        
        const resultado = await servicoBaseApi.post<{ id: string }>("/api/pedidos", paraBanco);
        return resultado.id;
    },

    /**
     * Atualiza um pedido existente com mapeamento de campos para o D1.
     */
    atualizar: async (dados: AtualizarPedidoInput, _usuarioId: string): Promise<void> => {
        const dadosValidados = atualizarPedidoSchema.parse(dados);
        const paraBanco = apiPedidos.mapearParaBanco(dadosValidados);
        
        await servicoBaseApi.requisicao("/api/pedidos", {
            method: "PATCH",
            body: JSON.stringify(paraBanco)
        });
    },

    /**
     * Exclui um pedido do banco de forma segura.
     */
    excluir: async (id: string, _usuarioId: string): Promise<void> => {
        await servicoBaseApi.delete(`/api/pedidos?id=${id}`);
    }
};
