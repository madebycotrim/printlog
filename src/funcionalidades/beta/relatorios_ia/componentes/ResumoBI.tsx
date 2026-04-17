import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Wallet, ArrowUpRight, PieChart as PieChartIcon, Target, Activity } from "lucide-react";
import { servicoFinanceiroAvancado } from "@/compartilhado/servicos/servicoFinanceiroAvancado";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { Pedido } from "@/funcionalidades/producao/projetos/tipos";
import { Material } from "@/funcionalidades/producao/materiais/tipos";
import { LancamentoFinanceiro } from "@/funcionalidades/comercial/financeiro/tipos";

interface ResumoBIProps {
  pedidos: Pedido[];
  materiais: Material[];
  lancamentos: LancamentoFinanceiro[];
}

export function ResumoBI({ pedidos, materiais, lancamentos }: ResumoBIProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Aguarda a engine do navegador renderizar as dimensões do Flexbox/Grid
    const construtor = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(construtor);
  }, []);

  const dre = useMemo(
    () => servicoFinanceiroAvancado.gerarDRE(pedidos, lancamentos, materiais),
    [pedidos, lancamentos, materiais],
  );
  const distribuicaoMaterial = useMemo(() => servicoFinanceiroAvancado.gerarDistribuicaoMaterial(pedidos), [pedidos]);
  const ticketMedioPorMaterial = useMemo(
    () => servicoFinanceiroAvancado.gerarTicketMedioPorMaterial(pedidos),
    [pedidos],
  );
  const historicoFaturamento = useMemo(() => servicoFinanceiroAvancado.gerarHistoricoFaturamento(pedidos), [pedidos]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#18181b] border border-white/10 p-4 rounded-xl shadow-2xl">
          <p className="text-[10px] font-black uppercase text-zinc-500 mb-2">{payload[0].payload.mes}</p>
          <p className="text-sm font-black text-white">{centavosParaReais(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-8 mb-12">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* CARD 1: DRE & TENDÊNCIA FINANCEIRA */}
        <div className="xl:col-span-2 p-10 rounded-[2.5rem] bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden group">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Wallet size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight">DRE: Saúde Financeira</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  Faturamento histórico e lucratividade
                </p>
              </div>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/10 px-4 py-2 rounded-2xl flex items-center gap-3">
              <Activity size={14} className="text-emerald-500" />
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                Saldo Mensal Positivo
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Lado Esquerdo: KPIs */}
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                    <ArrowUpRight size={12} className="text-emerald-500" />
                    Faturamento Total
                  </span>
                  <p className="text-3xl font-black">{centavosParaReais(dre.receitaBrutaCentavos)}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                    <Target size={12} className="text-sky-500" />
                    Lucratividade
                  </span>
                  <p className="text-3xl font-black text-emerald-500">{dre.lucratividadePercentual}%</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Break-even Global
                  </span>
                  <span className="text-[10px] font-black text-rose-500">62% COGS</span>
                </div>
                <div className="h-2 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(100, ((dre.custosVariaveisCentavos + dre.despesasFixasCentavos) / (dre.receitaBrutaCentavos || 1)) * 100)}%`,
                    }}
                    className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                  />
                </div>
                <p className="mt-4 text-[11px] font-medium text-gray-400 leading-relaxed">
                  O lucro líquido consolidado é de{" "}
                  <strong className="text-zinc-900 dark:text-white">
                    {centavosParaReais(dre.lucroLiquidoCentavos)}
                  </strong>
                  .
                </p>
              </div>
            </div>

            {/* Lado Direito: Gráfico de Tendência */}
            <div className="h-[200px] relative w-full">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <BarChart data={historicoFaturamento} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                    <XAxis
                      dataKey="mes"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fontWeight: 900, fill: "#94a3b8" }}
                      tickFormatter={(value: string) => value.toUpperCase()}
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99, 102, 241, 0.05)" }} />
                    <Bar dataKey="faturamentoCentavos" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={24}>
                      {historicoFaturamento.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === historicoFaturamento.length - 1 ? "#6366f1" : "#cbd5e1"}
                          fillOpacity={index === historicoFaturamento.length - 1 ? 1 : 0.3}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Dados baseados em {pedidos.length} jobs concluídos
              </span>
            </div>
            <button className="text-[10px] font-black uppercase tracking-widest text-sky-500 hover:text-sky-400 transition-colors flex items-center gap-2">
              Relatório Comercial Completo →
            </button>
          </div>
        </div>

        {/* CARD 2: DISTRIBUIÇÃO POR MATERIAL (Mix de Produção) */}
        <div className="p-10 rounded-[2.5rem] bg-zinc-900 border border-white/5 shadow-sm flex flex-col group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity pointer-events-none">
            <PieChartIcon size={120} strokeWidth={4} />
          </div>

          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/5 text-white flex items-center justify-center border border-white/10">
              <PieChartIcon size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-white">Mix de Produção</h3>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                Materiais mais utilizados
              </p>
            </div>
          </div>

          <div className="flex-1 min-h-[200px] relative z-10 hidden md:block w-full">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <PieChart>
                  <Pie
                    data={distribuicaoMaterial}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={8}
                    dataKey="valor"
                    stroke="none"
                  >
                    {distribuicaoMaterial.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "10px",
                      fontWeight: "bold",
                      color: "#fff",
                      boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mr-2">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="block text-2xl font-black italic text-white leading-none">{pedidos.length}</span>
              <span className="block text-[8px] font-black uppercase text-zinc-600 tracking-widest mt-1">Jobs</span>
            </div>
          </div>
        </div>
      </div>

      {/* INTELIGÊNCIA DE PRECIFICAÇÃO (v9.0) */}
      <div className="p-10 rounded-[2.5rem] bg-zinc-900 border border-white/5 shadow-2xl overflow-hidden relative group">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center">
                <Target size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-white">Inteligência de Precificação</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                  Ticket Médio Consolidado por Material
                </p>
              </div>
            </div>
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">
                Status de Operação
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                Otimizada
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ticketMedioPorMaterial.length > 0 ? (
              ticketMedioPorMaterial.map((metrica, index) => (
                <motion.div
                  key={metrica.material}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all group/item"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover/item:text-white transition-colors">
                      {metrica.material}
                    </span>
                    <span className="text-[9px] font-black text-sky-500">{metrica.quantidadePedidos} Pedidos</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Ticket Médio</p>
                    <p className="text-2xl font-black text-white">{centavosParaReais(metrica.ticketMedioCentavos)}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-[0.2em]">
                      <span className="text-zinc-600">Faturamento</span>
                      <span className="text-emerald-500">{centavosParaReais(metrica.receitaTotalCentavos)}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center">
                <p className="text-sm font-bold text-zinc-600 italic">
                  Aguardando dados de pedidos concluídos para gerar insights...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
