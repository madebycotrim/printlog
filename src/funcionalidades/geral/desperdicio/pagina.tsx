import { Trash2, TrendingDown, ArrowLeft, Calendar, BarChart3, PieChart } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

import { usarArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { usarArmazemInsumos } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";
import { servicoDesperdicio } from "@/compartilhado/servicos/servicoDesperdicio";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";

const CORES = ["#f43f5e", "#fbbf24", "#0ea5e9", "#10b981", "#8b5cf6"];

export function PaginaDesperdicio() {
  const navigate = useNavigate();
  const materiais = usarArmazemMateriais((s) => s.materiais);
  const insumos = usarArmazemInsumos((s) => s.insumos);

  const metricas = useMemo(() => servicoDesperdicio.calcularMetricas(materiais, insumos), [materiais, insumos]);
  const historico = useMemo(() => servicoDesperdicio.gerarHistorico(materiais, insumos), [materiais, insumos]);

  usarDefinirCabecalho({
    titulo: "Análise de Desperdício",
    subtitulo: "Monitore falhas e sucatas para otimizar sua margem de lucro.",
    acao: {
      texto: "Voltar ao Painel",
      icone: ArrowLeft,
      aoClicar: () => navigate("/dashboard"),
    },
  });

  const dadosPizza = metricas.topMotivosDesperdicio.map((m) => ({
    name: m.motivo,
    value: m.valorCentavos,
  }));

  return (
    <div className="space-y-10 pb-20">
      {/* 🔝 KPIs SUPERIORES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-[2rem] bg-rose-500 text-white shadow-xl shadow-rose-500/20 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Trash2 size={80} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-70">Prejuízo Total</p>
          <h3 className="text-4xl font-black tracking-tighter mb-4">
            {centavosParaReais(metricas.totalPerdidoCentavos)}
          </h3>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full w-fit">
            <TrendingDown size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Impacto Direto</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-8 rounded-[2rem] bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-gray-400">Índice de Perda</p>
          <h3 className="text-4xl font-black tracking-tighter mb-4 text-rose-500">
            {metricas.indiceDesperdicioPercentual}%
          </h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed tracking-wider">
            Percentual de material que virou sucata em relação à produção total.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-8 rounded-[2rem] bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-gray-400">Peso Total Descartado</p>
          <h3 className="text-4xl font-black tracking-tighter mb-4 text-zinc-900 dark:text-white">
            {metricas.pesoTotalFalhasGramas}g
          </h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed tracking-wider">
            Equivalente a aprox. {Math.round(metricas.pesoTotalFalhasGramas / 1000)} rolo(s) de 1kg.
          </p>
        </motion.div>
      </div>

      {/* 📊 GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Evolução Histórica */}
        <div className="p-10 rounded-[2.5rem] bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <BarChart3 size={20} className="text-rose-500" />
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500">
                Evolução do Prejuízo
              </h4>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historico}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                <XAxis
                  dataKey="mes"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 900, fill: "#888" }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                  }}
                  formatter={(value: any) => centavosParaReais(Number(value || 0))}
                />
                <Area
                  type="monotone"
                  dataKey="valorCentavos"
                  stroke="#f43f5e"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Motivos de Perda */}
        <div className="p-10 rounded-[2.5rem] bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <PieChart size={20} className="text-amber-500" />
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500">
                Fontes de Desperdício
              </h4>
            </div>
          </div>
          <div className="h-[300px] w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={dadosPizza} innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                  {dadosPizza.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => centavosParaReais(Number(value || 0))} />
              </RePieChart>
            </ResponsiveContainer>
            <div className="space-y-4 pr-10">
              {dadosPizza.map((p, index) => (
                <div key={p.name} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CORES[index % CORES.length] }} />
                  <span className="text-[10px] font-black uppercase tracking-tight text-gray-400">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 📋 LISTA DE ITENS RECENTES (PLACEHOLDER PARA FASE 2) */}
      <div className="p-10 rounded-[2.5rem] bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 shadow-sm">
        <div className="flex items-center justify-between mb-10">
          <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500 underline decoration-rose-500/30">
            Registros de Sucata Recomendados para Auditoria
          </h4>
        </div>

        <div className="space-y-4">
          {metricas.topMotivosDesperdicio.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-6 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-all group"
            >
              <div className="flex items-center gap-6">
                <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl group-hover:scale-110 transition-transform">
                  <Trash2 size={20} />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-tight">{item.motivo}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    Material / Causa Identificada
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-rose-500">{centavosParaReais(item.valorCentavos)}</p>
                <div className="flex items-center gap-2 justify-end mt-1 text-gray-400">
                  <Calendar size={12} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Últimos 30 dias</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
