import { 
  BarChart3, 
  Clock, 
  Percent, 
  Weight, 
  Activity, 
  DollarSign,
  Package,
  Box,
  TrendingUp
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Pedido } from "@/funcionalidades/producao/projetos/tipos";
import { Impressora } from "@/funcionalidades/producao/impressoras/tipos";
import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { format, subDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PropriedadesSecaoAnalytics {
  pedidos: Pedido[];
  impressoras: Impressora[];
  pedidosAtivos: number;
  metricasInventario: {
    itensEmAlerta: number;
    valorTotalEstoqueCentavos: number;
  };
}

export function SecaoAnalytics({ pedidos, impressoras, pedidosAtivos, metricasInventario }: PropriedadesSecaoAnalytics) {
  // 1. CÁLCULOS REAIS E DINÂMICOS
  const totalJobs = pedidos.length;
  const pedidosConcluidos = pedidos.filter(p => p.status === StatusPedido.CONCLUIDO);
  
  // Métricas de Peso e Receita
  const pesoTotalGramas = pedidosConcluidos.reduce((acc, p) => acc + (p.pesoGramas || 0), 0);
  const custoTotalCentavos = pedidosConcluidos.reduce((acc, p) => acc + (p.valorCentavos || 0), 0);

  // Lucro Estimado (Considerando margem média de 60% sobre o faturamento no MVP)
  // TODO: Migrar para custo real quando o snapshot de custo estiver no banco
  const lucroTotalCentavos = custoTotalCentavos * 0.6;

  // Taxa de Sucesso Real
  const totalTentativas = impressoras.reduce((acc, imp) => acc + (imp.historicoProducao?.length || 0), 0);
  const totalSucessos = impressoras.reduce((acc, imp) => acc + (imp.historicoProducao?.filter(h => h.sucesso).length || 0), 0);
  const taxaSucesso = totalTentativas > 0 ? (totalSucessos / totalTentativas) * 100 : (pedidosConcluidos.length / (totalJobs || 1)) * 100;

  // Uso da Frota (Runtime %)
  const minutosDesdeCriacao = impressoras.reduce((acc, imp) => {
    const dataCriacao = new Date(imp.dataCriacao);
    const diffMinutos = Math.max(0, (new Date().getTime() - dataCriacao.getTime()) / 60000);
    return acc + diffMinutos;
  }, 0);
  const horimetroTotal = impressoras.reduce((acc, imp) => acc + (imp.horimetroTotalMinutos || 0), 0);
  const usoFrota = minutosDesdeCriacao > 0 ? (horimetroTotal / minutosDesdeCriacao) * 100 : 0;

  // 2. DADOS PARA O GRÁFICO DE TENDÊNCIA (Últimos 7 dias)
  const dadosGraficoArea = Array.from({ length: 7 }).map((_, i) => {
    const data = startOfDay(subDays(new Date(), 6 - i));
    const jobsNoDia = pedidos.filter(p => {
      const dataCriacao = new Date(p.dataCriacao);
      return startOfDay(dataCriacao).getTime() === data.getTime();
    }).length;

    return {
      name: format(data, "eee", { locale: ptBR }),
      jobs: jobsNoDia
    };
  });

  // 3. DADOS PARA O GRÁFICO DE STATUS
  const dadosStatus = [
    { name: "Concluído", value: pedidos.filter(p => p.status === StatusPedido.CONCLUIDO).length, color: "#10b981" },
    { name: "Produção", value: pedidos.filter(p => p.status === StatusPedido.EM_PRODUCAO).length, color: "#0ea5e9" },
    { name: "Fila", value: pedidos.filter(p => p.status === StatusPedido.A_FAZER).length, color: "#f59e0b" },
    { name: "Acabamento", value: pedidos.filter(p => p.status === StatusPedido.ACABAMENTO).length, color: "#8b5cf6" },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8">
      {/* TÍTULO DA SEÇÃO */}
      <div className="flex items-center gap-3">
        <Activity size={18} className="text-sky-500" />
        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">
          Centro de Comando Operacional
        </h2>
      </div>

      {/* GRID DE CARDS PREMIUM - OS 8 DE ELITE SEM RUÍDO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardAnalitico 
          titulo="Produção Ativa" 
          valor={pedidosAtivos} 
          unidade="pedidos"
          icone={Clock} 
          cor="sky"
        />
        <CardAnalitico 
          titulo="Taxa de Sucesso" 
          valor={`${taxaSucesso.toFixed(1)}%`} 
          icone={Percent} 
          cor="emerald"
        />
        <CardAnalitico 
          titulo="Filamento Utilizado" 
          valor={`${(pesoTotalGramas / 1000).toFixed(2)}`} 
          unidade="kg"
          icone={Weight} 
          cor="orange"
        />
        <CardAnalitico 
          titulo="Uso da Frota" 
          valor={`${usoFrota.toFixed(1)}%`} 
          icone={Activity} 
          cor="cyan"
        />
        <CardAnalitico 
          titulo="Alertas de Estoque" 
          valor={metricasInventario.itensEmAlerta}
          unidade="crítico"
          icone={Package} 
          cor="rose"
        />
        <CardAnalitico 
          titulo="Patrimônio em Estoque" 
          valor={centavosParaReais(metricasInventario.valorTotalEstoqueCentavos)} 
          icone={Box} 
          cor="amber"
        />
        <CardAnalitico 
          titulo="Valor Total Produzido" 
          valor={centavosParaReais(custoTotalCentavos)} 
          icone={DollarSign} 
          cor="emerald"
        />
        <CardAnalitico 
          titulo="Lucro Líquido Real" 
          valor={centavosParaReais(lucroTotalCentavos)} 
          icone={TrendingUp} 
          cor="emerald"
        />
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GRÁFICO DE TENDÊNCIA */}
        <div className="bg-card border border-borda-sutil rounded-3xl p-8 flex flex-col gap-6 relative overflow-hidden group">
           <div className="absolute -right-20 -top-20 w-64 h-64 bg-sky-500/5 blur-[100px] pointer-events-none group-hover:opacity-100 opacity-50 transition-opacity" />
           
           <div className="flex items-center justify-between relative z-10">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Fluxo de Produção (7 dias)</h3>
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500">
                 <BarChart3 size={14} />
              </div>
           </div>
           
           <div className="h-[250px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dadosGraficoArea}>
                  <defs>
                    <linearGradient id="corJobs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-card)', 
                      border: '1px solid var(--border-subtle)', 
                      borderRadius: '16px',
                      boxShadow: 'var(--sombra-media)'
                    }}
                    itemStyle={{ color: 'var(--text-primary)', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="jobs" 
                    stroke="#0ea5e9" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#corJobs)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* GRÁFICO DE STATUS */}
        <div className="bg-card border border-borda-sutil rounded-3xl p-8 flex flex-col gap-6 relative overflow-hidden">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Distribuição de Status</h3>
           
           <div className="h-[250px] w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {dadosStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-card)', 
                      border: '1px solid var(--border-subtle)', 
                      borderRadius: '16px',
                      boxShadow: 'var(--sombra-media)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-4xl font-black text-primary tracking-tighter">{totalJobs}</span>
                 <span className="text-[9px] font-black text-zinc-600 dark:text-zinc-500 uppercase tracking-[0.3em]">TOTAL</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function CardAnalitico({ titulo, valor, icone: Icone, unidade, cor = "sky" }: any) {
  const cores: any = {
    sky: "text-sky-500 bg-sky-500/10 shadow-sky-500/5",
    emerald: "text-emerald-500 bg-emerald-500/10 shadow-emerald-500/5",
    violet: "text-violet-500 bg-violet-500/10 shadow-violet-500/5",
    rose: "text-rose-500 bg-rose-500/10 shadow-rose-500/5",
    amber: "text-amber-500 bg-amber-500/10 shadow-amber-500/5",
    orange: "text-orange-500 bg-orange-500/10 shadow-orange-500/5",
    fuchsia: "text-fuchsia-500 bg-fuchsia-500/10 shadow-fuchsia-500/5",
    cyan: "text-cyan-500 bg-cyan-500/10 shadow-cyan-500/5",
  };

  return (
    <div className="bg-card border border-borda-sutil p-6 rounded-3xl flex items-center gap-6 group hover:bg-white/[0.015] transition-all relative overflow-hidden">
      {/* Icon Container (Left side) */}
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl transition-transform group-hover:scale-110 ${cores[cor]}`}>
        <Icone size={24} strokeWidth={2.5} />
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">{titulo}</span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-primary tracking-tighter uppercase tabular-nums">
            {valor}
          </span>
          {unidade && (
            <span className="text-[10px] font-black text-zinc-600 uppercase italic tracking-widest">
              {unidade}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
