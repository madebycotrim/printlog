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
import { usarAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { useEffect } from "react";
import { apiMateriais } from "../servicos/apiMateriais";

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
      definirMateriais: s.definirMateriais,
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

  // Estados de Filtro e Ordenação
  const [filtro, definirFiltro] = useState<FiltroTipoMaterial>("TODOS");
  const [ordenacao, definirOrdenacao] = useState<OrdenacaoMaterial>("NOME");
  const [ordemInvertida, definirOrdemInvertida] = useState(false);
  const [termoBusca, definirTermoBusca] = useState("");

  const { usuario } = usarAutenticacao();

  // 🔄 SINCRONIZAÇÃO INICIAL COM D1
  useEffect(() => {
    if (usuario?.uid) {
      const carregarDados = async () => {
        acoesArmazem.definirCarregando(true);
        try {
          const dadosDoBanco = await apiMateriais.listar(usuario.uid);
          acoesArmazem.definirMateriais(dadosDoBanco);
        } catch (erro) {
          console.error("Erro ao sincronizar com banco de dados:", erro);
        } finally {
          acoesArmazem.definirCarregando(false);
        }
      };
      carregarDados();
    }
  }, [usuario?.uid]);

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
  const salvarMaterial = async (dadosDoFormulario: any) => {
    if (!usuario?.uid) return;
    const eEdicao = Boolean(materialSendoEditado);
    
    const materialParaSalvar: Material = materialSendoEditado 
      ? { ...materialSendoEditado, ...dadosDoFormulario, dataAtualizacao: new Date() }
      : {
        ...dadosDoFormulario,
        id: crypto.randomUUID(),
        pesoRestanteGramas: dadosDoFormulario.pesoGramas,
        estoque: dadosDoFormulario.estoque > 1 ? dadosDoFormulario.estoque - 1 : 0,
        arquivado: false,
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
        historicoUso: []
      };

    try {
      // Persiste no Banco de Dados Real (D1)
      await apiMateriais.salvar(materialParaSalvar, usuario.uid);
      
      // Atualiza o estado local (Zustand) para resposta instantânea
      if (eEdicao) {
        acoesArmazem.atualizarMaterial(materialParaSalvar.id, materialParaSalvar);
      } else {
        acoesArmazem.adicionarMaterial(materialParaSalvar);
      }
      
      auditoria.evento("SALVAR_MATERIAL", { id: materialParaSalvar.id, eEdicao, nome: dadosDoFormulario.nome });
      fecharModal();
    } catch (erro) {
      alert("Erro ao salvar no banco de dados. Verifique sua conexão.");
    }
  };

  const confirmarArquivamento = async () => {
    if (materialParaExcluir && usuario?.uid) {
      try {
        await apiMateriais.remover(materialParaExcluir.id, usuario.uid);
        acoesArmazem.arquivarMaterial(materialParaExcluir.id);
        auditoria.evento("ARQUIVAR_MATERIAL", { id: materialParaExcluir.id, nome: materialParaExcluir.nome });
        definirModalExclusaoAberto(false);
        definirMaterialParaExcluir(null);
      } catch (erro) {
        alert("Erro ao remover material no banco.");
      }
    }
  };

  const confirmarAbatimentoPeso = async (qtdAbatida: number, motivo: string) => {
    if (materialParaAbater && usuario?.uid) {
      // 1. Calcula o novo estado localmente apenas para salvar no banco
      // (A lógica de negócio complexa de troca de rolo continua no Zustand para consistência)
      
      // Persiste o abatimento e o histórico no D1
      const registroUso = {
        data: new Date().toISOString(),
        nomePeca: motivo,
        quantidadeGastaGramas: qtdAbatida,
        status: "MANUAL"
      };

      try {
        // O Zustand cuida do cálculo do novo pesoRestante e estoque
        acoesArmazem.abaterPeso(materialParaAbater.id, qtdAbatida, motivo);
        
        // Buscamos o material atualizado do store para persistir o novo estado no D1
        const atualizado = encontrarMaterial(materialParaAbater.id);
        if (atualizado) {
          await apiMateriais.atualizar(atualizado, usuario.uid, registroUso);
        }

        auditoria.evento("ABATE_PESO_MATERIAL", { id: materialParaAbater.id, qtdAbatida, motivo });
        definirModalAbatimentoAberto(false);
        definirMaterialParaAbater(null);
      } catch (erro) {
        alert("Erro ao salvar abatimento no servidor.");
      }
    }
  };

  const confirmarReposicaoMaterial = async (quantidadeComprada: number, precoTotalNovaCompra: number) => {
    if (materialParaRepor && usuario?.uid) {
      try {
        acoesArmazem.reporEstoque(materialParaRepor.id, quantidadeComprada, precoTotalNovaCompra);
        
        // Buscamos o material atualizado do store
        const atualizado = materiais.find(m => m.id === materialParaRepor.id);
        if (atualizado) {
          await apiMateriais.atualizar(atualizado, usuario.uid);
        }

        auditoria.evento("REPOSICAO_MATERIAL", { id: materialParaRepor.id, quantidadeComprada });
        definirModalReposicaoAberto(false);
        definirMaterialParaRepor(null);
      } catch (erro) {
        alert("Erro ao salvar reposição no servidor.");
      }
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
