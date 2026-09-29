import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import ptBR from "./locales/pt-BR.json";
import enUS from "./locales/en-US.json";
import esES from "./locales/es-ES.json";

export const IDIOMAS_SUPORTADOS = [
  { codigo: "pt-BR", rotulo: "Português", pais: "Brasil", bandeira: "🇧🇷" },
  { codigo: "en-US", rotulo: "English", pais: "United States", bandeira: "🇺🇸" },
  { codigo: "es-ES", rotulo: "Español", pais: "España", bandeira: "🇪🇸" },
] as const;

export type CodigoIdioma = (typeof IDIOMAS_SUPORTADOS)[number]["codigo"];

export const CHAVE_STORAGE_IDIOMA = "printlog_idioma";

// Detecta o idioma salvo ou faz fallback inteligente pelo navegador do visitante
export function detectarIdiomaInicial(): CodigoIdioma {
  if (typeof window === "undefined") return "pt-BR";
  try {
    const salvo = localStorage.getItem(CHAVE_STORAGE_IDIOMA);
    if (salvo && (salvo === "pt-BR" || salvo === "en-US" || salvo === "es-ES")) {
      return salvo as CodigoIdioma;
    }
  } catch {
    // LocalStorage indisponível
  }

  // Fallback para o idioma do navegador
  try {
    const nav = navigator.language?.toLowerCase() || "";
    if (nav.startsWith("es")) return "es-ES";
    if (nav.startsWith("en")) return "en-US";
  } catch {
    // Navigator indisponível
  }

  return "pt-BR";
}

const idiomaInicial = detectarIdiomaInicial();

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      "pt-BR": { translation: ptBR },
      "en-US": { translation: enUS },
      "es-ES": { translation: esES },
    },
    lng: idiomaInicial,
    fallbackLng: "pt-BR",
    supportedLngs: ["pt-BR", "en-US", "es-ES"],
    interpolation: {
      escapeValue: false, // React já protege contra XSS
    },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: CHAVE_STORAGE_IDIOMA,
      caches: ["localStorage"],
    },
  });

import { toast } from "sonner";
import { traduzirTextoGlobal, tradutorUniversalDOM } from "@/compartilhado/utilitarios/tradutorUniversalDOM";

// Intercepta transparentemente chamadas de toast para auto-traduzir strings passadas como mensagem ou action label
if (typeof window !== "undefined" && toast) {
  const metodosToast = ["success", "error", "warning", "info", "message", "loading"] as const;
  metodosToast.forEach((metodo) => {
    const fnOriginal = (toast as any)[metodo];
    if (typeof fnOriginal === "function") {
      (toast as any)[metodo] = (mensagem: any, data?: any) => {
        const msgTraduzida = typeof mensagem === "string" ? traduzirTextoGlobal(mensagem) : mensagem;
        if (data && typeof data === "object") {
          if (data.action && typeof data.action.label === "string") {
            data.action.label = traduzirTextoGlobal(data.action.label);
          }
          if (typeof data.description === "string") {
            data.description = traduzirTextoGlobal(data.description);
          }
        }
        return fnOriginal(msgTraduzida, data);
      };
    }
  });
}

// Garante persistência síncrona imediata, atualiza a tag lang do documento e ativa o tradutor universal do DOM
if (typeof window !== "undefined") {
  document.documentElement.lang = idiomaInicial;

  // Ativação imediata e redundante após montagem do DOM
  tradutorUniversalDOM.definirIdioma(idiomaInicial);
  window.addEventListener("DOMContentLoaded", () => {
    tradutorUniversalDOM.definirIdioma(idiomaInicial);
  });
  setTimeout(() => {
    tradutorUniversalDOM.definirIdioma(idiomaInicial);
  }, 100);

  i18n.on("languageChanged", (lng) => {
    try {
      localStorage.setItem(CHAVE_STORAGE_IDIOMA, lng);
      document.documentElement.lang = lng;
    } catch (e) {
      console.warn("[i18n] Falha ao persistir no localStorage:", e);
    }
    tradutorUniversalDOM.definirIdioma(lng);
  });
}

export default i18n;
