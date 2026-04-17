import { TrendingUp, TrendingDown, Wallet, Target } from "lucide-react";
import { ResumoFinanceiro } from "../tipos";
import { CardResumo } from "@/compartilhado/componentes/CardResumo";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";

interface ResumoFinanceiroProps {
  resumo: ResumoFinanceiro;
  lucratividadePercentual: number;
}

/**
 * Componente de resumo financeiro com métricas de elite.
 * Exibe o capital disponível, entradas, custos operacionais e performance de lucro.
 */
export function ResumoFinanceiroComponente({ resumo, lucratividadePercentual }: ResumoFinanceiroProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      <CardResumo
        titulo="Capital Disponível"
        valor={centavosParaReais(resumo.saldoTotalCentavos)}
        unidade="saldo em conta"
        icone={Wallet}
        cor={resumo.saldoTotalCentavos >= 0 ? "sky" : "rose"}
      />

      <CardResumo
        titulo="Entradas do Mês"
        valor={centavosParaReais(resumo.entradasMesCentavos)}
        unidade="recebimentos brutos"
        icone={TrendingUp}
        cor="emerald"
      />

      <CardResumo
        titulo="Custo Operacional"
        valor={centavosParaReais(resumo.saidasMesCentavos)}
        unidade="pagas este mês"
        icone={TrendingDown}
        cor="rose"
      />

      <CardResumo
        titulo="Performance de Lucro"
        valor={`${lucratividadePercentual}%`}
        unidade="previsto por DRE"
        icone={Target}
        cor={lucratividadePercentual >= 30 ? "emerald" : lucratividadePercentual >= 0 ? "indigo" : "rose"}
      />
    </div>
  );
}
