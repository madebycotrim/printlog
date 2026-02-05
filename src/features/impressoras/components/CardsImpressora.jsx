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

const PrinterCard = memo(({ printer, onEdit, onDelete, onResetMaint, onHistory }) => {
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

        const ehCritico = health < 90;

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
            stats: { healthPct: health, ehCritico, hTotais, rendimento },
            resolvedImage: imgUrl
        };
    }, [printer, printerModels]);

    return (
        <div className="group relative w-full aspect-[4/5] rounded-3xl overflow-hidden bg-zinc-950 border border-white/5 hover:border-white/10 transition-all duration-500 hover:shadow-2xl">

            {/* 1. IMAGE LAYER (Occupies most of the card) */}
            <div className="absolute inset-0 bottom-[25%] p-6 flex items-center justify-center">
                <div className="relative w-full h-full flex items-center justify-center transition-transform duration-700 group-hover:scale-55 group-hover:-translate-y-32">
                    {/* Glow Effect */}
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

            {/* 2. GRADIENT OVERLAY (Readability for Text) */}
            <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-[#09090b] via-[#09090b]/90 to-transparent opacity-90 transition-opacity duration-300 pointer-events-none" />

            {/* 3. CONTENT CONTENT (Bottom Aligned) */}
            <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end items-center h-full pointer-events-none">

                {/* Header Info (Always Visible) */}
                <div className="relative space-y-2 mb-3 transition-transform duration-500 group-hover:-translate-y-24 flex flex-col items-center w-full">

                    {/* Brand/Model - Hover Only */}
                    <div className="absolute -top-4 inset-x-0 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 delay-75 transform translate-y-2 group-hover:translate-y-0">
                        <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <span className="text-blue-400">{printer.marca}</span>
                            {printer.modelo && (
                                <>
                                    <span className="text-zinc-700">|</span>
                                    <span className="text-zinc-200">{printer.modelo}</span>
                                </>
                            )}
                        </span>
                    </div>

                    <h3 className="text-2xl font-black text-white leading-none tracking-tight drop-shadow-lg text-center">
                        {printer.nome}
                    </h3>
                </div>

                {/* Stats Badge (Visible) - Centered Design */}
                <div className="transition-all duration-500 group-hover:opacity-0 group-hover:translate-y-4">
                    <div className={`inline-flex items-center gap-3 px-4 py-1.5 rounded-full border backdrop-blur-md ${tema.bg} ${tema.border}`}>
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Activity size={14} className={stats.ehCritico ? "text-rose-500 animate-pulse" : ""} />
                            <span className="text-xs font-mono font-bold uppercase tracking-wide">{Math.round(stats.healthPct)}%</span>
                        </div>
                        <div className="w-px h-3 bg-white/10" />
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Clock size={14} />
                            <span className="text-xs font-mono font-bold uppercase tracking-wide">{formatCompact(stats.hTotais)}h</span>
                        </div>
                    </div>
                </div>

                {/* Actions & Expanded Stats (Fade/Slide In on Hover) */}
                <div className="absolute bottom-6 inset-x-6 flex flex-col gap-3 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100 pointer-events-auto">

                    {/* Rich Stats Line */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Rendimento</span>
                            <span className="text-sm font-mono text-emerald-400">{formatCurrency(stats.rendimento)}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Total Horas</span>
                            <span className="text-sm font-mono text-white">{formatCompact(stats.hTotais)}h</span>
                        </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center justify-center gap-8 pt-2">
                        <Tooltip text="Histórico">
                            <button
                                onClick={() => onHistory?.(printer)}
                                className="text-zinc-500 hover:text-blue-400 transition-colors"
                            >
                                <History size={18} />
                            </button>
                        </Tooltip>

                        <Tooltip text="Editar">
                            <button onClick={() => onEdit?.(printer)} className="text-zinc-500 hover:text-white transition-colors">
                                <Edit2 size={18} />
                            </button>
                        </Tooltip>

                        <Tooltip text="Manutenção">
                            <button onClick={() => onResetMaint?.(printer)} className="text-zinc-500 hover:text-orange-400 transition-colors">
                                <Wrench size={18} />
                            </button>
                        </Tooltip>

                        <Tooltip text="Excluir">
                            <button onClick={() => onDelete?.(printer.id)} className="text-zinc-500 hover:text-rose-400 transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </Tooltip>
                    </div>
                </div>

                {/* Status Badge (Absolute Top) */}
                <div className={`absolute top-4 right-4 p-2 rounded-full border backdrop-blur-md flex items-center justify-center ${tema.bg} ${tema.border} z-20 transition-opacity duration-300 group-hover:opacity-0`}>
                    <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-${tema.corPrincipal}-400`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 bg-${tema.corPrincipal}-500`}></span>
                    </span>
                </div>
            </div>
        </div>
    );
});

export default PrinterCard;
