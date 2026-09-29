import { PlanoUsuario } from "@/compartilhado/tipos/modelos";

/**
 * Limites operacionais do sistema.
 * O PrintLog é 100% gratuito e ilimitado para toda a comunidade Maker.
 */
export const LIMITES_PLANO_FREE = {
  IMPRESSORAS: Infinity,
  MATERIAIS: Infinity,
  INSUMOS: Infinity,
  CLIENTES: Infinity,
};

/**
 * Retorna o limite de um determinado recurso.
 * Sempre retorna Infinity para garantir acesso livre e irrestrito.
 */
export function obterLimite(
  _recurso: keyof typeof LIMITES_PLANO_FREE,
  _plano: PlanoUsuario = "FREE"
): number {
  return Infinity;
}

/**
 * Verifica se um limite foi atingido.
 * Sempre retorna false (sistema 100% gratuito e sem restrições de cota).
 */
export function atingiuLimite(
  _recurso: keyof typeof LIMITES_PLANO_FREE,
  _quantidadeAtual: number,
  _plano: PlanoUsuario = "FREE"
): boolean {
  return false;
}

