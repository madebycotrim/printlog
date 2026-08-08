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
  Plus
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
    return partes[0].substring(0, 2).toUpperCase();
  };

  const obterCorAvatar = (nome: string) => {
    const cores = [
      "from-sky-500/20 to-sky-600/20 text-sky-600 dark:text-sky-400 border-sky-200/50 dark:border-sky-500/30 shadow-sky-500/10",
      "from-emerald-500/20 to-emerald-600/20 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/30 shadow-emerald-500/10",
      "from-amber-500/20 to-amber-600/20 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-500/30 shadow-amber-500/10",
      "from-rose-500/20 to-rose-600/20 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-500/30 shadow-rose-500/10",
      "from-indigo-500/20 to-indigo-600/20 text-indigo-600 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-500/30 shadow-indigo-500/10",
      "from-violet-500/20 to-violet-600/20 text-violet-600 dark:text-violet-400 border-violet-200/50 dark:border-violet-500/30 shadow-violet-500/10",
      "from-cyan-500/20 to-cyan-600/20 text-cyan-600 dark:text-cyan-400 border-cyan-200/50 dark:border-cyan-500/30 shadow-cyan-500/10",
    ];

    const index = nome.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % cores.length;
    return cores[index];
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

  const [copiado, definirCopiado] = useState<string | null>(null);

  const copiarParaAreaTransferencia = (texto: string, tipo: string) => {
    navigator.clipboard.writeText(texto);
    definirCopiado(tipo);
    setTimeout(() => definirCopiado(null), 2000);
  };

  const obterStatusCliente = () => {
    if (!cliente.historico || cliente.historico.length === 0) return { texto: "Lead", cor: "text-amber-500", dot: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" };
    
    const ultimoPedido = [...cliente.historico].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0];
    const dias = Math.floor((new Date().getTime() - new Date(ultimoPedido.data).getTime()) / (1000 * 3600 * 24));

    if (dias > 90) return { texto: "Inativo", cor: "text-rose-500", dot: "bg-rose-500 shadow-[0_0_8px_rgba(243,67,54,0.6)]" };
    return { texto: "Ativo", cor: "text-emerald-500", dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" };
  };

  const status = obterStatusCliente();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={() => aoVerHistorico(cliente)}
      className={`relative bg-zinc-900/40 dark:bg-white/[0.02] backdrop-blur-xl border border-zinc-200/50 dark:border-white/5 rounded-[2rem] p-6 transition-all duration-300 shadow-sm group/card hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:border-sky-500/30 dark:hover:border-sky-500/20 hover:-translate-y-1 cursor-pointer ${menuAberto ? 'z-50' : 'z-10'}`}
    >
      {/* Glow de Fundo Sutil no Hover */}
      <div className="absolute -inset-px bg-gradient-to-br from-sky-500/0 via-sky-500/0 to-indigo-500/0 group-hover/card:from-sky-500/5 group-hover/card:to-indigo-500/5 rounded-[2rem] transition-all duration-500 pointer-events-none" />

      {/* Menu Superior Direito */}
      <div className="absolute top-5 right-5 z-30 flex items-center gap-1" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `/calculadora?clienteId=${cliente.id}`;
          }}
          className="p-2 rounded-xl transition-all text-zinc-400 hover:bg-emerald-500/10 hover:text-emerald-500 dark:hover:bg-emerald-500/20"
          title="Novo Orçamento"
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              definirMenuAberto(!menuAberto);
            }}
            aria-label="Abrir menu de ações do cliente"
            aria-haspopup="true"
            aria-expanded={menuAberto}
            className={`p-2 rounded-xl transition-all ${
              menuAberto 
                ? "bg-zinc-200/50 dark:bg-white/10 text-primary dark:text-white" 
                : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-primary dark:hover:text-white"
            }`}
          >
            <MoreVertical size={16} strokeWidth={2.5} />
          </button>

          <AnimatePresence>
            {menuAberto && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/80 dark:border-white/5 rounded-2xl shadow-2xl z-50 overflow-hidden p-1.5"
              >
                <div className="p-1 space-y-0.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); aoVerHistorico(cliente); definirMenuAberto(false); }}
                    aria-label="Ver histórico e pedidos do cliente"
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-indigo-500 dark:hover:text-indigo-400 rounded-xl transition-all uppercase tracking-[0.15em]"
                  >
                    <HistoryIcon size={14} />
                    Histórico
                  </button>

                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      window.location.href = `/calculadora?clienteId=${cliente.id}`;
                    }}
                    aria-label="Criar novo orçamento"
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-emerald-500 dark:hover:text-emerald-400 rounded-xl transition-all uppercase tracking-[0.15em]"
                  >
                    <Calculator size={14} />
                    Novo Orçamento
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); aoEditar(cliente); definirMenuAberto(false); }}
                    aria-label="Editar dados cadastrais do cliente"
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-sky-500 dark:hover:text-sky-400 rounded-xl transition-all uppercase tracking-[0.15em]"
                  >
                    <Pencil size={14} />
                    Editar
                  </button>

                  <div className="h-px bg-zinc-200/50 dark:bg-white/5 mx-2 my-1" />

                  <button
                    onClick={(e) => { e.stopPropagation(); aoRemover(cliente); definirMenuAberto(false); }}
                    aria-label="Remover cliente do ecossistema"
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all uppercase tracking-[0.15em]"
                  >
                    <Trash2 size={14} />
                    Remover
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between gap-6">
        {/* Identificação & Métricas */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 pr-10">
            {/* Avatar Premium */}
            <div className="relative shrink-0">
              <div
                className={`w-14 h-14 rounded-full bg-gradient-to-br flex items-center justify-center text-sm font-black border-2 shadow-inner transition-transform duration-300 group-hover/card:scale-105 ${obterCorAvatar(cliente.nome)}`}
              >
                {obterIniciais(cliente.nome)}
              </div>
              {cliente.fiel && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full border-2 border-white dark:border-[#121214] flex items-center justify-center text-white shadow-md animate-bounce" title="Cliente VIP">
                  <Star size={8} className="fill-white text-white" />
                </div>
              )}
            </div>

            {/* Informações Principais */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <h3 className="text-base font-black text-zinc-900 dark:text-white tracking-tight truncate">
                  {cliente.nome}
                </h3>
                  {cliente.tipo && (
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      cliente.tipo === "B2B"
                        ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                        : "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20"
                    }`}>
                      {cliente.tipo}
                    </span>
                  )}
                  {cliente.canalReferencia && (
                    <span className="flex items-center gap-1 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider bg-zinc-800/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-white/10">
                      <Store size={8} />
                      {cliente.canalReferencia}
                    </span>
                  )}
                </div>
              
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                <div className={`w-2 h-2 rounded-full ${status.dot}`} />
                <span className={status.cor}>{status.texto}</span>
              </div>
            </div>
          </div>

          {/* Notas de CRM (Prévia) */}
          {cliente.observacoesCRM && cliente.observacoesCRM.trim() !== "" ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 italic line-clamp-2 border-l-2 border-sky-500/30 dark:border-sky-500/20 pl-3 py-0.5 leading-relaxed">
              "{cliente.observacoesCRM}"
            </p>
          ) : (
            <p className="text-xs text-zinc-400 dark:text-zinc-600 italic border-l-2 border-zinc-200 dark:border-white/5 pl-3 py-0.5 leading-relaxed">
              Sem observações de relacionamento registradas.
            </p>
          )}

          {/* Grid de Métricas Premium */}
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="bg-zinc-50 dark:bg-white/[0.01] border border-zinc-200/30 dark:border-white/5 p-3 rounded-2xl flex flex-col justify-center">
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
                Faturamento (LTV)
              </span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {centavosParaReais(cliente.ltvCentavos)}
              </span>
            </div>
            
            <div className="bg-zinc-50 dark:bg-white/[0.01] border border-zinc-200/30 dark:border-white/5 p-3 rounded-2xl flex flex-col justify-center">
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
                Volume Produzido
              </span>
              <span className="text-sm font-black text-zinc-900 dark:text-white tracking-tight">
                {pluralizar(cliente.totalProdutos, "Projeto", "Projetos")}
              </span>
            </div>
          </div>
        </div>

        {/* Rodapé - Contatos em Pílulas */}
        {(temTelefoneValido(cliente.telefone) || temEmailValido(cliente.email)) && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-4 border-t border-zinc-200/50 dark:border-white/5 mt-auto">
            {temTelefoneValido(cliente.telefone) && (
              <button
                onClick={abrirWhatsapp}
                className="md:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-95 touch-target w-full"
              >
                <MessageCircle size={15} strokeWidth={2.5} />
                <span>Chamar no WhatsApp</span>
              </button>
            )}

            <div className="flex items-center gap-2.5 justify-start">
              {temTelefoneValido(cliente.telefone) && (
                <>
                  <Dica texto="Chamar no WhatsApp" posicao="cima">
                    <button
                      onClick={abrirWhatsapp}
                      aria-label={`Chamar o cliente ${cliente.nome} no WhatsApp`}
                      className="hidden md:flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all group/btn"
                    >
                      <MessageCircle size={15} strokeWidth={2.5} className="group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </Dica>

                <Dica texto={copiado === "Telefone" ? "Copiado!" : "Copiar Telefone"} posicao="cima">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copiarParaAreaTransferencia(cliente.telefone, "Telefone");
                    }}
                    aria-label={`Copiar o telefone do cliente ${cliente.nome}`}
                    className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500 hover:text-white hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition-all group/btn"
                  >
                    <Phone size={15} strokeWidth={2.5} className="group-hover/btn:scale-110 transition-transform" />
                  </button>
                </Dica>
              </>
            )}

            {temEmailValido(cliente.email) && (
              <Dica texto={copiado === "E-mail" ? "Copiado!" : "Copiar E-mail"} posicao="cima">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copiarParaAreaTransferencia(cliente.email, "E-mail");
                  }}
                  aria-label={`Copiar o e-mail do cliente ${cliente.nome}`}
                  className="flex items-center justify-center w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500 hover:text-white hover:shadow-lg hover:shadow-sky-500/20 active:scale-95 transition-all group/btn"
                >
                  <Mail size={15} strokeWidth={2.5} className="group-hover/btn:scale-110 transition-transform" />
                </button>
              </Dica>
            )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
