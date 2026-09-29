import { useTranslation } from "react-i18next";
import { useCallback, useMemo } from "react";
import { IDIOMAS_SUPORTADOS, CodigoIdioma, CHAVE_STORAGE_IDIOMA } from "@/configuracoes/i18n";
import { autenticacao } from "@/compartilhado/servicos/firebase";
import { useArmazemConfiguracoes } from "@/funcionalidades/sistema/configuracoes/estado/armazemConfiguracoes";
import { tradutorUniversalDOM } from "@/compartilhado/utilitarios/tradutorUniversalDOM";

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
   * Altera o idioma da aplicação, persiste no localStorage e sincroniza no D1
   */
  const mudarIdioma = useCallback(
    async (novoIdioma: CodigoIdioma) => {
      // 1. Persistência imediata no navegador (localStorage)
      try {
        localStorage.setItem(CHAVE_STORAGE_IDIOMA, novoIdioma);
      } catch (e) {
        console.warn("[i18n] Erro ao persistir idioma no localStorage:", e);
      }

      // 2. Mudança reativa no framework i18n e na tag HTML
      await i18n.changeLanguage(novoIdioma);
      document.documentElement.lang = novoIdioma;

      // 3. Aplica tradução dinâmica no DOM de todas as telas
      tradutorUniversalDOM.definirIdioma(novoIdioma);

      // 4. Persistência na nuvem (Cloudflare D1) se o usuário estiver autenticado
      try {
        const uid = autenticacao.currentUser?.uid;
        if (uid) {
          const armazem = useArmazemConfiguracoes.getState();
          const metaAtual = armazem.calculadoraMeta || {};
          const novaMeta = {
            ...metaAtual,
            idioma: novoIdioma,
          };
          armazem.definirCalculadoraMeta(novaMeta);
          await armazem.salvarNoD1(uid);
        }
      } catch (err) {
        console.warn("[i18n] Não foi possível salvar preferência de idioma no D1:", err);
      }
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
