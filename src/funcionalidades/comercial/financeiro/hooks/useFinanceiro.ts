import { useEffect, useCallback, useMemo, useState } from "react";
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
  const adicionarOuAtualizarLancamento = useArmazemFinanceiro((s) => s.adicionarOuAtualizarLancamento);
  const removerLancamentoNoEstado = useArmazemFinanceiro((s) => s.removerLancamentoNoEstado);

  const { usuario } = useAutenticacao();
  const usuarioId = usuario?.uid;
  const [erro, setErro] = useState(false);

  // Gerado uma vez por sessão do hook para agrupar operações relacionadas
  const rastreioId = useMemo(() => crypto.randomUUID(), []);

  const carregarDados = useCallback(async () => {
    if (!usuarioId) return;
    try {
      setErro(false);
      definirCarregando(true);
      const [dadosLancamentos, dadosResumo] = await Promise.all([
        servicoFinanceiro.buscarLancamentos(usuarioId, rastreioId),
        servicoFinanceiro.obterResumo(usuarioId, rastreioId),
      ]);

      // Atualiza tudo de uma vez para minimizar re-renderizações
      definirLancamentos(dadosLancamentos);
      definirResumo(dadosResumo);
    } catch (erro) {
      setErro(true);
      const mensagem = erro instanceof ErroPrintLog ? erro.mensagem : "Erro ao carregar dados financeiros.";
      toast.error(mensagem);
    } finally {
      definirCarregando(false);
    }
  }, [rastreioId, definirCarregando, definirLancamentos, definirResumo, usuarioId]);

  const adicionarLancamento = async (dados: CriarLancamentoInput) => {
    if (!usuarioId) return;
    const id = crypto.randomUUID();
    const lancamentoOtimista: LancamentoFinanceiro = {
      id,
      idUsuario: usuarioId,
      tipo: dados.tipo,
      valorCentavos: dados.valorCentavos,
      descricao: dados.descricao,
      categoria: dados.categoria || "Outros",
      dataCriacao: new Date(),
    };

    // ⚡️ OTIMISTA
    adicionarOuAtualizarLancamento(lancamentoOtimista);

    try {
      const novo = await servicoFinanceiro.registrarLancamento({ ...dados, id } as any, usuarioId, rastreioId);
      adicionarOuAtualizarLancamento(novo); // Sincroniza dados da API
      toast.success("Lançamento registrado!");
      return novo;
    } catch (erro) {
      // 🔙 ROLLBACK
      removerLancamentoNoEstado(id);
      const mensagem = erro instanceof ErroPrintLog ? erro.mensagem : "Erro ao registrar lançamento. Alteração revertida.";
      toast.error(mensagem);
      throw erro;
    }
  };

  const atualizarLancamento = async (dados: Partial<LancamentoFinanceiro> & { id: string }) => {
    if (!usuarioId) return;
    const antigo = lancamentos.find(l => l.id === dados.id);
    if (!antigo) return;

    const atualizado: LancamentoFinanceiro = {
      ...antigo,
      ...dados
    } as any;

    // ⚡️ OTIMISTA
    adicionarOuAtualizarLancamento(atualizado);

    try {
      await apiFinanceiro.atualizar(dados);
      toast.success("Lançamento atualizado!");
    } catch (erro) {
      // 🔙 ROLLBACK
      adicionarOuAtualizarLancamento(antigo);
      toast.error("Erro ao atualizar lançamento. Alteração revertida.");
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
    erro,

    // Ações
    definirFiltroTipo,
    ordenarPor,
    inverterOrdem,
    pesquisar,
    adicionarLancamento,
    atualizarLancamento,
    removerLancamento: async (id: string) => {
      if (!usuarioId) return;
      const antigo = lancamentos.find(l => l.id === id);
      if (!antigo) return;

      // ⚡️ OTIMISTA
      removerLancamentoNoEstado(id);

      try {
        await apiFinanceiro.remover(id, usuarioId);
        toast.success("Lançamento removido.");
      } catch (erro) {
        // 🔙 ROLLBACK
        adicionarOuAtualizarLancamento(antigo);
        toast.error("Erro ao remover lançamento. Alteração revertida.");
      }
    },
    recarregar: carregarDados,
    rastreioId,
  };
}
