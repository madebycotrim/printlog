/**
 * Utilitário de Autenticação em Duas Etapas (TOTP - RFC 6238 / RFC 4226)
 * Implementação matemática oficial do Google Authenticator / Authy utilizando
 * a Web Crypto API nativa do navegador (sem custos, zero bibliotecas externas).
 */

const ALFABETO_BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * Decodifica uma string Base32 em Uint8Array.
 */
export function decodificarBase32(base32: string): Uint8Array {
  const limpo = base32.toUpperCase().replace(/=+$/, "").replace(/\s/g, "");
  let bits = "";
  for (let i = 0; i < limpo.length; i++) {
    const val = ALFABETO_BASE32.indexOf(limpo.charAt(i));
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, "0");
  }

  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.substring(i * 8, (i + 1) * 8), 2);
  }
  return bytes;
}

/**
 * Gera um segredo aleatório em Base32 usando CSPRNG criptográfico seguro.
 */
export function gerarSegredoBase32(tamanho = 16): string {
  const bytes = new Uint8Array(tamanho);
  window.crypto.getRandomValues(bytes);
  let segredo = "";
  for (let i = 0; i < tamanho; i++) {
    segredo += ALFABETO_BASE32.charAt(bytes[i] % ALFABETO_BASE32.length);
  }
  return segredo;
}

/**
 * Calcula o código TOTP de 6 dígitos para uma determinada janela de tempo.
 */
export async function gerarCodigoTotp(segredoBase32: string, timestampMs = Date.now()): Promise<string> {
  const chaveBytes = decodificarBase32(segredoBase32);
  const passoTempo = Math.floor(timestampMs / 1000 / 30);

  // Buffer de 8 bytes para o contador (Big Endian)
  const bufferContador = new ArrayBuffer(8);
  const visualizacao = new DataView(bufferContador);
  visualizacao.setBigUint64(0, BigInt(passoTempo), false);

  // Importa a chave para HMAC-SHA1
  const chaveCrypto = await window.crypto.subtle.importKey(
    "raw",
    chaveBytes as BufferSource,
    { name: "HMAC", hash: { name: "SHA-1" } },
    false,
    ["sign"]
  );

  // Assina o contador
  const assinatura = await window.crypto.subtle.sign("HMAC", chaveCrypto, bufferContador);
  const bytesAssinatura = new Uint8Array(assinatura);

  // Truncamento dinâmico oficial (RFC 4226)
  const offset = bytesAssinatura[bytesAssinatura.length - 1] & 0x0f;
  const codigoBinario =
    ((bytesAssinatura[offset] & 0x7f) << 24) |
    ((bytesAssinatura[offset + 1] & 0xff) << 16) |
    ((bytesAssinatura[offset + 2] & 0xff) << 8) |
    (bytesAssinatura[offset + 3] & 0xff);

  const codigoNumerico = codigoBinario % 1000000;
  return codigoNumerico.toString().padStart(6, "0");
}

/**
 * Valida se um código fornecido pelo usuário coincide com o segredo TOTP.
 * Inclui tolerância de tempo de ±1 janela (30s antes e 30s depois) para compensar eventuais divergências no relógio do dispositivo.
 */
export async function validarCodigoTotp(codigo: string, segredoBase32: string): Promise<boolean> {
  const codigoLimpo = codigo.trim().replace(/\s/g, "");
  if (codigoLimpo.length !== 6) return false;

  const agora = Date.now();
  // Janelas temporais: atual, -30 segundos e +30 segundos
  const janelas = [agora, agora - 30000, agora + 30000];

  for (const t of janelas) {
    const esperado = await gerarCodigoTotp(segredoBase32, t);
    if (esperado === codigoLimpo) {
      return true;
    }
  }

  return false;
}

/**
 * Gera a URL oficial no padrão otpauth:// para escaneamento em apps autenticadores.
 */
export function gerarUriOtpAuth(email: string, segredoBase32: string, emissor = "PrintLog"): string {
  const contaFormatada = encodeURIComponent(email.trim() || "Maker");
  const emissorFormatado = encodeURIComponent(emissor);
  return `otpauth://totp/${emissorFormatado}:${contaFormatada}?secret=${segredoBase32}&issuer=${emissorFormatado}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Gera códigos de backup de emergência aleatórios e legíveis.
 */
export function gerarCodigosBackup(quantidade = 8): string[] {
  const backups: string[] = [];
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  for (let i = 0; i < quantidade; i++) {
    const bytes = new Uint8Array(8);
    window.crypto.getRandomValues(bytes);
    let p1 = "";
    let p2 = "";
    for (let j = 0; j < 4; j++) p1 += chars.charAt(bytes[j] % chars.length);
    for (let j = 4; j < 8; j++) p2 += chars.charAt(bytes[j] % chars.length);
    backups.push(`${p1}-${p2}`);
  }
  return backups;
}
