/**
 * @file servicoInventario.ts
 * @description Inteligência para relatórios de estoque de materiais e insumos.
 * Conforme Fase 2 do Roadmap.
 */

import { Material } from "@/funcionalidades/producao/materiais/tipos";
import { Insumo } from "@/funcionalidades/producao/insumos/tipos";
import { Centavos } from "@/compartilhado/tipos/modelos";

export interface SugestaoCompra {
  idItem: string;
  nome: string;
  tipo: "Material" | "Insumo";
  quantidadeAtual: number;
  unidade: string;
  diasRestantes: number;
  quantidadeSugerida: number;
  custoEstimadoCentavos: Centavos;
  prioridade: "Baixa" | "Média" | "Alta" | "Crítica";
}

export interface MetricasInventario {
  valorTotalEstoqueCentavos: Centavos;
  itensEmAlerta: number;
  consumoEstimadoMensalCentavos: Centavos;
  giroEstoqueDias: number; // Média de dias para renovar o estoque
  distribuicaoPorCategoria: Record<string, number>;
  sugestoesCompra: SugestaoCompra[];
}

export const servicoInventario = {
  /**
   * Consolida métricas de materiais (filamentos/resinas) e insumos gerais.
   */
  gerarRelatorioConsolidado: (materiais: Material[], insumos: Insumo[]): MetricasInventario => {
    let valorTotal = 0;
    let alertas = 0;
    const distribuicao: Record<string, number> = {};
    const sugestoes: SugestaoCompra[] = [];

    // Cálculo de Consumo (Últimos 30 dias)
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
    let consumoTrintaDiasCentavos = 0;

    // Lead time padrão (ex: 7 dias para chegar uma compra)
    const LEAD_TIME_DIAS = 7;
    // Queremos manter estoque para mais 30 dias após a chegada
    const DIAS_ESTOQUE_DESEJADO = 30;

    materiais.forEach((m) => {
      const pesoTotal = m.pesoRestanteGramas + m.estoque * (m.pesoGramas || 1000);
      const custoPorGrama = m.precoCentavos / (m.pesoGramas || 1000);
      valorTotal += pesoTotal * custoPorGrama;

      // Alerta: Regra v9.0
      if (m.pesoRestanteGramas < 200 && m.estoque === 0) {
        alertas++;
      }

      // Consumo Histórico
      let consumoGrama30Dias = 0;
      m.historicoUso?.forEach((u) => {
        if (new Date(u.data) >= trintaDiasAtras && u.status === "SUCESSO") {
          const gasto = u.quantidadeGastaGramas;
          consumoTrintaDiasCentavos += gasto * custoPorGrama;
          consumoGrama30Dias += gasto;
        }
      });

      const consumoDiario = consumoGrama30Dias / 30;
      if (consumoDiario > 0) {
        const diasRestantes = pesoTotal / consumoDiario;
        if (diasRestantes <= LEAD_TIME_DIAS + 5) {
          // Sugerir se acabar perto do lead time
          const qtdNecessaria = consumoDiario * (LEAD_TIME_DIAS + DIAS_ESTOQUE_DESEJADO) - pesoTotal;
          const rolosNecessarios = Math.ceil(qtdNecessaria / (m.pesoGramas || 1000));

          if (rolosNecessarios > 0) {
            sugestoes.push({
              idItem: m.id,
              nome: m.nome,
              tipo: "Material",
              quantidadeAtual: pesoTotal,
              unidade: "g",
              diasRestantes: Math.round(diasRestantes),
              quantidadeSugerida: rolosNecessarios,
              custoEstimadoCentavos: rolosNecessarios * m.precoCentavos,
              prioridade: diasRestantes <= LEAD_TIME_DIAS ? "Crítica" : diasRestantes <= 10 ? "Alta" : "Média",
            });
          }
        }
      }
    });

    insumos.forEach((i) => {
      const valorItem = i.quantidadeAtual * (i.custoMedioUnidade || 0);
      valorTotal += valorItem;

      if (i.quantidadeAtual <= i.quantidadeMinima) {
        alertas++;
      }

      distribuicao[i.categoria] = (distribuicao[i.categoria] || 0) + 1;

      // Consumo Histórico
      let consumoUnidade30Dias = 0;
      i.historico?.forEach((h) => {
        if (new Date(h.data) >= trintaDiasAtras && h.tipo === "Saída") {
          consumoTrintaDiasCentavos += h.quantidade * (i.custoMedioUnidade || 0);
          consumoUnidade30Dias += h.quantidade;
        }
      });

      const consumoDiario = consumoUnidade30Dias / 30;
      if (consumoDiario > 0) {
        const diasRestantes = i.quantidadeAtual / consumoDiario;
        if (diasRestantes <= LEAD_TIME_DIAS + 5 || i.quantidadeAtual <= i.quantidadeMinima) {
          const qtdNecessaria = consumoDiario * (LEAD_TIME_DIAS + DIAS_ESTOQUE_DESEJADO) - i.quantidadeAtual;
          const sugerido = Math.max(Math.ceil(qtdNecessaria), 1);

          sugestoes.push({
            idItem: i.id,
            nome: i.nome,
            tipo: "Insumo",
            quantidadeAtual: i.quantidadeAtual,
            unidade: i.unidadeMedida,
            diasRestantes: Math.round(diasRestantes),
            quantidadeSugerida: sugerido,
            custoEstimadoCentavos: Math.round(sugerido * (i.custoMedioUnidade || 0)),
            prioridade:
              diasRestantes <= LEAD_TIME_DIAS || i.quantidadeAtual <= i.quantidadeMinima ? "Crítica" : "Média",
          });
        }
      }
    });

    const consumoDiarioMedio = consumoTrintaDiasCentavos / 30;
    const giroEstoqueDias = consumoDiarioMedio > 0 ? Math.round(valorTotal / consumoDiarioMedio) : 0;

    return {
      valorTotalEstoqueCentavos: Math.round(valorTotal),
      itensEmAlerta: alertas,
      consumoEstimadoMensalCentavos: Math.round(consumoTrintaDiasCentavos),
      giroEstoqueDias,
      distribuicaoPorCategoria: distribuicao,
      sugestoesCompra: sugestoes.sort((a, b) => {
        const pesos = { Crítica: 4, Alta: 3, Média: 2, Baixa: 1 };
        return pesos[b.prioridade] - pesos[a.prioridade];
      }),
    };
  },
};
