import { FolderKanban, Plus } from "lucide-react";
import { useState } from "react";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { QuadroKanban } from "./componentes/QuadroKanban";
import { FormularioPedido } from "./componentes/FormularioPedido";
import { ModalArquivoProjetos } from "./componentes/ModalArquivoProjetos";
import { ModalProjetosAtrasados } from "./componentes/ModalProjetosAtrasados";
import { usarPedidos } from "./hooks/usarPedidos";
import { usarArmazemPedidos } from "./estado/armazemPedidos";
import { EstadoVazio } from "@/compartilhado/componentes/EstadoVazio";
import { CriarPedidoInput, Pedido } from "./tipos";
import { ResumoProjetos } from "./componentes/ResumoProjetos";
import { motion, AnimatePresence } from "framer-motion";
import { Carregamento } from "@/compartilhado/componentes/Carregamento";

export function PaginaProjetos() {
  const [modalAberto, setModalAberto] = useState(false);
  const [modalArquivoAberto, setModalArquivoAberto] = useState(false);
  const [modalAtrasadosAberto, setModalAtrasadosAberto] = useState(false);
  const [pedidoEdicao, setPedidoEdicao] = useState<Pedido | null>(null);
  const { pedidos, pedidosFiltrados, criarPedido, atualizarPedido, moverPedido, pesquisar, carregando } = usarPedidos();

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

  return (
    <div className="flex-1 flex flex-col min-h-[60vh]">
      <AnimatePresence mode="wait">
        {carregando && pedidos.length === 0 ? (
          <motion.div
            key="carregando"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center py-40"
          >
            <Carregamento tipo="ponto" mensagem="Organizando fluxo de produção..." />
          </motion.div>
        ) : pedidos.length === 0 ? (
          <motion.div
            key="vazio"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex items-center justify-center"
          >
            <EstadoVazio
              titulo="Nenhum pedido no fluxo"
              descricao="Crie o seu primeiro pedido para iniciar a gestão de produção no Kanban."
              icone={FolderKanban}
              textoBotao="Novo Pedido"
              aoClicarBotao={() => setModalAberto(true)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="conteudo"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex-1 flex flex-col space-y-8 overflow-hidden"
          >
            <ResumoProjetos 
              pedidos={pedidos} 
              aoAbrirArquivo={() => setModalArquivoAberto(true)} 
              aoAbrirAtrasados={() => setModalAtrasadosAberto(true)} 
            />

            <div className="flex-1 min-h-0">
              <QuadroKanban pedidosInjetados={pedidosFiltrados} aoEditar={aoEditar} aoMover={moverPedido} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
