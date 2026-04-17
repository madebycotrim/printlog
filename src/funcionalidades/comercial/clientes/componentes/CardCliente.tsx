import { Cliente, StatusComercial } from "../tipos";
import {
  Trash2,
  MessageCircle,
  Mail,
  Phone,
  History,
  MoreVertical,
  Pencil,
  Star,
  ShieldCheck,
  Award,
  Clock,
  Ban,
  User
} from "lucide-react";
import { Dica } from "@/compartilhado/componentes/Dica";
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

  const obterInfoStatus = (status: StatusComercial) => {
    switch (status) {
      case StatusComercial.VIP:
        return { label: "MAKER VIP", classe: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20", icone: Award };
      case StatusComercial.ATIVO:
        return { label: "ATIVO", classe: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icone: Star };
      case StatusComercial.INATIVO:
        return { label: "INATIVO", classe: "bg-rose-500/10 text-rose-500 border-rose-500/20", icone: Ban };
      case StatusComercial.PROSPECT:
        return { label: "PROSPECT", classe: "bg-amber-500/10 text-amber-500 border-amber-500/20", icone: Clock };
      default:
        return { label: status, classe: "bg-sky-500/10 text-sky-500 border-sky-500/20", icone: User };
    }
  };

  const infoStatus = obterInfoStatus(cliente.statusComercial);

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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/60 dark:border-white/5 rounded-[2rem] p-6 transition-all shadow-sm group/card hover:shadow-2xl hover:shadow-sky-500/5 hover:translate-y-[-4px]"
    >
      {/* Ações Técnicas */}
      <div className="absolute top-5 right-5 z-30 flex items-center gap-1" ref={menuRef}>
        <Dica texto="WhatsApp" posicao="esquerda">
          <button
            onClick={abrirWhatsapp}
            className="p-2.5 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all"
          >
            <MessageCircle size={20} />
          </button>
        </Dica>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              definirMenuAberto(!menuAberto);
            }}
            className={`p-2.5 rounded-xl transition-all ${menuAberto ? "bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white" : "text-zinc-400 hover:bg-gray-50 dark:hover:bg-white/5"}`}
          >
            <MoreVertical size={20} />
          </button>

          <AnimatePresence>
            {menuAberto && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: 20 }}
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-50 overflow-hidden backdrop-blur-3xl p-1.5"
              >
                <div className="p-2 space-y-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); aoVerHistorico(cliente); definirMenuAberto(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-indigo-500 rounded-xl transition-all uppercase tracking-[0.15em]"
                  >
                    <History size={16} />
                    Histórico
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); aoEditar(cliente); definirMenuAberto(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-sky-500 rounded-xl transition-all uppercase tracking-[0.15em]"
                  >
                    <Pencil size={16} />
                    Editar Perfil
                  </button>

                  <div className="h-px bg-zinc-100 dark:bg-white/5 mx-2 my-1" />

                  <button
                    onClick={(e) => { e.stopPropagation(); aoRemover(cliente); definirMenuAberto(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all uppercase tracking-[0.15em]"
                  >
                    <Trash2 size={16} />
                    Remover
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="relative flex flex-col gap-6">
        {/* Cabeçalho do Card */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-sm font-black border-2 shadow-xl ${obterCorAvatar(cliente.nome)}`}
            >
              {obterIniciais(cliente.nome)}
            </div>
            {cliente.statusComercial === StatusComercial.VIP && (
              <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center border-4 border-white dark:border-zinc-900 shadow-xl shadow-amber-500/20">
                <Star size={10} fill="white" className="text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pr-12">
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 tracking-tight truncate leading-none">
                {cliente.nome}
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${infoStatus.classe}`}
                >
                  <infoStatus.icone size={10} strokeWidth={3} />
                  {infoStatus.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas de Performance */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-50/50 dark:bg-white/[0.03] rounded-2xl border border-zinc-100 dark:border-white/5">
          <div className="flex flex-col px-1">
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 opacity-60">
              VALOR LTV
            </span>
            <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 tabular-nums">
              {centavosParaReais(cliente.ltvCentavos)}
            </span>
          </div>

          <div className="flex flex-col px-1 border-l border-zinc-200/50 dark:border-white/5 pl-4">
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 opacity-60">
              PRODUÇÕES
            </span>
            <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 tabular-nums">
              {cliente.totalProdutos} {pluralizar(cliente.totalProdutos, "Projeto", "Projetos")}
            </span>
          </div>
        </div>

        {/* Informações LGPD Sutil */}
        <div className="flex items-center gap-2 px-1">
           <ShieldCheck size={12} className="text-emerald-500" />
           <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest opacity-60">
             Proteção Ativa (Regra 9.0)
           </span>
        </div>

        {/* Rodapé - Contatos Rápidos */}
        <div className="pt-2 flex flex-col gap-2 border-t border-zinc-100 dark:border-white/5">
          <button
            onClick={() => copiarParaAreaTransferencia(cliente.email, "E-mail")}
            className="relative flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-sky-500 transition-all font-bold group/email"
          >
            <Mail size={14} className="opacity-50 group-hover/email:opacity-100" />
            <span className="truncate">{cliente.email}</span>
            <AnimatePresence>
               {copiado === "E-mail" && (
                 <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[8px] bg-sky-500 text-white px-1.5 rounded uppercase">Copiado!</motion.span>
               )}
            </AnimatePresence>
          </button>

          <button
            onClick={() => copiarParaAreaTransferencia(cliente.telefone, "Telefone")}
            className="relative flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 transition-all font-bold group/tel"
          >
            <Phone size={14} className="opacity-50 group-hover/tel:opacity-100" />
            <span>{cliente.telefone}</span>
            <AnimatePresence>
               {copiado === "Telefone" && (
                 <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[8px] bg-emerald-500 text-white px-1.5 rounded uppercase">Copiado!</motion.span>
               )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
