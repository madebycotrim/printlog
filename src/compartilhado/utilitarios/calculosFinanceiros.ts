/**
 * @file calculosFinanceiros.ts
 * @description Utilitários para cálculos de precificação de impressão 3D.
 * Conforme Regra 6.0 (Centavos) e Objetivos da Fase 2.
 */

import { Centavos } from "../tipos/modelos";

interface ParametrosCusto {
  pesoGramas: number;
  tempoMinutos: number;
  precoFilamentoKgCentavos: Centavos;
  potenciaW: number;
  precoKwhCentavos: Centavos;
  taxaLucro?: number; // Ex: 0.3 para 30%
  maoDeObraHoraCentavos?: Centavos;
}

interface DetalhamentoCusto {
  custoMaterial: Centavos;
  custoEnergia: Centavos;
  custoMaoDeObra: Centavos;
  custoTotal: Centavos;
  precoSugerido: Centavos;
}

/**
 * Calcula o custo detalhado de uma impressão.
 * @param params Objetos com pesos, tempos e custos base.
 */
export function calcularCustoImpressao(params: ParametrosCusto): DetalhamentoCusto {
  const {
    pesoGramas,
    tempoMinutos,
    precoFilamentoKgCentavos,
    potenciaW,
    precoKwhCentavos,
    taxaLucro = 0,
    maoDeObraHoraCentavos = 0,
  } = params;

  // 1. Custo de Material: (g / 1000) * preco_kg
  const custoMaterial = Math.round((pesoGramas / 1000) * precoFilamentoKgCentavos);

  // 2. Custo de Energia: (min / 60) * (W / 1000) * preco_kwh
  const custoEnergia = Math.round((tempoMinutos / 60) * (potenciaW / 1000) * precoKwhCentavos);

  // 3. Custo de Mão de Obra: (min / 60) * preco_hora
  const custoMaoDeObra = Math.round((tempoMinutos / 60) * maoDeObraHoraCentavos);

  const custoTotal = custoMaterial + custoEnergia + custoMaoDeObra;

  // 4. Preço Sugerido com Margem
  const precoSugerido = Math.round(custoTotal * (1 + taxaLucro));

  return {
    custoMaterial,
    custoEnergia,
    custoMaoDeObra,
    custoTotal,
    precoSugerido,
  };
}
