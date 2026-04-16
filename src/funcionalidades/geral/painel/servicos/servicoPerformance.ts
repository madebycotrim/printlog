/**
 * @file servicoPerformance.ts
 * @description Lógica de Business Intelligence para cálculo de eficiência operacional (OEE).
 * v9.0: Baseado em disponibilidade, performance e qualidade.
 */

import { Impressora } from "@/funcionalidades/producao/impressoras/tipos";
import { Pedido } from "@/funcionalidades/producao/projetos/tipos";
import { StatusPedido } from "@/compartilhado/tipos/modelos";

export interface MetricasPerformance {
  oeePercentual: number;
  disponibilidadePercentual: number;
  performanceFilaPercentual: number;
  qualidadeSucessoPercentual: number;
  mtbfHoras: number; // Mean Time Between Failures
  statusOperacional: "otimizada" | "degradada" | "critica";
}

export const servicoPerformance = {
  /**
   * Calcula as métricas de performance global do parque de máquinas.
   */
  calcularMetricasGlobais: (impressoras: Impressora[], pedidos: Pedido[]): MetricasPerformance => {
    // 1. Disponibilidade: Máquinas não aposentadas vs total (simplificado para MVP)
    const maquinasAtivas = impressoras.filter((i) => !i.dataAposentadoria);
    const maquinasEmManutencao = maquinasAtivas.filter((i) => i.status === "manutencao").length;
    const disponibilidade =
      maquinasAtivas.length > 0 ? ((maquinasAtivas.length - maquinasEmManutencao) / maquinasAtivas.length) * 100 : 0;

    // 2. Performance: Relação de pedidos concluídos vs prazo (simplificado)
    const concluidos = pedidos.filter((p) => p.status === StatusPedido.CONCLUIDO);
    const noPrazo = concluidos.filter((p) => {
      if (!p.prazoEntrega || !p.dataConclusao) return true;
      return new Date(p.dataConclusao) <= new Date(p.prazoEntrega);
    }).length;
    const performance = concluidos.length > 0 ? (noPrazo / concluidos.length) * 100 : 100;

    // 3. Qualidade: Ratio de sucessos do histórico de produção das máquinas
    let totalImpressões = 0;
    let sucessos = 0;

    impressoras.forEach((i) => {
      i.historicoProducao?.forEach((hp) => {
        totalImpressões++;
        if (hp.sucesso) sucessos++;
      });
    });

    const qualidade = totalImpressões > 0 ? (sucessos / totalImpressões) * 100 : 95; // Default 95 se vazio

    // OEE = Disponibilidade * Performance * Qualidade
    const oee = (disponibilidade / 100) * (performance / 100) * (qualidade / 100) * 100;

    // MTBF: Horímetro total / Número de Falhas (preventivas/corretivas no hist)
    let totalHoras = 0;
    let falhas = 0;
    impressoras.forEach((i) => {
      totalHoras += (i.horimetroTotalMinutos || 0) / 60;
      falhas += i.historicoManutencao?.filter((m) => m.tipo === "Corretiva").length || 0;
    });

    const mtbf = falhas > 0 ? totalHoras / falhas : totalHoras || 0;

    let status: MetricasPerformance["statusOperacional"] = "otimizada";
    if (oee < 60) status = "critica";
    else if (oee < 85) status = "degradada";

    return {
      oeePercentual: Math.round(oee),
      disponibilidadePercentual: Math.round(disponibilidade),
      performanceFilaPercentual: Math.round(performance),
      qualidadeSucessoPercentual: Math.round(qualidade),
      mtbfHoras: Math.round(mtbf),
      statusOperacional: status,
    };
  },
};
