import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Plus, Search, CheckCircle2, Timer, Cpu,
    AlertTriangle, Activity, LayoutGrid, Check, Scan, ChevronRight
} from "lucide-react";

// --- COMPONENTES ---
import MainSidebar from "../components/MainSidebar";
import PrinterCard from "../features/impressoras/components/printerCard";
import PrinterModal from "../features/impressoras/components/printerModal";
import DiagnosticsModal from "../features/impressoras/components/diagnosticsModal";

// --- LÓGICA ---
import { getPrinters, savePrinter, deletePrinter, resetMaintenance, updateStatus } from "../features/impressoras/logic/printers";
import { analyzePrinterHealth } from "../features/impressoras/logic/diagnostics";

// --- UTILS ---
const formatBigNumber = (num) => {
    if (!num || isNaN(num)) return "0";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return Math.floor(num).toString();
};

// --- COMPONENTE: SAÚDE DA FROTA (ESTILO PREMIUM) ---
const StatusOverviewCard = ({ criticalCount, totalCount }) => {
    const isHealthy = criticalCount === 0;
    const accentColor = isHealthy ? 'emerald' : 'rose';

    return (
        <div className={`relative h-[135px] p-6 rounded-2xl bg-[#0a0a0b] border ${isHealthy ? 'border-emerald-500/20 shadow-[0_8px_30px_rgba(16,185,129,0.05)]' : 'border-rose-500/30 shadow-[0_8px_30px_rgba(244,63,94,0.1)]'} overflow-hidden flex items-center justify-between transition-all duration-500 group`}>
            {/* Efeito de Glow de Fundo */}
            <div className={`absolute -right-6 -top-6 w-32 h-32 blur-[60px] opacity-[0.08] rounded-full transition-colors duration-700 ${isHealthy ? 'bg-emerald-500' : 'bg-rose-500'}`} />

            <div className="flex items-center gap-6 relative z-10">
                <div className={`p-4 rounded-2xl bg-black border ${isHealthy ? 'border-emerald-500/30 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-rose-500/40 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.1)]'}`}>
                    {isHealthy ? <Check size={26} strokeWidth={3} /> : <AlertTriangle size={26} strokeWidth={3} className="animate-pulse" />}
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-rose-500 animate-ping'}`} />
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.25em]">Fleet_Protocol</p>
                    </div>
                    <h3 className={`text-2xl font-black font-mono tracking-tighter leading-none ${isHealthy ? 'text-white' : 'text-rose-500'}`}>
                        {isHealthy ? 'SYSTEM_NOMINAL' : 'FLEET_ALERT'}
                    </h3>
                    <p className="text-[11px] text-zinc-500 font-bold mt-2 uppercase">
                        {isHealthy ? 'Integridade total detectada' : `${criticalCount} UNIDADES EM MANUTENÇÃO`}
                    </p>
                </div>
            </div>

            <div className="flex flex-col items-end relative z-10">
                <div className="text-[9px] text-zinc-600 font-black uppercase mb-2 tracking-widest tracking-[0.2em]">Efficiency</div>
                <div className="h-1.5 w-20 bg-zinc-900 rounded-full overflow-hidden border border-white/5 p-[1px]">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${isHealthy ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${totalCount > 0 ? ((totalCount - criticalCount) / totalCount) * 100 : 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE: TECH STAT CARD (ESTILO PREMIUM) ---
const TechStatCard = ({ title, value, icon: Icon, colorClass, secondaryLabel, secondaryValue }) => (
    <div className="h-[135px] p-6 rounded-2xl bg-[#0a0a0b] border border-zinc-900 flex items-center justify-between group transition-all hover:border-zinc-700/50 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
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
                <Activity size={12} className="text-zinc-800" />
            </div>
        </div>
    </div>
);

export default function ImpressorasPage() {
    const [larguraSidebar, setLarguraSidebar] = useState(72);
    const [printers, setPrinters] = useState([]);
    const [busca, setBusca] = useState("");
    const [modalAberto, setModalAberto] = useState(false);
    const [itemEdicao, setItemEdicao] = useState(null);
    const [printerEmDiagnostico, setPrinterEmDiagnostico] = useState(null);
    const [checklists, setChecklists] = useState({});

    const carregarDados = useCallback(() => {
        const rawData = getPrinters() || [];
        setPrinters(Array.from(new Map(rawData.map(item => [item.id, item])).values()));
    }, []);

    useEffect(() => { carregarDados(); }, [carregarDados]);

    const { filteredPrinters, stats, criticalCount } = useMemo(() => {
        const totalPrints = printers.reduce((acc, curr) => acc + (curr.history?.length || 0), 0);
        const criticals = printers.filter(p => (analyzePrinterHealth(p) || []).some(i => i.severity === 'critical')).length;
        const filtered = printers.filter(p => p.name?.toLowerCase().includes(busca.toLowerCase()));
        return {
            filteredPrinters: filtered,
            criticalCount: criticals,
            stats: { totalPrints, filament: "28.00" }
        };
    }, [printers, busca]);

    const aoSalvar = (dados) => { savePrinter(dados); carregarDados(); setModalAberto(false); setItemEdicao(null); };
    const aoDeletar = (id) => { if (window.confirm("Remover Node permanentemente?")) { deletePrinter(id); carregarDados(); } };
    const alternarStatus = (id, statusAtual) => { updateStatus(id, { 'idle': 'printing', 'printing': 'maintenance', 'maintenance': 'idle' }[statusAtual || 'idle']); carregarDados(); };
    const finalizarReparo = (id) => { resetMaintenance(id); carregarDados(); setPrinterEmDiagnostico(null); };

    return (
        <div className="flex h-screen w-full bg-[#050505] text-zinc-100 font-sans overflow-hidden">
            <MainSidebar onCollapseChange={(collapsed) => setLarguraSidebar(collapsed ? 72 : 256)} />

            <main className="flex-1 flex flex-col relative transition-all duration-300" style={{ marginLeft: `${larguraSidebar}px` }}>

                {/* GRID DE FUNDO */}
                <div className="absolute inset-x-0 top-0 h-[500px] z-0 pointer-events-none opacity-[0.03]"
                    style={{
                        backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                        maskImage: 'linear-gradient(to bottom, black, transparent)'
                    }}
                />

                <header className="h-20 px-8 flex items-center justify-between z-40 relative border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
                    <div>
                        <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-1">Fleet_Core_v2.4</h1>
                        <span className="text-2xl font-black tracking-tight text-white uppercase tracking-tighter">Oficina de Impressão</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" size={14} />
                            <input className="w-80 bg-zinc-900/20 border border-zinc-800/50 rounded-2xl py-2.5 pl-11 pr-4 text-[11px] text-zinc-400 outline-none font-mono focus:border-emerald-500/30 focus:bg-zinc-900/40 transition-all placeholder:text-zinc-700" placeholder="QUERY_FLEET_DATABASE..." value={busca} onChange={e => setBusca(e.target.value)} />
                        </div>
                        <button onClick={() => { setItemEdicao(null); setModalAberto(true); }} className="h-11 px-8 bg-[#009b74] hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase flex items-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all active:scale-95">
                            <Plus size={18} strokeWidth={3} /> Adicionar Máquina
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-10 pt-2 relative z-10 scroll-smooth">
                    <div className="max-w-[1650px] mx-auto space-y-16">

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
                            <StatusOverviewCard criticalCount={criticalCount} totalCount={printers.length} />
                            <TechStatCard title="Total Production" value={formatBigNumber(stats.totalPrints)} icon={CheckCircle2} colorClass="text-emerald-500" secondaryLabel="Produção Geral" secondaryValue="Nodes Ativos" />
                            <TechStatCard title="Filament Usage" value={`${stats.filament}kg`} icon={Timer} colorClass="text-amber-500" secondaryLabel="Massa Estimada" secondaryValue="Consumo Total" />
                        </div>

                        {/* SEÇÃO NODES (ESTILO FILAMENTOS) */}
                        <div className="space-y-10 pb-40">
                            <div className="flex items-center gap-6">
                                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 shadow-xl flex items-center justify-center">
                                    <LayoutGrid size={20} strokeWidth={2.5} />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-[14px] font-black uppercase tracking-[0.3em] text-white whitespace-nowrap leading-none">Nodes Conectados</h2>
                                    <span className="text-[8px] text-zinc-600 font-bold mt-1 tracking-[0.2em] uppercase">Hardware_Array_Scan_v2</span>
                                </div>

                                <div className="h-[1px] flex-1 bg-gradient-to-r from-zinc-800/80 via-zinc-800/30 to-transparent" />

                                <div className="flex items-center gap-6 px-6 py-2.5 rounded-2xl bg-zinc-950 border border-zinc-800/50 shadow-2xl backdrop-blur-sm">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[8px] font-black text-zinc-600 uppercase mb-0.5 tracking-widest">Capacidade</span>
                                        <span className="text-[12px] font-mono font-bold text-emerald-500 leading-none">{filteredPrinters.length.toString().padStart(2, '0')}</span>
                                    </div>
                                    <div className="w-[1px] h-6 bg-zinc-800" />
                                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{filteredPrinters.length} Unidades</span>
                                </div>
                            </div>

                            {/* GRID DE MÁQUINAS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 gap-8">
                                {filteredPrinters.map((printer) => (
                                    <PrinterCard
                                        key={printer.id}
                                        printer={printer}
                                        onEdit={(p) => { setItemEdicao(p); setModalAberto(true); }}
                                        onDelete={aoDeletar}
                                        onResetMaint={() => setPrinterEmDiagnostico(printer)}
                                        onToggleStatus={() => alternarStatus(printer.id, printer.status)}
                                    />
                                ))}
                            </div>

                            {filteredPrinters.length === 0 && (
                                <div className="py-40 flex flex-col items-center justify-center border border-dashed border-zinc-900 rounded-[3rem] bg-zinc-950/40 backdrop-blur-sm">
                                    <Scan size={50} className="text-zinc-800 mb-6 animate-pulse" />
                                    <p className="text-zinc-600 text-[12px] font-black uppercase tracking-[0.4em]">Zero_Nodes_Found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <PrinterModal aberto={modalAberto} aoFechar={() => setModalAberto(false)} aoSalvar={aoSalvar} dadosIniciais={itemEdicao} />
                {printerEmDiagnostico && (
                    <DiagnosticsModal
                        printer={printerEmDiagnostico}
                        completedTasks={new Set(checklists[printerEmDiagnostico.id] || [])}
                        onToggleTask={(label) => {
                            const currentTasks = checklists[printerEmDiagnostico.id] || [];
                            const newTasks = currentTasks.includes(label) ? currentTasks.filter(t => t !== label) : [...currentTasks, label];
                            setChecklists(prev => ({ ...prev, [printerEmDiagnostico.id]: newTasks }));
                        }}
                        onClose={() => setPrinterEmDiagnostico(null)}
                        onResolve={finalizarReparo}
                    />
                )}
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