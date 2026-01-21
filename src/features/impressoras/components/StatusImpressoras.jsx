import { useMemo } from "react";
import { Activity, Check, AlertTriangle, CheckCircle2, Timer } from "lucide-react";
import StatsWidget from "../../../components/ui/StatsWidget";
import { formatCompact, formatDecimal } from "../../../utils/numbers";

// StatCard removido - Substituído por StatsWidget universal

/**
 * Componente de Saúde das Máquinas
 */
const FarmHealthCard = ({ criticalCount, totalCount }) => {
  // Conversão segura para número
  const numCriticos = Math.max(0, Number(criticalCount) || 0);
  const numTotal = Math.max(0, Number(totalCount) || 0);

  // As máquinas são consideradas saudáveis apenas se não houver nenhuma parada ou com erro
  const ehSaudavel = numCriticos === 0;

  // Cálculo da porcentagem de saúde
  const porcentagemSaude = numTotal > 0
    ? Math.max(0, Math.min(100, ((numTotal - numCriticos) / numTotal) * 100))
    : 100;

  const estilosStatus = ehSaudavel
    ? {
      container: "bg-zinc-950/40/40 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]",
      glow: "bg-emerald-500/10",
      iconBox: "border-emerald-500/20 text-emerald-500",
      indicator: "bg-emerald-500",
      title: "text-zinc-100",
      subtitle: "text-zinc-500",
      bar: "bg-emerald-500"
    }
    : {
      container: "bg-rose-950/10 border-rose-500/40 shadow-[0_10px_30px_rgba(244,63,94,0.1)]",
      glow: "bg-rose-500/20",
      iconBox: "border-rose-500/40 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]",
      indicator: "bg-rose-500 animate-pulse",
      title: "text-rose-500",
      subtitle: "text-rose-400/80",
      bar: "bg-rose-500"
    };

  return (
    <div className={`relative h-[130px] p-6 rounded-2xl overflow-hidden flex items-center justify-between transition-all duration-500 group border ${estilosStatus.container}`}>
      {/* Brilho de fundo dinâmico */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 blur-[60px] transition-all duration-700 ${estilosStatus.glow}`} />

      <div className="flex items-center gap-5 relative z-10">
        <div className={`p-3.5 rounded-xl bg-zinc-950 border transition-all duration-500 ${estilosStatus.iconBox}`}>
          {ehSaudavel ? (
            <Check size={24} strokeWidth={2.5} />
          ) : (
            <AlertTriangle size={24} strokeWidth={2.5} className="animate-pulse" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${estilosStatus.indicator}`} />
            <p className={`text-[10px] font-bold uppercase tracking-[0.15em] ${ehSaudavel ? 'text-zinc-500' : 'text-rose-500'}`}>
              STATUS DAS MÁQUINAS
            </p>
          </div>
          <h3 className={`text-xl font-bold tracking-tight leading-none transition-colors uppercase ${estilosStatus.title}`}>
            {ehSaudavel ? 'Operação Normal' : 'Atenção Necessária'}
          </h3>
          <p className={`text-[11px] font-medium mt-1.5 uppercase tracking-wide ${estilosStatus.subtitle}`}>
            {ehSaudavel ? 'Tudo funcionando certinho' : `${numCriticos} ${numCriticos === 1 ? 'impressora parada' : 'impressoras paradas'}`}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end relative z-10">
        <div className="text-[9px] text-zinc-500 font-bold uppercase mb-2 tracking-widest">SAÚDE</div>
        <div className="h-1.5 w-16 bg-zinc-950 rounded-full overflow-hidden border border-white/5">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${estilosStatus.bar}`}
            style={{ width: `${porcentagemSaude}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default function StatusDashboard({ criticalCount = 0, totalCount = 0, stats = {} }) {
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
      <FarmHealthCard
        criticalCount={criticalCount}
        totalCount={totalCount}
      />

      <StatsWidget
        title="Produção Total"
        value={estatisticasFormatadas.totalImpressoes}
        icon={CheckCircle2}
        iconColor="text-emerald-500"
        iconBg="border-emerald-500/20 bg-zinc-950"
        secondaryLabel="Peças Finalizadas"
        secondaryValue="Histórico geral das máquinas"
      />

      <StatsWidget
        title="Material Usado"
        value={estatisticasFormatadas.massaFilamento}
        icon={Timer}
        iconColor="text-amber-500/90"
        iconBg="border-amber-500/20 bg-zinc-950"
        secondaryLabel="Total de Filamento"
        secondaryValue="Consumo total acumulado"
      />
    </div>
  );
}
