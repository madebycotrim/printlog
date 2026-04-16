import { Activity, TrendingUp, ShieldCheck, Gauge, AlertCircle } from "lucide-react";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Impressora } from "@/funcionalidades/producao/impressoras/tipos";
import { Pedido } from "@/funcionalidades/producao/projetos/tipos";
import { servicoPerformance } from "../servicos/servicoPerformance";

interface RelatorioPerformanceOperacionalProps {
  impressoras: Impressora[];
  pedidos: Pedido[];
}

export function RelatorioPerformanceOperacional({ impressoras, pedidos }: RelatorioPerformanceOperacionalProps) {
  const metricas = useMemo(
    () => servicoPerformance.calcularMetricasGlobais(impressoras, pedidos),
    [impressoras, pedidos],
  );

  const obterStatusColor = () => {
    switch (metricas.statusOperacional) {
      case "critica":
        return "text-rose-500 bg-rose-500/10 border-rose-500/20";
      case "degradada":
        return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      default:
        return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    }
  };

  return (
    <div className="lg:col-span-2 p-10 rounded-[2.5rem] bg-zinc-900 border border-white/5 shadow-2xl relative overflow-hidden group">
      {/* Background Aesthetic */}
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-10 transition-opacity pointer-events-none">
        <Gauge size={160} strokeWidth={4} />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-white/5 text-white flex items-center justify-center border border-white/10 shadow-inner">
              <Activity size={28} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-white mb-1">
                OEE: Eficiência Global do Parque
              </h3>
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                Status operacional em tempo real • Business Intelligence v9.0
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 flex items-center gap-2">
              Health Check
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </span>
            <div
              className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${obterStatusColor()}`}
            >
              {metricas.statusOperacional}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* KPI: OEE */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-500 mb-1">
              <Gauge size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">OEE Global</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-white tracking-tighter">{metricas.oeePercentual}%</p>
              <span className="text-[9px] font-bold text-zinc-600 uppercase">Score Int.</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metricas.oeePercentual}%` }}
                className={`h-full ${metricas.oeePercentual > 85 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-amber-500"}`}
              />
            </div>
          </div>

          {/* KPI: Disponibilidade */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-500 mb-1">
              <TrendingUp size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Disponibilidade</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-white tracking-tighter">{metricas.disponibilidadePercentual}%</p>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metricas.disponibilidadePercentual}%` }}
                className="h-full bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]"
              />
            </div>
          </div>

          {/* KPI: Qualidade */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-500 mb-1">
              <ShieldCheck size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Qualidade</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-white tracking-tighter">{metricas.qualidadeSucessoPercentual}%</p>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metricas.qualidadeSucessoPercentual}%` }}
                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              />
            </div>
          </div>

          {/* KPI: MTBF */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-500 mb-1">
              <AlertCircle size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">MTBF</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-white tracking-tighter">{metricas.mtbfHoras}h</p>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} className="h-full bg-white/10" />
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-[11px] font-medium text-zinc-500 max-w-lg leading-relaxed italic">
            O OEE é um score composto que reflete a produtividade real do parque de máquinas. Sua meta atual está
            definida em <strong className="text-zinc-300">85% (Status Otimizado)</strong>.
          </p>
          <button className="px-6 py-3 bg-white hover:bg-sky-400 text-black font-black uppercase text-[10px] tracking-widest rounded-xl transition-all active:scale-95 shadow-lg flex items-center gap-2">
            Relatório Industrial →
          </button>
        </div>
      </div>
    </div>
  );
}
