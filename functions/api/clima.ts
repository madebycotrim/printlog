/// <reference types="@cloudflare/workers-types" />

/**
 * Endpoint de Clima Local e Condições de Impressão via Cloudflare Backend (Edge).
 * Extrai a geolocalização nativa do visitante através do request.cf
 * e consulta a meteorologia na borda com cache CDN de 15 minutos.
 */

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, max-age=600, s-maxage=900, stale-while-revalidate=1800",
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
};

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const { request } = context;
    const cf = (request as any).cf || {};
    const headers = request.headers;

    // 1. Extração nativa de localização via Cloudflare
    let latitude = cf?.latitude || headers.get("cf-iplatitude");
    let longitude = cf?.longitude || headers.get("cf-iplongitude");
    let cidade = cf?.city || headers.get("cf-ipcity") || "São Paulo";
    let pais = cf?.country || headers.get("cf-ipcountry") || "BR";

    // 2. Fallback de coordenadas para ambiente de desenvolvimento local
    if (!latitude || !longitude) {
      latitude = -23.5505;
      longitude = -46.6333;
      cidade = cidade || "São Paulo";
    }

    // 3. Consulta rápida na borda com timeout de 3.5s
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const urlClima = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m`;
    const resMeteo = await fetch(urlClima, {
      signal: controller.signal,
      headers: { "User-Agent": "PrintLog-Edge/1.0" },
    });
    clearTimeout(timeoutId);

    if (!resMeteo.ok) {
      throw new Error(`Open-Meteo HTTP ${resMeteo.status}`);
    }

    const dados = (await resMeteo.json()) as any;
    const tempBruta = dados?.current?.temperature_2m;
    const umidadeBruta = dados?.current?.relative_humidity_2m;

    const temperaturaC = typeof tempBruta === "number" ? Math.round(tempBruta) : 24;
    const temperaturaF = Math.round((temperaturaC * 9) / 5 + 32);
    const umidade = typeof umidadeBruta === "number" ? Math.round(umidadeBruta) : 55;

    return new Response(
      JSON.stringify({
        sucesso: true,
        origem: "cloudflare_edge",
        cidade,
        pais,
        temperaturaC,
        temperaturaF,
        umidade,
        timestamp: Date.now(),
      }),
      { headers: CORS_HEADERS }
    );
  } catch (erro) {
    console.warn("[Clima-Edge] Fallback ativado:", erro);
    return new Response(
      JSON.stringify({
        sucesso: true,
        origem: "cloudflare_edge_fallback",
        cidade: "São Paulo",
        pais: "BR",
        temperaturaC: 24,
        temperaturaF: 75,
        umidade: 55,
        timestamp: Date.now(),
      }),
      { headers: CORS_HEADERS }
    );
  }
};

export const onRequest = onRequestGet;
