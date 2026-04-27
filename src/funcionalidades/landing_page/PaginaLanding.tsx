import { Cabecalho } from "./componentes/Cabecalho";
import { Apresentacao } from "./componentes/Apresentacao";
import { Demonstracao } from "./componentes/Demonstracao";
import { Beneficios } from "./componentes/Beneficios";
import { Precificacao } from "./componentes/Precificacao";
import { ChamadaAcao } from "./componentes/CTA";
import { Rodape } from "./componentes/Rodape";

export function PaginaLanding() {
  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white selection:bg-[#0ea5e9] selection:text-white overflow-x-hidden">
      <Cabecalho />
      <Apresentacao />
      <Demonstracao />
      <Beneficios />
      <Precificacao />
      <ChamadaAcao />
      <Rodape />
    </div>
  );
}
