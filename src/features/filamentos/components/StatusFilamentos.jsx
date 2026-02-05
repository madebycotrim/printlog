import React, { useMemo } from "react";
import { AlertTriangle, BadgeDollarSign, Trash2, TrendingUp, TrendingDown, Droplets } from "lucide-react";
import StatsWidget from "../../../components/ui/StatsWidget";
import { formatCurrency } from "../../../utils/numbers";

function StatusFilamentos({
  pesoTotal = 0,
  contagemEstoqueBaixo = 0,
  valorTotal = 0,
  weatherData = { temp: null, humidity: null, loading: true },
  estatisticasFalhas = { totalWeight: 0, totalCost: 0 }
}) {

  const estatisticasExibicao = useMemo(() => {
    const { temp, humidity, loading } = weatherData;
    const climaCarregando = !!loading;

    // Se loading for false mas temp/humidity forem null, ainda não temos dados
    const valorTemp = !climaCarregando && temp !== null && temp !== undefined ? Math.round(temp) : null;
    const valorUmidade = !climaCarregando && humidity !== null && humidity !== undefined ? Math.round(humidity) : null;

    const ehAlta = valorUmidade !== null && valorUmidade > 50;

    return {
      financeiro: formatCurrency(valorTotal || 0),
      temperatura: valorTemp !== null ? `${valorTemp}°C` : "--°C",
      umidade: valorUmidade !== null ? `${valorUmidade}%` : "--%",
      climaCarregando: climaCarregando,
      ehUmidadeAlta: ehAlta
    };
  }, [valorTotal, weatherData]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* 1. Saúde do Estoque */}
      <StatsWidget
        title="Total em Estoque"
        value={`${(pesoTotal || 0).toFixed(2)} kg/L`}
        icon={AlertTriangle}
        colorTheme={contagemEstoqueBaixo > 0 ? 'rose' : 'emerald'}
        secondaryLabel="Status"
        secondaryValue={contagemEstoqueBaixo > 0 ? `${contagemEstoqueBaixo} Itens Baixos` : "Saudável"}
        isAlert={contagemEstoqueBaixo > 0}
        valueSize="text-xl"
      />

      {/* 2. Valor em Estoque */}
      <StatsWidget
        title="Patrimônio"
        value={estatisticasExibicao.financeiro}
        icon={BadgeDollarSign}
        colorTheme="emerald"
        secondaryLabel="Valor Investido"
        secondaryValue="Em Materiais"
        FooterIcon={TrendingUp}
        valueSize="text-xl"
      />

      {/* 3. Clima (Umidade) */}
      <StatsWidget
        title="Ambiente"
        value={estatisticasExibicao.umidade}
        icon={Droplets}
        colorTheme={estatisticasExibicao.ehUmidadeAlta ? 'rose' : 'sky'}
        secondaryLabel="Temperatura"
        secondaryValue={estatisticasExibicao.temperatura}
        isAlert={estatisticasExibicao.ehUmidadeAlta}
        valueSize="text-xl"
      />

      {/* 4. Desperdício - Monitoramento de Falhas */}
      <StatsWidget
        title="Perda (30d)"
        value={estatisticasFalhas?.totalWeight ? `${Math.round(estatisticasFalhas.totalWeight)} g/ml` : '0 g/ml'}
        icon={Trash2}
        colorTheme="rose"
        secondaryLabel="Prejuízo Estimado"
        secondaryValue={formatCurrency(estatisticasFalhas?.totalCost || 0)}
        FooterIcon={TrendingDown}
        valueSize="text-xl"
      />
    </div>
  );
}

export default React.memo(StatusFilamentos);
