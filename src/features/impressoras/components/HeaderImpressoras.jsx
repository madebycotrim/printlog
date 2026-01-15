import React from "react";
import { Search, Plus, X } from "lucide-react";

/**
 * Cabeçalho da área de impressoras com um visual técnico ajustado.
 */
export default function HeaderImpressoras({ busca, setBusca, onAddClick }) {
    
    // Garante que a busca seja sempre tratada como texto
    const termoBusca = busca || "";

    const handleClearBusca = () => setBusca?.("");

    return (
        <header className="h-20 px-10 flex items-center justify-between z-40 relative border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl overflow-hidden" role="banner">
            
            {/* 1. DETALHE VISUAL: LINHA EM GRADIENTE VERDE (TOPO) */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-emerald-800 via-emerald-500 to-teal-800 opacity-40" />

            {/* TÍTULO E IDENTIFICAÇÃO DO MÓDULO */}
            <div className="flex flex-col relative">
                <div className="flex items-center gap-2 mb-0.5">
                    <h1 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">
                        Gestão de Máquinas
                    </h1>
                </div>
                <span className="text-xl font-black uppercase tracking-tighter text-white">
                    Minhas <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Impressoras</span>
                </span>
            </div>

            <div className="flex items-center gap-6">
                {/* BARRA DE BUSCA TÉCNICA (ESTILO VERDE) */}
                <div className="relative group" role="search">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${termoBusca ? 'text-emerald-400' : 'text-zinc-600'}`}>
                        <Search size={14} strokeWidth={3} />
                    </div>
                    
                    <input
                        className="
                            w-72 bg-zinc-950/40/40 border border-white/5 rounded-xl py-2.5 pl-11 pr-10 
                            text-[11px] text-zinc-200 outline-none transition-all font-bold uppercase tracking-widest
                            focus:border-emerald-500/50 focus:bg-zinc-950/40/80 focus:ring-4 focus:ring-emerald-500/10
                            placeholder:text-zinc-700 placeholder:text-[9px]
                        "
                        placeholder="Busque por ID ou modelo..."
                        value={termoBusca}
                        onChange={(e) => setBusca?.(e.target.value)}
                    />

                    {termoBusca && (
                        <button
                            onClick={handleClearBusca}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-rose-500 transition-colors"
                            aria-label="Limpar busca"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* DIVISOR DE ESTILO */}
                <div className="h-8 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent mx-1" aria-hidden="true" />

                {/* BOTÃO DE ADICIONAR (CORES AJUSTADAS) */}
                <button
                    onClick={() => onAddClick?.()}
                    className="
                        group relative h-11 px-6 overflow-hidden rounded-xl 
                        bg-emerald-500 hover:bg-emerald-400 transition-all duration-300 
                        active:scale-95 shadow-lg shadow-emerald-900/40
                    "
                >
                    {/* Brilho interno ao passar o mouse */}
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <div className="relative flex items-center gap-3 text-zinc-950">
                        <Plus size={16} strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                            Adicionar Impressora
                        </span>
                    </div>
                </button>
            </div>

            {/* REFLEXO DE LUZ VERDE (SUTIL AO FUNDO) */}
            <div className="absolute -bottom-10 right-20 w-40 h-20 bg-emerald-500/10 blur-[60px] pointer-events-none" aria-hidden="true" />
        </header>
    );
}
