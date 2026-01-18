import React, { memo, useMemo } from "react";
import { Edit2, Trash2, Activity, Printer, Wrench, Power, TrendingUp, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "../../../utils/numbers";
import { SegmentedProgress } from "../../../components/ui/SegmentedProgress";
import Button from "../../../components/ui/Button";


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
    // LÓGICA DE DADOS (Cálculo de saúde e retorno financeiro)
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

    return (
        <div className={`
            group relative bg-zinc-950/40/40 backdrop-blur-sm rounded-2xl overflow-hidden 
            transition-all duration-300 hover-lift
            border ${stats.ehCritico
                ? 'border-rose-500/40 bg-rose-500/[0.03] shadow-[0_0_20px_rgba(244,63,94,0.05)]'
                : 'border-zinc-800/60 hover:border-zinc-800/50/80 hover:shadow-xl shadow-sm'}
        `}>
            <div className="flex h-[195px]">

                {/* BARRA LATERAL (75px) */}
                <div className="w-[75px] bg-zinc-950/40 border-r border-zinc-800/50 flex flex-col items-center py-6 justify-between shrink-0">
                    <button
                        onClick={() => onToggleStatus?.(printer.id, printer.status)}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 
                            border active:scale-90 hover:scale-105 ${printer.status === 'printing'
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-inner hover:shadow-lg'
                                : 'bg-zinc-900/50 border-zinc-800 text-zinc-600 hover:text-zinc-400 hover:border-zinc-800/50 hover:bg-zinc-800/50'
                            }`}
                    >
                        <IconeStatus size={24} strokeWidth={2} className={`transition-transform duration-300 ${printer.status === 'printing' ? 'animate-pulse' : 'group-hover:rotate-12'}`} />
                    </button>

                    <div className="rotate-180 [writing-mode:vertical-lr] flex items-center opacity-40 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] whitespace-nowrap text-zinc-500">
                            {printer.marca || 'FABRICANTE'}
                        </span>
                    </div>
                </div>

                {/* PAINEL CENTRAL */}
                <div className="flex-1 p-6 flex flex-col justify-between min-w-0">
                    {/* CABEÇALHO */}
                    <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-black uppercase tracking-tight truncate leading-none text-zinc-100 group-hover:text-emerald-400 transition-colors">
                                {printer.nome || "Sem Nome"}
                            </h3>
                            <p className="text-[10px] font-mono font-bold text-zinc-600 mt-2.5 uppercase tracking-widest">
                                SÉRIE: <span className="text-zinc-500">#{String(printer.id || '').slice(-6).toUpperCase()}</span>
                            </p>
                        </div>
                        <div className={`shrink-0 px-2 py-1 rounded-md border text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 ${stats.ehCritico ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse' : 'bg-zinc-950/40 border-zinc-800 ' + configStatus.color
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
                                {printer.modelo || 'Padrão'}
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
                <Button
                    variant="ghost"
                    onClick={() => onResetMaint?.(printer)}
                    className="rounded-none h-full text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900/50/30"
                >
                    <Activity size={14} className={`mr-2 transition-all duration-300 ${stats.ehCritico ? 'text-rose-500 animate-pulse' : 'text-zinc-600'}`} />
                    Diagnóstico / Reset
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => onEdit?.(printer)}
                    className="rounded-none h-full border-l border-zinc-800/50 px-0 flex items-center justify-center text-zinc-600 hover:text-zinc-100 hover:bg-zinc-800/50"
                    icon={Edit2}
                />
                <Button
                    variant="ghost"
                    onClick={() => onDelete?.(printer.id)}
                    className="rounded-none h-full border-l border-zinc-800/50 px-0 flex items-center justify-center text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10"
                    icon={Trash2}
                />
            </div>
        </div>
    );
});

export default PrinterCard;
