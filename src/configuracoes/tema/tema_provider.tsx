import { createContext, useContext, ReactNode } from "react";
import { usarTema } from "./logica/usar_tema";
import type { CorPrimaria, ModoTema, TipoFonte } from "@/compartilhado/tipos/modelos";

type TemaContexto = {
  modoTema: ModoTema;
  definirModoTema: (modo: ModoTema) => void;
  alternarTema: () => void;
  corPrimaria: CorPrimaria;
  definirCorPrimaria: (cor: CorPrimaria) => void;
  fonte: TipoFonte;
  definirFonte: (fonte: TipoFonte) => void;
  paletaPrimaria: Record<CorPrimaria, { hex: string; rgb: string }>;
};

const ContextoTema = createContext<TemaContexto | null>(null);

export function ProvedorTema({ children }: { children: ReactNode }) {
  const tema = usarTema();

  return <ContextoTema.Provider value={tema}>{children}</ContextoTema.Provider>;
}

export function usarContextoTema() {
  const contexto = useContext(ContextoTema);

  if (!contexto) {
    throw new Error("usarContextoTema deve estar dentro do ProvedorTema");
  }

  return contexto;
}
