import { useState, useRef, useEffect } from "react";
import { Plus, Calculator, Printer, UserPlus, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

export function BotaoAcaoRapidaMobile() {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navegar = useNavigate();
  const localizacao = useLocation();

  // Não exibe o FAB na Landing Page ou Tela de Login
  const ocultarEmRotas = ["/", "/acesso", "/cadastro", "/politica-privacidade", "/termos-uso"];
  const ehPublico = ocultarEmRotas.includes(localizacao.pathname) || localizacao.pathname.startsWith("/o/");

  useEffect(() => {
    const clicarFora = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAberto(false);
      }
    };
    if (aberto) {
      document.addEventListener("mousedown", clicarFora);
    }
    return () => document.removeEventListener("mousedown", clicarFora);
  }, [aberto]);

  if (ehPublico) return null;

  const acoes = [
    {
      label: "Novo Orçamento",
      icone: Calculator,
      cor: "bg-sky-500 text-white shadow-sky-500/30",
      aoClicar: () => {
        setAberto(false);
        navegar("/calculadora");
      },
    },
    {
      label: "Lançar Impressão",
      icone: Printer,
      cor: "bg-indigo-500 text-white shadow-indigo-500/30",
      aoClicar: () => {
        setAberto(false);
        navegar("/projetos");
      },
    },
    {
      label: "Novo Cliente",
      icone: UserPlus,
      cor: "bg-emerald-500 text-white shadow-emerald-500/30",
      aoClicar: () => {
        setAberto(false);
        navegar("/clientes");
      },
    },
    {
      label: "Novo Lançamento",
      icone: DollarSign,
      cor: "bg-rose-500 text-white shadow-rose-500/30",
      aoClicar: () => {
        setAberto(false);
        navegar("/financeiro");
      },
    },
  ];

  return (
    <div ref={ref} className="md:hidden fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 z-50 select-none">
      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="flex flex-col items-end gap-3 mb-3 pr-0.5"
          >
            {acoes.map((acao, index) => {
              const Icone = acao.icone;
              return (
                <motion.button
                  key={acao.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={acao.aoClicar}
                  className="flex items-center gap-2.5 group cursor-pointer active:scale-95 touch-target"
                >
                  <span className="px-3 py-1.5 rounded-xl bg-zinc-900/90 dark:bg-zinc-900/95 text-white text-[10px] font-black uppercase tracking-wider shadow-lg backdrop-blur-md border border-white/10 whitespace-nowrap">
                    {acao.label}
                  </span>
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 ${acao.cor}`}>
                    <Icone size={18} strokeWidth={2.5} />
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setAberto(!aberto)}
        aria-label="Abrir menu de ações rápidas"
        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all duration-300 active:scale-90 touch-target border border-white/20 ${
          aberto
            ? "bg-zinc-900 dark:bg-zinc-800 rotate-45 shadow-black/40"
            : "bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 shadow-sky-500/40"
        }`}
      >
        <Plus size={22} strokeWidth={3} />
      </button>
    </div>
  );
}
