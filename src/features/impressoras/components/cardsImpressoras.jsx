import React, { memo, useMemo } from "react";
import { Edit2, Trash2, Activity, Printer, Wrench, Power, TrendingUp, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "../../../utils/numbers";

/**
 * SUBCOMPONENTE: BARRA SEGMENTADA (Padrão)
 */
const SegmentedProgress = memo(({ pct, color, pulse }) => {
    const segments = 24;
    const safePct = Math.max(0, Math.min(100, Number(pct) || 0));

    return (
        <div 
            className={`h-3 w-full bg-zinc-950 border border-zinc-800/50 rounded-full px-1 flex items-center gap-[2px] relative overflow-hidden ${pulse ? 'ring-1 ring-rose-500/20' : ''}`}
            title={`Saúde: ${safePct}%`}
        >
            {[...Array(segments)].map((_, i) => {
                const isActive = i < (safePct / (100 / segments));
                return (
                    <div
                        key={i}
                        className={`h-[4px] flex-1 rounded-full transition-all duration-700 ${pulse && isActive ? 'animate-pulse' : ''}`}
                        style={{
                            backgroundColor: isActive ? color : '#27272a', 
                            boxShadow: isActive ? `0 0 8px ${color}40` : 'none',
                            opacity: isActive ? 1 : 0.2
                        }}
                    />
                );
            })}
        </div>
    );
});

/**
 * CONFIGURAÇÃO DE STATUS
 */
const obterConfiguracaoStatus = (status) => {
    const mapa = {
        idle: { label: "DISPONÍVEL", color: "text-zinc-500", dot: "bg-zinc-500", icon: Power },
        printing: { label: "IMPRIMINDO", color: "text-emerald-400", dot: "bg-emerald-400", icon: Printer },
        maintenance: { label: "MANUTENÇÃO", color: "text-rose-400", dot: "bg-rose-400", icon: Wrench },
        completed: { label: "CONCLUÍDA", color: "text-sky-400", dot: "bg-sky-400", icon: CheckCircle2 },
    };
    return mapa[status] || mapa.idle;
};

const PrinterCard = memo(({ printer, onEdit, onDelete, onResetMaint, onToggleStatus }) => {
    if (!printer) return null;

    // LÓGICA DE DADOS (Cálculo de saúde e retorno financeiro)
    const { configStatus, stats } = useMemo(() => {
        const hTotais = Number(printer?.totalHours || printer?.horas_totais || 0);
        const hMaint = Number(printer?.lastMaintenanceHour || printer?.ultima_manutencao_hora || 0);
        const interval = Number(printer?.maintenanceInterval || printer?.intervalo_manutencao || 300);
        const rendimento = Number(printer?.yieldTotal || printer?.rendimento_total || 0);
        
        const health = Math.max(0, Math.min(100, ((interval - (hTotais - hMaint)) / interval) * 100));
        
        return {
            configStatus: obterConfiguracaoStatus(printer?.status),
            stats: { 
                hTotais, 
                health, 
                rendimento,
                ehCritico: health < 15 || printer?.status === 'maintenance' 
            }
        };
    }, [printer]);

    const IconeStatus = configStatus.icon;

    return (
        <div className={`
            group relative bg-zinc-900/40 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-500
            border ${stats.ehCritico 
                ? 'border-rose-500/40 bg-rose-500/[0.03] shadow-[0_0_20px_rgba(244,63,94,0.05)]' 
                : 'border-zinc-800/60 hover:border-zinc-700/80 shadow-sm'}
        `}>
            <div className="flex h-[195px]">
                
                {/* BARRA LATERAL (75px) */}
                <div className="w-[75px] bg-zinc-950/40 border-r border-zinc-800/50 flex flex-col items-center py-6 justify-between shrink-0">
                    <button 
                        onClick={() => onToggleStatus?.(printer.id, printer.status)}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 border active:scale-90 ${
                            printer.status === 'printing' 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-inner' 
                            : 'bg-zinc-900/50 border-zinc-800 text-zinc-600 hover:text-zinc-400 hover:border-zinc-700'
                        }`}
                    >
                        <IconeStatus size={24} strokeWidth={2} className={printer.status === 'printing' ? 'animate-pulse' : ''} />
                    </button>

                    <div className="rotate-180 [writing-mode:vertical-lr] flex items-center opacity-40 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] whitespace-nowrap text-zinc-500">
                            {printer.brand || printer.marca || 'FABRICANTE'}
                        </span>
                    </div>
                </div>

                {/* PAINEL CENTRAL */}
                <div className="flex-1 p-6 flex flex-col justify-between min-w-0">
                    {/* CABEÇALHO */}
                    <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-black uppercase tracking-tight truncate leading-none text-zinc-100 group-hover:text-emerald-400 transition-colors">
                                {printer.name || printer.nome || "Sem Nome"}
                            </h3>
                            <p className="text-[10px] font-mono font-bold text-zinc-600 mt-2.5 uppercase tracking-widest">
                                SÉRIE: <span className="text-zinc-500">#{String(printer.id || '').slice(-6).toUpperCase()}</span>
                            </p>
                        </div>
                        <div className={`shrink-0 px-2 py-1 rounded-md border text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                            stats.ehCritico ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse' : 'bg-zinc-900 border-zinc-800 ' + configStatus.color
                        }`}>
                            <div className={`h-1 w-1 rounded-full ${stats.ehCritico ? 'bg-rose-500' : configStatus.dot}`} />
                            {stats.ehCritico ? 'ALERTA TÉCNICO' : configStatus.label}
                        </div>
                    </div>

                    {/* MÉTRICA PRINCIPAL (HORAS) */}
                    <div className="space-y-3">
                        <div className="flex items-baseline justify-between">
                            <div className="flex items-baseline gap-1.5">
                                <span className={`text-4xl font-black tracking-tighter transition-colors ${stats.ehCritico ? 'text-rose-500' : 'text-zinc-100'}`}>
                                    {Math.round(stats.hTotais)}
                                </span>
                                <span className="text-[10px] font-black text-zinc-500 uppercase">Horas</span>
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-tighter ${stats.ehCritico ? 'text-rose-400' : 'text-zinc-500'}`}>
                                {Math.round(stats.health)}% SAÚDE
                            </span>
                        </div>
                        <SegmentedProgress pct={stats.health} color={stats.ehCritico ? '#f43f5e' : '#10b981'} pulse={stats.ehCritico} />
                    </div>

                    {/* RODAPÉ DE INFORMAÇÕES (IMPRESSORA) */}
                    <div className="flex justify-between items-end pt-3 mt-1 border-t border-zinc-800/40">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1">Modelo</span>
                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider truncate max-w-[120px]">
                                {printer.model || printer.modelo || 'Padrão'}
                            </span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1">Lucro Gerado</span>
                            <div className="flex items-center gap-1.5">
                                <TrendingUp size={12} className="text-emerald-500" />
                                <span className="text-[12px] font-bold text-emerald-500/80 font-mono">
                                    {formatCurrency(stats.rendimento)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AÇÕES DO RODAPÉ (h-11) */}
            <div className="grid grid-cols-[1fr_50px_50px] h-11 bg-zinc-950/60 border-t border-zinc-800/50">
                <button  onClick={() => onResetMaint?.(printer)} 
                    className="flex items-center justify-center gap-2.5 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800/30 transition-all group/btn"
                >
                    <Activity size={14} className={`transition-transform group-hover/btn:scale-110 ${stats.ehCritico ? 'text-rose-500 animate-pulse' : 'text-zinc-600'}`} />
                    Diagnóstico / Reset
                </button>
                <button 
                    onClick={() => onEdit?.(printer)} 
                    className="flex items-center justify-center border-l border-zinc-800/50 text-zinc-600 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all"
                >
                    <Edit2 size={14} />
                </button>
                <button 
                    onClick={() => onDelete?.(printer.id)} 
                    className="flex items-center justify-center border-l border-zinc-800/50 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
});

export default PrinterCard;