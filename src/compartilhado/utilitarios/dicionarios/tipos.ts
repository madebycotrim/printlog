export type IdiomaDestino = "en-US" | "es-ES";

export interface EntradaDicionario {
  en: string;
  es: string;
}

export type DicionarioTraducao = Record<string, EntradaDicionario>;
