/**
 * @file servicoManutencao.ts
 * @description Lógica centralizada para gestão de manutenção preventiva (Fase 2).
 */

import { Impressora, RegistroManutencao } from "@/funcionalidades/producao/impressoras/tipos";
import { registrar } from "@/compartilhado/utilitarios/registrador";
import { usarArmazemImpressoras } from "@/funcionalidades/producao/impressoras/estado/armazemImpressoras";

export const servicoManutencao = {
  /**
   * Registra o uso da máquina, atualizando o horímetro.
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
    registrar.info({ rastreioId: idImpressora, minutos, servico: "Manutenção" }, "Horímetro atualizado");
  },

  /**
   * Registra uma intervenção de manutenção e reseta o ciclo para o dashboard.
   */
  registrarManutencaoConcluida: (
    idImpressora: string,
    dados: Omit<RegistroManutencao, "id" | "horasMaquinaNoMomentoMinutos">,
  ) => {
    const { impressoras, definirImpressoras } = usarArmazemImpressoras.getState();
    const novas = impressoras.map((i) => {
      if (i.id === idImpressora) {
        const novoRegistro: RegistroManutencao = {
          ...dados,
          id: crypto.randomUUID(),
          horasMaquinaNoMomentoMinutos: i.horimetroTotalMinutos || 0,
        };

        return {
          ...i,
          // Ao concluir uma PREVENTIVA, podemos optar por "zerar" o contador visual ou apenas registrar
          // Para o dashboard continuar funcionando, a lógica de 'obterStatusManutencao' precisaria
          // olhar para a última preventiva.
          // v9.0: Vamos registrar no histórico e o dashboard mostrará o status real.
          historicoManutencao: [novoRegistro, ...(i.historicoManutencao || [])],
          dataAtualizacao: new Date(),
        };
      }
      return i;
    });

    definirImpressoras(novas);
    registrar.info(
      { rastreioId: idImpressora, tipo: dados.tipo, servico: "Manutenção" },
      "Manutenção registrada com sucesso",
    );
  },

  /**
   * Estima a data da próxima manutenção baseada no uso médio.
   * @fase 2 - Sugestão baseada em histórico de produção (RegistroProducao)
   */
  preverProximaManutencao: (impressora: Impressora): Date | null => {
    if (
      !impressora.intervaloRevisaoMinutos ||
      !impressora.historicoProducao ||
      impressora.historicoProducao.length < 3
    ) {
      return null;
    }

    // Calcula média de minutos/dia nos últimos jobs
    const totalMinutos = impressora.historicoProducao.reduce((acc, p) => acc + p.minutosImpressao, 0);
    const primeiraData = new Date(impressora.historicoProducao[0].dataConclusao).getTime();
    const ultimaData = new Date(
      impressora.historicoProducao[impressora.historicoProducao.length - 1].dataConclusao,
    ).getTime();
    const diasDiferenca = Math.max(1, (ultimaData - primeiraData) / (1000 * 60 * 60 * 24));

    const mediaMinutosPorDia = totalMinutos / diasDiferenca;
    const minutosFaltantes = impressora.intervaloRevisaoMinutos - (impressora.horimetroTotalMinutos || 0);

    if (minutosFaltantes <= 0) return new Date(); // Já passou

    const diasParaProx = Math.ceil(minutosFaltantes / mediaMinutosPorDia);
    const dataPrevista = new Date();
    dataPrevista.setDate(dataPrevista.getDate() + diasParaProx);

    return dataPrevista;
  },
};
