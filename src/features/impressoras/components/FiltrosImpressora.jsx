import React from 'react';
import { Filter } from 'lucide-react';

export default function FiltrosImpressora({
    filters,
    setFilters,
    availableBrands = []
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

    const toggleStatus = (status) => {
        toggleFilter('status', status);
    };

    const hasActiveFilters = filters.status?.length > 0 || filters.brands?.length > 0;

    return (

        <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

                {/* --- SEÇÃO DE FILTROS --- */}
                <div className="flex flex-wrap items-center gap-2 flex-1">
                    <div className="flex items-center gap-2 mr-3 text-zinc-500">
                        <Filter size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Filtros:</span>
                    </div>

                    {/* Status Filters */}
                    {[
                        { id: 'printing', label: 'Imprimindo', color: 'emerald' },
                        { id: 'idle', label: 'Ociosa', color: 'zinc' },
                        { id: 'maintenance', label: 'Manutenção', color: 'orange' },
                        { id: 'error', label: 'Erro', color: 'rose' }
                    ].map(status => (
                        <button
                            key={status.id}
                            onClick={() => toggleStatus(status.id)}
                            className={`
                                px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border
                                ${filters.status?.includes(status.id)
                                    ? `bg-${status.color}-500/10 border-${status.color}-500 text-${status.color}-500`
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'}
                            `}
                        >
                            {status.label}
                        </button>
                    ))}

                    <div className="w-px h-4 bg-zinc-800 mx-2" />

                    {/* Brand Filters */}
                    {availableBrands.slice(0, 5).map(brand => (
                        <button
                            key={brand}
                            onClick={() => toggleFilter('brands', brand)}
                            className={`
                                px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border
                                ${filters.brands?.includes(brand)
                                    ? 'bg-sky-500/10 border-sky-500 text-sky-500'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'}
                            `}
                        >
                            {brand}
                        </button>
                    ))}

                    {/* Clear Button */}
                    {hasActiveFilters && (
                        <button
                            onClick={() => setFilters({ status: [], brands: [] })}
                            className="ml-2 text-[10px] text-rose-500 hover:text-rose-400 font-bold uppercase tracking-wider underline decoration-rose-500/30 hover:decoration-rose-500"
                        >
                            Limpar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
