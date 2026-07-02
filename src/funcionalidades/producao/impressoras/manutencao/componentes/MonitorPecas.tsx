import { PecaDesgaste } from "../../tipos";
import { AlertTriangle, Info, Cpu, Settings } from "lucide-react";
import { motion } from "framer-motion";

interface MonitorPecasProps {
    pecas: PecaDesgaste[];
}

export function MonitorPecas({ pecas }: MonitorPecasProps) {
    if (pecas.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-8 rounded-3xl border-2 border-dashed border-zinc-100 dark:border-white/5 bg-zinc-50/30 dark:bg-white/[0.01] opacity-60">
                <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-white/5 text-zinc-400 mb-3">
                    <Settings size={24} strokeWidth={1.5} />
                </div>
                <h5 className="text-[10px] font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-widest mb-1">Sem Componentes Rastreados</h5>
                <p className="text-[8px] text-zinc-500 dark:text-zinc-500 text-center uppercase tracking-[0.2em] max-w-[200px] leading-relaxed">
                    Configure nas especificações para monitorar.
                </p>
            </div>
        );
    }

    const pecasCriticas = pecas.filter(p => (p.horasUsoAtualMinutos / p.vidaUtilMinutos) * 100 > 90);

    return (
        <div className="bg-white dark:bg-white/[0.01] p-8 rounded-3xl border border-zinc-100 dark:border-white/5 shadow-sm space-y-10">
            {/* ÁREA DE ALERTAS CRÍTICOS */}
            {pecasCriticas.length > 0 && (
                <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none text-rose-500">
                        <AlertTriangle size={100} />
                    </div>
                    <div className="flex items-start gap-4 relative z-10">
                        <div className="p-3 bg-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 mt-1">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">
                                    Alerta Crítico de Manutenção
                                </h3>
                            </div>
                            <p className="text-xs text-rose-600/80 dark:text-rose-300/80 mt-1 leading-relaxed max-w-xl">
                                <strong>{pecasCriticas.length} componente(s)</strong> ultrapassaram o limite de uso seguro. A chance de falha estrutural e perda de impressões é iminente. Planeje uma manutenção corretiva o mais rápido possível.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Grid de Componentes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {pecas.map((peca, idx) => {
                    const porcentagemUso = Math.min((peca.horasUsoAtualMinutos / peca.vidaUtilMinutos) * 100, 100);
                    const ehCritico = porcentagemUso > 90;
                    const ehAlerta = porcentagemUso > 75;

                    let corBarra = "bg-sky-500";
                    let sombraBarra = "shadow-[0_0_20px_rgba(14,165,233,0.2)]";

                    if (ehCritico) {
                        corBarra = "bg-rose-500";
                        sombraBarra = "shadow-[0_0_20px_rgba(244,63,94,0.4)]";
                    } else if (ehAlerta) {
                        corBarra = "bg-amber-500";
                        sombraBarra = "shadow-[0_0_20px_rgba(245,158,11,0.3)]";
                    }

                    return (
                        <div key={peca.id} className="group flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl border ${
                                        ehCritico ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 
                                        ehAlerta ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 
                                        'bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-500'
                                    }`}>
                                        <Cpu size={16} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-800 dark:text-zinc-100">
                                            {peca.nome}
                                        </span>
                                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter mt-0.5">
                                            {Math.floor(peca.horasUsoAtualMinutos / 60)}h / {Math.floor(peca.vidaUtilMinutos / 60)}h operados
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                     <div className="flex items-center gap-2">
                                        {ehCritico && <AlertTriangle size={14} className="text-rose-500 animate-pulse" />}
                                        <span className={`text-2xl font-black tabular-nums leading-none tracking-tighter ${
                                            ehCritico ? 'text-rose-500' : ehAlerta ? 'text-amber-500' : 'text-zinc-900 dark:text-white'
                                        }`}>
                                            {Math.round(porcentagemUso)}%
                                        </span>
                                     </div>
                                     <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em] mt-1">Desgaste</span>
                                </div>
                            </div>

                            {/* Barra de Progresso High-Tech */}
                            <div className="relative h-2 w-full bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden border border-zinc-200/50 dark:border-white/5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${porcentagemUso}%` }}
                                    transition={{ duration: 1.5, delay: idx * 0.1, ease: "circOut" }}
                                    className={`h-full ${corBarra} ${sombraBarra} relative`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent" />
                                    <motion.div 
                                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute top-0 right-0 h-full w-4 bg-white/40 blur-sm"
                                    />
                                </motion.div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Rodapé de Informação Refinado */}
            <div className="pt-6 border-t border-zinc-100 dark:border-white/5 flex items-center justify-center gap-4">
                <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.01] border border-zinc-100 dark:border-white/5 group hover:border-sky-500/20 transition-colors">
                    <Info size={14} className="text-sky-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                    <p className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-[0.15em]">
                        Estimativas baseadas no <span className="text-zinc-900 dark:text-zinc-200">horímetro total</span>. Reset o contador após cada manutenção.
                    </p>
                </div>
            </div>
        </div>
    );
}
