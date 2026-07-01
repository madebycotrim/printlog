import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useArmazemImpressoras } from "@/funcionalidades/producao/impressoras/estado/armazemImpressoras";
import { apiImpressoras } from "../servicos/apiImpressoras";
import { apiManutencoes } from "../servicos/apiManutencoes";
import { apiPecas } from "../servicos/apiPecas";
import { Impressora, PecaDesgaste, RegistroManutencao } from "@/funcionalidades/producao/impressoras/tipos";
import { obterStatusManutencao } from "../utilitarios/utilitariosManutencao";
import { auditoria } from "@/compartilhado/utilitarios/Seguranca";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import toast from "react-hot-toast";

export function useGerenciadorImpressoras() {
  const { usuario } = useAutenticacao();
  const usuarioId = usuario?.uid;

  // 🎯 SELETORES OTIMIZADOS
  const estadoArmazem = useArmazemImpressoras(
    useShallow((s) => ({
      impressoras: s.impressoras,
      carregando: s.carregando,
      filtroBusca: s.filtroBusca,
      filtroTecnologia: s.filtroTecnologia,
      ordenacao: s.ordenacao,
      ordemInvertida: s.ordemInvertida,
      modalAberto: s.modalAberto,
      modalAposentarAberto: s.modalAposentarAberto,
      modalGerenciamentoAberto: s.modalGerenciamentoAberto,
      abaGerenciamentoInicial: s.abaGerenciamentoInicial,
      impressoraSendoEditada: s.impressoraSendoEditada,
      impressoraParaAposentar: s.impressoraParaAposentar,
      impressoraGerenciamento: s.impressoraGerenciamento,
      erro: s.erro,
    })),
  );

  const acoesArmazem = useArmazemImpressoras(
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
      abrirGerenciamento: s.abrirGerenciamento,
      fecharGerenciamento: s.fecharGerenciamento,
    })),
  );

  useEffect(() => {
    carregarImpressoras();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioId]);

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
    const id = impressora.id || crypto.randomUUID();
    const impressoraExistente = estadoArmazem.impressoras.find(i => i.id === id);

    const impressoraParaSalvar: Impressora = {
      id,
      nome: impressora.nome,
      tecnologia: impressora.tecnologia,
      status: impressora.status || "livre",
      marca: impressora.marca || "",
      modeloBase: impressora.modeloBase || "",
      imagemUrl: impressora.imagemUrl || "",
      taxaHoraCentavos: impressora.taxaHoraCentavos || 0,
      horimetroTotalMinutos: impressora.horimetroTotalMinutos || 0,
      intervaloRevisaoMinutos: impressora.intervaloRevisaoMinutos || 30000,
      valorCompraCentavos: impressora.valorCompraCentavos || 0,
      potenciaWatts: impressora.potenciaWatts || 0,
      consumoKw: impressora.consumoKw || 0,
      observacoes: impressora.observacoes || "",
      historicoManutencao: impressoraExistente?.historicoManutencao || [],
      pecasDesgaste: impressoraExistente?.pecasDesgaste || [],
      ...impressora,
    };

    // ⚡️ OTIMISTA
    acoesArmazem.adicionarOuAtualizarImpressora(impressoraParaSalvar);
    acoesArmazem.fecharEditar();

    try {
      const salva = await apiImpressoras.salvar(impressoraParaSalvar, usuarioId);
      acoesArmazem.adicionarOuAtualizarImpressora({
        ...impressoraParaSalvar,
        ...salva
      });
      auditoria.evento("SALVAR_IMPRESSORA", { id: salva.id, nome: salva.nome });
      toast.success(impressora.id ? "Impressora atualizada!" : "Impressora cadastrada!");
    } catch (e) {
      // 🔙 ROLLBACK
      if (impressoraExistente) {
        acoesArmazem.adicionarOuAtualizarImpressora(impressoraExistente);
      } else {
        acoesArmazem.removerImpressora(id);
      }
      auditoria.erro("Erro ao salvar impressora", e);
      toast.error("Erro ao salvar impressora. Alteração revertida.");
      acoesArmazem.abrirEditar(impressoraParaSalvar);
    }
  };

  const salvarObservacoes = async (id: string, observacoes: string) => {
    if (!usuarioId) return;
    const impressoraOriginal = estadoArmazem.impressoras.find((i) => i.id === id);
    if (!impressoraOriginal) return;

    const impressoraAtualizada = { ...impressoraOriginal, observacoes };

    // ⚡️ OTIMISTA
    acoesArmazem.adicionarOuAtualizarImpressora(impressoraAtualizada);

    try {
      await apiImpressoras.salvar(impressoraAtualizada, usuarioId);
      auditoria.evento("SALVAR_OBSERVACOES_IMPRESSORA", { id });
      toast.success("Observações atualizadas!");
    } catch (e) {
      // 🔙 ROLLBACK
      acoesArmazem.adicionarOuAtualizarImpressora(impressoraOriginal);
      auditoria.erro("Erro ao salvar observações", e);
      toast.error("Erro ao atualizar observações. Alteração revertida.");
    }
  };

  const registrarManutencao = async (id: string, registro: Omit<RegistroManutencao, "id" | "data">) => {
    if (!usuarioId) return;
    const impressoraOriginal = estadoArmazem.impressoras.find(i => i.id === id);
    if (!impressoraOriginal) return;

    const idRegistro = crypto.randomUUID();
    const novoRegistro: RegistroManutencao = {
      ...registro,
      id: idRegistro,
      idImpressora: id,
      data: new Date().toISOString(),
    };

    const novoHistorico = [novoRegistro, ...(impressoraOriginal.historicoManutencao || [])];
    const novoHorimetro = registro.horasMaquinaNoMomentoMinutos && registro.horasMaquinaNoMomentoMinutos > (impressoraOriginal.horimetroTotalMinutos || 0)
      ? registro.horasMaquinaNoMomentoMinutos
      : impressoraOriginal.horimetroTotalMinutos;

    const impressoraAtualizada: Impressora = {
      ...impressoraOriginal,
      horimetroTotalMinutos: novoHorimetro,
      historicoManutencao: novoHistorico,
    };

    // ⚡️ OTIMISTA
    acoesArmazem.adicionarOuAtualizarImpressora(impressoraAtualizada);
    acoesArmazem.fecharGerenciamento();

    try {
      const salvo = await apiManutencoes.salvar(novoRegistro, usuarioId);
      const historicoFinal = [salvo, ...(impressoraOriginal.historicoManutencao || [])];
      
      if (registro.horasMaquinaNoMomentoMinutos && registro.horasMaquinaNoMomentoMinutos > (impressoraOriginal.horimetroTotalMinutos || 0)) {
        await apiImpressoras.salvar({ 
          ...impressoraOriginal, 
          horimetroTotalMinutos: registro.horasMaquinaNoMomentoMinutos 
        }, usuarioId);
      }

      acoesArmazem.adicionarOuAtualizarImpressora({
        ...impressoraAtualizada,
        historicoManutencao: historicoFinal,
      });

      auditoria.evento("REGISTRAR_MANUTENCAO", { id, tipo: registro.tipo });
      toast.success("Manutenção registrada!");
    } catch (e) {
      // 🔙 ROLLBACK
      acoesArmazem.adicionarOuAtualizarImpressora(impressoraOriginal);
      auditoria.erro("Erro ao registrar manutenção", e);
      toast.error("Erro ao registrar manutenção. Alteração revertida.");
      acoesArmazem.abrirGerenciamento(impressoraOriginal, "manutencao");
    }
  };

  const salvarPecasDesgaste = async (id: string, pecas: PecaDesgaste[]) => {
    if (!usuarioId) return;
    const impressoraOriginal = estadoArmazem.impressoras.find(i => i.id === id);
    if (!impressoraOriginal) return;

    const pecasMapeadas = pecas.map(p => ({ ...p, idImpressora: id }));
    const impressoraAtualizada: Impressora = {
      ...impressoraOriginal,
      pecasDesgaste: pecasMapeadas,
    };

    // ⚡️ OTIMISTA
    acoesArmazem.adicionarOuAtualizarImpressora(impressoraAtualizada);

    try {
      await Promise.all(pecasMapeadas.map(p => apiPecas.salvar(p, usuarioId)));
      auditoria.evento("SALVAR_PECAS_DESGASTE", { id });
      toast.success("Rastreamento de peças atualizado!");
    } catch (e) {
      // 🔙 ROLLBACK
      acoesArmazem.adicionarOuAtualizarImpressora(impressoraOriginal);
      auditoria.erro("Erro ao salvar peças", e);
      toast.error("Erro ao salvar peças. Alteração revertida.");
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
      // Só esconde se realmente houver uma data válida de aposentadoria
      if (i.dataAposentadoria && String(i.dataAposentadoria).trim().length > 0) return false;
      
      const termo = estadoArmazem.filtroBusca.trim().toLowerCase();
      const matchTexto = i.nome.toLowerCase().includes(termo);
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
    const ativas = estadoArmazem.impressoras.filter(i => !i.dataAposentadoria);
    
    const total = ativas.length;
    const manutencao = ativas.filter((i) => i.status === "manutencao").length;
    const valorInvestido = ativas.reduce((acc, i) => acc + (i.valorCompraCentavos || 0), 0);
    const horasImpressao = ativas.reduce((acc, i) => acc + (i.horimetroTotalMinutos || 0) / 60, 0);

    const requerAtencao = ativas.filter((i) => {
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
