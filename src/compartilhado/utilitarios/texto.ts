/**
 * Utilitários para manipulação e formatação de texto.
 * Conforme Regra 1.0 (PT-BR) e Regra 3.0 (Solo Dev).
 */

/**
 * Mascara um e-mail para exibição parcial (Segurança/LGPD).
 * Ex: "mateus@exemplo.com" -> "m***s@exemplo.com"
 */
export const mascararEmail = (email?: string): string => {
  if (!email) return "";
  const [nome, dominio] = email.split('@');
  if (!dominio) return email;
  
  const mascara = nome.length > 2 
    ? `${nome[0]}***${nome[nome.length - 1]}` 
    : `${nome[0]}***`;
    
  return `${mascara}@${dominio}`;
};

/**
 * Remove acentos e caracteres especiais de uma string.
 */
export const removerAcentos = (texto: string): string => {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

/**
 * Transforma a primeira letra em maiúscula.
 */
export const capitalizar = (texto: string): string => {
  if (!texto) return "";
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
};
