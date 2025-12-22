import React from "react";
import { X, Play, Check, ShieldAlert, Binary, Clock } from "lucide-react";
import { analyzePrinterHealth } from "../logic/diagnostics"; 

const DiagnosticsModal = ({ printer, onClose, onResolve, completedTasks = new Set(), onToggleTask }) => {
    if (!printer) return null;
    
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
            <div className={`relative bg-[#030303] w-full max-w-4xl h-[85vh] rounded-xl border ${colors.border} shadow-2xl flex flex-col overflow-hidden font-sans`}>
                
                {/* CABEÇALHO */}
                <header className="px-8 py-5 border-b border-white/5 bg-zinc-900/10 flex justify-between items-center">
                    <div className="flex items-center gap-5">
                        <div className={`p-2 rounded-lg bg-black border ${colors.border} ${colors.text}`}>
                            <ShieldAlert size={20} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-[11px] font-bold text-white uppercase tracking-widest">Checklist de Manutenção</h2>
                                <span className="text-[9px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded border border-white/5 font-bold">SALVO</span>
                            </div>
                            <p className="text-[10px] text-zinc-400 font-medium mt-1">Impressora: <span className="text-white">{printer.name}</span></p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X size={20} /></button>
                </header>

                {/* RESUMO RÁPIDO */}
                <div className="grid grid-cols-4 gap-px bg-white/5 border-b border-white/5">
                    {[
                        { k: "SITUAÇÃO", v: hasIssues ? "Precisando de Cuidados" : "Tudo em Dia", c: colors.text },
                        { k: "TAREFAS", v: `${completedTasks.size} de ${tasks.length} feitas`, c: "text-zinc-100" },
                        { k: "TEMPO ESTIMADO", v: `${Math.max(0, estimatedTimeMin - (completedTasks.size * 15))} min`, c: "text-zinc-100" },
                        { k: "USO DA MÁQUINA", v: `${Math.floor(printer.totalHours || 0)} horas`, c: "text-zinc-100" }
                    ].map((s, i) => (
                        <div key={i} className="bg-zinc-950/40 p-5">
                            <div className="text-[8px] text-zinc-500 font-bold mb-1 uppercase tracking-widest">{s.k}</div>
                            <div className={`text-xs font-bold ${s.c}`}>{s.v}</div>
                        </div>
                    ))}
                </div>

                {/* LISTA DE TAREFAS */}
                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="space-y-3">
                        {tasks.map((task, idx) => {
                            const isDone = completedTasks.has(task.label);
                            return (
                                <div key={idx} onClick={() => onToggleTask(task.label)} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${isDone ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60' : 'bg-zinc-900/20 border-zinc-800/40 hover:border-zinc-700'}`}>
                                    <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${isDone ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-zinc-700 bg-black'}`}>
                                        {isDone && <Check size={14} strokeWidth={4} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <span className={`text-[11px] font-bold ${isDone ? 'text-emerald-500' : 'text-zinc-200'}`}>{task.label}</span>
                                            {task.overdue > 0 && !isDone && (
                                                <span className="text-[9px] text-rose-400 font-bold uppercase italic">Atrasado em {Math.floor(task.overdue)}h</span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-zinc-500 mt-1">Como fazer: {task.action}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </main>

                {/* RODAPÉ */}
                <footer className="p-6 border-t border-white/5 bg-zinc-950/80 flex justify-between items-center">
                    <div className="flex gap-1.5">
                        {tasks.map((t, i) => (
                            <div key={i} className={`h-1.5 w-4 rounded-full transition-all ${completedTasks.has(t.label) ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
                        ))}
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-6 py-2 text-[10px] font-bold uppercase text-zinc-500 hover:text-white transition-colors">Cancelar</button>
                        <button 
                            disabled={tasks.length > 0 && completedTasks.size < tasks.length}
                            onClick={() => onResolve(printer.id)} 
                            className={`px-8 py-2.5 rounded-xl text-[10px] font-bold uppercase transition-all ${completedTasks.size === tasks.length ? 'bg-emerald-500 text-black shadow-lg' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'}`}
                        >
                            Concluir Manutenção
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default DiagnosticsModal;