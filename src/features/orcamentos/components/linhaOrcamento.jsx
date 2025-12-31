import React from "react";
import {
    Play,
    CheckCircle2,
    ChevronRight,
    Monitor,
    Hash,
    User,
    TrendingUp,
    Send,
    Layers
} from "lucide-react";
import { formatCurrency } from "../../../utils/numbers";
import { CONFIG_STATUS } from "../../../pages/orcamentos";

export default function LinhaOrcamento({ item, onClick, onStatusChange }) {
    const d = item.data || {};
    const res = d.resultados || {};
    const ent = d.entradas || {};
    const statusKey = d.status || 'rascunho';
    
    const config = CONFIG_STATUS[statusKey] || CONFIG_STATUS['rascunho'];

    const valorFinal = Number(res.precoComDesconto || res.precoSugerido || 0);
    const lucroReal = Number(res.lucroReal || 0);
    const margemPercent = valorFinal > 0 
        ? Math.max(0, Math.min((lucroReal / valorFinal) * 100, 100)) 
        : 0;

    const handleNextStatus = (e) => {
        e.stopPropagation(); 
        const fluxoStatus = { 'rascunho': 'aprovado', 'aprovado': 'producao', 'producao': 'finalizado' };
        const proximoStatus = fluxoStatus[statusKey];
        if (proximoStatus && onStatusChange) onStatusChange(item.id, proximoStatus);
    };

    return (
        <div
            onClick={onClick}
            className="
                group flex items-center gap-6 px-6 py-4 
                bg-zinc-900/30 border border-white/5 
                hover:border-amber-500/30 hover:bg-zinc-900/60 
                transition-all duration-500 cursor-pointer 
                rounded-xl backdrop-blur-md relative overflow-hidden
            "
        >
            {/* 1. INDICADOR LATERAL GRADIENTE AMBER (Assinatura Amber Focus) */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-amber-700 via-amber-500 to-orange-500 opacity-80" />

            {/* 2. STATUS PILL COM BORDA AMBER SUTIL */}
            <div className="w-28 shrink-0">
                <div className={`
                    inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-[0.15em] border 
                    ${config.bg} ${config.color} ${config.border} bg-opacity-10
                `}>
                    <div className={`w-1 h-1 rounded-full animate-pulse ${config.color.replace('text', 'bg')}`} />
                    {config.label}
                </div>
            </div>

            {/* 3. IDENTIFICAÇÃO TÉCNICA */}
            <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-mono font-black text-zinc-600 tracking-tighter uppercase group-hover:text-amber-600 transition-colors">
                        ID-{String(item.id || '000').slice(-6).toUpperCase()}
                    </span>
                </div>
                <h3 className="text-sm font-black text-zinc-100 uppercase tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-amber-200 group-hover:via-amber-400 group-hover:to-orange-500 transition-all duration-300 truncate">
                    {item.label || ent.nomeProjeto || "Untitled_Blueprint"}
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                    <User size={10} className="text-zinc-700" />
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest truncate max-w-[150px]">
                        {ent.clienteNome || "Direct_Client"}
                    </span>
                </div>
            </div>

            {/* 4. HARDWARE SETUP */}
            <div className="hidden lg:flex flex-col w-40 shrink-0 border-x border-white/5 px-6">
                <div className="flex items-center gap-1.5 mb-1 text-zinc-600">
                    <Monitor size={10} />
                    <span className="text-[7px] font-black uppercase tracking-widest">Hardware_Setup</span>
                </div>
                <span className="text-[10px] font-bold text-zinc-400 truncate italic">
                    {ent.selectedPrinterName || "Standby"}
                </span>
            </div>

            {/* 5. PERFORMANCE FINANCEIRA (Barra Gradiente Amber) */}
            <div className="w-44 shrink-0 px-2">
                <div className="flex items-center gap-1.5 mb-1.5 text-zinc-600">
                    <TrendingUp size={10} className="text-amber-600/50" />
                    <span className="text-[7px] font-black uppercase tracking-widest">Yield_Analysis</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        {/* Gradiente Amber aplicado na barra de progresso */}
                        <div
                            className="h-full bg-gradient-to-r from-amber-700 via-amber-500 to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.3)] transition-all duration-1000"
                            style={{ width: `${margemPercent}%` }} 
                        />
                    </div>
                    <span className="text-xs font-mono font-black text-amber-500 italic shrink-0 group-hover:text-amber-400 transition-colors">
                        +{formatCurrency(lucroReal)}
                    </span>
                </div>
            </div>

            {/* 6. VALOR FINAL (Destaque Amber no Hover) */}
            <div className="w-40 shrink-0 text-right">
                <div className="flex items-center justify-end gap-1.5 mb-1 text-zinc-600">
                    <Layers size={10} />
                    <span className="text-[7px] font-black uppercase tracking-widest">Gross_Value</span>
                </div>
                <span className="text-lg font-mono font-black text-white italic tracking-tighter leading-none transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-amber-200 group-hover:to-orange-400">
                    {formatCurrency(valorFinal)}
                </span>
            </div>

            {/* 7. BOTÃO DE AÇÃO GRADIENTE AMBER */}
            <div className="w-24 flex justify-end items-center gap-2 border-l border-white/5 pl-4">
                {statusKey !== 'finalizado' && (
                    <button
                        onClick={handleNextStatus}
                        className="
                            p-2 rounded-lg bg-zinc-800 border border-white/5 text-zinc-500 
                            hover:bg-gradient-to-r hover:from-amber-600 hover:to-orange-600 
                            hover:text-white hover:border-transparent hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]
                            transition-all active:scale-90 group/btn
                        "
                    >
                        {statusKey === 'rascunho' && <Send size={14} />}
                        {statusKey === 'aprovado' && <Play size={14} fill="currentColor" />}
                        {statusKey === 'producao' && <CheckCircle2 size={14} />}
                    </button>
                )}
                
                {statusKey === 'finalizado' && (
                    <div className="p-2 text-emerald-500/40">
                        <CheckCircle2 size={16} />
                    </div>
                )}

                <div className="text-zinc-800 group-hover:text-amber-500 transition-all group-hover:translate-x-1">
                    <ChevronRight size={18} strokeWidth={3} />
                </div>
            </div>

            {/* OVERLAY DE BRILHO GRADIENTE AMBER (Sutil ao passar o mouse) */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/0 to-orange-500/0 group-hover:via-amber-500/[0.03] pointer-events-none transition-all duration-700" />
        </div>
    );
}