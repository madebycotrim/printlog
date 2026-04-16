import { useEffect, useCallback, useMemo } from "react";
import { CriarLancamentoInput } from "../tipos";
import { servicoFinanceiro } from "../servicos/servicoFinanceiro";
import { toast } from "react-hot-toast";
import { ErroPrintLog } from "@/compartilhado/utilitarios/excecoes";
import { usarArmazemFinanceiro } from "../estado/armazemFinanceiro";

export function usarFinanceiro() {
  // Seletores estáveis para evitar re-renderizações desnecessárias
  const lancamentos = usarArmazemFinanceiro((s) => s.lancamentos);
  const resumo = usarArmazemFinanceiro((s) => s.resumo);
  const carregando = usarArmazemFinanceiro((s) => s.carregando);
  const filtroTipo = usarArmazemFinanceiro((s) => s.filtroTipo);
  const termoBusca = usarArmazemFinanceiro((s) => s.termoBusca);
  const ordenacao = usarArmazemFinanceiro((s) => s.ordenacao);
  const ordemInvertida = usarArmazemFinanceiro((s) => s.ordemInvertida);

  // Ações (também obtidas via seletor para garantir estabilidade absoluta)
  const definirCarregando = usarArmazemFinanceiro((s) => s.definirCarregando);
  const definirLancamentos = usarArmazemFinanceiro((s) => s.definirLancamentos);
  const definirResumo = usarArmazemFinanceiro((s) => s.definirResumo);
  const definirFiltroTipo = usarArmazemFinanceiro((s) => s.definirFiltroTipo);
  const ordenarPor = usarArmazemFinanceiro((s) => s.ordenarPor);
  const inverterOrdem = usarArmazemFinanceiro((s) => s.inverterOrdem);
  const pesquisar = usarArmazemFinanceiro((s) => s.pesquisar);

  // Gerado uma vez por sessão do hook para agrupar operações relacionadas
  const rastreioId = useMemo(() => crypto.randomUUID(), []);

  const carregarDados = useCallback(async () => {
    try {
      definirCarregando(true);
      const [dadosLancamentos, dadosResumo] = await Promise.all([
        servicoFinanceiro.buscarLancamentos(rastreioId),
        servicoFinanceiro.obterResumo(rastreioId),
      ]);

      // Atualiza tudo de uma vez para minimizar re-renderizações
      definirLancamentos(dadosLancamentos);
      definirResumo(dadosResumo);
    } catch (erro) {
      const mensagem = erro instanceof ErroPrintLog ? erro.mensagem : "Erro ao carregar dados financeiros.";
      toast.error(mensagem);
    } finally {
      definirCarregando(false);
    }
  }, [rastreioId, definirCarregando, definirLancamentos, definirResumo]);

  const adicionarLancamento = async (dados: CriarLancamentoInput) => {
    try {
      const novo = await servicoFinanceiro.registrarLancamento(dados, rastreioId);
      toast.success("Lançamento registrado!");
      await carregarDados(); // Recarrega para atualizar saldo e lista
      return novo;
    } catch (erro) {
      const mensagem = erro instanceof ErroPrintLog ? erro.mensagem : "Erro ao registrar lançamento.";
      toast.error(mensagem);
      throw erro;
    }
  };

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const lancamentosFiltrados = useMemo(() => {
    if (!lancamentos) return [];
    let resultado = [...lancamentos];

    // 1. Filtro por Tipo
    if (filtroTipo) {
      resultado = resultado.filter((l) => l.tipo === filtroTipo);
    }

    // 2. Filtro por Termo de Busca
    if (termoBusca) {
      const termo = termoBusca.toLowerCase();
      resultado = resultado.filter(
        (l) => l.descricao.toLowerCase().includes(termo) || l.categoria?.toLowerCase().includes(termo),
      );
    }

    // 3. Ordenação
    resultado.sort((a, b) => {
      let comp = 0;
      const dataA = a.dataCriacao instanceof Date ? a.dataCriacao.getTime() : new Date(a.dataCriacao).getTime();
      const dataB = b.dataCriacao instanceof Date ? b.dataCriacao.getTime() : new Date(b.dataCriacao).getTime();

      switch (ordenacao) {
        case "DATA":
          comp = dataA - dataB;
          break;
        case "VALOR":
          comp = (a.valorCentavos || 0) - (b.valorCentavos || 0);
          break;
        case "DESCRICAO":
          comp = (a.descricao || "").localeCompare(b.descricao || "");
          break;
      }
      return ordemInvertida ? -comp : comp;
    });

    return resultado;
  }, [lancamentos, filtroTipo, termoBusca, ordenacao, ordemInvertida]);

  return {
    // Estado
    lancamentos,
    lancamentosFiltrados,
    resumo,
    carregando,
    filtroTipo,
    ordenacao,
    ordemInvertida,

    // Ações
    definirFiltroTipo,
    ordenarPor,
    inverterOrdem,
    pesquisar,
    adicionarLancamento,
    recarregar: carregarDados,
    rastreioId,
  };
}
