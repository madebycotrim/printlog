import { useMemo } from "react";
import { Activity, Check, AlertTriangle, CheckCircle2, Timer } from "lucide-react";
import StatsWidget from "../../../components/ui/StatsWidget";
import { formatCompact, formatDecimal } from "../../../utils/numbers";

export default function StatusImpressoras({ criticalCount = 0, totalCount = 0, stats = {} }) {
  // Conversão segura
  const numCriticos = Math.max(0, Number(criticalCount) || 0);
  const numTotal = Math.max(0, Number(totalCount) || 0);
  const ehSaudavel = numCriticos === 0;

  // Cálculo da porcentagem de saúde
  const porcentagemSaude = numTotal > 0
    ? Math.max(0, Math.min(100, ((numTotal - numCriticos) / numTotal) * 100))
    : 100;

  // Processamento das estatísticas
  const estatisticasFormatadas = useMemo(() => {
    const totalPecas = stats?.totalPrints || 0;
    const totalFilamento = Number(stats?.filamento || 0);

    return {
      totalImpressoes: formatCompact(totalPecas),
      massaFilamento: `${formatDecimal(totalFilamento, 1)}kg`
    };
  }, [stats]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 1. Saúde do Farm */}
      <StatsWidget
        title="Status das Máquinas"
        value={ehSaudavel ? 'Operação Normal' : 'Atenção'}
        icon={ehSaudavel ? Check : AlertTriangle}
        isAlert={!ehSaudavel}
        colorTheme={ehSaudavel ? 'zinc' : 'rose'} // Zinc implies "Neutral/Good" in this context contextually, but we can stick to 'emerald' for explicit Good
        // Actually, the previous design used Emerald for good. Let's use 'emerald' for consistency if "Operação Normal" is green.
        // Wait, "Operação Normal" was Zinc in previous, only Emerald icon. 'zinc' theme has zinc icon.
        // Let's force 'emerald' theme if healthy? Or just 'zinc' for sleekness?
        // Old FarmHealthCard used emerald for healthy. Let's use 'emerald' theme for Healthy.
        // Wait, StatsWidget 'zinc' matches the "Neutral" look, but let's see.
        // I'll use 'emerald' for healthy to match Filamentos "Saudável" logic.
        iconColor={ehSaudavel ? "text-emerald-500" : undefined}
        iconBg={ehSaudavel ? "border-emerald-500/20 bg-emerald-500/5" : undefined}
        secondaryLabel="Saúde do Farm"
        secondaryValue={ehSaudavel ? '100% Operacional' : `${numCriticos} paradas`}
        progress={{
          value: porcentagemSaude,
          color: ehSaudavel ? 'bg-emerald-500' : 'bg-rose-500'
        }}
        valueSize="text-xl"
      />

      <StatsWidget
        title="Produção Total"
        value={estatisticasFormatadas.totalImpressoes}
        icon={CheckCircle2}
        colorTheme="emerald"
        secondaryLabel="Peças Finalizadas"
        secondaryValue="Histórico geral"
        valueSize="text-xl"
      />

      <StatsWidget
        title="Material Usado"
        value={estatisticasFormatadas.massaFilamento}
        icon={Timer}
        colorTheme="amber"
        secondaryLabel="Total de Filamento"
        secondaryValue="Consumo acumulado"
        valueSize="text-xl"
      />
    </div>
  );
}
