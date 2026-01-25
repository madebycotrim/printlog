import React, { memo, useMemo } from "react";
import { Edit2, Trash2, Activity, Printer, Wrench, Power, TrendingUp, CheckCircle2, Cpu } from "lucide-react";
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

const PrinterCard = memo(({ printer, onEdit, onDelete, onResetMaint, onToggleStatus }) => {
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
            group relative flex flex-col justify-between 
            bg-[#09090b] backdrop-blur-md rounded-3xl overflow-hidden 
            transition-all duration-500 border
            ${stats.ehCritico
                ? 'border-rose-500/30 hover:border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.1)]'
                : 'border-white/5 hover:border-white/10 hover:shadow-2xl hover:shadow-black/50'}
        `}>
            {/* Trama de Fundo */}
            <div className={`absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px] transition-opacity duration-500 ${isPrinting ? 'opacity-[0.05]' : ''}`} />

            {/* Brilho Superior */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-500 ${isPrinting ? 'w-full via-emerald-400/30' : ''}`} />

            <div className="flex flex-1 p-6 relative z-10">
                {/* ICON / IMAGE BOX */}
                <div className="mr-5 flex flex-col items-center gap-3">
                    <button
                        onClick={() => onToggleStatus?.(printer.id, printer.status)}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border group/btn relative overflow-hidden
                            ${isPrinting
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                                : 'bg-zinc-900/50 border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/10 hover:bg-zinc-800'}
                        `}
                    >
                        <IconeStatus size={22} strokeWidth={2} className={`transition-all duration-500 ${isPrinting ? 'animate-pulse scale-110' : 'group-hover/btn:scale-110'}`} />
                        {isPrinting && <div className="absolute inset-0 bg-emerald-400/10 animate-ping rounded-2xl" />}
                    </button>

                    <div className="h-full w-px bg-gradient-to-b from-white/10 to-transparent mx-auto" />
                </div>

                {/* INFO CONTENT */}
                <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{printer.marca || 'GENÉRICA'}</span>
                            <h3 className="text-lg font-bold text-zinc-100 uppercase tracking-tight truncate leading-none group-hover:text-white transition-colors">
                                {printer.nome || "Sem Nome"}
                            </h3>
                            <span className="text-[10px] text-zinc-600 font-mono mt-1">{printer.modelo || 'Padrão'}</span>
                        </div>

                        <div className={`px-2 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md
                            ${configStatus.bg} ${configStatus.border} ${configStatus.color}
                        `}>
                            <div className={`w-1.5 h-1.5 rounded-full ${printer.status === 'printing' ? 'bg-emerald-400 animate-pulse' : stats.ehCritico ? 'bg-rose-500' : 'bg-current'}`} />
                            {stats.ehCritico ? 'ALERTA' : configStatus.label}
                        </div>
                    </div>

                    <div className="mt-auto space-y-4">
                        {/* HEALTH BAR */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Saúde do Equipamento</span>
                                <span className={`text-[10px] font-bold font-mono ${stats.ehCritico ? 'text-rose-400' : 'text-emerald-400'}`}>
                                    {Math.round(stats.health)}%
                                </span>
                            </div>
                            <SegmentedProgress pct={stats.health} color={stats.ehCritico ? '#f43f5e' : '#10b981'} pulse={stats.ehCritico} height={4} segments={20} />
                        </div>

                        {/* STATS GRID */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                            <div>
                                <span className="text-[9px] font-bold text-zinc-600 block mb-0.5 uppercase tracking-wider">Horas Totais</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-sm font-bold text-zinc-300 font-mono">{Math.round(stats.hTotais)}</span>
                                    <span className="text-[9px] text-zinc-600">t/h</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[9px] font-bold text-zinc-600 block mb-0.5 uppercase tracking-wider">Retorno</span>
                                <div className="flex items-center justify-end gap-1.5">
                                    <TrendingUp size={12} className="text-emerald-500/80" />
                                    <span className="text-sm font-bold text-emerald-400/90 font-mono">{formatCurrency(stats.rendimento)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="grid grid-cols-2 border-t border-white/5 divide-x divide-white/5 bg-zinc-950/30">
                <Button
                    variant="ghost"
                    onClick={() => onResetMaint?.(printer)}
                    className="h-10 rounded-none text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors gap-2"
                >
                    <Activity size={12} className={stats.ehCritico ? "text-rose-500 animate-pulse" : ""} />
                    Diagnóstico
                </Button>

                <div className="grid grid-cols-2 divide-x divide-white/5">
                    <button
                        onClick={() => onEdit?.(printer)}
                        className="flex items-center justify-center hover:bg-white/5 text-zinc-500 hover:text-sky-400 transition-colors"
                        title="Editar"
                    >
                        <Edit2 size={14} />
                    </button>
                    <button
                        onClick={() => onDelete?.(printer.id)}
                        className="flex items-center justify-center hover:bg-rose-500/10 text-zinc-600 hover:text-rose-500 transition-colors"
                        title="Excluir"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
});

export default PrinterCard;
