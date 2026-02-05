import React, { memo, useMemo } from "react";
import { Edit2, Trash2, History, ShoppingCart, Zap, QrCode } from "lucide-react";
import { formatCurrency } from "../../../utils/numbers";
import { Tooltip } from "../../../components/ui/Tooltip";
import { getMaterialTheme } from "../../../logic/materialIcons";

export const SupplyRow = memo(({ item, icon: PropIcon, onEdit, onDelete, onHistory, onQuickConsume, onLabel }) => {

    const theme = useMemo(() => {
        return getMaterialTheme(item?.name || "", item?.category || item?.categoria || "Geral");
    }, [item?.name, item?.category, item?.categoria]);

    const MainIcon = PropIcon || theme.icon;
    const finalLabel = item?.brand || item?.marca || item?.supplier || item?.fornecedor || theme.label || "Item";

    // 2. Metrics & Status
    const stats = useMemo(() => {
        const estoque = Number(item?.currentStock) || Number(item?.estoque_atual) || Number(item?.current_stock) || 0;
        const min = Number(item?.minStock) || Number(item?.estoque_minimo) || Number(item?.min_stock) || 0;
        const price = Number(item?.price) || Number(item?.preco) || 0;
        const totalValue = estoque * price;

        const isCritical = estoque <= 0;
        const isLow = estoque < min;

        // Fractionable Logic
        const stockYield = Number(item?.stockYield || item?.rendimento_estoque || item?.stock_yield || 1);
        const usageUnit = item?.usageUnit || item?.unidade_uso || item?.usage_unit || "";
        const isFractional = stockYield > 1 && !!usageUnit;
        const effectiveStock = estoque * stockYield;

        return {
            atual: estoque,
            min,
            isCritical,
            isLow,
            totalValue,
            unitPrice: price,
            isFractional,
            effectiveStock,
            usageUnit
        };
    }, [item]);

    // --- PREMIUM VISUAL LOGIC --- //

    // Status color palette (Neon/Cyberpunk style)
    const statusColor = useMemo(() => {
        if (stats.isCritical) return { text: 'text-rose-500', bg: 'bg-rose-500', border: 'border-rose-500/50', glow: 'shadow-rose-500/20' };
        if (stats.isLow) return { text: 'text-amber-500', bg: 'bg-amber-500', border: 'border-amber-500/50', glow: 'shadow-amber-500/20' };
        return { text: 'text-emerald-500', bg: 'bg-emerald-500', border: 'border-emerald-500/50', glow: 'shadow-emerald-500/20' };
    }, [stats]);

    // Progress Bar Calculation
    const progressWidth = useMemo(() => {
        if (!stats.min) return 100;
        const pct = (stats.atual / (stats.min * 2)) * 100; // 100% at 2x min (healthy buffer)
        return Math.min(100, Math.max(5, pct));
    }, [stats]);

    return (
        <div className="group relative pl-1 hover:pl-2 transition-all duration-300">


            <div className={`
                relative w-full flex items-center gap-8 py-4 px-5
                bg-[#09090b] border border-zinc-800 rounded-xl
                hover:border-zinc-700 hover:bg-[#0c0c0f] hover:shadow-xl
                transition-all duration-300 group-hover:translate-x-1
            `}>

                {/* 1. ICON BLOCK */}
                <div className="relative shrink-0">
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center bg-zinc-900/50 border border-white/5 relative overflow-hidden group-hover:border-white/10 transition-colors"
                    >
                        {/* Dynamic Glow Background */}
                        <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                            style={{ backgroundColor: theme.hex }}
                        />
                        <MainIcon
                            size={24}
                            style={{ color: theme.hex }}
                            strokeWidth={1.5}
                            className="relative z-10 drop-shadow-md"
                        />
                    </div>
                </div>

                {/* 2. MAIN INFO */}
                {/* 2. MAIN INFO */}
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                    <h3 className="text-base font-bold text-zinc-100 truncate group-hover:text-white transition-colors">
                        {item?.name}
                    </h3>

                    <div className="flex items-center gap-2 flex-wrap">
                        {item?.brand && (
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider truncate">
                                {item.brand}
                            </span>
                        )}

                        {item?.brand && <span className="text-[8px] text-zinc-800">●</span>}

                        <span
                            className="text-[9px] font-black uppercase tracking-widest"
                            style={{ color: theme.hex }}
                        >
                            {theme.label}
                        </span>

                        {item.supplier && (
                            <>
                                <span className="text-[8px] text-zinc-800">●</span>
                                <span className="text-[10px] text-zinc-600 font-medium truncate max-w-[150px]">
                                    {item.supplier}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* RIGHT SIDE: Compact & Data-Rich Layout */}
                <div className="flex items-center gap-6">

                    {/* 3. STOCK DASHBOARD */}
                    <div className="hidden sm:flex flex-col items-end justify-center min-w-[85px]">
                        <div className="flex items-baseline gap-1">
                            <span className={`text-2xl font-black tracking-tighter ${statusColor.text}`}>
                                {stats.isFractional ? stats.effectiveStock.toFixed(1) : stats.atual}
                            </span>
                            <span className="text-[10px] font-bold text-zinc-600 uppercase">
                                {stats.isFractional ? stats.usageUnit : item?.unit}
                            </span>
                        </div>

                        {/* Visual Bar - With Track */}
                        <div className="w-[80px] h-1.5 bg-zinc-800/30 rounded-full mt-1 overflow-hidden relative">
                            <div className="absolute inset-0 bg-zinc-800/20" /> {/* Background Track */}
                            <div
                                className={`h-full ${statusColor.bg} shadow-[0_0_10px_-2px] shadow-current transition-all duration-700 ease-out relative z-10`}
                                style={{ width: `${progressWidth}%`, opacity: 0.9 }}
                            />
                        </div>

                        <span className="text-[9px] font-bold text-zinc-600 mt-1 uppercase tracking-wider">
                            Est. Mín: {stats.min}
                        </span>
                    </div>

                    {/* 4. FINANCIALS */}
                    <div className="hidden md:flex flex-col items-end justify-center min-w-[85px]">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider mb-0.5">Total</span>
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-mono font-bold text-zinc-300">
                                {formatCurrency(stats.atual * stats.unitPrice)}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">
                                Unit: <span className="text-zinc-400">{stats.unitPrice > 0 ? formatCurrency(stats.unitPrice) : '--'}</span>
                            </span>
                        </div>
                    </div>

                    {/* 5. ACTIONS - Subtle Separation */}
                    <div className="flex items-center gap-1 pl-4 border-l border-zinc-800/20">
                        <Tooltip text="Gerar Etiqueta">
                            <button
                                onClick={(e) => { e.stopPropagation(); onLabel && onLabel(item); }}
                                className="w-8 h-8 flex items-center justify-center hover:bg-sky-500/10 text-zinc-500 hover:text-sky-500 rounded-lg transition-all"
                            >
                                <QrCode size={16} strokeWidth={1.5} />
                            </button>
                        </Tooltip>

                        {(item.link_compra || item.purchaseLink || item.link) && (
                            <Tooltip text="Comprar">
                                <button
                                    onClick={(e) => { e.stopPropagation(); window.open(item.link_compra || item.purchaseLink || item.link, '_blank'); }}
                                    className="w-8 h-8 flex items-center justify-center hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-500 rounded-lg transition-all"
                                >
                                    <ShoppingCart size={16} strokeWidth={1.5} />
                                </button>
                            </Tooltip>
                        )}

                        <Tooltip text="Consumo Rápido">
                            <button
                                onClick={(e) => { e.stopPropagation(); onQuickConsume && onQuickConsume(item); }}
                                className="w-8 h-8 flex items-center justify-center hover:bg-orange-500/10 text-zinc-500 hover:text-orange-500 rounded-lg transition-all"
                            >
                                <Zap size={16} strokeWidth={1.5} />
                            </button>
                        </Tooltip>

                        <Tooltip text="Histórico">
                            <button onClick={(e) => { e.stopPropagation(); onHistory(item); }} className="w-8 h-8 flex items-center justify-center hover:bg-white/5 text-zinc-500 hover:text-blue-400 rounded-lg transition-all">
                                <History size={16} strokeWidth={1.5} />
                            </button>
                        </Tooltip>

                        <Tooltip text="Editar">
                            <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="w-8 h-8 flex items-center justify-center hover:bg-white/5 text-zinc-500 hover:text-emerald-400 rounded-lg transition-all">
                                <Edit2 size={16} strokeWidth={1.5} />
                            </button>
                        </Tooltip>

                        <Tooltip text="Excluir">
                            <button onClick={(e) => { e.stopPropagation(); onDelete(item?.id); }} className="w-8 h-8 flex items-center justify-center hover:bg-rose-500/10 text-zinc-500 hover:text-rose-500 rounded-lg transition-all">
                                <Trash2 size={16} strokeWidth={1.5} />
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </div>
    );
});
