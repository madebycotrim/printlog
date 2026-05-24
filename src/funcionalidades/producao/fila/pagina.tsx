import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Printer, 
  Clock, 
  Calendar as CalendarIcon, 
  Play, 
  Pause, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  AlertCircle,
  MoveRight,
  TrendingUp,
  LayoutGrid,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { useDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { useGerenciadorImpressoras } from "@/funcionalidades/producao/impressoras/hooks/useGerenciadorImpressoras";
import { usePedidos } from "@/funcionalidades/producao/projetos/hooks/usePedidos";
import { Pedido } from "@/funcionalidades/producao/projetos/tipos";
import { centavosParaReais, formatarDataCurta } from "@/compartilhado/utilitarios/formatadores";
import { StatusPedido, StatusImpressora } from "@/compartilhado/tipos/modelos";
import { toast } from "react-hot-toast";

export function PaginaFila() {
  const { estado: { impressoras }, acoes: { salvarImpressora } } = useGerenciadorImpressoras();
  const { pedidos, atualizarPedido } = usePedidos();
  const [dataFiltro, setDataFiltro] = useState(new Date().toISOString().split("T")[0]);

  useDefinirCabecalho({
    titulo: "Fila de Produção",
    subtitulo: "Sequenciamento visual e planejamento de impressões por máquina",
  });

  // Filtra apenas impressoras ativas e não arquivadas (não aposentadas)
  const impressorasAtivas = useMemo(() => {
    return impressoras.filter(imp => !imp.dataAposentadoria);
  }, [impressoras]);

  // Filtra pedidos não concluídos/não arquivados
  const pedidosAtivos = useMemo(() => {
    return pedidos.filter(p => 
      p.status !== StatusPedido.CONCLUIDO && 
      p.status !== StatusPedido.ARQUIVADO
    );
  }, [pedidos]);

  // Pedidos agendados por impressora
  const filaPorImpressora = useMemo(() => {
    const mapa: Record<string, Pedido[]> = {};
    
    // Inicializa arrays para todas as impressoras ativas
    impressorasAtivas.forEach(imp => {
      mapa[imp.id] = [];
    });
    
    // Distribui pedidos agendados
    pedidosAtivos.forEach(p => {
      if (p.idImpressora && mapa[p.idImpressora]) {
        mapa[p.idImpressora].push(p);
      }
    });

    // Ordena fila de cada impressora por data de agendamento ou posição
    Object.keys(mapa).forEach(key => {
      mapa[key].sort((a, b) => {
        if (a.posicaoFila !== undefined && b.posicaoFila !== undefined) {
          return a.posicaoFila - b.posicaoFila;
        }
        if (a.dataInicioAgendada && b.dataInicioAgendada) {
          return new Date(a.dataInicioAgendada).getTime() - new Date(b.dataInicioAgendada).getTime();
        }
        return new Date(a.dataCriacao).getTime() - new Date(b.dataCriacao).getTime();
      });
    });

    return mapa;
  }, [pedidosAtivos, impressorasAtivas]);

  // Pedidos sem impressora ou sem agendamento
  const pedidosPendentes = useMemo(() => {
    return pedidosAtivos.filter(p => !p.idImpressora);
  }, [pedidosAtivos]);

  // Agendar pedido
  const lidarComAgendamento = async (pedidoId: string, impressoraId: string) => {
    try {
      const filaAtual = filaPorImpressora[impressoraId] || [];
      const novaPosicao = filaAtual.length + 1;
      const dataInicio = new Date().toISOString();

      await atualizarPedido({
        id: pedidoId,
        idImpressora: impressoraId,
        posicaoFila: novaPosicao,
        dataInicioAgendada: dataInicio,
        status: StatusPedido.EM_PRODUCAO
      });
      toast.success("Pedido alocado na fila de produção!");
    } catch (e) {
      toast.error("Erro ao alocar pedido.");
    }
  };

  // Remover da fila
  const lidarComRemocaoFila = async (pedidoId: string) => {
    try {
      await atualizarPedido({
        id: pedidoId,
        idImpressora: "null", // Desassocia a impressora
        posicaoFila: undefined,
        dataInicioAgendada: undefined,
        status: StatusPedido.A_FAZER
      });
      toast.success("Pedido removido da fila de produção.");
    } catch (e) {
      toast.error("Erro ao desalocar pedido.");
    }
  };

  // Iniciar/Pausar impressora
  const lidarComPlayPause = async (impressora: any, iniciar: boolean) => {
    try {
      const novaImpressora = {
        ...impressora,
        status: iniciar ? StatusImpressora.IMPRIMINDO : StatusImpressora.LIVRE
      };
      await salvarImpressora(novaImpressora);
      toast.success(iniciar ? "Impressão iniciada!" : "Impressão pausada.");
    } catch (e) {
      toast.error("Erro ao alterar estado da impressora.");
    }
  };

  // Concluir impressão e liberar impressora
  const lidarComConclusao = async (pedido: Pedido, impressora: any) => {
    try {
      await atualizarPedido({
        id: pedido.id,
        status: StatusPedido.CONCLUIDO,
        dataConclusao: new Date().toISOString()
      });

      const novaImpressora = {
        ...impressora,
        status: StatusImpressora.LIVRE
      };
      await salvarImpressora(novaImpressora);

      toast.success("Projeto concluído! Impressora liberada.");
    } catch (e) {
      toast.error("Erro ao concluir projeto.");
    }
  };

  // Reordenar a fila
  const lidarComReordenacao = async (impressoraId: string, indexOriginal: number, direcao: 'subir' | 'descer') => {
    const fila = filaPorImpressora[impressoraId] || [];
    const indexDestino = direcao === 'subir' ? indexOriginal - 1 : indexOriginal + 1;
    
    if (indexDestino < 0 || indexDestino >= fila.length) return;

    try {
      const itemOriginal = fila[indexOriginal];
      const itemDestino = fila[indexDestino];

      await Promise.all([
        atualizarPedido({
          id: itemOriginal.id,
          posicaoFila: indexDestino + 1
        }),
        atualizarPedido({
          id: itemDestino.id,
          posicaoFila: indexOriginal + 1
        })
      ]);

      toast.success("Fila de produção reordenada!");
    } catch (e) {
      toast.error("Erro ao reordenar a fila.");
    }
  };

  return (
    <div className="space-y-10 min-h-[70vh]">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Painel Lateral: Pedidos a Alocar */}
        <div className="xl:col-span-1 space-y-6 bg-card border border-borda-sutil rounded-[2rem] p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <LayoutGrid size={16} className="text-primaria" />
            <h3 className="text-xs font-black uppercase tracking-widest text-primary dark:text-white">
              Backlog de Projetos
            </h3>
            <span className="ml-auto bg-primaria/10 text-primaria text-[10px] font-black px-2 py-0.5 rounded-full">
              {pedidosPendentes.length}
            </span>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {pedidosPendentes.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 dark:text-zinc-600 text-xs">
                Nenhum projeto pendente de alocação.
              </div>
            ) : (
              pedidosPendentes.map(pedido => (
                <motion.div
                  key={pedido.id}
                  layoutId={`pedido-${pedido.id}`}
                  className="p-4 rounded-xl border border-borda-sutil bg-zinc-50/50 dark:bg-white/[0.01] hover:border-zinc-300 dark:hover:border-white/10 transition-all space-y-3"
                >
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">
                      {pedido.material || "Filamento"}
                    </span>
                    <h4 className="text-xs font-bold text-primary dark:text-zinc-200 line-clamp-1">
                      {pedido.descricao}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500">
                    <span className="font-bold tabular-nums">
                      {centavosParaReais(pedido.valorCentavos)}
                    </span>
                    {pedido.tempoMinutos && (
                      <span className="flex items-center gap-1 font-semibold">
                        <Clock size={10} />
                        {pedido.tempoMinutos}m
                      </span>
                    )}
                  </div>

                  {impressorasAtivas.length > 0 && (
                    <div className="pt-2 border-t border-borda-sutil/60 space-y-1.5">
                      <span className="text-[8px] font-black uppercase text-zinc-400 block">Alocar em:</span>
                      <div className="grid grid-cols-2 gap-1">
                        {impressorasAtivas.map(imp => (
                          <button
                            key={imp.id}
                            onClick={() => lidarComAgendamento(pedido.id, imp.id)}
                            className="px-2 py-1 text-left text-[9px] font-bold border border-borda-sutil hover:border-primaria rounded bg-white dark:bg-zinc-900 truncate text-zinc-600 dark:text-zinc-400 hover:text-primaria transition-colors cursor-pointer"
                          >
                            {imp.nome}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Fila Gantt Principal */}
        <div className="xl:col-span-3 space-y-6">
          {impressorasAtivas.length === 0 ? (
            <div className="border border-dashed border-borda-sutil rounded-[2rem] p-16 text-center text-zinc-400 dark:text-zinc-600 text-sm">
              Cadastre impressoras no menu de Produção para gerenciar a fila.
            </div>
          ) : (
            <div className="space-y-6">
              {impressorasAtivas.map(impressora => {
                const fila = filaPorImpressora[impressora.id] || [];
                return (
                  <div 
                    key={impressora.id} 
                    className="bg-card border border-borda-sutil rounded-[2rem] p-6 shadow-sm hover:shadow-premium transition-all duration-300 space-y-6"
                  >
                    {/* Cabeçalho da Impressora */}
                    <div className="flex items-center justify-between pb-4 border-b border-borda-sutil">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-100 dark:bg-white/5 rounded-xl text-zinc-600 dark:text-zinc-400">
                          <Printer size={20} />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-primary dark:text-white uppercase tracking-wider">
                            {impressora.nome}
                          </h3>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {impressora.marca} {impressora.modeloBase} • {impressora.tecnologia}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          impressora.status === StatusImpressora.IMPRIMINDO
                            ? "bg-amber-500/10 text-amber-500" 
                            : impressora.status === StatusImpressora.MANUTENCAO
                              ? "bg-rose-500/10 text-rose-500"
                              : "bg-emerald-500/10 text-emerald-500"
                        }`}>
                          {impressora.status === StatusImpressora.IMPRIMINDO 
                            ? "Imprimindo" 
                            : impressora.status === StatusImpressora.MANUTENCAO 
                              ? "Manutenção" 
                              : "Livre"}
                        </span>
                      </div>
                    </div>

                    {/* Timeline Horizontal / Fila */}
                    <div className="relative">
                      {fila.length === 0 ? (
                        <div className="py-8 text-center text-zinc-400 dark:text-zinc-600 text-xs">
                          Fila vazia. Arraste ou aloque um projeto do backlog.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          <AnimatePresence>
                            {fila.map((pedido, index) => (
                              <motion.div
                                key={pedido.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="p-4 rounded-xl border border-borda-sutil bg-zinc-50/50 dark:bg-white/[0.01] hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-all relative flex flex-col justify-between"
                              >
                                {/* Indicador de Ordem na Fila e controles de reordenação */}
                                <div className="absolute top-2 right-2 flex items-center gap-1">
                                  {index > 0 && (
                                    <button
                                      onClick={() => lidarComReordenacao(impressora.id, index, 'subir')}
                                      className="p-0.5 rounded text-zinc-400 hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                                      title="Mover para cima"
                                    >
                                      <ChevronUp size={12} />
                                    </button>
                                  )}
                                  {index < fila.length - 1 && (
                                    <button
                                      onClick={() => lidarComReordenacao(impressora.id, index, 'descer')}
                                      className="p-0.5 rounded text-zinc-400 hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                                      title="Mover para baixo"
                                    >
                                      <ChevronDown size={12} />
                                    </button>
                                  )}
                                  <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-white/10 flex items-center justify-center text-[9px] font-black text-zinc-500 dark:text-zinc-400 shrink-0">
                                    #{index + 1}
                                  </div>
                                </div>

                                <div className="space-y-2 pr-6">
                                  <span className="text-[7px] font-black uppercase tracking-widest text-zinc-400 block">
                                    {pedido.material || "PLA"}
                                  </span>
                                  <h4 className="text-xs font-bold text-primary dark:text-zinc-200 line-clamp-1">
                                    {pedido.descricao}
                                  </h4>
                                  {pedido.dataInicioAgendada && (
                                    <div className="flex items-center gap-1 text-[9px] text-zinc-400">
                                      <CalendarIcon size={10} />
                                      <span>Início: {formatarDataCurta(new Date(pedido.dataInicioAgendada))}</span>
                                    </div>
                                  )}
                                </div>

                                <div className="mt-4 pt-3 border-t border-borda-sutil/60 flex items-center justify-between gap-2">
                                  <span className="text-[10px] font-black text-primaria tabular-nums">
                                    {pedido.tempoMinutos ? `${pedido.tempoMinutos} min` : "Tempo N/D"}
                                  </span>
                                  
                                  <div className="flex items-center gap-1">
                                    {index === 0 && (
                                      <>
                                        {impressora.status === StatusImpressora.IMPRIMINDO ? (
                                          <>
                                            <button
                                              onClick={() => lidarComPlayPause(impressora, false)}
                                              className="p-1 rounded text-amber-500 hover:bg-amber-500/10 transition-all cursor-pointer flex items-center justify-center"
                                              title="Pausar Impressão"
                                            >
                                              <Pause size={12} />
                                            </button>
                                            <button
                                              onClick={() => lidarComConclusao(pedido, impressora)}
                                              className="p-1 rounded text-emerald-500 hover:bg-emerald-500/10 transition-all cursor-pointer flex items-center justify-center"
                                              title="Concluir Projeto & Liberar"
                                            >
                                              <CheckCircle2 size={12} />
                                            </button>
                                          </>
                                        ) : (
                                          <button
                                            onClick={() => lidarComPlayPause(impressora, true)}
                                            className="p-1 rounded text-emerald-500 hover:bg-emerald-500/10 transition-all cursor-pointer flex items-center justify-center"
                                            title="Iniciar Impressão"
                                          >
                                            <Play size={12} />
                                          </button>
                                        )}
                                      </>
                                    )}

                                    {/* Só exibe botão de remover se não estiver imprimindo no momento */}
                                    {(!(index === 0 && impressora.status === StatusImpressora.IMPRIMINDO)) && (
                                      <button
                                        onClick={() => lidarComRemocaoFila(pedido.id)}
                                        className="p-1 rounded text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                                        title="Remover da fila"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
