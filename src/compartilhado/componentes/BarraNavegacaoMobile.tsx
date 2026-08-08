import { NavLink } from "react-router-dom";
import { Calculator, LayoutDashboard, FolderKanban, ReceiptText, Menu } from "lucide-react";
import { motion } from "framer-motion";

type PropriedadesBarraNavegacaoMobile = {
  aoAbrirSidebar?: () => void;
};

export function BarraNavegacaoMobile({ aoAbrirSidebar }: PropriedadesBarraNavegacaoMobile) {
  const rotas = [
    { caminho: "/dashboard", icone: LayoutDashboard, rotulo: "Painel" },
    { caminho: "/calculadora", icone: Calculator, rotulo: "Calculadora" },
    { caminho: "/projetos", icone: FolderKanban, rotulo: "Projetos" },
    { caminho: "/financeiro", icone: ReceiptText, rotulo: "Financeiro" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl border-t border-zinc-200/80 dark:border-white/10 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] px-1 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
      <nav className="flex justify-around items-center max-w-md mx-auto">
        {rotas.map((rota) => (
          <NavLink
            key={rota.caminho}
            to={rota.caminho}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 transition-all rounded-xl active:bg-zinc-100 dark:active:bg-white/5 ${
                isActive ? "text-cyan-600 dark:text-cyan-400 font-bold" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`
            }
          >
            {({ isActive }) => (
              <motion.div
                whileTap={{ scale: 0.92 }}
                className="flex flex-col items-center justify-center w-full"
              >
                <div className="relative flex items-center justify-center">
                  <rota.icone size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && (
                    <motion.div
                      layoutId="bottom-nav-indicator"
                      className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight leading-none truncate max-w-[64px]">
                  {rota.rotulo}
                </span>
              </motion.div>
            )}
          </NavLink>
        ))}

        {/* Botão de Menu Mais */}
        <button
          onClick={aoAbrirSidebar}
          aria-label="Abrir menu de opções"
          className="flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 transition-all rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 active:bg-zinc-100 dark:active:bg-white/5"
        >
          <motion.div whileTap={{ scale: 0.92 }} className="flex flex-col items-center justify-center w-full">
            <Menu size={20} strokeWidth={2} />
            <span className="text-[10px] mt-1 tracking-tight leading-none truncate">
              Mais
            </span>
          </motion.div>
        </button>
      </nav>
    </div>
  );
}

