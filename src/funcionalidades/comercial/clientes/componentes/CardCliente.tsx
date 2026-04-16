import { Cliente, StatusComercial } from "../tipos";
import {
  Trash2,
  MessageCircle,
  Mail,
  Phone,
  PlusCircle,
  History,
  MoreVertical,
  Pencil,
  Star,
  ShieldCheck,
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

  const obterBadgeStatus = (status: StatusComercial) => {
    switch (status) {
      case StatusComercial.VIP:
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case StatusComercial.ATIVO:
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case StatusComercial.INATIVO:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      default:
        return "bg-sky-500/10 text-sky-500 border-sky-500/20";
    }
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-zinc-200 dark:border-white/10 rounded-2xl p-5 transition-all shadow-sm group/card hover:shadow-xl hover:translate-y-[-2px]"
    >
      {/* Ações Técnicas (WhatsApp e Menu) */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-1" ref={menuRef}>
        <Dica texto="WhatsApp" posicao="esquerda">
          <button
            onClick={abrirWhatsapp}
            className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all"
          >
            <MessageCircle size={18} />
          </button>
        </Dica>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              definirMenuAberto(!menuAberto);
            }}
            className={`p-2 rounded-xl transition-all ${menuAberto ? "bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white" : "text-zinc-400 hover:bg-gray-50 dark:hover:bg-white/5"}`}
          >
            <MoreVertical size={18} />
          </button>

          <AnimatePresence>
            {menuAberto && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/5 rounded-2xl shadow-xl z-50 overflow-hidden"
              >
                <div className="p-1.5 space-y-0.5">
                  {[
                    {
                      icone: PlusCircle,
                      texto: "NOVO PEDIDO",
                      cor: "hover:text-sky-600 dark:hover:text-sky-400",
                      bgHover: "hover:bg-sky-500/10",
                      iconeCor: "group-hover/item:text-sky-500",
                      acao: () => {},
                    },
                    {
                      icone: History,
                      texto: "VER HISTÓRICO",
                      cor: "hover:text-indigo-600 dark:hover:text-indigo-400",
                      bgHover: "hover:bg-indigo-500/10",
                      iconeCor: "group-hover/item:text-indigo-500",
                      acao: () => aoVerHistorico(cliente),
                    },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        item.acao();
                        definirMenuAberto(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-bold text-gray-600 dark:text-zinc-300 ${item.bgHover} ${item.cor} rounded-xl transition-colors group/item uppercase tracking-widest`}
                    >
                      <item.icone size={14} className={`text-gray-400 ${item.iconeCor} transition-colors`} />
                      {item.texto}
                    </button>
                  ))}

                  <div className="h-px bg-gray-100 dark:bg-white/5 my-1" />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      aoEditar(cliente);
                      definirMenuAberto(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-bold text-gray-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white rounded-xl transition-colors group/item uppercase tracking-widest"
                  >
                    <Pencil
                      size={14}
                      className="text-gray-400 group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors"
                    />
                    EDITAR
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      aoRemover(cliente);
                      definirMenuAberto(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-bold text-rose-600 hover:bg-rose-500/10 rounded-xl transition-colors group/item uppercase tracking-widest"
                  >
                    <Trash2 size={14} className="text-rose-400 group-hover/item:text-rose-600 transition-colors" />
                    REMOVER
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="relative flex flex-col gap-4">
        {/* Cabeçalho */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative shrink-0 mt-0.5">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-xs font-black border shadow-inner ${obterCorAvatar(cliente.nome)}`}
            >
              {obterIniciais(cliente.nome)}
            </div>
            {cliente.statusComercial === StatusComercial.VIP && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-lg shadow-amber-500/40">
                <Star size={8} fill="white" className="text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col pr-20">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-[14px] font-black text-zinc-900 dark:text-zinc-100 tracking-tight truncate">
                {cliente.nome}
              </h3>
              <span
                className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${obterBadgeStatus(cliente.statusComercial)}`}
              >
                {cliente.statusComercial}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
              <ShieldCheck size={10} className="text-emerald-500" />
              <span className="opacity-60">LGPD: Ativo</span>
            </div>
          </div>
        </div>

        {/* Métricas de Performance CRM */}
        <div className="grid grid-cols-2 gap-4 py-2 bg-zinc-50 dark:bg-white/[0.02] rounded-xl border border-transparent group-hover/card:border-zinc-100 dark:group-hover/card:border-white/5 transition-all">
          <div className="flex flex-col items-center border-r border-zinc-100 dark:border-white/5">
            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">
              LTV (Total Gerado)
            </span>
            <span className="text-[14px] font-black text-zinc-900 dark:text-white tabular-nums">
              {centavosParaReais(cliente.ltvCentavos)}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Volume Projetos</span>
            <span className="text-[14px] font-black text-zinc-900 dark:text-white tabular-nums">
              {cliente.totalProdutos} {pluralizar(cliente.totalProdutos, "Job", "Jobs")}
            </span>
          </div>
        </div>

        {/* Rodapé - Contatos */}
        <div className="pt-2 flex items-center border-t border-zinc-100 dark:border-white/5 divide-x divide-zinc-100 dark:divide-white/5">
          <button
            onClick={() => copiarParaAreaTransferencia(cliente.email, "E-mail")}
            className="relative flex-1 flex items-center gap-2 px-2 text-[10px] text-zinc-400 hover:text-sky-500 transition-colors group/contato min-w-0 pr-4"
            title="Clique para copiar e-mail"
          >
            <AnimatePresence>
              {copiado === "E-mail" && (
                <motion.div
                  initial={{ opacity: 0, y: 5, x: "-50%" }}
                  animate={{ opacity: 1, y: 0, x: "-50%" }}
                  exit={{ opacity: 0, y: 5, x: "-50%" }}
                  className="absolute -top-7 left-1/2 px-2 py-0.5 bg-zinc-800 text-white text-[9px] font-bold rounded shadow-lg z-[60] whitespace-nowrap"
                >
                  Copiado!
                </motion.div>
              )}
            </AnimatePresence>
            <Mail size={12} className="shrink-0" />
            <span className="truncate w-full text-left font-bold">{cliente.email}</span>
          </button>

          <button
            onClick={() => copiarParaAreaTransferencia(cliente.telefone, "Telefone")}
            className="relative shrink-0 flex items-center justify-end gap-2 px-3 text-[10px] text-zinc-500 dark:text-zinc-400 font-black hover:text-emerald-500 transition-colors group/contato"
            title="Clique para copiar telefone"
          >
            <AnimatePresence>
              {copiado === "Telefone" && (
                <motion.div
                  initial={{ opacity: 0, y: 5, x: "-50%" }}
                  animate={{ opacity: 1, y: 0, x: "-50%" }}
                  exit={{ opacity: 0, y: 5, x: "-50%" }}
                  className="absolute -top-7 left-1/2 px-2 py-0.5 bg-zinc-800 text-white text-[9px] font-bold rounded shadow-lg z-[60] whitespace-nowrap"
                >
                  Copiado!
                </motion.div>
              )}
            </AnimatePresence>
            <Phone size={11} className="text-emerald-500/70 shrink-0" />
            <span className="whitespace-nowrap tracking-tighter">{cliente.telefone}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
