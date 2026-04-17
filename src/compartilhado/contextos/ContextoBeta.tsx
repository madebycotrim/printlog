import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { registrar } from "@/compartilhado/utilitarios/registrador";

interface ContextoBetaProps {
  participarPrototipos: boolean;
  betaMultiEstudio: boolean;
  betaRelatorios: boolean;
  definirParticiparPrototipos: (v: boolean) => void;
  definirBetaMultiEstudio: (v: boolean) => void;
  definirBetaRelatorios: (v: boolean) => void;
  resetarTudo: () => void;
}

const ContextoBeta = createContext<ContextoBetaProps>({
  participarPrototipos: false,
  betaMultiEstudio: false,
  betaRelatorios: false,
  definirParticiparPrototipos: () => {},
  definirBetaMultiEstudio: () => {},
  definirBetaRelatorios: () => {},
  resetarTudo: () => {},
});

export function usarBeta() {
  return useContext(ContextoBeta);
}

const CHAVE_BETA = "printlog:beta_preferencias" as const;

export function ProvedorBeta({ children }: { children: ReactNode }) {
  const [preferencias, setPreferencias] = useState({
    participarPrototipos: false,
    betaMultiEstudio: false,
    betaRelatorios: false,
  });

  useEffect(() => {
    const salvo = localStorage.getItem(CHAVE_BETA);
    if (salvo) {
      try {
        setPreferencias(JSON.parse(salvo));
      } catch (e) {
        registrar.error({ rastreioId: crypto.randomUUID() }, "Erro ao carregar preferências beta", e);
      }
    }
  }, []);

  const atualizar = (novas: Partial<typeof preferencias>) => {
    setPreferencias((prev) => {
      const atualizado = { ...prev, ...novas };
      localStorage.setItem(CHAVE_BETA, JSON.stringify(atualizado));
      return atualizado;
    });
  };

  const resetarTudo = () => {
    const reset = {
      participarPrototipos: false,
      betaMultiEstudio: false,
      betaRelatorios: false,
    };
    localStorage.setItem(CHAVE_BETA, JSON.stringify(reset));
    setPreferencias(reset);
  };

  const valor: ContextoBetaProps = {
    participarPrototipos: preferencias.participarPrototipos,
    betaMultiEstudio: preferencias.betaMultiEstudio,
    betaRelatorios: preferencias.betaRelatorios,
    definirParticiparPrototipos: (v) => atualizar({ participarPrototipos: v }),
    definirBetaMultiEstudio: (v) => atualizar({ betaMultiEstudio: v }),
    definirBetaRelatorios: (v) => atualizar({ betaRelatorios: v }),
    resetarTudo,
  };

  return <ContextoBeta.Provider value={valor}>{children}</ContextoBeta.Provider>;
}
