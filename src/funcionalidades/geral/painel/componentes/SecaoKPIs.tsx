import { TrendingUp, Clock, Printer, Box, Package } from "lucide-react";
import { CardResumo } from "@/compartilhado/componentes";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";

/**
 * Interface para as propriedades da SecaoKPIs.
 */
interface PropriedadesSecaoKPIs {
  pedidosAtivos: number;
  maquinasAtivas: number;
  metricasInventario: {
    itensEmAlerta: number;
    valorTotalEstoqueCentavos: number;
  };
  aoNavegar: (rota: string) => void;
  aoAbrirModalPatrimonio: () => void;
}

/**
 * Seção de indicadores de desempenho (KPIs) do dashboard.
 */
export function SecaoKPIs({ 
  pedidosAtivos, 
  maquinasAtivas, 
  metricasInventario, 
  aoNavegar, 
  aoAbrirModalPatrimonio 
}: PropriedadesSecaoKPIs) {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp size={18} className="text-indigo-500" />
        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-zinc-500">
          Performance & Métricas
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardResumo 
          titulo="Produção Ativa" 
          valor={pedidosAtivos} 
          unidade="pedidos" 
          icone={Clock} 
          cor="sky" 
          aoClicar={() => aoNavegar("/producao")}
          textoAcao="Ver Fila"
        />
        <CardResumo
          titulo="Capacidade Operacional"
          valor={maquinasAtivas}
          unidade="máquinas"
          icone={Printer}
          cor="emerald"
          aoClicar={() => aoNavegar("/impressoras")}
          textoAcao="Gerenciar"
        />
        <CardResumo
          titulo="Alertas de Estoque"
          valor={metricasInventario.itensEmAlerta}
          unidade="crítico"
          icone={Box}
          cor="rose"
          aoClicar={() => aoNavegar("/materiais")}
          textoAcao="Verificar"
        />
        <CardResumo 
          titulo="Patrimônio em Estoque" 
          valor={centavosParaReais(metricasInventario.valorTotalEstoqueCentavos)} 
          icone={Package} 
          cor="indigo" 
          aoClicar={aoAbrirModalPatrimonio}
          textoAcao="Ver Detalhes"
        />
      </div>
    </section>
  );
}
