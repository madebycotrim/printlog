import React from "react";
import { Edit2, Trash2, Activity, Printer, Wrench, Power, TrendingUp, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "../../../utils/numbers";

// --- SUB-COMPONENTE: BARRA SEGMENTADA ---
const SegmentedProgress = ({ pct, color, pulse }) => {
    const segmentos = 24;
    const porcentagemSegura = Math.max(0, Math.min(100, Number(pct) || 0));

    return (
        <div className={`h-3 w-full bg-zinc-950 border border-zinc-800/50 rounded-full px-1 flex items-center gap-[2px] relative overflow-hidden ${pulse ? 'animate-pulse' : ''}`}>
            {[...Array(segmentos)].map((_, i) => {
                const ativo = i < (porcentagemSegura / (100 / segmentos));
                return (
                    <div
                        key={i}
                        className="h-[4px] flex-1 rounded-full transition-all duration-700"
                        style={{
                            backgroundColor: ativo ? color : '#27272a', 
                            boxShadow: ativo ? `0 0 10px ${color}30` : 'none', // Corrigido erro de sintaxe no box-shadow
                            opacity: ativo ? 1 : 0.3
                        }}
                    />
                );
            })}
        </div>
    );
};

// --- HELPER: CONFIGURAÇÃO DE STATUS ---
const obterConfiguracaoStatus = (status) => {
    const mapa = {
        idle: { label: "STANDBY", color: "text-zinc-500", dot: "bg-zinc-500", icon: Power },
        printing: { label: "IMPRIMINDO", color: "text-emerald-400", dot: "bg-emerald-400", icon: Printer },
        maintenance: { label: "ALERTA", color: "text-rose-400", dot: "bg-rose-400", icon: Wrench },
        completed: { label: "CONCLUÍDA", color: "text-sky-400", dot: "bg-sky-400", icon: CheckCircle2 },
    };
    return mapa[status] || mapa.idle;
};

export default function PrinterCard({ printer, onEdit, onDelete, onResetMaint, onToggleStatus }) {
    if (!printer) return null;

    const configStatus = obterConfiguracaoStatus(printer.status);
    const IconeStatus = configStatus.icon;

    // LÓGICA DE DADOS (Suporte a mapeamento da Store e fallback de banco)
    const horasTotais = Number(printer.totalHours || printer.horas_totais || 0);
    const ultimaManutencao = Number(printer.lastMaintenanceHour || printer.ultima_manutencao_hora || 0);
    const intervaloManutencao = Number(printer.maintenanceInterval || printer.intervalo_manutencao || 300);
    const rendimentoTotal = Number(printer.yieldTotal || printer.rendimento_total || 0);
    
    // Cálculo de Saúde da Máquina
    const horasDesdeManutencao = Math.max(0, horasTotais - ultimaManutencao);
    const porcentagemSaude = Math.max(0, Math.min(100, ((intervaloManutencao - horasDesdeManutencao) / intervaloManutencao) * 100));
    
    // Define se o estado é crítico (menos de 15% de saúde ou status explícito de manutenção)
    const ehCritico = porcentagemSaude < 15 || printer.status === 'maintenance';

    return (
        <div className={`
            group relative bg-zinc-900/40 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300
            border ${ehCritico 
                ? 'border-rose-500/30 bg-rose-500/[0.02]' 
                : 'border-zinc-800/60 hover:border-zinc-700/80 shadow-sm'}
        `}>
            <div className="flex h-[190px]">

                {/* SIDEBAR LATERAL */}
                <div className="w-[70px] bg-zinc-950/40 border-r border-zinc-800/50 flex flex-col items-center py-6 justify-between shrink-0">
                    <button 
                        onClick={() => onToggleStatus?.(printer.id, printer.status)}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 border active:scale-90 ${
                            printer.status === 'printing' 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                            : 'bg-zinc-900/50 border-zinc-800 text-zinc-600 hover:text-zinc-400 hover:border-zinc-700'
                        }`}
                    >
                        <IconeStatus size={24} strokeWidth={2} className={printer.status === 'printing' ? 'animate-pulse' : ''} />
                    </button>

                    <div className="rotate-180 [writing-mode:vertical-lr] flex items-center">
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] whitespace-nowrap text-zinc-600">
                            {printer.brand || printer.marca || 'FABRICANTE'}
                        </span>
                    </div>
                </div>

                {/* PAINEL CENTRAL */}
                <div className="flex-1 p-6 flex flex-col justify-between min-w-0">
                    <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-bold uppercase tracking-tight truncate leading-none text-zinc-100 group-hover:text-emerald-400 transition-colors">
                                {printer.name || printer.nome}
                            </h3>
                            <p className="text-[10px] font-mono font-medium text-zinc-500 mt-2.5 uppercase tracking-widest">
                                SN: <span className="text-zinc-600">#{String(printer.id || '').slice(-6).toUpperCase()}</span>
                            </p>
                        </div>
                        <div className={`px-2.5 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 ${
                            ehCritico ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-zinc-900 border-zinc-800 ' + configStatus.color
                        }`}>
                            <div className={`h-1 w-1 rounded-full ${ehCritico ? 'bg-rose-500 animate-ping' : configStatus.dot}`} />
                            {ehCritico ? 'ALERTA TÉCNICO' : configStatus.label}
                        </div>
                    </div>

                    {/* MÉTRICA PRINCIPAL: HORÍMETRO */}
                    <div className="space-y-2">
                        <div className="flex items-baseline justify-between leading-none">
                            <div className="flex items-baseline gap-1.5">
                                <span className={`text-4xl font-bold tracking-tighter transition-colors ${ehCritico ? 'text-rose-400' : 'text-zinc-100'}`}>
                                    {Math.round(horasTotais)}
                                </span>
                                <span className="text-xs font-bold text-zinc-500 uppercase">Horas</span>
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${ehCritico ? 'text-rose-400' : 'text-zinc-500'}`}>
                                {Math.round(porcentagemSaude)}% SAÚDE
                            </span>
                        </div>
                        <SegmentedProgress pct={porcentagemSaude} color={ehCritico ? '#f43f5e' : '#10b981'} pulse={ehCritico} />
                    </div>

                    {/* INFO ADICIONAL (Modelo e ROI) */}
                    <div className="flex justify-between items-end pt-3 mt-1 border-t border-zinc-800/40">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest leading-none mb-1">Modelo</span>
                            <span className="text-[11px] font-semibold text-zinc-400 uppercase truncate max-w-[120px]">{printer.model || printer.modelo || 'Standard'}</span>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest leading-none mb-1">ROI Acumulado</span>
                            <div className="flex items-center gap-1.5">
                                <TrendingUp size={12} className="text-emerald-500" />
                                <span className="text-[13px] font-bold text-emerald-500/80 font-mono">
                                    {formatCurrency(rendimentoTotal)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AÇÕES DE GESTÃO */}
            <div className="grid grid-cols-[1fr_50px_50px] h-10 bg-zinc-950/50 border-t border-zinc-800/50">
                <button 
                    onClick={() => onResetMaint?.(printer)} 
                    className="flex items-center justify-center gap-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800/30 transition-all duration-200 group"
                >
                    <Activity size={14} className={`transition-colors ${ehCritico ? 'text-rose-500 animate-pulse' : 'text-zinc-600 group-hover:text-emerald-400'}`} />
                    Diagnóstico / Reset
                </button>
                <button 
                    onClick={() => onEdit?.(printer)} 
                    className="flex items-center justify-center border-l border-zinc-800/50 text-zinc-600 hover:text-zinc-100 hover:bg-zinc-800/30 transition-all duration-200"
                >
                    <Edit2 size={14} />
                </button>
                <button 
                    onClick={() => onDelete?.(printer.id)} 
                    className="flex items-center justify-center border-l border-zinc-800/50 text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
}