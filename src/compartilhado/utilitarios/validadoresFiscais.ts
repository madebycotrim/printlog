/**
 * @file validadoresFiscais.ts
 * @description Validação matemática estrita de dígitos verificadores de CPF e CNPJ conforme normas da Receita Federal.
 */

/**
 * Valida o dígito verificador de um CPF (11 dígitos).
 */
export function validarCPF(cpf: string): boolean {
  const limpo = cpf.replace(/\D/g, "");
  if (limpo.length !== 11) return false;

  // Impede sequências repetidas inválidas (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(limpo)) return false;

  let soma = 0;
  let resto: number;

  for (let i = 1; i <= 9; i++) {
    soma += parseInt(limpo.substring(i - 1, i)) * (11 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(limpo.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(limpo.substring(i - 1, i)) * (12 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(limpo.substring(10, 11))) return false;

  return true;
}

/**
 * Valida o dígito verificador de um CNPJ (14 dígitos).
 */
export function validarCNPJ(cnpj: string): boolean {
  const limpo = cnpj.replace(/\D/g, "");
  if (limpo.length !== 14) return false;

  // Impede sequências repetidas inválidas
  if (/^(\d)\1{13}$/.test(limpo)) return false;

  let tamanho = limpo.length - 2;
  let numeros = limpo.substring(0, tamanho);
  const digitos = limpo.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  tamanho = tamanho + 1;
  numeros = limpo.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return false;

  return true;
}

/**
 * Valida documento dinamicamente dependendo do tamanho (CPF ou CNPJ).
 */
export function validarDocumentoFiscal(documento: string): { valido: boolean; tipo: "CPF" | "CNPJ" | "INVALIDO" } {
  const limpo = documento.replace(/\D/g, "");
  if (limpo.length === 11) {
    return { valido: validarCPF(limpo), tipo: "CPF" };
  }
  if (limpo.length === 14) {
    return { valido: validarCNPJ(limpo), tipo: "CNPJ" };
  }
  return { valido: false, tipo: "INVALIDO" };
}
