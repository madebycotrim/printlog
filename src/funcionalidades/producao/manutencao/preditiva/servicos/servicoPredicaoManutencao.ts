/**
 * @file servicoPredicaoManutencao.ts
 * @description Inteligência para cálculo de manutenção preditiva baseada em horímetro.
 * Conforme Fase 2 do Roadmap.
 */

import { Impressora } from "@/funcionalidades/producao/impressoras/tipos";
import {
  StatusVidaUtil,
  obterStatusManutencao,
} from "@/funcionalidades/producao/impressoras/utilitarios/utilitariosManutencao";

export interface ItemAgendaManutencao {
  idImpressora: string;
  nomeImpressora: string;
  tipo: "Geral" | "Peça";
  nomeItem: string;
  status: StatusVidaUtil;
  percentualUso: number;
  horasRestantes: number;
  previsaoData?: Date;
}

export const servicoPredicaoManutencao = {
  /**
   * Gera a agenda preditiva consolidada para todas as impressoras.
   */
  gerarAgendaPreditiva: (impressoras: Impressora[]): ItemAgendaManutencao[] => {
    const agenda: ItemAgendaManutencao[] = [];
    const hoje = new Date();

    impressoras
      .filter((imp) => !imp.dataAposentadoria)
      .forEach((imp) => {
        // 1. Verificação da Revisão Geral
        const horimetro = imp.horimetroTotalMinutos || 0;
        const intervalo = imp.intervaloRevisaoMinutos || 30000; // Default 500h
        const statusGeral = obterStatusManutencao(horimetro, intervalo);
        const percentualGeral = Math.min((horimetro / intervalo) * 100, 100);
        const minutosRestantesGeral = Math.max(intervalo - horimetro, 0);

        agenda.push({
          idImpressora: imp.id,
          nomeImpressora: imp.nome,
          tipo: "Geral",
          nomeItem: "Revisão Geral / Lubrificação",
          status: statusGeral,
          percentualUso: Math.round(percentualGeral),
          horasRestantes: Math.round(minutosRestantesGeral / 60),
          previsaoData: calcularPrevisaoData(hoje, minutosRestantesGeral),
        });

        // 2. Verificação de Peças de Desgaste
        imp.pecasDesgaste?.forEach((peca) => {
          const usoPeca = peca.minutosTrocado; // Minutos desde a última troca
          const vidaUtil = peca.vidaUtilEstimadaMinutos;
          const statusPeca = obterStatusManutencao(usoPeca, vidaUtil);
          const percentualPeca = Math.min((usoPeca / vidaUtil) * 100, 100);
          const minutosRestantesPeca = Math.max(vidaUtil - usoPeca, 0);

          agenda.push({
            idImpressora: imp.id,
            nomeImpressora: imp.nome,
            tipo: "Peça",
            nomeItem: peca.nome,
            status: statusPeca,
            percentualUso: Math.round(percentualPeca),
            horasRestantes: Math.round(minutosRestantesPeca / 60),
            previsaoData: calcularPrevisaoData(hoje, minutosRestantesPeca),
          });
        });
      });

    // Ordenar por criticidade (mais urgente primeiro)
    return agenda.sort((a, b) => {
      const pesoStatus = { critico: 3, aviso: 2, normal: 1 };
      if (pesoStatus[b.status] !== pesoStatus[a.status]) {
        return pesoStatus[b.status] - pesoStatus[a.status];
      }
      return b.percentualUso - a.percentualUso;
    });
  },
};

/**
 * Lógica simples de previsão: consideração de 8h de uso médio diário.
 * Em produção, isso seria baseado no histórico real de uso da máquina.
 */
function calcularPrevisaoData(dataBase: Date, minutosRestantes: number): Date {
  const horasUsoDiarioMedio = 8;
  const diasRestantes = minutosRestantes / 60 / horasUsoDiarioMedio;
  const dataPrevisao = new Date(dataBase);
  dataPrevisao.setDate(dataPrevisao.getDate() + Math.round(diasRestantes));
  return dataPrevisao;
}
