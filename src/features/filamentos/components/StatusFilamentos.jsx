import React, { useMemo } from "react";
import { Box, AlertTriangle, BadgeDollarSign, Activity, Thermometer, RefreshCw, Trash2 } from "lucide-react";
import StatsWidget from "../../../components/ui/StatsWidget";

/**
 * Utilitário de formatação de moeda (Memoizado no componente principal para performance)
 */
const formatCurrency = (val) => {
  const numericValue = typeof val === 'number' ? val : parseFloat(val) || 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: numericValue >= 100000 ? "compact" : "standard",
  }).format(numericValue);
};

/**
 * Card de Visão Geral (Saúde do Estoque)
 */
const StockOverviewCard = ({ totalWeight = 0, lowStockCount = 0 }) => {
  // Garantia de tipos numéricos
  const count = Math.max(0, parseInt(lowStockCount, 10) || 0);
  const peso = Math.max(0, parseFloat(totalWeight) || 0);
  const isAlert = count > 0;

  // Cálculo de progresso visual (seguro entre 0 e 100)
  const progressWidth = isAlert ? '100%' : '75%';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`relative h-[130px] p-6 rounded-2xl overflow-hidden flex items-center justify-between transition-all duration-500 group border
        ${isAlert
          ? 'bg-rose-950/10 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.05)]'
          : 'bg-zinc-950/40/40 border-rose-500/30 backdrop-blur-sm shadow-[0_0_15px_rgba(244,63,94,0.05)]'}`}
    >

      <div className={`absolute -right-4 -top-4 w-24 h-24 blur-[60px] transition-all duration-700 
          ${isAlert ? 'bg-rose-500/10' : 'bg-rose-500/10'}`}
      />

      <div className="flex items-center gap-5 relative z-10">
        <div className={`p-3.5 rounded-xl bg-zinc-950 border transition-all duration-500
            ${isAlert ? 'border-rose-500/40 text-rose-500' : 'border-rose-500/20 text-rose-400'}`}>
          {isAlert ? (
            <AlertTriangle size={24} strokeWidth={2.5} className="animate-pulse" />
          ) : (
            <Box size={24} strokeWidth={2.5} />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isAlert ? 'bg-rose-500 animate-pulse' : 'bg-rose-500'}`} />
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
            {isAlert
              ? `${count} ${count === 1 ? 'carretel abaixo do limite' : 'carretéis abaixo do limite'}`
              : `Peso total: ${peso.toFixed(2)}kg`
            }
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end relative z-10">
        <div className="text-[9px] text-zinc-600 font-bold uppercase mb-2 tracking-widest">Status_Geral</div>
        <div className="h-1.5 w-16 bg-zinc-950 rounded-full overflow-hidden border border-white/5" title={isAlert ? "Atenção necessária" : "Estoque saudável"}>
          <div
            className={`h-full rounded-full transition-all duration-1000 ${isAlert ? 'bg-rose-500' : 'bg-rose-500'}`}
            style={{ width: progressWidth }}
          />
        </div>
      </div>
    </div>
  );
};

// StatCard removido - Substituído por StatsWidget universal

export default function StatusFilamentos({
  totalWeight = 0,
  lowStockCount = 0,
  valorTotal = 0,
  weather = { loading: true },
  failureStats = { totalWeight: 0, totalCost: 0 }
}) {

  const displayStats = useMemo(() => {
    // Tratamento de segurança para o objeto de clima
    const isWeatherLoading = !weather || weather.loading;
    const tempVal = !isWeatherLoading && weather.temp !== undefined ? Math.round(weather.temp) : null;
    const humidityVal = !isWeatherLoading && weather.humidity !== undefined ? Math.round(weather.humidity) : null;

    return {
      financial: formatCurrency(valorTotal),
      temperature: tempVal !== null ? `${tempVal}°C` : "N/D",
      humidity: humidityVal !== null ? `${humidityVal}% Umidade` : "Sensor Offline",
      weatherLoading: isWeatherLoading
    };
  }, [valorTotal, weather]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* 1. Saúde do Estoque - Analisa quantidade e peso */}
      <StockOverviewCard
        totalWeight={totalWeight}
        lowStockCount={lowStockCount}
      />

      {/* 2. Custo do Inventário - Valor proporcional ao que resta nos carretéis */}
      <StatsWidget
        title="Financeiro"
        value={displayStats.financial}
        icon={BadgeDollarSign}
        iconColor="text-rose-500"
        iconBg="border-rose-500/20 bg-zinc-950"
        secondaryLabel="Valor Estimado"
        secondaryValue="Custo proporcional ao peso"
      />

      {/* 3. Clima Local - Essencial para conservação de filamentos (PLA/PETG/Nylon) */}
      <StatsWidget
        title="Ambiente"
        value={displayStats.temperature}
        icon={Thermometer}
        iconColor="text-rose-500"
        iconBg="border-rose-500/20 bg-zinc-950"
        secondaryLabel="Espaço Maker"
        secondaryValue={displayStats.humidity}
        isLoading={displayStats.weatherLoading}
      />

      {/* 4. Desperdício - Monitoramento de Falhas */}
      <StatsWidget
        title="Desperdício (30d)"
        value={failureStats?.totalWeight ? `${Math.round(failureStats.totalWeight)}g` : '0g'}
        icon={Trash2}
        iconColor="text-rose-500"
        iconBg="border-rose-500/20 bg-zinc-950"
        secondaryLabel="Custo Total"
        secondaryValue={formatCurrency(failureStats?.totalCost || 0)}
        isLoading={false}
      />
    </div>
  );
}
