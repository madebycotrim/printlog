import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { registrar } from "@/compartilhado/utilitarios/registrador";

interface ContextoBetaProps {
  participarPrototipos: boolean;
  betaMultiEstudio: boolean;
  betaOrcamentosMagicos: boolean;
  betaEstoqueInteligente: boolean;
  betaSimuladorMargem: boolean;
  templateOrcamento: string;
  limiteAlertaEstoque: number;
  definirParticiparPrototipos: (v: boolean) => void;
  definirBetaMultiEstudio: (v: boolean) => void;
  definirBetaOrcamentosMagicos: (v: boolean) => void;
  definirBetaEstoqueInteligente: (v: boolean) => void;
  definirBetaSimuladorMargem: (v: boolean) => void;
  definirTemplateOrcamento: (v: string) => void;
  definirLimiteAlertaEstoque: (v: number) => void;
  resetarTudo: () => void;
}

const ContextoBeta = createContext<ContextoBetaProps>({
  participarPrototipos: false,
  betaMultiEstudio: false,
  betaOrcamentosMagicos: false,
  betaEstoqueInteligente: false,
  betaSimuladorMargem: false,
  templateOrcamento: "",
  limiteAlertaEstoque: 500,
  definirParticiparPrototipos: () => {},
  definirBetaMultiEstudio: () => {},
  definirBetaOrcamentosMagicos: () => {},
  definirBetaEstoqueInteligente: () => {},
  definirBetaSimuladorMargem: () => {},
  definirTemplateOrcamento: () => {},
  definirLimiteAlertaEstoque: () => {},
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
    betaOrcamentosMagicos: false,
    betaEstoqueInteligente: false,
    betaSimuladorMargem: false,
    templateOrcamento: "Olá, tudo bem? 👋\n\nAqui está o orçamento do seu projeto:\n\n*Serviço:* Impressão 3D de Alta Qualidade 🖨️\n*Estúdio:* {estudio}\n*Investimento:* {valor}\n\n_Prazo de produção e entrega sob consulta._\n\nFico à disposição para fecharmos! 🚀",
    limiteAlertaEstoque: 500,
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
      betaOrcamentosMagicos: false,
      betaEstoqueInteligente: false,
      betaSimuladorMargem: false,
      templateOrcamento: "Olá, tudo bem? 👋\n\nAqui está o orçamento do seu projeto:\n\n*Serviço:* Impressão 3D de Alta Qualidade 🖨️\n*Estúdio:* {estudio}\n*Investimento:* {valor}\n\n_Prazo de produção e entrega sob consulta._\n\nFico à disposição para fecharmos! 🚀",
      limiteAlertaEstoque: 500,
    };
    localStorage.setItem(CHAVE_BETA, JSON.stringify(reset));
    setPreferencias(reset);
  };

  const valor: ContextoBetaProps = {
    participarPrototipos: preferencias.participarPrototipos,
    betaMultiEstudio: preferencias.betaMultiEstudio,
    betaOrcamentosMagicos: preferencias.betaOrcamentosMagicos,
    betaEstoqueInteligente: preferencias.betaEstoqueInteligente,
    betaSimuladorMargem: preferencias.betaSimuladorMargem,
    templateOrcamento: preferencias.templateOrcamento,
    limiteAlertaEstoque: preferencias.limiteAlertaEstoque,
    definirParticiparPrototipos: (v) => atualizar({ participarPrototipos: v }),
    definirBetaMultiEstudio: (v) => atualizar({ betaMultiEstudio: v }),
    definirBetaOrcamentosMagicos: (v) => atualizar({ betaOrcamentosMagicos: v }),
    definirBetaEstoqueInteligente: (v) => atualizar({ betaEstoqueInteligente: v }),
    definirBetaSimuladorMargem: (v) => atualizar({ betaSimuladorMargem: v }),
    definirTemplateOrcamento: (v) => atualizar({ templateOrcamento: v }),
    definirLimiteAlertaEstoque: (v) => atualizar({ limiteAlertaEstoque: v }),
    resetarTudo,
  };

  return <ContextoBeta.Provider value={valor}>{children}</ContextoBeta.Provider>;
}
