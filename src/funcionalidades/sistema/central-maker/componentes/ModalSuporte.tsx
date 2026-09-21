import { useState, useEffect } from "react";
import { Dialogo } from "@/compartilhado/componentes";
import { 
  Headphones, 
  X, 
  MessageSquarePlus, 
  Inbox, 
  Send, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Bug, 
  HelpCircle, 
  Lightbulb, 
  CreditCard, 
  AlertTriangle,
  RefreshCw,
  MessageCircle
} from "lucide-react";
import { servicoBaseApi } from "@/compartilhado/servicos/servicoBaseApi";
import { toast } from "sonner";
import { formatarData } from "@/compartilhado/utilitarios/formatadores";

interface Propriedades {
  aberto: boolean;
  aoFechar: () => void;
}

export interface ChamadoSuporte {
  id: string;
  assunto: string;
  categoria: string;
  prioridade: string;
  status: "aberto" | "em_analise" | "respondido" | "resolvido" | "fechado";
  mensagem: string;
  resposta_admin?: string;
  respondido_por?: string;
  data_criacao: string;
  data_resposta?: string;
  data_atualizacao: string;
}

export function ModalSuporte({ aberto, aoFechar }: Propriedades) {
  const [abaAtiva, setAbaAtiva] = useState<"novo" | "meus_chamados">("novo");
  const [chamados, setChamados] = useState<ChamadoSuporte[]>([]);
  const [carregandoChamados, setCarregandoChamados] = useState(false);
  const [chamadoSelecionado, setChamadoSelecionado] = useState<ChamadoSuporte | null>(null);

  // Form State
  const [assunto, setAssunto] = useState("");
  const [categoria, setCategoria] = useState<string>("duvida");
  const [prioridade, setPrioridade] = useState<string>("normal");
  const [mensagem, setMensagem] = useState("");
  const [incluirDiagnostico, setIncluirDiagnostico] = useState(true);
  const [enviando, setEnviando] = useState(false);

  // Carregar chamados do usuário
  const carregarChamados = async () => {
    setCarregandoChamados(true);
    try {
      const dados = await servicoBaseApi.get<ChamadoSuporte[]>("/api/suporte");
      setChamados(dados || []);
    } catch {
      // Silencioso na inicialização
    } finally {
      setCarregandoChamados(false);
    }
  };

  useEffect(() => {
    if (aberto) {
      carregarChamados();
    }
  }, [aberto]);

  const enviarChamado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assunto.trim() || !mensagem.trim()) {
      toast.error("Preencha o assunto e a descrição da sua solicitação.");
      return;
    }

    setEnviando(true);
    try {
      let anexoContexto = undefined;
      if (incluirDiagnostico) {
        anexoContexto = JSON.stringify({
          userAgent: navigator.userAgent,
          tela: `${window.innerWidth}x${window.innerHeight}`,
          urlAtual: window.location.pathname,
          plataforma: navigator.platform,
        });
      }

      await servicoBaseApi.post("/api/suporte", {
        assunto: assunto.trim(),
        categoria,
        prioridade,
        mensagem: mensagem.trim(),
        anexoContexto,
      });

      toast.success("Chamado enviado diretamente para a equipe técnica!");
      setAssunto("");
      setMensagem("");
      setPrioridade("normal");
      setCategoria("duvida");
      await carregarChamados();
      setAbaAtiva("meus_chamados");
    } catch (erro: any) {
      toast.error(erro.message || "Erro ao registrar chamado. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  const getStatusBadge = (status: ChamadoSuporte["status"]) => {
    switch (status) {
      case "aberto":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Clock size={12} /> Aberto
          </span>
        );
      case "em_analise":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Sparkles size={12} /> Em Análise
          </span>
        );
      case "respondido":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 animate-pulse">
            <CheckCircle2 size={12} /> Respondido
          </span>
        );
      case "resolvido":
      case "fechado":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
            <CheckCircle2 size={12} /> Resolvido
          </span>
        );
    }
  };

  const getIconeCategoria = (cat: string) => {
    switch (cat) {
      case "bug": return <Bug size={14} className="text-rose-500" />;
      case "duvida": return <HelpCircle size={14} className="text-sky-500" />;
      case "sugestao": return <Lightbulb size={14} className="text-amber-500" />;
      case "financeiro": return <CreditCard size={14} className="text-emerald-500" />;
      case "emergencia": return <AlertTriangle size={14} className="text-red-500" />;
      default: return <HelpCircle size={14} className="text-zinc-400" />;
    }
  };

  const chamadosComRespostaNaoLida = chamados.filter(c => c.status === "respondido").length;

  return (
    <Dialogo aberto={aberto} aoFechar={aoFechar} esconderCabecalho={true} larguraMax="max-w-4xl" semScroll={true}>
      <div className="flex flex-col h-[85vh] max-h-[750px] overflow-hidden w-full">
        
        {/* CABEÇALHO PADRÃO PRINTLOG */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-borda-sutil bg-card shrink-0">
          <div className="flex items-center gap-3.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border"
              style={{
                backgroundColor: "var(--cor-primaria-opaca, rgba(14,165,233,0.1))",
                color: "var(--cor-primaria, #0ea5e9)",
                borderColor: "var(--cor-primaria-opaca, rgba(14,165,233,0.2))",
              }}
            >
              <Headphones size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black uppercase tracking-tight text-primary">
                  Suporte Interno PrintLog
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-sky-500/10 text-sky-500 border border-sky-500/20">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Fale diretamente com os fundadores e engenheiros da plataforma.
              </p>
            </div>
          </div>

          <button
            onClick={aoFechar}
            className="w-8 h-8 rounded-lg text-zinc-500 hover:text-primary dark:hover:text-zinc-200 transition-all bg-zinc-100 dark:bg-zinc-900/40 border border-borda-sutil flex items-center justify-center cursor-pointer active:scale-95"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>

        {/* NAVEGAÇÃO POR ABAS INTERNAS */}
        <div className="px-6 pt-3 flex items-center gap-2 border-b border-borda-sutil bg-card shrink-0">
          <button
            onClick={() => { setAbaAtiva("novo"); setChamadoSelecionado(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              abaAtiva === "novo"
                ? "border-sky-500 text-sky-500 bg-sky-500/5"
                : "border-transparent text-muted-foreground hover:text-primary"
            }`}
          >
            <MessageSquarePlus size={15} />
            <span>Novo Chamado</span>
          </button>

          <button
            onClick={() => { setAbaAtiva("meus_chamados"); setChamadoSelecionado(null); carregarChamados(); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 relative ${
              abaAtiva === "meus_chamados"
                ? "border-sky-500 text-sky-500 bg-sky-500/5"
                : "border-transparent text-muted-foreground hover:text-primary"
            }`}
          >
            <Inbox size={15} />
            <span>Meus Chamados</span>
            {chamados.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-zinc-200 dark:bg-white/10 text-zinc-700 dark:text-zinc-300">
                {chamados.length}
              </span>
            )}
            {chamadosComRespostaNaoLida > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            )}
          </button>
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/50 dark:bg-black/20">
          {abaAtiva === "novo" && (
            <form onSubmit={enviarChamado} className="max-w-2xl mx-auto space-y-5">
              
              {/* Assunto */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                  Assunto da Solicitação *
                </label>
                <input
                  type="text"
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                  placeholder="Ex: Dúvida sobre cálculo de kWh ou Erro ao concluir pedido..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181e] text-gray-900 dark:text-white text-xs placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
                  maxLength={150}
                  required
                />
              </div>

              {/* Categoria e Prioridade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                    Categoria
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181e] text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
                  >
                    <option value="duvida">❓ Dúvida de Uso do Sistema</option>
                    <option value="bug">🐛 Relato de Bug / Erro Técnico</option>
                    <option value="sugestao">💡 Sugestão de Nova Funcionalidade</option>
                    <option value="financeiro">💳 Plano / Pagamento</option>
                    <option value="emergencia">🚨 Emergência Operacional</option>
                    <option value="outro">💬 Outro Assunto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                    Urgência
                  </label>
                  <select
                    value={prioridade}
                    onChange={(e) => setPrioridade(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181e] text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
                  >
                    <option value="baixa">Baixa (Posso aguardar)</option>
                    <option value="normal">Normal (Fluxo regular)</option>
                    <option value="alta">Alta (Impacta minha rotina)</option>
                    <option value="urgente">Urgente (Bloqueou minha produção)</option>
                  </select>
                </div>
              </div>

              {/* Mensagem */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                  Descrição Detalhada *
                </label>
                <textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  rows={6}
                  placeholder="Descreva com detalhes o que aconteceu, o que esperava ou sua sugestão. Se for um erro, informe os passos que executou..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181e] text-gray-900 dark:text-white text-xs placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all resize-none"
                  required
                />
              </div>

              {/* Switch de Diagnóstico Automático */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-[#18181e] border border-gray-200/80 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <Sparkles size={16} className="text-sky-500 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                      Anexar Diagnóstico Técnico Automático
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-zinc-500">
                      Inclui versão do navegador, resolução de tela e rota atual para agilizar a solução.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={incluirDiagnostico}
                  onChange={(e) => setIncluirDiagnostico(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500/30 border-gray-300 dark:border-zinc-700 cursor-pointer"
                />
              </div>

              {/* Botão Enviar */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={enviando}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send size={15} />
                  <span>{enviando ? "Enviando Chamado..." : "Enviar Chamado para o Suporte"}</span>
                </button>
              </div>
            </form>
          )}

          {abaAtiva === "meus_chamados" && (
            <div className="max-w-3xl mx-auto">
              {carregandoChamados ? (
                <div className="p-12 flex flex-col items-center justify-center gap-3 text-gray-400">
                  <RefreshCw size={24} className="animate-spin text-sky-500" />
                  <p className="text-xs">Carregando seus chamados...</p>
                </div>
              ) : chamados.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#18181e] border border-gray-200/80 dark:border-white/5 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">Nenhum chamado aberto</h4>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-sm mx-auto">
                    Você ainda não registrou chamados de suporte. Quando precisar de ajuda, abra um chamado pela aba "Novo Chamado".
                  </p>
                  <button
                    onClick={() => setAbaAtiva("novo")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-bold hover:bg-sky-600 transition-colors"
                  >
                    <MessageSquarePlus size={14} />
                    <span>Criar Primeiro Chamado</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {chamados.map((c) => {
                    const expandido = chamadoSelecionado?.id === c.id;
                    return (
                      <div
                        key={c.id}
                        className={`rounded-2xl border transition-all overflow-hidden ${
                          expandido
                            ? "bg-white dark:bg-[#18181e] border-sky-500/40 shadow-xl"
                            : "bg-white dark:bg-[#18181e] border-gray-200/80 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/15"
                        }`}
                      >
                        {/* Header do Card */}
                        <div
                          onClick={() => setChamadoSelecionado(expandido ? null : c)}
                          className="p-4 flex items-center justify-between cursor-pointer gap-4"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 shrink-0">
                              {getIconeCategoria(c.categoria)}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                {c.assunto}
                              </h4>
                              <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">
                                Aberto em {formatarData(new Date(c.data_criacao))} · Protocolo #{c.id.slice(0, 8)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {getStatusBadge(c.status)}
                          </div>
                        </div>

                        {/* Detalhes / Diálogo Expandido */}
                        {expandido && (
                          <div className="px-5 pb-5 pt-2 border-t border-gray-100 dark:border-white/5 space-y-4 text-xs">
                            {/* Mensagem do Usuário */}
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1.5">
                                <MessageCircle size={12} /> Sua Mensagem:
                              </p>
                              <p className="text-gray-700 dark:text-zinc-200 whitespace-pre-line leading-relaxed">
                                {c.mensagem}
                              </p>
                            </div>

                            {/* Resposta do Suporte / Admin */}
                            {c.resposta_admin ? (
                              <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-950 dark:text-sky-100">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-[11px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                                    <Headphones size={13} /> Resposta Oficial do Suporte PrintLog:
                                  </p>
                                  {c.data_resposta && (
                                    <span className="text-[10px] text-gray-400">
                                      {formatarData(new Date(c.data_resposta))}
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-800 dark:text-zinc-200 whitespace-pre-line leading-relaxed font-medium">
                                  {c.resposta_admin}
                                </p>
                              </div>
                            ) : (
                              <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center gap-2.5 text-[11px]">
                                <Clock size={15} className="shrink-0" />
                                <span>
                                  Sua solicitação está na fila da equipe técnica e será respondida no Console em breve.
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Dialogo>
  );
}
