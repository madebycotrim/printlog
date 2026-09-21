import { useState, useEffect, useCallback } from "react";
import { 
  Headphones, 
  Search, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Bug, 
  HelpCircle, 
  Lightbulb, 
  CreditCard, 
  AlertTriangle,
  Send, 
  X, 
  Copy, 
  Check, 
  ExternalLink,
  MessageSquare,
  User,
  Laptop
} from "lucide-react";
import { servicoBaseApi } from "@/compartilhado/servicos/servicoBaseApi";
import { toast } from "sonner";
import { formatarData } from "@/compartilhado/utilitarios/formatadores";

export interface ChamadoAdmin {
  id: string;
  id_usuario: string;
  email_usuario?: string;
  nome_usuario?: string;
  assunto: string;
  categoria: string;
  prioridade: "baixa" | "normal" | "alta" | "urgente";
  status: "aberto" | "em_analise" | "respondido" | "resolvido" | "fechado";
  mensagem: string;
  anexo_contexto?: string;
  resposta_admin?: string;
  respondido_por?: string;
  data_criacao: string;
  data_resposta?: string;
  data_atualizacao: string;
}

interface StatsSuporte {
  total: number;
  abertos: number;
  emAnalise: number;
  respondidos: number;
  resolvidos: number;
}

interface Propriedades {
  modoPrivacidade?: boolean;
}

export function AbaAdminSuporte({ modoPrivacidade = false }: Propriedades) {
  const [chamados, setChamados] = useState<ChamadoAdmin[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [stats, setStats] = useState<StatsSuporte>({
    total: 0,
    abertos: 0,
    emAnalise: 0,
    respondidos: 0,
    resolvidos: 0,
  });

  // Filtros
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("TODAS");

  // Atendimento / Modal
  const [chamadoAtivo, setChamadoAtivo] = useState<ChamadoAdmin | null>(null);
  const [respostaTexto, setRespostaTexto] = useState("");
  const [novoStatus, setNovoStatus] = useState<ChamadoAdmin["status"]>("respondido");
  const [salvandoResposta, setSalvandoResposta] = useState(false);
  const [itemCopiado, setItemCopiado] = useState<string | null>(null);

  const carregarChamados = useCallback(async () => {
    setCarregando(true);
    try {
      const queryParams = new URLSearchParams();
      if (filtroStatus !== "TODOS") queryParams.append("status", filtroStatus);
      if (filtroCategoria !== "TODAS") queryParams.append("categoria", filtroCategoria);
      if (busca.trim()) queryParams.append("busca", busca.trim());

      const res = await servicoBaseApi.get<{
        estatisticas: StatsSuporte;
        chamados: ChamadoAdmin[];
      }>(`/api/admin/suporte?${queryParams.toString()}`);

      if (res) {
        setChamados(res.chamados || []);
        if (res.estatisticas) setStats(res.estatisticas);
      }
    } catch {
      toast.error("Erro ao carregar lista de chamados de suporte.");
    } finally {
      setCarregando(false);
    }
  }, [filtroStatus, filtroCategoria, busca]);

  useEffect(() => {
    carregarChamados();
  }, [carregarChamados]);

  const abrirAtendimento = (chamado: ChamadoAdmin) => {
    setChamadoAtivo(chamado);
    setRespostaTexto(chamado.resposta_admin || "");
    setNovoStatus(chamado.status === "aberto" ? "respondido" : chamado.status);
  };

  const salvarResposta = async () => {
    if (!chamadoAtivo) return;
    if (!respostaTexto.trim()) {
      toast.error("Por favor, digite a resposta para o usuário.");
      return;
    }

    setSalvandoResposta(true);
    try {
      await servicoBaseApi.patch("/api/admin/suporte", {
        idChamado: chamadoAtivo.id,
        respostaAdmin: respostaTexto.trim(),
        novoStatus,
      });

      toast.success("Resposta gravada com sucesso! O usuário já pode vê-la no app.");
      setChamadoAtivo(null);
      await carregarChamados();
    } catch (erro: any) {
      toast.error(erro.message || "Falha ao gravar resposta.");
    } finally {
      setSalvandoResposta(false);
    }
  };

  const copiarTexto = async (texto: string, chave: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      setItemCopiado(chave);
      toast.success("Copiado para a área de transferência!");
      setTimeout(() => setItemCopiado(null), 2000);
    } catch {
      toast.error("Não foi possível copiar.");
    }
  };

  const aplicarRespostaRapida = (texto: string) => {
    setRespostaTexto((prev) => (prev ? `${prev}\n\n${texto}` : texto));
  };

  const getStatusBadge = (status: ChamadoAdmin["status"]) => {
    switch (status) {
      case "aberto":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Clock size={11} /> Aberto
          </span>
        );
      case "em_analise":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Sparkles size={11} /> Em Análise
          </span>
        );
      case "respondido":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
            <CheckCircle2 size={11} /> Respondido
          </span>
        );
      case "resolvido":
      case "fechado":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
            <CheckCircle2 size={11} /> Resolvido
          </span>
        );
    }
  };

  const getPrioridadeBadge = (p: ChamadoAdmin["prioridade"]) => {
    switch (p) {
      case "urgente":
        return <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-red-500/10 text-red-500 border border-red-500/30">Urgente</span>;
      case "alta":
        return <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/10 text-amber-500 border border-amber-500/30">Alta</span>;
      case "normal":
        return <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-zinc-500/10 text-zinc-400">Normal</span>;
      case "baixa":
        return <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-zinc-500/5 text-zinc-400">Baixa</span>;
    }
  };

  const getIconeCategoria = (cat: string) => {
    switch (cat) {
      case "bug": return <Bug size={13} className="text-rose-500" />;
      case "duvida": return <HelpCircle size={13} className="text-sky-500" />;
      case "sugestao": return <Lightbulb size={13} className="text-amber-500" />;
      case "financeiro": return <CreditCard size={13} className="text-emerald-500" />;
      case "emergencia": return <AlertTriangle size={13} className="text-red-500" />;
      default: return <MessageSquare size={13} className="text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* KPIS DE SUPORTE NO TOPO */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-card border border-borda-sutil flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-zinc-500/10 text-zinc-500 flex items-center justify-center shrink-0">
            <Headphones size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Total</p>
            <p className="text-xl font-black text-zinc-900 dark:text-white leading-tight">{stats.total}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-amber-500/30 bg-amber-500/5 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest leading-none mb-1">Abertos</p>
            <p className="text-xl font-black text-amber-600 dark:text-amber-400 leading-tight">{stats.abertos}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-borda-sutil flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none mb-1">Em Análise</p>
            <p className="text-xl font-black text-blue-500 leading-tight">{stats.emAnalise}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-emerald-500/30 bg-emerald-500/5 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none mb-1">Respondidos</p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 leading-tight">{stats.respondidos}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-borda-sutil flex items-center gap-3 shadow-sm col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-zinc-500/10 text-zinc-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Resolvidos</p>
            <p className="text-xl font-black text-zinc-400 leading-tight">{stats.resolvidos}</p>
          </div>
        </div>
      </div>

      {/* BARRA DE BUSCA E FILTROS */}
      <div className="p-4 rounded-2xl bg-card border border-borda-sutil shadow-sm flex flex-col md:flex-row items-center justify-between gap-3.5">
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por assunto, e-mail ou estúdio..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-muted/40 border border-borda-sutil text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-primaria"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-muted/40 border border-borda-sutil text-xs font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-primaria"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="aberto">Apenas Abertos</option>
            <option value="em_analise">Em Análise</option>
            <option value="respondido">Respondidos</option>
            <option value="resolvido">Resolvidos</option>
          </select>

          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="px-3 py-2 rounded-xl bg-muted/40 border border-borda-sutil text-xs font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-primaria"
          >
            <option value="TODAS">Todas as Categorias</option>
            <option value="bug">🐛 Bugs / Falhas</option>
            <option value="duvida">❓ Dúvidas</option>
            <option value="sugestao">💡 Sugestões</option>
            <option value="financeiro">💳 Financeiro</option>
            <option value="emergencia">🚨 Emergência</option>
          </select>

          <button
            onClick={carregarChamados}
            disabled={carregando}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-primaria hover:bg-primaria/90 shadow-sm transition-all active:scale-95 disabled:opacity-50 ml-auto md:ml-0 cursor-pointer"
            title="Recarregar chamados"
          >
            <RefreshCw size={13} className={carregando ? "animate-spin" : ""} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* LISTAGEM DE CHAMADOS */}
      <div className="rounded-2xl bg-card border border-borda-sutil shadow-sm overflow-hidden">
        {carregando ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-zinc-400">
            <RefreshCw size={24} className="animate-spin text-primaria" />
            <p className="text-xs font-medium">Carregando fila de chamados...</p>
          </div>
        ) : chamados.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Nenhum chamado encontrado</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Todos os chamados com os filtros atuais foram atendidos ou não há novas solicitações.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-borda-sutil">
            {chamados.map((c) => {
              const emailExibicao = modoPrivacidade && c.email_usuario 
                ? c.email_usuario.replace(/(.{2})(.*)(?=@)/, "$1***") 
                : (c.email_usuario || "Anônimo");

              return (
                <div
                  key={c.id}
                  className="p-4 sm:p-5 hover:bg-muted/20 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  {/* Dados do Solicitante e Assunto */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(c.status)}
                      {getPrioridadeBadge(c.prioridade)}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-zinc-600 dark:text-zinc-400">
                        {getIconeCategoria(c.categoria)}
                        <span className="capitalize">{c.categoria}</span>
                      </span>
                      <span className="text-[10px] text-zinc-400 font-medium">
                        {formatarData(new Date(c.data_criacao))}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                      {c.assunto}
                    </h4>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {c.mensagem}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-[11px] text-zinc-400 font-medium">
                      <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-bold">
                        <User size={13} /> {c.nome_usuario || "Maker"}
                      </span>
                      <span>·</span>
                      <span className="truncate max-w-xs">{emailExibicao}</span>
                    </div>
                  </div>

                  {/* Ação de Atender */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => abrirAtendimento(c)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                        c.status === "aberto"
                          ? "bg-sky-500 text-white hover:bg-sky-600 shadow-md shadow-sky-500/20"
                          : "bg-muted hover:bg-muted/80 text-zinc-700 dark:text-zinc-300 border border-borda-sutil"
                      }`}
                    >
                      <MessageSquare size={14} />
                      <span>{c.status === "aberto" ? "Atender Chamado" : "Ver / Editar Resposta"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL / DRAWER DE ATENDIMENTO DO CHAMADO */}
      {chamadoAtivo && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-[#121217] rounded-3xl border border-borda-sutil shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header do Atendimento */}
            <div className="p-5 sm:p-6 border-b border-borda-sutil flex items-center justify-between bg-muted/20">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-sky-500 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                    Atendimento Console
                  </span>
                  {getStatusBadge(chamadoAtivo.status)}
                  {getPrioridadeBadge(chamadoAtivo.prioridade)}
                </div>
                <h3 className="text-base font-black text-zinc-900 dark:text-white truncate">
                  {chamadoAtivo.assunto}
                </h3>
              </div>

              <button
                onClick={() => setChamadoAtivo(null)}
                className="p-2 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Corpo do Atendimento */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              
              {/* Box de Informações do Maker */}
              <div className="p-4 rounded-2xl bg-muted/30 border border-borda-sutil flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Solicitante</p>
                  <p className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    {chamadoAtivo.nome_usuario || "Maker"} ({chamadoAtivo.email_usuario || "Sem email"})
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Aberto em {formatarData(new Date(chamadoAtivo.data_criacao))}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  {chamadoAtivo.email_usuario && (
                    <button
                      onClick={() => copiarTexto(chamadoAtivo.email_usuario!, "email")}
                      className="px-3 py-1.5 rounded-xl bg-card border border-borda-sutil hover:bg-muted text-[11px] font-bold text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      {itemCopiado === "email" ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                      <span>Copiar E-mail</span>
                    </button>
                  )}
                  {chamadoAtivo.email_usuario && (
                    <a
                      href={`mailto:${chamadoAtivo.email_usuario}?subject=Re: ${encodeURIComponent(chamadoAtivo.assunto)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-card border border-borda-sutil hover:bg-muted text-[11px] font-bold text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5"
                    >
                      <ExternalLink size={13} />
                      <span>Mailto</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Mensagem Original do Usuário */}
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2 block flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-primaria" />
                  Mensagem Enviada pelo Usuário:
                </label>
                <div className="p-4 rounded-2xl bg-card border border-borda-sutil text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-line leading-relaxed shadow-sm">
                  {chamadoAtivo.mensagem}
                </div>
              </div>

              {/* Diagnóstico Técnico Anexado (se houver) */}
              {chamadoAtivo.anexo_contexto && (
                <div className="p-3.5 rounded-xl bg-muted/40 border border-borda-sutil text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1">
                  <p className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Laptop size={13} /> Diagnóstico do Navegador e Ambiente:
                  </p>
                  <pre className="text-[10px] font-mono overflow-x-auto whitespace-pre-wrap">
                    {chamadoAtivo.anexo_contexto}
                  </pre>
                </div>
              )}

              {/* Respostas Rápidas / Smart Replies */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Respostas Rápidas Sugeridas:
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => aplicarRespostaRapida("Olá! Já verificamos a situação informada e aplicamos a correção necessária. Poderia recarregar sua página e testar novamente?")}
                    className="px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-muted text-[11px] font-medium text-zinc-600 dark:text-zinc-300 border border-borda-sutil transition-all cursor-pointer text-left"
                  >
                    🚀 Problema corrigido
                  </button>
                  <button
                    type="button"
                    onClick={() => aplicarRespostaRapida("Olá! Agradecemos muito por compartilhar essa sugestão com a nossa equipe. Anotamos o pedido e iremos priorizar no nosso roadmap de melhorias.")}
                    className="px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-muted text-[11px] font-medium text-zinc-600 dark:text-zinc-300 border border-borda-sutil transition-all cursor-pointer text-left"
                  >
                    💡 Sugestão anotada
                  </button>
                  <button
                    type="button"
                    onClick={() => aplicarRespostaRapida("Olá! Para resolver essa questão, por favor experimente limpar o cache do navegador ou efetuar o logout e login novamente no PrintLog.")}
                    className="px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-muted text-[11px] font-medium text-zinc-600 dark:text-zinc-300 border border-borda-sutil transition-all cursor-pointer text-left"
                  >
                    🛠️ Dica de limpeza de cache
                  </button>
                </div>
              </div>

              {/* Campo de Resposta Oficial do Administrador */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block flex items-center gap-1.5">
                    <Headphones size={14} className="text-sky-500" />
                    Resposta Oficial da Equipe PrintLog:
                  </label>
                  <span className="text-[10px] text-zinc-400">
                    Será visível instantaneamente para o usuário no app
                  </span>
                </div>

                <textarea
                  value={respostaTexto}
                  onChange={(e) => setRespostaTexto(e.target.value)}
                  rows={6}
                  placeholder="Escreva sua resposta de forma clara, prestativa e orientada à solução..."
                  className="w-full p-4 rounded-2xl bg-white dark:bg-[#18181e] border border-borda-sutil text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-primaria focus:ring-2 focus:ring-primaria/20 transition-all resize-none shadow-sm"
                />
              </div>

              {/* Seletor de Novo Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-muted/30 border border-borda-sutil">
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-0.5">
                    Atualizar Status do Chamado
                  </label>
                  <p className="text-[10px] text-zinc-400">
                    Defina o estágio atual após o envio desta resposta.
                  </p>
                </div>

                <select
                  value={novoStatus}
                  onChange={(e) => setNovoStatus(e.target.value as any)}
                  className="px-4 py-2 rounded-xl bg-card border border-borda-sutil text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-primaria"
                >
                  <option value="respondido">Respondido (Aguardando cliente)</option>
                  <option value="em_analise">Em Análise (Investigando)</option>
                  <option value="resolvido">Resolvido (Finalizado com sucesso)</option>
                  <option value="fechado">Fechado</option>
                </select>
              </div>

            </div>

            {/* Rodapé do Atendimento */}
            <div className="p-4 sm:p-5 border-t border-borda-sutil flex items-center justify-end gap-3 bg-muted/20">
              <button
                type="button"
                onClick={() => setChamadoAtivo(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-muted transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={salvandoResposta}
                onClick={salvarResposta}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Send size={14} />
                <span>{salvandoResposta ? "Gravando Resposta..." : "Salvar e Enviar Resposta"}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
