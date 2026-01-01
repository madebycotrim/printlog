import React from "react";
import { 
    ChevronRight, 
    Clock, 
    User, 
    Weight,
    Hash,
    Target,
    TrendingUp
} from "lucide-react";
import { formatCurrency } from "../../../utils/numbers";
import { CONFIG_STATUS } from "../../../pages/orcamentos"; 

export default function CardOrcamento({ item, onClick }) {
    if (!item) return null;

    const d = item.data || {};
    const res = d.resultados || {};
    const ent = d.entradas || {};
    const statusKey = d.status || 'rascunho';
    const config = CONFIG_STATUS[statusKey] || CONFIG_STATUS['rascunho'];

    const lucro = Number(res.lucroReal || 0);
    const precoVenda = Number(res.precoComDesconto || res.precoSugerido || 0);
    const tempoEstimado = Number(res.tempoTotalHoras || 0);
    const pesoTotal = Number(res.pesoTotalGramas || res.pesoTotal || 0);
    const margemPercent = precoVenda > 0 ? (lucro / precoVenda) * 100 : 0;

    return (
        <div
            onClick={onClick}
            className="group relative flex flex-col w-full h-full min-h-[220px] bg-[#070708] border border-white/5 rounded-[2rem] p-6 transition-all duration-500 hover:scale-[1.01] hover:border-amber-500/30 cursor-pointer overflow-hidden shadow-2xl"
        >
            {/* 1. TEXTURA HUD AMBER (Sutil) */}
            <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700 pointer-events-none" 
                style={{ backgroundImage: `radial-gradient(circle, #f59e0b 1px, transparent 1px)`, backgroundSize: '20px 20px' }} 
            />

            {/* 2. BARRA DE TELEMETRIA (TOP) - FOCO AMBER */}
            <div className="absolute top-0 left-0 w-full h-[4px] bg-zinc-900/50">
                <div 
                    className="h-full bg-gradient-to-r from-amber-700 via-amber-400 to-orange-500 transition-all duration-1000 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                    style={{ width: `${Math.max(2, Math.min(margemPercent, 100))}%` }}
                />
            </div>

            {/* 3. HEADER */}
            <div className="flex justify-between items-start gap-4 mb-4 relative z-10">
                <div className={`
                    flex items-center gap-2 px-3 py-1 rounded-md border text-[9px] font-black uppercase tracking-[0.2em]
                    ${config.bg} ${config.color} ${config.border} bg-opacity-10 backdrop-blur-md shrink-0
                `}>
                    <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.color.replace('text', 'bg')}`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.color.replace('text', 'bg')}`}></span>
                    </span>
                    {config.label}
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/5 rounded border border-amber-500/10 text-zinc-600 font-mono text-[10px] shrink-0">
                    <Hash size={10} strokeWidth={3} />
                    <span className="group-hover:text-amber-500 transition-colors">
                        {String(item.id || '000').slice(-4).toUpperCase()}
                    </span>
                </div>
            </div>

            {/* 4. CONTEÚDO DINÂMICO */}
            <div className="flex-1 mb-5 relative z-10">
                <h3 className="text-[17px] font-black text-white uppercase tracking-tight leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-amber-200 group-hover:to-amber-500 transition-all duration-300 break-words">
                    {item.label || ent.nomeProjeto || "BLUEPRINT_NULL"}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                    <div className="w-1.5 h-[1px] bg-amber-900" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest truncate">
                        {ent.clienteNome || "INTERNAL_FLOW"}
                    </span>
                </div>
            </div>

            {/* 5. GRID DE MÉTRICAS (Adaptável com cores Amber/Orange) */}
            <div className="grid grid-cols-3 gap-1 py-4 border-y border-white/5 mb-5 relative z-10 bg-white/[0.01]">
                <div className="flex flex-col gap-1 pr-2">
                    <div className="flex items-center gap-1.5 opacity-60">
                        <TrendingUp size={10} className="text-amber-500" />
                        <span className="text-[7px] font-black text-zinc-500 uppercase truncate">Margin_ROI</span>
                    </div>
                    <p className={`text-[12px] font-mono font-black italic tabular-nums truncate ${lucro > 0 ? "text-amber-400" : "text-zinc-600"}`}>
                        {formatCurrency(lucro)}
                    </p>
                </div>

                <div className="flex flex-col gap-1 border-x border-white/10 px-2">
                    <div className="flex items-center gap-1.5 opacity-60">
                        <Clock size={10} className="text-orange-500" />
                        <span className="text-[7px] font-black text-zinc-500 uppercase truncate">Lead_Time</span>
                    </div>
                    <p className="text-[12px] font-mono font-bold text-zinc-200 tabular-nums">
                        {tempoEstimado}h
                    </p>
                </div>

                <div className="flex-1 flex flex-col gap-1 pl-2">
                    <div className="flex items-center gap-1.5 opacity-60">
                        <Weight size={10} className="text-yellow-600" />
                        <span className="text-[7px] font-black text-zinc-500 uppercase truncate">Mass_Index</span>
                    </div>
                    <p className="text-[12px] font-mono font-bold text-zinc-200 tabular-nums">
                        {pesoTotal}g
                    </p>
                </div>
            </div>

            {/* 6. FOOTER */}
            <div className="flex items-end justify-between mt-auto relative z-10 shrink-0">
                <div className="flex flex-col gap-1 leading-none">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-amber-500 rounded-full animate-pulse shadow-[0_0_5px_#f59e0b]" />
                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em]">Final_Investment</span>
                    </div>
                    <span className="text-2xl font-mono font-black text-white italic tracking-tighter group-hover:translate-x-1 transition-all duration-300">
                        {formatCurrency(precoVenda)}
                    </span>
                </div>

                <div className="
                    flex items-center justify-center w-10 h-10 rounded-2xl 
                    bg-zinc-900 text-zinc-500 border border-white/5 transition-all duration-500
                    group-hover:bg-gradient-to-br group-hover:from-amber-600 group-hover:to-orange-500 
                    group-hover:text-white group-hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]
                ">
                    <ChevronRight size={20} strokeWidth={3} />
                </div>
            </div>

            {/* BRILHO HUD DE FUNDO (AMBER) */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-500/5 blur-[60px] pointer-events-none group-hover:bg-amber-500/10 transition-all duration-700" />
        </div>
    );
}