import { PlanoUsuario } from "@/compartilhado/tipos/modelos";

/**
 * Limites operacionais para contas do plano GRATUITO.
 * Usado para aplicar restrições e exibir o paywall.
 */
export const LIMITES_PLANO_FREE = {
  IMPRESSORAS: 2,
  MATERIAIS: 15,
  INSUMOS: 15,
  CLIENTES: 10,
};

/**
 * Retorna o limite de um determinado recurso com base no plano do usuário.
 * Se o plano for PRO ou FUNDADOR, retorna Infinity.
 */
export function obterLimite(
  recurso: keyof typeof LIMITES_PLANO_FREE,
  plano: PlanoUsuario = "FREE"
): number {
  if (plano === "PRO" || plano === "FUNDADOR") {
    return Infinity;
  }
  return LIMITES_PLANO_FREE[recurso];
}

/**
 * Verifica se um limite foi atingido.
 */
export function atingiuLimite(
  recurso: keyof typeof LIMITES_PLANO_FREE,
  quantidadeAtual: number,
  plano: PlanoUsuario = "FREE"
): boolean {
  return quantidadeAtual >= obterLimite(recurso, plano);
}
