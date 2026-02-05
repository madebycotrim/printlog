import { useMemo } from "react";
import { Activity, Check, AlertTriangle, CheckCircle2, Timer, Server, Layers } from "lucide-react";
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
      {/* 1. Saúde do Farm (Premium Look) */}
      <StatsWidget
        title="Frota Ativa"
        value={numTotal === 1 ? '1 Máquina' : `${numTotal} Máquinas`}
        icon={Server}
        colorTheme="violet"
        iconColor="text-violet-400"
        iconBg="bg-violet-500/10 border-violet-500/20"
        secondaryLabel="Status Operacional"
        secondaryValue={ehSaudavel ? '100% Saudável' : `${numCriticos} com Atenção`}
        isAlert={!ehSaudavel}
        progress={{
          value: porcentagemSaude,
          color: ehSaudavel ? 'bg-violet-500' : 'bg-rose-500'
        }}
        valueSize="text-2xl"
      />

      {/* 2. Produção Total */}
      <StatsWidget
        title="Histórico de Produção"
        value={estatisticasFormatadas.totalImpressoes}
        icon={Layers}
        colorTheme="emerald"
        secondaryLabel="Peças Impressas"
        secondaryValue="Total acumulado"
        valueSize="text-2xl"
      />

      {/* 3. Consumo de Material */}
      <StatsWidget
        title="Material Processado"
        value={estatisticasFormatadas.massaFilamento}
        icon={CheckCircle2} // Changed icon to distinguish
        colorTheme="amber"
        secondaryLabel="Filamento Consumido"
        secondaryValue="Desde o início"
        valueSize="text-2xl"
      />
    </div>
  );
}
