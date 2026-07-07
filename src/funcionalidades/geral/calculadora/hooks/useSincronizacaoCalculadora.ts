import { useEffect, useState } from "react";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { useArmazemConfiguracoes } from "@/funcionalidades/sistema/configuracoes/estado/armazemConfiguracoes";

interface OpcoesSincronizacao {
  armazem: any; // Instância do useArmazemCalculadora
  nomeProjeto: string;
  descricaoProjeto: string;
  clienteProjetoId: string;
  impressoraSelecionadaId: string;
  setNomeProjeto: (v: string) => void;
  setDescricaoProjeto: (v: string) => void;
  setClienteProjetoId: (v: string) => void;
  setImpressoraSelecionadaId: (v: string) => void;
}

export function useSincronizacaoCalculadora({
  armazem,
  nomeProjeto,
  descricaoProjeto,
  clienteProjetoId,
  impressoraSelecionadaId,
  setNomeProjeto,
  setDescricaoProjeto,
  setClienteProjetoId,
  setImpressoraSelecionadaId
}: OpcoesSincronizacao) {
  const config = useArmazemConfiguracoes();
  const { usuario } = useAutenticacao();
  
  const [autoSalvar, setAutoSalvar] = useState(true);
  const [carregouNuvemInicial, setCarregouNuvemInicial] = useState(false);

  // 📥 Inicializa Histórico e Rascunho da Nuvem (uma única vez)
  useEffect(() => {
    if (!config.carregando && !carregouNuvemInicial && config.calculadoraMeta) {
      if (config.calculadoraMeta.historico) {
        armazem.definirHistorico(config.calculadoraMeta.historico);
      }
      if (config.calculadoraMeta.ultimaImpressoraId) {
        setImpressoraSelecionadaId(config.calculadoraMeta.ultimaImpressoraId);
      }
      if (config.calculadoraMeta.autoSalvar !== undefined) {
        setAutoSalvar(config.calculadoraMeta.autoSalvar);
      }
      if (config.calculadoraMeta.rascunho && config.calculadoraMeta.autoSalvar !== false) {
        armazem.restaurarRascunho(config.calculadoraMeta.rascunho.parametros);
        setNomeProjeto(config.calculadoraMeta.rascunho.nomeProjeto || "");
        setDescricaoProjeto(config.calculadoraMeta.rascunho.descricaoProjeto || "");
        setClienteProjetoId(config.calculadoraMeta.rascunho.clienteProjetoId || "");
      }
      setCarregouNuvemInicial(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.carregando]);

  // 📤 Debounce para Salvar Rascunho na Nuvem
  useEffect(() => {
    if (!carregouNuvemInicial || !autoSalvar) return;
    
    const timeoutId = setTimeout(async () => {
      const parametrosAtuais = armazem.obterParametros();
      const novaMeta = {
        ...config.calculadoraMeta,
        autoSalvar,
        ultimaImpressoraId: impressoraSelecionadaId,
        historico: armazem.historico,
        rascunho: {
          nomeProjeto,
          descricaoProjeto,
          clienteProjetoId,
          parametros: parametrosAtuais
        }
      };
      config.definirCalculadoraMeta(novaMeta);
      if (usuario?.uid) {
        await config.salvarNoD1(usuario.uid);
      }
    }, 2500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    autoSalvar,
    nomeProjeto,
    descricaoProjeto,
    clienteProjetoId,
    impressoraSelecionadaId,
    armazem.materiaisSelecionados,
    armazem.insumosSelecionados,
    armazem.itensPosProcesso,
    armazem.resultado.precoSugerido,
    armazem.historico,
    carregouNuvemInicial
  ]);

  return { autoSalvar, setAutoSalvar, carregouNuvemInicial };
}
