import { FolderKanban, Plus, Archive } from "lucide-react";
import { useState } from "react";
import { useDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { QuadroKanban } from "./componentes/QuadroKanban";
import { ModalArquivoProjetos } from "./componentes/ModalArquivoProjetos";
import { ModalProjetosAtrasados } from "./componentes/ModalProjetosAtrasados";
import { usePedidos } from "./hooks/usePedidos";
import { EstadoVazio } from "@/compartilhado/componentes";
import { ResumoProjetos } from "./componentes/ResumoProjetos";
import { motion, AnimatePresence } from "framer-motion";
import { BannerErro } from "@/compartilhado/componentes/ui";
import { useNavigate } from "react-router-dom";
import { FormularioPedido } from "./componentes/FormularioPedido";
import { Pedido } from "./tipos";
import { StatusPedido } from "@/compartilhado/tipos/modelos";


export function PaginaProjetos() {
  const navigate = useNavigate();
  const [modalArquivoAberto, setModalArquivoAberto] = useState(false);
  const [modalAtrasadosAberto, setModalAtrasadosAberto] = useState(false);
  const [pedidoEdicao, setPedidoEdicao] = useState<Pedido | null>(null);
  const { pedidos, pedidosFiltrados, moverPedido, pesquisar, carregando, atualizarPedido, erro, recarregar } = usePedidos();



  useDefinirCabecalho({
    titulo: "Fluxo de Produção",
    subtitulo: "Gerencie seus pedidos no Kanban",
    placeholderBusca: "BUSCAR PEDIDO...",
    aoBuscar: pesquisar,
    acao: {
      texto: "Novo Pedido",
      icone: Plus,
      aoClicar: () => {
        navigate("/calculadora");
      },
    },
  });

  const abrirFormularioEdicao = (id: string) => {
    const pedido = pedidos.find(p => p.id === id);
    if (pedido) setPedidoEdicao(pedido);
  };

  if (erro) {
    return (
      <BannerErro 
        titulo="Falha ao carregar projetos" 
        aoTentarNovamente={() => recarregar(true)} 
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col space-y-10">
      <AnimatePresence mode="wait">
        {carregando ? null : pedidos.length === 0 ? (
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
              aoClicarBotao={() => navigate("/calculadora")}
            />
          </motion.div>
        ) : pedidos.length > 0 && pedidos.every(p => p.status === StatusPedido.ARQUIVADO) ? (
          <motion.div
            key="apenas-arquivados"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col space-y-8"
          >
            <ResumoProjetos 
              pedidos={pedidos} 
              aoAbrirArquivo={() => setModalArquivoAberto(true)} 
              aoAbrirAtrasados={() => setModalAtrasadosAberto(true)} 
            />
            
            <div className="flex-1 flex items-center justify-center py-10">
              <EstadoVazio
                titulo="Fluxo de produção limpo"
                descricao="Você não tem pedidos ativos no momento, mas seu histórico está salvo no arquivo."
                icone={Archive}
                textoBotao="Ver Projetos Arquivados"
                aoClicarBotao={() => setModalArquivoAberto(true)}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="conteudo"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="flex-1 flex flex-col space-y-8 overflow-hidden"
          >
            <ResumoProjetos 
              pedidos={pedidos} 
              aoAbrirArquivo={() => setModalArquivoAberto(true)} 
              aoAbrirAtrasados={() => setModalAtrasadosAberto(true)} 
            />

            <div className="flex-1 min-h-0">
              <QuadroKanban pedidosInjetados={pedidosFiltrados} abrirFormularioEdicao={abrirFormularioEdicao} aoMover={moverPedido} />
            </div>

            {pedidos.some(p => p.status === StatusPedido.ARQUIVADO) && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto"
              >
                <button 
                  onClick={() => setModalArquivoAberto(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:bg-zinc-200 dark:hover:bg-white/10 transition-all group"
                >
                  <Archive size={14} className="text-zinc-500 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Você possui {pedidos.filter(p => p.status === StatusPedido.ARQUIVADO).length} projetos no arquivo
                  </span>
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <ModalArquivoProjetos
        aberto={modalArquivoAberto}
        aoFechar={() => setModalArquivoAberto(false)}
        pedidos={pedidos}
        abrirFormularioEdicao={abrirFormularioEdicao}
      />

      <ModalProjetosAtrasados
        aberto={modalAtrasadosAberto}
        aoFechar={() => setModalAtrasadosAberto(false)}
        pedidos={pedidos}
        abrirFormularioEdicao={abrirFormularioEdicao}
      />

      <FormularioPedido
        aberto={!!pedidoEdicao}
        pedidoEdicao={pedidoEdicao}
        aoCancelar={() => setPedidoEdicao(null)}
        aoSalvar={async (dados) => {
          if (pedidoEdicao) {
            await atualizarPedido({ ...dados, id: pedidoEdicao.id });
            setPedidoEdicao(null);
          }
        }}
      />
    </div>
  );
}
