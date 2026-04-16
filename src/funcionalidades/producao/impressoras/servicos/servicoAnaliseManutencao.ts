/**
 * @file servicoAnaliseManutencao.ts
 * @description Inteligência para identificar manutenções preventivas necessárias.
 * Conforme Fase 2 do Roadmap.
 */

import { PecaDesgaste } from "../manutencao/tipos";

export interface AlertaManutencao {
  idPeca: string;
  nomePeca: string;
  idImpressora: string;
  nivelUso: number; // 0 a 100
  ehCritico: boolean;
}

export const servicoAnaliseManutencao = {
  /**
   * Analisa uma lista de peças e retorna os alertas de manutenção.
   * Regra: > 75% alerta, > 90% crítico.
   */
  analisarPecas: (pecas: PecaDesgaste[]): AlertaManutencao[] => {
    return pecas
      .map((p) => {
        const nivelUso = (p.minutosUsoAtual / p.vidaUtilEstimadaMinutos) * 100;
        return {
          idPeca: p.id,
          nomePeca: p.nome,
          idImpressora: p.idImpressora,
          nivelUso,
          ehCritico: nivelUso > 90,
        };
      })
      .filter((a) => a.nivelUso > 75);
  },

  /**
   * Calcula o score de saúde geral do parque (0 a 100).
   */
  calcularSaudeGeral: (pecas: PecaDesgaste[]): number => {
    if (pecas.length === 0) return 100;
    const totalUso = pecas.reduce((acc, p) => acc + p.minutosUsoAtual / p.vidaUtilEstimadaMinutos, 0);
    const mediaUso = totalUso / pecas.length;
    return Math.max(0, Math.round(100 - mediaUso * 100));
  },
};
