import { ReactNode, useState } from "react";
import { BarraLateral } from "./BarraLateral";
import { Cabecalho } from "./Cabecalho";
import { ProvedorCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { useAutoLogout } from "@/compartilhado/hooks/useAutoLogout";
import { useLocation, Outlet } from "react-router-dom";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { useEffect } from "react";
import { useArmazemDispositivo } from "@/compartilhado/estado/armazemDispositivo";
import { variantesPagina } from "@/compartilhado/utilitarios/animacoes";

type PropriedadesLayout = {
  children?: ReactNode;
};

export function Layout({ children }: PropriedadesLayout) {
  const [sidebarAberta, definirSidebarAberta] = useState(false);
  const location = useLocation();
  const modoDesempenho = useArmazemDispositivo(s => s.modoDesempenho);

  // Segurança: logout automático após 30 min de inatividade
  useAutoLogout();

  // Acionador (Trigger) do Modo Desempenho no Corpo do Site
  useEffect(() => {
    if (modoDesempenho) {
      document.body.classList.add('modo-desempenho');
    } else {
      document.body.classList.remove('modo-desempenho');
    }
  }, [modoDesempenho]);

  return (
    <ProvedorCabecalho>
      <div className="flex h-screen bg-page dark:bg-zinc-950 font-sans text-primary dark:text-gray-100 transition-colors duration-300 relative">
        {/* Sidebar Fixa (Desktop) / Drawer (Mobile) */}
        <BarraLateral abertaMobile={sidebarAberta} aoFechar={() => definirSidebarAberta(false)} />

        {/* Área Principal */}
        <div className="flex-1 flex flex-col min-w-0 md:ml-0 transition-all duration-300 relative overflow-hidden">
          {/* Elementos de Design de Fundo (Padrão Global) */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Grade Técnica - Restaurada */}
            <div className="absolute inset-0 bg-grid-printlog opacity-[0.05] dark:opacity-[0.1]" />
          </div>

          <Cabecalho aoAbrirBarraLateral={() => definirSidebarAberta(true)} />

          <main className="flex-1 min-h-0 flex flex-col relative scroll-smooth overflow-y-auto z-10">
            <MotionConfig reducedMotion={modoDesempenho ? "always" : "user"}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  variants={variantesPagina}
                  initial="inicial"
                  animate="animar"
                  exit="sair"
                  className="flex-1 w-full max-w-[1600px] mx-auto p-6 md:p-8 lg:p-10 flex flex-col relative"
                >
                  {children || <Outlet />}
                </motion.div>
              </AnimatePresence>
            </MotionConfig>
          </main>
        </div>
      </div>
    </ProvedorCabecalho>
  );
}
