import { createContext, useContext, ReactNode, useMemo, useCallback } from "react";

import { useArmazemConfiguracoes } from "@/funcionalidades/sistema/configuracoes/estado/armazemConfiguracoes";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";

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

export function useBeta() {
  return useContext(ContextoBeta);
}

const PADRAO_BETA = {
  participarPrototipos: false,
  betaMultiEstudio: false,
  betaOrcamentosMagicos: false,
  betaEstoqueInteligente: false,
  betaSimuladorMargem: false,
  templateOrcamento: "Olá, tudo bem? 👋\n\nAqui está o orçamento do seu projeto:\n\n*Serviço:* Impressão 3D de Alta Qualidade 🖨️\n*Estúdio:* {estudio}\n*Investimento:* {valor}\n\n_Prazo de produção e entrega sob consulta._\n\nFico à disposição para fecharmos! 🚀",
  limiteAlertaEstoque: 500,
};

export function ProvedorBeta({ children }: { children: ReactNode }) {
  const { usuario } = useAutenticacao();
  const betaConfig = useArmazemConfiguracoes((s) => s.calculadoraMeta?.beta);
  const calculadoraMeta = useArmazemConfiguracoes((s) => s.calculadoraMeta);
  const definirCalculadoraMeta = useArmazemConfiguracoes((s) => s.definirCalculadoraMeta);
  const salvarNoD1 = useArmazemConfiguracoes((s) => s.salvarNoD1);

  const preferencias = useMemo(() => ({
    ...PADRAO_BETA,
    ...(betaConfig || {})
  }), [betaConfig]);

  const atualizar = useCallback(async (novas: Partial<typeof PADRAO_BETA>) => {
    const atualizado = { ...preferencias, ...novas };
    const novaMeta = {
      ...calculadoraMeta,
      beta: atualizado
    };
    definirCalculadoraMeta(novaMeta);
    if (usuario?.uid) {
      await salvarNoD1(usuario.uid);
    }
  }, [preferencias, calculadoraMeta, definirCalculadoraMeta, salvarNoD1, usuario?.uid]);

  const resetarTudo = useCallback(async () => {
    const novaMeta = {
      ...calculadoraMeta,
      beta: PADRAO_BETA
    };
    definirCalculadoraMeta(novaMeta);
    if (usuario?.uid) {
      await salvarNoD1(usuario.uid);
    }
  }, [calculadoraMeta, definirCalculadoraMeta, salvarNoD1, usuario?.uid]);

  const valor: ContextoBetaProps = useMemo(() => ({
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
  }), [preferencias, atualizar, resetarTudo]);

  return <ContextoBeta.Provider value={valor}>{children}</ContextoBeta.Provider>;
}
