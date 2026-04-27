import { Beaker, Building2, Settings2, ChevronDown, AlertTriangle, ShieldCheck, Zap, Share2, PackageSearch, TrendingUp, MessageCircle } from "lucide-react";
import { useState } from "react";
import { CabecalhoCard } from "./Compartilhados";
import { usarEstudio } from "@/funcionalidades/beta/multi_estudos/contextos/ContextoEstudio";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";

interface PropsCardEstudio {
  participarPrototipos: boolean;
  definirParticiparPrototipos: (v: boolean) => void;
  betaMultiEstudio: boolean;
  definirBetaMultiEstudio: (v: boolean) => void;
  betaOrcamentosMagicos: boolean;
  definirBetaOrcamentosMagicos: (v: boolean) => void;
  betaEstoqueInteligente: boolean;
  definirBetaEstoqueInteligente: (v: boolean) => void;
  betaSimuladorMargem: boolean;
  definirBetaSimuladorMargem: (v: boolean) => void;
  templateOrcamento: string;
  definirTemplateOrcamento: (v: string) => void;
  limiteAlertaEstoque: number;
  definirLimiteAlertaEstoque: (v: number) => void;
  pendente?: boolean;
}

export function CardEstudio({
  participarPrototipos,
  definirParticiparPrototipos,
  betaMultiEstudio,
  definirBetaMultiEstudio,
  betaOrcamentosMagicos,
  definirBetaOrcamentosMagicos,
  betaEstoqueInteligente,
  definirBetaEstoqueInteligente,
  betaSimuladorMargem,
  definirBetaSimuladorMargem,
  templateOrcamento,
  definirTemplateOrcamento,
  limiteAlertaEstoque,
  definirLimiteAlertaEstoque,
  pendente,
}: PropsCardEstudio) {
  const { estudioAtivo, estudios, definirEstudioAtivo } = usarEstudio();
  const [mostrarConfigEstudio, setMostrarConfigEstudio] = useState(false);
  const [mostrarConfigOrcamento, setMostrarConfigOrcamento] = useState(false);
  const [mostrarConfigEstoque, setMostrarConfigEstoque] = useState(false);
  const [mostrarModalConfirmacao, setMostrarModalConfirmacao] = useState(false);

  const lidarComMudancaBeta = (ativo: boolean) => {
    if (ativo) {
      setMostrarModalConfirmacao(true);
    } else {
      definirParticiparPrototipos(false);
      definirBetaMultiEstudio(false);
      definirBetaOrcamentosMagicos(false);
      definirBetaEstoqueInteligente(false);
      definirBetaSimuladorMargem(false);
      setMostrarConfigEstudio(false);
    }
  };

  const confirmarParticipacao = () => {
    definirParticiparPrototipos(true);
    setMostrarModalConfirmacao(false);
  };

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-white/[0.04] bg-white dark:bg-[#121214] p-5 md:p-6 flex flex-col gap-5 relative overflow-hidden group hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] transition-all duration-700">
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
            <div className="relative flex items-center mt-0.5 shrink-0">
              <input
                type="checkbox"
                className="sr-only"
                checked={participarPrototipos}
                onChange={(e) => lidarComMudancaBeta(e.target.checked)}
              />
              <div className={`w-10 h-5.5 rounded-full flex items-center p-0.5 transition-all duration-300 ${participarPrototipos ? "bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]" : "bg-gray-300 dark:bg-zinc-700"}`}>
                 <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm flex items-center justify-center transform transition-transform duration-300 ease-in-out ${participarPrototipos ? "translate-x-4.5" : "translate-x-0"}`}>
                    <Beaker size={10} className={`transition-opacity duration-300 ${participarPrototipos ? "text-indigo-500 opacity-100" : "opacity-0 hidden"}`} strokeWidth={3} />
                 </div>
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
                    <div className="relative flex items-center mt-0.5 shrink-0">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={betaMultiEstudio}
                        onChange={(e) => {
                          definirBetaMultiEstudio(e.target.checked);
                          if (!e.target.checked) setMostrarConfigEstudio(false);
                        }}
                      />
                      <div className={`w-8 h-4.5 rounded-full flex items-center p-0.5 transition-all duration-300 ${betaMultiEstudio ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]" : "bg-gray-300 dark:bg-zinc-700/60"}`}>
                          <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${betaMultiEstudio ? "translate-x-3.5" : "translate-x-0"}`} />
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

                {/* ORÇAMENTOS MÁGICOS */}
                <div
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${betaOrcamentosMagicos ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" : "border-gray-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/30"}`}
                >
                  <label className="flex items-start gap-4 cursor-pointer flex-1">
                    <div className="relative flex items-center mt-0.5 shrink-0">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={betaOrcamentosMagicos}
                        onChange={(e) => {
                          definirBetaOrcamentosMagicos(e.target.checked);
                          if (!e.target.checked) setMostrarConfigOrcamento(false);
                        }}
                      />
                      <div className={`w-8 h-4.5 rounded-full flex items-center p-0.5 transition-all duration-300 ${betaOrcamentosMagicos ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]" : "bg-gray-300 dark:bg-zinc-700/60"}`}>
                          <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${betaOrcamentosMagicos ? "translate-x-3.5" : "translate-x-0"}`} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4
                        className={`text-sm font-bold flex items-center gap-2 ${betaOrcamentosMagicos ? "text-indigo-900 dark:text-indigo-100" : "text-gray-900 dark:text-white"}`}
                      >
                        <Share2
                          size={16}
                          className={betaOrcamentosMagicos ? "text-indigo-500" : "text-gray-400 dark:text-zinc-500"}
                        />{" "}
                        Orçamentos Mágicos
                      </h4>
                      <p
                        className={`text-[11px] mt-0.5 leading-relaxed ${betaOrcamentosMagicos ? "text-indigo-700 dark:text-indigo-300/80" : "text-gray-500 dark:text-zinc-500"}`}
                      >
                        Links dinâmicos para WhatsApp otimizando a venda direta ao cliente (em breve).
                      </p>
                    </div>
                  </label>
                  {betaOrcamentosMagicos && (
                    <button 
                      onClick={() => setMostrarConfigOrcamento(!mostrarConfigOrcamento)}
                      className={`p-2 rounded-lg transition-all ${mostrarConfigOrcamento ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-500/30"}`}
                      title="Configurar Mensagem"
                    >
                      <Settings2 size={16} />
                    </button>
                  )}
                </div>

                {/* CONFIG ORÇAMENTO */}
                {betaOrcamentosMagicos && mostrarConfigOrcamento && (
                  <div className="mx-2 p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 animate-in zoom-in-95 duration-200 space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500">
                      Personalizar Mensagem WhatsApp
                    </label>
                    <textarea 
                      value={templateOrcamento}
                      onChange={(e) => definirTemplateOrcamento(e.target.value)}
                      rows={5}
                      className="w-full p-3 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 text-xs text-gray-700 dark:text-gray-300 focus:border-indigo-500 transition-all resize-none"
                      placeholder="Use {estudio} e {valor} como variáveis..."
                    />
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold uppercase tracking-wider">{`{estudio}`}</span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold uppercase tracking-wider">{`{valor}`}</span>
                    </div>
                  </div>
                )}

                {/* ESTOQUE INTELIGENTE */}
                <div
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${betaEstoqueInteligente ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" : "border-gray-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/30"}`}
                >
                  <label className="flex items-start gap-4 cursor-pointer flex-1">
                    <div className="relative flex items-center mt-0.5 shrink-0">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={betaEstoqueInteligente}
                        onChange={(e) => {
                          definirBetaEstoqueInteligente(e.target.checked);
                          if (!e.target.checked) setMostrarConfigEstoque(false);
                        }}
                      />
                      <div className={`w-8 h-4.5 rounded-full flex items-center p-0.5 transition-all duration-300 ${betaEstoqueInteligente ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]" : "bg-gray-300 dark:bg-zinc-700/60"}`}>
                          <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${betaEstoqueInteligente ? "translate-x-3.5" : "translate-x-0"}`} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4
                        className={`text-sm font-bold flex items-center gap-2 ${betaEstoqueInteligente ? "text-indigo-900 dark:text-indigo-100" : "text-gray-900 dark:text-white"}`}
                      >
                        <PackageSearch
                          size={16}
                          className={betaEstoqueInteligente ? "text-indigo-500" : "text-gray-400 dark:text-zinc-500"}
                        />{" "}
                        Estoque Inteligente
                      </h4>
                      <p
                        className={`text-[11px] mt-0.5 leading-relaxed ${betaEstoqueInteligente ? "text-indigo-700 dark:text-indigo-300/80" : "text-gray-500 dark:text-zinc-500"}`}
                      >
                        Alertas preditivos de reposição cruzando seu histórico de consumo e fornecedores.
                      </p>
                    </div>
                  </label>
                  {betaEstoqueInteligente && (
                    <button 
                      onClick={() => setMostrarConfigEstoque(!mostrarConfigEstoque)}
                      className={`p-2 rounded-lg transition-all ${mostrarConfigEstoque ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-500/30"}`}
                      title="Configurar Alertas"
                    >
                      <Settings2 size={16} />
                    </button>
                  )}
                </div>

                {/* CONFIG ESTOQUE */}
                {betaEstoqueInteligente && mostrarConfigEstoque && (
                  <div className="mx-2 p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 animate-in zoom-in-95 duration-200 space-y-4">
                    <div className="flex items-center justify-between">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500">
                        Limite Mínimo para Alerta
                      </label>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded-md">{limiteAlertaEstoque}g</span>
                    </div>
                    <input 
                      type="range"
                      min={50}
                      max={2000}
                      step={50}
                      value={limiteAlertaEstoque}
                      onChange={(e) => definirLimiteAlertaEstoque(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                      <span>Mín: 50g</span>
                      <span>Máx: 2kg</span>
                    </div>
                  </div>
                )}

                {/* SIMULADOR MARGEM */}
                <div
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${betaSimuladorMargem ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" : "border-gray-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/30"}`}
                >
                  <label className="flex items-start gap-4 cursor-pointer flex-1">
                    <div className="relative flex items-center mt-0.5 shrink-0">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={betaSimuladorMargem}
                        onChange={(e) => definirBetaSimuladorMargem(e.target.checked)}
                      />
                      <div className={`w-8 h-4.5 rounded-full flex items-center p-0.5 transition-all duration-300 ${betaSimuladorMargem ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]" : "bg-gray-300 dark:bg-zinc-700/60"}`}>
                          <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${betaSimuladorMargem ? "translate-x-3.5" : "translate-x-0"}`} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4
                        className={`text-sm font-bold flex items-center gap-2 ${betaSimuladorMargem ? "text-indigo-900 dark:text-indigo-100" : "text-gray-900 dark:text-white"}`}
                      >
                        <TrendingUp
                          size={16}
                          className={betaSimuladorMargem ? "text-indigo-500" : "text-gray-400 dark:text-zinc-500"}
                        />{" "}
                        Simulador de Margem DRE
                      </h4>
                      <p
                        className={`text-[11px] mt-0.5 leading-relaxed ${betaSimuladorMargem ? "text-indigo-700 dark:text-indigo-300/80" : "text-gray-500 dark:text-zinc-500"}`}
                      >
                        Estresse seus preços e veja simulações do impacto de custos na sua lucratividade.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* FEEDBACK BETA */}
            <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
               <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1"><MessageCircle size={12}/> Seu Feedback é Ouro</span>
                  <p className="text-xs text-gray-400 mt-0.5">Encontrou um erro ou tem uma ideia para o LAB? Fale direto com o desenvolvedor.</p>
               </div>
               <a 
                 href="mailto:suporte@printlog.com.br?subject=[BETA]%20Feedback%20do%20Laborat%C3%B3rio"
                 className="px-6 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shrink-0"
               >
                 Enviar Feedback
               </a>
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
                <p className="text-xs text-emerald-800 dark:text-amber-300/80 mt-1">
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
