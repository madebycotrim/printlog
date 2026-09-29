import { useState, useEffect } from "react";
import i18n from "@/configuracoes/i18n";

export interface DadosClimaCompletos {
  temperaturaC: number | null;
  temperaturaF: number | null;
  temperatura: number | null; // Valor adaptado na unidade ativa (°C ou °F)
  unidade: "°C" | "°F";
  temperaturaFormatada: string;
  umidade: number | null;
  cidade: string | null;
  carregando: boolean;
  erro: string | null;
}

const CACHE_KEY = "printlog_clima_edge_cache_v2";
const CACHE_EXPIRATION_MS = 30 * 60 * 1000; // 30 minutos

export function useClimaLocal(): DadosClimaCompletos {
  const [dadosBase, setDadosBase] = useState<{
    temperaturaC: number | null;
    umidade: number | null;
    cidade: string | null;
    carregando: boolean;
    erro: string | null;
  }>({
    temperaturaC: 24,
    umidade: 55,
    cidade: "São Paulo",
    carregando: true,
    erro: null,
  });

  const [idioma, setIdioma] = useState<string>(i18n?.language || "pt-BR");

  // Escuta alterações de idioma no i18next para atualizar unidade (°C <-> °F) instantaneamente
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setIdioma(lng);
    };

    if (i18n) {
      i18n.on("languageChanged", handleLanguageChange);
      setIdioma(i18n.language || "pt-BR");
    }

    return () => {
      if (i18n) {
        i18n.off("languageChanged", handleLanguageChange);
      }
    };
  }, []);

  useEffect(() => {
    let montado = true;

    async function buscarClimaBackend() {
      // 1. Tenta recuperar do cache local primeiro
      try {
        const cacheRaw = localStorage.getItem(CACHE_KEY);
        if (cacheRaw) {
          const cache = JSON.parse(cacheRaw);
          const aindaValido = Date.now() - (cache.timestamp || 0) < CACHE_EXPIRATION_MS;
          if (aindaValido && cache.dados && typeof cache.dados.temperaturaC === "number") {
            if (montado) {
              setDadosBase({
                ...cache.dados,
                carregando: false,
                erro: null,
              });
            }
            return;
          }
        }
      } catch {
        // Cache inválido
      }

      // 2. Consulta o backend nativo da Cloudflare (/api/clima)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      try {
        const resposta = await fetch("/api/clima", {
          signal: controller.signal,
          headers: { "Accept": "application/json" },
        });

        if (!resposta.ok) {
          throw new Error(`HTTP ${resposta.status}`);
        }

        const json = await resposta.json();
        clearTimeout(timeoutId);

        if (json && json.sucesso) {
          const tempC = typeof json.temperaturaC === "number" ? json.temperaturaC : 24;
          const umid = typeof json.umidade === "number" ? json.umidade : 55;
          const cid = json.cidade || "São Paulo";

          const novosDados = {
            temperaturaC: tempC,
            umidade: umid,
            cidade: cid,
            carregando: false,
            erro: null,
          };

          try {
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({
                dados: novosDados,
                timestamp: Date.now(),
              })
            );
          } catch {
            // LocalStorage indisponível
          }

          if (montado) {
            setDadosBase(novosDados);
          }
          return;
        }
      } catch (err) {
        console.warn("[useClimaLocal] Fallback de clima via edge:", err);
      } finally {
        clearTimeout(timeoutId);
      }

      // 2.2 Fallback resiliente para desenvolvimento local direto com Open-Meteo
      try {
        const resMeteo = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=-23.5505&longitude=-46.6333&current=temperature_2m,relative_humidity_2m",
          { headers: { Accept: "application/json" } }
        );
        if (resMeteo.ok) {
          const meteoJson = await resMeteo.json();
          const tempC =
            typeof meteoJson?.current?.temperature_2m === "number"
              ? Math.round(meteoJson.current.temperature_2m)
              : 24;
          const umid =
            typeof meteoJson?.current?.relative_humidity_2m === "number"
              ? Math.round(meteoJson.current.relative_humidity_2m)
              : 55;

          const novosDados = {
            temperaturaC: tempC,
            umidade: umid,
            cidade: "São Paulo",
            carregando: false,
            erro: null,
          };
          if (montado) {
            setDadosBase(novosDados);
          }
          return;
        }
      } catch {
        // Fallback offline estático abaixo
      }

      // 3. Fallback seguro offline (ex: sem conexão à internet)
      if (montado) {
        setDadosBase({
          temperaturaC: 24,
          umidade: 55,
          cidade: "São Paulo",
          carregando: false,
          erro: null,
        });
      }
    }

    buscarClimaBackend();

    return () => {
      montado = false;
    };
  }, []);

  // Determina unidade ativa com base no idioma
  const usaFahrenheit = idioma?.startsWith("en");
  const unidade: "°C" | "°F" = usaFahrenheit ? "°F" : "°C";

  const tempC = dadosBase.temperaturaC;
  const tempF = tempC !== null ? Math.round((tempC * 9) / 5 + 32) : null;
  const temperaturaAtual = usaFahrenheit ? tempF : tempC;

  const temperaturaFormatada =
    dadosBase.carregando
      ? "..."
      : dadosBase.erro || temperaturaAtual === null
      ? "--"
      : `${temperaturaAtual}${unidade}`;

  return {
    temperaturaC: tempC,
    temperaturaF: tempF,
    temperatura: temperaturaAtual,
    unidade,
    temperaturaFormatada,
    umidade: dadosBase.umidade,
    cidade: dadosBase.cidade,
    carregando: dadosBase.carregando,
    erro: dadosBase.erro,
  };
}
