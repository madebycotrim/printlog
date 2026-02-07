import { Filter } from 'lucide-react';

export default function InsumoFilters({
    filters,
    setFilters,
    categories = [] // Array of { id, label }
}) {
    // Toggle Category Filter
    const toggleCategory = (catId) => {
        setFilters(prev => {
            const current = prev.categories || [];
            const newArray = current.includes(catId)
                ? current.filter(c => c !== catId)
                : [...current, catId];
            return { ...prev, categories: newArray };
        });
    };

    const hasActiveFilters = filters.lowStock || filters.categories?.length > 0;

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

                {/* --- SEÇÃO DE FILTROS --- */}
                <div className="flex flex-wrap items-center gap-2 flex-1">
                    <div className="flex items-center gap-2 mr-3 text-zinc-500">
                        <Filter size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Filtros:</span>
                    </div>

                    {/* Status Toggle */}
                    <button
                        onClick={() => setFilters(prev => ({ ...prev, lowStock: !prev.lowStock }))}
                        className={`
                            px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border
                            ${filters.lowStock
                                ? 'bg-orange-500/10 border-orange-500 text-orange-500'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'}
                        `}
                    >
                        Baixo Estoque
                    </button>

                    <div className="w-px h-4 bg-zinc-800 mx-2" />


                    {/* Category Filters */}
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => toggleCategory(cat.id)}
                            className={`
                                px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border
                                ${filters.categories?.includes(cat.id)
                                    ? 'bg-orange-500/10 border-orange-500 text-orange-500'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'}
                            `}
                        >
                            {cat.label}
                        </button>
                    ))}

                    {/* Clear Button */}
                    {hasActiveFilters && (
                        <button
                            onClick={() => setFilters({ lowStock: false, categories: [] })}
                            className="ml-2 text-[10px] text-orange-500 hover:text-orange-400 font-bold uppercase tracking-wider underline decoration-orange-500/30 hover:decoration-orange-500"
                        >
                            Limpar
                        </button>
                    )}
                </div>

                {/* --- RIGHT CONTROLS (Sort) --- */}
                <div className="flex items-center gap-4">
                    <select
                        value={filters.sortOption || 'name'}
                        onChange={(e) => setFilters(prev => ({ ...prev, sortOption: e.target.value }))}
                        className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] uppercase font-bold tracking-wider rounded-lg px-3 py-2 h-[36px] focus:outline-none focus:border-zinc-700 cursor-pointer"
                    >
                        <option value="name">Nome (A-Z)</option>
                        <option value="price_asc">Menor Preço</option>
                        <option value="price_desc">Maior Preço</option>
                        <option value="stock_asc">Menor Estoque</option>
                        <option value="stock_desc">Maior Estoque</option>
                    </select>
                </div>

            </div>

        </div>
    );
}


