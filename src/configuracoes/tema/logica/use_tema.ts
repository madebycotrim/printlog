import { useEffect, useState, useRef } from "react";
import { TemaInterface } from "@/compartilhado/tipos/modelos";
import type { CorPrimaria, ModoTema, TipoFonte } from "@/compartilhado/tipos/modelos";
import { armazenamentoSeguro } from "@/compartilhado/utilitarios/armazenamento-seguro";

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

const CHAVE_PERSISTENCIA = "printlog_tema";

interface PreferenciasInterface {
  modoTema: ModoTema;
  corPrimaria: CorPrimaria;
  fonte: TipoFonte;
}

export function useTema() {
  const montado = useRef(false);

  // Inicializa o estado lendo diretamente do localStorage ou preferência do sistema
  const [preferencias, definirPreferencias] = useState<PreferenciasInterface>(() => {
    if (typeof window !== "undefined") {
      const salvo = armazenamentoSeguro.obter<PreferenciasInterface | null>(CHAVE_PERSISTENCIA, null);
      if (salvo) {
        return salvo;
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

  const [modoEfetivo, definirModoEfetivo] = useState<ModoTema>(() => {
    if (modoTema === TemaInterface.SISTEMA) {
      return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? TemaInterface.ESCURO
        : TemaInterface.CLARO;
    }
    return modoTema;
  });

  useEffect(() => {
    // Sincroniza o modoEfetivo quando o modoTema muda
    if (modoTema !== TemaInterface.SISTEMA) {
      definirModoEfetivo(modoTema);
    } else {
      definirModoEfetivo(
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? TemaInterface.ESCURO
          : TemaInterface.CLARO
      );
    }
  }, [modoTema]);

  useEffect(() => {
    // Persiste as escolhas e aplica variaveis globais de tema/cor
    armazenamentoSeguro.definir(CHAVE_PERSISTENCIA, preferencias);

    const root = document.documentElement;
    root.style.setProperty("--cor-primaria", PALETA_CORES[corPrimaria].hex);
    root.style.setProperty("--cor-primaria-rgb", PALETA_CORES[corPrimaria].rgb);
    root.style.setProperty("--familia-fonte", DICIONARIO_FONTES[fonte]);

    let timer: NodeJS.Timeout | undefined;

    const aplicarDOM = (modo: ModoTema) => {
      const deveTransicionar = montado.current;

      if (deveTransicionar) {
        root.classList.add("theme-transitioning");
      }

      root.setAttribute("data-tema", modo.toLowerCase());
      if (modo === TemaInterface.ESCURO) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }

      if (deveTransicionar) {
        timer = setTimeout(() => {
          root.classList.remove("theme-transitioning");
        }, 500);
      }
    };

    aplicarDOM(modoEfetivo);

    if (!montado.current) {
      montado.current = true;
    }

    // Se estiver no modo SISTEMA, ouvimos mudanças no SO
    let mediaQuery: MediaQueryList | undefined;
    let manipulador: ((e: MediaQueryListEvent | MediaQueryList) => void) | undefined;

    if (modoTema === TemaInterface.SISTEMA) {
      mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      manipulador = (e: MediaQueryListEvent | MediaQueryList) => {
        const novoModo = e.matches ? TemaInterface.ESCURO : TemaInterface.CLARO;
        definirModoEfetivo(novoModo);
      };
      
      // Suporte para navegadores antigos e novos
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", manipulador);
      } else {
        mediaQuery.addListener(manipulador);
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (mediaQuery && manipulador) {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener("change", manipulador);
        } else {
          mediaQuery.removeListener(manipulador);
        }
      }
    };
  }, [preferencias, modoEfetivo]);

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

  // modoEfetivo agora é um estado reativo


  return {
    modoTema,
    modoEfetivo,
    definirModoTema,
    alternarTema,
    corPrimaria,
    definirCorPrimaria,
    fonte,
    definirFonte,
    paletaPrimaria: PALETA_CORES,
  };
}
