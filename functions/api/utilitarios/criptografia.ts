/**
 * Utilitário de Criptografia de Alta Segurança (Web Crypto API)
 * Utiliza AES-GCM com vetores de inicialização (IV) únicos por registro.
 */

/**
 * Criptografa um texto simples usando uma chave secreta.
 * @param texto - O dado sensível a ser protegido.
 * @param chaveSecreta - A chave vinda das variáveis de ambiente.
 * @returns String formatada em Base64 contendo [IV]:[DADO_CRIPTOGRAFADO]
 */
export async function criptografar(texto: string, chaveSecreta: string): Promise<string> {
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
  const ivBase64 = btoa(String.fromCharCode(...iv));
  const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));

  return `${ivBase64}:${encryptedBase64}`;
}

/**
 * Descriptografa um dado protegido.
 * @param hash - O dado no formato [IV]:[DADO]
 * @param chaveSecreta - A chave vinda das variáveis de ambiente.
 */
export async function descriptografar(hash: string, chaveSecreta: string): Promise<string> {
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
