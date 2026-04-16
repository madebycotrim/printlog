import { Beaker, Building2, BrainCircuit, Settings2, ChevronDown, AlertTriangle, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";
import { CabecalhoCard } from "./Compartilhados";
import { usarEstudio } from "@/funcionalidades/beta/multi_estudos/contextos/ContextoEstudio";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";

interface PropsCardEstudio {
  participarPrototipos: boolean;
  definirParticiparPrototipos: (v: boolean) => void;
  betaMultiEstudio: boolean;
  definirBetaMultiEstudio: (v: boolean) => void;
  betaRelatorios: boolean;
  definirBetaRelatorios: (v: boolean) => void;
  pendente?: boolean;
}

export function CardEstudio({
  participarPrototipos,
  definirParticiparPrototipos,
  betaMultiEstudio,
  definirBetaMultiEstudio,
  betaRelatorios,
  definirBetaRelatorios,
  pendente,
}: PropsCardEstudio) {
  const { estudioAtivo, estudios, definirEstudioAtivo } = usarEstudio();
  const [mostrarConfigEstudio, setMostrarConfigEstudio] = useState(false);
  const [mostrarModalConfirmacao, setMostrarModalConfirmacao] = useState(false);

  const lidarComMudancaBeta = (ativo: boolean) => {
    if (ativo) {
      setMostrarModalConfirmacao(true);
    } else {
      definirParticiparPrototipos(false);
      definirBetaMultiEstudio(false);
      definirBetaRelatorios(false);
      setMostrarConfigEstudio(false);
    }
  };

  const confirmarParticipacao = () => {
    definirParticiparPrototipos(true);
    setMostrarModalConfirmacao(false);
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] p-5 md:p-6 flex flex-col gap-5 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-indigo-500/[0.01] dark:from-indigo-500/[0.05] dark:to-indigo-500/[0.02] pointer-events-none" />
      <div className="flex items-center justify-between">
        <CabecalhoCard
          titulo="Programa Beta"
          descricao="Acesso antecipado a novas funcionalidades experimentais"
          icone={Beaker}
          corIcone="text-indigo-500"
          pendente={pendente}
        />

        {participarPrototipos ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 animate-pulse">
            <Beaker size={14} strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase tracking-wider">Lab Ativo</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-zinc-500">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-wider">Modo Seguro</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <label className="flex items-start gap-4 cursor-pointer group">
            <div className="relative flex items-start mt-1 shrink-0">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={participarPrototipos}
                onChange={(e) => lidarComMudancaBeta(e.target.checked)}
              />
              <div className="w-5 h-5 rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-all flex items-center justify-center">
                <Beaker
                  size={12}
                  className={`text-white transition-transform ${participarPrototipos ? "scale-100" : "scale-0"}`}
                  strokeWidth={3}
                />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Participar de Protótipos (Programa Beta)
              </h4>
              <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1 leading-relaxed">
                Receba acesso antecipado a novas funcionalidades em fase de testes, como relatórios com IA e a nova
                camada base do **Multi-Estúdios** (Fase 3). Funcionalidades ativadas aqui podem apresentar
                instabilidades.
              </p>
            </div>
          </label>
        </div>

        {participarPrototipos && (
          <div className="pt-4 border-t border-gray-100 dark:border-white/5 animate-in fade-in slide-in-from-top-2 duration-300 space-y-6">
            {/* OPCOES BETA */}
            <div className="space-y-3">
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500 ml-1">
                Escolha as funcionalidades
              </label>

              <div className="space-y-2">
                <div
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${betaMultiEstudio ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" : "border-gray-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/30"}`}
                >
                  <label className="flex items-start gap-4 cursor-pointer flex-1">
                    <div className="relative flex items-start mt-0.5 shrink-0">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={betaMultiEstudio}
                        onChange={(e) => {
                          definirBetaMultiEstudio(e.target.checked);
                          if (!e.target.checked) setMostrarConfigEstudio(false);
                        }}
                      />
                      <div className="w-4 h-4 rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center transition-all peer-checked:bg-indigo-500 peer-checked:border-indigo-500">
                        {betaMultiEstudio && <div className="w-1.5 h-1.5 rounded-sm bg-white" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4
                        className={`text-sm font-bold flex items-center gap-2 ${betaMultiEstudio ? "text-indigo-900 dark:text-indigo-100" : "text-gray-900 dark:text-white"}`}
                      >
                        <Building2
                          size={16}
                          className={betaMultiEstudio ? "text-indigo-500" : "text-gray-400 dark:text-zinc-500"}
                        />{" "}
                        Multi-Estúdios
                      </h4>
                      <p
                        className={`text-[11px] mt-0.5 leading-relaxed ${betaMultiEstudio ? "text-indigo-700 dark:text-indigo-300/80" : "text-gray-500 dark:text-zinc-500"}`}
                      >
                        Alterne entre múltiplas contas do PrintLog de forma isolada.
                      </p>
                    </div>
                  </label>

                  {betaMultiEstudio && (
                    <button
                      onClick={() => setMostrarConfigEstudio(!mostrarConfigEstudio)}
                      className={`p-2 rounded-lg transition-all ${mostrarConfigEstudio ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-500/30"}`}
                      title="Configurações do Estúdio"
                    >
                      <Settings2 size={16} />
                    </button>
                  )}
                </div>

                {/* SE MULTI ESTUDIO CONFIG ABERTA */}
                {betaMultiEstudio && mostrarConfigEstudio && (
                  <div className="mx-2 p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500">
                        Configurações: Selecione o Estúdio
                      </label>
                      <ChevronDown size={14} className="text-gray-400" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {estudios.map((estudio) => (
                        <button
                          key={estudio.id}
                          onClick={() => definirEstudioAtivo(estudio.id)}
                          className={`
                                                        flex items-center gap-3 p-3 rounded-xl border text-sm transition-all text-left
                                                        ${
                                                          estudio.id === estudioAtivo?.id
                                                            ? "border-indigo-500 bg-white dark:bg-zinc-900 text-indigo-900 dark:text-indigo-100 shadow-sm"
                                                            : "border-gray-200 dark:border-white/10 bg-transparent text-gray-600 dark:text-gray-400 hover:border-indigo-300 dark:hover:border-indigo-500/30"
                                                        }
                                                    `}
                        >
                          <div
                            className={`w-3 h-3 rounded-full shrink-0 ${estudio.id === estudioAtivo?.id ? "bg-indigo-500" : "bg-gray-300 dark:bg-zinc-700"}`}
                          />
                          <span className="font-bold truncate">{estudio.nome}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-zinc-600 mt-4 leading-relaxed">
                      * A troca de estúdio exige recarregamento para segurança dos dados.
                    </p>
                  </div>
                )}

                <div
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${betaRelatorios ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" : "border-gray-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/30"}`}
                >
                  <label className="flex items-start gap-4 cursor-pointer flex-1">
                    <div className="relative flex items-start mt-0.5 shrink-0">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={betaRelatorios}
                        onChange={(e) => definirBetaRelatorios(e.target.checked)}
                      />
                      <div className="w-4 h-4 rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center transition-all peer-checked:bg-indigo-500 peer-checked:border-indigo-500">
                        {betaRelatorios && <div className="w-1.5 h-1.5 rounded-sm bg-white" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4
                        className={`text-sm font-bold flex items-center gap-2 ${betaRelatorios ? "text-indigo-900 dark:text-indigo-100" : "text-gray-900 dark:text-white"}`}
                      >
                        <BrainCircuit
                          size={16}
                          className={betaRelatorios ? "text-indigo-500" : "text-gray-400 dark:text-zinc-500"}
                        />{" "}
                        Relatórios com IA
                      </h4>
                      <p
                        className={`text-[11px] mt-0.5 leading-relaxed ${betaRelatorios ? "text-indigo-700 dark:text-indigo-300/80" : "text-gray-500 dark:text-zinc-500"}`}
                      >
                        Dashboard e métricas preditivas geradas pelo motor de IA.
                      </p>
                    </div>
                  </label>

                  {betaRelatorios && (
                    <button
                      className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 opacity-50 cursor-not-allowed"
                      title="Configurações em breve"
                      disabled
                    >
                      <Settings2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE CONFIRMAÇÃO BETA */}
      <Dialogo
        aberto={mostrarModalConfirmacao}
        aoFechar={() => setMostrarModalConfirmacao(false)}
        titulo="Termos do Programa Beta"
        larguraMax="max-w-md"
      >
        <div className="p-6 flex flex-col gap-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 mx-auto">
            <Beaker size={32} />
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Acesso Antecipado e Experimental</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
              Você está prestes a ativar funcionalidades que ainda estão em fase de laboratório. Leia atentamente:
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
              <AlertTriangle className="text-amber-600 dark:text-amber-500 shrink-0" size={20} />
              <div>
                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">Risco de Instabilidade</h4>
                <p className="text-xs text-amber-800 dark:text-amber-300/80 mt-1">
                  O sistema pode apresentar lentidão ou erros inesperados em funções críticas.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
              <Zap className="text-indigo-600 dark:text-indigo-400 shrink-0" size={20} />
              <div>
                <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">Alterações Frequentes</h4>
                <p className="text-xs text-indigo-800 dark:text-indigo-300/80 mt-1">
                  Recursos experimentais podem ser modificados ou removidos sem aviso prévio.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
              <ShieldCheck className="text-emerald-600 dark:text-emerald-500 shrink-0" size={20} />
              <div>
                <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Isolamento Garantido</h4>
                <p className="text-xs text-emerald-800 dark:text-emerald-300/80 mt-1">
                  Seus dados reais continuam protegidos, mas recomendamos backup de projetos importantes.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <button
              onClick={() => setMostrarModalConfirmacao(false)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
            >
              Agora não
            </button>
            <button
              onClick={confirmarParticipacao}
              className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
            >
              Entendi e Quero Ativar
            </button>
          </div>
        </div>
      </Dialogo>
    </div>
  );
}
