import { Cliente } from "../tipos";
import { Users, TrendingUp, Package, UserPlus } from "lucide-react";
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

  // Volume de Pedidos (Total de projetos de todos os clientes)
  const totalProjetos = clientes.reduce((acc, c) => acc + (c.totalProdutos || 0), 0);



  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <CardResumo
        titulo="Receita Total"
        valor={centavosParaReais(ltvTotalCentavos)}
        unidade="faturamento LTV"
        icone={TrendingUp}
        cor="emerald"
      />

      <CardResumo 
        titulo="Novos Clientes" 
        valor={novosEsteMes} 
        unidade="entradas este mês" 
        icone={UserPlus} 
        cor="indigo" 
      />

      <CardResumo 
        titulo="Volume de Pedidos" 
        valor={totalProjetos} 
        unidade="projetos entregues" 
        icone={Package} 
        cor="sky" 
      />

      <CardResumo 
        titulo="Base de Clientes" 
        valor={total} 
        unidade="parceiros ativos" 
        icone={Users} 
        cor="violet" 
      />
    </div>
  );
}
