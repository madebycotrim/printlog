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
     * Converte strings vazias em null para IDs e garante tipos corretos para o SQLite.
     */
    mapearParaBanco: (dados: any) => {
        const mapeado: any = {};
        
        // IDs e Chaves (Compatibilidade com Produção)
        if (dados.id) mapeado.id = dados.id;
        if (dados.idUsuario) mapeado.id_usuario = dados.idUsuario;
        if (dados.idCliente) {
            mapeado.id_cliente = dados.idCliente === "" ? null : dados.idCliente;
            mapeado.idCliente = mapeado.id_cliente; // Envia ambos para garantir
        }
        if (dados.idImpressora !== undefined) {
            mapeado.id_impressora = (dados.idImpressora === "" || dados.idImpressora === null) ? null : dados.idImpressora;
            mapeado.idImpressora = mapeado.id_impressora;
        }
        
        // Campos de Texto e Status
        if (dados.descricao) mapeado.descricao = dados.descricao;
        if (dados.observacoes !== undefined) mapeado.observacoes = dados.observacoes;
        if (dados.material !== undefined) mapeado.material = dados.material;
        if (dados.status) mapeado.status = dados.status; 
        
        // Campos Numéricos
        if (dados.valorCentavos !== undefined) {
            mapeado.valor_centavos = Number(dados.valorCentavos) || 0;
            mapeado.valorCentavos = mapeado.valor_centavos;
        }
        if (dados.pesoGramas !== undefined) {
            mapeado.peso_gramas = dados.pesoGramas === "" ? null : Number(dados.pesoGramas);
            mapeado.pesoGramas = mapeado.peso_gramas;
        }
        if (dados.tempoMinutos !== undefined) {
            mapeado.tempo_minutos = dados.tempoMinutos === "" ? null : Number(dados.tempoMinutos);
            mapeado.tempoMinutos = mapeado.tempo_minutos;
        }
        
        // Datas
        const formatarData = (d: any) => {
            if (!d) return null;
            const data = d instanceof Date ? d : new Date(d);
            return isNaN(data.getTime()) ? null : data.toISOString();
        };

        if (dados.dataCriacao) {
            mapeado.data_criacao = formatarData(dados.dataCriacao);
            mapeado.dataCriacao = mapeado.data_criacao;
        }
        if (dados.dataConclusao !== undefined) {
            mapeado.data_conclusao = formatarData(dados.dataConclusao);
            mapeado.dataConclusao = mapeado.data_conclusao;
        }
        if (dados.prazoEntrega !== undefined) {
            mapeado.prazo_entrega = formatarData(dados.prazoEntrega);
            mapeado.prazoEntrega = mapeado.prazo_entrega;
        }

        // JSON para strings
        if (dados.insumosSecundarios) {
            mapeado.insumos_secundarios = JSON.stringify(dados.insumosSecundarios);
            mapeado.insumosSecundarios = mapeado.insumos_secundarios;
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
