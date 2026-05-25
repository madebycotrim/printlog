export interface PayloadLinkMagico {
  pr: number; // preco (centavos)
  np: string; // nomeProjeto
  t: number;  // tempo (minutos)
  m: string[]; // nomes dos materiais
  e: string; // estudio
  s: string; // slogan
  w: string; // whatsapp (do user autenticado)
  id?: string; // id do projeto (se já salvo)
  cli?: string; // nome do cliente
  obs?: string; // observações adicionais
}

export function codificarLinkMagico(payload: PayloadLinkMagico): string {
  const json = JSON.stringify(payload);
  // Usa btoa com encodeURIComponent para suportar caracteres Unicode como ç e acentos
  return btoa(encodeURIComponent(json));
}

export function decodificarLinkMagico(hash: string): PayloadLinkMagico | null {
  try {
    const json = decodeURIComponent(atob(hash));
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}
