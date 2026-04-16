import { useEffect, useState } from "react";
import { TemaInterface } from "@/compartilhado/tipos/modelos";
import type { CorPrimaria, ModoTema, TipoFonte } from "@/compartilhado/tipos/modelos";

const PALETA_CORES: Record<CorPrimaria, { hex: string; rgb: string }> = {
  sky: { hex: "#0ea5e9", rgb: "14 165 233" },
  emerald: { hex: "#10b981", rgb: "16 185 129" },
  violet: { hex: "#8b5cf6", rgb: "139 92 246" },
  amber: { hex: "#f59e0b", rgb: "245 158 11" },
  rose: { hex: "#f43f5e", rgb: "244 63 94" },
  cyan: { hex: "#06b6d4", rgb: "6 182 212" },
  indigo: { hex: "#6366f1", rgb: "99 102 241" },
  teal: { hex: "#14b8a6", rgb: "20 184 166" },
  orange: { hex: "#f97316", rgb: "249 115 22" },
  fuchsia: { hex: "#d946ef", rgb: "217 70 239" },
  lime: { hex: "#84cc16", rgb: "132 204 22" },
  pink: { hex: "#ec4899", rgb: "236 72 153" },
  blue: { hex: "#3b82f6", rgb: "59 130 246" },
  slate: { hex: "#64748b", rgb: "100 116 139" },
};

const DICIONARIO_FONTES: Record<TipoFonte, string> = {
  inter: "Inter, sans-serif",
  roboto: "Roboto, sans-serif",
  montserrat: "Montserrat, sans-serif",
  outfit: "Outfit, sans-serif",
  poppins: "Poppins, sans-serif",
  "jetbrains-mono": "'JetBrains Mono', monospace",
};

const CHAVE_PERSISTENCIA = "printlog:tema";

interface PreferenciasInterface {
  modoTema: ModoTema;
  corPrimaria: CorPrimaria;
  fonte: TipoFonte;
}

export function usarTema() {
  // Inicializa o estado lendo diretamente do localStorage ou preferência do sistema
  const [preferencias, definirPreferencias] = useState<PreferenciasInterface>(() => {
    if (typeof window !== "undefined") {
      const salvo = localStorage.getItem(CHAVE_PERSISTENCIA);
      if (salvo) {
        try {
          return JSON.parse(salvo);
        } catch {
          // Fallback para erro de parse
        }
      }

      const modoDefault =
        window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
          ? TemaInterface.ESCURO
          : TemaInterface.CLARO;

      return {
        modoTema: modoDefault,
        corPrimaria: "sky",
        fonte: "inter",
      };
    }
    return { modoTema: TemaInterface.CLARO, corPrimaria: "sky", fonte: "inter" };
  });

  const { modoTema, corPrimaria, fonte } = preferencias;

  useEffect(() => {
    // Persiste as escolhas e aplica variaveis globais de tema/cor
    localStorage.setItem(CHAVE_PERSISTENCIA, JSON.stringify(preferencias));

    const root = document.documentElement;
    root.setAttribute("data-tema", modoTema.toLowerCase());
    root.style.setProperty("--cor-primaria", PALETA_CORES[corPrimaria].hex);
    root.style.setProperty("--cor-primaria-rgb", PALETA_CORES[corPrimaria].rgb);
    root.style.setProperty("--familia-fonte", DICIONARIO_FONTES[fonte]);

    if (modoTema === TemaInterface.ESCURO) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [preferencias]);

  function alternarTema() {
    definirPreferencias((prev) => ({
      ...prev,
      modoTema: prev.modoTema === TemaInterface.CLARO ? TemaInterface.ESCURO : TemaInterface.CLARO,
    }));
  }

  function definirModoTema(novoModo: ModoTema) {
    definirPreferencias((prev) => ({ ...prev, modoTema: novoModo }));
  }

  function definirCorPrimaria(novaCor: CorPrimaria) {
    definirPreferencias((prev) => ({ ...prev, corPrimaria: novaCor }));
  }

  function definirFonte(novaFonte: TipoFonte) {
    definirPreferencias((prev) => ({ ...prev, fonte: novaFonte }));
  }

  return {
    modoTema,
    definirModoTema,
    alternarTema,
    corPrimaria,
    definirCorPrimaria,
    fonte,
    definirFonte,
    paletaPrimaria: PALETA_CORES,
  };
}
