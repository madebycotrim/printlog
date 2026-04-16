import { useState, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { Material } from "@/funcionalidades/producao/materiais/tipos";
import {
  FiltroTipoMaterial,
  OrdenacaoMaterial,
} from "@/funcionalidades/producao/materiais/componentes/FiltrosMaterial";
import { usarArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { Plus } from "lucide-react";
import { auditoria } from "@/compartilhado/utilitarios/Seguranca";

import { ALERTA_ESTOQUE_FILAMENTO_GRAMAS } from "@/compartilhado/constantes/constantesNegocio";

export function usarGerenciadorMateriais() {
  // 🎯 SELETORES OTIMIZADOS
  const materiais = usarArmazemMateriais((s) => s.materiais);
  const carregando = usarArmazemMateriais((s) => s.carregando);
  const acoesArmazem = usarArmazemMateriais(
    useShallow((s) => ({
      atualizarMaterial: s.atualizarMaterial,
      adicionarMaterial: s.adicionarMaterial,
      arquivarMaterial: s.arquivarMaterial,
      abaterPeso: s.abaterPeso,
      reporEstoque: s.reporEstoque,
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

  // Estados de Filtro e Ordenação
  const [filtro, definirFiltro] = useState<FiltroTipoMaterial>("TODOS");
  const [ordenacao, definirOrdenacao] = useState<OrdenacaoMaterial>("NOME");
  const [ordemInvertida, definirOrdemInvertida] = useState(false);
  const [termoBusca, definirTermoBusca] = useState("");

  usarDefinirCabecalho({
    titulo: "Meus Materiais",
    subtitulo: "Gerencie filamentos e resinas para cálculo preciso de custos.",
    placeholderBusca: "Buscar material (ex: PLA Preto)...",
    aoBuscar: definirTermoBusca,
    acao: {
      texto: "Novo Material",
      icone: Plus,
      aoClicar: () => {
        definirMaterialSendoEditado(null);
        definirModalAberto(true);
      },
    },
  });

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
  const salvarMaterial = (dadosDoFormulario: any) => {
    const eEdicao = Boolean(materialSendoEditado);
    if (materialSendoEditado) {
      acoesArmazem.atualizarMaterial(materialSendoEditado.id, dadosDoFormulario);
    } else {
      const m: Material = {
        ...dadosDoFormulario,
        pesoRestanteGramas: dadosDoFormulario.pesoGramas,
        estoque: dadosDoFormulario.estoque > 1 ? dadosDoFormulario.estoque - 1 : 0,
        arquivado: false,
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
      };
      acoesArmazem.adicionarMaterial(m);
    }
    auditoria.evento("SALVAR_MATERIAL", { id: materialSendoEditado?.id, eEdicao, nome: dadosDoFormulario.nome });
    fecharModal();
  };

  const confirmarArquivamento = () => {
    if (materialParaExcluir) {
      acoesArmazem.arquivarMaterial(materialParaExcluir.id);
      auditoria.evento("ARQUIVAR_MATERIAL", { id: materialParaExcluir.id, nome: materialParaExcluir.nome });
      definirModalExclusaoAberto(false);
      definirMaterialParaExcluir(null);
    }
  };

  const confirmarAbatimentoPeso = (qtdAbatida: number, motivo: string) => {
    if (materialParaAbater) {
      acoesArmazem.abaterPeso(materialParaAbater.id, qtdAbatida, motivo);
      auditoria.evento("ABATE_PESO_MATERIAL", { id: materialParaAbater.id, qtdAbatida, motivo });
      definirModalAbatimentoAberto(false);
      definirMaterialParaAbater(null);
    }
  };

  const confirmarReposicaoMaterial = (quantidadeComprada: number, precoTotalNovaCompra: number) => {
    if (materialParaRepor) {
      acoesArmazem.reporEstoque(materialParaRepor.id, quantidadeComprada, precoTotalNovaCompra);
      auditoria.evento("REPOSICAO_MATERIAL", { id: materialParaRepor.id, quantidadeComprada });
      definirModalReposicaoAberto(false);
      definirMaterialParaRepor(null);
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
      (mat) => mat.pesoRestanteGramas < ALERTA_ESTOQUE_FILAMENTO_GRAMAS && mat.estoque === 0,
    ).length;

    return { totalEmbalagens, valorInvestido, alertasBaixoEstoque };
  }, [materiaisAtivos]);

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

  const agrupadosPorTipoMaterial = useMemo(() => {
    const grupos = new Map<string, Material[]>();
    materiaisFiltradosOrdenados.forEach((mat) => {
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
      // Filtros
      filtro,
      ordenacao,
      ordemInvertida,
      // KPIs
      metricas: metricas,
    },
    acoes: {
      // Abertores (A UI envia ID exceto em Editar)
      abrirEditar: (mat: Material) => {
        definirMaterialSendoEditado(mat);
        definirModalAberto(true);
      },
      abrirAbater: (id: string) => {
        const m = encontrarMaterial(id);
        if (m) {
          definirMaterialParaAbater(m);
          definirModalAbatimentoAberto(true);
        }
      },
      abrirHistorico: (id: string) => {
        const m = encontrarMaterial(id);
        if (m) {
          definirMaterialParaHistorico(m);
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
      // Filtros
      definirFiltro,
      definirOrdenacao,
      inverterOrdem: () => definirOrdemInvertida((prev) => !prev),
    },
  };
}
