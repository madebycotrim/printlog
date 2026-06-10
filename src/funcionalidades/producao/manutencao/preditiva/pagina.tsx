import {
  Wrench,
  ArrowLeft,
  AlertTriangle,
  Calendar,
  Clock,
  CheckCircle2,
  MoreHorizontal,
  Settings2,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { useGerenciadorImpressoras } from "@/funcionalidades/producao/impressoras/hooks/useGerenciadorImpressoras";
import { servicoPredicaoManutencao } from "./servicos/servicoPredicaoManutencao";
import { obterCorStatusManutencao } from "@/funcionalidades/producao/impressoras/utilitarios/utilitariosManutencao";
import { useDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { Carregamento } from "@/compartilhado/componentes";

export function PaginaManutencaoPreditiva() {
  const navigate = useNavigate();
  const { estado: { impressoras, carregando }, acoes: { abrirGerenciamento } } = useGerenciadorImpressoras();

  const [primeiroCarregamento, setPrimeiroCarregamento] = useState(false);
  useEffect(() => {
    if (!carregando) {
      const temporizador = setTimeout(() => setPrimeiroCarregamento(true), 50);
      return () => clearTimeout(temporizador);
    }
  }, [carregando]);

  const exibindoLoading = !primeiroCarregamento || carregando;

  const agenda = useMemo(() => servicoPredicaoManutencao.gerarAgendaPreditiva(impressoras), [impressoras]);

  useDefinirCabecalho({
    titulo: "Agenda de Manutenção Preditiva",
    subtitulo: "Evite paradas não planejadas monitorando a saúde do seu parque.",
    acao: {
      texto: "Voltar",
      icone: ArrowLeft,
      aoClicar: () => navigate("/dashboard"),
    },
  });

  const itensCriticos = agenda.filter((a) => a.status === "critico").length;
  const itensAviso = agenda.filter((a) => a.status === "aviso").length;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <AnimatePresence mode="wait">
        {exibindoLoading ? (
          <motion.div
            key="carregando"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center py-40"
          >
            <Carregamento tipo="ponto" mensagem="Calculando projeções de desgaste..." />
          </motion.div>
        ) : (
          <motion.div
            key="conteudo"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-10 pb-20"
          >
            {/* 🔝 RESUMO DE SAÚDE */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div
                className={`p-8 rounded-[2rem] border shadow-sm relative overflow-hidden group ${itensCriticos > 0 ? "bg-rose-500 border-rose-500 text-white shadow-rose-500/20" : "bg-card border-borda-sutil"}`}
              >
                <p
                  className={`text-[10px] font-black uppercase tracking-widest mb-1 ${itensCriticos > 0 ? "opacity-70" : "text-gray-400"}`}
                >
                  Intervenções Críticas
                </p>
                <h3 className="text-4xl font-black mb-4">{itensCriticos}</h3>
                <AlertTriangle className={`absolute -right-4 -bottom-4 opacity-10`} size={120} />
                {itensCriticos > 0 && (
                  <p className="text-[10px] font-bold uppercase tracking-widest mt-4 bg-white/10 px-3 py-1 rounded-full w-fit italic">
                    Ação Imediata Recomendada
                  </p>
                )}
              </div>

              <div
                className="p-8 rounded-[2rem] bg-card border border-borda-sutil shadow-sm"
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Avisos Preventivos</p>
                <h3 className="text-4xl font-black text-amber-500 mb-4">{itensAviso}</h3>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Próximos a vencer</span>
                </div>
              </div>

              <div
                className="p-8 rounded-[2rem] bg-card border border-borda-sutil shadow-sm"
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Saúde Geral do Parque</p>
                <h3 className="text-4xl font-black text-emerald-500 mb-4">
                  {Math.round(((agenda.length - (itensCriticos + itensAviso)) / (agenda.length || 1)) * 100)}%
                </h3>
                <div className="h-2 w-full bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{
                      width: `${Math.round(((agenda.length - (itensCriticos + itensAviso)) / (agenda.length || 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 🗓️ AGENDA DETALHADA */}
            <div className="p-10 rounded-2xl bg-card border border-borda-sutil shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <Wrench size={20} className="text-rose-500" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500">
                    Cronograma de Manutenção
                  </h4>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-all text-gray-400">
                    <Settings2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {agenda.length === 0 ? (
                  <div className="py-20 text-center opacity-30">
                    <CheckCircle2 size={48} className="mx-auto mb-4" />
                    <p className="font-black uppercase tracking-widest text-xs">
                      Tudo operacional. Nenhuma manutenção pendente.
                    </p>
                  </div>
                ) : (
                  agenda.map((item, index) => {
                    const cores = obterCorStatusManutencao(item.status);
                    return (
                      <motion.div
                        key={`${item.idImpressora}-${item.nomeItem}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group grid grid-cols-1 md:grid-cols-4 gap-6 p-6 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-transparent hover:border-borda-sutil dark:hover:border-white/10 transition-all items-center"
                      >
                        {/* Info Básica */}
                        <div className="md:col-span-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                            {item.nomeImpressora}
                          </p>
                          <h5 className="text-sm font-black uppercase tracking-tight">{item.nomeItem}</h5>
                        </div>

                        {/* Status & Barra */}
                        <div className="md:col-span-1 space-y-3">
                          <div className="flex justify-between items-end mb-1">
                            <span
                              className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${cores.bg} text-white`}
                            >
                              {item.status}
                            </span>
                            <span className="text-[10px] font-black text-gray-400">{item.percentualUso}% consumido</span>
                          </div>
                          <div className="h-2 w-full bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full ${cores.bg}`} style={{ width: `${item.percentualUso}%` }} />
                          </div>
                        </div>

                        {/* Previsão */}
                        <div className="md:col-span-1 flex items-center gap-6">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Clock size={16} />
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest">Restam</p>
                              <p className="text-xs font-black text-primary dark:text-white">~{item.horasRestantes}h</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <Calendar size={16} />
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest">Previsão</p>
                              <p className="text-xs font-black text-primary dark:text-white">
                                {item.previsaoData?.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="md:col-span-1 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              const impressora = impressoras.find((i) => i.id === item.idImpressora);
                              if (impressora) {
                                abrirGerenciamento(impressora, "manutencao");
                                navigate("/impressoras");
                              }
                            }}
                            className="px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-lg text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg"
                          >
                            Registrar Troca
                          </button>
                          <button className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-all text-gray-400">
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 💡 DICA PRO */}
            <div className="p-8 rounded-[2rem] bg-indigo-500/10 dark:bg-indigo-500/5 border border-indigo-500/20 flex items-center gap-6">
              <div className="w-12 h-12 rounded-xl bg-indigo-500 text-white flex items-center justify-center shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-500 mb-1">
                  Como calculamos a previsão?
                </h5>
                <p className="text-xs font-medium text-indigo-600 dark:text-indigo-300 leading-relaxed">
                  Nossa IA analisa o horímetro atual e as horas de manutenção cadastradas. A projeção de data assume um uso
                  médio de **8 horas diárias**. Para previsões mais precisas, mantenha o horímetro de suas máquinas sempre
                  atualizado ao concluir cada projeto.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
