import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
    Terminal, Zap, ChevronDown, X, Cpu, 
    Activity, AlertOctagon, Play, Binary, 
    Layers, Cpu as CpuIcon, ShieldAlert, Crosshair
} from "lucide-react";
import { analyzePrinterHealth } from "../logic/diagnostics";

const MakerCoreIA = ({ printers = [], onFixRequest, setPrinters }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState("monitor");
    const [logs, setLogs] = useState([]);

    // --- ANÁLISE DA FARM ---
    const farmStats = useMemo(() => {
        const diagnostics = printers.map(p => ({
            id: p.id,
            issues: analyzePrinterHealth(p)
        }));

        return {
            total: printers.length,
            critical: diagnostics.filter(d => d.issues.some(i => i.severity === 'critical')),
            active: printers.filter(p => p.status === 'printing').length,
            diagnostics
        };
    }, [printers]);

    const s = useMemo(() => {
        if (farmStats.total === 0) return { mode: 'OFFLINE', color: 'text-zinc-600', glow: 'shadow-none', label: 'AGUARDANDO', msg: 'Sem máquinas conectadas' };
        if (farmStats.critical.length > 0) return { mode: 'ATENÇÃO', color: 'text-rose-500', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.3)]', label: 'PROBLEMA DETECTADO', msg: 'Verifique as impressoras em vermelho' };
        return { mode: 'OK', color: 'text-emerald-400', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]', label: 'TUDO SOB CONTROLE', msg: 'Sua farm está rodando bem' };
    }, [farmStats]);

    // --- COMPONENTE: PAINEL DA IA ---
    const MainframeModal = () => (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-10 font-mono">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setIsExpanded(false)} />

            <div className="relative w-full max-w-7xl h-full max-h-[850px] bg-[#030303] border border-zinc-800 rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                
                {/* EFEITOS VISUAIS */}
                <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #1a1a1a 0%, transparent 80%)' }} />

                {/* BARRA SUPERIOR */}
                <header className="relative z-10 h-16 border-b border-white/5 flex items-center justify-between px-8 bg-zinc-900/10">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded border border-current ${s.color} ${s.glow}`}>
                                <CpuIcon size={20} />
                            </div>
                            <div>
                                <h2 className="text-xs font-bold text-white uppercase tracking-widest">IA da Oficina</h2>
                                <p className={`text-[9px] font-bold ${s.color}`}>{s.label}</p>
                            </div>
                        </div>
                        
                        <div className="hidden lg:flex gap-6 text-[9px] text-zinc-600">
                            <div className="flex flex-col"><span>VERSÃO</span><span className="text-zinc-400">2.4 Stable</span></div>
                            <div className="flex flex-col"><span>USO DA IA</span><span className="text-emerald-500">12.4%</span></div>
                            <div className="flex flex-col"><span>SINCRONIA</span><span className="text-zinc-400">Tempo Real</span></div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-black p-1 border border-zinc-800 rounded-sm">
                            <button onClick={() => setActiveTab('monitor')} className={`px-4 py-1 text-[9px] font-bold uppercase transition-all ${activeTab === 'monitor' ? 'bg-zinc-800 text-white' : 'text-zinc-600'}`}>
                                Impressoras
                            </button>
                            <button onClick={() => setActiveTab('logs')} className={`px-4 py-1 text-[9px] font-bold uppercase transition-all ${activeTab === 'logs' ? 'bg-zinc-800 text-white' : 'text-zinc-600'}`}>
                                Histórico
                            </button>
                        </div>
                        <button onClick={() => setIsExpanded(false)} className="text-zinc-500 hover:text-rose-500 transition-colors"><X size={20} /></button>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden relative z-10">
                    {/* LATERAL - AÇÕES RÁPIDAS */}
                    <aside className="w-64 border-r border-white/5 p-6 space-y-8 bg-zinc-950/20">
                        <div className="space-y-4">
                            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                                <Crosshair size={10}/> Ações da Farm
                            </span>
                            <button onClick={() => setPrinters(printers.map(p => ({ ...p, status: 'idle' })))} className="w-full p-3 bg-zinc-900/50 border border-zinc-800 rounded-sm text-[10px] text-left hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all flex items-center justify-between group">
                                <span className="text-zinc-400 group-hover:text-emerald-500">LIMPAR STATUS</span>
                                <Play size={10} />
                            </button>
                            <button className="w-full p-3 bg-rose-950/20 border border-rose-900/30 rounded-sm text-[10px] text-left text-rose-500 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-between">
                                <span>PARAR TUDO</span>
                                <AlertOctagon size={10} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Atividade da IA</span>
                            <div className="h-32 w-full bg-black border border-zinc-800 relative overflow-hidden flex items-center justify-center">
                                <Activity size={24} className={`${s.color} animate-pulse`} />
                            </div>
                        </div>
                    </aside>

                    {/* CONTEÚDO PRINCIPAL */}
                    <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        {activeTab === 'monitor' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {printers.map(p => {
                                    const diag = farmStats.diagnostics.find(d => d.id === p.id);
                                    const isCrit = diag?.issues.some(i => i.severity === 'critical');
                                    
                                    return (
                                        <div key={p.id} className={`p-4 bg-black border ${isCrit ? 'border-rose-900/50 shadow-[0_0_15px_rgba(244,63,94,0.05)]' : 'border-zinc-800/40'} relative group overflow-hidden`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-white">{p.name.toUpperCase()}</span>
                                                    <span className="text-[8px] text-zinc-600">ID: {p.id.slice(0, 12)}</span>
                                                </div>
                                                <span className={`text-[9px] font-bold ${isCrit ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                    {isCrit ? '[ COM ERRO ]' : '[ ESTÁVEL ]'}
                                                </span>
                                            </div>

                                            {/* BARRA DE VIDA / USO */}
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="flex-1 flex gap-0.5">
                                                    {Array.from({ length: 15 }).map((_, i) => (
                                                        <div key={i} className={`h-1.5 flex-1 ${i < 10 ? (isCrit ? 'bg-rose-500' : 'bg-emerald-500') : 'bg-zinc-800'}`} />
                                                    ))}
                                                </div>
                                            </div>

                                            {isCrit && (
                                                <button onClick={() => { onFixRequest(p.id); setIsExpanded(false); }} className="w-full py-2 bg-rose-600 text-white text-[9px] font-bold uppercase hover:bg-rose-500 transition-all">
                                                   RESOLVER PROBLEMA AGORA
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="h-full bg-black/40 border border-zinc-800 p-6 font-mono text-[10px] overflow-y-auto">
                                <div className="text-zinc-700 mb-2">Lendo dados das impressoras...</div>
                                {logs.map(log => (
                                    <div key={log.id} className="mb-1 flex gap-4">
                                        <span className="text-zinc-600">[{log.time}]</span>
                                        <span className="text-emerald-500 uppercase">Evento:</span>
                                        <span className="text-zinc-300">{log.msg}</span>
                                    </div>
                                ))}
                                <div className="w-1.5 h-3 bg-emerald-500 animate-pulse inline-block" />
                            </div>
                        )}
                    </main>
                </div>

                {/* OVERLAY DE ESTILO CRT */}
                <div className="absolute inset-0 pointer-events-none z-[100] opacity-[0.03] overflow-hidden">
                    <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_2px]" />
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* CARD DO DASHBOARD */}
            <div
                onClick={() => setIsExpanded(true)}
                className={`group relative h-[160px] p-6 rounded-2xl bg-[#09090b] border ${s.mode === 'ATENÇÃO' ? 'border-rose-500/40' : 'border-zinc-800/50'} overflow-hidden flex flex-col justify-between transition-all hover:border-zinc-700 cursor-pointer`}
            >
                <div className="relative z-10 flex justify-between items-start">
                    <div className={`p-2.5 rounded-lg bg-zinc-900 border ${s.border} ${s.color}`}>
                        <Binary size={18} />
                    </div>
                    <div className="text-right">
                        <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mb-1">IA da Farm</p>
                        <h3 className={`text-[11px] font-bold tracking-widest uppercase ${s.color}`}>[ {s.mode} ]</h3>
                    </div>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <Activity size={10} className={s.color} />
                        <span className="text-[10px] text-zinc-300 font-bold tracking-tight uppercase">{s.msg}</span>
                    </div>
                    <div className="flex gap-1">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className={`h-0.5 flex-1 ${i < 8 ? s.color.replace('text', 'bg') : 'bg-zinc-900'} opacity-50`} />
                        ))}
                    </div>
                </div>

                <div className="relative z-10 pt-4 border-t border-white/5 flex justify-between items-center text-[9px]">
                    <div className="flex items-center gap-2 text-zinc-600 uppercase font-bold">
                         <div className={`h-1 w-1 rounded-full ${s.mode === 'ATENÇÃO' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                         Sistema Ativo
                    </div>
                    <ChevronDown size={14} className="text-zinc-700 group-hover:text-zinc-300 transition-colors" />
                </div>
            </div>

            {isExpanded && createPortal(<MainframeModal />, document.body)}
        </>
    );
};

export default MakerCoreIA;