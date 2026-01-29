import React, { memo, useMemo } from "react";
import { Edit2, Trash2, ArrowDownFromLine, Copy, History, Droplet } from "lucide-react";
import SpoolVectorView from "./Carretel";
import { FilamentStatus } from "./FilamentStatus";
import { formatCurrency } from "../../../utils/numbers";

export const FilamentCard = memo(({ item, currentHumidity, currentTemperature, onEdit, onDelete, onConsume, onDuplicate, onHistory }) => {
    // Stats Logic
    const stats = useMemo(() => {
        const capacidade = Math.max(1, Number(item?.peso_total) || 1000);
        const atual = Math.max(0, Number(item?.peso_atual) || 0);
        const pct = Math.min(100, Math.max(0, Math.round((atual / capacidade) * 100)));
        const valorRestante = (Number(item?.preco || 0) / capacidade) * atual;
        return { atual, pct, ehCritico: pct <= 20, valorRestante };
    }, [item?.peso_atual, item?.peso_total, item?.preco]);

    const corHex = item?.cor_hex || "#3b82f6";



    return (
        <div className="group relative w-full aspect-[3/4] rounded-3xl transition-all duration-300">



            {/* 1. VISUAL LAYER (Base) */}
            <div className={`
                absolute inset-0 flex flex-col items-center justify-center 
                bg-[#09090b]/40 backdrop-blur-sm border border-white/5 rounded-3xl 
                transition-all duration-500 
                group-hover:border-white/10 group-hover:bg-[#09090b]/80 group-hover:scale-[1.02] group-hover:shadow-2xl
                ${stats.ehCritico ? 'border-rose-500/20 bg-rose-500/5' : ''}
            `}>
                {/* Spool Centered */}
                <div className="relative transform transition-all duration-500 -translate-y-6 group-hover:scale-75 group-hover:-translate-y-[85px]">
                    {/* Ambient Glow */}
                    <div
                        className="absolute inset-0 rounded-full blur-[50px] transition-all duration-500 opacity-20 group-hover:opacity-30"
                        style={{ backgroundColor: corHex }}
                    />
                    <SpoolVectorView color={corHex} percent={stats.pct} size={140} />
                </div>


                {/* Name/Brand (Always Visible, Hidden on Hover) */}
                <div className="absolute bottom-14 flex flex-col items-center text-center transition-all duration-300 group-hover:opacity-0 transform translate-y-0 group-hover:translate-y-2 px-4">
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight leading-none drop-shadow-lg line-clamp-2">
                        {item?.nome || "Sem Nome"}
                    </h3>
                </div>

                {/* Humidity Risk Icon (Top Right) */}
                {(() => {
                    const isHygroscopic = ['PLA', 'PETG', 'TPU', 'NYLON', 'ABS', 'ASA'].includes(item?.material?.toUpperCase());
                    const moistureRisk = isHygroscopic && (currentHumidity > 50);
                    if (!moistureRisk) return null;

                    return (
                        <div className="absolute top-4 right-4 p-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(56,189,248,0.2)]">
                            <Droplet size={14} className="fill-current animate-pulse" />
                        </div>
                    );
                })()}

                {/* Minimal Badge (Always Visible) */}
                <div className={`
                    absolute bottom-4 px-3 py-1 rounded-full border backdrop-blur-md flex items-center gap-2
                    transition-all duration-300 group-hover:opacity-0
                    ${stats.ehCritico
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : 'bg-zinc-950/50 border-white/10 text-zinc-400'}
                `}>
                    <span className="text-[10px] font-black uppercase tracking-widest">{item?.material || "PLA"}</span>
                    <div className="w-px h-3 bg-white/10" />
                    <span className="text-[10px] font-mono font-bold">{Math.round(stats.atual)}g</span>
                </div>


            </div>

            {/* 2. INFO OVERLAY (Hover Only) */}
            <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10 flex flex-col gap-3">

                {/* Header Info */}
                <div className="text-center space-y-0.5">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{item?.marca || "Genérica"}</span>
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight leading-none truncate w-full">
                        {item?.nome || "Sem Nome"}
                    </h3>

                    {/* Minimal Stats Row */}
                    <div className="flex items-center justify-center gap-2 mt-1 mb-2 opacity-90">
                        {/* Price */}
                        <span className="text-xs font-medium text-emerald-400/90 tracking-wide">
                            {Number(item?.preco) > 0 ? formatCurrency(stats.valorRestante) : '--'}
                        </span>

                        <span className="text-zinc-700 text-[10px]">•</span>

                        {/* Weight */}
                        {/* Weight */}
                        <div className="flex items-baseline gap-0.5">
                            <span className={`text-xs font-medium ${stats.ehCritico ? 'text-rose-400' : 'text-zinc-400'}`}>
                                {Math.round(stats.atual)}
                            </span>
                            <span className="text-[10px] text-zinc-500 opacity-70">
                                / {Number(item?.peso_total) || 1000}g
                            </span>
                        </div>
                    </div>

                    {/* Universal Status Badge */}
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <FilamentStatus item={item} currentHumidity={currentHumidity} />
                    </div>
                </div>

                {/* Actions Grid */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/5">
                    <button onClick={() => onConsume(item)} className="col-span-4 h-9 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all group/btn">
                        <ArrowDownFromLine size={14} className="opacity-70 group-hover/btn:opacity-100" /> <span>Registrar Uso</span>
                    </button>

                    <button onClick={() => onHistory(item)} className="h-8 text-zinc-500 hover:text-white hover:bg-white/5 rounded-md flex items-center justify-center transition-colors" title="Histórico">
                        <History size={14} />
                    </button>
                    <button onClick={() => onDuplicate(item)} className="h-8 text-zinc-500 hover:text-white hover:bg-white/5 rounded-md flex items-center justify-center transition-colors" title="Duplicar">
                        <Copy size={14} />
                    </button>
                    <button onClick={() => onEdit(item)} className="h-8 text-zinc-500 hover:text-white hover:bg-white/5 rounded-md flex items-center justify-center transition-colors" title="Editar">
                        <Edit2 size={14} />
                    </button>
                    <button onClick={() => onDelete(item?.id)} className="h-8 text-rose-500/70 hover:text-rose-400 hover:bg-rose-500/10 rounded-md flex items-center justify-center transition-colors" title="Excluir">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
});
