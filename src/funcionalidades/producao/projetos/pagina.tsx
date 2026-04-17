import { FolderKanban, Plus, Archive } from "lucide-react";
import { useState } from "react";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { QuadroKanban } from "./componentes/QuadroKanban";
import { FormularioPedido } from "./componentes/FormularioPedido";
import { ModalArquivoProjetos } from "./componentes/ModalArquivoProjetos";
import { ModalProjetosAtrasados } from "./componentes/ModalProjetosAtrasados";
import { usarPedidos } from "./hooks/usarPedidos";
import { EstadoVazio } from "@/compartilhado/componentes/EstadoVazio";
import { CriarPedidoInput, Pedido } from "./tipos";
import { filtrarPedidosAtrasados } from "@/compartilhado/utilitarios/gestaoAtrasos";
import { AlertTriangle } from "lucide-react";
import { CardResumo } from "@/compartilhado/componentes/CardResumo";

export function PaginaProjetos() {
  const [modalAberto, setModalAberto] = useState(false);
  const [modalArquivoAberto, setModalArquivoAberto] = useState(false);
  const [modalAtrasadosAberto, setModalAtrasadosAberto] = useState(false);
  const [pedidoEdicao, setPedidoEdicao] = useState<Pedido | null>(null);
  const { pedidos, pedidosFiltrados, criarPedido, atualizarPedido, moverPedido, pesquisar, carregando } = usarPedidos();

  const pedidosArquivadosTotal = pedidos.filter((p) => p.status === StatusPedido.ARQUIVADO).length;

  usarDefinirCabecalho({
    titulo: "Fluxo de Produção",
    subtitulo: "Gerencie seus pedidos no Kanban",
    placeholderBusca: "BUSCAR PEDIDO...",
    aoBuscar: pesquisar,
    acao: {
      texto: "Novo Pedido",
      icone: Plus,
      aoClicar: () => {
        setPedidoEdicao(null);
        setModalAberto(true);
      },
    },
  });

  const aoSalvar = async (dados: CriarPedidoInput) => {
    if (pedidoEdicao) {
      await atualizarPedido({ ...dados, id: pedidoEdicao.id });
    } else {
      await criarPedido(dados);
    }
    setModalAberto(false);
    setPedidoEdicao(null);
  };

  const aoEditar = (id: string) => {
    const pedido = pedidos.find((p) => p.id === id);
    if (pedido) {
      setPedidoEdicao(pedido);
      setModalAberto(true);
    }
  };

  const pedidosAtivos = pedidos.filter(
    (p) => p.status !== StatusPedido.CONCLUIDO && p.status !== StatusPedido.ARQUIVADO,
  ).length;
  const pedidosAtrasados = filtrarPedidosAtrasados(pedidos).length;
  const concluidosHoje = pedidos.filter(
    (p) =>
      p.status === StatusPedido.CONCLUIDO &&
      p.dataConclusao &&
      new Date(p.dataConclusao).toDateString() === new Date().toDateString(),
  ).length;

  const cards = [
    {
      titulo: "Pedidos Ativos",
      valor: pedidosAtivos,
      unidade: "em fluxo",
      icone: FolderKanban,
      cor: "indigo" as const,
    },
    {
      titulo: "Atrasados",
      valor: pedidosAtrasados,
      unidade: "atenção",
      icone: AlertTriangle,
      cor: "rose" as const,
      aoClicar: () => setModalAtrasadosAberto(true),
      textoAcao: "Resolver",
    },
    {
      titulo: "Concluídos Hoje",
      valor: concluidosHoje,
      unidade: "entregues",
      icone: Plus,
      cor: "emerald" as const,
    },
  ];

  return (
    <div className="flex-1 flex flex-col space-y-8 animate-in fade-in duration-500 overflow-hidden">
      {pedidos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 shrink-0">
          {cards.map((card, index) => (
            <CardResumo key={index} {...card} />
          ))}

          <CardResumo
            titulo="Projetos Arquivados"
            valor={pedidosArquivadosTotal}
            unidade="no arquivo"
            icone={Archive}
            cor="zinc"
            aoClicar={() => setModalArquivoAberto(true)}
            textoAcao="Ver tudo"
          />
        </div>
      )}

      {pedidos.length === 0 && !carregando ? (
        <div className="flex-1 flex items-center justify-center">
          <EstadoVazio
            titulo="Nenhum pedido no fluxo"
            descricao="Crie o seu primeiro pedido para iniciar a gestão de produção no Kanban."
            icone={FolderKanban}
            textoBotao="Novo Pedido"
            aoClicarBotao={() => setModalAberto(true)}
          />
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <QuadroKanban pedidosInjetados={pedidosFiltrados} aoEditar={aoEditar} aoMover={moverPedido} />
        </div>
      )}

      <FormularioPedido
        aberto={modalAberto}
        pedidoEdicao={pedidoEdicao}
        aoSalvar={aoSalvar}
        aoCancelar={() => {
          setModalAberto(false);
          setPedidoEdicao(null);
        }}
      />

      <ModalArquivoProjetos
        aberto={modalArquivoAberto}
        aoFechar={() => setModalArquivoAberto(false)}
        pedidos={pedidos}
        aoEditar={aoEditar}
      />

      <ModalProjetosAtrasados
        aberto={modalAtrasadosAberto}
        aoFechar={() => setModalAtrasadosAberto(false)}
        pedidos={pedidos}
        aoEditar={aoEditar}
      />
    </div>
  );
}
