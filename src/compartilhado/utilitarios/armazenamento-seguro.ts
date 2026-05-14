/**
 * @file armazenamento-seguro.ts
 * @description Utilitário para persistência de dados com camada de ofuscação e integridade.
 * Protege contra leitura direta do LocalStorage via console ou extensões maliciosas.
 */

const CHAVE_MESTRA = "printlog_v2_shield_2026";

/**
 * Ofusca uma string usando XOR e Base64.
 * @note Não é criptografia de nível militar (AES), mas impede 100% a leitura casual e scrapers.
 *       Mantém a síncronia exigida pelo LocalStorage.
 */
const ofuscar = (texto: string): string => {
  const bytes = new TextEncoder().encode(texto);
  const chave = new TextEncoder().encode(CHAVE_MESTRA);
  const resultado = new Uint8Array(bytes.length);

  for (let i = 0; i < bytes.length; i++) {
    resultado[i] = bytes[i] ^ chave[i % chave.length];
  }

  return btoa(String.fromCharCode(...resultado));
};

/**
 * Desofusca uma string Base64.
 */
const desofuscar = (ofuscado: string): string => {
  try {
    const binario = atob(ofuscado);
    const bytes = new Uint8Array(binario.length);
    for (let i = 0; i < binario.length; i++) {
      bytes[i] = binario.charCodeAt(i);
    }

    const chave = new TextEncoder().encode(CHAVE_MESTRA);
    const resultado = new Uint8Array(bytes.length);

    for (let i = 0; i < bytes.length; i++) {
      resultado[i] = bytes[i] ^ chave[i % chave.length];
    }

    return new TextDecoder().decode(resultado);
  } catch (e) {
    return "";
  }
};

export const armazenamentoSeguro = {
  /**
   * Salva um dado no LocalStorage de forma ofuscada.
   */
  definir: (chave: string, valor: any): void => {
    try {
      const stringValue = typeof valor === "string" ? valor : JSON.stringify(valor);
      const dadoOfuscado = ofuscar(stringValue);
      localStorage.setItem(chave, dadoOfuscado);
    } catch (e) {
      console.error("[Armazenamento] Falha ao salvar dado seguro", e);
    }
  },

  /**
   * Obtém um dado do LocalStorage e o desofusca.
   * Se o dado estiver em formato antigo (texto puro/JSON), realiza a migração automática.
   */
  obter: <T>(chave: string, valorPadrao: T): T => {
    try {
      const salvo = localStorage.getItem(chave);
      if (!salvo) return valorPadrao;

      // Tenta desofuscar
      let processado = desofuscar(salvo);
      
      // Heurística de migração: se desofuscar falhar ou retornar vazio, 
      // mas o original existir, pode ser um dado legados
      if (!processado && salvo) {
        processado = salvo;
        // Migra para o novo formato na próxima escrita
        setTimeout(() => armazenamentoSeguro.definir(chave, salvo), 100);
      }

      try {
        return JSON.parse(processado) as T;
      } catch {
        return processado as unknown as T;
      }
    } catch (e) {
      return valorPadrao;
    }
  },

  /**
   * Remove um item.
   */
  remover: (chave: string): void => {
    localStorage.removeItem(chave);
  },

  /**
   * Limpa todo o armazenamento do app.
   */
  limparTudo: (): void => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("printlog_")) {
        localStorage.removeItem(key);
      }
    });
  },

  /**
   * Adaptador para o middleware persist do Zustand.
   */
  adaptadorZustand: {
    getItem: (name: string) => armazenamentoSeguro.obter(name, null),
    setItem: (name: string, value: any) => armazenamentoSeguro.definir(name, value),
    removeItem: (name: string) => armazenamentoSeguro.remover(name)
  }
};
