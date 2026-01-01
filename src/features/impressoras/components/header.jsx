import React from "react";
import { Search, Plus } from "lucide-react";

/**
 * Componente de cabeçalho da seção de impressoras.
 * @param {string} busca - Valor atual do campo de pesquisa.
 * @param {function} setBusca - Função para atualizar o termo de pesquisa.
 * @param {function} onAddClick - Função disparada ao clicar no botão de adicionar.
 */
export default function HeaderImpressoras({ busca, setBusca, onAddClick }) {
    
    // Tratamento para garantir que o termo de busca seja sempre uma string (evita erro de componente uncontrolled)
    const termoBusca = busca || "";

    return (
        <header className="h-20 px-10 flex items-center justify-between z-40 relative border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md">
            <div className="flex flex-col gap-1">
                <h1 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                    Gestão de Hardware
                </h1>
                <span className="text-xl uppercase font-bold tracking-tight text-zinc-100">
                    Minhas Impressoras
                </span>
            </div>

            <div className="flex items-center gap-5">
                {/* Barra de Pesquisa */}
                <div className="relative group">
                    <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-zinc-400 transition-colors"
                        size={15}
                    />
                    <input
                        className="w-72 bg-zinc-900/50 border border-zinc-800/80 rounded-xl py-2 pl-11 pr-4 text-sm text-zinc-300 outline-none transition-all placeholder:text-zinc-600 focus:border-zinc-600 focus:bg-zinc-900/80 focus:ring-1 focus:ring-zinc-800"
                        placeholder="Pesquisar marca ou modelo..."
                        value={termoBusca}
                        onChange={(e) => setBusca?.(e.target.value)}
                    />
                </div>

                {/* Divisor */}
                <div className="h-6 w-px bg-zinc-800 mx-1" />

                {/* Botão de Adição */}
                <button
                    onClick={() => onAddClick?.()}
                    className="h-10 px-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-wide flex items-center gap-2.5 transition-all active:scale-[0.98] shadow-sm"
                >
                    <Plus size={16} strokeWidth={2.5} />
                    Adicionar Impressora
                </button>
            </div>
        </header>
    );
}