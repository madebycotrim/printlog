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
