import { Box, Scale } from "lucide-react";
import { motion } from "framer-motion";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { Material } from "../tipos";
import { usarHistoricoMateriais } from "../hooks/usarHistoricoMateriais";
import { FormularioConsumo } from "./FormularioConsumo";

interface ModalHistoricoUsoProps {
  aberto: boolean;
  aoFechar: () => void;
  material: Material;
}

export function ModalHistoricoUso({ aberto, aoFechar, material }: ModalHistoricoUsoProps) {
  const { historico, registrarConsumo } = usarHistoricoMateriais(material.id);

  const corStatus = {
    SUCESSO: "border-emerald-500/20 text-emerald-500 bg-emerald-500/10",
    FALHA: "border-rose-500/20 text-rose-500 bg-rose-500/10",
    CANCELADO: "border-amber-500/20 text-amber-500 bg-amber-500/10",
    MANUAL: "border-zinc-500/20 text-zinc-500 bg-zinc-500/10",
  };

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={`Gerenciar Insumo: ${material.nome}`}
      larguraMax="max-w-3xl"
    >
      <div className="flex flex-col max-h-[85vh] overflow-hidden bg-white dark:bg-[#0e0e11]">
        <div className="p-8 space-y-12 overflow-y-auto scrollbar-hide">
          
          {/* ═══════ SEÇÃO 01: STATUS E ABATIMENTO ═══════ */}
          <section className="relative">
            <div className="grid grid-cols-2 gap-5 mb-10">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/[0.03] shadow-inner group relative overflow-hidden"
              >
                <div className="absolute -right-4 -bottom-4 opacity-5 text-zinc-900 dark:text-white group-hover:scale-110 transition-transform duration-700">
                  <Box size={80} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600 block mb-3">Original</span>
                <div className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter tabular-nums flex items-baseline gap-1">
                  {material.pesoGramas}<small className="text-xs uppercase opacity-30 font-bold">g</small>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-[2.5rem] bg-emerald-500/[0.03] dark:bg-emerald-500/[0.05] border border-emerald-500/10 shadow-sm relative overflow-hidden group"
              >
                <div className="absolute -right-4 -bottom-4 opacity-10 text-emerald-500 group-hover:scale-110 transition-transform duration-700">
                  <Scale size={80} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-500/60 block mb-3">Disponível</span>
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-500 tracking-tighter tabular-nums flex items-baseline gap-1">
                  {material.pesoRestanteGramas.toFixed(1)}<small className="text-xs uppercase opacity-40 font-bold">g</small>
                </div>
              </motion.div>
            </div>

            <div className="bg-zinc-50/50 dark:bg-white/[0.02] rounded-[3rem] p-8 border border-zinc-100 dark:border-white/[0.04]">
              <div className="flex items-center gap-4 mb-10">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-indigo-500/20" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500/80">Abatimento de Peso</h3>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-indigo-500/20" />
              </div>
              
              <FormularioConsumo
                pesoDisponivel={material.pesoRestanteGramas}
                aoCancelar={aoFechar}
                aoSalvar={async (dados) => {
                  await registrarConsumo(dados);
                }}
              />
            </div>
          </section>

          {/* ═══════ SEÇÃO 02: HISTÓRICO ═══════ */}
          <section className="relative pt-6">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-zinc-500/20" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-600">Histórico de Uso</h3>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-zinc-500/20" />
            </div>

            {historico.length === 0 ? (
              <div className="py-24 text-center bg-zinc-50/30 dark:bg-black/10 rounded-[3rem] border-2 border-dashed border-zinc-100 dark:border-white/[0.05]">
                <Box size={40} strokeWidth={1} className="mx-auto mb-4 text-zinc-200 dark:text-zinc-800" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 dark:text-zinc-700">Aguardando registros</p>
              </div>
            ) : (
              <div className="space-y-4 relative before:absolute before:left-[11px] before:top-4 before:bottom-4 before:w-[2px] before:bg-gradient-to-b before:from-zinc-100 dark:before:from-white/5 before:via-zinc-100 dark:before:via-white/5 before:to-transparent">
                {historico.map((uso, index) => (
                  <motion.div
                    key={uso.id}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="pl-8 relative group"
                  >
                    {/* Status Glow Dot */}
                    <div className={`absolute left-0 top-[26px] -translate-y-1/2 w-[24px] h-[24px] rounded-full border-[6px] border-white dark:border-[#0e0e11] z-10 transition-all duration-500 group-hover:scale-125
                      ${uso.status === 'SUCESSO' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 
                        uso.status === 'FALHA' ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 
                        uso.status === 'CANCELADO' ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-zinc-500'}`}
                    />

                    <div className="bg-white dark:bg-zinc-900/30 border border-zinc-100 dark:border-white/[0.03] rounded-3xl p-5 transition-all group-hover:bg-zinc-50 dark:group-hover:bg-white/[0.05] group-hover:translate-x-1">
                      <div className="flex justify-between items-center gap-6">
                        <div className="min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border tracking-[0.15em] leading-none ${corStatus[uso.status as keyof typeof corStatus] || corStatus.MANUAL}`}>
                              {uso.status}
                            </span>
                            <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
                              {new Date(uso.data).toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'})}
                            </span>
                          </div>
                          <p className="text-sm font-black text-zinc-900 dark:text-white truncate uppercase tracking-tight">{uso.nomePeca}</p>
                        </div>
                        <div className="text-right px-4 py-2 bg-zinc-50 dark:bg-black/20 rounded-2xl border border-zinc-100 dark:border-white/[0.02] shadow-inner">
                          <div className="text-base font-black text-rose-500 tracking-tighter tabular-nums">-{uso.quantidadeGastaGramas}<small className="text-[10px] ml-0.5 opacity-50 uppercase">g</small></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </Dialogo>
  );
}
