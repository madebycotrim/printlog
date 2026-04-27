/**
 * @file servicoManutencao.ts
 * @description Lógica centralizada para gestão de manutenção preventiva e corretiva (Fase 2).
 * Integração direta com a API Cloudflare Pages (D1).
 */

import { Impressora, RegistroManutencao, PecaDesgaste, RegistrarManutencaoInput } from "@/funcionalidades/producao/impressoras/tipos";
import { registrar } from "@/compartilhado/utilitarios/registrador";
import { usarArmazemImpressoras } from "@/funcionalidades/producao/impressoras/estado/armazemImpressoras";
import { servicoBaseApi } from "./servicoBaseApi";

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
        responsavel: "Usuário", // TODO: Buscar nome real do contexto de auth
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
   * Registra o uso da máquina, atualizando o horímetro local (Zustand).
   * @param idImpressora ID da máquina
   * @param minutos Minutos de uso a serem adicionados
   */
  registrarUsoMaquina: (idImpressora: string, minutos: number) => {
    const { impressoras, definirImpressoras } = usarArmazemImpressoras.getState();
    const novas = impressoras.map((i) => {
      if (i.id === idImpressora) {
        return {
          ...i,
          horimetroTotalMinutos: (i.horimetroTotalMinutos || 0) + minutos,
          dataAtualizacao: new Date(),
        };
      }
      return i;
    });

    definirImpressoras(novas);
    registrar.info({ rastreioId: idImpressora, minutos, servico: "Manutenção" }, "Horímetro atualizado localmente");
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

