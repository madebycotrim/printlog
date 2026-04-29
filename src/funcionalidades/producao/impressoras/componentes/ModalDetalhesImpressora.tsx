import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { Impressora, RegistroProducao } from "@/funcionalidades/producao/impressoras/tipos";
import { StatusImpressora } from "@/compartilhado/tipos/modelos";
import { 
  Printer, Zap, DollarSign, Wrench, Clock, 
  Edit2, Box, X, Activity, TrendingUp, 
  History, CheckCircle2, AlertTriangle, AlertCircle
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalDetalhesImpressoraProps {
  impressora: Impressora | null;
  aberto: boolean;
  aoFechar: () => void;
  aoSalvarObservacoes?: (id: string, observacoes: string) => void;
}

export function ModalDetalhesImpressora({
  impressora,
  aberto,
  aoFechar,
  aoSalvarObservacoes,
}: ModalDetalhesImpressoraProps) {
  const [editandoObs, setEditandoObs] = useState(false);
  const [obsTexto, setObsTexto] = useState("");

  useEffect(() => {
    if (impressora) {
      setObsTexto(impressora.observacoes || "");
      setEditandoObs(false);
    }
  }, [impressora, aberto]);

  const metricas = useMemo(() => {
    if (!impressora) return null;

    const horasUsadas = (impressora.horimetroTotalMinutos || 0) / 60;
    const intervaloHoras = (impressora.intervaloRevisaoMinutos || 18000) / 60;
    const porcentagemRevisao = Math.min(100, ((horasUsadas % intervaloHoras) / intervaloHoras) * 100);
    const horasRestantes = Math.max(0, intervaloHoras - (horasUsadas % intervaloHoras));

    // Rentabilidade Real Baseada em Projetos
    const totalFaturadoCentavos = (impressora.historicoProducao || []).reduce(
      (acc, proj) => acc + (proj.valorGeradoCentavos || 0), 
      0
    );
    const valorCompraCentavos = impressora.valorCompraCentavos || 0;
    const roiPercentual = valorCompraCentavos > 0 
      ? (totalFaturadoCentavos / valorCompraCentavos) * 100 
      : 0;

    // Eficiência
    const totalProjetos = (impressora.historicoProducao || []).length;
    const sucessos = (impressora.historicoProducao || []).filter(p => p.sucesso).length;
    const taxaSucesso = totalProjetos > 0 ? (sucessos / totalProjetos) * 100 : 100;

    // Energia Estimada (Baseado na Potência declarada)
    const custoKwhMedio = 0.85; // Fallback ou config
    const kwhTotal = ( (impressora.potenciaWatts || 150) / 1000 ) * horasUsadas;
    const custoEnergiaCentavos = kwhTotal * custoKwhMedio * 100;

    return {
      horasUsadas,
      porcentagemRevisao,
      horasRestantes,
      totalFaturadoCentavos,
      valorCompraCentavos,
      roiPercentual,
      taxaSucesso,
      totalProjetos,
      custoEnergiaCentavos,
      intervaloHoras
    };
  }, [impressora]);

  if (!impressora || !metricas) return null;

  const isManutencao = impressora.status === StatusImpressora.MANUTENCAO;
  const statusConfig = {
    [StatusImpressora.LIVRE]: { cor: "text-blue-500", bg: "bg-blue-500/10", label: "Livre" },
    [StatusImpressora.IMPRIMINDO]: { cor: "text-emerald-500", bg: "bg-emerald-500/10", label: "Imprimindo" },
    [StatusImpressora.MANUTENCAO]: { cor: "text-amber-500", bg: "bg-amber-500/10", label: "Manutenção" },
  };
  const config = statusConfig[impressora.status] || statusConfig[StatusImpressora.LIVRE];

  const lidarSalvarObs = () => {
    if (aoSalvarObservacoes) aoSalvarObservacoes(impressora.id, obsTexto);
    setEditandoObs(false);
  };

  return (
    <Dialogo aberto={aberto} aoFechar={aoFechar} larguraMax="max-w-4xl" esconderCabecalho>
      <div className="flex flex-col relative overflow-hidden bg-white dark:bg-[#0c0c0e] min-h-[600px]">
        {/* Banner de Identidade Industrial */}
        <div className="relative h-48 bg-zinc-50 dark:bg-white/[0.02] border-b border-zinc-100 dark:border-white/5 p-10 flex items-center gap-10">
          <div className="relative group">
            <div className="absolute -inset-4 bg-indigo-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition duration-500" />
            <div className="relative w-32 h-32 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-2xl flex items-center justify-center p-4 overflow-hidden">
               {impressora.imagemUrl ? (
                 <img src={impressora.imagemUrl} alt={impressora.nome} className="w-full h-full object-contain" />
               ) : (
                 <Printer size={48} className="text-zinc-200 dark:text-zinc-800" />
               )}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500">
                {impressora.marca} {impressora.modeloBase} // {impressora.tecnologia}
              </span>
              <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${config.bg} ${config.cor} border-current/20`}>
                {config.label}
              </div>
            </div>
            <h2 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase leading-none mb-1">
              {impressora.nome}
            </h2>
          </div>

          <button onClick={aoFechar} className="absolute top-8 right-8 p-3 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5 transition-all text-zinc-400">
             <X size={20} />
          </button>
        </div>

        <div className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* COLUNA ESQUERDA: DASHBOARD FINANCEIRO E OPERACIONAL */}
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ROI REAL */}
            <div className="col-span-1 md:col-span-2 p-8 rounded-2xl bg-zinc-900 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
                  <TrendingUp size={120} />
               </div>
               
               <div className="relative z-10 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-500 mb-6">
                      <DollarSign size={16} />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Retorno sobre Investimento (ROI)</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-10">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Faturamento Real (Projetos)</span>
                        <div className="text-4xl font-black text-emerald-500 tracking-tighter tabular-nums">
                          R$ {(metricas.totalFaturadoCentavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Ponto de Equilíbrio</span>
                        <div className="text-4xl font-black text-zinc-300 dark:text-zinc-600 tracking-tighter tabular-nums">
                          {Math.round(metricas.roiPercentual)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 space-y-3">
                    <div className="h-3 w-full bg-black/20 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, metricas.roiPercentual)}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                      />
                    </div>
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-500">
                       <span>Investimento: R$ {(metricas.valorCompraCentavos / 100).toLocaleString('pt-BR')}</span>
                       <span>Lucro Líquido: R$ {((metricas.totalFaturadoCentavos - metricas.valorCompraCentavos) / 100).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
               </div>
            </div>

            {/* SAÚDE E REVISÃO */}
            <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5 flex flex-col justify-between group">
               <div>
                  <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500 mb-6">
                    <Wrench size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Manutenção Preventiva</span>
                  </div>
                  <div className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter mb-1">
                    {Math.round(metricas.horasUsadas)}h
                  </div>
                  <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                    de {metricas.intervaloHoras}h rodadas
                  </span>
               </div>

               <div className="space-y-4">
                  <div className="h-2 w-full bg-zinc-200 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${metricas.porcentagemRevisao}%` }}
                      className={`h-full ${metricas.porcentagemRevisao > 80 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Próxima em {Math.round(metricas.horasRestantes)}h</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${metricas.porcentagemRevisao > 80 ? 'text-rose-500' : 'text-zinc-400'}`}>
                      {Math.round(metricas.porcentagemRevisao)}% do Ciclo
                    </span>
                  </div>
               </div>
            </div>
          </div>

          {/* DASHBOARD DE DETALHES TÉCNICOS */}
          <div className="lg:col-span-8 space-y-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <MiniMetrica icone={Box} rotulo="Total Projetos" valor={metricas.totalProjetos.toString()} />
               <MiniMetrica icone={CheckCircle2} rotulo="Taxa Sucesso" valor={`${Math.round(metricas.taxaSucesso)}%`} cor="text-emerald-500" />
               <MiniMetrica icone={Zap} rotulo="Custo Energia" valor={`R$ ${(metricas.custoEnergiaCentavos / 100).toLocaleString('pt-BR')}`} />
               <MiniMetrica icone={Activity} rotulo="Eficiência" valor="A+" cor="text-indigo-500" />
            </div>

            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">Observações de Setup</h3>
                  {!editandoObs && (
                    <button onClick={() => setEditandoObs(true)} className="text-[9px] font-black text-indigo-500 uppercase tracking-widest hover:underline">Editar Registro</button>
                  )}
               </div>
               
               {editandoObs ? (
                 <div className="space-y-4">
                    <textarea 
                      value={obsTexto} 
                      onChange={(e) => setObsTexto(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 text-sm text-zinc-900 dark:text-zinc-300 focus:outline-none focus:ring-2 ring-indigo-500/20 min-h-[150px]"
                      placeholder="Anote detalhes técnicos como calibração, bicos favoritos, etc..."
                    />
                    <div className="flex justify-end gap-3">
                      <button onClick={() => setEditandoObs(false)} className="px-6 py-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono">Cancelar</button>
                      <button onClick={lidarSalvarObs} className="px-8 py-2 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-500/20">Salvar Dados</button>
                    </div>
                 </div>
               ) : (
                 <div className="p-8 rounded-2xl bg-zinc-50/50 dark:bg-white/[0.01] border border-zinc-100 dark:border-white/[0.05] min-h-[120px] text-sm text-zinc-600 dark:text-zinc-400 italic">
                    {obsTexto || "Nenhuma observação técnica registrada para este ativo."}
                 </div>
               )}
            </div>
          </div>

          {/* COLUNA DIREITA: TIMELINE DE PRODUÇÃO */}
          <div className="lg:col-span-4 space-y-6">
             <div className="flex items-center gap-3 mb-2">
                <History size={16} className="text-zinc-400" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">Últimos Projetos</h3>
             </div>

             <div className="space-y-4">
                {impressora.historicoProducao && impressora.historicoProducao.length > 0 ? (
                  impressora.historicoProducao.slice(0, 5).map((p, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                       <div className="min-w-0">
                          <p className="text-[10px] font-black text-zinc-900 dark:text-white truncate uppercase tracking-tight mb-1">{p.nomeProjeto || "Projeto Sem Nome"}</p>
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                            {new Date(p.dataConclusao).toLocaleDateString('pt-BR')}
                          </span>
                       </div>
                       <div className="text-right">
                          <p className="text-xs font-black text-emerald-500 tracking-tighter">
                            + R$ {(p.valorGeradoCentavos / 100).toLocaleString('pt-BR')}
                          </p>
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center border-2 border-dashed border-zinc-100 dark:border-white/5 rounded-2xl">
                     <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nenhum Job Registrado</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </Dialogo>
  );
}

function MiniMetrica({ icone: Icone, rotulo, valor, cor = "text-zinc-900 dark:text-white" }: { icone: any, rotulo: string, valor: string, cor?: string }) {
  return (
    <div className="p-5 rounded-2xl bg-zinc-50/50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5">
       <div className="flex items-center gap-2 mb-3 text-zinc-400">
          <Icone size={14} />
          <span className="text-[8px] font-black uppercase tracking-widest">{rotulo}</span>
       </div>
       <div className={`text-xl font-black tracking-tight ${cor}`}>
          {valor}
       </div>
    </div>
  );
}
