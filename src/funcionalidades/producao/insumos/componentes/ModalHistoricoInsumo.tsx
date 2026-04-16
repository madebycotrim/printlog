import { useState, useMemo } from "react";
import { History, DollarSign, Package, Box } from "lucide-react";
import { ModalListagemPremium } from "@/compartilhado/componentes/ModalListagemPremium";
import { Insumo, RegistroMovimentacaoInsumo } from "@/funcionalidades/producao/insumos/tipos";

interface ModalHistoricoInsumoProps {
  aberto: boolean;
  aoFechar: () => void;
  insumo: Insumo | null;
}

export function ModalHistoricoInsumo({ aberto, aoFechar, insumo }: ModalHistoricoInsumoProps) {
  const [busca, setBusca] = useState("");

  const registrosRaw = useMemo(() => insumo?.historico || [], [insumo]);

  const registrosFiltrados = useMemo(() => {
    if (!busca) return registrosRaw;
    const termo = busca.toLowerCase();
    return registrosRaw.filter(
      (r) => (r.motivo || "").toLowerCase().includes(termo) || (r.observacao || "").toLowerCase().includes(termo),
    );
  }, [registrosRaw, busca]);

  if (!insumo) return null;

  const totalSaidas = registrosRaw.filter((r) => r.tipo === "Saída").reduce((acc, r) => acc + r.quantidade, 0);

  const valorTotalEntradas = registrosRaw
    .filter((r) => r.tipo === "Entrada" && r.valorTotal)
    .reduce((acc, r) => acc + (r.valorTotal || 0), 0);

  const formatarData = (dataISO: string) => {
    return new Date(dataISO).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ModalListagemPremium
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Histórico de Movimentações"
      iconeTitulo={History}
      corDestaque="amber"
      termoBusca={busca}
      aoMudarBusca={setBusca}
      placeholderBusca="BUSCAR POR MOTIVO OU OBSERVAÇÃO..."
      temResultados={registrosFiltrados.length > 0}
      totalResultados={registrosFiltrados.length}
      iconeVazio={Package}
      mensagemVazio="Nenhuma movimentação de insumo encontrada para esta busca."
      infoRodape="Movimentações registradas conforme auditoria de estoque em tempo real."
    >
      <div className="space-y-10">
        {/* ═══════ CABEÇALHO DO INSUMO & DASHBOARD ═══════ */}
        <div className="bg-gray-50/50 dark:bg-white/[0.02] p-8 rounded-3xl border border-gray-100 dark:border-white/5 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.07] pointer-events-none">
            <Box size={140} strokeWidth={1} />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 flex items-center justify-center shrink-0 shadow-xl shadow-black/5">
              <Box size={32} strokeWidth={1.5} className="text-gray-400 dark:text-zinc-500" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white truncate tracking-tight uppercase mb-1">
                {insumo.nome}
              </h3>
              <p className="text-xs font-bold text-gray-500 dark:text-zinc-500 truncate tracking-wide uppercase">
                {insumo.categoria} {insumo.marca ? `• ${insumo.marca}` : ""}
              </p>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] block mb-1">
                Custo Médio
              </span>
              <div className="bg-white dark:bg-black/40 px-3 py-1 rounded-lg border border-gray-200 dark:border-white/10 shadow-sm">
                <span className="text-sm font-black text-gray-900 dark:text-white tracking-tight">
                  {insumo.custoMedioUnidade.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  <small className="text-[10px] text-gray-400 dark:text-zinc-600 ml-1">
                    /{insumo.unidadeMedida.toUpperCase()}
                  </small>
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
            <div className="bg-white dark:bg-black/40 border border-gray-200 dark:border-white/5 p-5 rounded-2xl flex items-center gap-4 shadow-sm group hover:border-gray-300 dark:hover:border-white/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <Package size={22} strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] block mb-0.5">
                  Consumo Total
                </span>
                <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  {totalSaidas}{" "}
                  <small className="text-xs text-gray-400 dark:text-zinc-600 font-bold uppercase ml-1">
                    {insumo.unidadeMedida}
                  </small>
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-black/40 border border-gray-200 dark:border-white/5 p-5 rounded-2xl flex items-center gap-4 shadow-sm group hover:border-gray-300 dark:hover:border-white/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <DollarSign size={22} strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] block mb-0.5">
                  Valor Investido
                </span>
                <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  {valorTotalEntradas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ LISTA DE MOVIMENTAÇÕES (TIMELINE) ═══════ */}
        <div className="space-y-6 flex flex-col px-2">
          {registrosFiltrados.map((registro: RegistroMovimentacaoInsumo) => {
            const ehEntrada = registro.tipo === "Entrada";
            return (
              <div
                key={registro.id}
                className="relative pl-10 before:absolute before:left-[11px] before:top-8 before:bottom-[-24px] before:w-[2px] before:bg-gray-100 dark:before:bg-white/5 last:before:hidden group"
              >
                {/* Marcador de Tipo */}
                <div
                  className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-white dark:border-[#18181b] flex items-center justify-center transition-all duration-300 z-10
                                    shadow-[0_0_15px_rgba(0,0,0,0.1)] group-hover:scale-110
                                    ${ehEntrada ? "bg-emerald-500 shadow-emerald-500/20" : "bg-amber-500 shadow-amber-500/20"}`}
                >
                  <div className="w-1 h-1 rounded-full bg-white" />
                </div>

                <div className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-2xl p-6 transition-all group-hover:bg-gray-50 dark:group-hover:bg-white/5 group-hover:-translate-y-1 shadow-sm hover:shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest border
                                                    ${
                                                      ehEntrada
                                                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                                                        : "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400"
                                                    }`}
                        >
                          {ehEntrada ? "Entrada" : "Saída"}
                        </span>
                        {registro.motivo && (
                          <h5 className="text-sm font-black text-gray-900 dark:text-white truncate tracking-tight uppercase">
                            {registro.motivo}
                          </h5>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 dark:text-zinc-500">
                        <History size={12} strokeWidth={2.5} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {formatarData(registro.data)}
                        </span>
                      </div>
                      {registro.observacao && (
                        <p className="text-xs text-gray-500 dark:text-zinc-500 italic mt-2 pl-4 border-l-2 border-gray-100 dark:border-white/5">
                          "{registro.observacao}"
                        </p>
                      )}
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <div className="bg-gray-100 dark:bg-white/5 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/5 text-right">
                        <span className="text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block mb-0.5">
                          QUANTIDADE
                        </span>
                        <span
                          className={`text-sm font-black tracking-tight ${ehEntrada ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}
                        >
                          {ehEntrada ? "+" : "-"}
                          {registro.quantidade} {insumo.unidadeMedida.toUpperCase()}
                        </span>
                        {registro.valorTotal && (
                          <div className="mt-1 pt-1 border-t border-gray-100 dark:border-white/5">
                            <span className="text-[10px] font-black text-gray-900 dark:text-white tracking-tight">
                              {registro.valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ModalListagemPremium>
  );
}
