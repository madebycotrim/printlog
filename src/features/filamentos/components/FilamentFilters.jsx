import React, { useMemo } from 'react';
import { Filter, Grid, List as ListIcon, Layers, Palette, ChevronDown, Check } from 'lucide-react';

export default function FilamentFilters({
    filters,
    setFilters,
    viewMode,
    setViewMode,
    groupBy,
    setGroupBy,
    availableBrands = [],
    availableMaterials = []
}) {
    // Helper to toggle array filters
    const toggleFilter = (key, value) => {
        setFilters(prev => {
            const current = prev[key] || [];
            const newArray = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [key]: newArray };
        });
    };

    // Helper to generic dropdown wrapper (simulated for simplicity/speed or could be a real dropdown component)
    // For this implementation, we'll use standard select for simplicity or custom buttons if preferred.
    // Let's use a horizontal scrollable bar with pills for a modern touch.

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">

                {/* --- LEFT: GROUP BY SWITCH --- */}
                <div className="flex items-center p-1 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                    <button
                        onClick={() => setGroupBy('material')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${groupBy === 'material' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <Layers size={14} /> Material
                    </button>
                    <button
                        onClick={() => setGroupBy('color')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${groupBy === 'color' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <Palette size={14} /> Cor
                    </button>
                </div>

                {/* --- RIGHT: VIEW MODE --- */}
                <div className="flex items-center p-1 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-zinc-800 text-rose-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <Grid size={16} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-zinc-800 text-rose-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <ListIcon size={16} />
                    </button>
                </div>
            </div>

            {/* --- FILTER PILLS --- */}
            {/* Creates a specific area for filtering by specific attributes */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 mr-2 text-zinc-500">
                    <Filter size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Filtros:</span>
                </div>

                {/* Status Toggle */}
                <button
                    onClick={() => setFilters(prev => ({ ...prev, lowStock: !prev.lowStock }))}
                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wide transition-all flex items-center gap-1.5 ${filters.lowStock
                        ? 'bg-rose-500/10 border-rose-500 text-rose-500'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                >
                    {filters.lowStock && <Check size={12} />}
                    Baixo Estoque
                </button>

                {/* Material Filters (Dynamic) */}
                {availableMaterials.slice(0, 5).map(mat => (
                    <button
                        key={mat}
                        onClick={() => toggleFilter('materials', mat)}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wide transition-all ${filters.materials?.includes(mat)
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                            }`}
                    >
                        {mat}
                    </button>
                ))}

                {/* Brand Filters (Dynamic - Top 3) */}
                {availableBrands.slice(0, 3).map(brand => (
                    <button
                        key={brand}
                        onClick={() => toggleFilter('brands', brand)}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wide transition-all ${filters.brands?.includes(brand)
                            ? 'bg-sky-500/10 border-sky-500 text-sky-500'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                            }`}
                    >
                        {brand}
                    </button>
                ))}
            </div>

            {/* Active Filters Summary / Clear All */}
            {(filters.lowStock || filters.materials?.length > 0 || filters.brands?.length > 0) && (
                <button
                    onClick={() => setFilters({ lowStock: false, materials: [], brands: [] })}
                    className="self-start text-[10px] text-rose-500 hover:text-rose-400 font-bold uppercase tracking-wider mt-1"
                >
                    Limpar todos os filtros
                </button>
            )}

        </div>
    );
}
