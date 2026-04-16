import { TrendingUp, TrendingDown, Wallet, Target } from "lucide-react";
import { ResumoFinanceiro } from "../tipos";
import { CardResumo } from "@/compartilhado/componentes/CardResumo";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";

interface ResumoFinanceiroProps {
  resumo: ResumoFinanceiro;
  lucratividadePercentual: number;
}

export function ResumoFinanceiroComponente({ resumo, lucratividadePercentual }: ResumoFinanceiroProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      <CardResumo
        titulo="Saldo Consolidado"
        valor={centavosParaReais(resumo.saldoTotalCentavos)}
        unidade="em conta"
        icone={Wallet}
        cor={resumo.saldoTotalCentavos >= 0 ? "indigo" : "rose"}
      />

      <CardResumo
        titulo="Receita (Mês)"
        valor={centavosParaReais(resumo.entradasMesCentavos)}
        unidade="entradas brutas"
        icone={TrendingUp}
        cor="emerald"
      />

      <CardResumo
        titulo="Despesas (Mês)"
        valor={centavosParaReais(resumo.saidasMesCentavos)}
        unidade="saídas totais"
        icone={TrendingDown}
        cor="rose"
      />

      <CardResumo
        titulo="Margem Est. (DRE)"
        valor={`${lucratividadePercentual}%`}
        unidade="lucratividade"
        icone={Target}
        cor={lucratividadePercentual >= 30 ? "emerald" : lucratividadePercentual >= 0 ? "sky" : "rose"}
      />
    </div>
  );
}
