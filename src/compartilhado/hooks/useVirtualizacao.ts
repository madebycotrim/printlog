import { useState, useEffect, useRef } from "react";

/**
 * Hook customizado de virtualização de listas ou grids.
 * Renderiza apenas os elementos visíveis no viewport do container de rolagem.
 * 
 * @param itens Array completo de itens
 * @param alturaItem Altura aproximada de cada linha em pixels
 * @param colunas Número de colunas no layout (1 para lista simples, >1 para grids)
 * @param margemSeguranca Pixels extras para renderizar acima e abaixo da tela (evita cintilação na rolagem rápida)
 */
export function useVirtualizacao<T>(
  itens: T[],
  alturaItem: number,
  colunas: number = 1,
  margemSeguranca: number = 250
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [alturaContainer, setAlturaContainer] = useState(600);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const tratarRolagem = () => {
      setScrollTop(el.scrollTop);
    };

    const tratarRedimensionamento = () => {
      setAlturaContainer(el.clientHeight);
    };

    // Registrar eventos
    el.addEventListener("scroll", tratarRolagem, { passive: true });
    window.addEventListener("resize", tratarRedimensionamento);

    // Medir altura inicial
    setAlturaContainer(el.clientHeight || 600);

    // Observador para caso o container mude de tamanho de forma dinâmica
    const resizeObserver = new ResizeObserver(() => {
      if (el) setAlturaContainer(el.clientHeight || 600);
    });
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener("scroll", tratarRolagem);
      window.removeEventListener("resize", tratarRedimensionamento);
      resizeObserver.disconnect();
    };
  }, []);

  const totalLinhas = Math.ceil(itens.length / colunas);
  const alturaTotal = totalLinhas * alturaItem;

  const indiceLinhaInicial = Math.max(0, Math.floor((scrollTop - margemSeguranca) / alturaItem));
  const indiceLinhaFinal = Math.min(
    totalLinhas,
    Math.ceil((scrollTop + alturaContainer + margemSeguranca) / alturaItem)
  );

  const itensVisiveis = itens.slice(
    indiceLinhaInicial * colunas,
    indiceLinhaFinal * colunas
  );

  const paddingTop = indiceLinhaInicial * alturaItem;
  const paddingBottom = Math.max(0, alturaTotal - (indiceLinhaFinal * alturaItem));

  return {
    containerRef,
    itensVisiveis,
    paddingTop,
    paddingBottom,
    alturaTotal,
  };
}
