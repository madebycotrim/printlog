/**
 * @file servicoRelatorios.ts
 * @description Serviço para geração de métricas e relatórios automáticos.
 * Conforme Fase 2 do Roadmap.
 */

import { Pedido } from "@/funcionalidades/producao/projetos/tipos";
import { StatusPedido, Centavos } from "@/compartilhado/tipos/modelos";
import { verificarSeEstaAtrasado } from "@/compartilhado/utilitarios/gestaoAtrasos";

export interface MetricasProducao {
  totalProjetos: number;
  emAndamento: number;
  concluidos: number;
  atrasados: number;
  eficienciaPercentual: number;
  mediaGramasPorPedido: number;
}

export interface PontoHistoricoProducao {
  data: string;
  quantidade: number;
  valorCentavos: Centavos;
  tempoMinutos: number;
  pesoGramas: number;
}

export interface ResumoHistoricoGlobal {
  totalFaturadoCentavos: Centavos;
  totalPesoGramas: number;
  totalTempoMinutos: number;
  totalProjetosConcluidos: number;
  pontosHistoricos: PontoHistoricoProducao[];
}

export const servicoRelatorios = {
  /**
   * Gera um resumo de métricas baseado na lista atual de pedidos.
   */
  gerarMetricasProducao: (pedidos: Pedido[]): MetricasProducao => {
    const total = pedidos.length;
    if (total === 0) {
      return {
        totalProjetos: 0,
        emAndamento: 0,
        concluidos: 0,
        atrasados: 0,
        eficienciaPercentual: 0,
        mediaGramasPorPedido: 0,
      };
    }

    const concluidos = pedidos.filter((p) => p.status === StatusPedido.CONCLUIDO).length;
    const atrasados = pedidos.filter(verificarSeEstaAtrasado).length;
    const emAndamento = pedidos.filter(
      (p) => p.status === StatusPedido.EM_PRODUCAO || p.status === StatusPedido.ACABAMENTO,
    ).length;

    const totalGrama = pedidos.reduce((acc, p) => acc + (p.pesoGramas || 0), 0);

    // Eficiência = (Concluídos - Atrasados) / Total (Simplificado para o MVP)
    const eficiencia = Math.max(0, ((concluidos - atrasados) / total) * 100);

    return {
      totalProjetos: total,
      emAndamento,
      concluidos,
      atrasados,
      eficienciaPercentual: Math.round(eficiencia),
      mediaGramasPorPedido: Math.round(totalGrama / total),
    };
  },

  /**
   * Consolida o histórico global de produção.
   */
  gerarHistoricoGlobal: (pedidos: Pedido[]): ResumoHistoricoGlobal => {
    const concluidos = pedidos.filter((p) => p.status === StatusPedido.CONCLUIDO);

    let totalFaturado = 0;
    let totalPeso = 0;
    let totalTempo = 0;

    const mapaHistorico: Record<string, PontoHistoricoProducao> = {};

    concluidos.forEach((p) => {
      totalFaturado += p.valorCentavos;
      totalPeso += p.pesoGramas || 0;
      totalTempo += p.tempoMinutos || 0;

      const data = p.dataConclusao || p.dataCriacao;
      const chave = new Date(data).toISOString().split("T")[0]; // YYYY-MM-DD

      if (!mapaHistorico[chave]) {
        mapaHistorico[chave] = {
          data: chave,
          quantidade: 0,
          valorCentavos: 0,
          tempoMinutos: 0,
          pesoGramas: 0,
        };
      }

      mapaHistorico[chave].quantidade += 1;
      mapaHistorico[chave].valorCentavos += p.valorCentavos;
      mapaHistorico[chave].tempoMinutos += p.tempoMinutos || 0;
      mapaHistorico[chave].pesoGramas += p.pesoGramas || 0;
    });

    const pontosHistoricos = Object.values(mapaHistorico).sort(
      (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime(),
    );

    return {
      totalFaturadoCentavos: totalFaturado,
      totalPesoGramas: totalPeso,
      totalTempoMinutos: totalTempo,
      totalProjetosConcluidos: concluidos.length,
      pontosHistoricos,
    };
  },
};
