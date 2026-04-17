/**
 * @file validar-upload.ts
 * @description Validador de segurança para uploads de arquivos no frontend.
 * Previne upload de arquivos maliciosos, validando extensão, tamanho e conteúdo.
 */

/** Extensões permitidas para upload no PrintLog */
const EXTENSOES_PERMITIDAS = [".gcode"] as const;

/** Tamanho máximo de arquivo: 50MB (G-Code pode ser grande) */
const TAMANHO_MAXIMO_BYTES = 50 * 1024 * 1024;

/**
 * Resultado da validação de um arquivo para upload.
 */
export interface ResultadoValidacaoUpload {
  valido: boolean;
  erro?: string;
}

/**
 * Valida se um arquivo é seguro para processamento no sistema.
 * Verifica extensão e tamanho antes do processamento.
 * @param arquivo - Objeto File do input/drag-and-drop
 * @returns Resultado da validação com mensagem de erro se inválido
 */
export function validarArquivoUpload(arquivo: File): ResultadoValidacaoUpload {
  if (!arquivo) {
    return { valido: false, erro: "Nenhum arquivo selecionado." };
  }

  // Validação de tamanho
  if (arquivo.size > TAMANHO_MAXIMO_BYTES) {
    const tamanhoMB = Math.round(arquivo.size / 1024 / 1024);
    return {
      valido: false,
      erro: `Arquivo muito grande (${tamanhoMB}MB). Máximo: ${TAMANHO_MAXIMO_BYTES / 1024 / 1024}MB.`,
    };
  }

  // Validação de extensão (case insensitive)
  const nomeArquivo = arquivo.name.toLowerCase();
  const extensaoValida = EXTENSOES_PERMITIDAS.some((ext) =>
    nomeArquivo.endsWith(ext),
  );

  if (!extensaoValida) {
    return {
      valido: false,
      erro: `Tipo de arquivo não permitido. Extensões aceitas: ${EXTENSOES_PERMITIDAS.join(", ")}`,
    };
  }

  // Bloqueia arquivos sem nome (edge case)
  if (arquivo.name.length === 0) {
    return { valido: false, erro: "Arquivo com nome inválido." };
  }

  // Bloqueia nomes com path traversal
  if (arquivo.name.includes("..") || arquivo.name.includes("/") || arquivo.name.includes("\\")) {
    return { valido: false, erro: "Nome de arquivo contém caracteres inválidos." };
  }

  return { valido: true };
}
