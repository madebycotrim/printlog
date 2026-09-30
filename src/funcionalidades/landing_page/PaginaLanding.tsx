import { useEffect } from "react";
import { Cabecalho } from "./componentes/Cabecalho";
import { Apresentacao } from "./componentes/Apresentacao";
import { Demonstracao } from "./componentes/Demonstracao";
import { Beneficios } from "./componentes/Beneficios";
import { ChamadaAcao } from "./componentes/CTA";
import { Rodape } from "./componentes/Rodape";
import { useIdioma } from "@/compartilhado/hooks/useIdioma";
import { tradutorUniversalDOM } from "@/compartilhado/utilitarios/tradutorUniversalDOM";

import { CodigoIdioma } from "@/configuracoes/i18n";

interface PropriedadesPaginaLanding {
  idiomaUrl?: CodigoIdioma;
}

export default function PaginaLanding({ idiomaUrl }: PropriedadesPaginaLanding = {}) {
  const { idiomaAtual, mudarIdioma } = useIdioma();

  // Sincroniza o idioma da aplicação se acessado via rota com prefixo (/en ou /es)
  useEffect(() => {
    if (idiomaUrl && idiomaAtual !== idiomaUrl) {
      mudarIdioma(idiomaUrl);
    }
  }, [idiomaUrl, idiomaAtual, mudarIdioma]);

  // Atualiza tags de SEO dinâmicas da página (title, meta description, html lang)
  useEffect(() => {
    tradutorUniversalDOM.definirIdioma(idiomaAtual);
    const timer = setTimeout(() => {
      tradutorUniversalDOM.traduzirTudo();
    }, 60);

    const metaDesc = document.querySelector('meta[name="description"]');
    if (idiomaAtual === "en-US") {
      document.title = "PrintLog — 3D Printing Management & Cost Calculator";
      document.documentElement.lang = "en";
      if (metaDesc) {
        metaDesc.setAttribute(
          "content",
          "The ultimate solution for 3D printing management. Calculate exact costs, manage filaments, and scale your 3D farm with real-time analytics."
        );
      }
    } else if (idiomaAtual === "es-ES") {
      document.title = "PrintLog — Gestión para Impresión 3D y Calculadora de Costes";
      document.documentElement.lang = "es";
      if (metaDesc) {
        metaDesc.setAttribute(
          "content",
          "La solución definitiva para la gestión de impresión 3D. Calcule costes con precisión, gestione filamentos y maximice beneficios."
        );
      }
    } else {
      document.title = "PrintLog — Gestão para Impressão 3D: Do Amador às Farms";
      document.documentElement.lang = "pt-BR";
      if (metaDesc) {
        metaDesc.setAttribute(
          "content",
          "A solução definitiva para todos na Impressão 3D. Do amador iniciante ao gestor de grandes farms, o PrintLog simplifica o cálculo de custos, gestão de filamentos e lucros sem planilhas."
        );
      }
    }

    return () => clearTimeout(timer);
  }, [idiomaAtual]);

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white selection:bg-[#0ea5e9] selection:text-white overflow-x-hidden relative">
      {/* Elementos de Design de Fundo (Padrão Global) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Grade Técnica Padronizada */}
        <div className="absolute inset-0 bg-grid-printlog opacity-[0.05] dark:opacity-[0.08]" />
        
        {/* Glows de Profundidade Premium */}
        <div className="absolute top-[5%] -left-[10%] w-[60%] h-[60%] bg-sky-500/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-indigo-500/10 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10">
        <Cabecalho />
        <Apresentacao />
        <Demonstracao />
        <Beneficios />
        <ChamadaAcao />
        <Rodape />
      </div>
    </div>
  );
}
