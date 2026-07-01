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
  c?: string; // cor do tema configurado
}

const SUBSTITUICOES = [
  { padrao: "https://cdn.discordapp.com/attachments/", token: "[D]" },
  { padrao: "https://media.discordapp.net/attachments/", token: "[M]" },
  { padrao: "https://cdn.discordapp.com/", token: "[C]" },
  { padrao: "https://", token: "[H]" },
  { padrao: "http://", token: "[P]" },
];

function encurtarTexto(texto: string): string {
  let resultado = texto;
  for (const sub of SUBSTITUICOES) {
    resultado = resultado.split(sub.padrao).join(sub.token);
  }
  return resultado;
}

function restaurarTexto(texto: string): string {
  let resultado = texto;
  for (const sub of SUBSTITUICOES) {
    resultado = resultado.split(sub.token).join(sub.padrao);
  }
  return resultado;
}

function lzw_encode(s: string): string {
  const dict: Record<string, number> = {};
  for (let i = 0; i < 256; i++) {
    dict[String.fromCharCode(i)] = i;
  }
  let currChar = "";
  let phrase = "";
  const out: number[] = [];
  let code = 256;
  for (let i = 0; i < s.length; i++) {
    currChar = s[i];
    if (dict[phrase + currChar] !== undefined) {
      phrase += currChar;
    } else {
      out.push(dict[phrase]);
      dict[phrase + currChar] = code;
      code++;
      phrase = currChar;
    }
  }
  if (phrase !== "") {
    out.push(dict[phrase]);
  }
  
  const bytes = new Uint8Array(out.length * 2);
  for (let i = 0; i < out.length; i++) {
    bytes[i * 2] = out[i] & 0xff;
    bytes[i * 2 + 1] = (out[i] >> 8) & 0xff;
  }
  
  const stringBinaria = Array.from(bytes).map(b => String.fromCharCode(b)).join('');
  return btoa(stringBinaria);
}

function lzw_decode(base64: string): string {
  const stringBinaria = atob(base64);
  const bytes = new Uint8Array(stringBinaria.length);
  for (let i = 0; i < stringBinaria.length; i++) {
    bytes[i] = stringBinaria.charCodeAt(i);
  }
  const codes: number[] = [];
  for (let i = 0; i < bytes.length; i += 2) {
    codes.push(bytes[i] | (bytes[i + 1] << 8));
  }
  
  const dict: Record<number, string> = {};
  for (let i = 0; i < 256; i++) {
    dict[i] = String.fromCharCode(i);
  }
  let currChar = dict[codes[0]] || "";
  let oldPhrase = currChar;
  let out = [currChar];
  let code = 256;
  let phrase = "";
  for (let i = 1; i < codes.length; i++) {
    const currCode = codes[i];
    if (dict[currCode] !== undefined) {
      phrase = dict[currCode];
    } else {
      phrase = oldPhrase + currChar;
    }
    out.push(phrase);
    currChar = phrase[0] || "";
    dict[code] = oldPhrase + currChar;
    code++;
    oldPhrase = phrase;
  }
  return out.join("");
}

export function codificarLinkMagico(payload: PayloadLinkMagico): string {
  const mStr = payload.m.map(mat => {
    if (typeof mat === 'string') return mat;
    return `${mat.n || ''};${mat.q || ''};${mat.p || ''};${mat.t || ''}`;
  }).join('~');

  const insStr = (payload.ins || []).map(i => {
    return `${i.n || ''};${i.q || ''};${i.p || ''};${i.u || ''}`;
  }).join('~');

  const partes = [
    payload.pr || 0,
    payload.np || '',
    payload.t || 0,
    mStr,
    insStr,
    payload.e || '',
    payload.s || '',
    payload.l || '',
    payload.w || '',
    payload.id || '',
    payload.cli || '',
    payload.obs || '',
    payload.cm || 0,
    payload.cmo || 0,
    payload.c || ''
  ];

  const serializado = partes.join('|');
  const encurtado = encurtarTexto(serializado);
  
  // Compacta usando LZW + Base64
  const comprimidoBase64 = lzw_encode(encurtado);
  
  // Transforma em URL-safe Base64
  return comprimidoBase64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodificarLinkMagico(hash: string): PayloadLinkMagico | null {
  try {
    let base64 = hash.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    
    // Descompacta LZW
    const encurtado = lzw_decode(base64);
    const serializado = restaurarTexto(encurtado);
    
    const partes = serializado.split('|');
    if (partes.length < 9) return null;
    
    const mStr = partes[3];
    const m: (string | MaterialMagico)[] = mStr ? mStr.split('~').map(matStr => {
      const sub = matStr.split(';');
      if (sub.length < 2) return matStr;
      return {
        n: sub[0],
        q: sub[1] ? Number(sub[1]) : undefined,
        p: sub[2] ? Number(sub[2]) : undefined,
        t: sub[3] || undefined
      };
    }) : [];

    const insStr = partes[4];
    const ins: InsumoMagico[] = insStr ? insStr.split('~').map(iStr => {
      const sub = iStr.split(';');
      return {
        n: sub[0],
        q: Number(sub[1] || 0),
        p: Number(sub[2] || 0),
        u: sub[3] || undefined
      };
    }).filter(i => i.n) : [];

    return {
      pr: Number(partes[0] || 0),
      np: partes[1],
      t: Number(partes[2] || 0),
      m,
      ins,
      e: partes[5],
      s: partes[6],
      l: partes[7] || undefined,
      w: partes[8],
      id: partes[9] || undefined,
      cli: partes[10] || undefined,
      obs: partes[11] || undefined,
      cm: Number(partes[12] || 0),
      cmo: Number(partes[13] || 0),
      c: partes[14] || undefined
    };
  } catch (e) {
    console.error("Erro ao decodificar link mágico:", e);
    return null;
  }
}
