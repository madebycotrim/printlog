import React, { useMemo } from "react";
import { AlertTriangle, BadgeDollarSign, Trash2, TrendingUp, TrendingDown, Droplets } from "lucide-react";
import StatsWidget from "../../../components/ui/StatsWidget";
import { formatCurrency } from "../../../utils/numbers";

function StatusFilamentos({
  pesoTotal = 0,
  contagemEstoqueBaixo = 0,
  valorTotal = 0,
  clima = { loading: true },
  estatisticasFalhas = { totalWeight: 0, totalCost: 0 }
}) {

  const estatisticasExibicao = useMemo(() => {
    const climaCarregando = !clima || clima.isLoading;
    const dados = clima.data || clima;

    const valorTemp = !climaCarregando && dados?.temp !== undefined ? Math.round(dados.temp) : null;
    const valorUmidade = !climaCarregando && dados?.humidity !== undefined ? Math.round(dados.humidity) : null;
    const ehAlta = valorUmidade !== null && valorUmidade > 50;

    return {
      financeiro: formatCurrency(valorTotal || 0),
      temperatura: valorTemp !== null ? `${valorTemp}°C` : "--°C",
      umidade: valorUmidade !== null ? `${valorUmidade}%` : "--%",
      climaCarregando: climaCarregando,
      ehUmidadeAlta: ehAlta
    };
  }, [valorTotal, clima]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* 1. Saúde do Estoque */}
      <StatsWidget
        title="Total em Estoque"
        value={`${(pesoTotal || 0).toFixed(2)}kg`}
        icon={AlertTriangle}
        colorTheme={contagemEstoqueBaixo > 0 ? 'rose' : 'emerald'}
        secondaryLabel="Status"
        secondaryValue={contagemEstoqueBaixo > 0 ? `${contagemEstoqueBaixo} Itens Baixos` : "Saudável"}
        isAlert={contagemEstoqueBaixo > 0}
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
      />

      {/* 4. Desperdício - Monitoramento de Falhas */}
      <StatsWidget
        title="Perda (30d)"
        value={estatisticasFalhas?.totalWeight ? `${Math.round(estatisticasFalhas.totalWeight)}g` : '0g'}
        icon={Trash2}
        colorTheme="rose"
        secondaryLabel="Prejuízo Estimado"
        secondaryValue={formatCurrency(estatisticasFalhas?.totalCost || 0)}
        FooterIcon={TrendingDown}
      />
    </div>
  );
}

export default React.memo(StatusFilamentos);
