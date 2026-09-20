import { Cliente } from "../tipos";
import {
  Trash2,
  MessageCircle,
  Mail,
  Phone,
  History as HistoryIcon,
  MoreVertical,
  Pencil,
  Star,
  Calculator,
  Store,
  Plus,
  Check
} from "lucide-react";
import { Dica } from "@/compartilhado/componentes";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { centavosParaReais, pluralizar } from "@/compartilhado/utilitarios/formatadores";

interface PropriedadesCardCliente {
  cliente: Cliente;
  aoEditar: (cliente: Cliente) => void;
  aoRemover: (cliente: Cliente) => void;
  aoVerHistorico: (cliente: Cliente) => void;
}

export function CardCliente({ cliente, aoEditar, aoRemover, aoVerHistorico }: PropriedadesCardCliente) {
  const [menuAberto, definirMenuAberto] = useState(false);
  const [copiado, definirCopiado] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clicarFora = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        definirMenuAberto(false);
      }
    };
    document.addEventListener("mousedown", clicarFora);
    return () => document.removeEventListener("mousedown", clicarFora);
  }, []);

  const obterIniciais = (nome: string) => {
    const partes = nome.trim().split(/\s+/);
    if (partes.length >= 2) {
      return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }
    return partes[0]?.substring(0, 2).toUpperCase() || "CL";
  };

  const obterEstiloVisual = (nome: string) => {
    const paletas = [
      {
        avatar: "from-sky-500 to-blue-600 text-white shadow-sky-500/25",
        banner: "from-sky-500/20 via-sky-500/5 to-transparent",
        bordaAvatar: "border-sky-400/40",
        tag: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
      },
      {
        avatar: "from-emerald-500 to-teal-600 text-white shadow-emerald-500/25",
        banner: "from-emerald-500/20 via-emerald-500/5 to-transparent",
        bordaAvatar: "border-emerald-400/40",
        tag: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      },
      {
        avatar: "from-amber-500 to-orange-600 text-white shadow-amber-500/25",
        banner: "from-amber-500/20 via-amber-500/5 to-transparent",
        bordaAvatar: "border-amber-400/40",
        tag: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      },
      {
        avatar: "from-rose-500 to-pink-600 text-white shadow-rose-500/25",
        banner: "from-rose-500/20 via-rose-500/5 to-transparent",
        bordaAvatar: "border-rose-400/40",
        tag: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      },
      {
        avatar: "from-indigo-500 to-purple-600 text-white shadow-indigo-500/25",
        banner: "from-indigo-500/20 via-indigo-500/5 to-transparent",
        bordaAvatar: "border-indigo-400/40",
        tag: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      },
      {
        avatar: "from-violet-500 to-fuchsia-600 text-white shadow-violet-500/25",
        banner: "from-violet-500/20 via-violet-500/5 to-transparent",
        bordaAvatar: "border-violet-400/40",
        tag: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
      },
    ];

    const index = nome.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % paletas.length;
    return paletas[index];
  };

  const temTelefoneValido = (tel: string | null | undefined) => {
    if (!tel) return false;
    const limpo = tel.replace(/\D/g, "");
    if (!limpo || limpo.length < 8) return false;
    if (/^0+$/.test(limpo)) return false;
    const lower = tel.toLowerCase();
    if (
      lower.includes("sem") ||
      lower.includes("placeholder") ||
      lower.includes("null") ||
      lower.includes("undefined") ||
      lower.includes("nao") ||
      lower.includes("não")
    ) return false;
    return true;
  };

  const temEmailValido = (email: string | null | undefined) => {
    if (!email) return false;
    const lower = email.toLowerCase().trim();
    if (
      !lower ||
      lower.includes("sem@") ||
      lower.includes("placeholder") ||
      lower.includes("null") ||
      lower.includes("undefined") ||
      lower.includes("nao") ||
      lower.includes("não")
    ) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lower);
  };

  const abrirWhatsapp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const numeroLimpo = (cliente.telefone || "").replace(/\D/g, "");
    window.open(`https://wa.me/55${numeroLimpo}`, "_blank");
  };

  const copiarParaAreaTransferencia = (texto: string, tipo: string) => {
    navigator.clipboard.writeText(texto);
    definirCopiado(tipo);
    setTimeout(() => definirCopiado(null), 2000);
  };

  const obterStatusCliente = () => {
    if (!cliente.historico || cliente.historico.length === 0) {
      return {
        texto: "Lead",
        cor: "text-amber-500 dark:text-amber-400",
        bg: "bg-amber-500/10 border-amber-500/20",
        dot: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
      };
    }
    
    const ultimoPedido = [...cliente.historico].sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
    )[0];
    const dias = Math.floor((new Date().getTime() - new Date(ultimoPedido.data).getTime()) / (1000 * 3600 * 24));

    if (dias > 90) {
      return {
        texto: "Inativo",
        cor: "text-rose-500 dark:text-rose-400",
        bg: "bg-rose-500/10 border-rose-500/20",
        dot: "bg-rose-500 shadow-[0_0_8px_rgba(243,67,54,0.6)]"
      };
    }
    return {
      texto: "Ativo",
      cor: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
    };
  };

  const status = obterStatusCliente();
  const visual = obterEstiloVisual(cliente.nome);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => aoVerHistorico(cliente)}
      className={`group/card relative rounded-3xl border border-borda-sutil bg-card text-card-foreground shadow-sm hover:shadow-premium transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col overflow-hidden ${
        menuAberto ? "z-40" : "z-10"
      }`}
    >
      {/* ============================================================ */}
      {/* 1. CAPA SUPERIOR (BANNER) COM TAGS E AÇÕES FLUTUANTES         */}
      {/* ============================================================ */}
      <div className={`relative h-24 w-full bg-gradient-to-b ${visual.banner} p-3.5 flex items-start justify-between border-b border-borda-sutil/40`}>
        {/* Glow de ambientação no topo */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />

        {/* Tags de Classificação (Tipo B2C/B2B e Canal de Origem) */}
        <div className="relative z-10 flex items-center gap-1.5 flex-wrap max-w-[65%]">
          {cliente.tipo && (
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md border shadow-sm ${
                cliente.tipo === "B2B"
                  ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
                  : "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30"
              }`}
            >
              {cliente.tipo}
            </span>
          )}
          {cliente.canalReferencia && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-card/85 backdrop-blur-md text-muted-foreground border border-borda-sutil shadow-sm truncate max-w-[120px]">
              <Store size={9} className="shrink-0" />
              <span className="truncate">{cliente.canalReferencia}</span>
            </span>
          )}
        </div>

        {/* Ações Rápidas do Topo (Novo Orçamento + Menu Dropdown) */}
        <div className="relative z-30 flex items-center gap-1" ref={menuRef}>
          <Dica texto="Novo Orçamento" posicao="baixo">
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `/calculadora?clienteId=${cliente.id}`;
              }}
              aria-label="Criar novo orçamento para este cliente"
              className="h-8 w-8 rounded-xl bg-card/90 backdrop-blur-md border border-borda-sutil text-muted-foreground hover:text-emerald-500 hover:border-emerald-500/30 hover:bg-emerald-500/10 flex items-center justify-center transition-all shadow-sm active:scale-95"
            >
              <Plus size={15} strokeWidth={2.5} />
            </button>
          </Dica>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                definirMenuAberto(!menuAberto);
              }}
              aria-label="Opções do cliente"
              aria-haspopup="true"
              aria-expanded={menuAberto}
              className={`h-8 w-8 rounded-xl backdrop-blur-md border transition-all flex items-center justify-center shadow-sm active:scale-95 ${
                menuAberto
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card/90 border-borda-sutil text-muted-foreground hover:text-primary hover:border-primary/30"
              }`}
            >
              <MoreVertical size={15} strokeWidth={2.5} />
            </button>

            {/* Menu Dropdown Suspenso */}
            <AnimatePresence>
              {menuAberto && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-52 bg-card/95 backdrop-blur-xl border border-borda-sutil rounded-2xl shadow-2xl z-50 overflow-hidden p-1.5"
                >
                  <div className="space-y-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        aoVerHistorico(cliente);
                        definirMenuAberto(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-xl transition-all"
                    >
                      <HistoryIcon size={14} className="text-indigo-500" />
                      <span>Ver Histórico</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/calculadora?clienteId=${cliente.id}`;
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-xl transition-all"
                    >
                      <Calculator size={14} className="text-emerald-500" />
                      <span>Novo Orçamento</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        aoEditar(cliente);
                        definirMenuAberto(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-xl transition-all"
                    >
                      <Pencil size={14} className="text-sky-500" />
                      <span>Editar Cadastro</span>
                    </button>

                    <div className="h-px bg-borda-sutil my-1 mx-1.5" />

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        aoRemover(cliente);
                        definirMenuAberto(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                    >
                      <Trash2 size={14} />
                      <span>Remover Cliente</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. AVATAR CENTRALIZADO MEIO A MEIO (CAPA / CORPO)            */}
      {/* ============================================================ */}
      <div className="relative flex justify-center -mt-11 z-20">
        <div className="relative group/avatar">
          {/* Círculo do Avatar com contorno de corte na cor do card */}
          <div
            className={`w-20 h-20 rounded-full bg-gradient-to-br flex items-center justify-center text-xl font-black ring-4 ring-card shadow-xl transition-transform duration-300 group-hover/card:scale-105 ${visual.avatar}`}
          >
            {obterIniciais(cliente.nome)}
          </div>

          {/* Badge VIP se cliente for fiel */}
          {cliente.fiel && (
            <div
              className="absolute -top-0.5 -right-0.5 w-6 h-6 bg-gradient-to-tr from-amber-400 to-yellow-500 rounded-full ring-2 ring-card flex items-center justify-center shadow-md animate-pulse"
              title="Cliente Frequente / VIP"
            >
              <Star size={11} className="fill-white text-white" />
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. INFORMAÇÕES CENTRAIS (NOME, STATUS, NOTAS)                 */}
      {/* ============================================================ */}
      <div className="px-5 pt-3 pb-5 flex flex-col flex-1 gap-4">
        {/* Identificação Centralizada */}
        <div className="flex flex-col items-center text-center gap-1.5">
          <h3
            className="text-base sm:text-lg font-black text-primary tracking-tight truncate max-w-full px-1"
            title={cliente.nome}
          >
            {cliente.nome}
          </h3>

          {/* Pílula de Status Central */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${status.bg} ${status.cor}`}>
            <span className={`w-2 h-2 rounded-full ${status.dot}`} />
            <span>{status.texto}</span>
          </div>
        </div>

        {/* Observações de CRM / Relacionamento */}
        <div className="min-h-[46px] flex items-center justify-center px-1">
          {cliente.observacoesCRM && cliente.observacoesCRM.trim() !== "" ? (
            <p className="text-xs text-muted-foreground italic line-clamp-2 text-center leading-relaxed bg-muted/25 border border-borda-sutil/60 rounded-xl px-3 py-2 w-full">
              "{cliente.observacoesCRM}"
            </p>
          ) : (
            <p className="text-[11px] text-muted-foreground/60 italic text-center w-full">
              Sem observações de relacionamento registradas.
            </p>
          )}
        </div>

        {/* Grid de Métricas (Faturamento LTV e Volume Produzido) */}
        <div className="grid grid-cols-2 gap-2.5 mt-auto">
          <div className="bg-muted/30 border border-borda-sutil p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all hover:bg-muted/40">
            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">
              Faturamento (LTV)
            </span>
            <span className="text-sm font-black text-emerald-500 tracking-tight">
              {centavosParaReais(cliente.ltvCentavos)}
            </span>
          </div>

          <div className="bg-muted/30 border border-borda-sutil p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all hover:bg-muted/40">
            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">
              Volume Produzido
            </span>
            <span className="text-sm font-black text-primary tracking-tight">
              {pluralizar(cliente.totalProdutos, "Projeto", "Projetos")}
            </span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 4. BARRA INFERIOR DE CONTATO / AÇÕES RÁPIDAS                  */}
        {/* ============================================================ */}
        {(temTelefoneValido(cliente.telefone) || temEmailValido(cliente.email)) ? (
          <div className="flex items-center gap-2 pt-2 border-t border-borda-sutil">
            {temTelefoneValido(cliente.telefone) && (
              <button
                onClick={abrirWhatsapp}
                aria-label={`Chamar ${cliente.nome} no WhatsApp`}
                className="flex-1 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm hover:shadow-emerald-500/20 active:scale-[0.98] transition-all"
              >
                <MessageCircle size={15} strokeWidth={2.5} />
                <span>WhatsApp</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 shrink-0">
              {temTelefoneValido(cliente.telefone) && (
                <Dica texto={copiado === "Telefone" ? "Copiado!" : "Copiar Telefone"} posicao="cima">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copiarParaAreaTransferencia(cliente.telefone, "Telefone");
                    }}
                    aria-label={`Copiar telefone de ${cliente.nome}`}
                    className="h-10 w-10 rounded-xl border border-borda-sutil bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-primary flex items-center justify-center transition-all active:scale-95"
                  >
                    {copiado === "Telefone" ? (
                      <Check size={15} className="text-emerald-500" />
                    ) : (
                      <Phone size={15} strokeWidth={2.2} />
                    )}
                  </button>
                </Dica>
              )}

              {temEmailValido(cliente.email) && (
                <Dica texto={copiado === "E-mail" ? "Copiado!" : "Copiar E-mail"} posicao="cima">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copiarParaAreaTransferencia(cliente.email, "E-mail");
                    }}
                    aria-label={`Copiar e-mail de ${cliente.nome}`}
                    className="h-10 w-10 rounded-xl border border-borda-sutil bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-primary flex items-center justify-center transition-all active:scale-95"
                  >
                    {copiado === "E-mail" ? (
                      <Check size={15} className="text-emerald-500" />
                    ) : (
                      <Mail size={15} strokeWidth={2.2} />
                    )}
                  </button>
                </Dica>
              )}
            </div>
          </div>
        ) : (
          <div className="pt-2 border-t border-borda-sutil">
            <button
              onClick={() => aoVerHistorico(cliente)}
              className="w-full h-10 rounded-xl border border-borda-sutil bg-muted/20 hover:bg-muted/50 text-muted-foreground hover:text-primary text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <HistoryIcon size={14} />
              <span>Ver Histórico</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

