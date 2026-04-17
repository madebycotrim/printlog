/**
 * @file servicoDesperdicio.ts
 * @description Inteligência para análise de desperdício (sucata, peças falhas, insumos vencidos).
 * Conforme Fase 2 do Roadmap.
 */

import { Material } from "@/funcionalidades/producao/materiais/tipos";
import { Insumo } from "@/funcionalidades/producao/insumos/tipos";
import { Centavos } from "@/compartilhado/tipos/modelos";

export interface MetricasDesperdicio {
  totalPerdidoCentavos: Centavos;
  pesoTotalFalhasGramas: number;
  indiceDesperdicioPercentual: number; // % do material total que foi pro lixo
  topMotivosDesperdicio: { motivo: string; valorCentavos: Centavos }[];
}

export interface PontoHistoricoDesperdicio {
  mes: string;
  valorCentavos: Centavos;
  pesoGramas: number;
}

export const servicoDesperdicio = {
  /**
   * Calcula métricas de desperdício baseadas no histórico de materiais e insumos.
   */
  calcularMetricas: (materiais: Material[], insumos: Insumo[]): MetricasDesperdicio => {
    let totalPerdidoCentavos = 0;
    let pesoFalhas = 0;
    let pesoSucesso = 0;
    const motivosMap: Record<string, number> = {};

    materiais.forEach((m) => {
      const custoPorGrama = m.precoCentavos / (m.pesoGramas || 1000);

      m.historicoUso?.forEach((u) => {
        if (u.status === "FALHA" || u.status === "CANCELADO") {
          const perda = u.quantidadeGastaGramas * custoPorGrama;
          totalPerdidoCentavos += perda;
          pesoFalhas += u.quantidadeGastaGramas;

          const motivo = u.nomePeca || "Falha Técnica";
          motivosMap[motivo] = (motivosMap[motivo] || 0) + perda;
        } else if (u.status === "SUCESSO") {
          pesoSucesso += u.quantidadeGastaGramas;
        }
      });
    });

    insumos.forEach((i) => {
      i.historico?.forEach((h) => {
        if (h.tipo === "Saída" && (h.motivo === "Descarte" || h.motivo === "Avaria")) {
          const perda = h.quantidade * (i.custoMedioUnidade || 0);
          totalPerdidoCentavos += perda;

          const motivo = h.observacao || h.motivo || "Avaria Geral";
          motivosMap[motivo] = (motivosMap[motivo] || 0) + perda;
        }
      });
    });

    const totalProcessado = pesoFalhas + pesoSucesso;
    const indiceDesperdicio = totalProcessado > 0 ? (pesoFalhas / totalProcessado) * 100 : 0;

    const topMotivos = Object.entries(motivosMap)
      .map(([motivo, valor]) => ({ motivo, valorCentavos: Math.round(valor) }))
      .sort((a, b) => b.valorCentavos - a.valorCentavos)
      .slice(0, 5);

    return {
      totalPerdidoCentavos: Math.round(totalPerdidoCentavos),
      pesoTotalFalhasGramas: pesoFalhas,
      indiceDesperdicioPercentual: Number(indiceDesperdicio.toFixed(1)),
      topMotivosDesperdicio: topMotivos,
    };
  },

  /**
   * Gera os pontos para o gráfico de evolução histórica (últimos 6 meses).
   */
  gerarHistorico: (materiais: Material[], insumos: Insumo[]): PontoHistoricoDesperdicio[] => {
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const hoje = new Date();
    const ultimos6Meses: PontoHistoricoDesperdicio[] = [];

    // Inicializa os últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const dataRef = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      ultimos6Meses.push({
        mes: `${meses[dataRef.getMonth()]}/${dataRef.getFullYear().toString().slice(-2)}`,
        valorCentavos: 0,
        pesoGramas: 0,
      });
    }

    const obterIndexMes = (dataStr: string) => {
      const data = new Date(dataStr);
      if (isNaN(data.getTime())) return -1;

      for (let i = 0; i < 6; i++) {
        const ref = new Date(hoje.getFullYear(), hoje.getMonth() - (5 - i), 1);
        if (data.getMonth() === ref.getMonth() && data.getFullYear() === ref.getFullYear()) {
          return i;
        }
      }
      return -1;
    };

    materiais.forEach((m) => {
      const custoPorGrama = m.precoCentavos / (m.pesoGramas || 1000);
      m.historicoUso?.forEach((u) => {
        if (u.status === "FALHA" || u.status === "CANCELADO") {
          // Tenta converter formatos como "26 Fev, 05:45" para Data real
          // Para fins de MVP, se a data for amigável, tentamos inferir o mês atual/anterior
          let dataIso = u.data;
          if (u.data.includes(",")) {
            // Formato amigável do sistema: "26 Fev, 05:45"
            // Como não tem ano, assumimos o ano atual
            const [diaMes] = u.data.split(",");
            const [dia, mesAbv] = diaMes.trim().split(" ");
            const mesIndex = meses.indexOf(mesAbv);
            if (mesIndex !== -1) {
              const d = new Date(hoje.getFullYear(), mesIndex, parseInt(dia));
              dataIso = d.toISOString();
            }
          }

          const idx = obterIndexMes(dataIso);
          if (idx !== -1) {
            ultimos6Meses[idx].valorCentavos += Math.round(u.quantidadeGastaGramas * custoPorGrama);
            ultimos6Meses[idx].pesoGramas += u.quantidadeGastaGramas;
          }
        }
      });
    });

    insumos.forEach((i) => {
      i.historico?.forEach((h) => {
        if (h.tipo === "Saída" && (h.motivo === "Descarte" || h.motivo === "Avaria")) {
          const idx = obterIndexMes(h.data);
          if (idx !== -1) {
            ultimos6Meses[idx].valorCentavos += Math.round(h.quantidade * (i.custoMedioUnidade || 0));
          }
        }
      });
    });

    return ultimos6Meses;
  },
};
