import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { usarArmazemImpressoras } from "@/funcionalidades/producao/impressoras/estado/armazemImpressoras";
import { servicoImpressoras } from "@/funcionalidades/producao/impressoras/servicos/ServicoImpressoras";
import { Impressora, PecaDesgaste, RegistroManutencao } from "@/funcionalidades/producao/impressoras/tipos";
import { obterStatusManutencao } from "../utilitarios/utilitariosManutencao";
import { auditoria } from "@/compartilhado/utilitarios/Seguranca";
import toast from "react-hot-toast";

export function usarGerenciadorImpressoras() {
  // 🎯 SELETORES OTIMIZADOS
  const estadoArmazem = usarArmazemImpressoras(
    useShallow((s) => ({
      impressoras: s.impressoras,
      carregando: s.carregando,
      filtroBusca: s.filtroBusca,
      filtroTecnologia: s.filtroTecnologia,
      ordenacao: s.ordenacao,
      ordemInvertida: s.ordemInvertida,
      modalAberto: s.modalAberto,
      modalAposentarAberto: s.modalAposentarAberto,
      modalDetalhesAberto: s.modalDetalhesAberto,
      modalHistoricoAberto: s.modalHistoricoAberto,
      modalManutencaoAberto: s.modalManutencaoAberto,
      modalPecasAberto: s.modalPecasAberto,
      modalProducaoAberto: s.modalProducaoAberto,
      impressoraSendoEditada: s.impressoraSendoEditada,
      impressoraParaAposentar: s.impressoraParaAposentar,
      impressoraEmDetalhes: s.impressoraEmDetalhes,
      impressoraHistorico: s.impressoraHistorico,
      impressoraManutencao: s.impressoraManutencao,
      impressoraPecas: s.impressoraPecas,
      impressoraProducao: s.impressoraProducao,
    })),
  );

  const acoesArmazem = usarArmazemImpressoras(
    useShallow((s) => ({
      definirImpressoras: s.definirImpressoras,
      definirCarregando: s.definirCarregando,
      definirErro: s.definirErro,
      pesquisar: s.pesquisar,
      filtrarPorTecnologia: s.filtrarPorTecnologia,
      ordenarPor: s.ordenarPor,
      inverterOrdem: s.inverterOrdem,
      abrirEditar: s.abrirEditar,
      fecharEditar: s.fecharEditar,
      abrirAposentar: s.abrirAposentar,
      fecharAposentar: s.fecharAposentar,
      abrirDetalhes: s.abrirDetalhes,
      fecharDetalhes: s.fecharDetalhes,
      abrirHistorico: s.abrirHistorico,
      fecharHistorico: s.fecharHistorico,
      abrirManutencao: s.abrirManutencao,
      fecharManutencao: s.fecharManutencao,
      abrirPecas: s.abrirPecas,
      fecharPecas: s.fecharPecas,
      abrirProducao: s.abrirProducao,
      fecharProducao: s.fecharProducao,
    })),
  );

  useEffect(() => {
    carregarImpressoras();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarImpressoras = async () => {
    acoesArmazem.definirCarregando(true);
    try {
      const dados = await servicoImpressoras.buscarImpressoras();
      acoesArmazem.definirImpressoras(dados);
    } catch (e) {
      acoesArmazem.definirErro("Erro ao carregar impressoras.");
      auditoria.erro("Erro ao carregar impressoras", e);
      toast.error("Erro ao carregar impressoras.");
    } finally {
      acoesArmazem.definirCarregando(false);
    }
  };

  const salvarImpressora = async (impressora: Impressora) => {
    try {
      const salva = await servicoImpressoras.salvarImpressora(impressora);
      const existe = estadoArmazem.impressoras.find((i) => i.id === salva.id);

      if (existe) {
        acoesArmazem.definirImpressoras(estadoArmazem.impressoras.map((i) => (i.id === salva.id ? salva : i)));
        toast.success("Impressora atualizada com sucesso!");
      } else {
        acoesArmazem.definirImpressoras([...estadoArmazem.impressoras, salva]);
        toast.success("Impressora cadastrada com sucesso!");
      }
      auditoria.evento("SALVAR_IMPRESSORA", { id: salva.id, nome: salva.nome });
      acoesArmazem.fecharEditar();
    } catch (e) {
      auditoria.erro("Erro ao salvar impressora", e);
      toast.error("Erro ao salvar impressora.");
    }
  };

  const salvarObservacoes = async (id: string, observacoes: string) => {
    try {
      const impressoraOriginal = estadoArmazem.impressoras.find((i) => i.id === id);
      if (!impressoraOriginal) return;

      const impressoraAtualizada = { ...impressoraOriginal, observacoes };
      const salva = await servicoImpressoras.salvarImpressora(impressoraAtualizada);

      acoesArmazem.definirImpressoras(estadoArmazem.impressoras.map((i) => (i.id === id ? salva : i)));

      if (estadoArmazem.impressoraEmDetalhes?.id === id) {
        acoesArmazem.abrirDetalhes(salva);
      }

      auditoria.evento("SALVAR_OBSERVACOES_IMPRESSORA", { id });
      toast.success("Observações atualizadas com sucesso!");
    } catch (e) {
      auditoria.erro("Erro ao salvar observações", e);
      toast.error("Erro ao atualizar observações.");
    }
  };

  const registrarManutencao = async (id: string, registro: Omit<RegistroManutencao, "id" | "data">) => {
    try {
      const impressoraOriginal = estadoArmazem.impressoras.find((i) => i.id === id);
      if (!impressoraOriginal) return;

      const novoRegistro: RegistroManutencao = {
        ...registro,
        id: crypto.randomUUID(),
        data: new Date().toISOString(),
      };

      const historicoManutencao = [...(impressoraOriginal.historicoManutencao || []), novoRegistro];
      let horimetroAtualizado = impressoraOriginal.horimetroTotalMinutos;
      if (
        registro.horasMaquinaNoMomentoMinutos !== undefined &&
        registro.horasMaquinaNoMomentoMinutos > (horimetroAtualizado || 0)
      ) {
        horimetroAtualizado = registro.horasMaquinaNoMomentoMinutos;
      }

      const impressoraAtualizada = {
        ...impressoraOriginal,
        historicoManutencao,
        horimetroTotalMinutos: horimetroAtualizado,
      };

      const salva = await servicoImpressoras.salvarImpressora(impressoraAtualizada);

      acoesArmazem.definirImpressoras(estadoArmazem.impressoras.map((i) => (i.id === id ? salva : i)));

      auditoria.evento("REGISTRAR_MANUTENCAO", { id, tipo: registro.tipo });
      toast.success("Manutenção registrada com sucesso!");
      acoesArmazem.fecharManutencao();
    } catch (e) {
      auditoria.erro("Erro ao registrar manutenção", e);
      toast.error("Erro ao registrar manutenção.");
    }
  };

  const salvarPecasDesgaste = async (id: string, pecas: PecaDesgaste[]) => {
    try {
      const impressoraOriginal = estadoArmazem.impressoras.find((i) => i.id === id);
      if (!impressoraOriginal) return;

      const impressoraAtualizada = { ...impressoraOriginal, pecasDesgaste: pecas };
      const salva = await servicoImpressoras.salvarImpressora(impressoraAtualizada);

      acoesArmazem.definirImpressoras(estadoArmazem.impressoras.map((i) => (i.id === id ? salva : i)));
      auditoria.evento("SALVAR_PECAS_DESGASTE", { id });
      acoesArmazem.fecharPecas();
    } catch (e) {
      auditoria.erro("Erro ao salvar peças de desgaste", e);
      toast.error("Erro ao atualizar rastreamento de peças.");
    }
  };

  const confirmarAposentadoria = async () => {
    if (!estadoArmazem.impressoraParaAposentar?.id) return;

    try {
      const id = estadoArmazem.impressoraParaAposentar.id;
      const impressoraAtualizada: Impressora = {
        ...estadoArmazem.impressoraParaAposentar,
        dataAposentadoria: new Date().toISOString(),
      };

      const salva = await servicoImpressoras.salvarImpressora(impressoraAtualizada);

      acoesArmazem.definirImpressoras(estadoArmazem.impressoras.map((i) => (i.id === id ? salva : i)));
      auditoria.evento("APOSENTAR_IMPRESSORA", { id });
      toast.success("Impressora arquivada com sucesso.");
      acoesArmazem.fecharAposentar();
    } catch (e) {
      auditoria.erro("Erro ao aposentar impressora", e);
      toast.error("Erro ao arquivar impressora.");
    }
  };

  const impressorasFiltradas = useMemo(() => {
    let filtradas = estadoArmazem.impressoras.filter((i) => {
      if (i.dataAposentadoria) return false;
      const matchTexto = i.nome.toLowerCase().includes(estadoArmazem.filtroBusca.toLowerCase());
      const matchTecnologia =
        estadoArmazem.filtroTecnologia === "Todas" || i.tecnologia === estadoArmazem.filtroTecnologia;
      return matchTexto && matchTecnologia;
    });

    filtradas.sort((a, b) => {
      let comparacao = 0;
      switch (estadoArmazem.ordenacao) {
        case "NOME":
          comparacao = a.nome.localeCompare(b.nome);
          break;
        case "MAIOR_HORIMETRO":
          comparacao = (b.horimetroTotalMinutos || 0) - (a.horimetroTotalMinutos || 0);
          break;
        case "MENOR_HORIMETRO":
          comparacao = (a.horimetroTotalMinutos || 0) - (b.horimetroTotalMinutos || 0);
          break;
        case "MAIOR_VALOR":
          comparacao = (b.valorCompraCentavos || 0) - (a.valorCompraCentavos || 0);
          break;
        case "RECENTES":
          comparacao = new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime();
          break;
        case "MANUTENCAO_URGENTE":
          {
            const percA = (a.horimetroTotalMinutos || 0) / (a.intervaloRevisaoMinutos || 1);
            const percB = (b.horimetroTotalMinutos || 0) / (b.intervaloRevisaoMinutos || 1);
            comparacao = percB - percA;
          }
          break;
      }
      return estadoArmazem.ordemInvertida ? -comparacao : comparacao;
    });

    return filtradas;
  }, [
    estadoArmazem.impressoras,
    estadoArmazem.filtroBusca,
    estadoArmazem.filtroTecnologia,
    estadoArmazem.ordenacao,
    estadoArmazem.ordemInvertida,
  ]);

  const agrupadasPorTecnologia = useMemo(() => {
    const mapa = new Map<string, Impressora[]>();
    impressorasFiltradas.forEach((i) => {
      const grupo = i.tecnologia || "Outras";
      if (!mapa.has(grupo)) mapa.set(grupo, []);
      mapa.get(grupo)!.push(i);
    });
    return Array.from(mapa.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [impressorasFiltradas]);

  const totais = useMemo(() => {
    const total = estadoArmazem.impressoras.length;
    const manutencao = estadoArmazem.impressoras.filter((i) => i.status === "manutencao").length;
    const valorInvestido = estadoArmazem.impressoras.reduce((acc, i) => acc + (i.valorCompraCentavos || 0), 0);
    const horasImpressao = estadoArmazem.impressoras.reduce((acc, i) => acc + (i.horimetroTotalMinutos || 0) / 60, 0);

    const requerAtencao = estadoArmazem.impressoras.filter((i) => {
      const status = obterStatusManutencao(i.horimetroTotalMinutos || 0, i.intervaloRevisaoMinutos || 0);
      return status !== "normal";
    }).length;

    return { total, manutencao, valorInvestido, horasImpressao, requerAtencao };
  }, [estadoArmazem.impressoras]);

  return {
    estado: {
      ...estadoArmazem,
      impressorasFiltradas,
      agrupadasPorTecnologia,
      totais,
    },
    acoes: {
      ...acoesArmazem,
      carregarImpressoras,
      salvarImpressora,
      salvarObservacoes,
      registrarManutencao,
      salvarPecasDesgaste,
      confirmarAposentadoria,
    },
  };
}
