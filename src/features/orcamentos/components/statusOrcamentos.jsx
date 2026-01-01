import React, { useMemo } from "react";
import { 
    TrendingUp, 
    BadgeDollarSign, 
    Activity, 
    Zap, 
    Target,
    ShieldCheck,
    Cpu
} from "lucide-react";

/**
 * Utilitário de formatação monetária PrintLog
 */
const formatCurrency = (val) => {
    const value = Number(val) || 0;
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        notation: value >= 100000 ? "compact" : "standard",
    }).format(value);
};

/**
 * CARD PRINCIPAL: Saúde Financeira (Baseado no Degradê da Logo)
 */
const FinancialHealthCard = ({ bruto, lucro }) => {
    const margemPercent = bruto > 0 ? (lucro / bruto) * 100 : 0;
    
    // Escala baseada na Logo: Emerald (Top), Sky (Médio), Cyan (Risco/Início)
    const isHigh = margemPercent >= 30;
    const isMedium = margemPercent >= 15 && margemPercent < 30;

    return (
        <div className="group relative h-[120px] bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden flex items-center justify-between p-6 backdrop-blur-md transition-all hover:bg-zinc-900/60">
            
            {/* ASSINATURA GRADIENTE DE TOPO */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-500 opacity-70" />

            <div className="flex items-center gap-4 relative z-10">
                <div className={`p-3 rounded-xl bg-zinc-950 border border-white/10 transition-colors duration-500 ${isHigh ? 'text-emerald-400' : isMedium ? 'text-sky-400' : 'text-cyan-400'}`}>
                    <TrendingUp size={22} strokeWidth={2.5} />
                </div>
                
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isHigh ? 'bg-emerald-500' : isMedium ? 'bg-sky-500' : 'bg-cyan-500'}`} />
                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Efficiency_Index</p>
                    </div>
                    <h3 className="text-lg font-black text-white uppercase italic tracking-tighter leading-none">
                        {isHigh ? 'Alta Performance' : isMedium ? 'Margem Estável' : 'Ajuste Necessário'}
                    </h3>
                    <p className="text-[10px] font-mono font-bold mt-2 text-zinc-500 uppercase tracking-widest">
                        ROI: <span className={isHigh ? 'text-emerald-400' : 'text-sky-400'}>{margemPercent.toFixed(1)}%</span>
                    </p>
                </div>
            </div>

            <div className="text-right flex flex-col items-end">
                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-2">Lucro_Líquido</span>
                <span className={`text-xl font-mono font-black italic tracking-tighter ${isHigh ? 'text-emerald-500' : 'text-sky-500'}`}>
                    {formatCurrency(lucro)}
                </span>
            </div>
        </div>
    );
};

/**
 * CARD SECUNDÁRIO (Compacto e Profissional)
 */
const StatCard = ({ title, value, icon: Icon, colorClass, secondaryLabel, glowColor }) => (
    <div className="group relative h-[120px] p-6 rounded-2xl bg-zinc-900/40 border border-white/5 backdrop-blur-md flex items-center justify-between transition-all hover:bg-zinc-900/60 overflow-hidden">
        
        {/* ASSINATURA GRADIENTE DE TOPO */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-500 opacity-30 group-hover:opacity-100 transition-opacity" />

        <div className="flex items-center gap-4 relative z-10">
            <div className={`p-3 rounded-xl bg-zinc-950 border border-white/10 ${colorClass}`}>
                <Icon size={22} strokeWidth={2} />
            </div>
            <div>
                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-1.5">{title}</p>
                <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest italic">{secondaryLabel}</span>
            </div>
        </div>

        <div className="text-right relative z-10">
            <h3 className="text-xl font-mono font-black text-white tracking-tighter leading-none italic">
                {value}
            </h3>
            <div className={`mt-3 h-1 w-12 ml-auto rounded-full bg-gradient-to-r ${glowColor} opacity-50`} />
        </div>
    </div>
);

export default function StatusOrcamentos({ 
    totalBruto = 0, 
    totalLucro = 0, 
    projetosAtivos = 0, 
    horasEstimadas = 0 
}) {
    const metrics = useMemo(() => ({
        bruto: Number(totalBruto) || 0,
        lucro: Number(totalLucro) || 0,
        ativos: Number(projetosAtivos) || 0,
        horas: Number(horasEstimadas).toFixed(1)
    }), [totalBruto, totalLucro, projetosAtivos, horasEstimadas]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
            
            {/* 1. Saúde Financeira (Base Emerald/Sky) */}
            <FinancialHealthCard 
                bruto={metrics.bruto} 
                lucro={metrics.lucro} 
            />
            
            {/* 2. Comercial (Foco Sky/Blue) */}
            <StatCard 
                title="Comercial" 
                value={formatCurrency(metrics.bruto)} 
                icon={BadgeDollarSign} 
                colorClass="text-sky-400" 
                glowColor="from-cyan-500 to-sky-500"
                secondaryLabel={`${metrics.ativos} Pedidos Ativos`} 
            />

            {/* 3. Produção (Foco Emerald/Green) */}
            <StatCard 
                title="Manufatura" 
                value={`${metrics.horas}h`} 
                icon={Cpu} 
                colorClass="text-emerald-400" 
                glowColor="from-sky-500 to-emerald-500"
                secondaryLabel="Carga de Frota" 
            />
        </div>
    );
}