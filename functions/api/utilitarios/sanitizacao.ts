/**
 * Utilitário de Sanitização de Entradas
 * Previne injeção de HTML, quebras de templates e injeção de cabeçalhos.
 */

/**
 * Escapa entidades HTML para evitar injeção em templates de e-mail e telas.
 */
export function escaparHtml(texto: unknown): string {
  if (texto === null || texto === undefined) return "";
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Valida se uma URL utiliza esquemas seguros (apenas http, https ou caminho relativo).
 * Rejeita explicitamente javascript:, data:, vbscript:, etc.
 */
export function ehUrlSegura(url: unknown): boolean {
  if (typeof url !== "string" || !url.trim()) return false;
  const limpa = url.trim().toLowerCase();

  // Rejeita esquemas executáveis
  if (
    limpa.startsWith("javascript:") ||
    limpa.startsWith("data:") ||
    limpa.startsWith("vbscript:") ||
    limpa.startsWith("//")
  ) {
    return false;
  }

  // Aceita rotas relativas internas seguras
  if (limpa.startsWith("/")) return true;

  // Aceita apenas http:// ou https://
  return limpa.startsWith("http://") || limpa.startsWith("https://");
}
