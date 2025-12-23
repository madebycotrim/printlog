// --- FILE: src/features/calculadora/components/Resumo.jsx ---
import React, { useState, useMemo } from "react";
import { formatCurrency } from "../../../lib/format";
import { addHistoryEntry } from "../logic/localHistory";
import {
    Save, TrendingUp, AlertTriangle, CheckCircle2,
    Package, Zap, Clock, Truck, Layers, Wrench,
    Landmark, Store, Tag, FileText, Printer, Share2,
    CircleDashed, Calculator, Activity, ShieldCheck
} from "lucide-react";

// --- COMPONENTE AUXILIAR: LINHA DO DIAGNÓSTICO ---
const SummaryRow = ({ icon: Icon, label, value, total, color = "text-zinc-500" }) => {
    if (!value || value <= 0.01) return null;

    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    const barWidth = Math.min(Math.max(pct, 1), 100);

    return (
        <div className="flex items-center justify-between py-2 px-3 -mx-2 rounded-xl group hover:bg-white/5 transition-all duration-300">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-600 group-hover:text-sky-400 group-hover:border-sky-500/20 transition-all">
                    <Icon size={14} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col justify-center">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-zinc-300 transition-colors">
                        {label}
                    </span>
                    <div className="w-20 h-[2px] bg-zinc-800/50 mt-1 rounded-full overflow-hidden">
                        <div 
                            style={{ width: `${barWidth}%` }} 
                            className={`h-full rounded-full transition-all duration-700 ${pct > 25 ? 'bg-amber-500/40' : 'bg-sky-500/40'}`} 
                        />
                    </div>
                </div>
            </div>
            <div className="text-right">
                <span className={`block text-xs font-mono font-bold ${color === "text-zinc-500" ? "text-zinc-200" : color}`}>
                    {formatCurrency(value)}
                </span>
                <span className="block text-[8px] text-zinc-600 font-black tracking-widest uppercase">
                    {pct}%_PART
                </span>
            </div>
        </div>
    );
};

export default function Summary({ resultados = {}, entradas = {}, salvar = () => { } }) {
    const {
        custoUnitario = 0, precoSugerido = 0, precoComDesconto = 0, margemEfetivaPct = 0, lucroBrutoUnitario = 0,
        custoMaterial = 0, custoEnergia = 0, custoMaquina = 0, custoMaoDeObra = 0,
        custoEmbalagemFrete = 0, custosExtras = 0, custoSetup = 0,
        valorRisco = 0, valorImpostos = 0, valorMarketplace = 0
    } = resultados;

    const [salvo, setSalvo] = useState(false);

    const totalBase = precoSugerido || 0;
    const isNeutral = totalBase <= 0.01;
    const margemNum = Number(margemEfetivaPct || 0);
    const temLucro = margemNum > 0;

    const custoTotalReal = custoUnitario + valorImpostos + valorMarketplace;
    const pctCusto = totalBase > 0 ? Math.min(100, Math.round((custoTotalReal / totalBase) * 100)) : 0;
    const pctLucro = totalBase > 0 ? Math.max(0, 100 - pctCusto) : 0;
    
    const temDesconto = precoComDesconto > 0 && precoComDesconto < precoSugerido;

    // CONFIGURAÇÃO VISUAL ESTILO "FLEET CONTROL"
    const status = useMemo(() => {
        if (isNeutral) return {
            label: "IDLE_MODE",
            color: "text-zinc-700",
            bg: "bg-zinc-900/20 border-zinc-800/50",
            icon: CircleDashed,
            bar: "bg-zinc-800"
        };
        if (temLucro) return {
            label: "SYSTEM_NOMINAL",
            color: "text-emerald-500",
            bg: "bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_30px_-10px_rgba(16,185,129,0.1)]",
            icon: ShieldCheck,
            bar: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
        };
        return {
            label: "MARGIN_CRITICAL",
            color: "text-rose-500",
            bg: "bg-rose-500/5 border-rose-500/20 shadow-[0_0_30_px-10px_rgba(244,63,94,0.1)]",
            icon: AlertTriangle,
            bar: "bg-rose-500"
        };
    }, [isNeutral, temLucro]);

    const StatusIcon = status.icon;

    return (
        <div className="h-full flex flex-col gap-5 select-none">
            
            {/* === 1. INDICADOR DE PERFORMANCE (ESTILO GAUGE) === */}
            <div className={`relative overflow-hidden rounded-2xl border p-6 transition-all duration-500 ${status.bg}`}>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2.5">
                        <StatusIcon size={16} className={status.color} />
                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${status.color}`}>
                            {status.label}
                        </span>
                    </div>
                    {!isNeutral && (
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black border font-mono ${status.color} bg-white/5 border-white/10`}>
                            ROI_{margemNum}%
                        </span>
                    )}
                </div>

                <div className="mb-6">
                    <h2 className={`text-5xl font-black font-mono tracking-tighter ${isNeutral ? 'text-zinc-800' : 'text-white'}`}>
                        {formatCurrency(lucroBrutoUnitario)}
                    </h2>
                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-2 block">
                        Net_Profit_Unit
                    </span>
                </div>

                {/* BARRA DE DIVISÃO DE MARGEM */}
                <div className="space-y-2">
                    <div className="flex justify-between text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em]">
                        <span>Cost_Load ({pctCusto}%)</span>
                        <span>Profit ({pctLucro}%)</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-950/80 rounded-full overflow-hidden flex p-[1px] border border-white/5">
                        <div style={{ width: `${pctCusto}%` }} className="bg-zinc-800 h-full transition-all duration-1000" />
                        <div style={{ width: `${pctLucro}%` }} className={`${status.bar} h-full transition-all duration-1000`} />
                    </div>
                </div>
            </div>

            {/* === 2. PREÇO SUGERIDO (ESTILO PROTOCOLO FINAL) === */}
            <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-6 text-center relative overflow-hidden group">
                {temDesconto && <div className="absolute inset-0 bg-sky-500/5 opacity-50 blur-3xl pointer-events-none" />}
                
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Activity size={12} className="text-zinc-600" />
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">Final_Quote_Output</span>
                </div>

                {temDesconto ? (
                    <div className="flex flex-col items-center">
                        <span className="text-4xl font-black text-sky-400 font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                            {formatCurrency(precoComDesconto)}
                        </span>
                        <span className="text-[10px] text-zinc-600 font-mono line-through mt-1">
                            LIST_PRICE: {formatCurrency(precoSugerido)}
                        </span>
                    </div>
                ) : (
                    <span className={`text-4xl font-black font-mono tracking-tighter ${isNeutral ? 'text-zinc-800' : 'text-white'}`}>
                        {formatCurrency(precoSugerido)}
                    </span>
                )}
            </div>

            {/* === 3. LISTA DE COMPOSIÇÃO (ESTILO TERMINAL) === */}
            <div className="flex-1 bg-zinc-950/20 border border-white/5 rounded-2xl flex flex-col overflow-hidden backdrop-blur-md">
                <div className="px-4 py-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Layers size={14} className="text-zinc-600" />
                        <h3 className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Diagnostic_Breakdown</h3>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500">v2.4_CALC</span>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
                    {isNeutral ? (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-800 gap-3 opacity-40">
                            <Calculator size={40} strokeWidth={1} />
                            <span className="text-[9px] uppercase font-black tracking-[0.4em]">Awaiting_Parameters</span>
                        </div>
                    ) : (
                        <>
                            <SummaryRow icon={Package} label="Material" value={custoMaterial} total={totalBase} />
                            <SummaryRow icon={Zap} label="Energia" value={custoEnergia} total={totalBase} />
                            <SummaryRow icon={Clock} label="Depreciação" value={custoMaquina} total={totalBase} />
                            <SummaryRow icon={Share2} label="Setup_Fee" value={custoSetup} total={totalBase} />
                            <div className="h-px bg-white/5 my-2 mx-3" />
                            <SummaryRow icon={Wrench} label="Mão de Obra" value={custoMaoDeObra} total={totalBase} />
                            <SummaryRow icon={CircleDashed} label="Extras" value={custosExtras} total={totalBase} />
                            <div className="h-px bg-white/5 my-2 mx-3" />
                            <SummaryRow icon={Landmark} label="Impostos" value={valorImpostos} total={totalBase} color="text-rose-400" />
                            <SummaryRow icon={Store} label="Comissão" value={valorMarketplace} total={totalBase} color="text-rose-400" />
                        </>
                    )}
                </div>

                <div className="p-4 bg-zinc-900/50 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">OpEx_Total</span>
                    <span className={`text-lg font-black font-mono ${isNeutral ? 'text-zinc-800' : 'text-zinc-200'}`}>
                        {formatCurrency(custoTotalReal)}
                    </span>
                </div>
            </div>

            {/* === 4. AÇÕES FINAIS (ESTILO REGISTRAR MATERIAL) === */}
            <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                    onClick={() => window.print()}
                    disabled={isNeutral}
                    className="h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30"
                >
                    <Printer size={16} strokeWidth={3} /> Print_Log
                </button>

                <button
                    onClick={salvar}
                    disabled={isNeutral}
                    className={`
                        h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95
                        ${salvo 
                            ? "bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]" 
                            : "bg-sky-600 hover:bg-sky-500 text-white shadow-[0_0_20px_rgba(14,165,233,0.15)] disabled:bg-zinc-900 disabled:shadow-none"}
                    `}
                >
                    {salvo ? <CheckCircle2 size={18} strokeWidth={3} /> : <Save size={18} strokeWidth={3} />}
                    {salvo ? "Stored" : "Save_Data"}
                </button>
            </div>
        </div>
    );
}