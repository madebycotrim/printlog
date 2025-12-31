import React from "react";
import { Search, LayoutGrid, List, Plus } from "lucide-react";

export default function FilamentHeader({ 
    busca = "", // Fallback para string vazia evita erro de input controlado/não controlado
    setBusca, 
    viewMode, 
    setViewMode, 
    onAddClick 
}) {
    // Handler para garantir que a atualização de busca seja sempre tratada como string
    const aoMudarBusca = (e) => {
        if (setBusca) {
            setBusca(e.target.value);
        }
    };

    return (
        <header className="h-20 px-10 flex items-center justify-between z-40 relative border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md">
            <div className="flex flex-col gap-1">
                <h1 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                    Gestão de Inventário
                </h1>
                <span className="text-xl font-bold uppercase tracking-tight text-zinc-100">
                    Meus Filamentos
                </span>
            </div>

            <div className="flex items-center gap-5">
                {/* Seletor de Visualização Refinado */}
                <div className="flex bg-zinc-900/50 border border-zinc-800/50 p-1 rounded-xl backdrop-blur-sm">
                    <button 
                        onClick={() => setViewMode && setViewMode('grid')} 
                        className={`p-1.5 rounded-lg transition-all duration-200 ${
                            viewMode === 'grid' 
                            ? 'bg-sky-700 text-zinc-100 shadow-sm' 
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`} 
                        title="Exibição em Grade"
                    >
                        <LayoutGrid size={16} />
                    </button>
                    <button 
                        onClick={() => setViewMode && setViewMode('list')} 
                        className={`p-1.5 rounded-lg transition-all duration-200 ${
                            viewMode === 'list' 
                            ? 'bg-sky-700 text-zinc-100 shadow-sm' 
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`} 
                        title="Exibição em Lista"
                    >
                        <List size={16} />
                    </button>
                </div>

                {/* Barra de Busca Refinada */}
                <div className="relative group">
                    <Search 
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-zinc-400 transition-colors" 
                        size={15} 
                    />
                    <input 
                        className="w-72 bg-zinc-900/50 border border-zinc-800/80 rounded-xl py-2 pl-11 pr-4 text-sm text-zinc-300 outline-none transition-all placeholder:text-zinc-600 focus:border-zinc-600 focus:bg-zinc-900/80 focus:ring-1 focus:ring-zinc-800" 
                        placeholder="Pesquisar marca, cor ou material..." 
                        value={busca} 
                        onChange={aoMudarBusca} 
                    />
                </div>

                {/* Divisor Sutil */}
                <div className="h-6 w-px bg-zinc-800 mx-1" />

                {/* Botão Principal: Adicionar Filamento */}
                <button 
                    onClick={onAddClick} 
                    className="h-10 px-6 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold uppercase tracking-wide flex items-center gap-2.5 transition-all active:scale-[0.98] shadow-sm"
                >
                    <Plus size={16} strokeWidth={2.5} /> 
                    Adicionar Filamento
                </button>
            </div>
        </header>
    );
}