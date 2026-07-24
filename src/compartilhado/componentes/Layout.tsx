import { ReactNode, useState } from "react";
import { BarraLateral } from "./BarraLateral";
import { Cabecalho } from "./Cabecalho";
import { ProvedorCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { useAutoLogout } from "@/compartilhado/hooks/useAutoLogout";
import { useLocation, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useArmazemDispositivo } from "@/compartilhado/estado/armazemDispositivo";
import { BarraNavegacaoMobile } from "./BarraNavegacaoMobile";
import { AnimatePresence, motion } from "framer-motion";
import { LimiteDeErro } from "./LimiteDeErro";

import { ModalAcessibilidade } from "./ModalAcessibilidade";
import { BarraVocalizacaoFlutuante } from "./BarraVocalizacaoFlutuante";

type PropriedadesLayout = {
  children?: ReactNode;
};

export function Layout({ children }: PropriedadesLayout) {
  const [sidebarAberta, definirSidebarAberta] = useState(false);
  const [modalAcessibilidadeAberto, setModalAcessibilidadeAberto] = useState(false);
  const location = useLocation();
  const modoDesempenho = useArmazemDispositivo(s => s.modoDesempenho);

  // Segurança: logout automático após 30 min de inatividade
  useAutoLogout();

  // Atalho global Alt + A para Acessibilidade (Lei 13.146/2015)
  useEffect(() => {
    function lidarComAcessibilidade(e: KeyboardEvent) {
      if (e.altKey && (e.key === "a" || e.key === "A")) {
        e.preventDefault();
        setModalAcessibilidadeAberto(prev => !prev);
      }
    }
    window.addEventListener("keydown", lidarComAcessibilidade);
    return () => window.removeEventListener("keydown", lidarComAcessibilidade);
  }, []);

  // Acionador (Trigger) do Modo Desempenho no Corpo do Site
  useEffect(() => {
    if (modoDesempenho) {
      document.body.classList.add('modo-desempenho');
    } else {
      document.body.classList.remove('modo-desempenho');
    }
  }, [modoDesempenho]);

  const scrollClasse = location.pathname.startsWith("/projetos") ? "overflow-hidden" : "overflow-y-auto";

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

          <main className={`flex-1 min-h-0 flex flex-col relative scroll-smooth z-10 ${scrollClasse}`}>
            <div className="flex-1 w-full max-w-[1600px] mx-auto pt-2 px-6 pb-20 md:pt-3 md:px-8 md:pb-8 lg:pt-4 lg:px-10 lg:pb-10 flex flex-col relative min-h-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex-1 flex flex-col min-h-0"
                >
                  <LimiteDeErro>
                    {children || <Outlet />}
                  </LimiteDeErro>
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
        
        {/* Barra de Navegação Inferior (Apenas Mobile) */}
        <BarraNavegacaoMobile />

        {/* Modal Global de Acessibilidade (Lei 13.146/2015) */}
        <ModalAcessibilidade
          aberto={modalAcessibilidadeAberto}
          aoFechar={() => setModalAcessibilidadeAberto(false)}
        />

        {/* Player Flutuante de Vocalização de Tela em todo o Site */}
        <BarraVocalizacaoFlutuante />
      </div>
    </ProvedorCabecalho>
  );
}
