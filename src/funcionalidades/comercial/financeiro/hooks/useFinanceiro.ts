import { useEffect, useCallback, useMemo } from "react";
import { CriarLancamentoInput, LancamentoFinanceiro } from "../tipos";
import { servicoFinanceiro } from "../servicos/servicoFinanceiro";
import { apiFinanceiro } from "../servicos/apiFinanceiro";
import { toast } from "react-hot-toast";
import { ErroPrintLog } from "@/compartilhado/utilitarios/excecoes";
import { useArmazemFinanceiro } from "../estado/armazemFinanceiro";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";

export function useFinanceiro() {
  // Seletores estáveis para evitar re-renderizações desnecessárias
  const lancamentos = useArmazemFinanceiro((s) => s.lancamentos);
  const resumo = useArmazemFinanceiro((s) => s.resumo);
  const carregando = useArmazemFinanceiro((s) => s.carregando);
  const filtroTipo = useArmazemFinanceiro((s) => s.filtroTipo);
  const termoBusca = useArmazemFinanceiro((s) => s.termoBusca);
  const ordenacao = useArmazemFinanceiro((s) => s.ordenacao);
  const ordemInvertida = useArmazemFinanceiro((s) => s.ordemInvertida);

  // Ações (também obtidas via seletor para garantir estabilidade absoluta)
  const definirCarregando = useArmazemFinanceiro((s) => s.definirCarregando);
  const definirLancamentos = useArmazemFinanceiro((s) => s.definirLancamentos);
  const definirResumo = useArmazemFinanceiro((s) => s.definirResumo);
  const definirFiltroTipo = useArmazemFinanceiro((s) => s.definirFiltroTipo);
  const ordenarPor = useArmazemFinanceiro((s) => s.ordenarPor);
  const inverterOrdem = useArmazemFinanceiro((s) => s.inverterOrdem);
  const pesquisar = useArmazemFinanceiro((s) => s.pesquisar);

  const { usuario } = useAutenticacao();
  const usuarioId = usuario?.uid;

  // Gerado uma vez por sessão do hook para agrupar operações relacionadas
  const rastreioId = useMemo(() => crypto.randomUUID(), []);

  const carregarDados = useCallback(async () => {
    if (!usuarioId) return;
    try {
      definirCarregando(true);
      const [dadosLancamentos, dadosResumo] = await Promise.all([
        servicoFinanceiro.buscarLancamentos(usuarioId, rastreioId),
        servicoFinanceiro.obterResumo(usuarioId, rastreioId),
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
  }, [rastreioId, definirCarregando, definirLancamentos, definirResumo, usuarioId]);

  const adicionarLancamento = async (dados: CriarLancamentoInput) => {
    if (!usuarioId) return;
    try {
      const novo = await servicoFinanceiro.registrarLancamento(dados, usuarioId, rastreioId);
      toast.success("Lançamento registrado!");
      await carregarDados();
      return novo;
    } catch (erro) {
      const mensagem = erro instanceof ErroPrintLog ? erro.mensagem : "Erro ao registrar lançamento.";
      toast.error(mensagem);
      throw erro;
    }
  };

  const atualizarLancamento = async (dados: Partial<LancamentoFinanceiro> & { id: string }) => {
    if (!usuarioId) return;
    try {
      await apiFinanceiro.atualizar(dados);
      toast.success("Lançamento atualizado!");
      await carregarDados();
    } catch (erro) {
      toast.error("Erro ao atualizar lançamento.");
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
    atualizarLancamento,
    removerLancamento: async (id: string) => {
      if (!usuarioId) return;
      try {
        await apiFinanceiro.remover(id, usuarioId);
        toast.success("Lançamento removido.");
        await carregarDados();
      } catch (erro) {
        toast.error("Erro ao remover lançamento do banco.");
      }
    },
    recarregar: carregarDados,
    rastreioId,
  };
}
