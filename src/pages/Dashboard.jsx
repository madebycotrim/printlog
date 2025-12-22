import React, { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import {
    Calculator, Printer, History, TrendingUp, Zap,
    Package, Activity, Wrench, ChevronRight, 
    DollarSign, Plus, Cpu, Box, 
    BarChart3, AlertCircle, Clock, LayoutDashboard,
    Thermometer, Droplets, ShieldCheck, Settings // <-- Adicionei o Settings aqui
} from 'lucide-react';

// Layout & Lógica (Simulados baseados no seu projeto)
import MainSidebar from "../components/MainSidebar";
import { useLocalWeather } from "../hooks/useLocalWeather";
import { getFilaments } from "../features/filamentos/logic/filaments";
import { getPrinters } from "../features/impressoras/logic/printers";

// Componentes Visuais (Importando o que você já usa)
import SpoolSideView from "../features/filamentos/components/roloFilamento";

// --- COMPONENTE DE CARD DE ESTATÍSTICA (IDÊNTICO AO SEU PRINT) ---
const TechStatCard = ({ title, value, icon: Icon, colorClass, secondaryLabel, secondaryValue }) => (
    <div className="group relative h-[140px] p-6 rounded-2xl bg-[#09090b] border border-zinc-800/50 overflow-hidden flex flex-col justify-between transition-all hover:border-zinc-700/60 shadow-2xl">
        <div className="relative z-10 flex justify-between items-start">
            <div className={`p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 shadow-inner ${colorClass}`}>
                <Icon size={18} strokeWidth={2.5} />
            </div>
            <div className="text-right">
                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.15em] mb-1.5">{title}</p>
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

export default function Dashboard() {
    const [sidebarWidth, setSidebarWidth] = useState(72);
    const [filamentos, setFilamentos] = useState([]);
    const [impressoras, setImpressoras] = useState([]);
    const { temp, humidity, loading } = useLocalWeather();

    useEffect(() => {
        setFilamentos(getFilaments());
        setImpressoras(getPrinters());
    }, []);

    // Filtros de inteligência da farm
    const printersAtivas = impressoras.filter(p => p.status === 'printing').length;
    const estoqueBaixo = filamentos.filter(f => (f.weightCurrent / f.weightTotal) < 0.2).length;

    return (
        <div className="flex h-screen bg-[#050505] text-zinc-100 font-sans overflow-hidden">
            <MainSidebar onCollapseChange={(collapsed) => setSidebarWidth(collapsed ? 72 : 256)} />

            <main className="flex-1 flex flex-col relative transition-all duration-300" style={{ marginLeft: `${sidebarWidth}px` }}>
                
                {/* GRID DE FUNDO (Sutil como nos seus prints) */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-0"
                    style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                {/* --- HEADER (PADRÃO HUD) --- */}
                <header className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl z-40 relative">
                    <div className="flex items-center gap-6">
                        <div>
                            <h1 className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400 leading-none mb-1.5">Painel de Controle</h1>
                            <div className="flex items-center gap-4 text-[10px] font-bold">
                                <span className="flex items-center gap-1.5 text-emerald-500 uppercase">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Sistema Operacional Online
                                </span>
                                <div className="w-1 h-1 rounded-full bg-zinc-800" />
                                <span className="text-zinc-500 uppercase tracking-tighter">
                                    {loading ? "SCANNING..." : `${temp}°C na oficina • ${humidity}% de umidade`}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                         <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sky-500 shadow-inner">
                            <LayoutDashboard size={20} />
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 relative z-10">
                    <div className="max-w-[1600px] mx-auto space-y-8 pb-10">

                        {/* ROW 1: CARDS DE STATUS (IDÊNTICOS AOS SEUS) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <TechStatCard title="Ganhos Estimados" value="R$ 1.240" icon={DollarSign} colorClass="text-emerald-500" secondaryLabel="Saldo Mensal" secondaryValue="LÍQUIDO" />
                            <TechStatCard title="Uso da Farm" value={printersAtivas.toString().padStart(2, '0')} icon={Printer} colorClass="text-sky-500" secondaryLabel="Status Atual" secondaryValue="TRABALHANDO" />
                            <TechStatCard title="Estoque no Limite" value={estoqueBaixo.toString().padStart(2, '0')} icon={AlertCircle} colorClass="text-rose-500" secondaryLabel="Materiais" secondaryValue="REPOR AGORA" />
                            <TechStatCard title="Gasto de Energia" value="R$ 42,15" icon={Zap} colorClass="text-amber-500" secondaryLabel="Consumo Acumulado" secondaryValue="ESTIMADO" />
                        </div>

                        {/* ROW 2: MONITOR CENTRAL */}
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
                            
                            {/* MONITOR DE IMPRESSORAS (Estilo Seção do seu Print) */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 py-2">
                                    <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sky-500 shadow-inner">
                                        <Activity size={16} />
                                    </div>
                                    <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-100">Fila de Produção</h2>
                                    <div className="h-[1px] bg-gradient-to-r from-zinc-800 to-transparent flex-1 mx-4" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {impressoras.slice(0, 4).map(printer => (
                                        <div key={printer.id} className="p-5 bg-[#09090b] border border-zinc-800/50 rounded-2xl flex items-center gap-5 group hover:border-sky-500/30 transition-all">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${printer.status === 'printing' ? 'bg-sky-500/10 border-sky-500/20 text-sky-500' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>
                                                <Printer size={24} className={printer.status === 'printing' ? 'animate-pulse' : ''} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-black text-zinc-200 uppercase truncate">{printer.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${printer.status === 'printing' ? 'bg-sky-500/10 border-sky-500/20 text-sky-500' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>
                                                        {printer.status === 'printing' ? 'TRABALHANDO' : 'PRONTA'}
                                                    </span>
                                                </div>
                                            </div>
                                            {printer.status === 'printing' && (
                                                <div className="text-right">
                                                    <span className="text-[10px] font-mono font-black text-sky-500">75%</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* ATALHOS RÁPIDOS */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                                    <Link href="/calculadora" className="p-4 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl flex items-center justify-between group transition-all shadow-lg shadow-sky-900/20">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase opacity-60">Novo</span>
                                            <span className="text-xs font-black uppercase tracking-widest">Orçamento</span>
                                        </div>
                                        <Calculator size={20} />
                                    </Link>
                                    <Link href="/historico" className="p-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl flex items-center justify-between group transition-all">
                                        <span className="text-xs font-black uppercase tracking-widest text-zinc-300">Relatórios</span>
                                        <History size={20} className="text-zinc-600" />
                                    </Link>
                                    <Link href="/configuracoes" className="p-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl flex items-center justify-between group transition-all">
                                        <span className="text-xs font-black uppercase tracking-widest text-zinc-300">Ajustes</span>
                                        <Settings size={20} className="text-zinc-600" />
                                    </Link>
                                </div>
                            </div>

                            {/* COLUNA DIREITA: RACK DE MATERIAIS (ESTILO FILAMENTOS) */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 py-2">
                                    <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-500 shadow-inner">
                                        <Box size={16} />
                                    </div>
                                    <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-100">Suprimentos</h2>
                                </div>

                                <div className="bg-[#09090b] border border-zinc-800/50 rounded-[2rem] p-6 space-y-4 shadow-2xl">
                                    {filamentos.slice(0, 5).map(f => {
                                        const pct = Math.round((f.weightCurrent / f.weightTotal) * 100);
                                        return (
                                            <div key={f.id} className="flex items-center gap-4 group">
                                                <div className="scale-75 -ml-2">
                                                    <SpoolSideView color={f.colorHex || f.color} percent={pct} size={36} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-[10px] font-bold text-zinc-300 truncate uppercase">{f.name}</span>
                                                        <span className={`text-[9px] font-mono font-bold ${pct < 20 ? 'text-rose-500' : 'text-zinc-500'}`}>{f.weightCurrent}g</span>
                                                    </div>
                                                    <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                                                        <div className="h-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: f.colorHex || f.color }} />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <Link href="/filamentos">
                                        <button className="w-full mt-4 py-3 bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 rounded-xl text-[9px] font-black text-zinc-500 uppercase hover:text-zinc-200 transition-all">
                                            Abrir Armário Completo
                                        </button>
                                    </Link>
                                </div>

                                {/* ALERTAS DE MANUTENÇÃO (ESTILO MAKERCORE IA DO SEU PRINT) */}
                                <div className="p-5 bg-rose-500/5 border border-rose-500/20 rounded-2xl space-y-3">
                                    <div className="flex items-center gap-2 text-rose-500">
                                        <Wrench size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Atenção Necessária</span>
                                    </div>
                                    <p className="text-[11px] font-bold text-zinc-400 uppercase">Lubrificação pendente na <span className="text-white">Ender 3</span></p>
                                    <div className="h-0.5 bg-zinc-800 w-full rounded-full overflow-hidden">
                                        <div className="h-full bg-rose-500 w-full animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* FOOTER HUD */}
                <footer className="h-10 px-8 flex items-center justify-between border-t border-white/5 bg-black/40 text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em]">
                    <span>PrintLog Operacional // Build 2026.05</span>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5"><Zap size={10} /> Consumo médio: 1.2 kWh</span>
                        <span className="flex items-center gap-1.5"><ShieldCheck size={10} /> Segurança: AES-256</span>
                    </div>
                </footer>
            </main>
        </div>
    );
}