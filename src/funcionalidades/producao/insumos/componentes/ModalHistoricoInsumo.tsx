import { useState, useMemo } from "react";
import { History, DollarSign, Package, Box } from "lucide-react";
import { ModalListagemPremium } from "@/compartilhado/componentes/ModalListagemPremium";
import { Insumo, RegistroMovimentacaoInsumo } from "@/funcionalidades/producao/insumos/tipos";
import { motion } from "framer-motion";

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
      (r: RegistroMovimentacaoInsumo) => (r.motivo || "").toLowerCase().includes(termo) || (r.observacao || "").toLowerCase().includes(termo),
    );
  }, [registrosRaw, busca]);

  if (!insumo) return null;

  const totalSaidas = registrosRaw.filter((r: RegistroMovimentacaoInsumo) => r.tipo === "Saída").reduce((acc: number, r: RegistroMovimentacaoInsumo) => acc + r.quantidade, 0);

  const valorTotalEntradas = registrosRaw
    .filter((r: RegistroMovimentacaoInsumo) => r.tipo === "Entrada" && r.valorTotal)
    .reduce((acc: number, r: RegistroMovimentacaoInsumo) => acc + (r.valorTotal || 0), 0);

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
      <div className="space-y-6">
        {/* ═══════ CABEÇALHO DO INSUMO & DASHBOARD ═══════ */}
        <div className="bg-white dark:bg-[#121214] p-6 rounded-2xl border border-gray-100 dark:border-white/[0.04] space-y-6 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
            <Box size={100} strokeWidth={1} />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-5 relative z-10">
            <div className="w-14 h-14 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 flex items-center justify-center shrink-0 shadow-xl shadow-black/5 transform group-hover:rotate-6 transition-transform">
              <Box size={28} strokeWidth={1.5} className="text-[var(--cor-primaria)]" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[9px] font-black text-gray-400 dark:text-zinc-600 uppercase tracking-[0.2em] mb-0.5">Ficha Técnica</span>
              <h3 className="text-xl font-black text-gray-900 dark:text-white truncate tracking-tight uppercase leading-none">
                {insumo.nome}
              </h3>
              <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 truncate tracking-wide uppercase mt-1.5 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[var(--cor-primaria)]" />
                {insumo.categoria} {insumo.marca ? `• ${insumo.marca}` : ""}
              </p>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className="text-[9px] font-black text-gray-400 dark:text-zinc-600 uppercase tracking-[0.2em] block mb-1">
                Custo Médio
              </span>
              <div className="bg-white dark:bg-black/40 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 shadow-sm">
                <span className="text-[16px] font-black text-gray-900 dark:text-white tracking-tighter">
                  {insumo.custoMedioUnidade.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  <small className="text-[10px] text-gray-400 dark:text-zinc-600 ml-1 font-bold">
                    /{insumo.unidadeMedida.toUpperCase()}
                  </small>
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
            <div className="bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04] p-5 rounded-xl flex items-center gap-4 shadow-sm group hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-700">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm">
                <Package size={22} strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-[9px] font-black text-gray-400 dark:text-zinc-600 uppercase tracking-[0.2em] block">
                  Consumo Total
                </span>
                <span className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">
                  {totalSaidas}{" "}
                  <small className="text-[10px] text-gray-400 dark:text-zinc-600 font-black uppercase ml-0.5">
                    {insumo.unidadeMedida}
                  </small>
                </span>
              </div>
            </div>

            <div className="bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04] p-5 rounded-xl flex items-center gap-4 shadow-sm group hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-700">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 shadow-sm">
                <DollarSign size={22} strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-[9px] font-black text-gray-400 dark:text-zinc-600 uppercase tracking-[0.2em] block">
                  Valor Investido
                </span>
                <span className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">
                  {valorTotalEntradas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ LISTA DE MOVIMENTAÇÕES (TIMELINE) ═══════ */}
        <div className="space-y-4 flex flex-col px-2">
          {registrosFiltrados.map((registro: RegistroMovimentacaoInsumo, index: number) => {
            const ehEntrada = registro.tipo === "Entrada";
            return (
              <motion.div
                key={registro.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 300, damping: 30, delay: index * 0.05 }}
                className="relative pl-10 before:absolute before:left-[11px] before:top-6 before:bottom-[-16px] before:w-[2px] before:bg-gray-100 dark:before:bg-white/5 last:before:hidden group"
              >
                {/* Marcador de Tipo */}
                <div
                  className={`absolute left-0 top-1 w-5 h-5 rounded-full border-4 border-white dark:border-[#121214] flex items-center justify-center transition-all duration-300 z-10
                                    shadow-sm group-hover:scale-125
                                    ${ehEntrada ? "bg-emerald-500 shadow-emerald-500/20" : "bg-amber-500 shadow-amber-500/20"}`}
                >
                  <div className="w-1 h-1 rounded-full bg-white" />
                </div>

                <div className="bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/[0.04] rounded-xl p-4 transition-all duration-700 group-hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.2)] dark:group-hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-3 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-[0.1em] border
                                                    ${
                                                      ehEntrada
                                                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                                                        : "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400"
                                                    }`}
                        >
                          {ehEntrada ? "Entrada" : "Saída"}
                        </span>
                        {registro.motivo && (
                          <h5 className="text-[13px] font-black text-gray-900 dark:text-white truncate tracking-tight uppercase bg-gray-50 dark:bg-white/5 px-2 py-0.5 rounded border border-gray-100 dark:border-white/5">
                            {registro.motivo}
                          </h5>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        {registro.observacao && (
                          <p className="text-[11px] text-gray-600 dark:text-zinc-500 leading-relaxed pl-3 border-l-2 border-[var(--cor-primaria)]/30 font-medium">
                            "{registro.observacao}"
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 text-gray-400 dark:text-zinc-700">
                          <History size={10} strokeWidth={2.5} className="opacity-50" />
                          <span className="text-[8px] font-black uppercase tracking-[0.15em]">
                            {formatarData(registro.data)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end shrink-0">
                      <div className="bg-gray-50/50 dark:bg-white/[0.01] px-4 py-2 rounded-xl border border-gray-100 dark:border-white/[0.02] text-right min-w-[120px] shadow-sm group-hover:border-[var(--cor-primaria)]/20 transition-colors">
                        <span className="text-[8px] font-black text-gray-400 dark:text-zinc-700 uppercase tracking-[0.15em] block">
                          QUANTIDADE
                        </span>
                        <div className="flex flex-col">
                           <span className={`text-[15px] font-black tracking-tighter tabular-nums ${ehEntrada ? "text-emerald-500" : "text-amber-500"}`}>
                            {ehEntrada ? "+" : "-"}
                            {registro.quantidade} <small className="text-[9px] font-black opacity-60ml-0.5">{insumo.unidadeMedida.toUpperCase()}</small>
                          </span>
                          
                          {registro.valorTotal && (
                            <span className="text-[9px] font-black text-gray-500 dark:text-zinc-500 tracking-wider mt-1 pt-1 border-t border-gray-100 dark:border-white/5 tabular-nums">
                              {registro.valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </ModalListagemPremium>
  );
}
