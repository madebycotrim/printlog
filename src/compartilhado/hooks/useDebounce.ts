import { useState, useEffect } from "react";

export function useDebounce<T>(valor: T, atraso: number): T {
  const [valorDebounced, definirValorDebounced] = useState<T>(valor);

  useEffect(() => {
    const timer = setTimeout(() => {
      definirValorDebounced(valor);
    }, atraso);

    return () => {
      clearTimeout(timer);
    };
  }, [valor, atraso]);

  return valorDebounced;
}
