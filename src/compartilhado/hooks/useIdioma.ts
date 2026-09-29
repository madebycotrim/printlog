import { useTranslation } from "react-i18next";
import { useCallback, useMemo } from "react";
import { IDIOMAS_SUPORTADOS, CodigoIdioma } from "@/configuracoes/i18n";

export function useIdioma() {
  const { t, i18n } = useTranslation();

  // Garante que o idioma seja um dos suportados, com fallback para pt-BR
  const idiomaAtual = useMemo<CodigoIdioma>(() => {
    const lang = i18n.language;
    if (lang?.startsWith("en")) return "en-US";
    if (lang?.startsWith("es")) return "es-ES";
    if (lang?.startsWith("pt")) return "pt-BR";
    const encontrado = IDIOMAS_SUPORTADOS.find((i) => i.codigo === lang);
    return encontrado ? encontrado.codigo : "pt-BR";
  }, [i18n.language]);

  const infoIdiomaAtual = useMemo(() => {
    return IDIOMAS_SUPORTADOS.find((i) => i.codigo === idiomaAtual) ?? IDIOMAS_SUPORTADOS[0];
  }, [idiomaAtual]);

  /**
   * Altera o idioma da aplicação e atualiza a tag lang do HTML
   */
  const mudarIdioma = useCallback(
    async (novoIdioma: CodigoIdioma) => {
      await i18n.changeLanguage(novoIdioma);
      document.documentElement.lang = novoIdioma;
    },
    [i18n]
  );

  /**
   * Converte centavos (inteiro) para a moeda apropriada de acordo com o idioma.
   * Regra 6.0: Moeda sempre inteiro em centavos, sem imprecisões de float.
   */
  const formatarMoeda = useCallback(
    (centavos: number, moedaEspecifica?: string): string => {
      const valor = centavos / 100;
      let moeda = moedaEspecifica;

      if (!moeda) {
        switch (idiomaAtual) {
          case "en-US":
            moeda = "USD";
            break;
          case "es-ES":
            moeda = "EUR";
            break;
          case "pt-BR":
          default:
            moeda = "BRL";
            break;
        }
      }

      try {
        return new Intl.NumberFormat(idiomaAtual, {
          style: "currency",
          currency: moeda,
        }).format(valor);
      } catch {
        return `${moeda} ${valor.toFixed(2)}`;
      }
    },
    [idiomaAtual]
  );

  /**
   * Formata datas de acordo com o locale selecionado
   */
  const formatarData = useCallback(
    (
      data?: Date | string | number | null,
      estilo: "curta" | "media" | "completa" = "media"
    ): string => {
      if (!data) return "—";
      try {
        const d =
          typeof data === "number" && data < 10000000000
            ? new Date(data * 1000)
            : new Date(data);

        if (isNaN(d.getTime())) return "—";

        if (estilo === "curta") {
          return new Intl.DateTimeFormat(idiomaAtual, {
            day: "2-digit",
            month: "2-digit",
          }).format(d);
        }

        if (estilo === "completa") {
          return new Intl.DateTimeFormat(idiomaAtual, {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }).format(d);
        }

        return new Intl.DateTimeFormat(idiomaAtual, {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(d);
      } catch {
        return "—";
      }
    },
    [idiomaAtual]
  );

  return {
    t,
    i18n,
    idiomaAtual,
    infoIdiomaAtual,
    mudarIdioma,
    formatarMoeda,
    formatarData,
    idiomas: IDIOMAS_SUPORTADOS,
  };
}
