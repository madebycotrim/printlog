import { Cliente } from "../tipos";
import { Users, TrendingUp, Package, Calculator, SquareDashed } from "lucide-react";
import { CardResumo, CardResumoVazio } from "@/compartilhado/componentes/CardResumo";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";

interface PropriedadesResumoClientes {
  clientes: Cliente[];
}

export function ResumoClientes({ clientes }: PropriedadesResumoClientes) {
  const total = clientes.length;

  // Faturamento Total (LTV)
  const ltvTotalCentavos = clientes.reduce((acc, c) => acc + (c.ltvCentavos || 0), 0);

  // Volume de Pedidos (Total de projetos de todos os clientes)
  const totalProjetos = clientes.reduce((acc, c) => acc + (c.totalProdutos || 0), 0);

  // Ticket Médio
  const ticketMedioCentavos = total > 0 ? Math.round(ltvTotalCentavos / total) : 0;



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
        titulo="Ticket Médio" 
        valor={centavosParaReais(ticketMedioCentavos)} 
        unidade="média por cliente" 
        icone={Calculator} 
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
