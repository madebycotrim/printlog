import { useMemo, useState } from "react";
import { Wrench, History, Activity, AlertTriangle, Plus, Clock, CheckCircle2 } from "lucide-react";
import { Impressora } from "../tipos";
import { usarManutencao } from "../manutencao/hooks/usarManutencao";
import { MonitorPecas } from "../manutencao/componentes/MonitorPecas";
import { FormularioManutencao } from "../manutencao/componentes/FormularioManutencao";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { motion, AnimatePresence } from "framer-motion";

interface PropriedadesAbaManutencao {
  impressora: Impressora;
}

export function AbaManutencaoImpressora({ impressora }: PropriedadesAbaManutencao) {
  const { pecas, manutencoes, registrarManutencao } = usarManutencao(impressora.id);
  const [exibirFormulario, setExibirFormulario] = useState(false);

  const metrics = useMemo(() => {
    const custoTotal = manutencoes.reduce((acc, m) => acc + (m.custoCentavos || 0), 0);
    const tempoParadaTotal = manutencoes.reduce((acc, m) => acc + (m.tempoParadaMinutos || 0), 0);
    const ultimaManutencao = manutencoes.length > 0 ? manutencoes[0] : null;
    
    // Recomendação baseada em peças críticas (>85% de uso)
    const pecasCriticas = pecas.filter(p => (p.horasUsoAtualMinutos / p.vidaUtilMinutos) > 0.85);
    
    return { custoTotal, tempoParadaTotal, ultimaManutencao, pecasCriticas };
  }, [manutencoes, pecas]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Dashboard de Saúde & Investimento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-8 rounded-3xl bg-zinc-900 dark:bg-zinc-950 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.05),transparent)] pointer-events-none" />
           
           <div className="flex flex-col gap-1 text-center md:text-left relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-500/60">Saúde do Ativo</span>
              <h4 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Manutenção Acumulada</h4>
              <div className="flex items-center gap-4 mt-4">
                 <div className="flex flex-col">
                    <span className="text-[20px] font-black text-white tabular-nums leading-none">
                       {centavosParaReais(metrics.custoTotal)}
                    </span>
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Investimento Total</span>
                 </div>
                 <div className="w-px h-8 bg-white/10" />
                 <div className="flex flex-col">
                    <span className="text-[20px] font-black text-amber-500 tabular-nums leading-none">
                       {Math.floor(metrics.tempoParadaTotal / 60)}h {metrics.tempoParadaTotal % 60}m
                    </span>
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Downtime Total</span>
                 </div>
              </div>
           </div>

           <button 
             onClick={() => setExibirFormulario(true)}
             className="relative z-10 p-5 rounded-2xl bg-white dark:bg-white/10 text-zinc-900 dark:text-white flex flex-col items-center gap-2 hover:scale-105 active:scale-95 transition-all group"
           >
              <div className="p-3 rounded-xl bg-sky-500 text-white shadow-lg shadow-sky-500/20 group-hover:rotate-90 transition-transform duration-500">
                <Plus size={20} strokeWidth={3} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest">Nova Manutenção</span>
           </button>
        </div>

        {/* Recomendação Inteligente */}
        <div className={`p-8 rounded-3xl border flex flex-col justify-between shadow-xl ${
          metrics.pecasCriticas.length > 0 
            ? 'bg-rose-500/5 border-rose-500/20' 
            : 'bg-emerald-500/5 border-emerald-500/20'
        }`}>
           <div className="flex justify-between items-start">
              <div className={`p-3 rounded-2xl ${metrics.pecasCriticas.length > 0 ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
                {metrics.pecasCriticas.length > 0 ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
              </div>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40">Recomendação</span>
           </div>
           <div className="mt-6">
              <h5 className="text-sm font-black uppercase leading-tight mb-2">
                {metrics.pecasCriticas.length > 0 
                  ? `${metrics.pecasCriticas.length} Componentes em Estado Crítico` 
                  : "Sistema Operando em Condições Ideais"}
              </h5>
              <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {metrics.pecasCriticas.length > 0 
                  ? "Agende uma preventiva para evitar falhas inesperadas na produção." 
                  : "Continue com as preventivas periódicas para garantir a longevidade."}
              </p>
           </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {exibirFormulario ? (
          <motion.div 
            key="formulario"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-8 rounded-3xl border border-borda-sutil bg-zinc-50/50 dark:bg-white/[0.01]"
          >
            <div className="flex justify-between items-center mb-8 px-2">
               <div className="flex items-center gap-3">
                  <Wrench size={20} className="text-sky-500" />
                  <h3 className="text-xl font-black text-primary dark:text-white uppercase tracking-tighter">Registrar Intervenção</h3>
               </div>
               <button onClick={() => setExibirFormulario(false)} className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Cancelar
               </button>
            </div>
            <FormularioManutencao 
                idImpressora={impressora.id}
                pecas={pecas}
                aoCancelar={() => setExibirFormulario(false)}
                aoSalvar={async (dados) => {
                  await registrarManutencao(dados);
                  setExibirFormulario(false);
                }}
            />
          </motion.div>
        ) : (
          <div key="monitor-e-historico" className="space-y-12">
            {/* 2. Status das Peças de Desgaste */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <Activity size={16} className="text-sky-500" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Vida Útil dos Componentes</h4>
              </div>
              <MonitorPecas pecas={pecas} />
            </section>

            {/* 3. Timeline de Intervenções */}
            <section className="space-y-8">
              <div className="flex items-center gap-3 px-2">
                <History size={16} className="text-zinc-400" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Histórico de Atividade</h4>
              </div>
              
              <div className={`relative space-y-8 ${
                manutencoes.length > 0 
                  ? "pl-8 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-borda-sutil" 
                  : ""
              }`}>
                {manutencoes.length === 0 ? (
                  <div className="py-10 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-borda-sutil bg-zinc-50/30 dark:bg-white/[0.01] opacity-60">
                    <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-white/5 text-zinc-400 mb-3">
                      <Wrench size={24} strokeWidth={1.5} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Nenhum registro técnico</p>
                  </div>
                ) : (
                  manutencoes.map((m, idx) => (
                    <motion.div 
                      key={m.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative group"
                    >
                      {/* Indicador de Timeline */}
                      <div className={`absolute -left-8 top-1.5 w-4 h-4 rounded-full border-4 border-card ring-1 ring-borda-sutil ${
                        m.tipo === 'Preventiva' ? 'bg-emerald-500' : m.tipo === 'Corretiva' ? 'bg-rose-500' : 'bg-sky-500'
                      }`} />

                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl border border-borda-sutil bg-white dark:bg-white/[0.01] hover:border-sky-500/30 transition-all duration-300 shadow-sm">
                        <div className="flex-1 space-y-2">
                           <div className="flex items-center gap-3">
                              <span className="text-[10px] font-bold text-zinc-400 tabular-nums">
                                {new Date(m.data).toLocaleDateString('pt-BR')}
                              </span>
                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                                m.tipo === 'Preventiva' ? 'bg-emerald-500/10 text-emerald-500' : m.tipo === 'Corretiva' ? 'bg-rose-500/10 text-rose-500' : 'bg-sky-500/10 text-sky-500'
                              }`}>
                                {m.tipo}
                              </span>
                           </div>
                           <h5 className="text-sm font-black text-primary dark:text-zinc-200 uppercase tracking-tight leading-tight">
                              {m.descricao}
                           </h5>
                        </div>

                        <div className="flex items-center gap-6">
                           {m.tempoParadaMinutos > 0 && (
                             <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1.5 text-xs font-black text-amber-500 tabular-nums">
                                   <Clock size={12} /> {m.tempoParadaMinutos}m
                                </div>
                                <span className="text-[7px] font-black text-zinc-400 uppercase tracking-widest">Inatividade</span>
                             </div>
                           )}
                           {m.custoCentavos > 0 && (
                             <div className="flex flex-col items-end">
                                <div className="text-sm font-black text-primary dark:text-white tabular-nums leading-none">
                                   {centavosParaReais(m.custoCentavos)}
                                </div>
                                <span className="text-[7px] font-black text-zinc-400 uppercase tracking-widest">Peças/Serviço</span>
                             </div>
                           )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
