import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const variaveisObrigatorias = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
];

export const CONFIGURACAO_INVALIDA = variaveisObrigatorias.some((variavel) => !import.meta.env[variavel]);

const configuracaoFirebase = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "placeholder-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "placeholder-auth-domain",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "placeholder-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = CONFIGURACAO_INVALIDA ? null : initializeApp(configuracaoFirebase);
export const autenticacao = app ? getAuth(app) : ({} as any);

