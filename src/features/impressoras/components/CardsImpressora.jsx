import React, { memo, useMemo } from "react";
import {
    Edit2, Trash2, Activity, Printer, Wrench,
    TrendingUp, AlertTriangle, Clock, History, Circle
} from "lucide-react";
import { formatCurrency, formatCompact } from "../../../utils/numbers";
import { usePrinterModels } from "../logic/consultasImpressora";
import { Tooltip } from "../../../components/ui/Tooltip";

/**
 * CONFIGURAÇÃO VISUAL
 */
const obterTemaStatus = (status) => {
    const temas = {
        maintenance: {
            corPrincipal: "rose",
            hex: "#f43f5e",
            bg: "bg-rose-500/10",
            text: "text-rose-400",
            border: "border-rose-500/20",
            icon: Wrench
        },
        offline: {
            corPrincipal: "orange",
            hex: "#f97316",
            bg: "bg-orange-500/10",
            text: "text-orange-400",
            border: "border-orange-500/20",
            icon: AlertTriangle
        }
    };
    const defaultTheme = {
        corPrincipal: "emerald",
        hex: "#10b981",
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/20",
        icon: Circle // Dot for active
    };

    return temas[status] || defaultTheme;
};

const PrinterCard = memo(({ printer, onEdit, onDelete, onResetMaint, onHistory, highlightedItemId }) => {
    const { data: printerModels } = usePrinterModels();

    const { tema, stats, resolvedImage } = useMemo(() => {
        const temaAplicado = obterTemaStatus(printer.status);

        // Parsing Stats
        let health = 100;
        let hTotais = 0;
        let rendimento = 0;

        if (printer.stats) {
            try {
                const parsed = typeof printer.stats === 'string'
                    ? JSON.parse(printer.stats)
                    : printer.stats;

                health = Number(parsed.health) || 100;
                hTotais = Number(parsed.total_print_time) || 0;
                rendimento = hTotais * 12.50;
            } catch (e) {
                console.error("Erro ao parsear stats", e);
            }
        }

        // Fallback for hTotais if not found in stats but present in printer root
        if (hTotais === 0 && printer.horas_totais) {
            hTotais = Number(printer.horas_totais) || 0;
            rendimento = hTotais * 12.50;
        }

        const ehCritico = health < 90;

        // Calculate Maintenance
        const intervalo = Number(printer.intervalo_manutencao) || 300;
        const ultimaManutencao = Number(printer.ultima_manutencao_hora) || 0;
        const revisaoEm = (ultimaManutencao + intervalo) - hTotais;

        // Image Logic
        let imgUrl = printer.imagem_url || printer.imagem;
        if (!imgUrl && printerModels?.length) {
            const targetModel = (printer.modelo || "").trim().toLowerCase();
            const match = printerModels.find(p => (p.model || "").trim().toLowerCase() === targetModel);
            if (match) {
                imgUrl = match.img;
            }
        }

        return {
            tema: temaAplicado,
            stats: { healthPct: health, ehCritico, hTotais, rendimento, revisaoEm },
            resolvedImage: imgUrl
        };
    }, [printer, printerModels]);

    const isHighlighted = highlightedItemId === printer.id;

    return (
        <div className={`group relative w-full h-[22rem] rounded-3xl overflow-hidden bg-zinc-950 border border-white/5 hover:border-white/10 transition-all duration-500 hover:shadow-2xl ${isHighlighted ? 'animate-pulse ring-4 ring-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.5)] z-50 scale-105' : ''}`}>

            {/* --- IMAGE BACKGROUND --- */}
            {/* Moves UP and Fades Slightly on Hover */}
            <div className="absolute inset-0 pb-20 flex items-center justify-center transition-all duration-500 ease-out group-hover:-translate-y-12 group-hover:scale-90 group-hover:opacity-40">
                <div className="relative w-full h-full flex items-center justify-center p-8">
                    {/* Glow */}
                    <div
                        className="absolute inset-0 blur-[80px] opacity-20 rounded-full scale-75"
                        style={{ backgroundColor: tema.hex }}
                    />
                    {resolvedImage ? (
                        <img
                            src={resolvedImage}
                            referrerPolicy="no-referrer"
                            alt={printer.nome}
                            className="w-full h-full object-contain drop-shadow-2xl"
                        />
                    ) : (
                        <div className="w-32 h-32 rounded-full bg-zinc-900/50 border border-white/5 flex items-center justify-center text-zinc-700">
                            <Printer size={48} strokeWidth={1} />
                        </div>
                    )}
                </div>
            </div>

            {/* --- BADGES (FLOATING) --- */}
            <div className="absolute top-4 left-4 z-10">
                <span className="px-2 py-0.5 rounded-md bg-zinc-900/40 backdrop-blur-md border border-white/5 text-[9px] font-bold uppercase tracking-widest text-zinc-500 transition-opacity duration-300 group-hover:opacity-0">
                    {printer.tipo || "FDM"}
                </span>
            </div>
            <div className={`absolute top-4 right-4 z-10 p-1.5 rounded-full border backdrop-blur-md flex items-center justify-center ${tema.bg} ${tema.border} transition-opacity duration-300 group-hover:opacity-0`}>
                <span className="relative flex h-1.5 w-1.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-${tema.corPrincipal}-400`}></span>
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 bg-${tema.corPrincipal}-500`}></span>
                </span>
            </div>


            {/* --- INFO PANEL (SLIDE UP) --- */}
            <div className="absolute inset-x-0 bottom-0 bg-zinc-950/80 backdrop-blur-xl border-t border-white/10 transition-all duration-500 ease-out translate-y-[calc(100%-80px)] group-hover:translate-y-0 text-left">

                {/* 1. Header (Always Visible portion) */}
                <div className="h-[80px] px-6 flex flex-col justify-center relative z-20">
                    {/* Decorative top line handle */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="flex justify-between items-end mb-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                            {printer.marca} {printer.modelo && `| ${printer.modelo}`}
                        </span>
                        {/* Mini Status Text for Hover */}
                        <span className={`text-[9px] font-bold uppercase tracking-widest ${tema.text} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                            {printer.status === 'offline' ? 'Offline' : 'Online'}
                        </span>
                    </div>

                    <h3 className="text-xl font-black text-white leading-none tracking-tight truncate">
                        {printer.nome}
                    </h3>

                    {/* Simple Health Bar (Only visible when NOT hovering? Or maybe keep small?) */}
                    {/* Let's hide it on hover since grid has details, show on idle */}
                    <div className="mt-2 h-1 w-full bg-zinc-800/50 rounded-full overflow-hidden flex transition-all duration-300 group-hover:h-0 group-hover:mt-0 group-hover:opacity-0">
                        <div
                            className={`h-full rounded-full ${stats.ehCritico ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.max(0, Math.min(100, stats.healthPct))}%` }}
                        />
                    </div>
                </div>

                {/* 2. Expanded Content (Revealed on Hover) */}
                <div className="px-6 pb-6 space-y-5 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-75">

                    {/* Grid Stats */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-2">
                        {/* Rendimento */}
                        <div className="flex flex-col">
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5">Rendimento</span>
                            <span className="text-sm font-mono font-bold text-emerald-400">{formatCurrency(stats.rendimento)}</span>
                        </div>
                        {/* Próx. Manutenção */}
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5 text-right">Revisão</span>
                            <span className={`text-sm font-mono font-bold ${stats.revisaoEm < 0 ? 'text-rose-400 animate-pulse' : 'text-zinc-200'}`}>
                                {stats.revisaoEm > 0 ? `${stats.revisaoEm}h` : `! ${Math.abs(stats.revisaoEm)}h`}
                            </span>
                        </div>

                        {/* Uso Total */}
                        <div className="flex flex-col">
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5">Total</span>
                            <span className="text-xs font-mono text-zinc-400">{formatCompact(stats.hTotais)}h</span>
                        </div>
                        {/* Potência */}
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5 text-right">Potência</span>
                            <span className="text-xs font-mono text-zinc-400">{printer.potencia ? `${printer.potencia}W` : '-'}</span>
                        </div>
                    </div>

                    {/* ROI Section */}
                    <div className="pt-3 border-t border-white/5">
                        <div className="flex justify-between items-end mb-1.5">
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">ROI Estimado</span>
                            <span className="text-[9px] font-mono font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0 rounded-[4px]">
                                {printer.preco > 0
                                    ? `${((stats.rendimento / printer.preco) * 100).toFixed(0)}%`
                                    : '-'}
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-800/50 rounded-full overflow-hidden border border-white/5 ring-1 ring-white/5">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                                style={{ width: `${Math.max(0, Math.min(100, printer.preco > 0 ? ((stats.rendimento / printer.preco) * 100) : 0))}%` }}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-1">
                        <Tooltip text="Histórico">
                            <button onClick={() => onHistory?.(printer)} className="group/btn relative flex items-center justify-center p-2 rounded-full text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                                <History size={18} strokeWidth={1.5} />
                            </button>
                        </Tooltip>
                        <Tooltip text="Editar">
                            <button onClick={() => onEdit?.(printer)} className="group/btn relative flex items-center justify-center p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                                <Edit2 size={18} strokeWidth={1.5} />
                            </button>
                        </Tooltip>
                        <Tooltip text="Manutenção">
                            <button onClick={() => onResetMaint?.(printer)} className="group/btn relative flex items-center justify-center p-2 rounded-full text-zinc-400 hover:text-orange-400 hover:bg-orange-500/10 transition-all">
                                <Wrench size={18} strokeWidth={1.5} />
                            </button>
                        </Tooltip>
                        <Tooltip text="Excluir">
                            <button onClick={() => onDelete?.(printer.id)} className="group/btn relative flex items-center justify-center p-2 rounded-full text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
                                <Trash2 size={18} strokeWidth={1.5} />
                            </button>
                        </Tooltip>
                    </div>

                </div>
            </div>
        </div>
    );
});

export default PrinterCard;
