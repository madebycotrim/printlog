import React from "react";
import {
    Printer, Wrench, Zap, Edit2, Trash2,
    WifiOff, CheckCircle2, PauseCircle,
    AlertOctagon, Power, History, TrendingUp,
    Target, Cpu, Activity
} from "lucide-react";

/* ---------- CÁLCULOS ---------- */
const calculateHealth = (printer) => {
    const total = Number(printer.totalHours) || 0;
    const last = Number(printer.lastMaintenanceHour) || 0;
    const interval = Number(printer.maintenanceInterval) || 300;
    const used = total - last;
    const pct = Math.max(0, Math.min(100, 100 - ((used / interval) * 100)));
    return { remaining: Math.max(0, interval - used), pct };
};

const calculateFinance = (printer) => {
    const price = Number(printer.price) || 0;
    const yieldTotal = Number(printer.yieldTotal) || 0;
    if (price <= 0) return { roiPct: 0, isPaid: false };
    return { roiPct: Math.min(100, (yieldTotal / price) * 100), isPaid: yieldTotal >= price };
};

const getStatusConfig = (status) => {
    const map = {
        idle: { label: "Pronta", color: "text-zinc-500", bg: "bg-zinc-500/10", border: "border-zinc-500/20", icon: Power },
        printing: { label: "Imprimindo", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", icon: Printer, animate: true },
        paused: { label: "Pausada", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: PauseCircle },
        completed: { label: "Finalizada", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle2 },
        maintenance: { label: "Manutenção", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", icon: Wrench },
        error: { label: "Erro", color: "text-rose-600", bg: "bg-rose-600/10", border: "border-rose-600/30", icon: AlertOctagon },
        offline: { label: "Sem Sinal", color: "text-zinc-600", bg: "bg-zinc-800/50", border: "border-zinc-700/50", icon: WifiOff }
    };
    return map[status] || map.idle;
};

export default function PrinterCard({ printer, onEdit, onDelete, onResetMaint, onToggleStatus, onViewHistory }) {
    if (!printer) return null;

    const { remaining, pct } = calculateHealth(printer);
    const { roiPct, isPaid } = calculateFinance(printer);
    const statusConfig = getStatusConfig(printer.status);
    const StatusIcon = statusConfig.icon;

    const isCritical = pct < 20 || printer.status === 'error' || printer.status === 'maintenance';

    return (
        <div className={`group relative flex flex-col bg-[#0a0a0c] border ${isCritical ? 'border-rose-900/40 shadow-[0_0_25px_rgba(244,63,94,0.05)]' : 'border-zinc-800/50'} rounded-xl overflow-hidden transition-all duration-300 hover:border-zinc-600 hover:shadow-2xl`}>
            
            {/* EFEITO VISUAL DE FUNDO */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] z-0" />

            <div className="flex flex-1 relative z-10">
                {/* --- BARRA LATERAL --- */}
                <div className="w-[80px] flex flex-col items-center pt-4 pb-4 bg-zinc-950/50 border-r border-white/5 relative">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center border transition-all duration-500 ${isCritical ? 'bg-rose-500/10 border-rose-500/40' : 'bg-zinc-900 border-zinc-800'}`}>
                        <StatusIcon size={24} className={`${isCritical ? 'text-rose-500' : statusConfig.color} ${statusConfig.animate ? 'animate-pulse' : ''}`} />
                    </div>
                    
                    <div className="mt-4 flex flex-col items-center gap-1">
                        <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-tighter">Máquina</span>
                        <span className="text-[9px] font-mono text-zinc-400">#{printer.id?.slice(-4).toUpperCase() || '0000'}</span>
                    </div>

                    <div className="mt-auto rotate-180 flex items-center" style={{ writingMode: 'vertical-rl' }}>
                        <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest">{printer.brand || 'Personalizada'}</span>
                    </div>
                </div>

                {/* --- INFO DA IMPRESSORA --- */}
                <div className="flex-1 p-5 flex flex-col min-w-0">
                    <div className="flex justify-between items-start mb-4">
                        <div className="min-w-0">
                            <h3 className="text-sm font-bold text-zinc-100 uppercase truncate pr-2">
                                {printer.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-mono text-zinc-500 uppercase">{printer.model || 'FDM'}</span>
                                <div className="h-1 w-1 rounded-full bg-zinc-800" />
                                <div className="flex items-center gap-1">
                                    <Zap size={8} className="text-amber-500" />
                                    <span className="text-[9px] font-mono text-zinc-500">{printer.power}W</span>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => onToggleStatus && onToggleStatus(printer)}
                            className={`px-2 py-1 rounded border text-[9px] font-bold uppercase transition-all hover:scale-105 ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color}`}
                        >
                            {statusConfig.label}
                        </button>
                    </div>

                    {/* MANUTENÇÃO */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-bold text-zinc-600 uppercase mb-1 flex items-center gap-1">
                                    <Activity size={8} /> Revisão em:
                                </span>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-2xl font-mono font-bold tracking-tighter ${isCritical ? "text-rose-500" : "text-white"}`}>
                                        {Math.round(remaining).toString().padStart(3, '0')}
                                    </span>
                                    <span className="text-[10px] font-bold text-zinc-600">h</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-mono font-bold text-zinc-500">{Math.round(pct)}%</span>
                            </div>
                        </div>

                        {/* BARRA DE VIDA ÚTIL */}
                        <div className="h-2 w-full bg-zinc-900 rounded-sm flex gap-0.5 p-0.5 overflow-hidden border border-white/5">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`h-full flex-1 transition-all duration-500 ${i < (pct / 5) ? (isCritical ? 'bg-rose-500' : 'bg-cyan-500') : 'bg-zinc-800/40'}`} 
                                />
                            ))}
                        </div>
                    </div>

                    {/* RESUMO DE USO E RETORNO */}
                    <div className="mt-5 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-bold text-zinc-600 uppercase mb-1 flex items-center gap-1">
                                <History size={8} /> Produção Total
                            </span>
                            <span className="text-[10px] font-mono font-bold text-zinc-300">
                                {printer.history?.length || 0} peças
                            </span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-bold text-zinc-600 uppercase mb-1 flex items-center gap-1">
                                <TrendingUp size={8} className={isPaid ? "text-emerald-500" : ""} /> Retorno (ROI)
                            </span>
                            <span className={`text-[10px] font-mono font-bold ${isPaid ? 'text-emerald-400' : 'text-zinc-400'}`}>
                                {Math.round(roiPct)}% {isPaid ? '✓' : ''}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTÕES DE AÇÃO */}
            <div className="grid grid-cols-[1fr_repeat(3,44px)] h-10 border-t border-white/5 bg-zinc-950/80">
                <button
                    onClick={() => onResetMaint(printer.id)}
                    className="flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5 transition-all group/btn"
                >
                    <Target size={12} className="group-hover/btn:scale-110 transition-transform" />
                    Fazer Check-up
                </button>

                {[
                    { icon: History, action: () => onViewHistory(printer), color: "hover:text-cyan-400" },
                    { icon: Edit2, action: () => onEdit(printer), color: "hover:text-amber-400" },
                    { icon: Trash2, action: () => onDelete(printer.id), color: "hover:text-rose-500" }
                ].map((btn, i) => (
                    <button
                        key={i}
                        onClick={btn.action}
                        className={`flex items-center justify-center border-l border-white/5 text-zinc-600 ${btn.color} hover:bg-white/5 transition-all`}
                    >
                        <btn.icon size={14} />
                    </button>
                ))}
            </div>
        </div>
    );
}