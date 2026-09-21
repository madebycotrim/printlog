import { ReactNode, useState } from "react";
import { BarraLateral } from "./BarraLateral";
import { Cabecalho } from "./Cabecalho";
import { ProvedorCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { useAutoLogout } from "@/compartilhado/hooks/useAutoLogout";
import { useConectividade } from "@/compartilhado/hooks/useConectividade";
import { useLocation, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useArmazemDispositivo } from "@/compartilhado/estado/armazemDispositivo";
import { BarraNavegacaoMobile } from "./BarraNavegacaoMobile";
import { LimiteDeErro } from "./LimiteDeErro";

import { ModalAcessibilidade } from "./ModalAcessibilidade";
import { BarraVocalizacaoFlutuante } from "./BarraVocalizacaoFlutuante";
import { BannerAvisoGlobal } from "./BannerAvisoGlobal";

type PropriedadesLayout = {
  children?: ReactNode;
};

export function Layout({ children }: PropriedadesLayout) {
  const [sidebarAberta, definirSidebarAberta] = useState(false);
  const [modalAcessibilidadeAberto, setModalAcessibilidadeAberto] = useState(false);
  const location = useLocation();
  const modoDesempenho = useArmazemDispositivo(s => s.modoDesempenho);

  // Resiliência de rede e conectividade
  useConectividade();

  // Segurança: logout automático após 30 min de inatividade (com pré-aviso aos 29 min)
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
      <div className="flex h-screen h-screen-dvh bg-page dark:bg-zinc-950 font-sans text-primary dark:text-gray-100 transition-colors duration-300 relative overflow-hidden">
        {/* Sidebar Fixa (Desktop) / Drawer (Mobile) */}
        <BarraLateral abertaMobile={sidebarAberta} aoFechar={() => definirSidebarAberta(false)} />

        {/* Área Principal */}
        <div className="flex-1 flex flex-col min-w-0 md:ml-0 transition-all duration-300 relative overflow-hidden">
          {/* Elementos de Design de Fundo (Padrão Global) */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Grade Técnica - Restaurada */}
            <div className="absolute inset-0 bg-grid-printlog opacity-[0.05] dark:opacity-[0.1]" />
          </div>

          <BannerAvisoGlobal />
          <Cabecalho aoAbrirBarraLateral={() => definirSidebarAberta(true)} />

          <main className={`flex-1 min-h-0 flex flex-col relative scroll-smooth z-10 ${scrollClasse}`}>
            <div className="flex-1 w-full max-w-[1600px] mx-auto pt-2 px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-6 md:pt-3 md:px-8 md:pb-8 lg:pt-4 lg:px-10 lg:pb-10 flex flex-col relative min-h-0">
              <div
                key={location.pathname}
                className="flex-1 flex flex-col min-h-0 animate-in fade-in duration-150"
              >
                <LimiteDeErro>
                  {children || <Outlet />}
                </LimiteDeErro>
              </div>
            </div>
          </main>
        </div>
        
        {/* Barra de Navegação Inferior (Apenas Mobile) */}
        <BarraNavegacaoMobile aoAbrirSidebar={() => definirSidebarAberta(true)} />

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
