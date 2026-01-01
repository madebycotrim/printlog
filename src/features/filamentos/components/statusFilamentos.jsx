import React, { useMemo } from "react";
import { Box, AlertTriangle, BadgeDollarSign, Activity, Thermometer } from "lucide-react";

/**
 * Formata valores monetários para o padrão brasileiro
 * @param {number} val - Valor numérico
 */
const formatCurrency = (val) => {
  const numericValue = Number(val) || 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    // Mantemos compact para valores muito altos para não quebrar o layout do card
    notation: numericValue >= 100000 ? "compact" : "standard",
  }).format(numericValue);
};

/**
 * Card de Visão Geral (Saúde do Estoque)
 */
const StockOverviewCard = ({ totalWeight = 0, lowStockCount = 0 }) => {
  const isAlert = Number(lowStockCount) > 0;
  // Garantia de que o peso seja tratado como número para o toFixed
  const pesoNumerico = Number(totalWeight) || 0;
  
  return (
    <div className={`relative h-[130px] p-6 rounded-2xl overflow-hidden flex items-center justify-between transition-all duration-500 group border
        ${isAlert 
            ? 'bg-rose-950/10 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.05)]' 
            : 'bg-zinc-900/40 border-sky-500/30 backdrop-blur-sm shadow-[0_0_15px_rgba(14,165,233,0.05)]'}`}>
      
      <div className={`absolute -right-4 -top-4 w-24 h-24 blur-[60px] transition-all duration-700 
          ${isAlert ? 'bg-rose-500/10' : 'bg-sky-500/10'}`} 
      />

      <div className="flex items-center gap-5 relative z-10">
        <div className={`p-3.5 rounded-xl bg-zinc-950 border transition-all duration-500
            ${isAlert ? 'border-rose-500/40 text-rose-500' : 'border-sky-500/20 text-sky-400'}`}>
          {isAlert ? <AlertTriangle size={24} strokeWidth={2.5} className="animate-pulse" /> : <Box size={24} strokeWidth={2.5} />}
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isAlert ? 'bg-rose-500 animate-pulse' : 'bg-sky-500'}`} />
            <p className={`text-[10px] font-bold uppercase tracking-[0.15em] ${isAlert ? 'text-rose-500/80' : 'text-zinc-500'}`}>
              Monitoramento do Estoque
            </p>
          </div>
          <h3 className={`text-xl font-bold tracking-tight leading-none transition-colors uppercase
              ${isAlert ? 'text-rose-500' : 'text-zinc-100'}`}>
            {isAlert ? 'Reposição Necessária' : 'Estoque em Dia'}
          </h3>
          <p className={`text-[11px] font-medium mt-2 uppercase tracking-wide
              ${isAlert ? 'text-rose-400/70' : 'text-zinc-500'}`}>
            {isAlert ? `${lowStockCount} carretéis abaixo do limite` : `Massa total: ${pesoNumerico.toFixed(2)}kg`}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end relative z-10">
        <div className="text-[9px] text-zinc-600 font-bold uppercase mb-2 tracking-widest">Status_Geral</div>
        <div className="h-1.5 w-16 bg-zinc-950 rounded-full overflow-hidden border border-white/5">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${isAlert ? 'bg-rose-500' : 'bg-sky-500'}`}
            style={{ width: isAlert ? '100%' : '75%' }}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Card Estatístico (Financeiro e Ambiente)
 */
const StatCard = ({ title, value, icon: Icon, colorClass, secondaryLabel, secondaryValue }) => (
  <div className="h-[130px] p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-sm flex items-center justify-between group transition-all duration-300 hover:border-zinc-700/50 hover:bg-zinc-900/60 shadow-sm">
    <div className="flex items-center gap-5">
      <div className={`p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 ${colorClass} shadow-inner group-hover:scale-105 transition-transform duration-500`}>
        <Icon size={24} strokeWidth={2} />
      </div>
      <div>
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.15em] mb-1.5">{title}</p>
        <div className="flex flex-col">
          <span className="text-[13px] text-zinc-200 font-bold uppercase tracking-tight leading-tight">{secondaryLabel}</span>
          <span className="text-[11px] text-zinc-500 font-medium mt-1">{secondaryValue}</span>
        </div>
      </div>
    </div>
    <div className="text-right flex flex-col justify-between h-full py-1">
      <h3 className="text-2xl font-bold text-zinc-100 font-sans tracking-tighter leading-none">
        {value}
      </h3>
      <div className="flex items-center gap-2 justify-end opacity-20">
        <Activity size={14} className="text-zinc-500" />
      </div>
    </div>
  </div>
);

export default function StatusFilamentos({ 
  totalWeight = 0, 
  lowStockCount = 0, 
  valorTotal = 0, 
  weather = { loading: true } 
}) {
  
  const displayStats = useMemo(() => {
    // Proteção contra objeto weather nulo ou incompleto
    const hasWeatherData = weather && !weather.loading;
    const tempVal = hasWeatherData ? Math.round(weather.temp || 0) : null;
    const humidityVal = hasWeatherData ? (weather.humidity || 0) : null;

    return {
      financial: formatCurrency(valorTotal),
      temperature: tempVal !== null ? `${tempVal}°C` : "--",
      humidity: humidityVal !== null ? `${humidityVal}% Umidade` : "Aguardando sensor..."
    };
  }, [valorTotal, weather]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 1. Saúde do Estoque */}
      <StockOverviewCard 
        totalWeight={totalWeight} 
        lowStockCount={lowStockCount} 
      />
      
      {/* 2. Custo do Inventário */}
      <StatCard 
        title="Financeiro" 
        value={displayStats.financial} 
        icon={BadgeDollarSign} 
        colorClass="text-sky-500" 
        secondaryLabel="Valor Estimado" 
        secondaryValue="Custo proporcional ao peso" 
      />

      {/* 3. Clima Local */}
      <StatCard 
        title="Ambiente" 
        value={displayStats.temperature} 
        icon={Thermometer} 
        colorClass="text-amber-500/90" 
        secondaryLabel="Maker Space" 
        secondaryValue={displayStats.humidity} 
      />
    </div>
  );
}