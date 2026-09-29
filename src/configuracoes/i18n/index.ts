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

// Recupera o idioma salvo previamente ou faz fallback
const idiomaSalvo = typeof window !== "undefined" ? localStorage.getItem(CHAVE_STORAGE_IDIOMA) : null;
const idiomaInicial =
  idiomaSalvo && ["pt-BR", "en-US", "es-ES"].includes(idiomaSalvo)
    ? (idiomaSalvo as CodigoIdioma)
    : undefined;

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

import { tradutorUniversalDOM } from "@/compartilhado/utilitarios/tradutorUniversalDOM";

// Garante persistência síncrona imediata, atualiza a tag lang do documento e ativa o tradutor universal do DOM
if (typeof window !== "undefined") {
  if (idiomaInicial) {
    document.documentElement.lang = idiomaInicial;
    // Agenda após carregamento inicial do DOM
    window.addEventListener("DOMContentLoaded", () => {
      tradutorUniversalDOM.definirIdioma(idiomaInicial);
    });
    setTimeout(() => {
      tradutorUniversalDOM.definirIdioma(idiomaInicial);
    }, 100);
  }

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
