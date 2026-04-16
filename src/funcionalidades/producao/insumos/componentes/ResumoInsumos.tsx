import { Box, AlertTriangle, DollarSign, BoxSelect } from "lucide-react";
import { CardResumo, CardResumoVazio } from "@/compartilhado/componentes/CardResumo";

interface PropriedadesResumoInsumos {
  totalItensUnicos: number;
  valorInvestido: number;
  alertasBaixoEstoque: number;
}

export function ResumoInsumos({ totalItensUnicos, valorInvestido, alertasBaixoEstoque }: PropriedadesResumoInsumos) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      <CardResumo titulo="Insumos Cadastrados" valor={totalItensUnicos} unidade="tipos" icone={Box} cor="sky" />

      <CardResumo
        titulo="Valor Distribuído"
        valor={valorInvestido.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
        icone={DollarSign}
        cor="emerald"
      />

      <CardResumo
        titulo="Alertas de Estoque"
        valor={alertasBaixoEstoque}
        unidade="itens baixos"
        icone={AlertTriangle}
        cor={alertasBaixoEstoque > 0 ? "rose" : "zinc"}
      />

      <CardResumoVazio icone={BoxSelect} />
    </div>
  );
}
