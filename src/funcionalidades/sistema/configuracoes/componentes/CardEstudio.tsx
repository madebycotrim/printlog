import { Beaker, Building2, Settings2, ChevronDown, AlertTriangle, ShieldCheck, Zap, Share2, PackageSearch, TrendingUp, MessageCircle, Lock, ArrowRight } from "lucide-react";
import { useState } from "react";
import { CabecalhoCard } from "./Compartilhados";
import { useEstudio } from "@/funcionalidades/beta/multi_estudos/contextos/ContextoEstudio";
import { Dialogo } from "@/compartilhado/componentes";
import { useArmazemConfiguracoes } from "../estado/armazemConfiguracoes";


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
  const { estudioAtivo, estudios, definirEstudioAtivo } = useEstudio();
  const [mostrarConfigEstudio, setMostrarConfigEstudio] = useState(false);
  const [mostrarConfigOrcamento, setMostrarConfigOrcamento] = useState(false);
  const [mostrarConfigEstoque, setMostrarConfigEstoque] = useState(false);
  const [mostrarModalConfirmacao, setMostrarModalConfirmacao] = useState(false);

  const plano = useArmazemConfiguracoes((s) => s.plano);
  const temAcessoBeta = plano === "PRO" || plano === "FUNDADOR";


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
    <div className="rounded-2xl border border-borda-sutil bg-card p-5 md:p-6 flex flex-col gap-5 relative overflow-hidden group hover:shadow-premium transition-all duration-700">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent dark:from-white/[0.02] dark:to-transparent pointer-events-none" />
      <div className="flex items-center justify-between">
        <CabecalhoCard
          titulo="Programa Beta"
          descricao="Acesso antecipado a novas funcionalidades experimentais"
          icone={Beaker}
          corIcone="text-indigo-500"
          pendente={pendente}
        />

        {!temAcessoBeta ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <Lock size={13} strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase tracking-wider">Exclusivo</span>
          </div>
        ) : participarPrototipos ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 animate-pulse">
            <Beaker size={14} strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase tracking-wider">Lab Ativo</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/40 border border-borda-sutil text-muted-foreground">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-wider">Modo Seguro</span>
          </div>
        )}
      </div>

      {/* === PAINEL DE ACESSO BLOQUEADO (FREE) === */}
      {!temAcessoBeta ? (
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.03] overflow-hidden w-full">
          {/* Glow de fundo */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-400/20 dark:bg-indigo-500/10 blur-[40px] pointer-events-none rounded-full" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-left flex-1">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
              <Beaker size={22} className="text-indigo-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-primary flex items-center gap-2 justify-center md:justify-start">
                Programa Beta Exclusivo
                <span className="text-[8px] font-black uppercase tracking-widest bg-amber-400/15 text-amber-500 px-2 py-0.5 rounded border border-amber-400/30">PRO</span>
              </h3>
              <p className="text-xs text-muted-foreground max-w-lg leading-relaxed">
                Acesse funcionalidades experimentais antecipadas. Disponível nos planos <strong className="text-indigo-600 dark:text-indigo-400">Maker Pro</strong> e <strong className="text-sky-500">Maker Fundador</strong>.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full md:w-auto">
            <a
              href="https://printlog.com.br/planos"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/10 transition-all active:scale-95 whitespace-nowrap"
            >
              <Zap size={13} className="fill-white" />
              Upgrade de Plano
              <ArrowRight size={13} />
            </a>
          </div>
        </div>
      ) : (
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
              <h4 className="text-sm font-bold text-primary group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Participar de Protótipos (Programa Beta)
              </h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Receba acesso antecipado a novas funcionalidades em fase de testes, como relatórios com IA e a nova
                camada base do **Multi-Estúdios** (Fase 3). Funcionalidades ativadas aqui podem apresentar
                instabilidades.
              </p>
            </div>
          </label>
        </div>

        {participarPrototipos && (
          <div className="pt-4 border-t border-borda-sutil animate-in fade-in slide-in-from-top-2 duration-300 space-y-6">
            {/* OPCOES BETA */}
            <div className="space-y-3">
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Escolha as funcionalidades
              </label>

              <div className="space-y-2">
                <div
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${betaMultiEstudio ? "border-indigo-500 bg-indigo-500/10" : "border-borda-sutil bg-muted/20 hover:bg-muted/30 hover:border-indigo-500/30"}`}
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
                        className={`text-sm font-bold flex items-center gap-2 ${betaMultiEstudio ? "text-indigo-600 dark:text-indigo-400" : "text-primary"}`}
                      >
                        <Building2
                          size={16}
                          className={betaMultiEstudio ? "text-indigo-500" : "text-muted-foreground"}
                        />{" "}
                        Multi-Estúdios
                      </h4>
                      <p
                        className={`text-[11px] mt-0.5 leading-relaxed ${betaMultiEstudio ? "text-indigo-700 dark:text-indigo-300/80" : "text-muted-foreground"}`}
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
                  <div className="mx-2 p-4 rounded-xl bg-muted/30 border border-borda-sutil animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Configurações: Selecione o Estúdio
                      </label>
                      <ChevronDown size={14} className="text-muted-foreground" />
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
                                                            ? "border-indigo-500 bg-card text-indigo-600 dark:text-indigo-300 shadow-sm"
                                                            : "border-borda-sutil bg-transparent text-muted-foreground hover:border-indigo-500/30"
                                                        }
                                                    `}
                        >
                          <div
                            className={`w-3 h-3 rounded-full shrink-0 ${estudio.id === estudioAtivo?.id ? "bg-indigo-500" : "bg-muted"}`}
                          />
                          <span className="font-bold truncate">{estudio.nome}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground/70 mt-4 leading-relaxed">
                      * A troca de estúdio exige recarregamento para segurança dos dados.
                    </p>
                  </div>
                )}

                {/* ORÇAMENTOS MÁGICOS */}
                <div
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${betaOrcamentosMagicos ? "border-indigo-500 bg-indigo-500/10" : "border-borda-sutil bg-muted/20 hover:bg-muted/30 hover:border-indigo-500/30"}`}
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
                        className={`text-sm font-bold flex items-center gap-2 ${betaOrcamentosMagicos ? "text-indigo-600 dark:text-indigo-400" : "text-primary"}`}
                      >
                        <Share2
                          size={16}
                          className={betaOrcamentosMagicos ? "text-indigo-500" : "text-muted-foreground"}
                        />{" "}
                        Orçamentos Mágicos
                      </h4>
                      <p
                        className={`text-[11px] mt-0.5 leading-relaxed ${betaOrcamentosMagicos ? "text-indigo-700 dark:text-indigo-300/80" : "text-muted-foreground"}`}
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
                  <div className="mx-2 p-4 rounded-xl bg-muted/30 border border-borda-sutil animate-in zoom-in-95 duration-200 space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Personalizar Mensagem WhatsApp
                    </label>
                    <textarea 
                      value={templateOrcamento}
                      onChange={(e) => definirTemplateOrcamento(e.target.value)}
                      rows={5}
                      className="w-full p-3 rounded-lg bg-card border border-borda-sutil text-xs text-primary focus:border-indigo-500 transition-all resize-none"
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
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${betaEstoqueInteligente ? "border-indigo-500 bg-indigo-500/10" : "border-borda-sutil bg-muted/20 hover:bg-muted/30 hover:border-indigo-500/30"}`}
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
                        className={`text-sm font-bold flex items-center gap-2 ${betaEstoqueInteligente ? "text-indigo-600 dark:text-indigo-400" : "text-primary"}`}
                      >
                        <PackageSearch
                          size={16}
                          className={betaEstoqueInteligente ? "text-indigo-500" : "text-muted-foreground"}
                        />{" "}
                        Estoque Inteligente
                      </h4>
                      <p
                        className={`text-[11px] mt-0.5 leading-relaxed ${betaEstoqueInteligente ? "text-indigo-700 dark:text-indigo-300/80" : "text-muted-foreground"}`}
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
                  <div className="mx-2 p-4 rounded-xl bg-muted/30 border border-borda-sutil animate-in zoom-in-95 duration-200 space-y-4">
                    <div className="flex items-center justify-between">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
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
                      className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                      <span>Mín: 50g</span>
                      <span>Máx: 2kg</span>
                    </div>
                  </div>
                )}

                {/* SIMULADOR MARGEM */}
                <div
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${betaSimuladorMargem ? "border-indigo-500 bg-indigo-500/10" : "border-borda-sutil bg-muted/20 hover:bg-muted/30 hover:border-indigo-500/30"}`}
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
                        className={`text-sm font-bold flex items-center gap-2 ${betaSimuladorMargem ? "text-indigo-600 dark:text-indigo-400" : "text-primary"}`}
                      >
                        <TrendingUp
                          size={16}
                          className={betaSimuladorMargem ? "text-indigo-500" : "text-muted-foreground"}
                        />{" "}
                        Simulador de Margem DRE
                      </h4>
                      <p
                        className={`text-[11px] mt-0.5 leading-relaxed ${betaSimuladorMargem ? "text-indigo-700 dark:text-indigo-300/80" : "text-muted-foreground"}`}
                      >
                        Estresse seus preços e veja simulações do impacto de custos na sua lucratividade.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* FEEDBACK BETA */}
            <div className="pt-4 border-t border-borda-sutil flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
               <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1"><MessageCircle size={12}/> Seu Feedback é Ouro</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Encontrou um erro ou tem uma ideia para o LAB? Fale direto com o desenvolvedor.</p>
               </div>
               <a 
                 href="mailto:suporte@printlog.com.br?subject=[BETA]%20Feedback%20do%20Laborat%C3%B3rio"
                 className="px-6 py-2.5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shrink-0"
               >
                 Enviar Feedback
               </a>
            </div>
          </div>
        )}
      </div>
      )}

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
              className="px-4 py-2.5 rounded-xl border border-borda-sutil text-sm font-bold text-muted-foreground hover:bg-muted/40 transition-all"
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
