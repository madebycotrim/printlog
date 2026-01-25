import React, { memo, useMemo } from "react";
import { Edit2, Trash2, History, AlertTriangle, Package2, ArrowDownFromLine, Copy, Box, Link, Zap, Hammer, Layers, PackageSearch, TrendingDown } from "lucide-react";
import { Tooltip } from "../../../components/ui/Tooltip";

/**
 * SupplyCard -> Versão Premium Redesign
 */
export const SupplyCard = memo(({ item, icon: PropIcon, onEdit, onDelete, onHistory }) => {

    const categoryLower = (item?.category || item?.categoria || "Geral").toLowerCase();

    // 1. Cores por Categoria
    // 1. Cores e Labels por Categoria
    const theme = useMemo(() => {
        if (categoryLower.includes('embalagem')) return { hex: "#d97706", tailwind: "amber", label: "Embalagem" };
        if (categoryLower.includes('fixação') || categoryLower.includes('fixacao')) return { hex: "#94a3b8", tailwind: "slate", label: "Fixação" };
        if (categoryLower.includes('eletrônica') || categoryLower.includes('eletronica')) return { hex: "#8b5cf6", tailwind: "violet", label: "Eletrônica" };
        if (categoryLower.includes('acabamento')) return { hex: "#ec4899", tailwind: "pink", label: "Acabamento" };
        if (categoryLower.includes('químico') || categoryLower.includes('quimico')) return { hex: "#10b981", tailwind: "emerald", label: "Químico" };
        if (categoryLower.includes('geral')) return { hex: "#71717a", tailwind: "zinc", label: "Geral" };
        return { hex: "#f97316", tailwind: "orange", label: item?.category || "Outros" };
    }, [categoryLower, item?.category]);

    // 2. Ícones por Categoria
    const CatIcon = useMemo(() => {
        if (PropIcon) return PropIcon;
        if (categoryLower.includes('embalagem')) return Box;
        if (categoryLower.includes('fixação')) return Link;
        if (categoryLower.includes('eletrônica')) return Zap;
        if (categoryLower.includes('acabamento')) return Hammer;
        if (categoryLower.includes('geral')) return Layers;
        return PackageSearch;
    }, [categoryLower, PropIcon]);

    // Helper Safe Parse
    const safeFloat = (val) => {
        if (!val) return 0;
        if (typeof val === 'number') return val;
        // Replace comma with dot and parse
        const num = parseFloat(String(val).replace(',', '.'));
        return isNaN(num) ? 0 : num;
    };

    const stats = useMemo(() => {
        // Fallback para chaves em Português se o backend estiver retornando snake_case
        const estoque = safeFloat(item?.currentStock) || safeFloat(item?.estoque_atual) || safeFloat(item?.current_stock);
        const min = safeFloat(item?.minStock) || safeFloat(item?.estoque_minimo) || safeFloat(item?.min_stock);
        const price = safeFloat(item?.price) || safeFloat(item?.preco);

        const isCritical = estoque <= 0;
        const isLow = estoque < min;
        const isHealthy = !isLow && !isCritical;

        // Progress Logic
        const target = Math.max(1, min > 0 ? min * 3 : 10);
        const pct = Math.min(100, Math.max(2, Math.round((estoque / target) * 100)));

        return {
            atual: estoque,
            pct,
            min,
            isCritical,
            isLow,
            isHealthy,
            statusColor: isCritical ? 'text-rose-500' : isLow ? 'text-amber-500' : 'text-emerald-500',
            barColor: isCritical ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500',
            glowColor: isCritical ? 'shadow-rose-500/20' : isLow ? 'shadow-amber-500/20' : 'shadow-emerald-500/10',
            borderColor: isCritical ? 'border-rose-500/30' : isLow ? 'border-amber-500/30' : null,
            unitPrice: price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            totalValue: (estoque * price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        };
    }, [item]);

    return (
        <div
            className={`
                group relative flex flex-col justify-between h-full min-h-[220px]
                bg-[#09090b] rounded-3xl overflow-hidden transition-all duration-300
                border hover:-translate-y-1 hover:shadow-2xl
                ${stats.borderColor || 'border-white/5 hover:border-white/10'}
                ${stats.glowColor}
            `}
            style={{
                '--theme-color': theme.hex
            }}
        >
            {/* BACKGROUND EFFECTS */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

            {/* Watermark Icon */}
            <div className="absolute -right-6 -top-6 text-white/[0.02] transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                <CatIcon size={180} />
            </div>

            {/* HEADER AREA */}
            <div className="relative p-6 flex flex-col gap-4 z-10">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        {/* Category Badge */}
                        <div className="flex items-center gap-2 mb-1">
                            <span
                                className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border bg-white/5 border-white/5"
                                style={{ color: theme.hex, borderColor: `${theme.hex}20` }}
                            >
                                {theme.label}
                            </span>
                            {stats.isLow && (
                                <span className="flex items-center gap-1 text-[9px] text-amber-500 font-bold uppercase tracking-wider animate-pulse">
                                    <AlertTriangle size={10} />
                                    Baixo Estoque
                                </span>
                            )}
                        </div>

                        <h3 className="text-lg font-bold text-zinc-100 leading-tight group-hover:text-white transition-colors line-clamp-2">
                            {item?.name}
                        </h3>
                    </div>

                    {/* Icon Box */}
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center border bg-white/5 transition-colors group-hover:bg-white/10"
                        style={{ borderColor: `${theme.hex}30` }}
                    >
                        <CatIcon size={20} style={{ color: theme.hex }} />
                    </div>
                </div>

                {/* STOCK DISPLAY */}
                <div className="mt-2">
                    <div className="flex items-end justify-between mb-2">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">Em Estoque</span>
                            <div className="flex items-baseline gap-1.5">
                                <span className={`text-3xl font-black ${stats.statusColor} tracking-tight`}>
                                    {stats.atual}
                                </span>
                                <span className="text-xs font-medium text-zinc-600">
                                    {item?.unit}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] uppercase text-zinc-600 font-bold tracking-wider">Mínimo</span>
                            <span className="text-xs font-mono font-medium text-zinc-400">{stats.min} {item?.unit}</span>
                        </div>
                    </div>

                    {/* DESCRIPTION (User Feedback) */}
                    {item?.description && (
                        <div className="mt-3 pt-3 border-t border-white/5">
                            <p className="text-[10px] text-zinc-500 font-medium leading-relaxed line-clamp-2">
                                {item.description}
                            </p>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${stats.barColor}`}
                        style={{ width: `${stats.pct}%` }}
                    />
                </div>
            </div>


            {/* FOOTER / ACTIONS */}
            <div className="mt-auto relative z-10 bg-white/[0.02] border-t border-white/5 p-4 flex items-center justify-between backdrop-blur-sm">

                {/* INFO */}
                <div className="flex gap-4">
                    <div className="flex flex-col">
                        <span className="text-[9px] uppercase text-zinc-600 font-bold tracking-widest">Valor Unit.</span>
                        <span className="text-xs font-mono font-medium text-zinc-400">{stats.unitPrice}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] uppercase text-zinc-600 font-bold tracking-widest">Total</span>
                        <span className="text-xs font-mono font-bold text-zinc-200">{stats.totalValue}</span>
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-1">
                    <Tooltip text="Histórico">
                        <button
                            onClick={() => onHistory(item)}
                            className="p-2 rounded-lg text-zinc-500 hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
                        >
                            <History size={16} />
                        </button>
                    </Tooltip>

                    <div className="w-px h-4 bg-white/10 mx-1" />

                    <Tooltip text="Editar">
                        <button
                            onClick={() => onEdit(item)}
                            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/10 transition-colors"
                        >
                            <Edit2 size={16} />
                        </button>
                    </Tooltip>

                    <Tooltip text="Excluir">
                        <button
                            onClick={() => onDelete(item?.id)}
                            className="p-2 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
});

