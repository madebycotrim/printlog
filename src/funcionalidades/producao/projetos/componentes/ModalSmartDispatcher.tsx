import { useMemo, useState } from "react";
import { Dialogo } from "@/compartilhado/componentes/ui";
import { 
  Bot, 
  Sparkles, 
  Clock, 
  Layers, 
  Printer, 
  Zap, 
  AlertCircle,
  Calendar
} from "lucide-react";
import { Pedido } from "../tipos";
import { Impressora } from "@/funcionalidades/producao/impressoras/tipos";
import { servicoSmartDispatcher, ResultadoSmartDispatcher } from "../servicos/servicoSmartDispatcher";
import { formatarDataCurta } from "@/compartilhado/utilitarios/formatadores";
import { toast } from "sonner";

interface Props {
  aberto: boolean;
  aoFechar: () => void;
  pedidos: Pedido[];
  impressoras: Impressora[];
  aoAplicarAlocacao: (atualizacoes: Array<{ id: string; idImpressora: string; posicaoFila: number }>) => Promise<void>;
}

export function ModalSmartDispatcher({
  aberto,
  aoFechar,
  pedidos,
  impressoras,
  aoAplicarAlocacao
}: Props) {
  const [salvando, setSalvando] = useState(false);

  // Executa o motor de despacho
  const resultado: ResultadoSmartDispatcher = useMemo(() => {
    return servicoSmartDispatcher.otimizarFila(pedidos, impressoras);
  }, [pedidos, impressoras]);

  if (!aberto) return null;

  const lidarComAplicacao = async () => {
    setSalvando(true);
    try {
      const atualizacoes: Array<{ id: string; idImpressora: string; posicaoFila: number }> = [];

      resultado.alocacoesPorImpressora.forEach(aloc => {
        aloc.pedidos.forEach(item => {
          atualizacoes.push({
            id: item.pedido.id,
            idImpressora: aloc.impressora.id,
            posicaoFila: item.posicaoFila
          });
        });
      });

      if (atualizacoes.length === 0) {
        toast.info("Nenhum pedido pendente para alocar.");
        aoFechar();
        return;
      }

      await aoAplicarAlocacao(atualizacoes);
      toast.success(`Fila otimizada com sucesso! ${atualizacoes.length} pedido(s) distribuídos com inteligência.`);
      aoFechar();
    } catch {
      toast.error("Erro ao aplicar alocação inteligente.");
    } finally {
      setSalvando(false);
    }
  };

  const formatarHoras = (minutos: number) => {
    const h = Math.floor(minutos / 60);
    const m = Math.round(minutos % 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Smart Dispatcher — Alocador Inteligente de Fila"
      subtitulo="Distribuição otimizada por compatibilidade de material, cor e prazos de entrega"
      icone={Bot}
      larguraMax="max-w-3xl"
    >
      <div className="p-5 flex flex-col gap-4.5">
        {/* Banner de Impacto e Economia */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500 text-white shrink-0">
              <Zap size={18} />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                Trocas Evitadas
              </span>
              <span className="text-lg font-black text-zinc-800 dark:text-zinc-100">
                {resultado.trocasEconomizadas} troca(s) de carretel
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500 text-white shrink-0">
              <Clock size={18} />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                Tempo Poupado
              </span>
              <span className="text-lg font-black text-zinc-800 dark:text-zinc-100">
                ~{resultado.tempoEconomizadoMinutos} min de setup
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-500/10 dark:bg-sky-500/15 border border-sky-500/20 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500 text-white shrink-0">
              <Layers size={18} />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400 block">
                Pedidos Sequenciados
              </span>
              <span className="text-lg font-black text-zinc-800 dark:text-zinc-100">
                {resultado.totalPedidosAlocados} em {resultado.alocacoesPorImpressora.length} máquina(s)
              </span>
            </div>
          </div>
        </div>

        {/* Alerta de pedidos sem impressora compatível (se houver) */}
        {resultado.pedidosNaoAlocados.length > 0 && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5 text-amber-700 dark:text-amber-300 text-xs">
            <AlertCircle size={16} className="shrink-0 text-amber-500" />
            <span>
              <strong>{resultado.pedidosNaoAlocados.length} pedido(s)</strong> não possuem impressora compatível ativa (ex: peças de resina sem máquina SLA ativa).
            </span>
          </div>
        )}

        {/* Grid de Alocação por Impressora */}
        <div className="flex flex-col gap-3 max-h-96 overflow-y-auto custom-scrollbar pr-1">
          {resultado.alocacoesPorImpressora.map(({ impressora, pedidos: itens, tempoTotalMinutos }) => (
            <div
              key={impressora.id}
              className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/70 border border-borda-sutil flex flex-col gap-3"
            >
              {/* Cabeçalho da Impressora */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500 shrink-0">
                    <Printer size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-100">
                        {impressora.nome}
                      </h4>
                      <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                        {impressora.tecnologia}
                      </span>
                    </div>
                    <span className="text-[9.5px] font-bold text-zinc-400">
                      {impressora.marca || "Oficina Maker"} • {itens.length} peça(s) programada(s)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Carga Total
                  </span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    {formatarHoras(tempoTotalMinutos)}
                  </span>
                </div>
              </div>

              {/* Fila de Peças da Máquina */}
              {itens.length === 0 ? (
                <div className="py-4 text-center text-[10px] text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                  Nenhum pedido direcionado para esta máquina no lote atual.
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {itens.map(({ pedido, posicaoFila, motivo }) => (
                    <div
                      key={pedido.id}
                      className="p-2.5 rounded-xl bg-white dark:bg-black/30 border border-borda-sutil flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 text-[10px] font-black flex items-center justify-center shrink-0">
                          #{posicaoFila}
                        </span>

                        <div className="min-w-0">
                          <span className="font-bold text-zinc-800 dark:text-zinc-100 truncate block">
                            {pedido.descricao}
                          </span>
                          <span className="text-[9px] text-zinc-400 block truncate">
                            {motivo}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {pedido.material && (
                          <span className="text-[8.5px] font-black px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                            {pedido.material}
                          </span>
                        )}

                        <div className="text-right">
                          <span className="text-[10px] font-black text-zinc-700 dark:text-zinc-200 block">
                            {formatarHoras(pedido.tempoMinutos || 60)}
                          </span>
                          {pedido.prazoEntrega && (
                            <span className="text-[8.5px] text-zinc-400 flex items-center gap-1">
                              <Calendar size={9} />
                              {formatarDataCurta(new Date(pedido.prazoEntrega))}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-2.5 mt-2">
          <button
            type="button"
            disabled={salvando || resultado.totalPedidosAlocados === 0}
            onClick={lidarComAplicacao}
            className="flex-1 h-11 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-[10px] font-black uppercase tracking-widest shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
          >
            <Sparkles size={14} />
            <span>
              {salvando ? "Aplicando..." : `Aplicar Alocação (${resultado.totalPedidosAlocados} pedidos)`}
            </span>
          </button>

          <button
            type="button"
            onClick={aoFechar}
            className="h-11 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Dialogo>
  );
}
