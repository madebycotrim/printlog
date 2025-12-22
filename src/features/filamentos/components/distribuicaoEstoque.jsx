import React, { useMemo } from "react";
import { PieChart, Activity, Layers, CornerDownRight } from "lucide-react";

export default function DistributionCard({ stats = [] }) {
    
    const { topStats, othersCount, materialDominante } = useMemo(() => {
        if (!stats || !stats.length) return { topStats: [], othersCount: 0, materialDominante: null };

        const sorted = [...stats].sort((a, b) => b.percent - a.percent);
        
        return {
            topStats: sorted.slice(0, 3),
            othersCount: Math.max(0, sorted.length - 3),
            materialDominante: sorted[0]
        };
    }, [stats]);

    return (
        <div className="group relative h-[150px] p-5 rounded-2xl bg-[#09090b] border border-zinc-800/50 overflow-hidden flex flex-col justify-between transition-all hover:border-zinc-700/60 shadow-2xl">
            
            {/* DECORAÇÃO TÉCNICA AO FUNDO */}
            <div className="absolute -right-4 -top-4 text-sky-500 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none rotate-12">
                <PieChart size={120} />
            </div>

            {/* HEADER TÉCNICO */}
            <div className="relative z-10 flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 shadow-inner text-sky-500">
                        <Activity size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] leading-none mb-1">Composição_Métrica</p>
                        <h3 className="text-sm font-mono font-bold text-zinc-300 flex items-center gap-1.5 uppercase tracking-tighter">
                            {materialDominante ? (
                                <>
                                    <Layers size={12} className="text-sky-500" />
                                    Dominância_{materialDominante.type}
                                </>
                            ) : "Aguardando_Dados"}
                        </h3>
                    </div>
                </div>
                
                <div className="text-right">
                    <span className="text-[10px] font-mono font-black text-zinc-600 uppercase bg-zinc-900/50 px-2 py-0.5 rounded border border-zinc-800/50">
                        {stats.length.toString().padStart(2, '0')}_Tipos
                    </span>
                </div>
            </div>

            {/* VISUALIZER: BARRA DE COMPOSIÇÃO SEGMENTADA */}
            <div className="relative z-10 space-y-2">
                <div className="h-2 w-full flex rounded-full overflow-hidden bg-zinc-900/50 border border-white/5 shadow-inner">
                    {stats.length > 0 ? (
                        stats.map((stat, idx) => (
                            <div 
                                key={stat.type} 
                                style={{ width: `${stat.percent}%` }} 
                                className={`${stat.bg} hover:brightness-125 transition-all relative group/segment`}
                            >
                                {/* Separadores ultra-finos entre segmentos */}
                                {idx !== stats.length - 1 && <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-black/30" />}
                            </div>
                        ))
                    ) : (
                        <div className="w-full h-full bg-zinc-800/20 animate-pulse" />
                    )}
                </div>

                {/* LEGENDA MONOESPAÇADA (TOP 3) */}
                <div className="flex items-center gap-4">
                    <div className="flex flex-1 items-center gap-3">
                        {topStats.map((stat) => (
                            <div key={stat.type} className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${stat.bg} shadow-[0_0_8px_rgba(255,255,255,0.1)]`} />
                                <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-tighter">
                                    {stat.type} <span className="text-zinc-700 ml-0.5">{Math.round(stat.percent)}%</span>
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* BADGE DE EXCEDENTE */}
                    {othersCount > 0 && (
                        <div className="flex items-center gap-1 text-[8px] font-black text-zinc-600 uppercase bg-zinc-900/80 px-1.5 py-0.5 rounded border border-zinc-800/50">
                            <CornerDownRight size={8} />
                            +{othersCount}_OUTROS
                        </div>
                    )}
                </div>
            </div>

            {/* RODAPÉ STATUS */}
            <div className="relative z-10 pt-2 border-t border-white/5 flex justify-between items-center">
                <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Análise de Inventário</span>
                <div className="flex gap-0.5">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-0.5 w-2 rounded-full ${i <= 3 ? 'bg-sky-500/40' : 'bg-zinc-800'}`} />
                    ))}
                </div>
            </div>
        </div>
    );
}