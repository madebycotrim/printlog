import React, { useMemo } from "react";
import { 
    X, Check, ShieldAlert, Clock, Wrench, 
    Settings, Activity, AlertCircle, Gauge
} from "lucide-react";
import { analyzePrinterHealth } from "../logic/diagnostics"; 

const DiagnosticsModal = ({ printer, onClose, onResolve, completedTasks = new Set(), onToggleTask }) => {
    if (!printer) return null;
    
    const tasks = useMemo(() => analyzePrinterHealth(printer) || [], [printer]);
    const criticalCount = tasks.filter(t => t.severity === 'critical').length;
    
    // Telemetria baseada em horas reais
    const telemetry = useMemo(() => [
        { name: "Extrusora", current: printer.totalHours % 200, max: 200, unit: "h" },
        { name: "Eixos/Correias", current: printer.totalHours % 800, max: 800, unit: "h" },
        { name: "Fans/Coolers", current: printer.totalHours % 1500, max: 1500, unit: "h" },
    ], [printer.totalHours]);

    const theme = criticalCount > 0 ? 'rose' : tasks.length > 0 ? 'amber' : 'emerald';
    const colors = {
        rose: { text: 'text-rose-500', border: 'border-rose-500/30', bg: 'bg-rose-500/10' },
        amber: { text: 'text-amber-500', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
        emerald: { text: 'text-emerald-500', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' }
    }[theme];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300 font-mono">
            <div className={`relative bg-[#050505] w-full max-w-5xl h-[85vh] rounded-xl border ${colors.border} shadow-2xl flex flex-col overflow-hidden`}>
                
                <header className="px-6 py-4 border-b border-white/5 bg-zinc-900/20 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded border ${colors.border} ${colors.bg} ${colors.text}`}>
                            <Wrench size={18} className="animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Protocolo_Ativo</h2>
                            <p className="text-[11px] text-zinc-500 mt-0.5 tracking-tighter uppercase">Hardware_UID: <span className="text-zinc-300">{printer.name}</span></p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-zinc-600 hover:text-white transition-all"><X size={20} /></button>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    <aside className="w-64 border-r border-white/5 p-6 space-y-8 bg-zinc-950/30">
                        <div className="space-y-6">
                            <h3 className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2"><Gauge size={12} /> Wear_Status</h3>
                            {telemetry.map((t, i) => {
                                const percent = (t.current / t.max) * 100;
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between text-[8px] font-black mb-1.5 uppercase">
                                            <span className="text-zinc-500">{t.name}</span>
                                            <span className={percent > 85 ? 'text-rose-500' : 'text-emerald-400'}>{(t.max - t.current).toFixed(0)}{t.unit} left</span>
                                        </div>
                                        <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                                            <div className={`h-full transition-all duration-1000 ${percent > 85 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${100 - percent}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="pt-6 border-t border-white/5">
                            <span className="text-[8px] font-bold text-zinc-600 uppercase block mb-1">Runtime_Total</span>
                            <span className="text-lg font-bold text-zinc-200">{Math.floor(printer.totalHours)}h</span>
                        </div>
                    </aside>

                    <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Plano de Manutenção</h3>
                                <span className="text-[14px] font-black text-white">{completedTasks.size} / {tasks.length}</span>
                            </div>

                            {tasks.map((task, idx) => {
                                const isDone = completedTasks.has(task.label);
                                return (
                                    <div key={idx} onClick={() => onToggleTask(task.label)} className={`group flex items-center gap-5 p-5 rounded-lg border transition-all cursor-pointer ${isDone ? 'bg-emerald-500/5 border-emerald-500/10 opacity-40' : 'bg-zinc-900/30 border-zinc-800/50 hover:border-zinc-500'}`}>
                                        <div className={`w-9 h-9 rounded border flex items-center justify-center transition-all ${isDone ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-zinc-800 bg-black text-zinc-700'}`}>
                                            {isDone ? <Check size={20} strokeWidth={4} /> : <span className="text-[10px] font-black">{idx + 1}</span>}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`text-[12px] font-black uppercase tracking-tight ${isDone ? 'text-emerald-500 line-through' : 'text-zinc-100'}`}>{task.label}</span>
                                                {task.severity === 'critical' && !isDone && <span className="text-[8px] font-black text-rose-500 uppercase px-2 py-0.5 rounded border border-rose-500/20 animate-pulse">Critical</span>}
                                            </div>
                                            <p className="text-[10px] text-zinc-500 italic uppercase tracking-tighter">Protocolo: {task.action}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </main>
                </div>

                <footer className="px-8 py-5 border-t border-white/5 bg-black/60 flex justify-between items-center">
                    <div className="flex gap-1.5">
                        {tasks.map((_, i) => (
                            <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${i < completedTasks.size ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-zinc-900'}`} />
                        ))}
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-6 py-2.5 text-[10px] font-black uppercase text-zinc-600 hover:text-white transition-all tracking-widest">Abortar</button>
                        <button 
                            disabled={tasks.length > 0 && completedTasks.size < tasks.length}
                            onClick={() => onResolve(printer.id)} 
                            className={`px-10 py-3 rounded-md text-[10px] font-black uppercase tracking-[0.2em] transition-all ${completedTasks.size === tasks.length ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-zinc-800 text-zinc-700 cursor-not-allowed border border-white/5'}`}
                        >
                            Finalizar e Resetar Ciclos
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default DiagnosticsModal;