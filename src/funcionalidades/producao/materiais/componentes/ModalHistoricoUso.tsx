import { useState, useMemo } from "react";
import { ModalListagemPremium } from "@/compartilhado/componentes/ModalListagemPremium";
import { Material } from "../tipos";
import { usarHistoricoMateriais } from "../hooks/usarHistoricoMateriais";
import { FormularioConsumo } from "./FormularioConsumo";
import { History, Scale, Box } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalHistoricoUsoProps {
  aberto: boolean;
  aoFechar: () => void;
  material: Material;
}

export function ModalHistoricoUso({ aberto, aoFechar, material }: ModalHistoricoUsoProps) {
  const { historico, registrarConsumo } = usarHistoricoMateriais(material.id);
  const [abaAtiva, setAbaAtiva] = useState<"extrato" | "novo">("extrato");
  const [busca, setBusca] = useState("");

  const historicoFiltrado = useMemo(() => {
    if (!busca) return historico;
    const termo = busca.toLowerCase();
    return historico.filter((uso) => uso.nomePeca.toLowerCase().includes(termo));
  }, [historico, busca]);

  const corStatus = {
    SUCESSO: "border-emerald-500/30 text-emerald-500 bg-emerald-500/5",
    FALHA: "border-rose-500/30 text-rose-500 bg-rose-500/5",
    CANCELADO: "border-amber-500/30 text-amber-500 bg-amber-500/5",
    MANUAL: "border-zinc-500/30 text-zinc-500 bg-zinc-500/5",
  };

  return (
    <ModalListagemPremium
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={`Gerenciar Material: ${material.nome}`}
      iconeTitulo={History}
      corDestaque="rose"
      termoBusca={busca}
      aoMudarBusca={setBusca}
      placeholderBusca="BUSCAR NO EXTRATO..."
      temResultados={abaAtiva === "novo" || historicoFiltrado.length > 0}
      totalResultados={historicoFiltrado.length}
      iconeVazio={Box}
      mensagemVazio="Nenhum registro encontrado para esta busca."
    >
      <div className="space-y-8">
        {/* ═══════ RESUMO RÁPIDO ═══════ */}
        {/* ═══════ RESUMO RÁPIDO ═══════ */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04] shadow-sm group">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-zinc-600 block mb-1">
              Capacidade Original
            </span>
            <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter tabular-nums">
              {material.pesoGramas}
              <small className="text-[10px] ml-1 opacity-50 uppercase font-black">g</small>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 shadow-sm group">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500/80 block mb-1">
              Estoque Restante
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-500 tracking-tighter tabular-nums">
              {material.pesoRestanteGramas.toFixed(1)}
              <small className="text-[10px] ml-1 opacity-50 uppercase font-black">g</small>
            </div>
          </div>
        </div>

        {/* ═══════ NAVEGAÇÃO / ABAS ═══════ */}
        {/* ═══════ NAVEGAÇÃO / ABAS ═══════ */}
        <div className="flex gap-2 p-1 bg-gray-100/50 dark:bg-black/40 rounded-xl border border-gray-200 dark:border-white/10">
          <button
            onClick={() => setAbaAtiva("extrato")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[9px] font-black rounded-lg transition-all duration-300 uppercase tracking-widest ${
              abaAtiva === "extrato"
                ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-white/10"
                : "text-gray-400 dark:text-zinc-600 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <History size={12} strokeWidth={3} /> EXTRATO
          </button>
          <button
            onClick={() => setAbaAtiva("novo")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[9px] font-black rounded-lg transition-all duration-300 uppercase tracking-widest ${
              abaAtiva === "novo"
                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                : "text-gray-400 dark:text-zinc-600 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Scale size={12} strokeWidth={3} /> ABATER
          </button>
        </div>

        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            {abaAtiva === "extrato" ? (
              <motion.div
                key="extrato"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {historicoFiltrado.length === 0 ? (
                  <div className="py-20 text-center border-2 border-dashed border-gray-100 dark:border-white/[0.04] rounded-2xl bg-gray-50/50 dark:bg-black/10">
                    <Box size={32} strokeWidth={1} className="mx-auto mb-4 text-gray-200 dark:text-zinc-800" />
                    <p className="text-[9px] text-gray-400 dark:text-zinc-600 font-black uppercase tracking-widest">
                      Nenhum uso registrado
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 relative before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100 dark:before:bg-white/[0.04]">
                    {historicoFiltrado.map((uso, index) => (
                      <motion.div
                        key={uso.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="pl-7 relative flex justify-between items-center group"
                      >
                        {/* Dot da Timeline */}
                        <div className={`absolute left-0 top-[22px] w-[20px] h-[20px] -translate-y-1/2 rounded-full border-4 border-white dark:border-[#121214] z-10 transition-transform group-hover:scale-125
                          ${uso.status === 'SUCESSO' ? 'bg-emerald-500' : 
                            uso.status === 'FALHA' ? 'bg-rose-500' : 
                            uso.status === 'CANCELADO' ? 'bg-amber-500' : 'bg-zinc-500'}`}
                        />

                        <div className="flex-1 bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/[0.04] rounded-xl p-4 transition-all duration-500 group-hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.2)] dark:group-hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)]">
                          <div className="flex justify-between items-center gap-4">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span
                                  className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border tracking-[0.1em] leading-none ${corStatus[uso.status as keyof typeof corStatus] || corStatus.MANUAL}`}
                                >
                                  {uso.status}
                                </span>
                                <span className="text-[9px] font-black text-gray-400 dark:text-zinc-700 uppercase tracking-widest">
                                  {new Date(uso.data).toLocaleDateString("pt-BR")}
                                </span>
                              </div>
                              <p className="text-sm font-black text-gray-900 dark:text-white truncate tracking-tight uppercase group-hover:text-[var(--cor-primaria)] transition-colors">
                                {uso.nomePeca}
                              </p>
                            </div>
                            <div className="text-right flex flex-col items-end px-3 py-1.5 bg-gray-50/50 dark:bg-white/[0.01] rounded-lg border border-gray-100 dark:border-white/[0.02] min-w-[80px]">
                              <div className="text-sm font-black text-rose-500 tracking-tighter tabular-nums">
                                -{uso.quantidadeGastaGramas}g
                              </div>
                              {uso.tempoImpressaoMinutos && (
                                <div className="text-[7px] font-black text-gray-400 dark:text-zinc-700 uppercase tracking-widest">
                                  {uso.tempoImpressaoMinutos} MIN
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="novo"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <FormularioConsumo
                  pesoDisponivel={material.pesoRestanteGramas}
                  aoCancelar={() => setAbaAtiva("extrato")}
                  aoSalvar={async (dados) => {
                    await registrarConsumo(dados);
                    setAbaAtiva("extrato");
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </ModalListagemPremium>
  );
}
