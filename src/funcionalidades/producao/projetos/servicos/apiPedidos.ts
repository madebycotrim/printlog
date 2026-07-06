import { Pedido } from "../tipos";
import { servicoBaseApi } from "@/compartilhado/servicos/servicoBaseApi";
import { criarPedidoSchema, atualizarPedidoSchema, CriarPedidoInput, AtualizarPedidoInput } from "../esquemas";
import { useArmazemPedidos } from "../estado/armazemPedidos";

/**
 * Serviço de comunicação com a API de Pedidos do Cloudflare.
 * Refatorado para usar o servicoBaseApi com autenticação segura via Token e validação Zod.
 */
export const apiPedidos = {
    /**
     * Mapeia um objeto do banco (snake_case) de volta para o frontend (camelCase).
     */
    mapearParaFrontend: (dados: any): Pedido => {
        // Tenta extrair dados do baú JSON (dados_extras) para máxima flexibilidade
        let extras: any = {};
        if (dados.dados_extras) {
            try {
                if (typeof dados.dados_extras === 'string') {
                    const trimmed = dados.dados_extras.trim();
                    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
                        extras = JSON.parse(trimmed);
                    }
                } else {
                    extras = dados.dados_extras;
                }
            } catch (e) {
                console.warn("[apiPedidos] Erro ao processar dados_extras:", e);
            }
        }

        const garantirArray = (valor: any): any[] => {
            if (!valor) return [];
            if (Array.isArray(valor)) return valor;
            if (typeof valor === 'string') {
                const trimmed = valor.trim();
                if (trimmed === "" || trimmed === "[]") return [];
                try {
                    const parsed = JSON.parse(trimmed);
                    return Array.isArray(parsed) ? parsed : [];
                } catch {
                    return [];
                }
            }
            return [];
        };

        return {
            id: dados.id,
            idUsuario: dados.id_usuario,
            idCliente: dados.id_cliente ?? dados.idCliente,
            nomeCliente: dados.nome_cliente,
            descricao: dados.descricao,
            status: dados.status,
            valorCentavos: dados.valor_centavos ?? dados.valorCentavos,
            dataCriacao: (dados.data_criacao || dados.dataCriacao) ? new Date(dados.data_criacao || dados.dataCriacao) : new Date(),
            dataConclusao: (dados.data_conclusao || dados.dataConclusao) ? new Date(dados.data_conclusao || dados.dataConclusao) : undefined,
            prazoEntrega: (dados.prazo_entrega || dados.prazoEntrega) ? new Date(dados.prazo_entrega || dados.prazoEntrega) : undefined,
            observacoes: dados.observacoes || extras.observacoes,
            material: dados.material,
            pesoGramas: dados.peso_gramas ?? dados.pesoGramas ?? extras.pesoGramas ?? extras.peso_gramas ?? 0,
            tempoMinutos: dados.tempo_minutos ?? dados.tempoMinutos ?? extras.tempoMinutos ?? extras.tempo_minutos ?? 0,
            idImpressora: dados.id_impressora ?? dados.idImpressora ?? extras.idImpressora,
            insumosSecundarios: garantirArray(
                (extras.insumosSecundarios && extras.insumosSecundarios.length > 0)
                    ? extras.insumosSecundarios
                    : (dados.insumos_secundarios ?? dados.insumosSecundarios)
            ),
            materiais: garantirArray(
                (extras.materiais && extras.materiais.length > 0)
                    ? extras.materiais
                    : dados.materiais
            ),
            posProcesso: garantirArray(
                (extras.posProcesso && extras.posProcesso.length > 0) 
                    ? extras.posProcesso 
                    : (dados.pos_processo ?? dados.posProcesso)
            ),
            configuracoes: extras.configuracoes || (typeof dados.configuracoes === 'string'
                ? JSON.parse(dados.configuracoes)
                : (dados.configuracoes ?? {})),
            dataInicioAgendada: extras.dataInicioAgendada || extras.data_inicio_agendada,
            posicaoFila: extras.posicaoFila !== undefined ? extras.posicaoFila : extras.posicao_fila,
            codigoRastreio: extras.codigoRastreio || extras.codigo_rastreio,
            observacoesPublicas: extras.observacoesPublicas || extras.observacoes_publicas,
        };
    },

    /**
     * Busca todos os pedidos do usuário no D1.
     */
    buscarPorId: async (id: string, _usuarioId: string): Promise<Pedido | null> => {
        const dados = await servicoBaseApi.get<any>(`/api/pedidos?id=${id}`);
        if (!dados) return null;
        
        // v9.0: Blindagem contra APIs que retornam array mesmo com filtro de ID
        if (Array.isArray(dados)) {
            const encontrado = dados.find(d => d.id === id);
            return encontrado ? apiPedidos.mapearParaFrontend(encontrado) : null;
        }
        
        return apiPedidos.mapearParaFrontend(dados);
    },

    buscarTodos: async (_usuarioId: string): Promise<Pedido[]> => {
        const resultados = await servicoBaseApi.get<any>("/api/pedidos");
        const lista = Array.isArray(resultados) 
            ? resultados 
            : (resultados?.items || resultados?.data || []);
        return lista.map(apiPedidos.mapearParaFrontend);
    },

    buscarPorCliente: async (clienteId: string, _usuarioId: string): Promise<Pedido[]> => {
        const resultados = await servicoBaseApi.get<any>(`/api/pedidos?clienteId=${clienteId}`);
        const lista = Array.isArray(resultados) 
            ? resultados 
            : (resultados?.items || resultados?.data || []);
        return lista.map(apiPedidos.mapearParaFrontend);
    },

    /**
     * Mapeia um objeto de pedido do frontend (camelCase) para o formato do banco (snake_case).
     * Converte strings vazias em null para IDs e garante tipos corretos para o SQLite.
     */
    mapearParaBanco: (dados: any) => {
        const mapeado: any = {};
        
        // IDs e Chaves (Garante envio em snake_case e camelCase para o servidor)
        if (dados.id) mapeado.id = dados.id;
        if (dados.idUsuario) mapeado.id_usuario = dados.idUsuario;
        
        // Cliente
        const id_cliente = dados.idCliente || dados.id_cliente;
        mapeado.id_cliente = id_cliente === "" ? null : id_cliente;
        mapeado.idCliente = mapeado.id_cliente;

        // Impressora
        const id_impressora = dados.idImpressora || dados.id_impressora;
        mapeado.id_impressora = (id_impressora === "" || id_impressora === null) ? null : id_impressora;
        mapeado.idImpressora = mapeado.id_impressora;
        
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

        // Empacota tudo no baú JSON (dados_extras) apenas se houver metadados presentes.
        // Se for uma atualização parcial (ex: Kanban movendo status), não mandamos dados_extras
        // para evitar que o back-end sobrescreva o baú existente com um vazio.
        const temMetadados = 
            dados.insumosSecundarios !== undefined || 
            dados.materiais !== undefined || 
            dados.posProcesso !== undefined || 
            dados.configuracoes !== undefined ||
            dados.observacoes !== undefined ||
            dados.dataInicioAgendada !== undefined ||
            dados.posicaoFila !== undefined ||
            dados.codigoRastreio !== undefined ||
            dados.observacoesPublicas !== undefined;

        if (temMetadados) {
            const dadosExtras = {
                insumosSecundarios: dados.insumosSecundarios,
                materiais: dados.materiais,
                posProcesso: dados.posProcesso,
                configuracoes: dados.configuracoes,
                idImpressora: mapeado.id_impressora,
                prazoEntrega: mapeado.prazo_entrega,
                observacoes: mapeado.observacoes,
                pesoGramas: mapeado.peso_gramas,
                tempoMinutos: mapeado.tempo_minutos,
                dataInicioAgendada: dados.dataInicioAgendada,
                posicaoFila: dados.posicaoFila,
                codigoRastreio: dados.codigoRastreio,
                observacoesPublicas: dados.observacoesPublicas,
            };
            mapeado.dados_extras = JSON.stringify(dadosExtras);
        }

        // Mantém compatibilidade com colunas específicas se elas existirem
        if (dados.insumosSecundarios) {
            mapeado.insumos_secundarios = JSON.stringify(dados.insumosSecundarios);
        }
        if (dados.materiais) {
            mapeado.materiais = JSON.stringify(dados.materiais);
        }
        if (dados.posProcesso) {
            mapeado.pos_processo = JSON.stringify(dados.posProcesso);
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
        
        // Carrega o estado atual para não perder dados_extras nas atualizações parciais
        const pedidosExistentes = useArmazemPedidos.getState().pedidos;
        const pedidoExistente = pedidosExistentes.find(p => p.id === dados.id);
        
        let dadosMesclados = { ...dadosValidados } as any;
        if (pedidoExistente) {
            dadosMesclados = {
                ...pedidoExistente,
                ...dadosValidados,
                insumosSecundarios: dadosValidados.insumosSecundarios !== undefined ? dadosValidados.insumosSecundarios : pedidoExistente.insumosSecundarios,
                materiais: dadosValidados.materiais !== undefined ? dadosValidados.materiais : pedidoExistente.materiais,
                posProcesso: dadosValidados.posProcesso !== undefined ? dadosValidados.posProcesso : pedidoExistente.posProcesso,
                configuracoes: dadosValidados.configuracoes !== undefined ? dadosValidados.configuracoes : pedidoExistente.configuracoes,
            };
        }

        const paraBanco = apiPedidos.mapearParaBanco(dadosMesclados);
        
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
