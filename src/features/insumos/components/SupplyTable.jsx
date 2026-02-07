import React from "react";
import { formatCurrency } from "../../../utils/numbers";
import {
    Edit2, Trash2, History, Zap, QrCode, ShoppingCart,
    ArrowUpDown, ArrowUp, ArrowDown, Box,
    Wrench, Cpu, FlaskConical, Package, Hammer, Disc,
    Magnet, Droplets, Paintbrush, Layers, ShieldCheck, Ruler, Anchor, Link, PackageSearch
} from "lucide-react";
import { Tooltip } from "../../../components/ui/Tooltip";

export default function SupplyTable({
    items,
    onEdit,
    onDelete,
    onHistory,
    onQuickConsume,
    onLabel,
    sortOption,
    onSortChange,
    selectedItems = new Set(), // Set of IDs
    onSelectionChange,
    highlightedItemId // Prop for Blink effect
}) {
    const allSelected = items.length > 0 && items.every(i => selectedItems.has(i.id));

    const handleSelectAll = () => {
        if (allSelected) {
            onSelectionChange(new Set());
        } else {
            onSelectionChange(new Set(items.map(i => i.id)));
        }
    };

    const handleSelectRow = (id) => {
        const newSet = new Set(selectedItems);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        onSelectionChange(newSet);
    };

    // Helper to pick category icon (MATCHING ModalInsumo.jsx)
    const getCategoryIcon = (category) => {
        if (!category) return Layers; // Default Geral = Layers
        const norm = category.toLowerCase();

        // Exact matches from ModalInsumo
        if (norm.includes("geral")) return Layers;
        if (norm.includes("embalagem")) return Box;
        if (norm.includes("fixacao") || norm.includes("fixação") || norm.includes("parafu")) return Link; // Was Anchor, now Link
        if (norm.includes("eletronica") || norm.includes("eletrônica")) return Zap;
        if (norm.includes("acabamento")) return Hammer; // Was Paintbrush, now Hammer
        if (norm.includes("outros")) return PackageSearch;

        // Extra mappings for things not in strict list but common
        if (norm.includes("quim") || norm.includes("cola") || norm.includes("resina")) return FlaskConical;
        if (norm.includes("ferramenta")) return Wrench;
        if (norm.includes("cla") || norm.includes("imã") || norm.includes("magnet")) return Magnet;

        return PackageSearch; // Fallback
    };

    return (
        <div className="w-full space-y-2">

            {/* Header / Toolbar */}
            <div className="flex items-center justify-between px-1 py-2 text-xs text-zinc-500 uppercase font-medium tracking-wider">
                <button
                    onClick={handleSelectAll}
                    className="hover:text-zinc-200 transition-colors flex items-center gap-2"
                >
                    {allSelected ? "Desmarcar Todos" : "Selecionar Todos"}
                </button>

                <div className="flex items-center gap-4">
                    {selectedItems.size > 0 && (
                        <span className="text-orange-500 font-bold normal-case bg-orange-500/10 px-2 py-0.5 rounded text-[10px] animate-in fade-in slide-in-from-right-4">
                            {selectedItems.size} selecionados
                        </span>
                    )}
                </div>
            </div>

            {items.length === 0 ? (
                <div className="w-full bg-[#09090b]/50 border border-zinc-800 rounded-xl p-12 text-center text-zinc-500">
                    Nenhum item encontrado
                </div>
            ) : (
                <div className="space-y-4">
                    {(() => {
                        // --- LOGIC: Grouping vs Flat ---
                        // Only group if sorting by Name (default).
                        // If sorting by Price/Stock, showing groups is confusing/wrong order.
                        const shouldGroup = sortOption === 'name';

                        if (!shouldGroup) {
                            // RENDER FLAT LIST
                            return (
                                <div className="space-y-2">
                                    {items.map(item => renderItem(item))}
                                </div>
                            );
                        }

                        // RENDER GROUPED LIST
                        // 1. Group items
                        const groups = items.reduce((acc, item) => {
                            const rawCat = item.category || item.categoria || 'Outros';
                            // Normalize somewhat for grouping keys
                            const key = rawCat.trim();
                            if (!acc[key]) acc[key] = [];
                            acc[key].push(item);
                            return acc;
                        }, {});

                        // 2. Sort groups alphabetically (with specific priority overrides if needed)
                        const sortedKeys = Object.keys(groups).sort((a, b) => {
                            if (a === 'Outros') return 1;
                            if (b === 'Outros') return -1;
                            return a.localeCompare(b);
                        });

                        // 3. Render Groups
                        return sortedKeys.map(groupName => {
                            const groupItems = groups[groupName];
                            const CategoryIcon = getCategoryIcon(groupName);

                            return (
                                <div key={groupName} className="space-y-2 animate-in fade-in duration-500 slide-in-from-bottom-2">
                                    {/* SECTION HEADER */}
                                    <div className="sticky top-0 z-10 flex items-center gap-2 py-2 px-1 bg-[#0c0c0e]/95 backdrop-blur-sm border-b border-white/5">
                                        <div className="p-1 rounded bg-zinc-800/50 text-orange-500">
                                            <CategoryIcon size={14} />
                                        </div>
                                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                            {groupName}
                                        </h3>
                                        <span className="text-[10px] text-zinc-600 font-mono bg-zinc-900 px-1.5 rounded">
                                            {groupItems.length}
                                        </span>
                                    </div>

                                    {/* ITEMS */}
                                    <div className="space-y-2">
                                        {groupItems.map(item => renderItem(item))}
                                    </div>
                                </div>
                            );
                        });
                    })()}
                </div>
            )}
        </div>
    );


    // Helper to render individual item (moved out of main loop for reuse in grouped/flat)
    function renderItem(item) {
        const stock = Number(item.currentStock || item.estoque_atual || 0);
        const min = Number(item.minStock || item.estoque_minimo || 0);
        const price = Number(item.price || item.preco || 0);

        // Status Logic
        const isZero = stock <= 0;
        const isLow = !isZero && stock < min;

        let statusColor = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
        let statusText = "Em Estoque";

        if (isZero) {
            statusColor = "bg-rose-500/10 text-rose-500 border-rose-500/20";
            statusText = "Esgotado";
        } else if (isLow) {
            statusColor = "bg-amber-500/10 text-amber-500 border-amber-500/20";
            statusText = "Baixo Estoque";
        }

        const isSelected = selectedItems.has(item.id);
        const CategoryIcon = getCategoryIcon(item.category || item.categoria);

        return (
            <div
                key={item.id}
                onClick={() => handleSelectRow(item.id)}
                className={`
                    group relative flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer select-none overflow-hidden
                    ${highlightedItemId === item.id ? 'animate-pulse ring-2 ring-orange-500 bg-orange-500/10' : ''}
                    ${isSelected
                        ? 'bg-zinc-900/80 border-orange-500/50 shadow-[inset_4px_0_0_0_#f97316]'
                        : 'bg-[#09090b] border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700 shadow-[inset_0_0_0_0_transparent]'
                    }
                `}
            >
                {/* Icon / Image Area */}
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all
                    ${isSelected
                        ? 'bg-orange-500/10 border-orange-500/20 text-orange-500'
                        : 'bg-zinc-800/30 border-zinc-800 text-zinc-500 group-hover:text-zinc-300 group-hover:border-zinc-700'
                    }
                `}>
                    <CategoryIcon size={24} strokeWidth={1.5} />
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                    <div className="flex items-center gap-3">
                        <span className={`text-base font-bold truncate ${isSelected ? 'text-orange-100' : 'text-zinc-100'}`}>
                            {item.name}
                        </span>
                        {item.brand && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                                {item.brand}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span className="flex items-center gap-1.5 uppercase tracking-wide">
                            {item.category || item.categoria || 'Geral'}
                            {item.supplier && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                    <span>{item.supplier}</span>
                                </>
                            )}
                        </span>
                    </div>

                    {(item.description || item.descricao) && (
                        <div className="text-[11px] text-zinc-600 truncate max-w-[400px]">
                            {item.description || item.descricao}
                        </div>
                    )}
                </div>

                {/* Price Info */}
                <div className="text-right pr-6 hidden md:block min-w-[120px]">
                    <div className="flex flex-col items-end gap-0.5">
                        <div className="text-sm font-medium text-zinc-200 font-mono">
                            {formatCurrency(price)} <span className="text-zinc-600 text-[10px] font-sans">/un</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wide">
                            Total: <span className="text-zinc-400">{formatCurrency(price * stock)}</span>
                        </div>
                    </div>
                </div>

                {/* Stock Info (Big Number) now with Status Badge */}
                <div className="text-right pr-6 hidden sm:block min-w-[140px]">
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-baseline justify-end gap-1.5">
                            <span className={`text-2xl font-bold font-mono tracking-tight ${isLow ? 'text-amber-500' : 'text-zinc-200'} ${isZero ? 'text-rose-500' : ''}`}>
                                {stock}
                            </span>
                            <span className="text-[10px] text-zinc-600 font-bold uppercase translate-y-[-2px]">
                                {item.unit}
                            </span>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${statusColor}`}>
                            {statusText}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 pl-6 border-l border-zinc-800/50 ml-2" onClick={(e) => e.stopPropagation()}>
                    <Tooltip text="Consumo Rápido">
                        <button onClick={() => onQuickConsume(item)} className="p-2 text-zinc-500 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-all">
                            <Zap size={18} strokeWidth={1.5} />
                        </button>
                    </Tooltip>

                    {(item.link_compra || item.purchaseLink) && (
                        <Tooltip text="Comprar">
                            <button onClick={() => window.open(item.link_compra || item.purchaseLink, '_blank')} className="p-2 text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all">
                                <ShoppingCart size={18} strokeWidth={1.5} />
                            </button>
                        </Tooltip>
                    )}

                    <Tooltip text="Histórico">
                        <button onClick={() => onHistory(item)} className="p-2 text-zinc-500 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all">
                            <History size={18} strokeWidth={1.5} />
                        </button>
                    </Tooltip>

                    <Tooltip text="Etiqueta">
                        <button onClick={() => onLabel(item)} className="p-2 text-zinc-500 hover:text-sky-500 hover:bg-sky-500/10 rounded-lg transition-all">
                            <QrCode size={18} strokeWidth={1.5} />
                        </button>
                    </Tooltip>

                    <Tooltip text="Editar">
                        <button onClick={() => onEdit(item)} className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-all">
                            <Edit2 size={18} strokeWidth={1.5} />
                        </button>
                    </Tooltip>

                    <Tooltip text="Excluir">
                        <button onClick={() => onDelete(item)} className="p-2 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all">
                            <Trash2 size={18} strokeWidth={1.5} />
                        </button>
                    </Tooltip>
                </div>

            </div>
        );
    }
}

