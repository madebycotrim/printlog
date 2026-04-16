import { useMemo } from "react";
import { toast } from "react-hot-toast";
import { useShallow } from "zustand/react/shallow";
import { usarArmazemInsumos } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";
import {
  Insumo,
  RegistroMovimentacaoInsumo,
  MotivoBaixaInsumo,
  CategoriaInsumo,
} from "@/funcionalidades/producao/insumos/tipos";
import { auditoria } from "@/compartilhado/utilitarios/Seguranca";

export function usarGerenciadorInsumos() {
  // -----------------------------------------------------------------------------------
  // 🎯 SELETORES OTIMIZADOS (Zustand v5)
  // -----------------------------------------------------------------------------------
  const estadoArmazem = usarArmazemInsumos(
    useShallow((s) => ({
      insumos: s.insumos,
      carregando: s.carregando,
      filtroPesquisa: s.filtroPesquisa,
      filtroCategoria: s.filtroCategoria,
      ordenacao: s.ordenacao,
      ordemInvertida: s.ordemInvertida,
      modalCricaoAberto: s.modalCricaoAberto,
      insumoEditando: s.insumoEditando,
      modalReposicaoAberto: s.modalReposicaoAberto,
      insumoReposicao: s.insumoReposicao,
      modalBaixaAberto: s.modalBaixaAberto,
      insumoBaixa: s.insumoBaixa,
      modalArquivamentoAberto: s.modalArquivamentoAberto,
      insumoArquivamento: s.insumoArquivamento,
      modalHistoricoAberto: s.modalHistoricoAberto,
      insumoHistorico: s.insumoHistorico,
    })),
  );

  const acoesArmazem = usarArmazemInsumos(
    useShallow((s) => ({
      adicionarOuAtualizarInsumo: s.adicionarOuAtualizarInsumo,
      definirCarregando: s.definirCarregando,
      removerInsumo: s.removerInsumo,
      definirFiltroPesquisa: s.definirFiltroPesquisa,
      definirFiltroCategoria: s.definirFiltroCategoria,
      definirOrdenacao: s.definirOrdenacao,
      inverterOrdem: s.inverterOrdem,
      abrirEditar: s.abrirEditar,
      fecharEditar: s.fecharEditar,
      abrirReposicao: s.abrirReposicao,
      fecharReposicao: s.fecharReposicao,
      abrirBaixa: s.abrirBaixa,
      fecharBaixa: s.fecharBaixa,
      abrirArquivamento: s.abrirArquivamento,
      fecharArquivamento: s.fecharArquivamento,
      abrirHistorico: s.abrirHistorico,
      fecharHistorico: s.fecharHistorico,
    })),
  );

  // -----------------------------------------------------------------------------------
  // 🧠 DERIVAÇÕES DE ESTADO (Listas e Filtragens)
  // -----------------------------------------------------------------------------------

  const insumosFiltradosOrdenados = useMemo(() => {
    let filtrados = [...estadoArmazem.insumos];

    // 1. Filtro Texto
    if (estadoArmazem.filtroPesquisa) {
      const termo = estadoArmazem.filtroPesquisa.toLowerCase();
      filtrados = filtrados.filter(
        (i) =>
          i.nome.toLowerCase().includes(termo) ||
          i.categoria.toLowerCase().includes(termo) ||
          i.marca?.toLowerCase().includes(termo),
      );
    }

    // 2. Filtro Categoria
    if (estadoArmazem.filtroCategoria !== "Todas") {
      filtrados = filtrados.filter((i) => i.categoria === estadoArmazem.filtroCategoria);
    }

    // 3. Ordenação
    filtrados.sort((a, b) => {
      let comparacao = 0;
      switch (estadoArmazem.ordenacao) {
        case "nome":
          comparacao = a.nome.localeCompare(b.nome);
          break;
        case "quantidade":
          comparacao = a.quantidadeAtual - b.quantidadeAtual;
          break;
        case "custo":
          comparacao = a.custoMedioUnidade - b.custoMedioUnidade;
          break;
        case "atualizacao":
          comparacao = new Date(b.dataAtualizacao).getTime() - new Date(a.dataAtualizacao).getTime();
          break;
      }
      return estadoArmazem.ordemInvertida ? -comparacao : comparacao;
    });

    return filtrados;
  }, [
    estadoArmazem.insumos,
    estadoArmazem.filtroPesquisa,
    estadoArmazem.filtroCategoria,
    estadoArmazem.ordenacao,
    estadoArmazem.ordemInvertida,
  ]);

  const agrupadosPorCategoria = useMemo(() => {
    const grupos = new Map<CategoriaInsumo, Insumo[]>();
    insumosFiltradosOrdenados.forEach((i) => {
      if (!grupos.has(i.categoria)) grupos.set(i.categoria, []);
      grupos.get(i.categoria)!.push(i);
    });

    return Array.from(grupos.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [insumosFiltradosOrdenados]);

  const kpis = useMemo(() => {
    let valorInvestido = 0;
    let alertasBaixoEstoque = 0;

    estadoArmazem.insumos.forEach((i) => {
      valorInvestido += i.quantidadeAtual * i.custoMedioUnidade;
      if (i.quantidadeAtual <= i.quantidadeMinima) {
        alertasBaixoEstoque++;
      }
    });

    return {
      totalItens: estadoArmazem.insumos.length,
      valorInvestido,
      alertasBaixoEstoque,
    };
  }, [estadoArmazem.insumos]);

  // -----------------------------------------------------------------------------------
  // 🧠 REGRAS DE NEGÓCIO E AÇÕES
  // -----------------------------------------------------------------------------------

  const salvarInsumo = async (dados: Partial<Insumo>) => {
    try {
      const eEdicao = Boolean(dados.id);
      const id = dados.id || crypto.randomUUID();
      const agora = new Date();

      const insumoCompleto: Insumo = {
        id,
        nome: dados.nome || "",
        descricao: dados.descricao || "",
        categoria: dados.categoria || "Outros",
        unidadeMedida: dados.unidadeMedida || "un",
        quantidadeAtual: dados.quantidadeAtual || 0,
        quantidadeMinima: dados.quantidadeMinima || 0,
        custoMedioUnidade: dados.custoMedioUnidade || 0,
        linkCompra: dados.linkCompra || "",
        marca: dados.marca || "",
        historico:
          dados.historico ||
          (eEdicao
            ? []
            : [
                {
                  id: crypto.randomUUID(),
                  data: agora.toISOString(),
                  tipo: "Entrada",
                  quantidade: dados.quantidadeAtual || 0,
                  valorTotal: (dados.quantidadeAtual || 0) * (dados.custoMedioUnidade || 0),
                  observacao: "Saldo Inicial de Cadastro",
                },
              ]),
        dataCriacao: dados.dataCriacao || agora,
        dataAtualizacao: agora,
      };

      acoesArmazem.adicionarOuAtualizarInsumo(insumoCompleto);
      auditoria.evento("SALVAR_INSUMO", { id, eEdicao, nome: insumoCompleto.nome });

      toast.success(eEdicao ? "Insumo atualizado." : "Novo insumo rastreado na base.");
      acoesArmazem.fecharEditar();
    } catch (erro) {
      auditoria.erro("Erro ao salvar insumo", erro);
      toast.error("Erro ao salvar o insumo.");
    }
  };

  const confirmarBaixaInsumo = async (
    idInsumo: string,
    quantidadeBaixada: number,
    motivo: MotivoBaixaInsumo,
    observacao?: string,
  ) => {
    try {
      const insumo = estadoArmazem.insumos.find((i) => i.id === idInsumo);
      if (!insumo) throw new Error("Insumo indisponível no estado.");

      if (quantidadeBaixada > insumo.quantidadeAtual) {
        toast.error("Você não pode abater mais do que possui em estoque!");
        return;
      }

      const novaMovimentacao: RegistroMovimentacaoInsumo = {
        id: crypto.randomUUID(),
        data: new Date().toISOString(),
        tipo: "Saída",
        quantidade: quantidadeBaixada,
        motivo,
        observacao,
      };

      const insumoAtualizado: Insumo = {
        ...insumo,
        quantidadeAtual: insumo.quantidadeAtual - quantidadeBaixada,
        historico: [novaMovimentacao, ...insumo.historico],
        dataAtualizacao: new Date(),
      };

      acoesArmazem.adicionarOuAtualizarInsumo(insumoAtualizado);
      auditoria.evento("BAIXA_INSUMO", { id: idInsumo, quantidade: quantidadeBaixada, motivo });

      toast.success(`${quantidadeBaixada}${insumo.unidadeMedida} subtraídos com sucesso.`);
      acoesArmazem.fecharBaixa();

      if (insumoAtualizado.quantidadeAtual <= insumoAtualizado.quantidadeMinima) {
        toast.error(`⚠️ ATENÇÃO: ${insumo.nome} atingiu nível crítico de estoque!`, { duration: 5000 });
      }
    } catch (e) {
      auditoria.erro("Erro na baixa de insumo", e);
      toast.error("Erro ao abater o estoque deste insumo.");
    }
  };

  const confirmarReposicaoInsumo = async (
    idInsumo: string,
    quantidadeAdicionada: number,
    novoCustoTotal: number,
    observacao?: string,
  ) => {
    try {
      const insumo = estadoArmazem.insumos.find((i) => i.id === idInsumo);
      if (!insumo) return;

      const qtdAntiga = insumo.quantidadeAtual;
      const valorTotalAntigo = qtdAntiga * insumo.custoMedioUnidade;
      const novaQuantidadeAgregada = qtdAntiga + quantidadeAdicionada;
      const novoValorSoma = valorTotalAntigo + novoCustoTotal;
      const novoCustoMedio = novaQuantidadeAgregada > 0 ? novoValorSoma / novaQuantidadeAgregada : 0;

      const novaMovimentacao: RegistroMovimentacaoInsumo = {
        id: crypto.randomUUID(),
        data: new Date().toISOString(),
        tipo: "Entrada",
        quantidade: quantidadeAdicionada,
        valorTotal: novoCustoTotal,
        observacao,
      };

      const insumoAtualizado: Insumo = {
        ...insumo,
        quantidadeAtual: novaQuantidadeAgregada,
        custoMedioUnidade: novoCustoMedio,
        historico: [novaMovimentacao, ...insumo.historico],
        dataAtualizacao: new Date(),
      };

      acoesArmazem.adicionarOuAtualizarInsumo(insumoAtualizado);
      auditoria.evento("REPOSICAO_INSUMO", { id: idInsumo, quantidade: quantidadeAdicionada });

      toast.success(`Estoque do insumo reabastecido!`);
      acoesArmazem.fecharReposicao();
    } catch (e) {
      auditoria.erro("Erro na reposição de insumo", e);
      toast.error("Falha ao registrar a entrada.");
    }
  };

  const confirmarArquivamento = async (idInsumo: string) => {
    try {
      acoesArmazem.removerInsumo(idInsumo);
      auditoria.evento("REMOVER_INSUMO", { id: idInsumo });
      toast.success("O card Insumo foi permanentemente removido.");
      acoesArmazem.fecharArquivamento();
    } catch (e) {
      toast.error("Erro ao deletar histórico.");
    }
  };

  return {
    estado: {
      ...estadoArmazem,
      insumosFiltradosOrdenados,
      agrupadosPorCategoria,
      kpis,
    },
    acoes: {
      ...acoesArmazem,
      salvarInsumo,
      confirmarBaixaInsumo,
      confirmarReposicaoInsumo,
      confirmarArquivamento,
    },
  };
}
