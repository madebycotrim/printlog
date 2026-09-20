import { 
  Beaker, 
  Building2, 
  Settings2, 
  AlertTriangle, 
  ShieldCheck, 
  Zap, 
  Share2, 
  PackageSearch, 
  TrendingUp, 
  MessageCircle, 
  Lock, 
  ArrowRight,
  Plus,
  Users,
  Trash2,
  ExternalLink,
  Send,
  UserPlus
} from "lucide-react";
import { useState } from "react";
import { CabecalhoCard } from "./Compartilhados";
import { useEstudio } from "@/funcionalidades/beta/multi_estudos/contextos/ContextoEstudio";
import { Dialogo } from "@/compartilhado/componentes";
import { useArmazemConfiguracoes } from "../estado/armazemConfiguracoes";
import { CorPrimaria } from "@/compartilhado/tipos/modelos";
import { toast } from "sonner";


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
  const { 
    estudioAtivo, 
    estudios, 
    definirEstudioAtivo, 
    criarEstudio, 
    removerEstudio, 
    adicionarMembro, 
    removerMembro 
  } = useEstudio();
  const [mostrarConfigEstudio, setMostrarConfigEstudio] = useState(false);
  const [mostrarConfigOrcamento, setMostrarConfigOrcamento] = useState(false);
  const [mostrarConfigEstoque, setMostrarConfigEstoque] = useState(false);
  const [mostrarModalConfirmacao, setMostrarModalConfirmacao] = useState(false);

  // Estados Multi-Estúdios
  const [modalCriarEstudioAberto, setModalCriarEstudioAberto] = useState(false);
  const [nomeNovoEstudio, setNomeNovoEstudio] = useState("");
  const [corNovoEstudio, setCorNovoEstudio] = useState<CorPrimaria>("sky");
  const [modalMembrosAberto, setModalMembrosAberto] = useState(false);
  const [emailNovoMembro, setEmailNovoMembro] = useState("");
  const [papelNovoMembro, setPapelNovoMembro] = useState<"OPERADOR" | "ADMIN">("OPERADOR");

  // Estado Orçamentos Mágicos
  const [telefoneWhatsApp, setTelefoneWhatsApp] = useState("");

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
                  <div className="mx-2 p-4 rounded-xl bg-muted/30 border border-borda-sutil animate-in zoom-in-95 duration-200 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Selecione o Estúdio Ativo
                        </label>
                        <p className="text-[11px] text-muted-foreground">
                          Estúdio atual: <strong className="text-primary">{estudioAtivo?.nome}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setModalMembrosAberto(true)}
                          className="h-8 px-3 rounded-lg border border-borda-sutil bg-card text-muted-foreground hover:text-primary text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm"
                        >
                          <Users size={12} />
                          Operadores ({estudioAtivo?.membros?.length || 0})
                        </button>
                        <button
                          onClick={() => {
                            setNomeNovoEstudio("");
                            setCorNovoEstudio("sky");
                            setModalCriarEstudioAberto(true);
                          }}
                          className="h-8 px-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all active:scale-95"
                        >
                          <Plus size={12} />
                          Novo Estúdio
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {estudios.map((estudio) => {
                        const ehAtivo = estudio.id === estudioAtivo?.id;
                        return (
                          <div
                            key={estudio.id}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                              ehAtivo
                                ? "border-indigo-500 bg-card text-indigo-600 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-500/30"
                                : "border-borda-sutil bg-card/60 text-muted-foreground hover:border-indigo-500/30"
                            }`}
                          >
                            <button
                              onClick={() => definirEstudioAtivo(estudio.id)}
                              className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
                            >
                              <div
                                className={`w-3 h-3 rounded-full shrink-0 ${ehAtivo ? "bg-indigo-500 ring-2 ring-indigo-500/20" : "bg-muted-foreground/30"}`}
                              />
                              <div className="truncate">
                                <span className="font-bold text-xs truncate block text-primary">{estudio.nome}</span>
                                <span className="text-[9px] text-muted-foreground block">
                                  {estudio.membros?.length || 0} membros
                                </span>
                              </div>
                            </button>

                            {!ehAtivo && estudios.length > 1 && (
                              <button
                                onClick={() => removerEstudio(estudio.id)}
                                className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-rose-500 hover:bg-rose-500/10 transition-all ml-1 shrink-0"
                                title="Excluir estúdio"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
                      * Cada estúdio mantém clientes, estoque e fila de impressão totalmente segmentados.
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
                        Gere mensagens dinâmicas e links instantâneos para fechamento de vendas via WhatsApp.
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
                  <div className="mx-2 p-4 rounded-xl bg-muted/30 border border-borda-sutil animate-in zoom-in-95 duration-200 space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        WhatsApp do Estúdio (opcional para envio direto)
                      </label>
                      <input 
                        type="text"
                        value={telefoneWhatsApp}
                        onChange={(e) => setTelefoneWhatsApp(e.target.value)}
                        placeholder="Ex: 5511999999999"
                        className="h-10 w-full max-w-sm px-3 rounded-lg bg-card border border-borda-sutil text-xs text-primary outline-none focus:border-indigo-500 transition-all font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Template da Mensagem WhatsApp
                        </label>
                        <span className="text-[9px] text-muted-foreground">Clique nas tags para copiar</span>
                      </div>
                      <textarea 
                        value={templateOrcamento}
                        onChange={(e) => definirTemplateOrcamento(e.target.value)}
                        rows={4}
                        className="w-full p-3 rounded-lg bg-card border border-borda-sutil text-xs text-primary focus:border-indigo-500 transition-all resize-none font-sans leading-relaxed"
                        placeholder="Olá {cliente}, seu orçamento do projeto {projeto} ficou em {valor}..."
                      />
                      <div className="flex gap-1.5 flex-wrap">
                        {["{estudio}", "{cliente}", "{projeto}", "{valor}", "{link}"].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => definirTemplateOrcamento(`${templateOrcamento} ${tag}`)}
                            className="px-2 py-0.5 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* PRÉVIA AO VIVO DA MENSAGEM */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-wider text-muted-foreground block">
                        Prévia da Mensagem (Exemplo Real):
                      </label>
                      <div className="p-3.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed font-sans whitespace-pre-wrap">
                        {(templateOrcamento || "Olá {cliente}, aqui é do {estudio}! Seu orçamento para {projeto} ficou em {valor}. Veja o pedido completo: {link}")
                          .replace("{estudio}", estudioAtivo?.nome || "Estúdio Maker")
                          .replace("{cliente}", "João Silva")
                          .replace("{projeto}", "Luminária Voronoi 3D")
                          .replace("{valor}", "R$ 85,00")
                          .replace("{link}", "https://printlog.com.br/o/exemplo")}
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const msgPronta = (templateOrcamento || "Olá {cliente}, aqui é do {estudio}! Seu orçamento para {projeto} ficou em {valor}. Veja o pedido completo: {link}")
                            .replace("{estudio}", estudioAtivo?.nome || "Estúdio Maker")
                            .replace("{cliente}", "Cliente Teste")
                            .replace("{projeto}", "Protótipo 3D")
                            .replace("{valor}", "R$ 120,00")
                            .replace("{link}", "https://printlog.com.br/o/teste");
                          
                          const numeroLimpo = telefoneWhatsApp.replace(/\D/g, "");
                          const url = numeroLimpo 
                            ? `https://wa.me/${numeroLimpo}?text=${encodeURIComponent(msgPronta)}`
                            : `https://wa.me/?text=${encodeURIComponent(msgPronta)}`;
                          window.open(url, "_blank");
                          toast.success("Abrindo prévia no WhatsApp!");
                        }}
                        className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
                      >
                        <Send size={12} />
                        Testar no WhatsApp
                        <ExternalLink size={11} />
                      </button>
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

      {/* MODAL CRIAR NOVO ESTÚDIO */}
      <Dialogo
        aberto={modalCriarEstudioAberto}
        aoFechar={() => setModalCriarEstudioAberto(false)}
        titulo="Criar Novo Estúdio"
        larguraMax="max-w-md"
      >
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Nome do Estúdio
            </label>
            <input
              type="text"
              value={nomeNovoEstudio}
              onChange={(e) => setNomeNovoEstudio(e.target.value)}
              placeholder="Ex: PrintLog Filial Sul"
              className="h-11 w-full px-3 rounded-xl bg-card border border-borda-sutil text-sm font-bold text-primary outline-none focus:border-indigo-500 transition-all"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Cor de Destaque
            </label>
            <div className="flex gap-2">
              {[
                { id: "sky" as CorPrimaria, bg: "bg-sky-500" },
                { id: "emerald" as CorPrimaria, bg: "bg-emerald-500" },
                { id: "indigo" as CorPrimaria, bg: "bg-indigo-500" },
                { id: "violet" as CorPrimaria, bg: "bg-violet-500" },
                { id: "amber" as CorPrimaria, bg: "bg-amber-500" },
                { id: "rose" as CorPrimaria, bg: "bg-rose-500" },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCorNovoEstudio(c.id)}
                  className={`w-7 h-7 rounded-full ${c.bg} transition-all hover:scale-110 active:scale-95 ${
                    corNovoEstudio === c.id ? "ring-2 ring-offset-2 ring-indigo-500 scale-110" : ""
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalCriarEstudioAberto(false)}
              className="h-11 rounded-xl border border-borda-sutil text-xs font-bold text-muted-foreground hover:bg-muted/40 transition-all uppercase tracking-wider"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!nomeNovoEstudio.trim()) {
                  toast.error("Insira o nome do estúdio.");
                  return;
                }
                await criarEstudio(nomeNovoEstudio, corNovoEstudio);
                setModalCriarEstudioAberto(false);
              }}
              className="h-11 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-all uppercase tracking-wider shadow-lg shadow-indigo-500/25 active:scale-95"
            >
              Criar Estúdio
            </button>
          </div>
        </div>
      </Dialogo>

      {/* MODAL OPERADORES E MEMBROS */}
      <Dialogo
        aberto={modalMembrosAberto}
        aoFechar={() => setModalMembrosAberto(false)}
        titulo={`Equipe & Operadores: ${estudioAtivo?.nome || "Estúdio"}`}
        larguraMax="max-w-lg"
      >
        <div className="p-6 space-y-6">
          {/* Adicionar Membro */}
          <div className="p-4 rounded-xl bg-muted/30 border border-borda-sutil space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
              Convidar Novo Operador
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={emailNovoMembro}
                onChange={(e) => setEmailNovoMembro(e.target.value)}
                placeholder="email.do.operador@exemplo.com"
                className="h-10 flex-1 px-3 rounded-xl bg-card border border-borda-sutil text-xs text-primary outline-none focus:border-indigo-500 transition-all font-mono"
              />
              <select
                value={papelNovoMembro}
                onChange={(e) => setPapelNovoMembro(e.target.value as "OPERADOR" | "ADMIN")}
                className="h-10 px-3 rounded-xl bg-card border border-borda-sutil text-xs font-bold text-primary outline-none"
              >
                <option value="OPERADOR">Operador</option>
                <option value="ADMIN">Administrador</option>
              </select>
              <button
                type="button"
                onClick={async () => {
                  if (!emailNovoMembro.trim() || !emailNovoMembro.includes("@")) {
                    toast.error("Insira um e-mail válido.");
                    return;
                  }
                  if (!estudioAtivo?.id) return;
                  try {
                    await adicionarMembro(estudioAtivo.id, emailNovoMembro, papelNovoMembro);
                    setEmailNovoMembro("");
                  } catch (err: any) {
                    toast.error(err?.message || "Falha ao adicionar membro.");
                  }
                }}
                className="h-10 px-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
              >
                <UserPlus size={13} />
                Adicionar
              </button>
            </div>
          </div>

          {/* Lista de Membros */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
              Membros Cadastrados ({estudioAtivo?.membros?.length || 0})
            </label>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {(estudioAtivo?.membros && estudioAtivo.membros.length > 0) ? (
                estudioAtivo.membros.map((m) => (
                  <div
                    key={m.email}
                    className="p-3 rounded-xl bg-card border border-borda-sutil flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="truncate">
                      <p className="font-bold text-primary truncate font-mono text-[11px]">{m.email}</p>
                      <p className="text-[9px] text-muted-foreground">
                        Adicionado em {new Date(m.dataEntrada).toLocaleDateString("pt-BR")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        m.papel === "ADMIN" 
                          ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" 
                          : "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20"
                      }`}>
                        {m.papel}
                      </span>
                      {estudioAtivo && (
                        <button
                          type="button"
                          onClick={() => removerMembro(estudioAtivo.id, m.email)}
                          className="p-1 rounded text-muted-foreground hover:text-rose-500 transition-colors"
                          title="Remover operador"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-muted/20 border border-dashed border-borda-sutil text-center text-xs text-muted-foreground">
                  Nenhum operador adicional cadastrado neste estúdio.
                </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setModalMembrosAberto(false)}
              className="w-full h-11 rounded-xl bg-card border border-borda-sutil hover:bg-muted/40 text-primary text-xs font-bold transition-all uppercase tracking-wider"
            >
              Fechar
            </button>
          </div>
        </div>
      </Dialogo>
    </div>
  );
}
