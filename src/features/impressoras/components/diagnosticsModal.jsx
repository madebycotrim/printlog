import React from "react";
import { X, Play, Check, ShieldAlert, Binary, Clock } from "lucide-react";
import { analyzePrinterHealth } from "../logic/diagnostics"; 

const DiagnosticsModal = ({ printer, onClose, onResolve, completedTasks = new Set(), onToggleTask }) => {
    // PROTEÇÃO 1: Se não houver impressora, não renderiza nada
    if (!printer) return null;
    
    // PROTEÇÃO 2: Garantir que analyzePrinterHealth retorne um array
    const tasks = analyzePrinterHealth(printer) || [];
    const hasIssues = tasks.length > 0;
    const criticalCount = tasks.filter(t => t.severity === 'critical').length;
    const estimatedTimeMin = tasks.length * 15; 

    const theme = criticalCount > 0 ? 'rose' : hasIssues ? 'amber' : 'emerald';
    const colors = {
        rose: { text: 'text-rose-500', border: 'border-rose-500/30', accent: 'bg-rose-500' },
        amber: { text: 'text-amber-500', border: 'border-amber-500/30', accent: 'bg-amber-500' },
        emerald: { text: 'text-emerald-500', border: 'border-emerald-500/30', accent: 'bg-emerald-500' }
    }[theme];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md font-mono animate-in fade-in duration-200">
            <div className={`relative bg-[#030303] w-full max-w-4xl h-[85vh] rounded-xl border ${colors.border} shadow-2xl flex flex-col overflow-hidden`}>
                
                {/* HUD HEADER */}
                <header className="px-8 py-5 border-b border-white/5 bg-zinc-900/10 flex justify-between items-center">
                    <div className="flex items-center gap-5">
                        <div className={`p-2 rounded-lg bg-black border ${colors.border} ${colors.text}`}>
                            <ShieldAlert size={20} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Protocolo_Inspeção // CORE_v4</h2>
                                <span className="text-[9px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-white/5 font-bold uppercase">Auto-Save: OK</span>
                            </div>
                            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest mt-1">ID: {printer.id} • HW: {printer.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X size={20} /></button>
                </header>

                {/* METRICS */}
                <div className="grid grid-cols-4 gap-px bg-white/5 border-b border-white/5">
                    {[
                        { k: "STATUS", v: hasIssues ? "[ REPARO ]" : "[ OK ]", c: colors.text },
                        { k: "PROGRESSO", v: `${completedTasks.size} / ${tasks.length}`, c: "text-zinc-100" },
                        { k: "ESTIMATIVA", v: `${Math.max(0, estimatedTimeMin - (completedTasks.size * 15))}m`, c: "text-zinc-100" },
                        { k: "HORÍMETRO", v: `${Math.floor(printer.totalHours || 0)}h`, c: "text-zinc-100" }
                    ].map((s, i) => (
                        <div key={i} className="bg-zinc-950/40 p-5">
                            <div className="text-[8px] text-zinc-600 font-black mb-1 uppercase">{s.k}</div>
                            <div className={`text-xs font-bold font-mono ${s.c}`}>{s.v}</div>
                        </div>
                    ))}
                </div>

                {/* TASKS */}
                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="space-y-4">
                        {tasks.map((task, idx) => {
                            // PROTEÇÃO 3: Verificação de existência da tarefa e label
                            const isDone = completedTasks.has(task.label);
                            return (
                                <div key={idx} onClick={() => onToggleTask(task.label)} className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${isDone ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-zinc-900/20 border-zinc-800/40'}`}>
                                    <div className={`w-6 h-6 rounded border flex items-center justify-center ${isDone ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-zinc-700 bg-black'}`}>
                                        {isDone && <Check size={14} strokeWidth={4} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <span className={`text-[10px] font-bold ${isDone ? 'text-emerald-500' : 'text-zinc-200'} uppercase`}>{task.label}</span>
                                            <span className="text-[9px] text-zinc-600 font-mono">+{Math.floor(task.overdue)}H</span>
                                        </div>
                                        <p className="text-[9px] text-zinc-500 font-mono uppercase mt-1">{">"} {task.action}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </main>

                {/* FOOTER */}
                <footer className="p-6 border-t border-white/5 bg-zinc-950/80 flex justify-between items-center">
                    <div className="flex gap-1">
                        {tasks.map((t, i) => (
                            <div key={i} className={`h-1 w-4 rounded-full ${completedTasks.has(t.label) ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
                        ))}
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-6 py-2 text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-colors">[ Fechar ]</button>
                        <button 
                            disabled={tasks.length > 0 && completedTasks.size < tasks.length}
                            onClick={() => onResolve(printer.id)} 
                            className={`px-8 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${completedTasks.size === tasks.length ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'}`}
                        >
                            Finalizar_Reparo_Global
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default DiagnosticsModal;