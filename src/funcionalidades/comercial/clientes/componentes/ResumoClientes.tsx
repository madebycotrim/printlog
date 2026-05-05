import { Cliente } from "../tipos";
import { UserPlus, Users, TrendingUp, SquareDashed } from "lucide-react";
import { CardResumo, CardResumoVazio } from "@/compartilhado/componentes/CardResumo";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";

interface PropriedadesResumoClientes {
  clientes: Cliente[];
}

export function ResumoClientes({ clientes }: PropriedadesResumoClientes) {
  const total = clientes.length;

  // Novos Clientes este mês
  const novosEsteMes = clientes.filter((c) => {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);
    return new Date(c.dataCriacao) >= inicioMes;
  }).length;

  // Faturamento Total (LTV)
  const ltvTotalCentavos = clientes.reduce((acc, c) => acc + (c.ltvCentavos || 0), 0);



  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <CardResumo
        titulo="Faturamento Acumulado"
        valor={centavosParaReais(ltvTotalCentavos)}
        unidade="receita total LTV"
        icone={TrendingUp}
        cor="indigo"
      />

      <CardResumo titulo="Base de Parceiros" valor={total} unidade="clientes cadastrados" icone={Users} cor="sky" />


      <CardResumo titulo="Novos Leads" valor={novosEsteMes} unidade="entradas este mês" icone={UserPlus} cor="emerald" />

      <CardResumoVazio icone={SquareDashed} />
    </div>
  );
}
