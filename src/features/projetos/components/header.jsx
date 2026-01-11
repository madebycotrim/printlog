import React from "react";
import {
    Search,
    X,
    Plus
} from "lucide-react";

/**
 * Componente de cabeçalho da seção de orçamentos com estética técnica Amber corrigida.
 */
export default function HeaderOrcamentos({
    termoBusca = "",
    setTermoBusca,
}) {
    const handleSetBusca = (valor) => {
        if (typeof setTermoBusca === 'function') {
            setTermoBusca(valor);
        }
    };

    return (
        <header className="h-20 px-10 flex items-center justify-between z-40 relative border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl overflow-hidden">
            
            {/* 1. ASSINATURA VISUAL: LINHA DE GRADIENTE AMBER (TOP) */}
            {/* Corrigido: Removido Cyan/Indigo para manter a identidade de cor do módulo */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-orange-900 via-amber-500 to-yellow-900 opacity-40" />

            {/* TÍTULO E IDENTIFICAÇÃO DO MÓDULO */}
            <div className="flex flex-col relative">
                <div className="flex items-center gap-2 mb-0.5">
                    <h1 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">
                        Gestão Comercial
                    </h1>
                </div>
                <span className="text-xl font-black uppercase tracking-tighter text-white">
                    Fluxo de <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Pedidos</span>
                </span>
            </div>

            <div className="flex items-center gap-6">
                {/* Barra de Pesquisa Técnica (FOCO AMBER) */}
                <div className="relative group">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${termoBusca ? 'text-amber-400' : 'text-zinc-600'}`}>
                        <Search size={14} strokeWidth={3} />
                    </div>

                    <input
                        className="
                            w-72 bg-zinc-900/40 border border-white/5 rounded-xl py-2.5 pl-11 pr-10 
                            text-[11px] text-zinc-200 outline-none transition-all font-bold uppercase tracking-widest 
                            focus:border-amber-500/50 focus:bg-zinc-900/80 focus:ring-4 focus:ring-amber-500/10 
                            placeholder:text-zinc-700 placeholder:text-[9px]
                        "
                        placeholder="Filtrar registros por cliente ou ID..."
                        value={termoBusca}
                        onChange={(e) => handleSetBusca(e.target.value)}
                    />

                    {termoBusca && (
                        <button
                            onClick={() => handleSetBusca("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-rose-500 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Divisor de Fibra Ótica */}
                <div className="h-8 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent mx-1" />

                {/* Botão de Ação Principal (AMBER SOLID - ALTO CONTRASTE) */}
                <button
                    onClick={() => window.location.pathname = "/calculadora"}
                    className="
                        group relative h-11 px-6 overflow-hidden bg-amber-500 hover:bg-amber-400 
                        rounded-xl transition-all duration-300 active:scale-95 shadow-lg shadow-amber-900/40
                    "
                >
                    {/* Brilho Interno no Hover */}
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative flex items-center gap-3 text-zinc-950">
                        {/* Ícone e Texto em Zinc-950 para legibilidade extrema sobre o amarelo */}
                        <Plus size={16} strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                            Novo Orçamento
                        </span>
                    </div>
                </button>
            </div>

            {/* REFLEXO DE LUZ AMBER (Sutil no fundo) */}
            <div className="absolute -bottom-10 right-20 w-40 h-20 bg-amber-500/10 blur-[60px] pointer-events-none" />
        </header>
    );
}