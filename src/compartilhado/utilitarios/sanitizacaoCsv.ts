/**
 * Utilitário de Prevenção a Injeção de Fórmulas em CSV (CSV Formula Injection)
 * Padrão OWASP: Previne execução de comandos/fórmulas em softwares de planilhas
 * (Excel, Calc, Sheets) ao abrir arquivos CSV exportados pelo sistema.
 */

export function sanitizarCampoCSV(valor: unknown): string {
  if (valor === null || valor === undefined) return '""';
  let str = String(valor);

  // Escapa aspas duplas duplicando-as (conforme RFC 4180)
  str = str.replace(/"/g, '""');

  // Previne injeção de fórmulas iniciadas por caracteres de comando
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  return `"${str}"`;
}
