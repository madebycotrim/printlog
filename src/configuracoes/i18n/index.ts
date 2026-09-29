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

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      "pt-BR": { translation: ptBR },
      "en-US": { translation: enUS },
      "es-ES": { translation: esES },
    },
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

export default i18n;
