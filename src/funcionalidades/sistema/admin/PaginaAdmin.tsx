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
  Layers,
  Clock,
  Download,
  Mail,
  Gift,
  AlertTriangle,
  X,
  ExternalLink,
  Sliders,
  Activity,
  Megaphone,
  Radio,
  Send,
  Eye,
  Power
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

interface UsuarioAdmin {
  id_usuario: string;
  email?: string;
  nome_estudio: string;
  slogan_estudio?: string;
  custo_energia?: string;
  hora_maquina?: string;
  hora_operador?: string;
  margem_lucro?: string;
  plano: PlanoUsuario;
  ciclo_pagamento?: "MENSAL" | "TRIMESTRAL" | "SEMESTRAL" | "ANUAL" | "VITALICIO" | "TRIAL";
  vencimento_plano?: string;
  atualizado_em: string;
}

type TipoAviso = "INFO" | "ALERTA" | "SUCESSO" | "MANUTENCAO";

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
 * Console do Dono — Bootstrap da plataforma.
 * Monitoramento completo, métricas de tração, raio-x do usuário, broadcast global e gestão de acessos.
 */
export function PaginaAdmin() {
  const { usuario } = useAutenticacao();
  const [usuarios, definirUsuarios] = useState<UsuarioAdmin[]>([]);
  const [carregando, definirCarregando] = useState(true);
  const [busca, definirBusca] = useState("");
  const [filtroPlano, definirFiltroPlano] = useState<string>("TODOS");
  const [salvando, definirSalvando] = useState<string | null>(null);
  const [itemCopiado, definirItemCopiado] = useState<string | null>(null);
  const [usuarioSelecionado, definirUsuarioSelecionado] = useState<UsuarioAdmin | null>(null);

  // Estados do Aviso Global (Broadcast)
  const [avisoMensagem, setAvisoMensagem] = useState("");
  const [avisoTipo, setAvisoTipo] = useState<TipoAviso>("INFO");
  const [avisoLinkRotulo, setAvisoLinkRotulo] = useState("");
  const [avisoLinkUrl, setAvisoLinkUrl] = useState("");
  const [avisoAtivo, setAvisoAtivo] = useState(false);
  const [salvandoAviso, setSalvandoAviso] = useState(false);
  const [painelAvisoAberto, setPainelAvisoAberto] = useState(false);

  const acessoPermitido = ehAdmin(usuario?.email);

  const buscarUsuarios = useCallback(async () => {
    definirCarregando(true);
    try {
      const dados = await servicoBaseApi.get<UsuarioAdmin[]>("/api/admin/usuarios");
      definirUsuarios(dados);
      
      // Atualiza usuário selecionado no modal se estiver aberto
      if (usuarioSelecionado) {
        const atualizado = dados.find(u => u.id_usuario === usuarioSelecionado.id_usuario);
        if (atualizado) definirUsuarioSelecionado(atualizado);
      }
    } catch {
      toast.error("Erro ao carregar lista de usuários da base.");
    } finally {
      definirCarregando(false);
    }
  }, [usuarioSelecionado]);

  const buscarAvisoGlobal = useCallback(async () => {
    try {
      const res = await servicoBaseApi.get<any>("/api/admin/aviso-global");
      if (res) {
        setAvisoMensagem(res.mensagem || "");
        setAvisoTipo(res.tipo || "INFO");
        setAvisoLinkRotulo(res.linkRotulo || "");
        setAvisoLinkUrl(res.linkUrl || "");
        setAvisoAtivo(Boolean(res.ativo));
        if (res.ativo) {
          setPainelAvisoAberto(true);
        }
      }
    } catch {
      // Silencioso
    }
  }, []);

  useEffect(() => {
    if (acessoPermitido) {
      buscarUsuarios();
      buscarAvisoGlobal();
    }
  }, [acessoPermitido, buscarUsuarios, buscarAvisoGlobal]);

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
      buscarUsuarios();
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
      buscarUsuarios();
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
      buscarUsuarios();
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
      buscarUsuarios();
    } catch {
      toast.error("Falha ao conceder degustação.");
    } finally {
      definirSalvando(null);
    }
  };

  const exportarCSV = () => {
    if (usuarios.length === 0) {
      toast.error("Nenhum usuário para exportar.");
      return;
    }

    const cabecalhos = ["E-mail", "ID_Usuario", "Estudio", "Plano", "Ciclo", "Vencimento", "Ultima_Atividade"];
    const linhas = usuarios.map(u => [
      `"${u.email || ''}"`,
      `"${u.id_usuario}"`,
      `"${(u.nome_estudio || '').replace(/"/g, '""')}"`,
      `"${u.plano}"`,
      `"${u.ciclo_pagamento || ''}"`,
      `"${u.vencimento_plano || ''}"`,
      `"${u.atualizado_em || ''}"`
    ]);

    const csvContent = "\uFEFF" + [cabecalhos.join(";"), ...linhas.map(e => e.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `printlog-usuarios-bootstrap-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Base de usuários exportada em CSV!");
  };

  const abrirEmailBoasVindas = (u: UsuarioAdmin) => {
    if (!u.email) {
      toast.error("Este usuário não possui e-mail cadastrado.");
      return;
    }
    const nome = u.nome_estudio || "Maker";
    const assunto = encodeURIComponent(`Boas-vindas ao PrintLog — Como está sendo a experiência?`);
    const corpo = encodeURIComponent(
      `Olá, tudo bem?\n\nSou o Mateus, criador do PrintLog!\n\nVi que você se cadastrou com o estúdio "${nome}". Conseguiu simular seus custos de impressão 3D ou cadastrar suas impressoras e filamentos?\n\nSe tiver qualquer dúvida de precificação ou precisar de ajuda para configurar sua máquina, me responda por aqui. Estou à disposição para ajudar no que for preciso!\n\nAbraços,\nMateus | PrintLog`
    );
    window.open(`mailto:${u.email}?subject=${assunto}&body=${corpo}`, "_blank");
  };

  useDefinirCabecalho({
    titulo: "Console do Dono",
    subtitulo: "Bootstrap — Central de Comando e Gestão de Usuários",
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
    return usuarios.filter(u => {
      if (u.plano === "FREE" || u.ciclo_pagamento === "VITALICIO") return false;
      const status = obterStatusVencimento(u.vencimento_plano, u.ciclo_pagamento);
      return status.dias <= 7;
    });
  }, [usuarios]);

  // Filtragem
  const usuariosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase();
    return usuarios.filter((u) => {
      const bateBusca = 
        !busca ||
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
      
      {/* BARRA SUPERIOR DE AÇÕES & STATUS DO DONO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-borda-sutil shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primaria/10 border border-primaria/20 flex items-center justify-center text-primaria">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                Console Master — Bootstrap
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                Dono Ativo
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-xs sm:max-w-md">
              Conectado como: <strong className="text-zinc-700 dark:text-zinc-300">{usuario?.email || EMAIL_DONO}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Botão de Toggle do Aviso Global */}
          <button
            onClick={() => setPainelAvisoAberto(prev => !prev)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
              avisoAtivo
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                : "bg-muted text-zinc-700 dark:text-zinc-300 hover:text-primaria border-borda-sutil"
            }`}
            title="Configurar Banner de Notificação no topo do app"
          >
            <Radio size={14} className={avisoAtivo ? "text-amber-500 animate-pulse" : ""} />
            <span>Aviso Global</span>
            {avisoAtivo && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </button>

          <button
            onClick={exportarCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-primaria bg-muted hover:bg-muted/80 border border-borda-sutil transition-all active:scale-95"
            title="Exportar base de usuários para planilha CSV"
          >
            <Download size={14} />
            Exportar CSV
          </button>

          <button
            onClick={buscarUsuarios}
            disabled={carregando}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-primaria hover:bg-primaria/90 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            title="Recarregar base de dados"
          >
            <RefreshCw size={14} className={carregando ? "animate-spin" : ""} />
            Atualizar
          </button>
        </div>
      </div>

      {/* PAINEL DE GESTÃO DO AVISO GLOBAL (BROADCAST NO TOPO DO APP) */}
      {painelAvisoAberto && (
        <div className="p-5 rounded-2xl bg-card border border-borda-sutil shadow-md space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primaria/10 text-primaria">
                <Megaphone size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-900 dark:text-white flex items-center gap-2">
                  Aviso Global da Plataforma (Banner de Notificação)
                  {avisoAtivo ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                      Ao Vivo no App
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-zinc-500/10 text-zinc-500 text-[10px] font-black uppercase tracking-widest border border-zinc-500/20">
                      Desativado
                    </span>
                  )}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Defina um anúncio ou aviso que será exibido no topo da tela para todos os usuários logados no PrintLog.
                </p>
              </div>
            </div>

            <button
              onClick={() => setPainelAvisoAberto(false)}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-muted"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2">
            
            {/* Campo Mensagem */}
            <div className="md:col-span-8 space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                Texto do Aviso
              </label>
              <input
                type="text"
                value={avisoMensagem}
                onChange={(e) => setAvisoMensagem(e.target.value)}
                placeholder='Ex: "Nova calculadora de resina disponível!" ou "Manutenção preventiva amanhã às 23h"'
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted/40 border border-borda-sutil placeholder:text-zinc-400 focus:outline-none focus:border-primaria transition-all"
              />
            </div>

            {/* Estilo / Tipo */}
            <div className="md:col-span-4 space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                Estilo Visual
              </label>
              <select
                value={avisoTipo}
                onChange={(e) => setAvisoTipo(e.target.value as TipoAviso)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-card border border-borda-sutil text-zinc-700 dark:text-zinc-200 outline-none focus:border-primaria transition-all cursor-pointer"
              >
                <option value="INFO">ℹ️ Informação / Novidade (Cyan)</option>
                <option value="ALERTA">⚠️ Alerta / Manutenção (Âmbar)</option>
                <option value="SUCESSO">🚀 Lançamento / Sucesso (Esmeralda)</option>
                <option value="MANUTENCAO">🔧 Manutenção Técnica (Índigo)</option>
              </select>
            </div>

            {/* Link Opcional: Rótulo */}
            <div className="md:col-span-4 space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                Rótulo do Link (Opcional)
              </label>
              <input
                type="text"
                value={avisoLinkRotulo}
                onChange={(e) => setAvisoLinkRotulo(e.target.value)}
                placeholder='Ex: "Ver calculadora" ou "Saiba mais"'
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted/40 border border-borda-sutil placeholder:text-zinc-400 focus:outline-none focus:border-primaria transition-all"
              />
            </div>

            {/* Link Opcional: URL */}
            <div className="md:col-span-8 space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                Destino do Link (Opcional)
              </label>
              <input
                type="text"
                value={avisoLinkUrl}
                onChange={(e) => setAvisoLinkUrl(e.target.value)}
                placeholder='Ex: "/calculadora" ou "https://instagram.com/..."'
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted/40 border border-borda-sutil placeholder:text-zinc-400 focus:outline-none focus:border-primaria transition-all"
              />
            </div>

          </div>

          {/* Pré-visualização ao vivo */}
          {avisoMensagem.trim() && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                <Eye size={12} />
                <span>Pré-visualização do Banner</span>
              </div>
              <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                avisoTipo === 'ALERTA' ? 'bg-amber-500/10 border-amber-500/25 text-amber-950 dark:text-amber-100' :
                avisoTipo === 'SUCESSO' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-950 dark:text-emerald-100' :
                avisoTipo === 'MANUTENCAO' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-950 dark:text-indigo-100' :
                'bg-cyan-500/10 border-cyan-500/20 text-cyan-900 dark:text-cyan-100'
              }`}>
                <div className="flex items-center gap-2 truncate">
                  <Megaphone size={14} className="shrink-0" />
                  <span className="font-semibold truncate">{avisoMensagem}</span>
                  {avisoLinkRotulo && (
                    <span className="underline font-bold ml-1 shrink-0">{avisoLinkRotulo} →</span>
                  )}
                </div>
                <X size={14} className="shrink-0 opacity-60" />
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-borda-sutil">
            <div className="text-[11px] text-zinc-400">
              * Atualizações entram em vigor no app para todos os usuários imediatamente.
            </div>

            <div className="flex items-center gap-2">
              {avisoAtivo && (
                <button
                  type="button"
                  disabled={salvandoAviso}
                  onClick={() => salvarAvisoGlobal(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all disabled:opacity-50"
                >
                  <Power size={13} />
                  Desativar Aviso
                </button>
              )}

              <button
                type="button"
                disabled={salvandoAviso}
                onClick={() => salvarAvisoGlobal(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-primaria hover:bg-primaria/90 shadow-sm transition-all disabled:opacity-50"
              >
                <Send size={13} />
                {salvandoAviso ? "Salvando..." : (avisoAtivo ? "Atualizar no App" : "Publicar no Topo do App")}
              </button>
            </div>
          </div>

        </div>
      )}

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
                              {u.email || <span className="text-zinc-400 italic font-normal">Sem e-mail registrado</span>}
                            </span>
                            
                            {u.email && (
                              <button
                                onClick={() => copiarTexto(u.email!, `email-${u.id_usuario}`, "E-mail copiado!")}
                                className="p-1 rounded text-zinc-400 hover:text-primaria hover:bg-muted transition-colors"
                                title="Copiar e-mail"
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
                          {u.slogan_estudio && (
                            <span className="text-[10px] text-zinc-400 truncate max-w-[150px]">{u.slogan_estudio}</span>
                          )}
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
                              title="Enviar e-mail de contato / boas-vindas"
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
                              title="Renovar ciclo"
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

      {/* MODAL RAIO-X DO MAKER */}
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
                      {usuarioSelecionado.email || "Não informado"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block">Nome do Estúdio</span>
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {usuarioSelecionado.nome_estudio || "Não configurado"}
                    </span>
                  </div>
                  {usuarioSelecionado.slogan_estudio && (
                    <div className="col-span-2">
                      <span className="text-[11px] text-zinc-400 block">Slogan</span>
                      <span className="text-zinc-600 dark:text-zinc-300 font-medium">
                        "{usuarioSelecionado.slogan_estudio}"
                      </span>
                    </div>
                  )}
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

              {/* Parâmetros Operacionais Salvos no Estúdio */}
              <div className="p-4 rounded-2xl bg-muted/30 border border-borda-sutil space-y-3">
                <div className="flex items-center gap-1.5">
                  <Sliders size={14} className="text-zinc-400" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    Parâmetros Operacionais Cadastrados
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-400 block">Energia (kWh)</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">
                      {usuarioSelecionado.custo_energia || "R$ 0,00"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block">Hora Máquina</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">
                      {usuarioSelecionado.hora_maquina || "R$ 0,00"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block">Hora Operador</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">
                      {usuarioSelecionado.hora_operador || "R$ 0,00"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block">Margem Padrão</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {usuarioSelecionado.margem_lucro || "0%"}
                    </span>
                  </div>
                </div>
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

      {/* AVISO DO BOOTSTRAP */}
      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex items-start gap-3">
        <ShieldCheck className="text-amber-500 shrink-0 mt-0.5" size={18} />
        <div className="space-y-0.5 text-xs">
          <h4 className="font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Console de Bootstrap — Acesso Confidencial
          </h4>
          <p className="text-[11px] text-amber-700/80 dark:text-amber-400/70 leading-relaxed font-medium">
            Esta visualização consolida todos os usuários cadastrados no banco D1 da Cloudflare. As mudanças de plano e ciclo entram em vigor instantaneamente para as contas selecionadas.
          </p>
        </div>
      </div>
    </div>
  );
}
