import { Box, AlertTriangle, DollarSign, BoxSelect } from "lucide-react";
import { CardResumo, CardResumoVazio } from "@/compartilhado/componentes/CardResumo";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { motion } from "framer-motion";

interface PropriedadesResumoInsumos {
  totalItensUnicos: number;
  valorInvestido: number;
  alertasBaixoEstoque: number;
}

export function ResumoInsumos({ totalItensUnicos, valorInvestido, alertasBaixoEstoque }: PropriedadesResumoInsumos) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8"
    >
      <CardResumo titulo="Insumos Cadastrados" valor={totalItensUnicos} unidade="tipos" icone={Box} cor="sky" />

      <CardResumo
        titulo="Valor Distribuído"
        valor={centavosParaReais(valorInvestido)}
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
    </motion.div>
  );
}
