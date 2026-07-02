import { usePedidos } from "../projetos/hooks/usePedidos";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  CheckCircle2, 
  Clock, 
  PlayCircle, 
  AlertCircle, 
  Archive, 
  Package, 
  CalendarClock,
  History
} from "lucide-react";
import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { motion, AnimatePresence } from "framer-motion";
import { useDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";

export function PaginaLinhaDoTempo() {
  useDefinirCabecalho({
    titulo: "Histórico de Produção",
    subtitulo: "Linha do tempo completa de todos os pedidos já registrados",
    ocultarBusca: true,
  });
  const { pedidos } = usePedidos();



  // Ordena do mais recente para o mais antigo
  const pedidosOrdenados = [...pedidos].sort((a, b) => {
    return new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime();
  });

  const obterConfigStatus = (status: StatusPedido) => {
    switch (status) {
      case StatusPedido.CONCLUIDO:
        return { icone: CheckCircle2, cor: "text-emerald-500", bg: "bg-emerald-500/10", label: "Concluído" };
      case StatusPedido.EM_PRODUCAO:
        return { icone: PlayCircle, cor: "text-sky-500", bg: "bg-sky-500/10", label: "Em Produção" };
      case StatusPedido.ACABAMENTO:
        return { icone: Package, cor: "text-amber-500", bg: "bg-amber-500/10", label: "Acabamento" };
      case StatusPedido.A_FAZER:
        return { icone: Clock, cor: "text-zinc-500", bg: "bg-zinc-500/10", label: "Na Fila" };
      case StatusPedido.ATRASADO:
        return { icone: AlertCircle, cor: "text-rose-500", bg: "bg-rose-500/10", label: "Atrasado" };
      case StatusPedido.ARQUIVADO:
        return { icone: Archive, cor: "text-zinc-400", bg: "bg-zinc-100 dark:bg-white/5", label: "Arquivado/Cancelado" };
      default:
        return { icone: Clock, cor: "text-zinc-500", bg: "bg-zinc-500/10", label: "Desconhecido" };
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <AnimatePresence mode="wait">
          <motion.div
            key="conteudo"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="flex-1 overflow-y-auto pr-4 pb-20 custom-scrollbar"
          >
            <div className="max-w-4xl mx-auto space-y-8 py-4">
              
              <div className="flex items-center justify-end mb-4">
                <div className="flex items-center gap-2 bg-zinc-100 dark:bg-white/5 px-4 py-2 rounded-xl">
                  <CalendarClock size={16} className="text-zinc-500" />
                  <span className="text-xs font-semibold text-zinc-500">{pedidosOrdenados.length} Registros</span>
                </div>
              </div>

              {pedidosOrdenados.length === 0 ? (
                <div className="text-center py-20 bg-zinc-50 dark:bg-white/[0.02] rounded-3xl border border-zinc-100 dark:border-white/5">
                  <History size={48} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
                  <h3 className="text-lg font-bold text-zinc-400">Nenhum registro encontrado</h3>
                  <p className="text-sm text-zinc-500 mt-2">A linha do tempo está vazia.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-zinc-200 dark:border-white/10 ml-4 md:ml-6 space-y-8">
                  {pedidosOrdenados.map((pedido, index) => {
                    const config = obterConfigStatus(pedido.status);
                    const Icone = config.icone;

                    return (
                      <motion.div 
                        key={pedido.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(index * 0.05, 0.5) }}
                        className="relative pl-8 md:pl-10 group"
                      >
                        {/* Ponto na timeline */}
                        <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full ${config.bg} ${config.cor} border-4 border-white dark:border-[#0e0e11] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                          <Icone size={14} />
                        </div>

                        {/* Card do pedido */}
                        <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/10 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            
                            <div>
                              <div className="flex items-center gap-3 mb-1.5">
                                <span className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${config.bg} ${config.cor}`}>
                                  {config.label}
                                </span>
                                <span className="text-[11px] font-medium text-zinc-500 flex items-center gap-1">
                                  <CalendarClock size={12} />
                                  {format(pedido.dataCriacao, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 leading-tight">
                                {pedido.descricao}
                              </h4>
                              <div className="text-xs font-medium text-zinc-500 mt-1 flex items-center gap-4">
                                <span>Cliente: <strong className="text-zinc-700 dark:text-zinc-300">{pedido.nomeCliente || "Não informado"}</strong></span>
                                
                                {(pedido.pesoGramas || pedido.tempoMinutos) && (
                                  <span className="flex items-center gap-2">
                                    {pedido.pesoGramas && <span>{pedido.pesoGramas}g</span>}
                                    {pedido.pesoGramas && pedido.tempoMinutos && <span>•</span>}
                                    {pedido.tempoMinutos && <span>{pedido.tempoMinutos}min</span>}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 border-zinc-100 dark:border-white/5 pt-3 md:pt-0">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 md:mb-1">Valor Total</span>
                              <span className="text-base font-bold text-emerald-500">
                                {centavosParaReais(pedido.valorCentavos)}
                              </span>
                            </div>

                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

      </AnimatePresence>
    </div>
  );
}
