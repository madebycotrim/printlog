import { useState, useMemo, useEffect, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { Material } from "@/funcionalidades/producao/materiais/tipos";
import {
  FiltroTipoMaterial,
  OrdenacaoMaterial,
} from "@/funcionalidades/producao/materiais/componentes/FiltrosMaterial";
import { useArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { auditoria } from "@/compartilhado/utilitarios/Seguranca";


import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { apiMateriais } from "../servicos/apiMateriais";
import { toast } from "sonner";
import { useBeta } from "@/compartilhado/contextos/ContextoBeta";

export function useGerenciadorMateriais() {
  // 🎯 SELETORES OTIMIZADOS
  const materiais = useArmazemMateriais((s) => s.materiais);
  const totalMateriaisBanco = useArmazemMateriais((s) => s.totalMateriais);
  const carregando = useArmazemMateriais((s) => s.carregando);
  const acoesArmazem = useArmazemMateriais(
    useShallow((s) => ({
      atualizarMaterial: s.atualizarMaterial,
      adicionarMaterial: s.adicionarMaterial,
      arquivarMaterial: s.arquivarMaterial,
      abaterPeso: s.abaterPeso,
      reporEstoque: s.reporEstoque,
      definirMateriais: s.definirMateriais,
      adicionarPagina: s.adicionarPagina,
      definirCarregando: s.definirCarregando,
    })),
  );

  // Estados dos Modais e Seleções (Local do Gancho)
  const [modalAberto, definirModalAberto] = useState(false);
  const [modalAbatimentoAberto, definirModalAbatimentoAberto] = useState(false);
  const [modalHistoricoAberto, definirModalHistoricoAberto] = useState(false);
  const [modalExclusaoAberto, definirModalExclusaoAberto] = useState(false);
  const [modalReposicaoAberto, definirModalReposicaoAberto] = useState(false);

  const [materialSendoEditado, definirMaterialSendoEditado] = useState<Material | null>(null);
  const [materialParaAbater, definirMaterialParaAbater] = useState<Material | null>(null);
  const [materialParaHistorico, definirMaterialParaHistorico] = useState<Material | null>(null);
  const [materialParaExcluir, definirMaterialParaExcluir] = useState<Material | null>(null);
  const [materialParaRepor, definirMaterialParaRepor] = useState<Material | null>(null);
  const [abaHistoricoInicial, definirAbaHistoricoInicial] = useState<"extrato" | "novo" | "cadastro">("extrato");

  // Estados de Filtro e Ordenação
  const [filtro, definirFiltro] = useState<FiltroTipoMaterial>("TODOS");
  const [ordenacao, definirOrdenacao] = useState<OrdenacaoMaterial>("NOME");
  const [ordemInvertida, definirOrdemInvertida] = useState(false);
  const [termoBusca, definirTermoBusca] = useState("");

  const limitePagina = 12;
  const [paginaAtual, definirPaginaAtual] = useState(0);
  const { usuario } = useAutenticacao();
  const { limiteAlertaEstoque } = useBeta();

  // 🔄 SINCRONIZAÇÃO INICIAL E BUSCA COM D1
  useEffect(() => {
    if (usuario?.uid) {
      const carregarDados = async () => {
        acoesArmazem.definirCarregando(true);
        try {
          const dadosDoBanco = await apiMateriais.listarPaginado({
            limit: 2000,
            offset: 0,
          });
          acoesArmazem.definirMateriais(dadosDoBanco.items, dadosDoBanco.total);
          definirPaginaAtual(0);
        } catch (erro) {
          console.error("Erro ao sincronizar com banco de dados:", erro);
        } finally {
          acoesArmazem.definirCarregando(false);
        }
      };
      carregarDados();
    }
  }, [usuario?.uid]);

  const carregarMais = useCallback(() => {
    definirPaginaAtual((prev) => prev + 1);
  }, []);


  // Ações de Modal
  const fecharModal = () => {
    definirMaterialSendoEditado(null);
    definirModalAberto(false);
  };

  /**
   * Salva ou atualiza um material.
   * @param dadosDoFormulario Dados brutos do formulário (Any justificado por tipagem dinâmica de campos de fatiamento).
   * @lgpd Base legal: Execução de contrato (Art. 7º, V) - Dados técnicos do material.
   */
  const salvarMaterial = async (dadosDoFormulario: any) => {
    if (!usuario?.uid) return;
    
    // Detecta se é edição pelo ID presente nos dados ou no estado
    const idParaVerificar = dadosDoFormulario.id || materialSendoEditado?.id;
    const materialExistente = materiais.find(m => m.id === idParaVerificar);
    const eEdicao = Boolean(materialExistente);
    const id = idParaVerificar || crypto.randomUUID();
    
    const materialParaSalvar: Material = eEdicao 
      ? { ...materialExistente!, ...dadosDoFormulario, id, dataAtualizacao: new Date() }
      : {
        ...dadosDoFormulario,
        id,
        pesoRestanteGramas: dadosDoFormulario.estoque >= 1 ? dadosDoFormulario.pesoGramas : 0,
        estoque: dadosDoFormulario.estoque >= 1 ? dadosDoFormulario.estoque - 1 : 0,
        arquivado: false,
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
        historicoUso: []
      };

    // ⚡️ OTIMISTA
    if (eEdicao) {
      acoesArmazem.atualizarMaterial(materialParaSalvar.id, materialParaSalvar);
    } else {
      acoesArmazem.adicionarMaterial(materialParaSalvar);
    }
    fecharModal();
    definirModalHistoricoAberto(false);

    try {
      // Persiste no Banco de Dados Real (D1)
      await apiMateriais.salvar(materialParaSalvar, usuario.uid, eEdicao);
      auditoria.evento("SALVAR_MATERIAL", { id: materialParaSalvar.id, eEdicao, nome: dadosDoFormulario.nome });
      toast.success(eEdicao ? "Material atualizado!" : "Material cadastrado com sucesso! 🚀");
    } catch (erro) {
      // 🔙 ROLLBACK
      if (eEdicao && materialExistente) {
        acoesArmazem.atualizarMaterial(materialParaSalvar.id, materialExistente);
      } else {
        acoesArmazem.arquivarMaterial(materialParaSalvar.id);
      }
      toast.error("Erro ao salvar material no banco de dados. Alteração revertida.");
      if (eEdicao) {
        definirMaterialSendoEditado(materialParaSalvar);
      }
      definirModalAberto(true);
    }
  };

  const confirmarArquivamento = async () => {
    if (materialParaExcluir && usuario?.uid) {
      const id = materialParaExcluir.id;
      const materialOriginal = { ...materialParaExcluir };

      // ⚡️ OTIMISTA
      acoesArmazem.arquivarMaterial(id);
      definirModalExclusaoAberto(false);
      definirMaterialParaExcluir(null);

      try {
        await apiMateriais.remover(id, usuario.uid);
        auditoria.evento("ARQUIVAR_MATERIAL", { id, nome: materialOriginal.nome });
        toast.success("Material arquivado com sucesso.");
      } catch (erro) {
        // 🔙 ROLLBACK
        acoesArmazem.atualizarMaterial(id, { arquivado: false });
        toast.error("Erro ao arquivar material. Alteração revertida.");
      }
    }
  };

  const confirmarAbatimentoPeso = async (qtdAbatida: number, motivo: string) => {
    if (materialParaAbater && usuario?.uid) {
      const materialOriginal = { ...materialParaAbater };
      const registroUso = {
        data: new Date().toISOString(),
        nomePeca: motivo,
        quantidadeGastaGramas: qtdAbatida,
        status: "MANUAL"
      };

      try {
        acoesArmazem.abaterPeso(materialParaAbater.id, qtdAbatida, motivo);
        
        const atualizado = encontrarMaterial(materialParaAbater.id);
        if (atualizado) {
          await apiMateriais.atualizar(atualizado, usuario.uid, registroUso);
        }

        auditoria.evento("ABATE_PESO_MATERIAL", { id: materialParaAbater.id, qtdAbatida, motivo });
        toast.success(`${qtdAbatida}g abatidos do estoque!`);
        definirModalAbatimentoAberto(false);
        definirMaterialParaAbater(null);
      } catch (erro) {
        // Rollback
        acoesArmazem.atualizarMaterial(materialParaAbater.id, materialOriginal);
        toast.error("Falha ao processar abatimento manual. Alteração revertida.");
      }
    }
  };

  const confirmarReposicaoMaterial = async (idMaterial: string, quantidadeComprada: number, precoTotalNovaCompra: number) => {
    if (!usuario?.uid) return;
    const material = materiais.find(m => m.id === idMaterial);
    if (!material) return;

    const materialOriginal = { ...material };
    
    // ⚡️ OTIMISTA
    acoesArmazem.reporEstoque(idMaterial, quantidadeComprada, precoTotalNovaCompra);
    definirModalReposicaoAberto(false);
    definirMaterialParaRepor(null);

    try {
      // Obtém o material atualizado diretamente do Zustand (evitando closure desatualizada)
      const atualizado = useArmazemMateriais.getState().materiais.find(m => m.id === idMaterial);
      if (atualizado) {
        await apiMateriais.atualizar(atualizado, usuario.uid);
      }

      auditoria.evento("REPOSICAO_MATERIAL", { id: idMaterial, quantidadeComprada });
      toast.success("Estoque de material renovado!");
    } catch (erro) {
      // 🔙 ROLLBACK
      acoesArmazem.atualizarMaterial(idMaterial, materialOriginal);
      toast.error("Erro ao registrar reposição. Alteração revertida.");
    }
  };

  const alternarFavorito = async (id: string) => {
    if (!usuario?.uid) return;
    const material = materiais.find(m => m.id === id);
    if (!material) return;

    const novoEstado = !material.favorito;
    const materialAtualizado = { ...material, favorito: novoEstado };

    try {
      // Atualiza local
      acoesArmazem.atualizarMaterial(id, { favorito: novoEstado });
      // Persiste no banco
      await apiMateriais.atualizar(materialAtualizado, usuario.uid);
      
      auditoria.evento("FAVORITAR_MATERIAL", { id, favorito: novoEstado, nome: material.nome });
    } catch (erro) {
      console.error("Erro ao favoritar material:", erro);
      toast.error("Erro ao salvar preferência.");
      // Rollback se necessário (opcional para UX fluida)
      acoesArmazem.atualizarMaterial(id, { favorito: !novoEstado });
    }
  };

  // Encontrar Material por ID helper
  const encontrarMaterial = (id: string) => materiais.find((m) => m.id === id);

  // KPIs
  const materiaisAtivos = useMemo(() => materiais.filter((m) => !m.arquivado), [materiais]);

  const metricas = useMemo(() => {
    const totalEmbalagens = materiaisAtivos.reduce(
      (acumulador, mat) => acumulador + (mat.pesoRestanteGramas > 0 ? 1 : 0) + mat.estoque,
      0,
    );
    const valorInvestido = materiaisAtivos.reduce((acumulador, mat) => {
      return (
        acumulador + mat.precoCentavos * (mat.pesoRestanteGramas / mat.pesoGramas) + mat.precoCentavos * mat.estoque
      );
    }, 0);

    const alertasBaixoEstoque = materiaisAtivos.filter(
      (mat) => mat.pesoRestanteGramas < limiteAlertaEstoque && mat.estoque === 0,
    ).length;

    return { totalEmbalagens, valorInvestido, alertasBaixoEstoque };
  }, [materiaisAtivos, limiteAlertaEstoque]);

  // Filtragem e Ordenação
  const materiaisFiltradosOrdenados = useMemo(() => {
    let filtrados = [...materiaisAtivos];

    if (termoBusca) {
      const termo = termoBusca.toLowerCase();
      filtrados = filtrados.filter(
        (m) => m.nome.toLowerCase().includes(termo) || (m.tipoMaterial && m.tipoMaterial.toLowerCase().includes(termo)),
      );
    }

    if (filtro !== "TODOS") {
      filtrados = filtrados.filter((m) => m.tipo === filtro);
    }

    filtrados.sort((a, b) => {
      if (ordenacao === "NOME") return a.nome.localeCompare(b.nome);
      if (ordenacao === "MAIOR_PRECO") {
        const valA = (a.pesoRestanteGramas / a.pesoGramas + a.estoque) * a.precoCentavos;
        const valB = (b.pesoRestanteGramas / b.pesoGramas + b.estoque) * b.precoCentavos;
        return valB - valA;
      }
      if (ordenacao === "MENOR_ESTOQUE") {
        return a.pesoRestanteGramas / a.pesoGramas + a.estoque - (b.pesoRestanteGramas / b.pesoGramas + b.estoque);
      }
      return 0;
    });

    if (ordemInvertida) filtrados.reverse();
    return filtrados;
  }, [materiaisAtivos, filtro, ordenacao, termoBusca, ordemInvertida]);

  // Client-side pagination slicing
  const materiaisExibidos = useMemo(() => {
    const maxItems = (paginaAtual + 1) * limitePagina;
    return materiaisFiltradosOrdenados.slice(0, maxItems);
  }, [materiaisFiltradosOrdenados, paginaAtual]);

  const temMais = materiaisExibidos.length < materiaisFiltradosOrdenados.length;

  const agrupadosPorTipoMaterial = useMemo(() => {
    const grupos = new Map<string, Material[]>();
    materiaisExibidos.forEach((mat) => {
      const tipo = mat.tipoMaterial?.trim() || "Outros";
      if (!grupos.has(tipo)) grupos.set(tipo, []);
      grupos.get(tipo)!.push(mat);
    });
    return Array.from(grupos.entries());
  }, [materiaisFiltradosOrdenados]);

  return {
    estado: {
      materiais,
      carregando,
      materiaisFiltradosOrdenados,
      agrupadosPorTipoMaterial,
      // Modais
      modalAberto,
      modalAbatimentoAberto,
      modalHistoricoAberto,
      modalExclusaoAberto,
      modalReposicaoAberto,
      // Selecionados
      materialSendoEditado,
      materialParaAbater,
      materialParaHistorico,
      materialParaExcluir,
      materialParaRepor,
      // Estado de Paginação
      temMais,
      totalMateriaisBanco,
      // Filtros
      filtro,
      ordenacao,
      ordemInvertida,
      abaHistoricoInicial,
      // KPIs
      metricas: metricas,
    },
    acoes: {
      carregarMais,
      // Abertores (A UI envia ID exceto em Editar)
      abrirEditar: (mat: Material) => {
        if (!mat) {
          // Caso seja um NOVO material (botão superior ou estado vazio)
          definirMaterialSendoEditado(null);
          definirModalAberto(true);
        } else {
          // Caso seja EDIÇÃO de um material existente (redireciona para modal unificado)
          definirMaterialParaHistorico(mat);
          definirAbaHistoricoInicial("cadastro");
          definirModalHistoricoAberto(true);
        }
      },
      abrirAbater: (id: string) => {
        const m = encontrarMaterial(id);
        if (m) {
          definirMaterialParaAbater(m);
          definirModalAbatimentoAberto(true);
        }
      },
      abrirHistorico: (id: string, aba: "extrato" | "novo" | "cadastro" = "extrato") => {
        const m = encontrarMaterial(id);
        if (m) {
          definirMaterialParaHistorico(m);
          definirAbaHistoricoInicial(aba);
          definirModalHistoricoAberto(true);
        }
      },
      abrirExcluir: (id: string) => {
        const m = encontrarMaterial(id);
        if (m) {
          definirMaterialParaExcluir(m);
          definirModalExclusaoAberto(true);
        }
      },
      abrirRepor: (id: string) => {
        const m = encontrarMaterial(id);
        if (m) {
          definirMaterialParaRepor(m);
          definirModalReposicaoAberto(true);
        }
      },
      // Fechadores
      fecharEditar: fecharModal,
      fecharAbater: () => {
        definirModalAbatimentoAberto(false);
        definirMaterialParaAbater(null);
      },
      fecharHistorico: () => {
        definirModalHistoricoAberto(false);
        definirMaterialParaHistorico(null);
      },
      fecharExcluir: () => {
        definirModalExclusaoAberto(false);
        definirMaterialParaExcluir(null);
      },
      fecharRepor: () => {
        definirModalReposicaoAberto(false);
        definirMaterialParaRepor(null);
      },
      // Confirmações
      salvarMaterial,
      confirmarAbatimentoPeso,
      confirmarArquivamento,
      confirmarReposicaoMaterial,
      alternarFavorito,
      // Filtros
      definirFiltro,
      definirOrdenacao,
      definirTermoBusca,
      inverterOrdem: () => definirOrdemInvertida((prev) => !prev),
    },
  };
}
