import { Cabecalho } from "./componentes/Cabecalho";
import { Apresentacao } from "./componentes/Apresentacao";
import { Demonstracao } from "./componentes/Demonstracao";
import { Beneficios } from "./componentes/Beneficios";
import { Precificacao } from "./componentes/Precificacao";
import { ChamadaAcao } from "./componentes/CTA";
import { Rodape } from "./componentes/Rodape";

export function PaginaLanding() {
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
        <Precificacao />
        <ChamadaAcao />
        <Rodape />
      </div>
    </div>
  );
}
