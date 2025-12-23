import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Plus, Search, LayoutGrid, List, Layers,
    BadgeDollarSign, Database, Activity, Box, Scan, Check, AlertTriangle,
    ArrowUpRight, Droplets, Thermometer
} from "lucide-react";

import MainSidebar from "../components/MainSidebar";
import { getFilaments, saveFilament, deleteFilament } from "../features/filamentos/logic/filaments";
import { useLocalWeather } from "../hooks/useLocalWeather";
import { FilamentCard, FilamentRow } from "../features/filamentos/components/cardFilamento";
import ModalFilamento from "../features/filamentos/components/modalFilamento.jsx";
import ModalBaixaRapida from "../features/filamentos/components/darBaixa.jsx";

// --- UTILS ---
const formatBigNumber = (num) => {
    if (!num || isNaN(num)) return "0";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return Math.floor(num).toString();
};

// --- COMPONENTE: CARD DE SAÚDE DO ESTOQUE (DESIGN REFINADO) ---
const StockOverviewCard = ({ totalRolls, totalWeight, lowStockCount }) => {
    const isAlert = lowStockCount > 0;
    const accentColor = isAlert ? 'rose' : 'sky';

    return (
        <div className={`relative h-[135px] p-6 rounded-2xl bg-[#0a0a0b] border ${isAlert ? 'border-rose-500/30' : 'border-sky-500/20'} overflow-hidden flex items-center justify-between transition-all duration-500 group shadow-[0_8px_30px_rgb(0,0,0,0.12)]`}>
            {/* Efeito de Luz de Fundo */}
            <div className={`absolute -right-6 -top-6 w-32 h-32 blur-[60px] opacity-[0.08] rounded-full transition-colors duration-700 ${isAlert ? 'bg-rose-500' : 'bg-sky-500'}`} />

            <div className="flex items-center gap-6 relative z-10">
                <div className={`relative p-4 rounded-2xl bg-black border ${isAlert ? 'border-rose-500/40 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.1)]' : 'border-sky-500/30 text-sky-400'}`}>
                    {isAlert ? <AlertTriangle size={26} strokeWidth={2.5} className="animate-pulse" /> : <Box size={26} strokeWidth={2.5} />}
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${isAlert ? 'bg-rose-500 animate-ping' : 'bg-sky-500'}`} />
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.25em]">Stock_Protocol</p>
                    </div>
                    <h3 className={`text-2xl font-black font-mono tracking-tighter leading-none ${isAlert ? 'text-rose-500' : 'text-white'}`}>
                        {isAlert ? `${lowStockCount} LOW_NODES` : `${totalRolls.toString().padStart(2, '0')} ACTIVE_ROLLS`}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-tight">
                            {isAlert ? 'Reposição Necessária' : `Massa Total: ${totalWeight.toFixed(2)}kg`}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-end relative z-10">
                <div className="text-[9px] text-zinc-600 font-black uppercase mb-2 tracking-widest">Inventory</div>
                <div className="h-1.5 w-20 bg-zinc-900 rounded-full overflow-hidden border border-white/5 p-[1px]">
                    <div className={`h-full rounded-full transition-all duration-1000 ${isAlert ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-sky-500'}`} style={{ width: isAlert ? '100%' : '40%' }} />
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE: TECH STAT CARD (DESIGN REFINADO) ---
const TechStatCard = ({ title, value, icon: Icon, colorClass, secondaryLabel, secondaryValue, accent }) => (
    <div className="h-[135px] p-6 rounded-2xl bg-[#0a0a0b] border border-zinc-900 flex items-center justify-between group transition-all hover:border-zinc-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <div className="flex items-center gap-6">
            <div className={`p-4 rounded-2xl bg-black border border-zinc-800 ${colorClass} shadow-inner group-hover:scale-105 transition-transform duration-500`}>
                <Icon size={26} strokeWidth={2} />
            </div>
            <div>
                <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.25em] mb-1">{title}</p>
                <div className="flex flex-col">
                    <span className="text-[12px] text-zinc-300 font-black uppercase tracking-tight leading-tight">{secondaryLabel}</span>
                    <span className="text-[10px] text-zinc-500 font-bold mt-0.5">{secondaryValue}</span>
                </div>
            </div>
        </div>
        <div className="text-right flex flex-col justify-between h-full py-1">
            <h3 className="text-2xl font-black text-white font-mono tracking-tighter leading-none">{value}</h3>
            <div className="flex items-center gap-2 justify-end opacity-20 group-hover:opacity-100 transition-opacity">
                <span className="text-[8px] font-black text-zinc-600">LIVE_DATA</span>
                <Activity size={12} className="text-zinc-800" />
            </div>
        </div>
    </div>
);

// --- SEÇÃO DE MATERIAL (DESIGN PREMIUM) ---
function MaterialSection({ tipo, items, acoes, viewMode }) {
    const pesoTotal = items.reduce((acc, item) => acc + (Number(item.weightCurrent) || 0), 0);
    const pesoFormatado = (pesoTotal / 1000).toFixed(2);

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-6">
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sky-500 shadow-xl flex items-center justify-center">
                    <Layers size={20} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                    <h2 className="text-[14px] font-black uppercase tracking-[0.3em] text-white whitespace-nowrap leading-none">{tipo}</h2>
                    <span className="text-[8px] text-zinc-600 font-bold mt-1 tracking-[0.2em] uppercase">Material_Class_{tipo.slice(0, 3)}</span>
                </div>

                <div className="h-[1px] flex-1 bg-gradient-to-r from-zinc-800/80 via-zinc-800/30 to-transparent" />

                <div className="flex items-center gap-6 px-6 py-2.5 rounded-2xl bg-zinc-950 border border-zinc-800/50 shadow-2xl">
                    <div className="flex flex-col items-center">
                        <span className="text-[8px] font-black text-zinc-600 uppercase mb-0.5 tracking-widest">Estoque</span>
                        <span className="text-[12px] font-mono font-bold text-sky-500 leading-none">{pesoFormatado}<span className="text-[9px] ml-0.5">kg</span></span>
                    </div>
                    <div className="w-[1px] h-6 bg-zinc-800" />
                    <div className="flex flex-col items-center">
                        <span className="text-[8px] font-black text-zinc-600 uppercase mb-0.5 tracking-widest">Unidades</span>
                        <span className="text-[12px] font-mono font-bold text-zinc-200 leading-none">{items.length}</span>
                    </div>
                </div>
            </div>

            <div className={viewMode === 'grid'
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8"
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
    const [larguraSidebar, setLarguraSidebar] = useState(72);
    const [filamentos, setFilamentos] = useState([]);
    const [busca, setBusca] = useState("");
    const { temp, humidity, loading } = useLocalWeather();

    const [viewMode, setViewMode] = useState(() => localStorage.getItem("printlog_filaments_view") || "grid");
    const [modalAberto, setModalAberto] = useState(false);
    const [itemEdicao, setItemEdicao] = useState(null);
    const [itemConsumo, setItemConsumo] = useState(null);

    const carregarDados = useCallback(() => setFilamentos(getFilaments() || []), []);
    useEffect(() => { carregarDados(); }, [carregarDados]);
    useEffect(() => { localStorage.setItem("printlog_filaments_view", viewMode); }, [viewMode]);

    const { grupos, stats, lowStockCount } = useMemo(() => {
        const filtrados = filamentos.filter(f =>
            f.name.toLowerCase().includes(busca.toLowerCase()) ||
            (f.type || f.material || "").toLowerCase().includes(busca.toLowerCase())
        );
        const lowStock = filamentos.filter(f => Number(f.weightCurrent) < 150).length;
        const totalG = filamentos.reduce((acc, curr) => acc + Number(curr.weightCurrent || 0), 0);
        const valorTotal = filamentos.reduce((acc, curr) => acc + (Number(curr.price || 0) * (curr.weightCurrent / (curr.weightTotal || 1))), 0);

        const map = {};
        filtrados.forEach(f => {
            const m = (f.type || f.material || "OUTROS").toUpperCase();
            if (!map[m]) map[m] = [];
            map[m].push(f);
        });

        return { grupos: map, lowStockCount: lowStock, stats: { valorTotal, pesoKg: totalG / 1000 } };
    }, [filamentos, busca]);

    return (
        <div className="flex h-screen w-full bg-[#050505] text-zinc-100 font-sans overflow-hidden">
            <MainSidebar onCollapseChange={(collapsed) => setLarguraSidebar(collapsed ? 72 : 256)} />

            <main className="flex-1 flex flex-col relative transition-all duration-300 ease-in-out" style={{ marginLeft: `${larguraSidebar}px` }}>

                {/* GRID DE FUNDO */}
                <div className="absolute inset-x-0 top-0 h-[500px] z-0 pointer-events-none opacity-[0.03]"
                    style={{
                        backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                        maskImage: 'linear-gradient(to bottom, black, transparent)'
                    }}
                />

                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.02]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                        backgroundSize: '40px 40px'
                    }}
                />

                <header className="h-20 px-8 flex items-center justify-between z-40 relative border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
                    <span>
                        <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-1">Inventory_Core_v2.4</h1>
                        <span className="text-2xl font-black tracking-tight text-white uppercase tracking-tighter">Estoque de Materiais</span>
                    </span>

                    <div className="flex items-center gap-6">
                        <div className="flex bg-zinc-900/30 border border-zinc-800/60 p-1.5 rounded-2xl backdrop-blur-md">
                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-zinc-800 text-sky-400 shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}><LayoutGrid size={16} /></button>
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-zinc-800 text-sky-400 shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}><List size={16} /></button>
                        </div>

                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-500 transition-colors" size={14} />
                            <input className="w-72 bg-zinc-900/20 border border-zinc-800/50 rounded-2xl py-2.5 pl-11 pr-4 text-[11px] text-zinc-300 outline-none font-mono focus:border-sky-500/30 focus:bg-zinc-900/40 transition-all placeholder:text-zinc-700" placeholder="QUERY_MATERIAL_DATABASE..." value={busca} onChange={e => setBusca(e.target.value)} />
                        </div>

                        <button onClick={() => { setItemEdicao(null); setModalAberto(true); }} className="h-11 px-8 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl text-[10px] font-black uppercase flex items-center gap-3 shadow-[0_0_20px_rgba(14,165,233,0.15)] transition-all active:scale-95">
                            <Plus size={18} strokeWidth={3} /> Registrar Material
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-10 relative z-10 scroll-smooth">
                    <div className="max-w-[1650px] mx-auto space-y-16">

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <StockOverviewCard totalRolls={filamentos.length} totalWeight={stats.pesoKg} lowStockCount={lowStockCount} />
                            <TechStatCard title="Asset Valuation" value={`R$ ${formatBigNumber(stats.valorTotal)}`} icon={BadgeDollarSign} colorClass="text-emerald-500" secondaryLabel="Capital em Filamentos" secondaryValue="Valor de Aquisição" />
                            <TechStatCard title="Climate Control" value={loading ? "--" : `${temp}°C`} icon={Activity} colorClass="text-amber-500" secondaryLabel="Temp na Oficina" secondaryValue={`${humidity}% Humidade Relativa`} />
                        </div>

                        <div className="space-y-24 pb-40">
                            {Object.entries(grupos).length > 0 ? (
                                Object.entries(grupos).map(([tipo, items]) => (
                                    <MaterialSection
                                        key={tipo}
                                        tipo={tipo}
                                        items={items}
                                        viewMode={viewMode}
                                        acoes={{
                                            onEdit: (item) => { setItemEdicao(item); setModalAberto(true); },
                                            onDelete: (id) => window.confirm("Excluir rolo do sistema?") && setFilamentos(deleteFilament(id)),
                                            onConsume: setItemConsumo
                                        }}
                                    />
                                ))
                            ) : (
                                <div className="py-40 flex flex-col items-center justify-center border border-dashed border-zinc-900 rounded-[3rem] bg-zinc-950/40 backdrop-blur-sm">
                                    <Scan size={50} className="text-zinc-800 mb-6 animate-pulse" />
                                    <p className="text-zinc-600 text-[12px] font-black uppercase tracking-[0.4em]">Zero_Records_Found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <ModalFilamento aberto={modalAberto} aoFechar={() => setModalAberto(false)} aoSalvar={(d) => { saveFilament(d); carregarDados(); }} dadosIniciais={itemEdicao} />
                <ModalBaixaRapida aberto={!!itemConsumo} aoFechar={() => setItemConsumo(null)} item={itemConsumo} aoSalvar={(d) => { saveFilament(d); carregarDados(); }} />
            </main>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; } 
                .custom-scrollbar::-webkit-scrollbar-track { background: #050505; } 
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #1f1f23; border-radius: 20px; border: 1px solid #050505; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #27272a; }
            `}</style>
        </div>
    );
}