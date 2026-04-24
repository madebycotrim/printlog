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
  // Novos Parâmetros Comerciais
  custoInsumosCentavos?: Centavos;
  custoFreteCentavos?: Centavos;
  taxaEcommercePercentual?: number; // Ex: 0.18 para 18%
  taxaFixaVendaCentavos?: Centavos;
  taxaImpostoPercentual?: number; // Ex: 0.06 para 6%
}

interface DetalhamentoCusto {
  custoMaterial: Centavos;
  custoEnergia: Centavos;
  custoMaoDeObra: Centavos;
  custoInsumos: Centavos;
  custoOperacional: Centavos; // Soma da produção
  custoTotalReal: Centavos;     // Produção + Insumos + Frete + Taxas Fixas + Impostos
  taxaMarketplace: Centavos;  // Impacto da taxa % no preço final
  valorImposto: Centavos;      // Valor nominal do imposto
  precoSugerido: Centavos;
}

/**
 * Calcula o custo detalhado de uma impressão com viés comercial.
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
    custoInsumosCentavos = 0,
    custoFreteCentavos = 0,
    taxaEcommercePercentual = 0,
    taxaFixaVendaCentavos = 0,
    taxaImpostoPercentual = 0,
  } = params;

  // 1. Custo de Material: (g / 1000) * preco_kg
  const custoMaterial = Math.round((pesoGramas / 1000) * precoFilamentoKgCentavos);

  // 2. Custo de Energia: (min / 60) * (W / 1000) * preco_kwh
  const custoEnergia = Math.round((tempoMinutos / 60) * (potenciaW / 1000) * precoKwhCentavos);

  // 3. Custo de Mão de Obra: (min / 60) * preco_hora
  const custoMaoDeObra = Math.round((tempoMinutos / 60) * maoDeObraHoraCentavos);

  const custoOperacional = custoMaterial + custoEnergia + custoMaoDeObra;

  // 4. Base de Lucro (Produção + Embalagem)
  // Aplicamos a margem sobre o que o maker efetivamente "fabrica"
  const baseLucro = (custoOperacional + custoInsumosCentavos) * (1 + taxaLucro);

  // 5. Cálculo do Preço Final Revendo Taxas (Pell-formula para E-commerce + Impostos)
  // Preço Final = (BaseLucro + Frete + TaxaFixa) / (1 - Taxa% - Imposto%)
  const divisor = 1 - taxaEcommercePercentual - taxaImpostoPercentual;
  const precoSugerido = Math.round(
    (baseLucro + custoFreteCentavos + taxaFixaVendaCentavos) / (divisor > 0 ? divisor : 0.01)
  );

  const taxaMarketplace = Math.round(precoSugerido * taxaEcommercePercentual) + taxaFixaVendaCentavos;
  const valorImposto = Math.round(precoSugerido * taxaImpostoPercentual);
  const custoTotalReal = custoOperacional + custoInsumosCentavos + custoFreteCentavos + taxaMarketplace + valorImposto;

  return {
    custoMaterial,
    custoEnergia,
    custoMaoDeObra,
    custoInsumos: custoInsumosCentavos,
    custoOperacional,
    custoTotalReal,
    taxaMarketplace,
    precoSugerido,
  };
}
