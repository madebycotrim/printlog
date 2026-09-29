/// <reference types="@cloudflare/workers-types" />

/**
 * Endpoint de Câmbio Comercial Oficial via Cloudflare Edge Backend.
 * Consulta cotações PTAX em AwesomeAPI / Banco Central e aplica
 * cache CDN de 1 hora para máxima velocidade e imunidade a bloqueios CSP.
 */

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, max-age=1800, s-maxage=3600, stale-while-revalidate=7200",
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
};

export const onRequestGet: PagesFunction = async () => {
  const controlador = new AbortController();
  const timeoutId = setTimeout(() => controlador.abort(), 4000);

  try {
    const resposta = await fetch(
      "https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL",
      {
        signal: controlador.signal,
        headers: { "User-Agent": "PrintLog-Edge/1.0" },
      }
    );
    clearTimeout(timeoutId);

    if (!resposta.ok) {
      throw new Error(`AwesomeAPI HTTP ${resposta.status}`);
    }

    const dados = (await resposta.json()) as any;
    const usdBrl = parseFloat(dados?.USDBRL?.bid);
    const eurBrl = parseFloat(dados?.EURBRL?.bid);

    if (isNaN(usdBrl) || isNaN(eurBrl) || usdBrl <= 0 || eurBrl <= 0) {
      throw new Error("Valores de câmbio inválidos recebidos");
    }

    return new Response(
      JSON.stringify({
        sucesso: true,
        origem: "cloudflare_edge",
        USDBRL: usdBrl,
        EURBRL: eurBrl,
        timestamp: Date.now(),
      }),
      { headers: CORS_HEADERS }
    );
  } catch (erro) {
    clearTimeout(timeoutId);
    console.warn("[Cambio-Edge] Falha ao consultar AwesomeAPI, acionando contingência:", erro);

    return new Response(
      JSON.stringify({
        sucesso: true,
        origem: "contingencia_edge",
        USDBRL: 5.25,
        EURBRL: 5.92,
        timestamp: Date.now(),
      }),
      { headers: CORS_HEADERS }
    );
  }
};

export const onRequest = onRequestGet;
