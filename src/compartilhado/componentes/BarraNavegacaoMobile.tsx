import { NavLink } from "react-router-dom";
import { Calculator, Package, LayoutDashboard, FolderKanban, ReceiptText } from "lucide-react";
import { motion } from "framer-motion";

export function BarraNavegacaoMobile() {
  const rotas = [
    { caminho: "/", icone: LayoutDashboard, rotulo: "Painel" },
    { caminho: "/insumos", icone: Package, rotulo: "Insumos" },
    { caminho: "/calculadora", icone: Calculator, rotulo: "Calculadora" },
    { caminho: "/projetos", icone: FolderKanban, rotulo: "Projetos" },
    { caminho: "/financeiro", icone: ReceiptText, rotulo: "Financeiro" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-200 dark:border-white/5 pb-safe pt-2 px-2 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      <nav className="flex justify-around items-center">
        {rotas.map((rota) => (
          <NavLink
            key={rota.caminho}
            to={rota.caminho}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center w-full py-2 transition-colors ${
                isActive ? "text-cyan-600 dark:text-cyan-400" : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <rota.icone size={22} strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && (
                    <motion.div
                      layoutId="bottom-nav-indicator"
                      className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </div>
                <span className="text-[10px] mt-1.5 font-medium tracking-tight">
                  {rota.rotulo}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
