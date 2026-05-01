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
     */
    mapearParaBanco: (dados: any) => {
        const mapeado: any = { ...dados };
        
        // Mapeamentos obrigatórios para o D1
        if (dados.idCliente) mapeado.id_cliente = dados.idCliente;
        if (dados.valorCentavos !== undefined) mapeado.valor_centavos = dados.valorCentavos;
        if (dados.prazoEntrega) mapeado.prazo_entrega = dados.prazoEntrega instanceof Date ? dados.prazoEntrega.toISOString() : dados.prazoEntrega;
        if (dados.dataConclusao) mapeado.data_conclusao = dados.dataConclusao instanceof Date ? dados.dataConclusao.toISOString() : dados.dataConclusao;
        if (dados.idImpressora) mapeado.id_impressora = dados.idImpressora;
        if (dados.pesoGramas !== undefined) mapeado.peso_gramas = dados.pesoGramas;
        if (dados.tempoMinutos !== undefined) mapeado.tempo_minutos = dados.tempoMinutos;
        
        // O status no banco costuma ser id_status ou status. Enviamos ambos para garantir.
        if (dados.status) {
            mapeado.id_status = dados.status;
            mapeado.status = dados.status;
        }

        if (dados.insumosSecundarios) {
            mapeado.insumos_secundarios = JSON.stringify(dados.insumosSecundarios);
        }

        // Remove campos camelCase para evitar erro de coluna inexistente no SQLite/D1
        const camposParaRemover = [
            "idCliente", "valorCentavos", "prazoEntrega", "dataConclusao", 
            "idImpressora", "pesoGramas", "tempoMinutos", "insumosSecundarios"
        ];
        camposParaRemover.forEach(campo => delete mapeado[campo]);

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
