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
        <div className={`group/card relative w-full h-[22rem] rounded-3xl overflow-hidden bg-zinc-950 border border-white/5 hover:border-white/10 transition-all duration-500 hover:shadow-xl ${isHighlighted ? 'animate-pulse ring-4 ring-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.5)] z-50 scale-105' : ''}`}>

            {/* --- IDLE STATE (Default View) --- */}
            <div className="absolute inset-0 flex flex-col transition-opacity duration-300 group-hover/card:opacity-0 pointer-events-none group-hover/card:pointer-events-none">

                {/* Image */}
                <div className="flex-1 relative flex items-center justify-center p-8 pb-12">
                    <div
                        className="absolute inset-0 blur-[60px] opacity-20 rounded-full scale-75"
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

                {/* Bottom Gradient & Info */}
                <div className="absolute inset-x-0 bottom-0 pt-20 pb-6 px-6 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col items-center">
                    {/* Badge */}
                    <div className="absolute top-4 left-6">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-900/40 backdrop-blur-md border border-white/5 text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                            {printer.tipo || "FDM"}
                        </span>
                    </div>
                    {/* Status Dot */}
                    <div className={`absolute top-4 right-6 p-1.5 rounded-full border backdrop-blur-md flex items-center justify-center ${tema.bg} ${tema.border}`}>
                        <span className="relative flex h-1.5 w-1.5">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-${tema.corPrincipal}-400`}></span>
                            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 bg-${tema.corPrincipal}-500`}></span>
                        </span>
                    </div>

                    {/* Name Block */}
                    <div className="text-center space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block">
                            {printer.marca} {printer.modelo && `| ${printer.modelo}`}
                        </span>
                        <h3 className="text-lg font-black text-white leading-tight">
                            {printer.nome}
                        </h3>
                        {/* Status Bar */}
                        <div className="flex justify-center mt-2">
                            <div className="h-1 w-12 rounded-full bg-zinc-800 overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${stats.ehCritico ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${Math.max(0, Math.min(100, stats.healthPct))}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* --- HOVER STATE (Detailed View) --- */}
            <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-sm flex flex-col opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none group-hover/card:pointer-events-auto">

                {/* Header (Top) */}
                <div className="px-6 pt-6 pb-4 border-b border-white/5 bg-zinc-900/20">
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                            {printer.marca}
                        </span>
                        {/* Status Text (Mini) */}
                        <span className={`text-[9px] font-bold uppercase tracking-widest ${tema.text}`}>
                            {printer.status === 'offline' ? 'Offline' : 'Online'}
                        </span>
                    </div>
                    <h3 className="text-lg font-black text-white leading-none tracking-tight">
                        {printer.nome}
                    </h3>
                </div>

                {/* Stats Grid (Middle - Takes available space) */}
                <div className="flex-1 p-5 flex flex-col justify-center gap-4">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                        {/* Rendimento */}
                        <div className="space-y-0.5">
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block">Rendimento</span>
                            <span className="text-sm font-mono font-bold text-emerald-400 block">{formatCurrency(stats.rendimento)}</span>
                        </div>
                        {/* Próx. Manutenção */}
                        <div className="space-y-0.5 text-right">
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block">Revisão</span>
                            <span className={`text-sm font-mono font-bold block ${stats.revisaoEm < 0 ? 'text-rose-400 animate-pulse' : 'text-zinc-200'}`}>
                                {stats.revisaoEm > 0 ? `${stats.revisaoEm}h` : `! ${Math.abs(stats.revisaoEm)}h`}
                            </span>
                        </div>

                        {/* Uso Total */}
                        <div className="space-y-0.5">
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block">Total</span>
                            <span className="text-xs font-mono text-zinc-400 block">{formatCompact(stats.hTotais)}h</span>
                        </div>
                        {/* Potência */}
                        <div className="space-y-0.5 text-right">
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block">Potência</span>
                            <span className="text-xs font-mono text-zinc-400 block">{printer.potencia ? `${printer.potencia}W` : '-'}</span>
                        </div>
                    </div>

                    {/* ROI */}
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
                </div>

                {/* Actions (Bottom) */}
                <div className="p-4 pt-0 flex justify-between items-center bg-transparent">
                    <Tooltip text="Histórico">
                        <button onClick={() => onHistory?.(printer)} className="w-9 h-9 flex items-center justify-center rounded-full text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all border border-transparent hover:border-blue-500/20">
                            <History size={16} />
                        </button>
                    </Tooltip>
                    <Tooltip text="Editar">
                        <button onClick={() => onEdit?.(printer)} className="w-9 h-9 flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/20">
                            <Edit2 size={16} />
                        </button>
                    </Tooltip>
                    <Tooltip text="Manutenção">
                        <button onClick={() => onResetMaint?.(printer)} className="w-9 h-9 flex items-center justify-center rounded-full text-zinc-400 hover:text-orange-400 hover:bg-orange-500/10 transition-all border border-transparent hover:border-orange-500/20">
                            <Wrench size={16} />
                        </button>
                    </Tooltip>
                    <Tooltip text="Excluir">
                        <button onClick={() => onDelete?.(printer.id)} className="w-9 h-9 flex items-center justify-center rounded-full text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20">
                            <Trash2 size={16} />
                        </button>
                    </Tooltip>
                </div>

            </div>
        </div>
    );
});

export default PrinterCard;
