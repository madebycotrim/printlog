import React, { useMemo } from "react";
import { AlertTriangle, BadgeDollarSign, Trash2, TrendingUp, TrendingDown, Droplets } from "lucide-react";
import StatsWidget from "../../../components/ui/StatsWidget";
import { formatCurrency } from "../../../utils/numbers";

function StatusFilamentos({
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
      financial: formatCurrency(valorTotal || 0),
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
        title="Total em Estoque"
        value={`${(totalWeight || 0).toFixed(2)}kg`}
        icon={AlertTriangle}
        colorTheme={lowStockCount > 0 ? 'rose' : 'emerald'}
        secondaryLabel="Status"
        secondaryValue={lowStockCount > 0 ? `${lowStockCount} Itens Baixos` : "Saudável"}
        isAlert={lowStockCount > 0}
      />

      {/* 2. Valor em Estoque */}
      <StatsWidget
        title="Patrimônio"
        value={displayStats.financial}
        icon={BadgeDollarSign}
        colorTheme="emerald"
        secondaryLabel="Valor Investido"
        secondaryValue="Em Materiais"
        FooterIcon={TrendingUp}
      />

      {/* 3. Clima (Umidade) */}
      <StatsWidget
        title="Ambiente"
        value={displayStats.humidity}
        icon={Droplets}
        colorTheme={displayStats.isHighHumidity ? 'rose' : 'sky'}
        secondaryLabel="Temperatura"
        secondaryValue={displayStats.temperature}
        isAlert={displayStats.isHighHumidity}
      />

      {/* 4. Desperdício - Monitoramento de Falhas */}
      <StatsWidget
        title="Perda (30d)"
        value={failureStats?.totalWeight ? `${Math.round(failureStats.totalWeight)}g` : '0g'}
        icon={Trash2}
        colorTheme="rose"
        secondaryLabel="Prejuízo Estimado"
        secondaryValue={formatCurrency(failureStats?.totalCost || 0)}
        FooterIcon={TrendingDown}
      />
    </div>
  );
}

export default React.memo(StatusFilamentos);
