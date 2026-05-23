/**
 * @file armazenamento-seguro.ts
 * @version 3.1 - Blindagem Síncrona (Stream Cipher)
 * @description Implementa criptografia síncrona de alta performance para o LocalStorage.
 *              Protege os dados contra leitura sem quebrar a compatibilidade do app.
 */

const CHAVE_MESTRA = "printlog_shield_master_v3_2026";

/**
 * Cifra/Decifra um texto usando um algoritmo de fluxo (Stream Cipher).
 * É muito mais seguro que XOR simples, pois a chave rotaciona a cada byte.
 */
const processarCifra = (texto: string): string => {
  const encoder = new TextEncoder();
  const dados = encoder.encode(texto);
  const chave = encoder.encode(CHAVE_MESTRA);
  const resultado = new Uint8Array(dados.length);

  let s = new Uint8Array(256);
  for (let i = 0; i < 256; i++) s[i] = i;

  // Key-scheduling (KSA)
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + s[i] + chave[i % chave.length]) % 256;
    [s[i], s[j]] = [s[j], s[i]];
  }

  // Pseudo-random generation (PRGA) e XOR
  let i = 0;
  j = 0;
  for (let k = 0; k < dados.length; k++) {
    i = (i + 1) % 256;
    j = (j + s[i]) % 256;
    [s[i], s[j]] = [s[j], s[i]];
    const t = (s[i] + s[j]) % 256;
    resultado[k] = dados[k] ^ s[t];
  }

  return btoa(String.fromCharCode(...resultado));
};

const desprocessarCifra = (ofuscado: string): string => {
  try {
    const binario = atob(ofuscado);
    const dados = new Uint8Array(binario.length);
    for (let i = 0; i < binario.length; i++) {
      dados[i] = binario.charCodeAt(i);
    }

    const chave = encoder.encode(CHAVE_MESTRA);
    let s = new Uint8Array(256);
    for (let i = 0; i < 256; i++) s[i] = i;

    let j = 0;
    for (let i = 0; i < 256; i++) {
      j = (j + s[i] + chave[i % chave.length]) % 256;
      [s[i], s[j]] = [s[j], s[i]];
    }

    let i = 0;
    j = 0;
    const resultado = new Uint8Array(dados.length);
    for (let k = 0; k < dados.length; k++) {
      i = (i + 1) % 256;
      j = (j + s[i]) % 256;
      [s[i], s[j]] = [s[j], s[i]];
      const t = (s[i] + s[j]) % 256;
      resultado[k] = dados[k] ^ s[t];
    }

    return new TextDecoder().decode(resultado);
  } catch (e) {
    return "";
  }
};

const encoder = new TextEncoder();

export const armazenamentoSeguro = {
  definir: (chave: string, valor: any): void => {
    try {
      const chavesPreferencias = ["printlog_tema", "printlog_perfil_ativo", "printlog_config_ui", "printlog_ultima_impressora", "printlog_anos_vida_util"];
      if (chavesPreferencias.includes(chave)) {
        const consent = localStorage.getItem("printlog_consentimento_cookies");
        if (!consent) return;

        const consentimento = armazenamentoSeguro.obter<any>("printlog_consentimento_cookies", null);
        if (consentimento && (consentimento.funcionais === false || consentimento.recusado === true)) {
          return;
        }
      }

      const stringValue = typeof valor === "string" ? valor : JSON.stringify(valor);
      localStorage.setItem(chave, processarCifra(stringValue));
    } catch (e) {
      console.error("[Armazenamento] Falha ao salvar", e);
    }
  },

  obter: <T>(chave: string, valorPadrao: T): T => {
    try {
      const salvo = localStorage.getItem(chave);
      if (!salvo) return valorPadrao;

      const processado = desprocessarCifra(salvo);
      if (!processado) return valorPadrao;

      try {
        return JSON.parse(processado) as T;
      } catch {
        return processado as unknown as T;
      }
    } catch (e) {
      return valorPadrao;
    }
  },

  remover: (chave: string): void => {
    localStorage.removeItem(chave);
  },

  limparTudo: (): void => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("printlog_")) localStorage.removeItem(key);
    });
  },

  adaptadorZustand: {
    getItem: (name: string) => armazenamentoSeguro.obter(name, null),
    setItem: (name: string, value: any) => armazenamentoSeguro.definir(name, value),
    removeItem: (name: string) => armazenamentoSeguro.remover(name)
  }
};
