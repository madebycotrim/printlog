import React, { useMemo } from "react";
import {
    TrendingUp,
    Wallet,
    Clock,
    Activity,
    AlertCircle,
    Check,
    BadgeDollarSign
} from "lucide-react";

import { formatCurrency, formatDecimal, parseNumber } from "../../../utils/numbers";

/**
 * Componente de Card Estatístico Genérico (Seguindo o estilo de Hardware)
 */
const StatCard = ({ title, value, icon: IconCard, colorClass, label, description, glowColor }) => (
    <div className="h-[130px] p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-sm flex items-center justify-between group transition-all duration-300 hover:border-amber-500/30 hover:bg-zinc-900/60 shadow-sm relative overflow-hidden">
        {/* Background Glow sutil no hover */}
        <div className={`absolute -right-2 -bottom-2 w-12 h-12 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${glowColor}`} />

        <div className="flex items-center gap-5 relative z-10">
            <div className={`p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 ${colorClass} shadow-inner group-hover:scale-105 transition-transform duration-500`}>
                <IconCard size={24} strokeWidth={2} />
            </div>
            <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.15em] mb-1.5">
                    {title}
                </p>
                <div className="flex flex-col">
                    <span className="text-[13px] text-zinc-200 font-bold uppercase tracking-tight leading-tight">
                        {label}
                    </span>
                    <span className="text-[11px] text-zinc-500 font-medium mt-0.5 italic">
                        {description}
                    </span>
                </div>
            </div>
        </div>

        <div className="text-right flex flex-col justify-between h-full py-1 relative z-10">
            <h3 className="text-2xl font-black text-zinc-100 font-mono tracking-tighter leading-none italic">
                {value}
            </h3>
            <div className="flex items-center gap-2 justify-end opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                <Activity size={14} className="text-zinc-500" />
            </div>
        </div>
    </div>
);

/**
 * Componente de Saúde da Operação (Baseado no lucro real)
 */
const OperationHealthCard = ({ bruto, lucro }) => {
    const margemPercent = bruto > 0 ? (lucro / bruto) * 100 : 0;

    // Lógica de status: Abaixo de 15% é crítico, acima de 25% é alta performance
    const ehCritico = margemPercent < 15 && bruto > 0;
    const ehAltaPerformance = margemPercent >= 25;

    const estilosStatus = ehCritico
        ? {
            container: "bg-rose-950/10 border-rose-500/40 shadow-[0_10px_30px_rgba(244,63,94,0.1)]",
            glow: "bg-rose-500/20",
            iconBox: "border-rose-500/40 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]",
            indicator: "bg-rose-500 animate-pulse",
            title: "text-rose-500",
            subtitle: "text-rose-400/80",
            bar: "bg-rose-500"
        }
        : {
            container: "bg-zinc-900/40 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]",
            glow: "bg-amber-500/10",
            iconBox: "border-amber-500/20 text-amber-500",
            indicator: "bg-amber-500",
            title: "text-zinc-100",
            subtitle: "text-zinc-500",
            bar: "bg-amber-500"
        };

    return (
        <div className={`relative h-[130px] p-6 rounded-2xl overflow-hidden flex items-center justify-between transition-all duration-500 group border ${estilosStatus.container}`}>
            <div className={`absolute -right-4 -top-4 w-24 h-24 blur-[60px] transition-all duration-700 ${estilosStatus.glow}`} />

            <div className="flex items-center gap-5 relative z-10">
                <div className={`p-3.5 rounded-xl bg-zinc-950 border transition-all duration-500 ${estilosStatus.iconBox}`}>
                    {ehCritico ? (
                        <AlertCircle size={24} strokeWidth={2.5} className="animate-pulse" />
                    ) : (
                        <TrendingUp size={24} strokeWidth={2.5} />
                    )}
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${estilosStatus.indicator}`} />
                        <p className={`text-[10px] font-bold uppercase tracking-[0.15em] ${ehCritico ? 'text-rose-500' : 'text-zinc-500'}`}>
                            SAÚDE DA OPERAÇÃO
                        </p>
                    </div>
                    <h3 className={`text-xl font-black tracking-tight leading-none transition-colors uppercase italic ${estilosStatus.title}`}>
                        {ehCritico ? 'Margem Crítica' : ehAltaPerformance ? 'Alta Performance' : 'Margem Estável'}
                    </h3>
                    <p className={`text-[11px] font-bold mt-1.5 uppercase tracking-wide font-mono ${estilosStatus.subtitle}`}>
                        ROI: {formatDecimal(margemPercent, 1)}% <span className="opacity-40 ml-1">// LÍQUIDO</span>
                    </p>
                </div>
            </div>

            <div className="flex flex-col items-end relative z-10">
                <div className="text-[9px] text-zinc-500 font-bold uppercase mb-2 tracking-[0.2em]">EFICIÊNCIA</div>
                <div className="h-1.5 w-20 bg-zinc-950 rounded-full overflow-hidden border border-white/5">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${estilosStatus.bar}`}
                        style={{ width: `${Math.min(100, margemPercent * 2)}%` }} // Multiplicador visual
                    />
                </div>
                <span className="text-[10px] font-mono font-bold text-zinc-500 mt-2 italic">
                    {formatCurrency(lucro)}
                </span>
            </div>
        </div>
    );
};

export default function StatusOrcamentos({
    totalBruto = 0,
    totalLucro = 0,
    projetosAtivos = 0,
    horasEstimadas = 0
}) {

    const metrics = useMemo(() => ({
        bruto: parseNumber(totalBruto),
        lucro: parseNumber(totalLucro),
        ativos: parseNumber(projetosAtivos),
        horas: formatDecimal(horasEstimadas, 1)
    }), [totalBruto, totalLucro, projetosAtivos, horasEstimadas]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">

            {/* 1. Saúde Financeira (Gauge de Margem) */}
            <OperationHealthCard
                bruto={metrics.bruto}
                lucro={metrics.lucro}
            />

            {/* 2. Volume Comercial */}
            <StatCard
                title="Comercial"
                value={formatCurrency(metrics.bruto)}
                icon={BadgeDollarSign}
                colorClass="text-amber-500"
                glowColor="bg-amber-500/20"
                label="Faturamento Total"
                description={`${metrics.ativos} pedidos processados`}
            />

            {/* 3. Capacidade de Manufatura */}
            <StatCard
                title="Manufatura"
                value={`${metrics.horas}h`}
                icon={Clock}
                colorClass="text-orange-500"
                glowColor="bg-orange-500/20"
                label="Carga Horária"
                description="Tempo total estimado"
            />
        </div>
    );
}