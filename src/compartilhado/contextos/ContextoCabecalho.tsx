import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";

type AcaoCabecalho = {
  texto: string;
  aoClicar: () => void;
  icone?: React.ElementType;
  desabilitado?: boolean;
};

type DadosCabecalho = {
  titulo: string;
  subtitulo: string;
  placeholderBusca?: string;
  ocultarBusca?: boolean;
  ocultarNotificacoes?: boolean;
  acao?: AcaoCabecalho;
  segundaAcao?: AcaoCabecalho;
  elementoAcao?: ReactNode; // Mantido para compatibilidade ou casos customizados
  aoBuscar?: (termo: string) => void;
};

type ContextoCabecalhoTipo = {
  dados: DadosCabecalho;
  definirDados: (dados: DadosCabecalho) => void;
  limparDados: () => void;
};

const DADOS_PADRAO: DadosCabecalho = {
  titulo: "PrintLog",
  subtitulo: "Gestão de Impressão 3D",
};

const ContextoCabecalho = createContext<ContextoCabecalhoTipo | undefined>(
  undefined,
);

export function ProvedorCabecalho({ children }: { children: ReactNode }) {
  const [dados, setDados] = useState<DadosCabecalho>(DADOS_PADRAO);

  const definirDados = (novosDados: DadosCabecalho) => {
    setDados((prev) => {
      // Comparamos propriedades básicas para evitar loop infinito
      // Se as propriedades fundamentais forem iguais, não atualizamos
      // Nota: elementoAcao é difícil de comparar profundamente, 
      // então dependemos da estabilidade no chamador ou ignoramos se o resto for igual.
      const basicoIgual = 
        prev.titulo === novosDados.titulo &&
        prev.subtitulo === novosDados.subtitulo &&
        prev.ocultarBusca === novosDados.ocultarBusca &&
        prev.ocultarNotificacoes === novosDados.ocultarNotificacoes &&
        prev.placeholderBusca === novosDados.placeholderBusca &&
        prev.elementoAcao === novosDados.elementoAcao &&
        prev.acao?.texto === novosDados.acao?.texto &&
        prev.acao?.desabilitado === novosDados.acao?.desabilitado &&
        prev.segundaAcao?.texto === novosDados.segundaAcao?.texto &&
        prev.segundaAcao?.desabilitado === novosDados.segundaAcao?.desabilitado;

      if (basicoIgual) return prev;
      return novosDados;
    });
  };

  const limparDados = () => {
    setDados(DADOS_PADRAO);
  };

  return (
    <ContextoCabecalho.Provider value={{ dados, definirDados, limparDados }}>
      {children}
    </ContextoCabecalho.Provider>
  );
}

export function useCabecalho() {
  const contexto = useContext(ContextoCabecalho);
  if (!contexto) {
    throw new Error(
      "useCabecalho deve ser usado dentro de um ProvedorCabecalho",
    );
  }
  return contexto;
}

// Hook para ser usado nas páginas
export function useDefinirCabecalho(dadosInput: DadosCabecalho) {
  const { definirDados } = useCabecalho();

  // 1. Manter as funções instáveis em refs para não trigar useEffect
  const acaoCallbackRef = useRef(dadosInput.acao?.aoClicar);
  const segundaAcaoCallbackRef = useRef(dadosInput.segundaAcao?.aoClicar);
  const aoBuscarCallbackRef = useRef(dadosInput.aoBuscar);

  useEffect(() => {
    acaoCallbackRef.current = dadosInput.acao?.aoClicar;
    segundaAcaoCallbackRef.current = dadosInput.segundaAcao?.aoClicar;
    aoBuscarCallbackRef.current = dadosInput.aoBuscar;
  });

  // 2. Criar funções estáveis
  const aoClicarEstavel = useCallback(() => {
    if (acaoCallbackRef.current) {
      acaoCallbackRef.current();
    }
  }, []);

  const aoClicarSegundaEstavel = useCallback(() => {
    if (segundaAcaoCallbackRef.current) {
      segundaAcaoCallbackRef.current();
    }
  }, []);

  const aoBuscarEstavel = useCallback((termo: string) => {
    if (aoBuscarCallbackRef.current) {
      aoBuscarCallbackRef.current(termo);
    }
  }, []);

  useEffect(() => {
    // Construímos o objeto de dados usando as funções estáveis
    const dadosParaEnviar: DadosCabecalho = {
      ...dadosInput,
      acao: dadosInput.acao
        ? {
          ...dadosInput.acao,
          aoClicar: aoClicarEstavel,
        }
        : undefined,
      segundaAcao: dadosInput.segundaAcao
        ? {
          ...dadosInput.segundaAcao,
          aoClicar: aoClicarSegundaEstavel,
        }
        : undefined,
      aoBuscar: dadosInput.aoBuscar ? aoBuscarEstavel : undefined,
    };

    definirDados(dadosParaEnviar);

    // Cleanup opcional
    return () => {
      // limparDados(); // Não limpamos para evitar blink
    };
  }, [
    dadosInput.titulo,
    dadosInput.subtitulo,
    dadosInput.placeholderBusca,
    dadosInput.ocultarBusca,
    dadosInput.ocultarNotificacoes,
    dadosInput.elementoAcao,
    // Propriedades específicas da ação para disparar atualização visual
    dadosInput.acao?.texto,
    dadosInput.acao?.icone,
    dadosInput.acao?.desabilitado,
    dadosInput.segundaAcao?.texto,
    dadosInput.segundaAcao?.icone,
    dadosInput.segundaAcao?.desabilitado,
    !!dadosInput.acao,
    !!dadosInput.segundaAcao,
    !!dadosInput.aoBuscar,
  ]);
}
