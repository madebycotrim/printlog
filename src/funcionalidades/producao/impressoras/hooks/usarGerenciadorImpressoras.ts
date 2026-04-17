import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { usarArmazemImpressoras } from "@/funcionalidades/producao/impressoras/estado/armazemImpressoras";
import { apiImpressoras } from "../servicos/apiImpressoras";
import { apiManutencoes } from "../servicos/apiManutencoes";
import { apiPecas } from "../servicos/apiPecas";
import { Impressora, PecaDesgaste, RegistroManutencao } from "@/funcionalidades/producao/impressoras/tipos";
import { obterStatusManutencao } from "../utilitarios/utilitariosManutencao";
import { auditoria } from "@/compartilhado/utilitarios/Seguranca";
import { usarAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import toast from "react-hot-toast";

export function usarGerenciadorImpressoras() {
  const { usuario } = usarAutenticacao();
  const usuarioId = usuario?.uid;

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
    if (!usuarioId) return;
    acoesArmazem.definirCarregando(true);
    try {
      const dados = await apiImpressoras.buscarTodas(usuarioId);
      
      // Carregar também manutenções e peças para cada impressora
      const impressorasCompletas = await Promise.all(dados.map(async (i) => {
        const [manutencoes, pecas] = await Promise.all([
          apiManutencoes.buscarPorImpressora(usuarioId, i.id),
          apiPecas.buscarPorImpressora(usuarioId, i.id)
        ]);
        return { ...i, historicoManutencao: manutencoes, pecasDesgaste: pecas };
      }));

      acoesArmazem.definirImpressoras(impressorasCompletas);
    } catch (e) {
      acoesArmazem.definirErro("Erro ao carregar impressoras.");
      auditoria.erro("Erro ao carregar impressoras", e);
      toast.error("Erro ao carregar impressoras.");
    } finally {
      acoesArmazem.definirCarregando(false);
    }
  };

  const salvarImpressora = async (impressora: Impressora) => {
    if (!usuarioId) return;
    try {
      const salva = await apiImpressoras.salvar(impressora, usuarioId);
      await carregarImpressoras(); // Recarrega tudo para manter consistência
      
      auditoria.evento("SALVAR_IMPRESSORA", { id: salva.id, nome: salva.nome });
      acoesArmazem.fecharEditar();
      toast.success(impressora.id ? "Impressora atualizada!" : "Impressora cadastrada!");
    } catch (e) {
      auditoria.erro("Erro ao salvar impressora", e);
      toast.error("Erro ao salvar impressora.");
    }
  };

  const salvarObservacoes = async (id: string, observacoes: string) => {
    if (!usuarioId) return;
    try {
      const impressoraOriginal = estadoArmazem.impressoras.find((i) => i.id === id);
      if (!impressoraOriginal) return;

      const impressoraAtualizada = { ...impressoraOriginal, observacoes };
      await apiImpressoras.salvar(impressoraAtualizada, usuarioId);

      await carregarImpressoras();

      auditoria.evento("SALVAR_OBSERVACOES_IMPRESSORA", { id });
      toast.success("Observações atualizadas!");
    } catch (e) {
      auditoria.erro("Erro ao salvar observações", e);
      toast.error("Erro ao atualizar observações.");
    }
  };

  const registrarManutencao = async (id: string, registro: Omit<RegistroManutencao, "id" | "data">) => {
    if (!usuarioId) return;
    try {
      const novoRegistro = {
        ...registro,
        idImpressora: id,
        data: new Date().toISOString(),
      };

      await apiManutencoes.salvar(novoRegistro, usuarioId);

      // Se for uma manutenção que altera o horímetro, atualizamos a impressora também
      if (registro.horasMaquinaNoMomentoMinutos) {
        const impressora = estadoArmazem.impressoras.find(i => i.id === id);
        if (impressora && (registro.horasMaquinaNoMomentoMinutos > (impressora.horimetroTotalMinutos || 0))) {
          await apiImpressoras.salvar({ 
            ...impressora, 
            horimetroTotalMinutos: registro.horasMaquinaNoMomentoMinutos 
          }, usuarioId);
        }
      }

      await carregarImpressoras();

      auditoria.evento("REGISTRAR_MANUTENCAO", { id, tipo: registro.tipo });
      toast.success("Manutenção registrada!");
      acoesArmazem.fecharManutencao();
    } catch (e) {
      auditoria.erro("Erro ao registrar manutenção", e);
      toast.error("Erro ao registrar manutenção.");
    }
  };

  const salvarPecasDesgaste = async (id: string, pecas: PecaDesgaste[]) => {
    if (!usuarioId) return;
    try {
      // Salva todas as peças no banco
      await Promise.all(pecas.map(p => apiPecas.salvar({ ...p, idImpressora: id }, usuarioId)));
      
      await carregarImpressoras();
      auditoria.evento("SALVAR_PECAS_DESGASTE", { id });
      toast.success("Rastreamento de peças atualizado!");
      acoesArmazem.fecharPecas();
    } catch (e) {
      auditoria.erro("Erro ao salvar peças de desgaste", e);
      toast.error("Erro ao atualizar rastreamento de peças.");
    }
  };

  const confirmarAposentadoria = async () => {
    if (!estadoArmazem.impressoraParaAposentar?.id || !usuarioId) return;

    try {
      const id = estadoArmazem.impressoraParaAposentar.id;
      const impressoraAtualizada: Impressora = {
        ...estadoArmazem.impressoraParaAposentar,
        dataAposentadoria: new Date().toISOString(),
      };

      await apiImpressoras.salvar(impressoraAtualizada, usuarioId);
      await carregarImpressoras();

      auditoria.evento("APOSENTAR_IMPRESSORA", { id });
      toast.success("Impressora arquivada.");
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
