import { useMemo } from "react";
import { Box, CheckCircle2, XCircle, Clock, DollarSign, Zap, Gauge } from "lucide-react";
import { Impressora } from "@/funcionalidades/producao/impressoras/tipos";
import { motion } from "framer-motion";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";

interface PropriedadesAbaProducao {
  impressora: Impressora;
}

export function AbaProducaoImpressora({ impressora }: PropriedadesAbaProducao) {
  const registros = useMemo(() => {
    return (impressora.historicoProducao || []).sort(
      (a, b) => new Date(b.dataConclusao).getTime() - new Date(a.dataConclusao).getTime()
    );
  }, [impressora.historicoProducao]);

  const stats = useMemo(() => {
    const total = registros.length;
    const sucesso = registros.filter(r => r.sucesso).length;
    const taxa = total > 0 ? (sucesso / total) * 100 : 0;
    const faturamento = registros.reduce((acc, r) => acc + (r.valorGeradoCentavos || 0), 0);
    const materialConsumido = registros.reduce((acc, r) => acc + (r.consumoMaterialGramas || 0), 0);
    
    return { total, sucesso, taxa, faturamento, materialConsumido };
  }, [registros]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Métrica de Destaque (Gauge/Eficiência) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative p-8 rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/5 overflow-hidden shadow-2xl">
          {/* Brilho decorativo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 blur-[100px] -mr-32 -mt-32" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex flex-col gap-2 text-center md:text-left">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-500/60">Performance Geral</span>
              <h4 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">
                Eficiência Operacional
              </h4>
              <p className="text-xs text-zinc-400 mt-2 max-w-xs">
                Métrica baseada na taxa de sucesso dos projetos e tempo total de extrusão.
              </p>
            </div>

            <div className="relative flex items-center justify-center">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-zinc-800"
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={440}
                  initial={{ strokeDashoffset: 440 }}
                  animate={{ strokeDashoffset: 440 - (440 * stats.taxa) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={`${stats.taxa >= 90 ? "text-emerald-500" : stats.taxa >= 70 ? "text-sky-500" : "text-rose-500"}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white tabular-nums">{Math.round(stats.taxa)}%</span>
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Sucesso</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card de Faturamento Destaque */}
        <div className="p-8 rounded-3xl bg-emerald-500 dark:bg-emerald-600 flex flex-col justify-between shadow-2xl shadow-emerald-500/10">
           <div className="flex justify-between items-start">
              <div className="p-3 bg-white/20 rounded-2xl text-white">
                <DollarSign size={24} strokeWidth={3} />
              </div>
              <span className="text-[8px] font-black text-white/60 uppercase tracking-[0.2em]">Acumulado</span>
           </div>
           <div className="mt-8">
              <div className="text-4xl font-black text-white tracking-tighter leading-none mb-1">
                {centavosParaReais(stats.faturamento)}
              </div>
              <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Receita Gerada</span>
           </div>
        </div>
      </div>

      {/* 2. Grid de Mini Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
           { rotulo: "Projetos", valor: stats.total, icone: Box, cor: "zinc" },
           { rotulo: "Horas de Uso", valor: `${Math.round((impressora.horimetroTotalMinutos || 0) / 60)}h`, icone: Clock, cor: "sky" },
           { rotulo: "Material", valor: `${(stats.materialConsumido / 1000).toFixed(2)}kg`, icone: Gauge, cor: "amber" },
           { rotulo: "Potência", valor: `${impressora.potenciaWatts || 0}W`, icone: Zap, cor: "emerald" },
         ].map((item, i) => (
           <div key={i} className="p-5 rounded-2xl border border-zinc-100 dark:border-white/5 bg-white dark:bg-white/[0.02] flex flex-col gap-3">
             <div className="flex items-center gap-2 text-zinc-400">
               <item.icone size={14} />
               <span className="text-[9px] font-black uppercase tracking-widest">{item.rotulo}</span>
             </div>
             <div className="text-xl font-black text-zinc-900 dark:text-white tabular-nums leading-none">
               {item.valor}
             </div>
           </div>
         ))}
      </div>

      {/* 3. Tabela de Histórico Premium */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
             <Box size={16} className="text-zinc-400" />
             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Histórico Recente</h4>
          </div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            {registros.length} Projetos
          </span>
        </div>

        <div className="bg-white dark:bg-white/[0.01] border border-zinc-100 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/50">
                  <th className="px-8 py-5 text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Projeto</th>
                  <th className="px-8 py-5 text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Consumo</th>
                  <th className="px-8 py-5 text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest text-right">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                {registros.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                       <div className="flex flex-col items-center gap-2 opacity-20">
                          <Box size={40} />
                          <p className="text-[10px] font-black uppercase tracking-[0.3em]">Nenhum registro ainda</p>
                       </div>
                    </td>
                  </tr>
                ) : (
                  registros.map((reg) => (
                    <tr key={reg.idProtocolo} className="group hover:bg-zinc-50/50 dark:hover:bg-white/[0.01] transition-all duration-300">
                      <td className="px-8 py-5 whitespace-nowrap">
                        {reg.sucesso ? (
                          <div className="flex items-center gap-2 text-[9px] font-black uppercase text-emerald-500 px-3 py-1 rounded-lg bg-emerald-500/10 w-fit border border-emerald-500/20">
                            <CheckCircle2 size={12} strokeWidth={3} /> Sucesso
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-[9px] font-black uppercase text-rose-500 px-3 py-1 rounded-lg bg-rose-500/10 w-fit border border-rose-500/20">
                            <XCircle size={12} strokeWidth={3} /> Falha
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-tight group-hover:text-sky-500 transition-colors">
                            {reg.nomeProjeto}
                          </span>
                          <span className="text-[9px] font-medium text-zinc-400 tabular-nums">
                            PROT-{reg.idProtocolo.split('-')[0]}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                         <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black text-zinc-700 dark:text-zinc-300 tabular-nums uppercase">
                              {reg.consumoMaterialGramas || 0}g
                           </span>
                         </div>
                      </td>
                      <td className="px-8 py-5 text-right whitespace-nowrap">
                         <span className="text-[10px] font-black text-zinc-400 tabular-nums tracking-widest uppercase">
                            {new Date(reg.dataConclusao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })}
                         </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
