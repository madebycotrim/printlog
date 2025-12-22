import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import {
    ChevronLeft, Plus, Search, LayoutGrid, List, Thermometer, Droplets,
    BadgeDollarSign, AlertOctagon, Database, ChevronRight, Layers,
    Box, Activity, Hash
} from "lucide-react";

// --- COMPONENTES ---
import MainSidebar from "../components/MainSidebar";
import { getFilaments, saveFilament, deleteFilament } from "../features/filamentos/logic/filaments";
import { useLocalWeather } from "../hooks/useLocalWeather";

// --- COMPONENTES VISUAIS REUTILIZÁVEIS ---
import { FilamentCard, FilamentRow } from "../features/filamentos/components/cardFilamento";
import ModalFilamento from "../features/filamentos/components/modalFilamento.jsx";
import ModalBaixaRapida from "../features/filamentos/components/darBaixa.jsx";

const TechStatCard = ({ title, value, icon: Icon, colorClass, secondaryLabel, secondaryValue }) => (
    <div className="group relative h-[160px] p-6 rounded-2xl bg-[#09090b] border border-zinc-800/50 overflow-hidden flex flex-col justify-between transition-all hover:border-zinc-700/60 shadow-2xl">
        <div className="relative z-10 flex justify-between items-start">
            <div className={`p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 shadow-inner ${colorClass}`}>
                <Icon size={18} strokeWidth={2.5} />
            </div>
            <div className="text-right">
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.15em] mb-1.5">{title}</p>
                <h3 className="text-2xl font-black text-zinc-100 font-mono tracking-tighter leading-none">{value}</h3>
            </div>
        </div>
        <div className="relative z-10 pt-4 border-t border-white/5 flex justify-between items-center">
            <div className="flex flex-col">
                <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest leading-none mb-1">{secondaryLabel}</span>
                <span className="text-[11px] font-bold text-zinc-400 font-mono leading-none">{secondaryValue}</span>
            </div>
            <div className="h-1 w-8 bg-zinc-800 rounded-full overflow-hidden">
                <div className={`h-full bg-current ${colorClass} opacity-30 animate-pulse`} style={{ width: '60%' }}></div>
            </div>
        </div>
    </div>
);

// --- SEÇÃO DE GRUPO ---
function MaterialSection({ tipo, items, acoes, viewMode }) {
    const pesoTotal = items.reduce((acc, item) => acc + (Number(item.weightCurrent) || 0), 0);
    const pesoFormatado = pesoTotal >= 1000 ? `${(pesoTotal / 1000).toFixed(2)}kg` : `${Math.round(pesoTotal)}g`;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 py-2">
                <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sky-500 shadow-inner">
                    <Layers size={16} />
                </div>
                <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-100">{tipo}</h2>
                <div className="h-[1px] bg-gradient-to-r from-zinc-800 to-transparent flex-1 mx-4" />
                <div className="flex items-center gap-3 text-[10px] font-mono bg-zinc-900/50 border border-zinc-800/50 px-4 py-1.5 rounded-full">
                    <span className="text-zinc-500 uppercase tracking-tighter text-[9px]">Massa_Total</span>
                    <span className="text-sky-500 font-bold">{pesoFormatado}</span>
                    <div className="w-px h-3 bg-zinc-800" />
                    <span className="text-zinc-400">{items.length} UNIDADES</span>
                </div>
            </div>

            {/* RENDERIZAÇÃO CONDICIONAL BASEADA NO VIEWMODE */}
            <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6" 
                : "flex flex-col gap-3"
            }>
                {items.map(item => (
                    viewMode === 'grid' 
                        ? <FilamentCard key={item.id} item={item} {...acoes} />
                        : <FilamentRow key={item.id} item={item} {...acoes} />
                ))}
            </div>
        </div>
    );
}

export default function FilamentosPage() {
    const [, setLocation] = useLocation();
    const [larguraSidebar, setLarguraSidebar] = useState(72);
    const [filamentos, setFilamentos] = useState([]);
    const [busca, setBusca] = useState("");
    const { temp, humidity, loading } = useLocalWeather();

    // PERSISTÊNCIA DO MODO DE VISUALIZAÇÃO
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem("printlog_filaments_view") || "grid";
    });

    const [modalAberto, setModalAberto] = useState(false);
    const [itemEdicao, setItemEdicao] = useState(null);
    const [itemConsumo, setItemConsumo] = useState(null);

    useEffect(() => { setFilamentos(getFilaments()); }, []);

    // Salva a preferência sempre que mudar
    useEffect(() => {
        localStorage.setItem("printlog_filaments_view", viewMode);
    }, [viewMode]);

    const stats = useMemo(() => {
        const totalG = filamentos.reduce((acc, curr) => acc + Number(curr.weightCurrent || 0), 0);
        const valorTotal = filamentos.reduce((acc, curr) => acc + (Number(curr.price || 0) * (curr.weightCurrent / (curr.weightTotal || 1))), 0);
        const criticos = filamentos.filter(f => (f.weightCurrent / f.weightTotal) < 0.2).length;

        return { valorTotal, pesoKg: totalG / 1000, criticos };
    }, [filamentos]);

    const grupos = useMemo(() => {
        const filtrados = filamentos.filter(f =>
            f.name.toLowerCase().includes(busca.toLowerCase()) ||
            (f.type || f.material || "").toLowerCase().includes(busca.toLowerCase())
        );
        const map = {};
        filtrados.forEach(f => {
            const materialRaw = f.type || f.material || "OUTROS";
            const m = materialRaw.toUpperCase();
            if (!map[m]) map[m] = [];
            map[m].push(f);
        });
        return map;
    }, [filamentos, busca]);

    return (
        <div className="flex h-screen w-full bg-[#050505] text-zinc-100 font-sans overflow-hidden">
            <MainSidebar onCollapseChange={(collapsed) => setLarguraSidebar(collapsed ? 72 : 256)} />

            <main className="flex-1 flex flex-col relative transition-all duration-300 ease-in-out overflow-hidden" style={{ marginLeft: `${larguraSidebar}px` }}>

                <div className="absolute inset-x-0 top-0 h-[500px] z-0 pointer-events-none opacity-[0.03]"
                    style={{
                        backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                        maskImage: 'linear-gradient(to bottom, black, transparent)'
                    }}
                />

                <header className="h-20 min-h-[5rem] px-8 flex items-center justify-between border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl z-40 relative">
                    <div className="flex items-center gap-6">
                        <div>
                            <h1 className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400 leading-none mb-1.5">Hub de Materiais</h1>
                            <div className="flex items-center gap-4 text-[10px] font-mono font-bold">
                                <span className="flex items-center gap-1.5 text-amber-500/80">
                                    <Activity size={12} strokeWidth={3} /> {loading ? "SCANNING..." : `${temp}°C AMBIENTE`}
                                </span>
                                <div className="w-1 h-1 rounded-full bg-zinc-800" />
                                <span className="text-sky-500/80 uppercase">{humidity}% UMIDADE RELATIVA</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* SELETOR DE VISUALIZAÇÃO (GRID / LIST) */}
                        <div className="flex bg-zinc-900/50 border border-zinc-800 p-1 rounded-xl">
                            <button 
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-zinc-800 text-sky-400 shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}
                                title="Visualização em Grid"
                            >
                                <LayoutGrid size={16} />
                            </button>
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-zinc-800 text-sky-400 shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}
                                title="Visualização em Lista"
                            >
                                <List size={16} />
                            </button>
                        </div>

                        <div className="relative group">
                            <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-500 transition-colors" size={14} />
                            <input
                                className="w-64 bg-zinc-900/40 border border-zinc-800/60 rounded-xl py-2.5 pl-10 text-[11px] font-mono text-white focus:border-sky-500/40 outline-none transition-all placeholder:text-zinc-700"
                                placeholder="IDENTIFICAR_LOTE..."
                                value={busca}
                                onChange={e => setBusca(e.target.value)}
                            />
                        </div>
                        
                        <button
                            onClick={() => { setItemEdicao(null); setModalAberto(true); }}
                            className="h-[40px] px-6 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-3 shadow-lg shadow-sky-900/20 active:scale-95 transition-all"
                        >
                            <Plus size={16} strokeWidth={3} /> NOVO SUPRIMENTO
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 relative z-10">
                    <div className="max-w-[1600px] mx-auto space-y-12">

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <TechStatCard
                                title="Ativos em Estoque"
                                value={filamentos.length.toString().padStart(2, '0')}
                                icon={Box}
                                colorClass="text-sky-500"
                                secondaryLabel="Total de Unidades"
                                secondaryValue="CATALOGADAS"
                            />
                            <TechStatCard
                                title="Patrimônio Total"
                                value={`R$${Math.floor(stats.valorTotal)}`}
                                icon={BadgeDollarSign}
                                colorClass="text-emerald-500"
                                secondaryLabel="Custo de Inventário"
                                secondaryValue="OTIMIZADO"
                            />
                            <TechStatCard
                                title="Massa Volumétrica"
                                value={`${stats.pesoKg.toFixed(1)}kg`}
                                icon={Database}
                                colorClass="text-amber-500"
                                secondaryLabel="Capacidade Real"
                                secondaryValue="DISPONÍVEL"
                            />
                        </div>

                        <div className="space-y-16 pb-20">
                            {Object.entries(grupos).length > 0 ? (
                                Object.entries(grupos).map(([tipo, items]) => (
                                    <MaterialSection
                                        key={tipo}
                                        tipo={tipo}
                                        items={items}
                                        viewMode={viewMode}
                                        acoes={{
                                            onEdit: (item) => { setItemEdicao(item); setModalAberto(true); },
                                            onDelete: (id) => window.confirm("Remover lote?") && setFilamentos(deleteFilament(id)),
                                            onConsume: setItemConsumo
                                        }}
                                    />
                                ))
                            ) : (
                                <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800/40 rounded-[3rem] bg-zinc-900/5">
                                    <Search size={48} className="text-zinc-800 mb-4 animate-pulse" />
                                    <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]">Nenhum material no perímetro</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <ModalFilamento aberto={modalAberto} aoFechar={() => setModalAberto(false)} aoSalvar={(d) => setFilamentos(saveFilament(d))} dadosIniciais={itemEdicao} />
                <ModalBaixaRapida aberto={!!itemConsumo} aoFechar={() => setItemConsumo(null)} item={itemConsumo} aoSalvar={(d) => setFilamentos(saveFilament(d))} />
            </main>
        </div>
    );
}