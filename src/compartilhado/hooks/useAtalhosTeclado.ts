import { useEffect } from "react";

type MapeamentoAtalhos = {
  /** Tecla em minúsculo (ex: "s", "k", "escape") */
  tecla: string;
  ctrlOuCmd?: boolean;
  shift?: boolean;
  alt?: boolean;
  aoAcionar: (e: KeyboardEvent) => void;
};

/**
 * Hook customizado para escutar atalhos globais de teclado no aplicativo.
 */
export function useAtalhosTeclado(atalhos: MapeamentoAtalhos[]) {
  useEffect(() => {
    function escutarTeclas(e: KeyboardEvent) {
      for (const a of atalhos) {
        const teclaIgual = e.key.toLowerCase() === a.tecla.toLowerCase();
        const ctrlOuCmdMatch = a.ctrlOuCmd ? (e.ctrlKey || e.metaKey) : true;
        const shiftMatch = a.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = a.alt ? e.altKey : !e.altKey;

        if (teclaIgual && ctrlOuCmdMatch && shiftMatch && altMatch) {
          if (a.ctrlOuCmd) {
            e.preventDefault();
          }
          a.aoAcionar(e);
          break;
        }
      }
    }

    window.addEventListener("keydown", escutarTeclas);
    return () => window.removeEventListener("keydown", escutarTeclas);
  }, [atalhos]);
}
