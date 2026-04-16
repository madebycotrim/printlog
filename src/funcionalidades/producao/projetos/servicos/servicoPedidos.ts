import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { Pedido, CriarPedidoInput, AtualizarPedidoInput } from "../tipos";
import { ErroNaoEncontrado, CodigoErro } from "@/compartilhado/utilitarios/excecoes";

const CHAVE_STORAGE = "printlog:pedidos" as const;

class ServicoPedidos {
  private _obterTodos(): Pedido[] {
    const salvo = localStorage.getItem(CHAVE_STORAGE);
    if (!salvo) return [];
    try {
      const parsed = JSON.parse(salvo);
      let mudou = false;
      const agora = new Date();
      const SETE_DIAS_EM_MS = 7 * 24 * 60 * 60 * 1000;

      const pedidos = parsed.map((p: any) => {
        const dataCriacao = new Date(p.dataCriacao);
        const dataConclusao = p.dataConclusao ? new Date(p.dataConclusao) : undefined;
        const prazoEntrega = p.prazoEntrega ? new Date(p.prazoEntrega) : undefined;
        let status = p.status;

        // Arquivamento Automático: +7 dias no Concluído
        if (status === StatusPedido.CONCLUIDO && dataConclusao) {
          if (agora.getTime() - dataConclusao.getTime() > SETE_DIAS_EM_MS) {
            status = StatusPedido.ARQUIVADO;
            mudou = true;
          }
        }

        return {
          ...p,
          dataCriacao,
          dataConclusao,
          prazoEntrega,
          status,
        };
      });

      if (mudou) {
        this._salvarTodos(pedidos);
      }

      return pedidos;
    } catch {
      return [];
    }
  }

  private _salvarTodos(pedidos: Pedido[]): void {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(pedidos));
  }

  async buscarPedidos(): Promise<Pedido[]> {
    const todos = this._obterTodos();
    // Não exibe arquivados no quadro principal
    return todos.filter((p) => p.status !== StatusPedido.ARQUIVADO);
  }

  async criarPedido(dados: CriarPedidoInput): Promise<Pedido> {
    const pedidos = this._obterTodos();

    const novoPedido: Pedido = {
      id: crypto.randomUUID(),
      idUsuario: "usuario-logado",
      idCliente: dados.idCliente,
      descricao: dados.descricao,
      status: StatusPedido.A_FAZER,
      valorCentavos: dados.valorCentavos,
      dataCriacao: new Date(),
      prazoEntrega: dados.prazoEntrega,
      observacoes: dados.observacoes,
      material: dados.material,
      pesoGramas: dados.pesoGramas,
      tempoMinutos: dados.tempoMinutos,
    };

    pedidos.push(novoPedido);
    this._salvarTodos(pedidos);
    return novoPedido;
  }

  async atualizarPedido(dados: AtualizarPedidoInput): Promise<Pedido> {
    const pedidos = this._obterTodos();
    const indice = pedidos.findIndex((p) => p.id === dados.id);

    if (indice === -1) {
      throw new ErroNaoEncontrado(`Pedido ${dados.id} não encontrado.`, CodigoErro.PEDIDO_NAO_ENCONTRADO);
    }

    const pedidoOriginal = pedidos[indice];
    const novoStatus = dados.status || pedidoOriginal.status;

    // Gerenciamento de Data de Conclusão para arquivamento futuro
    let novaDataConclusao = pedidoOriginal.dataConclusao;
    if (novoStatus === StatusPedido.CONCLUIDO && pedidoOriginal.status !== StatusPedido.CONCLUIDO) {
      novaDataConclusao = new Date();
    } else if (novoStatus !== StatusPedido.CONCLUIDO) {
      novaDataConclusao = undefined;
    }

    const pedidoAtualizado: Pedido = {
      ...pedidoOriginal,
      ...dados,
      status: novoStatus,
      dataConclusao: novaDataConclusao,
    };

    pedidos[indice] = pedidoAtualizado;
    this._salvarTodos(pedidos);
    return pedidoAtualizado;
  }

  async atualizarStatus(id: string, novoStatus: StatusPedido): Promise<Pedido> {
    return this.atualizarPedido({ id, status: novoStatus });
  }

  async excluirPedido(id: string): Promise<void> {
    const pedidos = this._obterTodos();
    const novosPedidos = pedidos.filter((p) => p.id !== id);
    this._salvarTodos(novosPedidos);
  }
}

export const servicoPedidos = new ServicoPedidos();
