// --- FILE: src/features/calculadora/components/Resumo.jsx ---
import React, { useState, useMemo } from "react";
import { formatCurrency } from "../../../lib/format";
import { 
    Save, TrendingUp, AlertTriangle, CheckCircle2,
    Package, Zap, Clock, Truck, Layers, Wrench,
    Landmark, Store, Tag, Printer, Share2,
    CircleDashed, Calculator, Activity, ShieldCheck, Box,
    ChevronDown, ShieldAlert
} from "lucide-react";

const SummaryRow = ({ icon: Icon, label, value, total, color = "text-zinc-500", isCompact }) => {
    // Exibe se o valor for relevante (> 0.01)
    if (!value || value < 0.01) return null;

    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    
    return (
        <div className={`
            flex items-center justify-between px-3 -mx-1 rounded-lg group hover:bg-white/5 transition-all duration-200
            ${isCompact ? 'py-0.5' : 'py-1.5'}
        `}>
            <div className="flex items-center gap-2.5 min-w-0">
                <div className={`
                    rounded bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-600 group-hover:text-sky-400 transition-all
                    ${isCompact ? 'w-5 h-5' : 'w-7 h-7'}
                `}>
                    <Icon size={isCompact ? 10 : 13} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col min-w-0">
                    <span className={`font-black text-zinc-500 uppercase tracking-widest truncate group-hover:text-zinc-300 ${isCompact ? 'text-[7.5px]' : 'text-[9px]'}`}>
                        {label}
                    </span>
                </div>
            </div>
            <div className="text-right shrink-0">
                <span className={`block font-mono font-bold leading-none ${isCompact ? 'text-[9px]' : 'text-xs'} ${color === "text-zinc-500" ? "text-zinc-200" : color}`}>
                    {formatCurrency(value)}
                </span>
                <span className="text-[7px] font-black text-zinc-600 uppercase tracking-tighter">
                    {pct}%_PART
                </span>
            </div>
        </div>
    );
};

export default function Summary({ resultados = {}, entradas = {}, salvar = () => { } }) {
    // MAPEAMENTO ATUALIZADO COM O NOVO CALCULATOR.JS
    const {
        custoUnitario = 0,      // Custo Total de Operação (Saída)
        precoSugerido = 0, 
        precoComDesconto = 0, 
        margemEfetivaPct = 0, 
        lucroBrutoUnitario = 0, // Lucro Líquido Real
        custoMaterial = 0, 
        custoEnergia = 0, 
        custoMaquina = 0,       // Já inclui manutenção oculta no novo motor
        custoMaoDeObra = 0,
        custoEmbalagem = 0, 
        custoFrete = 0, 
        custosExtras = 0, 
        custoSetup = 0,
        valorRisco = 0,         // Taxa de Falha calculada
        valorImpostos = 0, 
        valorMarketplace = 0    // Inclui % + Taxa Fixa
    } = resultados;

    const [salvo, setSalvo] = useState(false);

    const totalBase = precoComDesconto || precoSugerido || 0;
    const isNeutral = totalBase <= 0.01;
    const margemNum = Number(margemEfetivaPct || 0);
    const temLucro = margemNum > 0;
    
    // O custo total para o gráfico considera o que sai do bolso + taxas de venda
    const custoTotalReal = custoUnitario + valorImpostos + valorMarketplace;
    const pctCusto = totalBase > 0 ? Math.min(100, Math.round((custoTotalReal / totalBase) * 100)) : 0;
    const pctLucro = totalBase > 0 ? Math.max(0, 100 - pctCusto) : 0;

    // LÓGICA DE DENSIDADE DINÂMICA
    const activeRowsCount = useMemo(() => {
        const checkList = [custoMaterial, custoEnergia, custoMaquina, custoSetup, custoMaoDeObra, custoEmbalagem, custoFrete, custosExtras, valorRisco, valorImpostos, valorMarketplace];
        return checkList.filter(v => v > 0.01).length;
    }, [resultados]);

    const isCompact = activeRowsCount > 6;

    const status = useMemo(() => {
        if (isNeutral) return { label: "IDLE_MODE", color: "text-zinc-700", bg: "bg-zinc-900/20 border-zinc-800/50", icon: CircleDashed, bar: "bg-zinc-800" };
        if (temLucro) return { label: "SYSTEM_NOMINAL", color: "text-emerald-500", bg: "bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_30px_-10px_rgba(16,185,129,0.1)]", icon: ShieldCheck, bar: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" };
        return { label: "MARGIN_CRITICAL", color: "text-rose-500", bg: "bg-rose-500/5 border-rose-500/20 shadow-[0_0_30px_-10px_rgba(244,63,94,0.1)]", icon: AlertTriangle, bar: "bg-rose-500" };
    }, [isNeutral, temLucro]);

    return (
        <div className="h-full flex flex-col gap-3 select-none animate-in fade-in duration-500">
            
            {/* 1. GAUGE DE PERFORMANCE (LUCRO REAL) */}
            <div className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-500 ${status.bg}`}>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <status.icon size={14} className={status.color} />
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${status.color}`}>
                            {status.label}
                        </span>
                    </div>
                    {!isNeutral && (
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono font-bold text-zinc-400">
                            ROI_{margemNum}%
                        </span>
                    )}
                </div>

                <div className="mb-4">
                    <h2 className={`text-4xl font-black font-mono tracking-tighter ${isNeutral ? 'text-zinc-800' : 'text-white'}`}>
                        {formatCurrency(lucroBrutoUnitario)}
                    </h2>
                    <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mt-1 block">Net_Profit_Real</span>
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between text-[7px] font-black text-zinc-600 uppercase tracking-widest">
                        <span>Opex_Load_{pctCusto}%</span>
                        <span>Profit_{pctLucro}%</span>
                    </div>
                    <div className="h-1 w-full bg-zinc-950/80 rounded-full overflow-hidden flex p-[1px] border border-white/5">
                        <div style={{ width: `${pctCusto}%` }} className="bg-zinc-800 h-full transition-all duration-700" />
                        <div style={{ width: `${pctLucro}%` }} className={`${status.bar} h-full transition-all duration-700`} />
                    </div>
                </div>
            </div>

            {/* 2. QUOTE OUTPUT (VALOR FINAL COM DESCONTO) */}
            <div className="bg-zinc-950/40 border border-white/5 rounded-2xl py-3 px-6 text-center relative overflow-hidden shrink-0">
                <div className="flex items-center justify-center gap-2 mb-1 opacity-50">
                    <Activity size={10} className="text-zinc-500" />
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em]">Final_Sale_Price</span>
                </div>
                <span className={`text-3xl font-black font-mono tracking-tighter ${isNeutral ? 'text-zinc-800' : 'text-white'}`}>
                    {formatCurrency(precoComDesconto || precoSugerido)}
                </span>
            </div>

            {/* 3. DIAGNÓSTICO COM DENSIDADE DINÂMICA */}
            <div className="flex-1 bg-zinc-950/20 border border-white/5 rounded-2xl flex flex-col overflow-hidden backdrop-blur-md min-h-0">
                <div className="px-4 py-2 border-b border-white/5 bg-white/5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <Layers size={12} className="text-zinc-600" />
                        <h3 className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Diagnostic_Breakdown</h3>
                    </div>
                    <ChevronDown size={10} className="text-zinc-700" />
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-0.5">
                    {!isNeutral ? (
                        <>
                            {/* CATEGORIA: PRODUÇÃO BRUTA */}
                            <SummaryRow isCompact={isCompact} icon={Package} label="Material_Filamento" value={custoMaterial} total={totalBase} />
                            <SummaryRow isCompact={isCompact} icon={Zap} label="Energia_Elétrica" value={custoEnergia} total={totalBase} />
                            <SummaryRow isCompact={isCompact} icon={Clock} label="Depreciação_Hardware" value={custoMaquina} total={totalBase} />
                            <SummaryRow isCompact={isCompact} icon={Share2} label="Setup_Inicial" value={custoSetup} total={totalBase} />
                            
                            <div className="h-px bg-white/5 my-1 mx-2" />

                            {/* CATEGORIA: LOGÍSTICA E OPERAÇÃO */}
                            <SummaryRow isCompact={isCompact} icon={Wrench} label="Trabalho_Manual" value={custoMaoDeObra} total={totalBase} />
                            <SummaryRow isCompact={isCompact} icon={Box} label="Embalagem_Un" value={custoEmbalagem} total={totalBase} />
                            <SummaryRow isCompact={isCompact} icon={Truck} label="Logística_Frete" value={custoFrete} total={totalBase} />
                            <SummaryRow isCompact={isCompact} icon={CircleDashed} label="Insumos_Extras" value={custosExtras} total={totalBase} />
                            
                            <div className="h-px bg-white/5 my-1 mx-2" />

                            {/* CATEGORIA: SEGURANÇA E IMPOSTOS */}
                            <SummaryRow isCompact={isCompact} icon={ShieldAlert} label="Risco_Falha_Est" value={valorRisco} total={totalBase} color="text-amber-500/80" />
                            <SummaryRow isCompact={isCompact} icon={Landmark} label="Impostos_Venda" value={valorImpostos} total={totalBase} color="text-rose-400/80" />
                            <SummaryRow isCompact={isCompact} icon={Store} label="Marketplace_Fee" value={valorMarketplace} total={totalBase} color="text-rose-400/80" />
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-800 gap-3 opacity-30">
                            <Calculator size={32} strokeWidth={1} />
                            <span className="text-[8px] uppercase font-black tracking-[0.4em]">Standby</span>
                        </div>
                    )}
                </div>

                {/* RODAPÉ DO DIAGNÓSTICO (CUSTO TOTAL) */}
                <div className="p-3 bg-zinc-900/50 border-t border-white/5 flex justify-between items-center shrink-0">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">OpEx_Total</span>
                    <span className={`text-base font-black font-mono ${isNeutral ? 'text-zinc-800' : 'text-zinc-200'}`}>
                        {formatCurrency(custoTotalReal)}
                    </span>
                </div>
            </div>

            {/* 4. BOTÕES DE CONTROLE */}
            <div className="grid grid-cols-2 gap-2 shrink-0 pb-1">
                <button onClick={() => window.print()} disabled={isNeutral} className="h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-all font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95">
                    <Printer size={14} /> Print
                </button>
                <button onClick={salvar} disabled={isNeutral} className={`h-10 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${salvo ? "bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-sky-600 hover:bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.1)]"}`}>
                    {salvo ? <CheckCircle2 size={16} /> : <Save size={16} />} {salvo ? "Stored" : "Save_Data"}
                </button>
            </div>
        </div>
    );
}