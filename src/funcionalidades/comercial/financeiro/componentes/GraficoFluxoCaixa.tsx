import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LancamentoFinanceiro } from "../tipos";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { motion } from "framer-motion";

interface GraficoFluxoCaixaProps {
  lancamentos: LancamentoFinanceiro[];
}

export function GraficoFluxoCaixa({ lancamentos }: GraficoFluxoCaixaProps) {
  const dadosAgrupados = useMemo(() => {
    // Agrupar por dia
    const grupos: Record<string, { data: string; receitas: number; despesas: number }> = {};
    
    // Ordenar do mais antigo pro mais novo para o gráfico fazer sentido cronologicamente
    const lancamentosOrdenados = [...lancamentos].sort((a, b) => {
      const dataA = typeof a.dataCriacao === 'string' ? parseISO(a.dataCriacao) : new Date(a.dataCriacao);
      const dataB = typeof b.dataCriacao === 'string' ? parseISO(b.dataCriacao) : new Date(b.dataCriacao);
      return dataA.getTime() - dataB.getTime();
    });

    for (const l of lancamentosOrdenados) {
      const d = typeof l.dataCriacao === 'string' ? parseISO(l.dataCriacao) : new Date(l.dataCriacao);
      const dataFormatada = format(d, "dd/MM");
      
      if (!grupos[dataFormatada]) {
        grupos[dataFormatada] = { data: dataFormatada, receitas: 0, despesas: 0 };
      }
      
      if (l.tipo === "ENTRADA") {
        grupos[dataFormatada].receitas += l.valorCentavos / 100;
      } else {
        grupos[dataFormatada].despesas += l.valorCentavos / 100;
      }
    }

    return Object.values(grupos);
  }, [lancamentos]);

  if (dadosAgrupados.length === 0) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">Fluxo de Caixa</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Evolução de receitas e despesas</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Receitas
          </div>
          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
            <div className="w-2 h-2 rounded-full bg-rose-500"></div> Despesas
          </div>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dadosAgrupados} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="corReceita" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="corDespesa" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" strokeOpacity={0.2} />
            <XAxis 
              dataKey="data" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#a1a1aa' }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#a1a1aa' }}
              tickFormatter={(value) => `R$ ${value}`}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', backgroundColor: 'var(--tw-bg-opacity, #ffffff)' }}
              itemStyle={{ fontSize: 13, fontWeight: 600, padding: '2px 0' }}
              labelStyle={{ fontSize: 11, color: '#a1a1aa', marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}
              formatter={(value: number) => [`R$ ${value.toFixed(2)}`, undefined]}
            />
            <Area type="monotone" dataKey="receitas" name="Receitas" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#corReceita)" />
            <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#corDespesa)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
