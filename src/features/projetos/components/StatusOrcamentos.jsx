import React, { useMemo } from "react";
import { TrendingUp, Clock, Activity, AlertCircle, BadgeDollarSign } from "lucide-react";
import StatsWidget from "../../../components/ui/StatsWidget";
import { formatCurrency, formatDecimal, parseNumber } from "../../../utils/numbers";

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

    // Health Logic
    const margemPercent = metrics.bruto > 0 ? (metrics.lucro / metrics.bruto) * 100 : 0;
    const ehCritico = margemPercent < 15 && metrics.bruto > 0;
    const ehAltaPerformance = margemPercent >= 25;

    let theme = 'amber';
    if (ehCritico) theme = 'rose';
    else if (ehAltaPerformance) theme = 'emerald';

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
            {/* 1. Saúde Financeira */}
            <StatsWidget
                title="Saúde da Operação"
                value={ehCritico ? 'Margem Crítica' : ehAltaPerformance ? 'Alta Performance' : 'Margem Estável'}
                icon={ehCritico ? AlertCircle : TrendingUp}
                colorTheme={theme}
                isAlert={ehCritico}
                secondaryLabel="ROI Líquido"
                secondaryValue={`${formatDecimal(margemPercent, 1)}% sobre faturamento`}
                progress={{
                    value: Math.min(100, margemPercent * 2), // Visual scaling
                    color: ehCritico ? 'bg-rose-500' : (ehAltaPerformance ? 'bg-emerald-500' : 'bg-amber-500')
                }}
                valueSize="text-xl"
            />

            {/* 2. Volume Comercial */}
            <StatsWidget
                title="Comercial"
                value={formatCurrency(metrics.bruto)}
                icon={BadgeDollarSign}
                colorTheme="amber"
                secondaryLabel="Faturamento Total"
                secondaryValue={`${metrics.ativos} pedidos processados`}
                valueSize="text-xl"
            />

            {/* 3. Capacidade de Manufatura */}
            <StatsWidget
                title="Manufatura"
                value={`${metrics.horas}h`}
                icon={Clock}
                colorTheme="orange"
                secondaryLabel="Carga Horária"
                secondaryValue="Tempo total estimado"
                valueSize="text-xl"
            />
        </div>
    );
}
