import { useEffect, useCallback, useMemo, useState } from "react";
import { CriarPedidoInput, AtualizarPedidoInput } from "../tipos";
import { servicoPedidos } from "../servicos/servicoPedidos";
import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { toast } from "react-hot-toast";
import { registrar } from "@/compartilhado/utilitarios/registrador";
import { useArmazemPedidos } from "../estado/armazemPedidos";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";

export function usePedidos() {
  const pedidos = useArmazemPedidos((s) => s.pedidos);
  const carregando = useArmazemPedidos((s) => s.carregando);
  const termoBusca = useArmazemPedidos((s) => s.termoBusca);
  const definirPedidos = useArmazemPedidos((s) => s.definirPedidos);
  const definirCarregando = useArmazemPedidos((s) => s.definirCarregando);
  const definirTermoBusca = useArmazemPedidos((s) => s.definirTermoBusca);
  const adicionarPedido = useArmazemPedidos((s) => s.adicionarPedido);
  const atualizarPedidoNoEstado = useArmazemPedidos((s) => s.atualizarPedidoNoEstado);
  const removerPedido = useArmazemPedidos((s) => s.removerPedido);
  const idsBloqueados = useArmazemPedidos((s) => s.idsBloqueados);
  const bloquearId = useArmazemPedidos((s) => s.bloquearId);
  const desbloquearId = useArmazemPedidos((s) => s.desbloquearId);

  const jaCarregou = useArmazemPedidos((s) => s.jaCarregou);
  const definirJaCarregou = useArmazemPedidos((s) => s.definirJaCarregou);

  const { usuario } = useAutenticacao();
  const usuarioId = usuario?.uid;
  const [erro, setErro] = useState(false);

  const carregarPedidos = useCallback(async (forcar = false) => {
    if (!usuarioId) return;
    if (!forcar && jaCarregou) return;
    try {
      setErro(false);
      definirJaCarregou(true);
      definirCarregando(true);
      const dados = await servicoPedidos.buscarPedidos(usuarioId);
      definirPedidos(dados);
    } catch (erro) {
      setErro(true);
      definirJaCarregou(false); // Permite retentar
      registrar.error({ rastreioId: "sistema", servico: "Projetos" }, "Erro ao carregar pedidos", erro);
      toast.error("Erro ao carregar pedidos.");
    } finally {
      definirCarregando(false);
    }
  }, [definirPedidos, definirCarregando, definirJaCarregou, usuarioId, jaCarregou]);

  const criarPedido = async (dados: CriarPedidoInput) => {
    if (!usuarioId) return;
    const id = crypto.randomUUID();
    const pedidoOtimista: Pedido = {
      id,
      idUsuario: usuarioId,
      idCliente: dados.idCliente || "",
      nomeCliente: dados.nomeCliente || "Cliente avulso",
      idImpressora: dados.idImpressora || "",
      descricao: dados.descricao || "",
      status: StatusPedido.A_FAZER,
      valorCentavos: dados.valorCentavos || 0,
      tempoMinutos: dados.tempoMinutos || 0,
      pesoGramas: dados.pesoGramas || 0,
      dataCriacao: new Date(),
      configuracoes: dados.configuracoes || {},
      arquivado: false,
      ...dados
    } as any;

    // ⚡️ OTIMISTA
    adicionarPedido(pedidoOtimista);

    try {
      const novo = await servicoPedidos.criarPedido({ ...dados, id } as any, usuarioId);
      atualizarPedidoNoEstado(id, novo);
      toast.success("Pedido criado com sucesso! 🚀");
      return novo;
    } catch (erro) {
      // 🔙 ROLLBACK
      removerPedido(id);
      registrar.error({ rastreioId: "sistema", servico: "Projetos" }, "Erro ao criar pedido", erro);
      toast.error("Erro ao criar pedido. Alteração revertida.");
      throw erro;
    }
  };

  const atualizarPedido = async (dados: AtualizarPedidoInput) => {
    if (!usuarioId) return;
    const pedidoOriginal = pedidos.find(p => p.id === dados.id);
    if (!pedidoOriginal) return;

    // ⚡️ OTIMISTA
    atualizarPedidoNoEstado(dados.id, dados);

    try {
      const atualizado = await servicoPedidos.atualizarPedido(dados, usuarioId);
      atualizarPedidoNoEstado(dados.id, atualizado);
      toast.success("Pedido atualizado!");
      return atualizado;
    } catch (erro: any) {
      // 🔙 ROLLBACK
      atualizarPedidoNoEstado(dados.id, pedidoOriginal);
      registrar.error({ rastreioId: dados.id, servico: "Projetos" }, "Erro ao atualizar pedido", erro);
      toast.error(erro.mensagem || "Erro ao atualizar pedido. Alteração revertida.");
      throw erro;
    }
  };

  const moverPedido = async (id: string, novoStatus: StatusPedido) => {
    if (!usuarioId) return;
    const todosPedidos = useArmazemPedidos.getState().pedidos;
    const pedidoEncontrado = todosPedidos.find((p) => p.id === id);

    if (!pedidoEncontrado) return;
    if (pedidoEncontrado.status === novoStatus) return;
    
    // Proteção: Se o pedido já estiver em movimentação, ignora novos comandos
    if (idsBloqueados.includes(id)) {
      registrar.warn({ rastreioId: id, servico: "Projetos" }, "Tentativa de mover pedido já em processamento");
      return;
    }

    const pedidoOriginal = { ...pedidoEncontrado };

    const atualizacaoOtimista: Partial<any> = { status: novoStatus };
    if (novoStatus === StatusPedido.CONCLUIDO && !pedidoEncontrado.dataConclusao) {
      atualizacaoOtimista.dataConclusao = new Date();
    } else if ((pedidoEncontrado.status === StatusPedido.CONCLUIDO || pedidoEncontrado.status === StatusPedido.ARQUIVADO) &&
               novoStatus !== StatusPedido.CONCLUIDO && novoStatus !== StatusPedido.ARQUIVADO) {
      atualizacaoOtimista.dataConclusao = undefined;
    }

    // Atualiza o estado local imediatamente (otimista)
    atualizarPedidoNoEstado(id, atualizacaoOtimista);

    try {
      bloquearId(id);
      await servicoPedidos.atualizarStatus(id, novoStatus, usuarioId, pedidoEncontrado);

      // Feedback positivo específico para conclusão
      if (novoStatus === StatusPedido.CONCLUIDO) {
        if (pedidoOriginal.status === StatusPedido.ARQUIVADO) {
          toast.success("Projeto restaurado do arquivo! ♻️");
        } else {
          toast.success("Projeto concluído! Estoque, financeiro e métricas atualizados. 🎉");
        }
      }

      if (novoStatus === StatusPedido.ARQUIVADO) {
        toast.success("Projeto enviado para o arquivo. 📦");
      }
    } catch (erro: any) {
      atualizarPedidoNoEstado(id, pedidoOriginal);
      registrar.error({ rastreioId: id, servico: "Projetos", novoStatus }, "Erro ao mover pedido", erro);
      toast.error(erro.mensagem || "Movimentação não permitida.");
    } finally {
      desbloquearId(id);
    }
  };

  const excluirPedido = async (id: string) => {
    if (!usuarioId) return;
    const pedidoOriginal = pedidos.find(p => p.id === id);
    if (!pedidoOriginal) return;

    // ⚡️ OTIMISTA
    removerPedido(id);

    try {
      await servicoPedidos.excluirPedido(id, usuarioId);
      toast.success("Pedido excluído.");
    } catch (erro) {
      // 🔙 ROLLBACK
      if (pedidoOriginal) {
        adicionarPedido(pedidoOriginal);
      }
      registrar.error({ rastreioId: id, servico: "Projetos" }, "Erro ao excluir pedido", erro);
      toast.error("Erro ao excluir pedido. Alteração revertida.");
    }
  };

  const pesquisar = useCallback(
    (termo: string) => {
      definirTermoBusca(termo);
    },
    [definirTermoBusca],
  );

  const pedidosFiltrados = useMemo(() => {
    const busca = termoBusca?.trim().toLowerCase();
    if (!busca) return pedidos;
    
    return pedidos.filter(
      (p) =>
        p.descricao.toLowerCase().includes(busca) ||
        p.nomeCliente?.toLowerCase().includes(busca) ||
        p.idCliente.toLowerCase().includes(busca) ||
        p.id.toLowerCase().includes(busca),
    );
  }, [pedidos, termoBusca]);

  useEffect(() => {
    if (usuarioId && !jaCarregou) {
      carregarPedidos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioId, jaCarregou]);

  return {
    pedidos,
    pedidosFiltrados,
    carregando,
    erro,
    criarPedido,
    atualizarPedido,
    moverPedido,
    excluirPedido,
    pesquisar,
    recarregar: carregarPedidos,
    idsBloqueados,
  };
}
