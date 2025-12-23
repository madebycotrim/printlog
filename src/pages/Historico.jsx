import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
    Search, LayoutGrid, List, History, 
    Printer, Package, Clock, TrendingUp, 
    Trash2, ExternalLink, Calendar, ChevronRight,
    Zap, DollarSign, Activity, FileText, Scan, BarChart3
} from "lucide-react";

import MainSidebar from "../components/MainSidebar";
import { getHistory, clearHistory, removeHistoryEntry } from "../features/calculadora/logic/localHistory";
import { formatCurrency } from "../lib/format";

// --- UTILS ---
const formatBigNumber = (num) => {
    if (!num || isNaN(num)) return "0";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return Math.floor(num).toString();
};

// --- COMPONENTE: CARD DE MÉTRICA (PADRONIZADO COM FILAMENTOS) ---
const HistoryStatCard = ({ title, value, icon: Icon, colorClass, secondaryLabel, secondaryValue }) => (
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
                <span className="text-[8px] font-black text-zinc-600">ARCHIVE_DATA</span>
                <Activity size={12} className="text-zinc-800" />
            </div>
        </div>
    </div>
);

// --- COMPONENTE: CARD DE ORÇAMENTO (ESTILO PROTOCOLO) ---
const QuoteProtocolCard = ({ item, onDelete }) => {
    const e = item.data.entradas;
    const r = item.data.resultados;
    const margem = Number(r.margemEfetivaPct || 0);

    return (
        <div className="bg-[#0a0a0b] border border-zinc-900 p-6 rounded-2xl flex flex-col gap-6 relative group hover:border-sky-500/20 transition-all backdrop-blur-md shadow-2xl overflow-hidden">
            {/* Efeito de hover sutil */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-sky-500/5 blur-[50px] rounded-full pointer-events-none" />

            <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-black border border-zinc-800 flex items-center justify-center text-sky-400 shadow-inner group-hover:border-sky-500/30 transition-all">
                        <Printer size={26} strokeWidth={1.5} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
                            <span className="text-[8px] font-black text-sky-500 tracking-[0.3em] uppercase">
                                PROJECT_PROTOCOL_V2
                            </span>
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-none mb-2">{item.label}</h3>
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                            <Calendar size={8} className="inline mr-1 mb-0.5" />
                            {item.timestamp} • ID_{item.id?.slice(0,6)}
                        </span>
                    </div>
                </div>

                <div className="text-right flex flex-col items-end">
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">VALUATION_ESTIMATE</span>
                    <span className="text-3xl font-black text-white font-mono tracking-tighter leading-none">{formatCurrency(r.precoSugerido)}</span>
                </div>
            </div>

            <div className="flex items-end justify-between border-t border-white/5 pt-5 mt-auto">
                <div className="flex gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-[7px] font-black text-zinc-700 uppercase tracking-widest">Hardware_Node</span>
                        <div className="flex items-center gap-2 px-2.5 py-1 bg-black rounded-lg border border-zinc-800">
                            <Zap size={10} className="text-amber-500" />
                            <span className="text-[9px] font-bold text-zinc-400 uppercase">{e.impressoraNome || "Manual"}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[7px] font-black text-zinc-700 uppercase tracking-widest">Material_Mass</span>
                        <div className="flex items-center gap-2 px-2.5 py-1 bg-black rounded-lg border border-zinc-800">
                            <Package size={10} className="text-sky-500" />
                            <span className="text-[9px] font-bold text-zinc-400 uppercase">{e.pesoModelo}g</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-32 flex flex-col items-end">
                        <div className="flex justify-between w-full mb-1">
                             <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">ROI_EFFICIENCY</span>
                             <span className="text-[8px] font-black text-emerald-500 uppercase">{margem}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden p-[1px] border border-white/5">
                            <div 
                                style={{ width: `${Math.min(margem, 100)}%` }} 
                                className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)] transition-all duration-1000" 
                            />
                        </div>
                    </div>
                    
                    <button onClick={onDelete} className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function HistoricoOrcamentosPage() {
    const [larguraSidebar, setLarguraSidebar] = useState(72);
    const [historico, setHistorico] = useState([]);
    const [busca, setBusca] = useState("");
    const [viewMode, setViewMode] = useState("grid");

    const carregarDados = useCallback(() => setHistorico(getHistory() || []), []);
    useEffect(() => { carregarDados(); }, [carregarDados]);

    const metrics = useMemo(() => {
        const filtrados = historico.filter(h =>
            h.label.toLowerCase().includes(busca.toLowerCase()) ||
            (h.data?.entradas?.impressoraNome || "").toLowerCase().includes(busca.toLowerCase())
        );

        const totalVenda = historico.reduce((acc, curr) => acc + (Number(curr.data?.resultados?.precoSugerido) || 0), 0);
        const totalTempo = historico.reduce((acc, curr) => acc + (Number(curr.data?.entradas?.tempoImpressaoHoras) || 0), 0);
        const margemMedia = historico.length > 0 
            ? Math.round(historico.reduce((acc, curr) => acc + (Number(curr.data?.resultados?.margemEfetivaPct) || 0), 0) / historico.length)
            : 0;

        return { filtrados, totalVenda, totalTempo, margemMedia };
    }, [historico, busca]);

    return (
        <div className="flex h-screen w-full bg-[#050505] text-zinc-100 font-sans overflow-hidden">
            <MainSidebar onCollapseChange={(collapsed) => setLarguraSidebar(collapsed ? 72 : 256)} />

            <main className="flex-1 flex flex-col relative transition-all duration-300 ease-in-out" style={{ marginLeft: `${larguraSidebar}px` }}>

                {/* GRID DE FUNDO IGUAL FILAMENTOS */}
                <div className="absolute inset-x-0 top-0 h-[500px] z-0 pointer-events-none opacity-[0.03]"
                    style={{
                        backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                        maskImage: 'linear-gradient(to bottom, black, transparent)'
                    }}
                />

                <header className="h-20 px-8 flex items-center justify-between z-40 relative border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
                    <span>
                        <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-1">History_Archive_v2.4</h1>
                        <span className="text-2xl font-black tracking-tight text-white uppercase tracking-tighter">Registros de Orçamentos</span>
                    </span>

                    <div className="flex items-center gap-6">
                        <div className="flex bg-zinc-900/30 border border-zinc-800/60 p-1.5 rounded-2xl backdrop-blur-md">
                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-zinc-800 text-sky-400 shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}><LayoutGrid size={16} /></button>
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-zinc-800 text-sky-400 shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}><List size={16} /></button>
                        </div>

                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-500 transition-colors" size={14} />
                            <input className="w-72 bg-zinc-900/20 border border-zinc-800/50 rounded-2xl py-2.5 pl-11 pr-4 text-[11px] text-zinc-300 outline-none font-mono focus:border-sky-500/30 focus:bg-zinc-900/40 transition-all placeholder:text-zinc-700" placeholder="QUERY_HISTORY_DATABASE..." value={busca} onChange={e => setBusca(e.target.value)} />
                        </div>

                        <button onClick={() => window.confirm("Limpar todo o arquivo de histórico?") && (clearHistory(), carregarDados())} className="h-11 px-6 border border-rose-500/20 hover:bg-rose-500/10 text-rose-500 rounded-2xl text-[10px] font-black uppercase flex items-center gap-3 transition-all active:scale-95">
                            <Trash2 size={18} /> Limpar Arquivo
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-10 relative z-10">
                    <div className="max-w-[1650px] mx-auto space-y-16">

                        {/* MÉTRICAS SUPERIORES (ESTILO FILAMENTOS) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <HistoryStatCard title="Total Quoted" value={formatCurrency(metrics.totalVenda)} icon={DollarSign} colorClass="text-emerald-500" secondaryLabel="Volume em Orçamentos" secondaryValue="Projeção de Faturamento" />
                            <HistoryStatCard title="Archive Size" value={historico.length.toString().padStart(2, '0')} icon={FileText} colorClass="text-sky-500" secondaryLabel="Projetos Registrados" secondaryValue="Banco de Dados Local" />
                            <HistoryStatCard title="Efficiency Avg" value={`${metrics.margemMedia}%`} icon={TrendingUp} colorClass="text-purple-500" secondaryLabel="Média de Lucratividade" secondaryValue="Performance da Farm" />
                            <HistoryStatCard title="Production Load" value={`${metrics.totalTempo}h`} icon={Clock} colorClass="text-amber-500" secondaryLabel="Horas de Produção" secondaryValue="Estimativa de Carga Total" />
                        </div>

                        {/* LISTAGEM DE CARDS */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-40">
                            {metrics.filtrados.length > 0 ? (
                                metrics.filtrados.map((item) => (
                                    <QuoteProtocolCard 
                                        key={item.id} 
                                        item={item} 
                                        onDelete={() => window.confirm("Remover este registro permanentemente?") && (removeHistoryEntry(item.id), carregarDados())} 
                                    />
                                ))
                            ) : (
                                <div className="col-span-full py-40 flex flex-col items-center justify-center border border-dashed border-zinc-900 rounded-[3rem] bg-zinc-950/40 backdrop-blur-sm">
                                    <Scan size={50} className="text-zinc-800 mb-6 animate-pulse" />
                                    <p className="text-zinc-600 text-[12px] font-black uppercase tracking-[0.4em]">Zero_Records_Found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
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