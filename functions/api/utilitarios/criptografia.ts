/**
 * Utilitário de Criptografia de Alta Segurança (Web Crypto API)
 * Utiliza AES-GCM com vetores de inicialização (IV) únicos por registro.
 */

/**
 * Obtém e valida a chave mestra de criptografia.
 * Falha obrigatoriamente se a chave não estiver configurada no ambiente de produção.
 */
export function obterChaveMestra(env: { ENCRYPTION_KEY?: string; ENVIRONMENT?: string }): string {
  const chave = env.ENCRYPTION_KEY?.trim();
  if (chave && chave.length >= 16) {
    return chave;
  }

  // Permite fallback apenas se explicitamente em ambiente de desenvolvimento local
  if (env.ENVIRONMENT === "development") {
    return "dev-local-printlog-2026-key-32b!";
  }

  throw new Error("Erro de Segurança Crítico: ENCRYPTION_KEY não configurada ou com entropia insuficiente (mínimo 16 caracteres).");
}

function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Criptografa um texto simples usando uma chave secreta.
 * @param texto - O dado sensível a ser protegido.
 * @param chaveSecreta - A chave vinda das variáveis de ambiente.
 * @returns String formatada em Base64 contendo [IV]:[DADO_CRIPTOGRAFADO]
 */
export async function criptografar(texto: string | null | undefined, chaveSecreta: string): Promise<string> {
  if (!texto || typeof texto !== 'string') return texto as any;
  const encoder = new TextEncoder();
  const data = encoder.encode(texto);

  // Gera uma chave a partir da string secreta
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(chaveSecreta.padEnd(32, "0").slice(0, 32)),
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  // Vetor de Inicialização (IV) aleatório para cada criptografia
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    keyMaterial,
    data
  );

  // Retorna o IV + Dado em Base64 para armazenamento
  const ivBase64 = arrayBufferToBase64(iv);
  const encryptedBase64 = arrayBufferToBase64(encrypted);

  return `${ivBase64}:${encryptedBase64}`;
}

/**
 * Descriptografa um dado protegido.
 * @param hash - O dado no formato [IV]:[DADO]
 * @param chaveSecreta - A chave vinda das variáveis de ambiente.
 */
export async function descriptografar(hash: string | null | undefined, chaveSecreta: string): Promise<string> {
  if (!hash || typeof hash !== 'string' || !hash.includes(":")) return hash as any;
  const [ivBase64, encryptedBase64] = hash.split(":");
  if (!ivBase64 || !encryptedBase64) throw new Error("Formato de hash inválido.");

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(chaveSecreta.padEnd(32, "0").slice(0, 32)),
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  const iv = new Uint8Array(atob(ivBase64).split("").map(c => c.charCodeAt(0)));
  const encrypted = new Uint8Array(atob(encryptedBase64).split("").map(c => c.charCodeAt(0)));

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    keyMaterial,
    encrypted
  );

  return decoder.decode(decrypted);
}
