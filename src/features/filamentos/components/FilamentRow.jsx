import React, { memo, useMemo } from "react";
import { Edit2, Trash2, ArrowDownFromLine, Copy, History, Droplet } from "lucide-react"; // Droplet added
import SpoolVectorView from "./Carretel";
import { FilamentStatus } from "./FilamentStatus";
import { SegmentedProgress } from "../../../components/ui/SegmentedProgress";
import { Tooltip } from "../../../components/ui/Tooltip";
import { formatCurrency } from "../../../utils/numbers";




/**
 * MODO LISTA: FilamentRow
 */
export const FilamentRow = memo(({ item, currentHumidity, currentTemperature, onEdit, onDelete, onConsume, onDuplicate, onHistory }) => {
    const stats = useMemo(() => {
        const capacidade = Math.max(1, Number(item?.peso_total) || 1000);
        const atual = Math.max(0, Number(item?.peso_atual) || 0);
        return {
            atual,
            pct: Math.min(100, Math.max(0, Math.round((atual / capacidade) * 100)))
        };
    }, [item?.peso_atual, item?.peso_total]);

    const ehCritico = stats.pct <= 20;
    const corHex = item?.cor_hex || "#3b82f6";
    const isHygroscopic = ['PLA', 'PETG', 'TPU', 'NYLON', 'ABS', 'ASA'].includes(item?.material?.toUpperCase());
    const moistureRisk = isHygroscopic && (currentHumidity > 50);

    return (
        <div className={`
            group relative flex items-center gap-4 p-4 min-h-[72px]
            bg-[#09090b]/80 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300
            border ${ehCritico ? 'border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.05)]' : 'border-white/5 hover:border-white/10 hover:bg-zinc-900/40'}
        `}>
            {/* 1. ICON (Floating) */}
            <div className="relative shrink-0">
                <div className={`absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} style={{ backgroundColor: corHex }} />
                <SpoolVectorView color={corHex} percent={stats.pct} size={42} />
            </div>

            {/* 2. MAIN INFO */}
            <div className="flex flex-col justify-center min-w-0 flex-1 gap-1">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-zinc-200 truncate group-hover:text-white transition-colors tracking-tight">
                        {item?.nome || "Material Sem Nome"}
                    </h3>

                    {/* Tags Inline */}
                    <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider border border-zinc-800 rounded px-1.5 py-px">{item?.marca}</span>
                        <span className="text-[10px] font-bold text-zinc-400 bg-zinc-800/50 px-1.5 py-px rounded">{item?.material}</span>
                    </div>
                </div>

                {/* Status Indicators (Compact) */}
                {/* Status Indicators (Compact) */}
                <FilamentStatus item={item} currentHumidity={currentHumidity} />
            </div>

            {/* 3. TECH STATS (Condensed) */}
            <div className="hidden md:flex flex-col items-end gap-1 px-4 min-w-[140px]">
                <div className="flex items-baseline gap-1.5">
                    <span className={`text-xl font-bold font-mono tracking-tighter ${ehCritico ? 'text-rose-400' : 'text-zinc-200'}`}>
                        {Math.round(stats.atual)}
                    </span>
                    <span className="text-[9px] text-zinc-600 font-bold uppercase">g</span>
                </div>
                <div className="w-full max-w-[120px]">
                    <SegmentedProgress pct={stats.pct} color={corHex} pulse={ehCritico} height={3} segments={12} />
                </div>
            </div>

            {/* 4. ACTIONS (Hover Reveal) */}
            <div className="flex items-center gap-1 pl-4 border-l border-white/5 opacity-40 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                <button
                    onClick={() => onConsume(item)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-zinc-800/50 hover:bg-emerald-500/10 text-zinc-400 hover:text-emerald-400 transition-colors"
                    title="Baixa Rápida"
                >
                    <ArrowDownFromLine size={14} />
                </button>
                <button onClick={() => onDuplicate(item)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-zinc-500 hover:text-blue-400 transition-colors" title="Duplicar">
                    <Copy size={14} />
                </button>
                <button onClick={() => onHistory(item)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-zinc-500 hover:text-amber-400 transition-colors" title="Histórico">
                    <History size={14} />
                </button>
                <button onClick={() => onEdit(item)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-zinc-500 hover:text-zinc-200 transition-colors" title="Editar">
                    <Edit2 size={14} />
                </button>
                <button onClick={() => onDelete(item?.id)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-rose-500/10 text-zinc-500 hover:text-rose-500 transition-colors" title="Excluir">
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
});
