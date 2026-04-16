import { useEffect, useCallback, useMemo } from "react";
import { CriarPedidoInput, AtualizarPedidoInput } from "../tipos";
import { servicoPedidos } from "../servicos/servicoPedidos";
import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { toast } from "react-hot-toast";
import { registrar } from "@/compartilhado/utilitarios/registrador";
import { usarArmazemPedidos } from "../estado/armazemPedidos";
import { servicoManutencao } from "@/compartilhado/servicos/servicoManutencao";

export function usarPedidos() {
  const {
    pedidos,
    carregando,
    termoBusca,
    definirPedidos,
    definirCarregando,
    definirTermoBusca,
    adicionarPedido,
    atualizarPedidoNoEstado,
    removerPedido,
  } = usarArmazemPedidos();

  const carregarPedidos = useCallback(async () => {
    try {
      definirCarregando(true);
      const dados = await servicoPedidos.buscarPedidos();
      definirPedidos(dados);
    } catch (erro) {
      registrar.error({ rastreioId: "sistema", servico: "Projetos" }, "Erro ao carregar pedidos", erro);
      toast.error("Erro ao carregar pedidos.");
    } finally {
      definirCarregando(false);
    }
  }, [definirPedidos, definirCarregando]);

  const criarPedido = async (dados: CriarPedidoInput) => {
    try {
      const novo = await servicoPedidos.criarPedido(dados);
      adicionarPedido(novo);
      toast.success("Pedido criado com sucesso! 🚀");
      return novo;
    } catch (erro) {
      registrar.error({ rastreioId: "sistema", servico: "Projetos" }, "Erro ao criar pedido", erro);
      toast.error("Erro ao criar pedido.");
      throw erro;
    }
  };

  const atualizarPedido = async (dados: AtualizarPedidoInput) => {
    try {
      const atualizado = await servicoPedidos.atualizarPedido(dados);
      atualizarPedidoNoEstado(dados.id, atualizado);
      toast.success("Pedido atualizado!");
      return atualizado;
    } catch (erro: any) {
      registrar.error({ rastreioId: dados.id, servico: "Projetos" }, "Erro ao atualizar pedido", erro);
      toast.error(erro.mensagem || "Erro ao atualizar pedido.");
      throw erro;
    }
  };

  const moverPedido = async (id: string, novoStatus: StatusPedido) => {
    const todosPedidos = usarArmazemPedidos.getState().pedidos;
    const pedidoEncontrado = todosPedidos.find((p) => p.id === id);

    if (!pedidoEncontrado) return;
    if (pedidoEncontrado.status === novoStatus) return;

    const pedidoOriginal = { ...pedidoEncontrado };

    atualizarPedidoNoEstado(id, { status: novoStatus });

    try {
      await servicoPedidos.atualizarStatus(id, novoStatus);

      // Regra Manutenção v9.0: Ao concluir um job, abater tempo no horímetro da máquina
      if (novoStatus === StatusPedido.CONCLUIDO && pedidoEncontrado.idImpressora && pedidoEncontrado.tempoMinutos) {
        servicoManutencao.registrarUsoMaquina(pedidoEncontrado.idImpressora, pedidoEncontrado.tempoMinutos);
      }
    } catch (erro: any) {
      atualizarPedidoNoEstado(id, pedidoOriginal);
      registrar.error({ rastreioId: id, servico: "Projetos", novoStatus }, "Erro ao mover pedido", erro);
      toast.error(erro.mensagem || "Movimentação não permitida.");
    }
  };

  const excluirPedido = async (id: string) => {
    try {
      await servicoPedidos.excluirPedido(id);
      removerPedido(id);
      toast.success("Pedido excluído.");
    } catch (erro) {
      registrar.error({ rastreioId: id, servico: "Projetos" }, "Erro ao excluir pedido", erro);
      toast.error("Erro ao excluir pedido.");
    }
  };

  const pesquisar = useCallback(
    (termo: string) => {
      definirTermoBusca(termo);
    },
    [definirTermoBusca],
  );

  const pedidosFiltrados = useMemo(() => {
    if (!termoBusca) return pedidos;
    const termo = termoBusca.toLowerCase();
    return pedidos.filter(
      (p) =>
        p.descricao.toLowerCase().includes(termo) ||
        p.nomeCliente?.toLowerCase().includes(termo) ||
        p.idCliente.toLowerCase().includes(termo) ||
        p.id.toLowerCase().includes(termo),
    );
  }, [pedidos, termoBusca]);

  useEffect(() => {
    if (pedidos.length === 0) {
      carregarPedidos();
    }
  }, [carregarPedidos, pedidos.length]);

  return {
    pedidos,
    pedidosFiltrados,
    carregando,
    criarPedido,
    atualizarPedido,
    moverPedido,
    excluirPedido,
    pesquisar,
    recarregar: carregarPedidos,
  };
}
