import React from "react";
import { Gauge, Coins, AlertTriangle, Search, Filter, LayoutGrid, List, Plus } from "lucide-react";
import Button from "../../../../components/ui/Button";

export const CabecalhoFilamentos = ({
    estatisticas,
    contagemEstoqueBaixo,
    aoBuscar,
    modoVisualizacao,
    setModoVisualizacao,
    aoAdicionar
}) => {
    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
            {/* 1. HUD SUPERIOR (Estatísticas) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Estatística: Peso Total */}
                <div className="relative overflow-hidden group rounded-3xl bg-zinc-900/40 border border-white/5 p-5 backdrop-blur-sm transition-all hover:bg-zinc-900/60">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-50" />
                    <div className="flex items-start justify-between relative z-10">
                        <div>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Total em Estoque</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-white tracking-tighter shadow-emerald-500/50 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                    {estatisticas?.pesoKg?.toFixed(1) || "0.0"}
                                </span>
                                <span className="text-sm font-bold text-zinc-500 uppercase">kg</span>
                            </div>
                        </div>
                        <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
                            <Gauge size={20} />
                        </div>
                    </div>
                </div>

                {/* Estatística: Valor Patrimonial */}
                <div className="relative overflow-hidden group rounded-3xl bg-zinc-900/40 border border-white/5 p-5 backdrop-blur-sm transition-all hover:bg-zinc-900/60">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-transparent opacity-50" />
                    <div className="flex items-start justify-between relative z-10">
                        <div>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Patrimônio Investido</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-white tracking-tighter">
                                    {(estatisticas?.valorTotal || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                                </span>
                            </div>
                        </div>
                        <div className="p-3 bg-violet-500/10 rounded-2xl border border-violet-500/20 text-violet-400">
                            <Coins size={20} />
                        </div>
                    </div>
                </div>

                {/* Estatística: Saúde / Alertas */}
                <div className={`
          relative overflow-hidden group rounded-3xl border p-5 backdrop-blur-sm transition-all
          ${contagemEstoqueBaixo > 0
                        ? 'bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10'
                        : 'bg-zinc-900/40 border-white/5 hover:bg-zinc-900/60'}
        `}>
                    <div className="flex items-start justify-between relative z-10">
                        <div>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Status do Rack</span>
                            {contagemEstoqueBaixo > 0 ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-bold text-rose-400 uppercase tracking-tight">
                                        {contagemEstoqueBaixo} Carretéis Baixos
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-bold text-emerald-400 uppercase tracking-tight">Estoque Saudável</span>
                                </div>
                            )}
                            <span className="text-[10px] text-zinc-600 block mt-1 leading-tight">
                                {contagemEstoqueBaixo > 0 ? "Considere reposição em breve." : "Nenhuma ação necessária no momento."}
                            </span>
                        </div>
                        <div className={`p-3 rounded-2xl border ${contagemEstoqueBaixo > 0 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse' : 'bg-zinc-800/50 border-white/5 text-zinc-600'}`}>
                            <AlertTriangle size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. BARRA DE AÇÕES (Busca & Controles) */}
            <div className="flex items-center justify-between gap-4">
                {/* Barra de Busca */}
                <div className="relative flex-1 max-w-lg group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search size={16} className="text-zinc-500 group-focus-within:text-sky-400 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por cor, material ou marca..."
                        onChange={(e) => aoBuscar(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 bg-zinc-900/50 border border-white/5 rounded-2xl text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-sky-500/30 focus:ring-1 focus:ring-sky-500/30 transition-all font-medium"
                    />
                </div>

                {/* Controles da Direita */}
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex p-1 bg-zinc-900/80 border border-white/5 rounded-xl">
                        <button
                            onClick={() => setModoVisualizacao('grid')}
                            className={`p-2 rounded-lg transition-all ${modoVisualizacao === 'grid' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-600 hover:text-zinc-300'}`}
                            title="Visualização em Grade"
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setModoVisualizacao('table')}
                            className={`p-2 rounded-lg transition-all ${modoVisualizacao === 'table' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-600 hover:text-zinc-300'}`}
                            title="Visualização em Lista"
                        >
                            <List size={18} />
                        </button>
                    </div>

                    <Button
                        onClick={aoAdicionar}
                        variant="primary"
                        className="h-12 px-6 rounded-2xl font-bold uppercase tracking-wider text-xs shadow-lg shadow-sky-500/20"
                        icon={Plus}
                    >
                        Novo Carretel
                    </Button>
                </div>
            </div>
        </div>
    );
};
