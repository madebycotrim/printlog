// StatusFilamentos.jsx (Atualizado)
import React, { useMemo } from "react";
import { AlertTriangle, BadgeDollarSign, Trash2, TrendingUp, TrendingDown, Droplets } from "lucide-react";
import StatsWidget from "../../../components/ui/StatsWidget";

/**
 * Utilitário de formatação de moeda
 */
const formatCurrency = (val) => {
  const numericValue = typeof val === 'number' ? val : parseFloat(val) || 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: numericValue >= 100000 ? "compact" : "standard",
  }).format(numericValue);
};

export default function StatusFilamentos({
  totalWeight = 0,
  lowStockCount = 0,
  valorTotal = 0,
  weather = { loading: true },
  failureStats = { totalWeight: 0, totalCost: 0 }
}) {

  const displayStats = useMemo(() => {
    const isWeatherLoading = !weather || weather.isLoading;
    const data = weather.data || weather;

    const tempVal = !isWeatherLoading && data?.temp !== undefined ? Math.round(data.temp) : null;
    const humidityVal = !isWeatherLoading && data?.humidity !== undefined ? Math.round(data.humidity) : null;
    const isHigh = humidityVal !== null && humidityVal > 50;

    return {
      financial: (valorTotal || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      temperature: tempVal !== null ? `${tempVal}°C` : "--°C",
      humidity: humidityVal !== null ? `${humidityVal}%` : "--%",
      weatherLoading: isWeatherLoading,
      isHighHumidity: isHigh
    };
  }, [valorTotal, weather]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* 1. Saúde do Estoque */}
      <StatsWidget
        title={lowStockCount > 0 ? "Reposição" : "Saudável"}
        value={lowStockCount > 0 ? `${lowStockCount} Itens` : "Estoque OK"}
        icon={AlertTriangle}
        iconColor={lowStockCount > 0 ? "text-rose-500" : "text-emerald-500"}
        iconBg={lowStockCount > 0 ? "border-rose-500/20 bg-rose-500/5" : "border-emerald-500/20 bg-emerald-500/5"}
        glowColor={lowStockCount > 0 ? "bg-rose-500/20" : "bg-emerald-500/20"}
        secondaryLabel="Total em Estoque"
        secondaryValue={`${(totalWeight || 0).toFixed(2)}kg`}
        isAlert={lowStockCount > 0}
      />

      {/* 2. Valor em Estoque */}
      <StatsWidget
        title="Patrimônio"
        value={displayStats.financial}
        icon={BadgeDollarSign}
        iconColor="text-emerald-400"
        iconBg="border-emerald-500/20 bg-emerald-500/5"
        glowColor="bg-emerald-500/20"
        secondaryLabel="Valor Investido"
        secondaryValue="Em Materiais"
        FooterIcon={TrendingUp}
      />

      {/* 3. Clima (Umidade) */}
      <StatsWidget
        title="Ambiente"
        value={displayStats.humidity}
        icon={Droplets}
        iconColor="text-cyan-400"
        iconBg="border-cyan-500/20 bg-cyan-500/5"
        glowColor="bg-cyan-500/20"
        secondaryLabel="Temperatura"
        secondaryValue={displayStats.temperature}
        isAlert={displayStats.isHighHumidity}
      />

      {/* 4. Desperdício - Monitoramento de Falhas */}
      <StatsWidget
        title="Perda (30d)"
        value={failureStats?.totalWeight ? `${Math.round(failureStats.totalWeight)}g` : '0g'}
        icon={Trash2}
        iconColor="text-rose-400"
        iconBg="border-rose-500/20 bg-rose-500/5"
        glowColor="bg-rose-500/20"
        secondaryLabel="Prejuízo Estimado"
        secondaryValue={formatCurrency(failureStats?.totalCost || 0)}
        FooterIcon={TrendingDown}
      />
    </div>
  );
}
