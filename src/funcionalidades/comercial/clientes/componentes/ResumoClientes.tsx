import { Cliente, StatusComercial } from "../tipos";
import { UserPlus, Star, Users, TrendingUp } from "lucide-react";
import { CardResumo } from "@/compartilhado/componentes/CardResumo";
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

  // Clientes VIP
  const vips = clientes.filter((c) => c.statusComercial === StatusComercial.VIP).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <CardResumo
        titulo="Ticket Histórico"
        valor={centavosParaReais(ltvTotalCentavos)}
        unidade="faturamento total"
        icone={TrendingUp}
        cor="indigo"
      />

      <CardResumo titulo="Base Ativa" valor={total} unidade="clientes cadastrados" icone={Users} cor="sky" />

      <CardResumo titulo="Retention VIP" valor={vips} unidade="clientes destaque" icone={Star} cor="amber" />

      <CardResumo titulo="Expansão" valor={novosEsteMes} unidade="novos este mês" icone={UserPlus} cor="emerald" />
    </div>
  );
}
