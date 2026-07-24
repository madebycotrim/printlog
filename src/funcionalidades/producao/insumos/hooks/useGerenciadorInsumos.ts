import { useMemo } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { useArmazemInsumos } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";
import {
  Insumo,
  RegistroMovimentacaoInsumo,
  MotivoBaixaInsumo,
} from "@/funcionalidades/producao/insumos/tipos";
import { auditoria } from "@/compartilhado/utilitarios/Seguranca";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { useEffect, useState, useCallback } from "react";
import { apiInsumos } from "../servicos/apiInsumos";
import { useDebounce } from "@/compartilhado/hooks/useDebounce";

export function useGerenciadorInsumos() {
  // -----------------------------------------------------------------------------------
  // 🎯 SELETORES OTIMIZADOS (Zustand v5)
  // -----------------------------------------------------------------------------------
  const estadoArmazem = useArmazemInsumos(
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

  const acoesArmazem = useArmazemInsumos(
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
      adicionarPagina: s.adicionarPagina,
      definirInsumos: s.definirInsumos,
    })),
  );

  const { usuario } = useAutenticacao();
  const termoDebounced = useDebounce(estadoArmazem.filtroPesquisa, 300);

  const limitePagina = 12;
  const [paginaAtual, definirPaginaAtual] = useState(0);

  // 🔄 SINCRONIZAÇÃO INICIAL COM D1
  useEffect(() => {
    if (usuario?.uid) {
      const carregarInsumos = async () => {
        acoesArmazem.definirCarregando(true);
        try {
          const dadosDoBanco = await apiInsumos.listarPaginado({
            limit: 2000,
            offset: 0,
          });
          
          acoesArmazem.definirInsumos(dadosDoBanco.items, dadosDoBanco.total);
          definirPaginaAtual(0);
          auditoria.evento("SINCRONIZACAO_INSUMOS_SUCESSO", { qtd: dadosDoBanco.items.length });
        } catch (erro) {
          console.error("Falha ao sincronizar insumos:", erro);
        } finally {
          acoesArmazem.definirCarregando(false);
        }
      };
      carregarInsumos();
    }
  }, [usuario?.uid]);

  const carregarMais = useCallback(() => {
    definirPaginaAtual((prev) => prev + 1);
  }, []);

  // -----------------------------------------------------------------------------------
  // 🧠 DERIVAÇÕES DE ESTADO (Listas e Filtragens)
  // -----------------------------------------------------------------------------------

  const insumosFiltradosEOrdenados = useMemo(() => {
    let filtrados = [...estadoArmazem.insumos];

    // 1. Filtro Texto
    if (termoDebounced) {
      const termo = termoDebounced.toLowerCase();
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
  }, [estadoArmazem.insumos, termoDebounced, estadoArmazem.filtroCategoria, estadoArmazem.ordenacao, estadoArmazem.ordemInvertida]);

  // Client-side pagination slicing
  const insumosExibidos = useMemo(() => {
    const maxItems = (paginaAtual + 1) * limitePagina;
    return insumosFiltradosEOrdenados.slice(0, maxItems);
  }, [insumosFiltradosEOrdenados, paginaAtual]);

  const temMais = insumosExibidos.length < insumosFiltradosEOrdenados.length;

  const agrupadosPorCategoria = useMemo(() => {
    const grupos = new Map<string, Insumo[]>();
    insumosExibidos.forEach((i) => {
      if (!grupos.has(i.categoria)) grupos.set(i.categoria, []);
      grupos.get(i.categoria)!.push(i);
    });

    return Array.from(grupos.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [insumosExibidos]);

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
        itemFracionavel: dados.itemFracionavel || false,
        rendimentoTotal: dados.rendimentoTotal,
        unidadeConsumo: dados.unidadeConsumo,
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

      if (usuario?.uid) {
        // ⚡️ OTIMISTA: Atualiza o estado local e fecha o modal IMEDIATAMENTE
        const insumoAntigo = estadoArmazem.insumos.find(i => i.id === id);
        acoesArmazem.adicionarOuAtualizarInsumo(insumoCompleto);
        acoesArmazem.fecharEditar();
        
        try {
          // Persiste no D1 em background
          await apiInsumos.salvar(insumoCompleto, usuario.uid);
          auditoria.evento("SALVAR_INSUMO", { id, eEdicao, nome: insumoCompleto.nome });
          toast.success(eEdicao ? "Insumo atualizado." : "Novo insumo rastreado na base.");
        } catch (erro) {
          // 🔙 ROLLBACK: Em caso de falha, reverte a interface
          if (insumoAntigo) {
            acoesArmazem.adicionarOuAtualizarInsumo(insumoAntigo);
          } else {
            acoesArmazem.removerInsumo(id);
          }
          auditoria.erro("Erro ao salvar insumo", erro);
          toast.error("Erro ao salvar o insumo. Alteração revertida.");
          acoesArmazem.abrirEditar(insumoCompleto); // Reabre com os dados
        }
      }
    } catch (erro) {
      toast.error("Erro inesperado.");
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

      if (usuario?.uid) {
        // ⚡️ OTIMISTA
        acoesArmazem.adicionarOuAtualizarInsumo(insumoAtualizado);
        acoesArmazem.fecharBaixa();

        try {
          // Persiste a baixa no D1
          await apiInsumos.atualizar(insumoAtualizado, usuario.uid, novaMovimentacao);
          auditoria.evento("BAIXA_INSUMO", { id: idInsumo, quantidade: quantidadeBaixada, motivo });
          toast.success(`${quantidadeBaixada}${insumo.unidadeMedida} subtraídos com sucesso.`);
          
          if (insumoAtualizado.quantidadeAtual <= insumoAtualizado.quantidadeMinima) {
            toast.error(`⚠️ ATENÇÃO: ${insumo.nome} atingiu nível crítico de estoque!`, { duration: 5000 });
          }
        } catch (erro) {
          // 🔙 ROLLBACK
          acoesArmazem.adicionarOuAtualizarInsumo(insumo); // Restaura o original
          auditoria.erro("Erro na baixa de insumo", erro);
          toast.error("Erro ao abater o estoque. Alteração revertida.");
          acoesArmazem.abrirBaixa(insumo);
        }
      }
    } catch (e) {
      toast.error("Erro inesperado.");
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

      if (usuario?.uid) {
        // ⚡️ OTIMISTA
        acoesArmazem.adicionarOuAtualizarInsumo(insumoAtualizado);
        acoesArmazem.fecharReposicao();

        try {
          // Persiste a reposição no D1
          await apiInsumos.atualizar(insumoAtualizado, usuario.uid, novaMovimentacao);
          auditoria.evento("REPOSICAO_INSUMO", { id: idInsumo, quantidade: quantidadeAdicionada });
          toast.success(`Estoque do insumo reabastecido!`);
        } catch (erro) {
          // 🔙 ROLLBACK
          acoesArmazem.adicionarOuAtualizarInsumo(insumo);
          auditoria.erro("Erro na reposição de insumo", erro);
          toast.error("Falha ao registrar a entrada. Alteração revertida.");
          acoesArmazem.abrirReposicao(insumo);
        }
      }
    } catch (e) {
      toast.error("Erro inesperado.");
    }
  };

  const confirmarArquivamento = async (idInsumo: string) => {
    if (!usuario?.uid) return;
    const insumoAntigo = estadoArmazem.insumos.find(i => i.id === idInsumo);
    
    // ⚡️ OTIMISTA
    acoesArmazem.removerInsumo(idInsumo);
    acoesArmazem.fecharArquivamento();

    try {
      await apiInsumos.remover(idInsumo, usuario.uid);
      auditoria.evento("REMOVER_INSUMO", { id: idInsumo });
      toast.success("Insumo removido permanentemente do banco.");
    } catch (e) {
      // 🔙 ROLLBACK
      if (insumoAntigo) {
        acoesArmazem.adicionarOuAtualizarInsumo(insumoAntigo);
      }
      auditoria.erro("Erro ao deletar insumo no banco", e);
      toast.error("Erro ao deletar. Alteração revertida.");
    }
  };

  const alternarFavorito = async (id: string) => {
    if (!usuario?.uid) return;
    const insumo = estadoArmazem.insumos.find(i => i.id === id);
    if (!insumo) return;

    const novoEstado = !insumo.favorito;
    const insumoAtualizado: Insumo = { ...insumo, favorito: novoEstado };

    try {
      acoesArmazem.adicionarOuAtualizarInsumo(insumoAtualizado);
      await apiInsumos.salvar(insumoAtualizado, usuario.uid);
      auditoria.evento("FAVORITAR_INSUMO", { id, favorito: novoEstado, nome: insumo.nome });
    } catch (erro) {
      console.error("Erro ao favoritar insumo:", erro);
      toast.error("Erro ao salvar preferência.");
      acoesArmazem.adicionarOuAtualizarInsumo({ ...insumo, favorito: !novoEstado });
    }
  };

  return {
    estado: {
      ...estadoArmazem,
      insumosFiltradosOrdenados: insumosExibidos,
      agrupadosPorCategoria,
      kpis,
      temMais,
    },
    acoes: {
      ...acoesArmazem,
      salvarInsumo,
      confirmarBaixaInsumo,
      confirmarReposicaoInsumo,
      confirmarArquivamento,
      alternarFavorito,
      carregarMais,
    },
  };
}
