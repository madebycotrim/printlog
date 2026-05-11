import { ReactNode, useState } from "react";
import { BarraLateral } from "./BarraLateral";
import { Cabecalho } from "./Cabecalho";
import { ProvedorCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { usarAutoLogout } from "@/compartilhado/hooks/usarAutoLogout";

type PropriedadesLayout = {
  children: ReactNode;
};

export function Layout({ children }: PropriedadesLayout) {
  const [sidebarAberta, definirSidebarAberta] = useState(false);

  // Segurança: logout automático após 30 min de inatividade
  usarAutoLogout();

  return (
    <ProvedorCabecalho>
      <div className="flex h-screen bg-page dark:bg-zinc-950 font-sans text-primary dark:text-gray-100 transition-colors duration-300 relative">
        {/* Sidebar Fixa (Desktop) / Drawer (Mobile) */}
        <BarraLateral abertaMobile={sidebarAberta} aoFechar={() => definirSidebarAberta(false)} />

        {/* Área Principal */}
        <div className="flex-1 flex flex-col min-w-0 md:ml-0 transition-all duration-300 relative overflow-hidden">
          {/* Elementos de Design de Fundo (Padrão Global) */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Grade Técnica */}
            <div className="absolute inset-0 bg-grid-printlog opacity-[0.03] dark:opacity-[0.05]" />
            
            {/* Glows de Profundidade */}
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-sky-500/10 blur-[120px] rounded-full dark:opacity-50" />
            <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full dark:opacity-50" />
          </div>

          <Cabecalho aoAbrirBarraLateral={() => definirSidebarAberta(true)} />

          <main className="flex-1 min-h-0 flex flex-col relative scroll-smooth overflow-y-auto z-10">
            <div className="flex-1 w-full max-w-[1600px] mx-auto p-6 md:p-8 lg:p-10 flex flex-col animate-in fade-in duration-700 slide-in-from-bottom-2">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProvedorCabecalho>
  );
}
