import React, { memo, useMemo } from "react";
import { Edit2, Trash2, Activity, Printer, Wrench, Power, TrendingUp, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "../../../utils/numbers";
import { SegmentedProgress } from "../../../components/ui/SegmentedProgress";
import Button from "../../../components/ui/Button";

/**
 * CONFIGURAÇÃO DE STATUS (Premium Theme)
 */
const obterConfiguracaoStatus = (status) => {
    const mapa = {
        idle: { label: "Disponível", color: "text-zinc-400", bg: "bg-zinc-500/10", border: "border-zinc-500/20", icon: Power },
        printing: { label: "Imprimindo", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: Printer },
        maintenance: { label: "Manutenção", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", icon: Wrench },
        completed: { label: "Concluída", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20", icon: CheckCircle2 },
    };
    return mapa[status] || mapa.idle;
};

export const LinhaImpressora = memo(({ printer, onEdit, onDelete, onResetMaint, onToggleStatus }) => {
    // LÓGICA DE DADOS
    const { configStatus, stats } = useMemo(() => {
        if (!printer) {
            return {
                configStatus: obterConfiguracaoStatus('idle'),
                stats: { hTotais: 0, health: 100, rendimento: 0, ehCritico: false }
            };
        }
        const hTotais = Number(printer?.horas_totais || 0);
        const hMaint = Number(printer?.ultima_manutencao_hora || 0);
        const interval = Number(printer?.intervalo_manutencao || 300);
        const rendimento = Number(printer?.rendimento_total || 0);

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

    if (!printer) return null;

    const IconeStatus = configStatus.icon;
    const isPrinting = printer.status === 'printing';

    return (
        <div className={`
            group relative flex items-center gap-4 p-4 min-h-[72px]
            bg-[#09090b]/80 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300
            border ${stats.ehCritico ? 'border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.05)]' : 'border-white/5 hover:border-white/10 hover:bg-zinc-900/40'}
        `}>
            {/* 1. STATUS BUTTON (Compact) */}
            <div className="relative shrink-0">
                <button
                    onClick={() => onToggleStatus?.(printer.id, printer.status)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 border
                        ${isPrinting
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-zinc-900/50 border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/10'}
                    `}
                >
                    <IconeStatus size={18} strokeWidth={2} className={`${isPrinting ? 'animate-pulse' : ''}`} />
                </button>
            </div>

            {/* 2. MAIN INFO */}
            <div className="flex flex-col justify-center min-w-0 flex-1 gap-1">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-zinc-200 truncate group-hover:text-white transition-colors tracking-tight">
                        {printer.nome || "Máquina Sem Nome"}
                    </h3>

                    {/* Tags Inline */}
                    <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider border border-zinc-800 rounded px-1.5 py-px">{printer.marca}</span>
                        <span className="text-[10px] font-bold text-zinc-400 bg-zinc-800/50 px-1.5 py-px rounded">{printer.modelo || 'Padrão'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border
                        ${configStatus.bg} ${configStatus.border} ${configStatus.color}
                    `}>
                        <div className={`w-1 h-1 rounded-full ${isPrinting ? 'bg-current animate-pulse' : 'bg-current'}`} />
                        {configStatus.label}
                    </div>
                </div>
            </div>

            {/* 3. TECH STATS (Condensed) */}
            <div className="hidden md:flex flex-col items-end gap-1 px-4 min-w-[140px] border-l border-white/5 border-r">
                <div className="flex justify-between w-full items-baseline gap-2">
                    <span className="text-[9px] font-bold text-zinc-600 uppercase">Saúde</span>
                    <span className={`text-[10px] font-bold font-mono ${stats.ehCritico ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {Math.round(stats.health)}%
                    </span>
                </div>
                <div className="w-full">
                    <SegmentedProgress pct={stats.health} color={stats.ehCritico ? '#f43f5e' : '#10b981'} pulse={stats.ehCritico} height={3} segments={12} />
                </div>
            </div>

            <div className="hidden lg:flex flex-col items-end gap-0.5 px-4 min-w-[100px]">
                <span className="text-[9px] font-bold text-zinc-600 uppercase">Retorno</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">{formatCurrency(stats.rendimento)}</span>
            </div>

            {/* 4. ACTIONS (Hover Reveal) */}
            <div className="flex items-center gap-1 pl-4 opacity-40 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onResetMaint?.(printer)}
                    className="h-8 w-8 p-0"
                    title="Diagnóstico"
                >
                    <Activity size={14} className={stats.ehCritico ? "text-rose-500 animate-pulse" : ""} />
                </Button>

                <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onEdit?.(printer)}
                    className="h-8 w-8 p-0 hover:text-sky-400"
                    title="Editar"
                >
                    <Edit2 size={14} />
                </Button>

                <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onDelete?.(printer.id)}
                    className="h-8 w-8 p-0 hover:text-rose-500"
                    title="Excluir"
                >
                    <Trash2 size={14} />
                </Button>
            </div>
        </div>
    );
});
