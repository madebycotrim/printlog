/**
 * @file constantesNegocio.ts
 * @description Valores fixos de regras de negócio documentadas.
 * @version 9.0
 */

/** Limite de alerta automático de estoque de filamento (gramas) */
export const ALERTA_ESTOQUE_FILAMENTO_GRAMAS = 200;

/**
 * Desconto progressivo por volume mensal.
 * Revisado com comercial em 2024-Q1.
 */
export const DESCONTO_VOLUME = {
  LIMITE_NIVEL_1_GRAMAS: 1_000, // acima de 1kg/mês → 10%
  LIMITE_NIVEL_2_GRAMAS: 5_000, // acima de 5kg/mês → 18%
  PERCENTUAL_NIVEL_1: 0.1,
  PERCENTUAL_NIVEL_2: 0.18,
} as const;

/** Unidade de tempo do horímetro de impressoras */
export const HORIMETRO_UNIDADE = "minutos"; // sempre inteiro, nunca float

/**
 * Retenção de dados financeiros por obrigação fiscal.
 * Base: Lei 9.430/1996 — 5 anos.
 */
export const RETENCAO_FINANCEIRO_MESES = 60;
