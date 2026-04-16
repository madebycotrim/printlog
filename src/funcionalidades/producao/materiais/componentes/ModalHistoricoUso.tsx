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
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 rounded-3xl bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 shadow-inner group">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500 block mb-1 group-hover:text-sky-500 transition-colors">
              ORIGINAL
            </span>
            <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
              {material.pesoGramas}
              <small className="text-xs ml-1 opacity-50">G</small>
            </div>
          </div>
          <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 shadow-inner group">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1 group-hover:scale-110 transition-transform origin-left">
              RESTANTE
            </span>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">
              {material.pesoRestanteGramas.toFixed(1)}
              <small className="text-xs ml-1 opacity-50">G</small>
            </div>
          </div>
        </div>

        {/* ═══════ NAVEGAÇÃO / ABAS ═══════ */}
        <div className="flex gap-2 p-1.5 bg-gray-100/50 dark:bg-black/40 rounded-2xl border border-gray-200 dark:border-white/5 shadow-inner">
          <button
            onClick={() => setAbaAtiva("extrato")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black rounded-xl transition-all duration-300 uppercase tracking-widest ${
              abaAtiva === "extrato"
                ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-md border border-gray-200 dark:border-white/10"
                : "text-gray-400 dark:text-zinc-600 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <History size={14} strokeWidth={3} /> EXTRATO
          </button>
          <button
            onClick={() => setAbaAtiva("novo")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black rounded-xl transition-all duration-300 uppercase tracking-widest ${
              abaAtiva === "novo"
                ? "bg-rose-500 text-white shadow-xl shadow-rose-500/30"
                : "text-gray-400 dark:text-zinc-600 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Scale size={14} strokeWidth={3} /> ABATER
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
                  <div className="py-20 text-center border-2 border-dashed border-gray-100 dark:border-white/5 rounded-3xl bg-gray-50/50 dark:bg-black/10">
                    <Box size={40} strokeWidth={1} className="mx-auto mb-4 text-gray-200 dark:text-zinc-800" />
                    <p className="text-[10px] text-gray-400 dark:text-zinc-600 font-black uppercase tracking-widest">
                      Nenhum uso registrado
                    </p>
                  </div>
                ) : (
                  historicoFiltrado.map((uso) => (
                    <div
                      key={uso.id}
                      className="p-5 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-white/[0.02] flex justify-between items-center group hover:bg-gray-50 dark:hover:bg-white/5 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md border tracking-widest leading-none ${corStatus[uso.status as keyof typeof corStatus] || corStatus.MANUAL}`}
                          >
                            {uso.status}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-tight">
                            {new Date(uso.data).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        <p className="text-sm font-black text-gray-900 dark:text-white truncate tracking-tight uppercase">
                          {uso.nomePeca}
                        </p>
                      </div>
                      <div className="text-right flex flex-col items-end px-4 py-2 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-white/5">
                        <div className="text-base font-black text-rose-500 tracking-tighter">
                          -{uso.quantidadeGastaGramas}g
                        </div>
                        {uso.tempoImpressaoMinutos && (
                          <div className="text-[8px] font-black text-gray-400 dark:text-zinc-600 uppercase tracking-widest">
                            {uso.tempoImpressaoMinutos} MIN
                          </div>
                        )}
                      </div>
                    </div>
                  ))
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
