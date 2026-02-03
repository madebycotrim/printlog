import React from 'react';
import { Filter, Grid, List as ListIcon, X } from 'lucide-react';

export default function FiltrosFilamento({
    filtros,
    setFiltros,
    modoVisualizacao,
    setModoVisualizacao,
    marcasDisponiveis = [],
    materiaisDisponiveis = []
}) {
    // Helper para alternar filtros de array
    const alternarFiltro = (chave, valor) => {
        setFiltros(anterior => {
            const atual = anterior[chave] || [];
            const novoArray = atual.includes(valor)
                ? atual.filter(item => item !== valor)
                : [...atual, valor];
            return { ...anterior, [chave]: novoArray };
        });
    };

    // Limites
    const MAX_MATERIAIS_VISIVEIS = 5;

    const possuiFiltrosAtivos = filtros.estoqueBaixo || filtros.materiais?.length > 0 || filtros.marcas?.length > 0;

    return (

        <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

                {/* --- SEÇÃO DE FILTROS --- */}
                <div className="flex flex-wrap items-center gap-2 flex-1">
                    <div className="flex items-center gap-2 mr-3 text-zinc-500">
                        <Filter size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Filtros:</span>
                    </div>

                    {/* Alternar Status */}
                    <button
                        onClick={() => setFiltros(anterior => ({ ...anterior, estoqueBaixo: !anterior.estoqueBaixo }))}
                        className={`
                            px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border
                            ${filtros.estoqueBaixo
                                ? 'bg-rose-500/10 border-rose-500 text-rose-500'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'}
                        `}
                    >
                        Baixo Estoque
                    </button>

                    <div className="w-px h-4 bg-zinc-800 mx-2" />

                    {/* Filtros de Material */}
                    {materiaisDisponiveis.slice(0, MAX_MATERIAIS_VISIVEIS).map(mat => (
                        <button
                            key={mat}
                            onClick={() => alternarFiltro('materiais', mat)}
                            className={`
                                px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border
                                ${filtros.materiais?.includes(mat)
                                    ? 'bg-rose-500/10 border-rose-500 text-rose-500'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'}
                            `}
                        >
                            {mat}
                        </button>
                    ))}

                    {/* Filtros de Marca (Apenas alguns populares) */}
                    {marcasDisponiveis.slice(0, 3).map(marca => (
                        <button
                            key={marca}
                            onClick={() => alternarFiltro('marcas', marca)}
                            className={`
                                px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border
                                ${filtros.marcas?.includes(marca)
                                    ? 'bg-rose-500/10 border-rose-500 text-rose-500'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'}
                            `}
                        >
                            {marca}
                        </button>
                    ))}

                    {/* Botão Limpar */}
                    {possuiFiltrosAtivos && (
                        <button
                            onClick={() => setFiltros({ estoqueBaixo: false, materiais: [], marcas: [] })}
                            className="ml-2 text-[10px] text-rose-500 hover:text-rose-400 font-bold uppercase tracking-wider underline decoration-rose-500/30 hover:decoration-rose-500"
                        >
                            Limpar
                        </button>
                    )}
                </div>

                {/* --- ALTERNADOR DE MODO DE VISUALIZAÇÃO --- */}
                <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-lg shrink-0">
                    <button
                        onClick={() => setModoVisualizacao('grid')}
                        className={`p-1.5 rounded-md transition-all duration-300 ${modoVisualizacao === 'grid'
                            ? 'bg-zinc-800 text-zinc-200 shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-400'}`}
                    >
                        <Grid size={16} />
                    </button>
                    <button
                        onClick={() => setModoVisualizacao('list')}
                        className={`p-1.5 rounded-md transition-all duration-300 ${modoVisualizacao === 'list'
                            ? 'bg-zinc-800 text-zinc-200 shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-400'}`}
                    >
                        <ListIcon size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
