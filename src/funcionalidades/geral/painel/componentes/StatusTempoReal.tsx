import { ChevronRight, Printer } from "lucide-react";

import { usarArmazemImpressoras } from "@/funcionalidades/producao/impressoras/estado/armazemImpressoras";
import { StatusImpressora, StatusPedido } from "@/compartilhado/tipos/modelos";
import { useNavigate } from "react-router-dom";
import { usarPedidos } from "@/funcionalidades/producao/projetos/hooks/usarPedidos";
import { motion } from "framer-motion";

export function StatusTempoReal() {
    const { impressoras } = usarArmazemImpressoras();
    const { pedidos } = usarPedidos();
    const navegar = useNavigate();

    const maquinasAtivas = impressoras.filter(imp => !imp.dataAposentadoria);
    const resumoMaquinas = maquinasAtivas.slice(0, 3);

    const buscarTrabalhoAtivo = (idImpressora: string) => {
        return pedidos.find(p => p.idImpressora === idImpressora && p.status === StatusPedido.EM_PRODUCAO);
    };

    const obterConfigStatus = (status: string) => {
        switch (status) {
            case StatusImpressora.LIVRE: return { cor: "emerald", label: "PRONTA" };
            case StatusImpressora.IMPRIMINDO: return { cor: "amber", label: "EM CURSO" };
            case StatusImpressora.MANUTENCAO: return { cor: "rose", label: "EM REVISÃO" };
            default: return { cor: "zinc", label: status };
        }
    };

    const classesCores: any = {
        emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
        amber: "bg-amber-500/10 border-amber-500/20 text-amber-500",
        rose: "bg-rose-500/10 border-rose-500/20 text-rose-500",
        zinc: "bg-zinc-500/10 border-zinc-500/20 text-zinc-500",
    };

    const classesBg: any = {
        emerald: "bg-emerald-500",
        amber: "bg-amber-500",
        rose: "bg-rose-500",
        zinc: "bg-zinc-500",
    };

    return (
        <div className="bg-card border border-borda-sutil rounded-[2rem] p-8 flex flex-col h-full shadow-media relative overflow-hidden group transition-all hover:bg-zinc-50 dark:hover:bg-white/[0.01]">
            {/* Grid Pattern Background - Subtil */}
            <div className="absolute inset-0 opacity-[0.015] pointer-events-none" 
                style={{ backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`, backgroundSize: '16px 16px' }} />
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <h3 className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">Live Monitor</h3>
                </div>
                <button 
                    onClick={() => navegar("/impressoras")}
                    className="text-[10px] font-black text-sky-500 hover:underline tracking-widest uppercase"
                >
                    FARM
                </button>
            </div>

            {resumoMaquinas.length > 0 ? (
                <div className="space-y-6 flex-1">
                    {resumoMaquinas.map((imp) => {
                        const trabalho = buscarTrabalhoAtivo(imp.id);
                        const config = obterConfigStatus(imp.status);
                        
                        return (
                            <div 
                                key={imp.id} 
                                onClick={() => navegar("/impressoras")}
                                className="relative group/item cursor-pointer"
                            >
                                <div className="flex justify-between items-end mb-2">
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-black text-primary uppercase truncate max-w-[150px] group-hover/item:text-sky-500 transition-colors">
                                            {trabalho ? trabalho.descricao : imp.nome}
                                        </span>
                                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                                            {imp.nome}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${classesCores[config.cor]} uppercase tracking-widest mb-1`}>
                                            {config.label}
                                        </span>
                                        <span className="text-[10px] font-black text-primary tabular-nums">
                                            {imp.status === StatusImpressora.LIVRE ? '100%' : '0%'}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: imp.status === StatusImpressora.LIVRE ? '100%' : '15%' }}
                                        className={`h-full rounded-full ${classesBg[config.cor]} ${imp.status === StatusImpressora.IMPRIMINDO ? 'animate-pulse' : ''}`}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-borda-sutil rounded-3xl">
                    <Printer size={32} className="text-zinc-300 dark:text-zinc-700 mb-4" />
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Sem máquinas ativas</p>
                </div>
            )}

            <button 
                onClick={() => navegar("/impressoras")}
                className="mt-8 group flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-borda-sutil hover:border-sky-500/30 transition-all"
            >
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Ver Painel Completo</span>
                <ChevronRight size={16} className="text-zinc-400 group-hover:translate-x-1 group-hover:text-sky-500 transition-all" />
            </button>
        </div>
    );
}


