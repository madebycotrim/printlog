import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  ShieldCheck, 
  Users, 
  Crown, 
  Zap, 
  RefreshCw, 
  Copy, 
  Check, 
  Search, 
  Sparkles, 
  Clock, 
  Download, 
  Mail, 
  Gift, 
  AlertTriangle, 
  X, 
  ExternalLink, 
  Activity, 
  Megaphone, 
  Radio, 
  Send, 
  Eye, 
  Power, 
  Lock, 
  Trash2,
  Headphones
} from "lucide-react";
import { useDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { ehAdmin, EMAIL_DONO } from "@/compartilhado/constantes/admin";
import { PlanoUsuario } from "@/compartilhado/tipos/modelos";
import { servicoBaseApi } from "@/compartilhado/servicos/servicoBaseApi";
import { toast } from "sonner";
import { Carregamento } from "@/compartilhado/componentes";
import { EstadoVazio } from "@/compartilhado/componentes";
import { formatarData } from "@/compartilhado/utilitarios/formatadores";
import { mascararDadoPessoal } from "@/compartilhado/utilitarios/registrador";
import { AbaAdminSuporte } from "./componentes/AbaAdminSuporte";
import { AbaAdminBroadcast, TipoAviso } from "./componentes/AbaAdminBroadcast";

/**
 * Interface estritamente essencial para administração de acessos,
 * em total conformidade com o princípio da Minimização de Dados (LGPD Art. 6º, III).
 * Dados sensíveis de negócio (custos operacionais, taxas de máquina e margem de lucro)
 * são preservados sob sigilo comercial e isolados na conta do cliente.
 */
interface UsuarioAdmin {
  id_usuario: string;
  email?: string;
  nome_estudio: string;
  plano: PlanoUsuario;
  ciclo_pagamento?: "MENSAL" | "TRIMESTRAL" | "SEMESTRAL" | "ANUAL" | "VITALICIO" | "TRIAL";
  vencimento_plano?: string;
  atualizado_em: string;
}

const LIMITE_VAGAS_FUNDADOR = 51;

const obterStatusVencimento = (dataStr?: string, ciclo?: string) => {
  if (ciclo === "VITALICIO") return { texto: "Vitalício", cor: "text-blue-500", bg: "bg-blue-500/10", dias: 99999 };
  if (!dataStr) return { texto: "Sem vencimento", cor: "text-zinc-400", bg: "bg-zinc-500/10", dias: 99999 };
  
  const hoje = new Date();
  const venc = new Date(dataStr);
  const diffDias = Math.ceil((venc.getTime() - hoje.getTime()) / (1000 * 3600 * 24));

  if (diffDias < 0) return { texto: `Expirou há ${Math.abs(diffDias)}d`, cor: "text-rose-500", bg: "bg-rose-500/10", dias: diffDias };
  if (diffDias <= 7) return { texto: `Expira em ${diffDias}d`, cor: "text-amber-500", bg: "bg-amber-500/10", dias: diffDias };
  return { texto: `Expira: ${formatarData(venc)}`, cor: "text-emerald-500", bg: "bg-emerald-500/10", dias: diffDias };
};

/**
 * Console do Dono — Painel Administrativo de Gestão da Plataforma.
 * Gerenciamento de planos, métricas de adoção, aviso global e conformidade LGPD.
 */
export function PaginaAdmin() {
  const { usuario, carregando: carregandoAuth } = useAutenticacao();
  const [usuarios, definirUsuarios] = useState<UsuarioAdmin[]>([]);
  const [carregando, definirCarregando] = useState(true);
  const [busca, definirBusca] = useState("");
  const [filtroPlano, definirFiltroPlano] = useState<string>("TODOS");
  const [salvando, definirSalvando] = useState<string | null>(null);
  const [itemCopiado, definirItemCopiado] = useState<string | null>(null);
  const [usuarioSelecionado, definirUsuarioSelecionado] = useState<UsuarioAdmin | null>(null);

  // Modo Privacidade (Privacy by Default) — Mascaramento visual de PII
  const [modoPrivacidade, setModoPrivacidade] = useState(true);
  const [executandoLimpeza, setExecutandoLimpeza] = useState(false);

  // Estados do Aviso Global (Broadcast)
  const [avisoMensagem, setAvisoMensagem] = useState("");
  const [avisoTipo, setAvisoTipo] = useState<TipoAviso>("INFO");
  const [avisoLinkRotulo, setAvisoLinkRotulo] = useState("");
  const [avisoLinkUrl, setAvisoLinkUrl] = useState("");
  const [avisoAtivo, setAvisoAtivo] = useState(false);
  const [salvandoAviso, setSalvandoAviso] = useState(false);

  // Navegação por Abas no Console Admin
  const [abaAtiva, setAbaAtiva] = useState<"usuarios" | "suporte" | "avisos">("usuarios");
  const [chamadosAbertosCount, setChamadosAbertosCount] = useState(0);

  const acessoPermitido = ehAdmin(usuario?.email);

  // Busca de usuários com atualização atômica do usuário selecionado (sem dependência de ciclo)
  const buscarUsuarios = useCallback(async () => {
    definirCarregando(true);
    try {
      const dados = await servicoBaseApi.get<UsuarioAdmin[]>("/api/admin/usuarios");
      definirUsuarios(dados);
      
      // Atualiza o modal de detalhes caso esteja aberto, sem disparar recriação de callbacks
      definirUsuarioSelecionado((prev) => {
        if (!prev) return null;
        return dados.find((u) => u.id_usuario === prev.id_usuario) || null;
      });
    } catch {
      toast.error("Erro ao carregar lista de usuários da base.");
    } finally {
      definirCarregando(false);
    }
  }, []);

  const buscarAvisoGlobal = useCallback(async () => {
    try {
      const res = await servicoBaseApi.get<any>("/api/admin/aviso-global");
      if (res) {
        setAvisoMensagem(res.mensagem || "");
        setAvisoTipo(res.tipo || "INFO");
        setAvisoLinkRotulo(res.linkRotulo || "");
        setAvisoLinkUrl(res.linkUrl || "");
        setAvisoAtivo(Boolean(res.ativo));
      }
    } catch {
      // Falha silenciosa na leitura inicial do aviso
    }
  }, []);

  const carregarStatsSuporteRapido = useCallback(async () => {
    try {
      const res = await servicoBaseApi.get<any>("/api/admin/suporte");
      if (res?.estatisticas?.abertos !== undefined) {
        setChamadosAbertosCount(res.estatisticas.abertos);
      }
    } catch {
      // Silencioso
    }
  }, []);

  useEffect(() => {
    if (acessoPermitido) {
      buscarUsuarios();
      buscarAvisoGlobal();
      carregarStatsSuporteRapido();
    }
  }, [acessoPermitido, buscarUsuarios, buscarAvisoGlobal, carregarStatsSuporteRapido]);

  const salvarAvisoGlobal = async (forcarAtivo?: boolean) => {
    const proximoAtivo = forcarAtivo !== undefined ? forcarAtivo : avisoAtivo;

    if (proximoAtivo && !avisoMensagem.trim()) {
      toast.error("Por favor, digite a mensagem do aviso antes de publicar.");
      return;
    }

    setSalvandoAviso(true);
    try {
      await servicoBaseApi.post("/api/admin/aviso-global", {
        mensagem: avisoMensagem,
        tipo: avisoTipo,
        linkRotulo: avisoLinkRotulo,
        linkUrl: avisoLinkUrl,
        ativo: proximoAtivo,
      });
      setAvisoAtivo(proximoAtivo);
      toast.success(
        proximoAtivo 
          ? "Aviso global publicado no topo do app para todos os usuários!" 
          : "Aviso global desativado com sucesso."
      );
    } catch {
      toast.error("Falha ao salvar aviso global.");
    } finally {
      setSalvandoAviso(false);
    }
  };

  const copiarTexto = async (texto: string, chave: string, mensagem: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      definirItemCopiado(chave);
      toast.success(mensagem);
      setTimeout(() => definirItemCopiado(null), 2000);
    } catch {
      toast.error("Não foi possível copiar.");
    }
  };

  const mudarPlano = async (idUsuario: string, novoPlano: PlanoUsuario) => {
    definirSalvando(idUsuario);
    try {
      const novoCiclo = novoPlano === "FUNDADOR" ? "VITALICIO" : undefined;
      await servicoBaseApi.patch("/api/admin/usuarios", { idUsuario, novoPlano, novoCiclo });
      toast.success(`Plano atualizado para ${novoPlano}!`);
      await buscarUsuarios();
    } catch {
      toast.error("Falha ao atualizar plano.");
    } finally {
      definirSalvando(null);
    }
  };

  const mudarCiclo = async (idUsuario: string, novoCiclo: string) => {
    definirSalvando(idUsuario);
    try {
      await servicoBaseApi.patch("/api/admin/usuarios", { idUsuario, novoCiclo });
      toast.success("Ciclo de pagamento atualizado!");
      await buscarUsuarios();
    } catch {
      toast.error("Falha ao atualizar ciclo.");
    } finally {
      definirSalvando(null);
    }
  };

  const renovarPlano = async (idUsuario: string) => {
    definirSalvando(idUsuario);
    try {
      await servicoBaseApi.patch("/api/admin/usuarios", { idUsuario, acao: "RENOVAR" });
      toast.success("Plano renovado com sucesso!");
      await buscarUsuarios();
    } catch {
      toast.error("Falha ao renovar plano.");
    } finally {
      definirSalvando(null);
    }
  };

  const concederDegustacao = async (idUsuario: string, dias: number) => {
    definirSalvando(idUsuario);
    try {
      await servicoBaseApi.patch("/api/admin/usuarios", { idUsuario, acao: "DEGUSTACAO", dias });
      toast.success(`Concedidos ${dias} dias de PRO gratuito com sucesso!`);
      await buscarUsuarios();
    } catch {
      toast.error("Falha ao conceder degustação.");
    } finally {
      definirSalvando(null);
    }
  };

  const executarLimpezaLegal = async () => {
    const confirmar = window.confirm(
      "Deseja executar a Limpeza Legal de Logs conforme o Art. 15 do Marco Civil da Internet?\n\nRegistros de acesso com mais de 180 dias serão purgados definitivamente para respeitar os limites de retenção."
    );
    if (!confirmar) return;

    setExecutandoLimpeza(true);
    try {
      const res = await servicoBaseApi.get<{ sucesso: boolean; detalhes?: { registros_removidos?: number } }>(
        "/api/admin/limpeza-legal"
      );
      const removidos = res?.detalhes?.registros_removidos ?? 0;
      toast.success(`Limpeza legal concluída! ${removidos} registro(s) com mais de 180 dias foram purgados.`);
    } catch {
      toast.error("Falha ao executar limpeza legal de logs.");
    } finally {
      setExecutandoLimpeza(false);
    }
  };

  const exportarCSV = () => {
    if (usuarios.length === 0) {
      toast.error("Nenhum usuário para exportar.");
      return;
    }

    const cabecalhos = ["E-mail", "ID_Usuario", "Estudio", "Plano", "Ciclo", "Vencimento", "Ultima_Atividade"];
    const linhas = usuarios.map((u) => {
      const emailFinal = modoPrivacidade && u.email ? mascararDadoPessoal(u.email, "email") : (u.email || "");
      return [
        `"${emailFinal}"`,
        `"${u.id_usuario}"`,
        `"${(u.nome_estudio || "").replace(/"/g, '""')}"`,
        `"${u.plano}"`,
        `"${u.ciclo_pagamento || ""}"`,
        `"${u.vencimento_plano || ""}"`,
        `"${u.atualizado_em || ""}"`
      ];
    });

    const csvContent = "\uFEFF" + [cabecalhos.join(";"), ...linhas.map((e) => e.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `printlog-usuarios-${modoPrivacidade ? "anonimizado" : "completo"}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Base de usuários exportada em CSV com dados essenciais.");
  };

  const abrirEmailBoasVindas = (u: UsuarioAdmin) => {
    if (!u.email) {
      toast.error("Este usuário não possui e-mail cadastrado.");
      return;
    }
    const nome = u.nome_estudio || "Maker";
    const assunto = encodeURIComponent("Boas-vindas ao PrintLog — Como está sendo a experiência?");
    const corpo = encodeURIComponent(
      `Olá, tudo bem?\n\nSou o Mateus, criador do PrintLog!\n\nVi que você se cadastrou com o estúdio "${nome}". Conseguiu simular seus custos de impressão 3D ou cadastrar suas impressoras e filamentos?\n\nSe tiver qualquer dúvida de precificação ou precisar de ajuda para configurar sua máquina, me responda por aqui. Estou à disposição para ajudar no que for preciso!\n\nAbraços,\nMateus | PrintLog`
    );
    window.open(`mailto:${u.email}?subject=${assunto}&body=${corpo}`, "_blank");
  };

  useDefinirCabecalho({
    titulo: "Console do Dono",
    subtitulo: "Central de Comando, Gestão de Acessos e Conformidade LGPD",
    placeholderBusca: "Buscar e-mail, ID ou estúdio...",
    aoBuscar: (t) => definirBusca(t),
  });

  // Estatísticas calculadas
  const totalUsuarios = usuarios.length;
  const totalFundadores = usuarios.filter((u) => u.plano === "FUNDADOR").length;
  const vagasRestantesFundador = Math.max(0, LIMITE_VAGAS_FUNDADOR - totalFundadores);
  const progressoFundadorPct = Math.min(100, Math.round((totalFundadores / LIMITE_VAGAS_FUNDADOR) * 100));
  
  const totalPro = usuarios.filter((u) => u.plano === "PRO").length;
  const totalFree = usuarios.filter((u) => u.plano === "FREE").length;

  const usuariosAlertas = useMemo(() => {
    return usuarios.filter((u) => {
      if (u.plano === "FREE" || u.ciclo_pagamento === "VITALICIO") return false;
      const status = obterStatusVencimento(u.vencimento_plano, u.ciclo_pagamento);
      return status.dias <= 7;
    });
  }, [usuarios]);

  // Filtragem
  const usuariosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    return usuarios.filter((u) => {
      const bateBusca = 
        !termo ||
        u.id_usuario.toLowerCase().includes(termo) ||
        (u.email && u.email.toLowerCase().includes(termo)) ||
        (u.nome_estudio && u.nome_estudio.toLowerCase().includes(termo));

      if (filtroPlano === "ALERTAS") {
        if (u.plano === "FREE" || u.ciclo_pagamento === "VITALICIO") return false;
        const status = obterStatusVencimento(u.vencimento_plano, u.ciclo_pagamento);
        return bateBusca && status.dias <= 7;
      }

      const batePlano = filtroPlano === "TODOS" || u.plano === filtroPlano;
      return bateBusca && batePlano;
    });
  }, [usuarios, busca, filtroPlano]);

  // Se a autenticação estiver carregando a sessão do Firebase, exibe carregamento em vez de erro prematuro
  if (carregandoAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 p-8">
        <Carregamento texto="Verificando credenciais do Dono..." />
      </div>
    );
  }

  // Verificação de Acesso
  if (!acessoPermitido) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-lg shadow-rose-500/5">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-xl font-black uppercase tracking-widest text-zinc-900 dark:text-white">
          Acesso Restrito ao Dono
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed">
          Este Console é restrito exclusivamente ao e-mail administrador configurado nas variáveis da Cloudflare (<code>EMAIL_DONO</code>).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 🚀 BARRA SUPERIOR DE AÇÕES & STATUS DO DONO (MISSION CONTROL) */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-3xl bg-card border border-borda-sutil shadow-sm relative overflow-hidden">
        {/* Identidade do Console Master */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primaria/10 border border-primaria/20 flex items-center justify-center text-primaria shadow-sm shrink-0">
            <Sparkles size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-black uppercase tracking-wider text-primary">
                Console Master — Dono
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Dono Ativo
              </span>
              <span className="text-[10px] font-mono text-muted-foreground border border-borda-sutil px-2 py-0.5 rounded-md bg-muted/30">
                Edge GRU • Cloudflare D1
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Conectado como: <strong className="text-primary font-bold">{usuario?.email || EMAIL_DONO}</strong>
            </p>
          </div>
        </div>

        {/* Telemetria Rápida e Ações Master */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Status Rápido Broadcast (Atalho para a aba de broadcast) */}
          <button
            onClick={() => setAbaAtiva("avisos")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              avisoAtivo
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20"
                : "bg-muted/40 text-muted-foreground border-borda-sutil hover:text-primary hover:bg-muted"
            }`}
            title="Clique para gerenciar o Broadcast no topo do app"
          >
            <Radio size={13} className={avisoAtivo ? "text-emerald-500 animate-pulse" : ""} />
            <span>Broadcast:</span>
            <span className="font-black text-[10px] uppercase">{avisoAtivo ? "Ao Vivo" : "Inativo"}</span>
          </button>

          {/* Alternador de Modo Privacidade (LGPD) */}
          <button
            onClick={() => setModoPrivacidade((prev) => !prev)}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 cursor-pointer ${
              modoPrivacidade
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-sm"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
            }`}
            title={modoPrivacidade ? "Modo Privacidade LGPD Ativo (E-mails Mascarados). Clique para revelar." : "E-mails Visíveis. Clique para mascarar."}
          >
            {modoPrivacidade ? <Lock size={13} /> : <Eye size={13} />}
            <span>{modoPrivacidade ? "Privacidade Ativa" : "E-mails Visíveis"}</span>
          </button>

          {/* Botão de Limpeza Legal (Marco Civil / LGPD) */}
          <button
            onClick={executarLimpezaLegal}
            disabled={executandoLimpeza}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 border border-borda-sutil transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Limpeza Legal de Logs com mais de 180 dias (Marco Civil Art. 15)"
          >
            <Trash2 size={13} className={executandoLimpeza ? "animate-spin text-rose-500" : ""} />
            <span>{executandoLimpeza ? "Purgando..." : "Limpeza Legal"}</span>
          </button>

          {/* Exportar CSV */}
          <button
            onClick={exportarCSV}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-primary bg-muted hover:bg-muted/80 border border-borda-sutil transition-all active:scale-95 cursor-pointer"
            title="Exportar base de usuários essencial para planilha CSV"
          >
            <Download size={13} />
            <span>Exportar CSV</span>
          </button>

          {/* Atualizar */}
          <button
            onClick={buscarUsuarios}
            disabled={carregando}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-primaria hover:bg-primaria/90 shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Recarregar base de dados"
          >
            <RefreshCw size={13} className={carregando ? "animate-spin" : ""} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* 🧭 NAVEGAÇÃO POR ABAS NO CONSOLE ADMIN */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-card border border-borda-sutil shadow-sm overflow-x-auto">
        <button
          onClick={() => setAbaAtiva("usuarios")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            abaAtiva === "usuarios"
              ? "bg-primaria text-white shadow-md shadow-primaria/20"
              : "text-muted-foreground hover:text-primary hover:bg-muted/50"
          }`}
        >
          <Users size={15} />
          <span>Makers & Planos</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            abaAtiva === "usuarios" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
          }`}>
            {totalUsuarios}
          </span>
        </button>

        <button
          onClick={() => setAbaAtiva("suporte")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap relative ${
            abaAtiva === "suporte"
              ? "bg-primaria text-white shadow-md shadow-primaria/20"
              : "text-muted-foreground hover:text-primary hover:bg-muted/50"
          }`}
        >
          <Headphones size={15} />
          <span>Central de Suporte</span>
          {chamadosAbertosCount > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
              {chamadosAbertosCount} novos
            </span>
          ) : (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              abaAtiva === "suporte" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
            }`}>
              Em dia
            </span>
          )}
        </button>

        <button
          onClick={() => setAbaAtiva("avisos")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            abaAtiva === "avisos"
              ? "bg-primaria text-white shadow-md shadow-primaria/20"
              : "text-muted-foreground hover:text-primary hover:bg-muted/50"
          }`}
        >
          <Radio size={15} className={avisoAtivo ? "text-emerald-500 animate-pulse" : ""} />
          <span>Avisos Globais & Broadcast</span>
          {avisoAtivo ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
              Ao Vivo
            </span>
          ) : (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              abaAtiva === "avisos" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
            }`}>
              Inativo
            </span>
          )}
        </button>
      </div>

      {/* ABA SUPORTE */}
      {abaAtiva === "suporte" && (
        <AbaAdminSuporte modoPrivacidade={modoPrivacidade} />
      )}

      {/* ABA DE AVISO GLOBAL (BROADCAST NO TOPO DO APP) */}
      {abaAtiva === "avisos" && (
        <AbaAdminBroadcast
          avisoMensagem={avisoMensagem}
          setAvisoMensagem={setAvisoMensagem}
          avisoTipo={avisoTipo}
          setAvisoTipo={setAvisoTipo}
          avisoLinkRotulo={avisoLinkRotulo}
          setAvisoLinkRotulo={setAvisoLinkRotulo}
          avisoLinkUrl={avisoLinkUrl}
          setAvisoLinkUrl={setAvisoLinkUrl}
          avisoAtivo={avisoAtivo}
          salvandoAviso={salvandoAviso}
          salvarAvisoGlobal={salvarAvisoGlobal}
          buscarAvisoGlobal={buscarAvisoGlobal}
        />
      )}

      {/* ABA DE USUÁRIOS E PLANOS */}
      {abaAtiva === "usuarios" && (
        <>
          {/* METRICAS DO BOOTSTRAP */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Usuários */}
        <div className="p-5 rounded-2xl bg-card border border-borda-sutil flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-zinc-500/10 flex items-center justify-center text-zinc-500 shrink-0">
            <Users size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none mb-1">Total Makers</p>
            <p className="text-2xl font-black text-zinc-900 dark:text-white leading-tight">{totalUsuarios}</p>
          </div>
        </div>

        {/* Fundadores com Progresso */}
        <div className="p-5 rounded-2xl bg-card border border-borda-sutil flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500 shrink-0">
              <Crown size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none mb-1">Fundadores (Clube 51)</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-sky-600 dark:text-sky-400 leading-tight">{totalFundadores}</span>
                <span className="text-xs text-zinc-400 font-bold">/ {LIMITE_VAGAS_FUNDADOR}</span>
                <span className="text-[10px] font-bold text-zinc-400 ml-1">({vagasRestantesFundador} restantes)</span>
              </div>
            </div>
          </div>
          {/* Barra de progresso */}
          <div className="w-full bg-zinc-100 dark:bg-white/5 rounded-full h-1.5 mt-3 overflow-hidden">
            <div 
              className="bg-sky-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${progressoFundadorPct}%` }}
            />
          </div>
        </div>

        {/* Makers Pro */}
        <div className="p-5 rounded-2xl bg-card border border-borda-sutil flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
            <Zap size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none mb-1">Makers Pro</p>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 leading-tight">{totalPro}</p>
          </div>
        </div>

        {/* Alertas de Vencimento */}
        <div 
          onClick={() => definirFiltroPlano(filtroPlano === "ALERTAS" ? "TODOS" : "ALERTAS")}
          className={`p-5 rounded-2xl border flex items-center gap-3.5 shadow-sm cursor-pointer transition-all ${
            filtroPlano === "ALERTAS"
              ? "bg-amber-500/10 border-amber-500/40 ring-2 ring-amber-500/20"
              : "bg-card border-borda-sutil hover:border-amber-500/30"
          }`}
          title="Clique para filtrar usuários que expiram em até 7 dias"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none mb-1">A Vencer / Expirados</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 leading-tight">{usuariosAlertas.length}</span>
              <span className="text-[10px] font-bold text-zinc-400">em até 7d</span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTROS E BUSCA */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Pílulas de filtro por plano */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card border border-borda-sutil overflow-x-auto custom-scrollbar">
          {[
            { id: "TODOS", rotulo: "Todos", contagem: totalUsuarios },
            { id: "FUNDADOR", rotulo: "Fundador", contagem: totalFundadores },
            { id: "PRO", rotulo: "Pro", contagem: totalPro },
            { id: "FREE", rotulo: "Free", contagem: totalFree },
            { id: "ALERTAS", rotulo: "A Vencer (7d)", contagem: usuariosAlertas.length },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => definirFiltroPlano(item.id)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap
                ${filtroPlano === item.id 
                  ? "bg-primaria text-white shadow-sm" 
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-muted"}
              `}
            >
              <span>{item.rotulo}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${filtroPlano === item.id ? "bg-white/20 text-white" : "bg-muted text-zinc-400"}`}>
                {item.contagem}
              </span>
            </button>
          ))}
        </div>

        {/* Input de busca rápida local */}
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => definirBusca(e.target.value)}
            placeholder="Filtrar por e-mail, ID ou estúdio..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-card border border-borda-sutil placeholder:text-zinc-400 focus:outline-none focus:border-primaria transition-all"
          />
        </div>
      </div>

      {/* LISTAGEM PRINCIPAL */}
      <div className="rounded-2xl border border-borda-sutil overflow-hidden bg-card shadow-sm">
        {carregando ? (
          <div className="p-20 flex justify-center">
            <Carregamento texto="Carregando usuários cadastrados..." />
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <EstadoVazio 
            titulo="Nenhum usuário encontrado" 
            descricao="Não há registros correspondentes aos filtros selecionados." 
            icone={Users} 
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-borda-sutil bg-muted/40 text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  <th className="px-5 py-3.5">Maker (E-mail & ID)</th>
                  <th className="px-5 py-3.5">Estúdio</th>
                  <th className="px-5 py-3.5">Plano / Vencimento</th>
                  <th className="px-5 py-3.5">Última Atividade</th>
                  <th className="px-5 py-3.5 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borda-sutil text-xs">
                {usuariosFiltrados.map((u) => {
                  const ehODono = u.email && EMAIL_DONO && u.email.toLowerCase().trim() === EMAIL_DONO.toLowerCase().trim();
                  const statusVenc = obterStatusVencimento(u.vencimento_plano, u.ciclo_pagamento);
                  const emailVisual = u.email 
                    ? (modoPrivacidade ? mascararDadoPessoal(u.email, "email") : u.email)
                    : null;

                  return (
                    <tr 
                      key={u.id_usuario} 
                      className="hover:bg-muted/30 transition-colors group cursor-pointer"
                      onClick={() => definirUsuarioSelecionado(u)}
                    >
                      {/* E-MAIL E ID */}
                      <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span 
                              onClick={() => definirUsuarioSelecionado(u)}
                              className="font-bold text-zinc-900 dark:text-white hover:text-primaria transition-colors cursor-pointer select-all"
                            >
                              {emailVisual || <span className="text-zinc-400 italic font-normal">Sem e-mail registrado</span>}
                            </span>
                            
                            {u.email && (
                              <button
                                onClick={() => copiarTexto(u.email!, `email-${u.id_usuario}`, "E-mail copiado!")}
                                className="p-1 rounded text-zinc-400 hover:text-primaria hover:bg-muted transition-colors"
                                title="Copiar e-mail real"
                              >
                                {itemCopiado === `email-${u.id_usuario}` ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                              </button>
                            )}

                            {ehODono && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-primaria/10 text-primaria border border-primaria/20">
                                Você / Dono
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                            <span>UID:</span>
                            <span className="font-mono">{u.id_usuario.slice(0, 14)}...</span>
                            <button
                              onClick={() => copiarTexto(u.id_usuario, `uid-${u.id_usuario}`, "ID do usuário copiado!")}
                              className="p-0.5 rounded text-zinc-400 hover:text-primaria transition-colors"
                              title="Copiar UID completo"
                            >
                              {itemCopiado === `uid-${u.id_usuario}` ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* ESTÚDIO */}
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                            {u.nome_estudio ? u.nome_estudio : <span className="text-zinc-400 italic text-[11px]">Não configurado</span>}
                          </span>
                        </div>
                      </td>

                      {/* PLANO E VENCIMENTO */}
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col items-start gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`
                              inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider
                              ${u.plano === 'FUNDADOR' ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20' : 
                                u.plano === 'PRO' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20' : 
                                'bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border border-zinc-500/20'}
                            `}>
                              {u.plano === 'FUNDADOR' ? <Crown size={11} /> : u.plano === 'PRO' ? <Zap size={11} /> : <Users size={11} />}
                              {u.plano}
                            </span>

                            {u.plano !== "FREE" && (
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                {u.ciclo_pagamento || "MENSAL"}
                              </span>
                            )}
                          </div>

                          {u.plano !== "FREE" && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${statusVenc.cor} ${statusVenc.bg}`}>
                              {statusVenc.texto}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* ÚLTIMA ATIVIDADE */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                          <Clock size={12} className="text-zinc-400" />
                          <span className="text-[11px] font-medium">{formatarData(u.atualizado_em)}</span>
                        </div>
                      </td>

                      {/* AÇÕES DE GESTÃO */}
                      <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end items-center gap-1.5">
                          
                          {/* Botão de Contato E-mail */}
                          {u.email && (
                            <button
                              onClick={() => abrirEmailBoasVindas(u)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-primaria hover:bg-muted border border-transparent hover:border-borda-sutil transition-all"
                              title="Enviar e-mail de contato / suporte"
                            >
                              <Mail size={14} />
                            </button>
                          )}

                          {/* Botão Conceder Degustação 7 dias se for FREE */}
                          {u.plano === "FREE" && (
                            <button
                              disabled={salvando === u.id_usuario}
                              onClick={() => concederDegustacao(u.id_usuario, 7)}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all"
                              title="Conceder 7 dias de PRO gratuito (Degustação)"
                            >
                              <Gift size={11} />
                              +7d PRO
                            </button>
                          )}

                          {/* Botão de Renovar */}
                          {u.plano === "PRO" && (
                            <button
                              disabled={salvando === u.id_usuario}
                              onClick={() => renovarPlano(u.id_usuario)}
                              className="px-2 py-1 rounded-lg text-[9px] font-black tracking-wider uppercase transition-all bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                              title="Renovar ciclo atual"
                            >
                              {salvando === u.id_usuario ? "..." : "Renovar"}
                            </button>
                          )}

                          {/* Seletor de Ciclo */}
                          {u.plano !== "FREE" && (
                            <select
                              disabled={salvando === u.id_usuario}
                              value={u.ciclo_pagamento || "MENSAL"}
                              onChange={(e) => mudarCiclo(u.id_usuario, e.target.value)}
                              className="bg-card text-[9px] font-black tracking-widest uppercase text-zinc-600 dark:text-zinc-300 border border-borda-sutil rounded-lg px-1.5 py-1 hover:border-primaria transition-colors outline-none cursor-pointer"
                            >
                              <option value="MENSAL">Mensal</option>
                              <option value="TRIMESTRAL">Trimestral</option>
                              <option value="SEMESTRAL">Semestral</option>
                              <option value="ANUAL">Anual</option>
                              <option value="VITALICIO">Vitalício</option>
                              <option value="TRIAL">Degustação</option>
                            </select>
                          )}

                          {/* Botões de Alteração de Plano */}
                          <div className="flex gap-1">
                            {(["FREE", "PRO", "FUNDADOR"] as PlanoUsuario[]).map((p) => (
                              <button
                                key={p}
                                disabled={salvando === u.id_usuario || u.plano === p}
                                onClick={() => mudarPlano(u.id_usuario, p)}
                                className={`
                                  px-2 py-1 rounded-lg text-[9px] font-black tracking-wider uppercase transition-all
                                  ${u.plano === p 
                                    ? "bg-muted text-zinc-400 cursor-default opacity-50" 
                                    : "bg-card border border-borda-sutil text-zinc-600 dark:text-zinc-300 hover:border-primaria hover:text-primaria"}
                                `}
                              >
                                {salvando === u.id_usuario && u.plano !== p ? "..." : p}
                              </button>
                            ))}
                          </div>

                          {/* Ver Detalhes (Raio-X) */}
                          <button
                            onClick={() => definirUsuarioSelecionado(u)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-primaria hover:bg-muted transition-colors"
                            title="Abrir Raio-X do Maker"
                          >
                            <ExternalLink size={13} />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )}

  {/* MODAL RAIO-X DO MAKER (ESSENCIAL E CONFORME À LGPD) */}
      {usuarioSelecionado && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-borda-sutil rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header Modal */}
            <div className="p-6 border-b border-borda-sutil flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primaria/10 border border-primaria/20 flex items-center justify-center text-primaria">
                  <Activity size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-zinc-900 dark:text-white">
                    Raio-X do Maker
                  </h3>
                  <p className="text-xs text-zinc-500">
                    UID: <code className="font-mono text-[10px]">{usuarioSelecionado.id_usuario}</code>
                  </p>
                </div>
              </div>
              <button
                onClick={() => definirUsuarioSelecionado(null)}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Conteúdo do Raio-X */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
              
              {/* Card Maker Info */}
              <div className="p-4 rounded-2xl bg-muted/30 border border-borda-sutil space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Identificação</span>
                  {usuarioSelecionado.email && (
                    <button
                      onClick={() => abrirEmailBoasVindas(usuarioSelecionado)}
                      className="flex items-center gap-1.5 text-xs font-bold text-primaria hover:underline"
                    >
                      <Mail size={12} />
                      Enviar Mensagem
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] text-zinc-400 block">E-mail</span>
                    <span className="font-bold text-zinc-900 dark:text-white select-all">
                      {usuarioSelecionado.email 
                        ? (modoPrivacidade ? mascararDadoPessoal(usuarioSelecionado.email, "email") : usuarioSelecionado.email)
                        : "Não informado"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block">Nome do Estúdio</span>
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {usuarioSelecionado.nome_estudio || "Não configurado"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status do Plano & Assinatura */}
              <div className="p-4 rounded-2xl bg-muted/30 border border-borda-sutil space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Assinatura & Acesso</span>
                
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] text-zinc-400 block">Plano Atual</span>
                    <span className="font-black text-primaria text-sm">{usuarioSelecionado.plano}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block">Ciclo</span>
                    <span className="font-bold text-zinc-700 dark:text-zinc-300">{usuarioSelecionado.ciclo_pagamento || "MENSAL"}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block">Vencimento</span>
                    <span className="font-bold text-zinc-700 dark:text-zinc-300">
                      {obterStatusVencimento(usuarioSelecionado.vencimento_plano, usuarioSelecionado.ciclo_pagamento).texto}
                    </span>
                  </div>
                </div>

                {/* Ações de Teste / Degustação */}
                <div className="pt-2 border-t border-borda-sutil flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-zinc-500">Conceder Degustação PRO:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => concederDegustacao(usuarioSelecionado.id_usuario, 7)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all"
                    >
                      +7 Dias
                    </button>
                    <button
                      onClick={() => concederDegustacao(usuarioSelecionado.id_usuario, 14)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all"
                    >
                      +14 Dias
                    </button>
                    <button
                      onClick={() => mudarPlano(usuarioSelecionado.id_usuario, "FUNDADOR")}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 hover:bg-sky-500 hover:text-white transition-all"
                    >
                      Virar Fundador
                    </button>
                  </div>
                </div>
              </div>

              {/* Minimização de Dados e Proteção LGPD (Substitui a espionagem de custos/margens) */}
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck size={16} />
                  <span className="text-[11px] font-black uppercase tracking-wider">
                    Privacidade & Sigilo Comercial Ativos (LGPD Art. 6º, III)
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Os parâmetros operacionais do usuário (custos de energia, hora máquina, hora operador e margens de precificação) são protegidos por sigilo de negócio e isolados no banco de dados. O Console do Dono retém apenas os dados estritamente essenciais para a governança de contas e planos.
                </p>
              </div>

            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-muted/40 border-t border-borda-sutil flex items-center justify-between">
              <span className="text-[10px] text-zinc-400 font-medium">
                Última sincronização: {formatarData(usuarioSelecionado.atualizado_em)}
              </span>
              <button
                onClick={() => definirUsuarioSelecionado(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-zinc-700 dark:text-zinc-200 border border-borda-sutil transition-all"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* AVISO DE CONFORMIDADE LGPD & MARCO CIVIL */}
      <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 flex items-start gap-3">
        <ShieldCheck className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" size={18} />
        <div className="space-y-0.5 text-xs">
          <h4 className="font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Console do Dono — Conformidade LGPD & Marco Civil da Internet
          </h4>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
            Este ambiente opera sob o princípio da <strong>Minimização de Dados</strong> (Art. 6º, III da LGPD). Dados comerciais privados dos makers não são coletados neste painel. Logs de acesso contam com política de retenção e expurgo programado (Art. 15 do Marco Civil da Internet).
          </p>
        </div>
      </div>
    </div>
  );
}
