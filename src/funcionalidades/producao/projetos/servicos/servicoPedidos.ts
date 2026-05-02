import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { Pedido, CriarPedidoInput, AtualizarPedidoInput } from "../tipos";
import { apiPedidos } from "./apiPedidos";

/**
 * Serviço de Negócio para Pedidos e Fluxo de Produção.
 * Faz a ponte entre a UI e a API real, aplicando regras de negócio.
 */
class ServicoPedidos {
  /**
   * Busca e processa pedidos, aplicando regras de arquivamento automático.
   */
  async buscarPedidos(usuarioId: string): Promise<Pedido[]> {
    const pedidos = await apiPedidos.buscarTodos(usuarioId);
    
    // Convertemos datas de string para objetos Date e normalizamos status
    const processados = pedidos.map((p: any) => ({
      ...p,
      status: (p.status || p.id_status || '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '_')
        .replace('pendente', StatusPedido.A_FAZER) || StatusPedido.A_FAZER,
      dataCriacao: new Date(p.data_criacao || p.dataCriacao),
      dataConclusao: p.data_conclusao ? new Date(p.data_conclusao) : undefined,
      prazoEntrega: (p.prazo_entrega || p.prazoEntrega) ? new Date(p.prazo_entrega || p.prazoEntrega) : undefined,
      valorCentavos: (p.valor_centavos !== undefined) ? p.valor_centavos : p.valorCentavos,
      idCliente: p.id_cliente || p.idCliente,
      idImpressora: p.id_impressora || p.idImpressora,
      pesoGramas: (p.peso_gramas !== undefined) ? p.peso_gramas : p.pesoGramas,
      tempoMinutos: (p.tempo_minutos !== undefined) ? p.tempo_minutos : p.tempoMinutos,
      insumosSecundarios: typeof p.insumos_secundarios === 'string' ? JSON.parse(p.insumos_secundarios) : (p.insumos_secundarios || p.insumosSecundarios || [])
    }));

    const agora = new Date();
    const SETE_DIAS_EM_MS = 7 * 24 * 60 * 60 * 1000;

    // Regra de Arquivamento Automático: +7 dias no Concluído
    const finalizados = await Promise.all(processados.map(async (p) => {
      let status = p.status;
      if (status === StatusPedido.CONCLUIDO && p.dataConclusao) {
        if (agora.getTime() - p.dataConclusao.getTime() > SETE_DIAS_EM_MS) {
          status = StatusPedido.ARQUIVADO;
          // Sincroniza o novo status no banco em Background (sem travar a UI)
          apiPedidos.atualizar({ id: p.id, status: StatusPedido.ARQUIVADO }, usuarioId);
        }
      }
      return { ...p, status };
    }));

    // Retorna apenas os não arquivados para o Kanban padrão
    return finalizados.filter((p) => p.status !== StatusPedido.ARQUIVADO);
  }

  async criarPedido(dados: CriarPedidoInput, usuarioId: string): Promise<Pedido> {
    const id = crypto.randomUUID();
    const dataCriacao = new Date();
    
    const novoPedido: Pedido = {
      ...dados,
      id,
      idUsuario: usuarioId,
      status: StatusPedido.A_FAZER,
      dataCriacao
    };

    await apiPedidos.criar(novoPedido, usuarioId);
    return novoPedido;
  }

  async atualizarPedido(dados: AtualizarPedidoInput, usuarioId: string): Promise<Pedido> {
    const novoStatus = dados.status;
    let dataConclusao = (dados as any).dataConclusao;

    // Gerenciamento simplificado de Data de Conclusão v9.0
    if (novoStatus === StatusPedido.CONCLUIDO && !dataConclusao) {
      dataConclusao = new Date().toISOString();
    }

    const payload = {
      ...dados,
      dataConclusao
    };

    await apiPedidos.atualizar(payload, usuarioId);
    
    // Retornamos um objeto parcial que será mesclado no estado pelo hook
    return {
      ...dados,
      dataConclusao: dataConclusao ? new Date(dataConclusao) : undefined
    } as any;
  }

  async atualizarStatus(id: string, novoStatus: StatusPedido, usuarioId: string): Promise<Pedido> {
    return this.atualizarPedido({ id, status: novoStatus }, usuarioId);
  }

  async excluirPedido(id: string, usuarioId: string): Promise<void> {
    await apiPedidos.excluir(id, usuarioId);
  }
}

export const servicoPedidos = new ServicoPedidos();
