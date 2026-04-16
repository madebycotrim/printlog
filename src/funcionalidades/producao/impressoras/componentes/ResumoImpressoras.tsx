import { Printer, Timer, Wrench, DollarSign } from "lucide-react";
import { CardResumo } from "@/compartilhado/componentes/CardResumo";

interface PropriedadesResumoImpressoras {
  totalMaquinas: number;
  horasImpressao: number;
  emManutencao: number;
  requerAtencao: number;
  valorInvestido: number;
}

export function ResumoImpressoras({
  totalMaquinas,
  horasImpressao,
  emManutencao,
  requerAtencao,
  valorInvestido,
}: PropriedadesResumoImpressoras) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      <CardResumo titulo="Total de Máquinas" valor={totalMaquinas} unidade="unid." icone={Printer} cor="sky" />

      <CardResumo
        titulo="Horas de Impressão"
        valor={horasImpressao.toLocaleString("pt-BR")}
        unidade="h"
        icone={Timer}
        cor="emerald"
      />

      <CardResumo
        titulo="Valor Investido"
        valor={valorInvestido.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
        icone={DollarSign}
        cor="indigo"
      />

      <CardResumo
        titulo="Saúde do Parque"
        valor={emManutencao}
        unidade="paradas"
        icone={Wrench}
        cor={emManutencao > 0 || requerAtencao > 0 ? "rose" : "zinc"}
        textoAcao={requerAtencao > 0 ? `${requerAtencao} Críticos` : undefined}
      />
    </div>
  );
}
