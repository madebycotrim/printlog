/**
 * @file servicoManutencao.ts
 * @description Lógica centralizada para gestão de manutenção preventiva e corretiva (Fase 2).
 * Integração direta com a API Cloudflare Pages (D1).
 */

import { Impressora, RegistroManutencao, PecaDesgaste, RegistrarManutencaoInput } from "@/funcionalidades/producao/impressoras/tipos";
import { registrar } from "@/compartilhado/utilitarios/registrador";
import { useArmazemImpressoras } from "@/funcionalidades/producao/impressoras/estado/armazemImpressoras";
import { servicoBaseApi } from "./servicoBaseApi";
import { apiImpressoras } from "@/funcionalidades/producao/impressoras/servicos/apiImpressoras";

export const servicoManutencao = {
  /**
   * Busca todas as manutenções de uma impressora específica.
   */
  buscarManutencoes: async (idImpressora: string): Promise<RegistroManutencao[]> => {
    try {
      return await servicoBaseApi.get<RegistroManutencao[]>(`/api/manutencoes?idImpressora=${idImpressora}`);
    } catch (erro) {
      registrar.error({ rastreioId: idImpressora, servico: "Manutenção", idImpressora }, "Erro ao buscar manutenções", erro);
      throw erro;
    }
  },

  /**
   * Busca todas as peças de desgaste de uma impressora específica.
   */
  buscarPecas: async (idImpressora: string): Promise<PecaDesgaste[]> => {
    try {
      const pecas = await servicoBaseApi.get<any[]>(`/api/pecas-desgaste?idImpressora=${idImpressora}`);
      // Mapeia os campos do banco (snake_case) para o frontend (camelCase)
      return pecas.map((p) => ({
        id: p.id,
        idImpressora: p.id_impressora,
        nome: p.nome,
        horasUsoAtualMinutos: p.horas_uso_atual_minutos,
        vidaUtilMinutos: p.vida_util_minutos,
        dataUltimaTroca: p.data_ultima_troca,
      }));
    } catch (erro) {
      registrar.error({ rastreioId: idImpressora, servico: "Manutenção", idImpressora }, "Erro ao buscar peças", erro);
      throw erro;
    }
  },

  /**
   * Registra uma nova manutenção e atualiza o estado local.
   */
  registrarManutencao: async (dados: RegistrarManutencaoInput): Promise<RegistroManutencao> => {
    try {
      const resposta = await servicoBaseApi.post<{ id: string }>(`/api/manutencoes`, {
        ...dados,
        pecasTrocadas: dados.pecasTrocadas?.join(","), // O backend espera string separada por vírgula no insert
      });

      const nova: RegistroManutencao = {
        ...dados,
        id: resposta.id,
        data: new Date().toISOString(),
        pecasTrocadas: dados.pecasTrocadas?.join(", "),
        responsavel: "Usuário", 
        horasMaquinaNoMomentoMinutos: 0, // O backend deve preencher ou calculamos aqui
      };

      // v9.0: Se houve peças trocadas, precisamos resetar o horímetro delas no banco
      if (dados.pecasTrocadas && dados.pecasTrocadas.length > 0) {
        for (const idPeca of dados.pecasTrocadas) {
          await servicoBaseApi.post(`/api/pecas-desgaste`, {
            id: idPeca,
            idImpressora: dados.idImpressora,
            horasUsoAtualMinutos: 0,
            dataUltimaTroca: new Date().toISOString(),
          });
        }
      }

      registrar.info({ rastreioId: nova.id, idManutencao: nova.id, servico: "Manutenção" }, "Manutenção registrada");
      return nova;
    } catch (erro) {
      registrar.error({ rastreioId: dados.idImpressora, servico: "Manutenção", dados }, "Erro ao registrar manutenção", erro);
      throw erro;
    }
  },

  /**
   * Registra o uso da máquina, atualizando todas as métricas de desempenho:
   * horímetro, ROI, total de projetos, receita acumulada e custo de energia.
   * @param idImpressora ID da máquina
   * @param minutos Minutos de uso (negativo para reversão)
   * @param usuarioId ID do usuário autenticado
   * @param dadosPedido Dados do pedido concluído para atualizar métricas (opcional)
   */
  registrarUsoMaquina: async (
    idImpressora: string,
    minutos: number,
    usuarioId: string,
    dadosPedido?: {
      idPedido: string;
      nomeProjeto: string;
      valorCentavos: number;
      precoKwhCentavos?: number;
      consumoWatts?: number;
      reversao?: boolean;
    }
  ) => {
    const { impressoras, definirImpressoras } = useArmazemImpressoras.getState();
    let impressoraAlvo = impressoras.find(i => i.id === idImpressora);
    
    // v9.0: Se não estiver na store (ex: vindo do Kanban sem carregar impressoras), busca na API
    if (!impressoraAlvo) {
      registrar.info({ rastreioId: idImpressora, idImpressora, servico: "Manutenção" }, "Impressora não encontrada na store, buscando na API...");
      const todas = await apiImpressoras.buscarTodas(usuarioId);
      impressoraAlvo = todas.find(i => i.id === idImpressora);
    }

    if (!impressoraAlvo) {
      registrar.error({ rastreioId: idImpressora, idImpressora, servico: "Manutenção" }, "Impressora não encontrada no sistema para registrar uso");
      return;
    }

    const eReversao = dadosPedido?.reversao === true;

    // ── 1. Horímetro ────────────────────────────────────────────────────────
    const novoHorimetro = Math.max(0, (impressoraAlvo.horimetroTotalMinutos || 0) + minutos);

    // ── 2. Custo de Energia ─────────────────────────────────────────────────
    // Fórmula: (potência em kW) * (tempo em horas) * (preço kWh em centavos)
    let custoPedidoCentavos = 0;
    const potenciaUtilizada = dadosPedido?.consumoWatts || impressoraAlvo.potenciaWatts || 0;
    
    if (potenciaUtilizada > 0 && minutos !== 0) {
      const consumoKw = (potenciaUtilizada / 1000);
      const horasUso = Math.abs(minutos) / 60;
      const precoKwhCentavos = dadosPedido?.precoKwhCentavos ?? 0;
      custoPedidoCentavos = Math.round(consumoKw * horasUso * precoKwhCentavos);
    }

    const novoCustoEnergia = eReversao
      ? Math.max(0, (impressoraAlvo.custoEnergiaCentavos || 0) - custoPedidoCentavos)
      : (impressoraAlvo.custoEnergiaCentavos || 0) + custoPedidoCentavos;

    // ── 3. Total de Projetos Concluídos ─────────────────────────────────────
    const novoTotalProjetos = eReversao
      ? Math.max(0, (impressoraAlvo.totalProjetosConcluidos || 0) - 1)
      : (impressoraAlvo.totalProjetosConcluidos || 0) + 1;

    // ── 4. Receita Acumulada ─────────────────────────────────────────────────
    const valorPedido = dadosPedido?.valorCentavos || 0;
    const novaReceita = eReversao
      ? Math.max(0, (impressoraAlvo.receitaAcumuladaCentavos || 0) - valorPedido)
      : (impressoraAlvo.receitaAcumuladaCentavos || 0) + valorPedido;

    // ── 5. ROI = (Receita - Custo Compra) / Custo Compra * 100 ──────────────
    const custoCompra = impressoraAlvo.valorCompraCentavos || 0;
    const novoRoi = custoCompra > 0
      ? Math.round(((novaReceita - custoCompra) / custoCompra) * 100)
      : 0;

    // ── 6. Histórico de Produção ─────────────────────────────────────────────
    let novoHistorico = [...(impressoraAlvo.historicoProducao || [])];
    if (dadosPedido && !eReversao) {
      const novoRegistro = {
        idProtocolo: dadosPedido.idPedido,
        nomeProjeto: dadosPedido.nomeProjeto,
        minutosImpressao: Math.abs(minutos),
        valorGeradoCentavos: valorPedido,
        dataConclusao: new Date().toISOString(),
        sucesso: true,
      };
      // Mantém apenas os últimos 50 registros para não poluir o banco
      novoHistorico = [novoRegistro, ...novoHistorico].slice(0, 50);
    } else if (dadosPedido && eReversao) {
      // Remove o registro deste pedido do histórico
      novoHistorico = novoHistorico.filter(r => r.idProtocolo !== dadosPedido.idPedido);
    }

    // ── 7. Atualização Otimista no Zustand ───────────────────────────────────
    const existeNaStore = impressoras.some(i => i.id === idImpressora);
    let impressorasAtualizadas;

    if (existeNaStore) {
      impressorasAtualizadas = impressoras.map((i) => {
        if (i.id === idImpressora) {
          return {
            ...i,
            horimetroTotalMinutos: novoHorimetro,
            totalProjetosConcluidos: novoTotalProjetos,
            receitaAcumuladaCentavos: novaReceita,
            custoEnergiaCentavos: novoCustoEnergia,
            roiPercentual: novoRoi,
            historicoProducao: novoHistorico,
            dataAtualizacao: new Date(),
          };
        }
        return i;
      });
    } else {
      impressorasAtualizadas = [...impressoras, {
        ...impressoraAlvo,
        horimetroTotalMinutos: novoHorimetro,
        totalProjetosConcluidos: novoTotalProjetos,
        receitaAcumuladaCentavos: novaReceita,
        custoEnergiaCentavos: novoCustoEnergia,
        roiPercentual: novoRoi,
        historicoProducao: novoHistorico,
        dataAtualizacao: new Date(),
      }];
    }

    definirImpressoras(impressorasAtualizadas);

    // ── 8. Persistência no Banco de Dados ────────────────────────────────────
    try {
      await apiImpressoras.salvar({
        ...impressoraAlvo,
        id: idImpressora,
        horimetroTotalMinutos: novoHorimetro,
        totalProjetosConcluidos: novoTotalProjetos,
        receitaAcumuladaCentavos: novaReceita,
        custoEnergiaCentavos: novoCustoEnergia,
        roiPercentual: novoRoi,
        historicoProducao: novoHistorico,
      }, usuarioId);
      
      registrar.info(
        { rastreioId: idImpressora, minutos, servico: "Manutenção", roi: novoRoi, totalProjetos: novoTotalProjetos },
        eReversao ? "Métricas da impressora revertidas" : "Métricas da impressora atualizadas"
      );
    } catch (erro) {
      registrar.error({ rastreioId: idImpressora, servico: "Manutenção" }, "Erro ao persistir métricas da impressora", erro);
    }
  },

  /**
   * Estima a data da próxima manutenção baseada no uso médio.
   */
  preverProximaManutencao: (impressora: Impressora): Date | null => {
    if (!impressora.intervaloRevisaoMinutos || !impressora.historicoProducao || impressora.historicoProducao.length < 3) {
      return null;
    }

    const totalMinutos = impressora.historicoProducao.reduce((acc, p) => acc + p.minutosImpressao, 0);
    const primeiraData = new Date(impressora.historicoProducao[0].dataConclusao).getTime();
    const ultimaData = new Date(
      impressora.historicoProducao[impressora.historicoProducao.length - 1].dataConclusao,
    ).getTime();
    const diasDiferenca = Math.max(1, (ultimaData - primeiraData) / (1000 * 60 * 60 * 24));

    const mediaMinutosPorDia = totalMinutos / diasDiferenca;
    const minutosFaltantes = impressora.intervaloRevisaoMinutos - (impressora.horimetroTotalMinutos || 0);

    if (minutosFaltantes <= 0) return new Date();

    const diasParaProx = Math.ceil(minutosFaltantes / mediaMinutosPorDia);
    const dataPrevista = new Date();
    dataPrevista.setDate(dataPrevista.getDate() + diasParaProx);

    return dataPrevista;
  },
};

