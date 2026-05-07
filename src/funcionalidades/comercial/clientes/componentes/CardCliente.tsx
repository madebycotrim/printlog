import { Cliente } from "../tipos";
import {
  Trash2,
  MessageCircle,
  Mail,
  Phone,
  History as HistoryIcon,
  MoreVertical,
  Pencil,
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
      className="relative bg-card backdrop-blur-xl border border-borda-sutil rounded-3xl p-5 transition-all shadow-sm group/card hover:shadow-premium hover:-translate-y-1"
    >
      {/* Menu Superior Direito */}
      <div className="absolute top-4 right-4 z-30" ref={menuRef}>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              definirMenuAberto(!menuAberto);
            }}
            className={`p-2 rounded-xl transition-all ${menuAberto ? "bg-zinc-100 dark:bg-white/10 text-primary dark:text-white" : "text-muted-foreground hover:bg-zinc-500/10 dark:hover:bg-white/10 hover:text-primary dark:hover:text-white"}`}
          >
            <MoreVertical size={16} strokeWidth={3} />
          </button>

          <AnimatePresence>
            {menuAberto && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-card border border-borda-sutil rounded-2xl shadow-2xl z-50 overflow-hidden p-1.5"
              >
                <div className="p-1.5 space-y-0.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); aoVerHistorico(cliente); definirMenuAberto(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-[10px] font-black text-muted-foreground hover:bg-muted hover:text-indigo-500 rounded-xl transition-all uppercase tracking-[0.15em]"
                  >
                    <HistoryIcon size={14} />
                    Histórico
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); aoEditar(cliente); definirMenuAberto(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-[10px] font-black text-muted-foreground hover:bg-muted hover:text-sky-500 rounded-xl transition-all uppercase tracking-[0.15em]"
                  >
                    <Pencil size={14} />
                    Editar
                  </button>

                   <div className="h-px bg-borda-sutil mx-2 my-1" />

                  <button
                    onClick={(e) => { e.stopPropagation(); aoRemover(cliente); definirMenuAberto(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-[10px] font-black text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all uppercase tracking-[0.15em]"
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

      <div className="flex flex-col h-full justify-between gap-5">
        {/* Identificação & Métricas */}
        <div className="flex items-center gap-4 pr-10">
          <div
            className={`w-12 h-12 shrink-0 rounded-full bg-gradient-to-br flex items-center justify-center text-sm font-black border-2 shadow-lg ${obterCorAvatar(cliente.nome)}`}
          >
            {obterIniciais(cliente.nome)}
          </div>

          <div className="flex-1 min-w-0">
             <h3 className="text-sm font-black text-primary tracking-tight truncate mb-1.5">
              {cliente.nome}
            </h3>
            
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <span className="text-emerald-600 dark:text-emerald-400">
                {centavosParaReais(cliente.ltvCentavos)}
              </span>
              <span className="w-1 h-1 rounded-full bg-borda-sutil" />
              <span>
                {pluralizar(cliente.totalProdutos, "Projeto", "Projetos")}
              </span>
            </div>
          </div>
        </div>

        {/* Rodapé - Contatos em Pílulas */}
        <div className="flex items-center gap-2 pt-4 border-t border-borda-sutil mt-auto">
          <Dica texto="Chamar no WhatsApp" posicao="cima">
            <button
              onClick={abrirWhatsapp}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all group/btn"
            >
              <MessageCircle size={14} strokeWidth={2.5} className="group-hover/btn:scale-110 transition-transform" />
            </button>
          </Dica>

          <Dica texto={copiado === "E-mail" ? "Copiado!" : "Copiar E-mail"} posicao="cima">
            <button
              onClick={() => copiarParaAreaTransferencia(cliente.email, "E-mail")}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500 hover:text-white transition-all group/btn"
            >
              <Mail size={14} strokeWidth={2.5} className="group-hover/btn:scale-110 transition-transform" />
            </button>
          </Dica>

          <Dica texto={copiado === "Telefone" ? "Copiado!" : "Copiar Telefone"} posicao="cima">
            <button
              onClick={() => copiarParaAreaTransferencia(cliente.telefone, "Telefone")}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all group/btn"
            >
              <Phone size={14} strokeWidth={2.5} className="group-hover/btn:scale-110 transition-transform" />
            </button>
          </Dica>
        </div>
      </div>
    </motion.div>
  );
}
