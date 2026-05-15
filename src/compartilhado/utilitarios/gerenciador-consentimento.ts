/**
 * @file gerenciador-consentimento.ts
 * @description Centraliza a lógica de bloqueio real de serviços de terceiros.
 * Segue o princípio de Privacy by Default (Privacidade por Padrão).
 */

import { armazenamentoSeguro } from "./armazenamento-seguro";

interface Consentimento {
  tipo: "TUDO" | "ESSENCIAIS" | "CUSTOM";
  essenciais: boolean;
  analiticos: boolean;
  funcionais: boolean;
}

export const gerenciadorConsentimento = {
  /**
   * Verifica se uma categoria específica foi autorizada.
   */
  podeUsar: (categoria: "analiticos" | "funcionais"): boolean => {
    const consentimento = armazenamentoSeguro.obter<Consentimento | null>("printlog_consentimento_cookies", null);
    
    if (!consentimento) return false;
    if (consentimento.tipo === "TUDO") return true;
    
    return !!consentimento[categoria];
  },

  /**
   * Carrega um script externo dinamicamente APENAS se houver consentimento.
   */
  injetarScript: (id: string, url: string, categoria: "analiticos" | "funcionais") => {
    if (!gerenciadorConsentimento.podeUsar(categoria)) {
      console.warn(`[LGPD] Bloqueio REAL: Script ${id} não injetado por falta de consentimento.`);
      return;
    }

    if (document.getElementById(id)) return;

    const script = document.createElement("script");
    script.id = id;
    script.src = url;
    script.async = true;
    document.head.appendChild(script);
    console.info(`[LGPD] Script ${id} injetado com sucesso.`);
  },

  /**
   * Sincroniza o estado de todos os serviços.
   */
  sincronizarServicos: () => {
    const analiticosPermitidos = gerenciadorConsentimento.podeUsar("analiticos");

    if (analiticosPermitidos) {
      // Exemplo: Injeta o GA apenas se permitido
      // gerenciadorConsentimento.injetarScript("google-analytics", "https://www.googletagmanager.com/gtag/js?id=G-XXXXX", "analiticos");
    }

    // Se o usuário recusar AGORA, removemos o que for possível
    if (!analiticosPermitidos) {
      gerenciadorConsentimento.limparDadosNaoEssenciais();
    }
  },

  /**
   * Intercepta o fetch global para bloquear requisições de telemetria indesejadas.
   */
  ativarIntercepetorRede: () => {
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const url = typeof args[0] === "string" ? args[0] : (args[0] as Request).url;
      
      // Lista negra de domínios de rastreio
      const dominiosRastreio = ["google-analytics.com", "analytics.google.com", "hotjar.com", "facebook.net", "cloudflareinsights.com"];
      
      const ehRastreio = dominiosRastreio.some(d => url.includes(d));

      if (ehRastreio && !gerenciadorConsentimento.podeUsar("analiticos")) {
        console.error(`[LGPD] BLOQUEIO REAL: Requisição para ${url} abortada por falta de consentimento.`);
        return Promise.reject(new Error("Requisição bloqueada por política de privacidade (LGPD)."));
      }

      return originalFetch.apply(this, args);
    };
  },

  /**
   * Remove rastros de cookies e limpa o armazenamento de preferências se recusado.
   */
  limparDadosNaoEssenciais: () => {
    if (!gerenciadorConsentimento.podeUsar("funcionais")) {
      // Limpa chaves de preferência do LocalStorage
      const chavesPreferencias = ["printlog_tema", "printlog_perfil_ativo", "printlog_config_ui"];
      chavesPreferencias.forEach(k => armazenamentoSeguro.remover(k));
    }
  }
};
