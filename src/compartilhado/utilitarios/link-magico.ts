export interface MaterialMagico {
  n: string; // nome do filamento
  q?: number; // quantidade em gramas (peso)
  p?: number; // preço total do filamento no projeto (centavos)
  t?: string; // tipo do material (ex: PLA, PETG)
}

export interface InsumoMagico {
  n: string; // nome do insumo
  q: number; // quantidade
  p: number; // preço total do insumo no projeto (centavos)
  u?: string; // unidade de medida (un, m, etc)
}

export interface PayloadLinkMagico {
  pr: number; // preco (centavos)
  np: string; // nomeProjeto
  t: number;  // tempo (minutos)
  m: (string | MaterialMagico)[]; // nomes dos materiais (string para legado) ou detalhes
  ins?: InsumoMagico[]; // insumos e adicionais do projeto
  e: string; // estudio
  s: string; // slogan
  l?: string; // logoUrl do estúdio
  w: string; // whatsapp (do user autenticado)
  id?: string; // id do projeto (se já salvo)
  cli?: string; // nome do cliente
  obs?: string; // observações adicionais
  cm?: number; // custoMaquina (legado) em centavos
  ce?: number; // custoEnergia em centavos
  cd?: number; // custoDepreciacao em centavos
  cmo?: number; // custoMaoDeObra (setup) em centavos
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
