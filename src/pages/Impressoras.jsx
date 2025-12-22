import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import {
    ChevronLeft, Plus, Search, CheckCircle2,
    Timer, Cpu, Scan, Activity
} from "lucide-react";

// --- COMPONENTES ---
import MainSidebar from "../components/MainSidebar";
import PrinterCard from "../features/impressoras/components/printerCard";
import PrinterModal from "../features/impressoras/components/printerModal";
import MakerCoreIA from "../features/impressoras/components/makerIA";
import DiagnosticsModal from "../features/impressoras/components/diagnosticsModal";

// --- LÓGICA ---
import { analyzePrinterHealth } from "../features/impressoras/logic/diagnostics";
import { getPrinters, savePrinter, deletePrinter, resetMaintenance, updateStatus } from "../features/impressoras/logic/printers";

// --- UTILITÁRIOS ---
const formatBigNumber = (num) => {
    if (!num || isNaN(num)) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return Math.floor(num).toString();
};

const TechStatCard = ({ title, value, icon: Icon, colorClass, secondaryLabel, secondaryValue }) => {
    return (
        <div className="group relative h-[160px] p-6 rounded-2xl bg-[#09090b] border border-zinc-800/50 overflow-hidden flex flex-col justify-between transition-all hover:border-zinc-700/60 shadow-2xl">
            <div className="relative z-10 flex justify-between items-start">
                <div className={`p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 shadow-inner ${colorClass}`}>
                    <Icon size={18} strokeWidth={2.5} />
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">{title}</p>
                    <h3 className="text-2xl font-bold text-zinc-100 font-mono tracking-tighter leading-none">{value}</h3>
                </div>
            </div>
            <div className="relative z-10 pt-4 border-t border-white/5 flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest leading-none mb-1">{secondaryLabel}</span>
                    <span className="text-[11px] font-bold text-zinc-400 leading-none">{secondaryValue}</span>
                </div>
                <div className="h-1 w-8 bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full bg-current ${colorClass} opacity-30 animate-pulse`} style={{ width: '60%' }}></div>
                </div>
            </div>
        </div>
    );
};

export default function ImpressorasPage() {
    const [, setLocation] = useLocation();
    const [larguraSidebar, setLarguraSidebar] = useState(72);
    const [printers, setPrinters] = useState([]);
    const [busca, setBusca] = useState("");

    const [modalAberto, setModalAberto] = useState(false);
    const [itemEdicao, setItemEdicao] = useState(null);
    const [printerEmDiagnostico, setPrinterEmDiagnostico] = useState(null);

    const [checklists, setChecklists] = useState({});

    useEffect(() => {
        const rawData = getPrinters() || [];
        const cleanData = Array.from(new Map(rawData.map(item => [item.id, item])).values());
        setPrinters(cleanData);
    }, []);

    const handleToggleTask = (printerId, taskLabel) => {
        if (!printerId) return;
        setChecklists(prev => {
            const currentTasks = prev[printerId] || [];
            const newTasks = currentTasks.includes(taskLabel)
                ? currentTasks.filter(t => t !== taskLabel)
                : [...currentTasks, taskLabel];
            return { ...prev, [printerId]: newTasks };
        });
    };

    const aoSalvar = (dados) => {
        const novaLista = savePrinter(dados);
        setPrinters([...novaLista]);
        setModalAberto(false);
        setItemEdicao(null);
    };

    const aoDeletar = (id) => {
        if (window.confirm("Remover esta impressora da oficina?")) {
            const novaLista = deletePrinter(id);
            setPrinters([...novaLista]);
        }
    };

    const alternarStatus = (id, statusAtual) => {
        const flow = { 'idle': 'printing', 'printing': 'maintenance', 'maintenance': 'idle' };
        const novaLista = updateStatus(id, flow[statusAtual || 'idle']);
        setPrinters([...novaLista]);
    };

    const finalizarReparo = (id) => {
        const novaLista = resetMaintenance(id);
        setPrinters([...novaLista]);
        setChecklists(prev => {
            const novo = { ...prev };
            delete novo[id];
            return novo;
        });
        setPrinterEmDiagnostico(null);
    };

    const stats = useMemo(() => {
        const filtered = printers.filter(p =>
            p.name?.toLowerCase().includes(busca.toLowerCase())
        );
        const activeCount = printers.filter(p => p.status === 'printing').length;
        const totalHours = printers.reduce((acc, curr) => acc + (Number(curr.totalHours) || 0), 0);
        const totalPrints = printers.reduce((acc, curr) => acc + (curr.history?.length || 0), 0);

        return {
            filtered,
            activeCount,
            totalPrints,
            filament: (totalHours * 0.012).toFixed(2),
        };
    }, [printers, busca]);

    return (
        <div className="flex h-screen w-full bg-[#050505] text-zinc-100 font-sans overflow-hidden">
            <MainSidebar onCollapseChange={(collapsed) => setLarguraSidebar(collapsed ? 72 : 256)} />

            <main className="flex-1 flex flex-col relative transition-all duration-300 ease-in-out overflow-hidden" style={{ marginLeft: `${larguraSidebar}px` }}>

                {/* GRID DE FUNDO */}
                <div className="absolute inset-x-0 top-0 h-[500px] z-0 pointer-events-none opacity-[0.03]"
                    style={{
                        backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                        maskImage: 'linear-gradient(to bottom, black, transparent)'
                    }}
                />

                {/* HEADER */}
                <header className="h-20 min-h-[5rem] px-8 flex items-center justify-between border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl z-40 relative">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col justify-center">
                            <h1 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Minhas Impressoras</h1>
                            <div className="flex items-center gap-2">
                                <div className="flex gap-0.5">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className={`h-1 w-3 rounded-full ${i <= (stats.activeCount > 0 ? 3 : 1) ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
                                    ))}
                                </div>
                                <span className="text-[10px] font-bold text-zinc-500 uppercase">{stats.activeCount} IMPRIMINDO</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                            <input
                                className="w-72 bg-zinc-900/40 border border-zinc-800/60 rounded-xl py-2.5 pl-10 pr-4 text-[11px] text-white focus:border-emerald-500/40 outline-none transition-all placeholder:text-zinc-700"
                                placeholder="Procurar impressora..."
                                value={busca}
                                onChange={e => setBusca(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => { setItemEdicao(null); setModalAberto(true); }}
                            className="h-[40px] px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-bold uppercase flex items-center gap-3 active:scale-95 transition-all"
                        >
                            <Plus size={16} strokeWidth={3} /> Nova Impressora
                        </button>
                    </div>
                </header>

                {/* CONTEÚDO */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 relative z-10">
                    <div className="max-w-[1600px] mx-auto space-y-12">

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            <MakerCoreIA
                                printers={printers}
                                setPrinters={setPrinters}
                                onFixRequest={(id) => {
                                    const p = printers.find(x => x.id === id);
                                    if (p) setPrinterEmDiagnostico(p);
                                }}
                            />

                            <TechStatCard
                                title="Peças Prontas"
                                value={formatBigNumber(stats.totalPrints)}
                                icon={CheckCircle2}
                                colorClass="text-emerald-500"
                                secondaryLabel="Total Finalizado"
                                secondaryValue="Sucesso"
                            />

                            <TechStatCard
                                title="Plástico Usado"
                                value={`${stats.filament}kg`}
                                icon={Timer}
                                colorClass="text-amber-500"
                                secondaryLabel="Estimativa Total"
                                secondaryValue="Consumo"
                            />
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-3 py-2">
                                <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-emerald-500 shadow-inner">
                                    <Cpu size={16} />
                                </div>
                                <h2 className="text-[12px] font-bold uppercase tracking-widest text-zinc-100">Minha Oficina</h2>
                                <div className="h-[1px] bg-gradient-to-r from-zinc-800 to-transparent flex-1 mx-4" />
                                <div className="flex items-center gap-3 text-[10px] font-bold bg-zinc-900/50 border border-zinc-800/50 px-4 py-1.5 rounded-full">
                                    <span className="text-zinc-500 uppercase">Total de Máquinas</span>
                                    <span className="text-emerald-500 font-mono">{stats.filtered.length}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 auto-rows-stretch">
                                {stats.filtered.map((printer) => (
                                    <PrinterCard
                                        key={`card-${printer.id}`}
                                        printer={printer}
                                        onEdit={(p) => { setItemEdicao(p); setModalAberto(true); }}
                                        onDelete={aoDeletar}
                                        onResetMaint={() => setPrinterEmDiagnostico(printer)}
                                        onToggleStatus={() => alternarStatus(printer.id, printer.status)}
                                    />
                                ))}
                            </div>

                            {stats.filtered.length === 0 && (
                                <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800/40 rounded-[3rem] bg-zinc-900/5">
                                    <Scan size={48} className="text-zinc-800 mb-4 animate-pulse" />
                                    <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Nenhuma impressora encontrada</p>
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
                        onToggleTask={(label) => handleToggleTask(printerEmDiagnostico.id, label)}
                        onClose={() => setPrinterEmDiagnostico(null)}
                        onResolve={finalizarReparo}
                    />
                )}
            </main>
        </div>
    );
}