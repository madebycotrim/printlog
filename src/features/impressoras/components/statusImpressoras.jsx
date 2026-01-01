import React, { useMemo } from "react";
import { Check, AlertTriangle, Activity, CheckCircle2, Timer } from "lucide-react";

/**
 * Utilitário para formatação de números de forma compacta (ex: 1.2k)
 */
const formatarNumero = (valor) => {
  const numero = Number(valor);
  if (isNaN(numero)) return "0";
  if (numero === 0) return "0";
  
  return new Intl.NumberFormat("pt-BR", {
    notation: numero >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(numero).toLowerCase();
};

/**
 * Componente de Card Estatístico Genérico
 */
const StatCard = ({ title, value, icon: Icon, colorClass, label, description }) => (
  <div className="h-[130px] p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-sm flex items-center justify-between group transition-all duration-300 hover:border-zinc-700/50 hover:bg-zinc-900/60 shadow-sm">
    <div className="flex items-center gap-5">
      <div className={`p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 ${colorClass} shadow-inner group-hover:scale-105 transition-transform duration-500`}>
        <Icon size={24} strokeWidth={2} />
      </div>
      <div>
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.15em] mb-1.5">
          {title}
        </p>
        <div className="flex flex-col">
          <span className="text-[13px] text-zinc-200 font-bold uppercase tracking-tight leading-tight">
            {label}
          </span>
          <span className="text-[11px] text-zinc-500 font-medium mt-0.5">
            {description}
          </span>
        </div>
      </div>
    </div>
    
    <div className="text-right flex flex-col justify-between h-full py-1">
      <h3 className="text-2xl font-bold text-zinc-100 font-sans tracking-tighter leading-none">
        {value}
      </h3>
      <div className="flex items-center gap-2 justify-end opacity-20 group-hover:opacity-40 transition-opacity duration-300">
        <Activity size={14} className="text-zinc-500" />
      </div>
    </div>
  </div>
);

/**
 * Componente de Status de Saúde da Farm
 */
const FarmHealthCard = ({ criticalCount, totalCount }) => {
  // Conversão segura para número
  const numCriticos = Math.max(0, Number(criticalCount) || 0);
  const numTotal = Math.max(0, Number(totalCount) || 0);

  // A farm é considerada saudável apenas se não houver máquinas em estado crítico
  const ehSaudavel = numCriticos === 0;
  
  // Cálculo da porcentagem de saúde (evita divisão por zero)
  const porcentagemSaude = numTotal > 0 
    ? Math.max(0, Math.min(100, ((numTotal - numCriticos) / numTotal) * 100)) 
    : 100;

  const estilosStatus = ehSaudavel 
    ? {
        container: "bg-zinc-900/40 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]",
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
      {/* Background Glow dinâmico */}
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
              STATUS DO PARQUE
            </p>
          </div>
          <h3 className={`text-xl font-bold tracking-tight leading-none transition-colors uppercase ${estilosStatus.title}`}>
            {ehSaudavel ? 'Operação Normal' : 'Atenção Crítica'}
          </h3>
          <p className={`text-[11px] font-medium mt-1.5 uppercase tracking-wide ${estilosStatus.subtitle}`}>
            {ehSaudavel ? 'Hardware em conformidade' : `${numCriticos} ${numCriticos === 1 ? 'impressora parada' : 'unidades paradas'}`}
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
  // Processamento seguro das estatísticas para evitar NaN na renderização
  const estatisticasFormatadas = useMemo(() => {
    const totalPecas = stats?.totalPrints || 0;
    const totalFilamento = Number(stats?.filamento || 0);

    return {
      totalImpressoes: formatarNumero(totalPecas),
      massaFilamento: `${totalFilamento.toFixed(1)}kg`
    };
  }, [stats]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <FarmHealthCard 
        criticalCount={criticalCount} 
        totalCount={totalCount} 
      />

      <StatCard 
        title="Produção Total" 
        value={estatisticasFormatadas.totalImpressoes} 
        icon={CheckCircle2} 
        colorClass="text-emerald-500" 
        label="Peças Finalizadas" 
        description="Histórico total da farm" 
      />
      
      <StatCard 
        title="Massa Utilizada" 
        value={estatisticasFormatadas.massaFilamento} 
        icon={Timer} 
        colorClass="text-amber-500/90" 
        label="Total de Filamento" 
        description="Consumo acumulado" 
      />
    </div>
  );
}