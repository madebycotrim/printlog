import { Navigate } from "react-router-dom";
import { GridWiki } from "./componentes/GridWiki";
import { SecaoFAQ } from "./componentes/SecaoFAQ";
import { ModalSuporte } from "./componentes/ModalSuporte";
import { ModalDetalhesTopico } from "./componentes/ModalDetalhesTopico";
import { RodapeLGPD } from "./componentes/RodapeLGPD";
import { ResultadosBusca } from "./componentes/ResultadosBusca";
import { BannerExclusividade } from "./componentes/BannerExclusividade";
import { useCentralMaker } from "./hooks/useCentralMaker";
import { useIdioma } from "@/compartilhado/hooks/useIdioma";

/**
 * Central Maker - Hub de inteligência técnica e suporte estratégico.
 * Disponível exclusivamente no idioma Português (pt-BR) por enquanto.
 */
export function PaginaAjuda() {
  const { idiomaAtual } = useIdioma();

  if (idiomaAtual !== "pt-BR") {
    return <Navigate to="/dashboard" replace />;
  }

  const {
    busca,
    definirBusca,
    abrirSuporte,
    definirAbrirSuporte,
    topicoSelecionado,
    definirTopicoSelecionado,
    wikiFiltrada,
    faqsFiltradas,
    todosTopicosEncontrados,
  } = useCentralMaker();

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* VISUALIZAÇÃO DE RESULTADOS DE BUSCA */}
      {busca && (
        <ResultadosBusca 
          busca={busca}
          resultados={todosTopicosEncontrados}
          aoLimpar={() => definirBusca("")}
          aoSelecionar={definirTopicoSelecionado}
        />
      )}

      {/* CONTEÚDO PRINCIPAL (OCULTO DURANTE BUSCA) */}
      {!busca && (
        <>
          <BannerExclusividade />
          <GridWiki 
            categorias={wikiFiltrada} 
            aoSelecionarTopico={definirTopicoSelecionado} 
          />
        </>
      )}

      {/* FAQ SEMPRE DISPONÍVEL (FILTRADA) */}
      <SecaoFAQ 
        faqs={faqsFiltradas} 
        aoAbrirSuporte={() => definirAbrirSuporte(true)} 
      />

      <RodapeLGPD />

      {/* MODAIS */}
      <ModalSuporte 
        aberto={abrirSuporte} 
        aoFechar={() => definirAbrirSuporte(false)} 
      />

      <ModalDetalhesTopico 
        topico={topicoSelecionado} 
        aoFechar={() => definirTopicoSelecionado(null)} 
      />
    </div>
  );
}
