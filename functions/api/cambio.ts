/// <reference types="@cloudflare/workers-types" />

/**
 * Endpoint de Câmbio Comercial Oficial via Cloudflare Edge Backend.
 * Arquitetura de Alta Disponibilidade (Multi-Tier):
 *  - Tier 1: AwesomeAPI (Câmbio comercial em tempo real B3 / PTAX)
 *  - Tier 2: Banco Central do Brasil (SGS Oficial Direto - Séries 1 USD e 21619 EUR)
 *  - Tier 3: Taxas de contingência garantidas
 * 
 * Cache CDN de 1 hora na borda da Cloudflare para altíssima performance (< 20ms).
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
  // === TIER 1: AwesomeAPI (Câmbio comercial em tempo real) ===
  const controladorAwesome = new AbortController();
  const timeoutAwesome = setTimeout(() => controladorAwesome.abort(), 3000);

  try {
    const resposta = await fetch(
      "https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL",
      {
        signal: controladorAwesome.signal,
        headers: { "User-Agent": "PrintLog-Edge/1.0" },
      }
    );
    clearTimeout(timeoutAwesome);

    if (resposta.ok) {
      const dados = (await resposta.json()) as any;
      const usdBrl = parseFloat(dados?.USDBRL?.bid || dados?.USDBRL?.ask);
      const eurBrl = parseFloat(dados?.EURBRL?.bid || dados?.EURBRL?.ask);

      if (usdBrl > 0 && eurBrl > 0) {
        return new Response(
          JSON.stringify({
            sucesso: true,
            origem: "awesomeapi_edge",
            USDBRL: Number(usdBrl.toFixed(4)),
            EURBRL: Number(eurBrl.toFixed(4)),
            timestamp: Date.now(),
          }),
          { headers: CORS_HEADERS }
        );
      }
    }
  } catch (erro) {
    console.warn("[Cambio-Edge] Tier 1 (AwesomeAPI) falhou, acionando Tier 2 (Banco Central):", erro);
  } finally {
    clearTimeout(timeoutAwesome);
  }

  // === TIER 2: Banco Central do Brasil (SGS Oficial Direto) ===
  const controladorBCB = new AbortController();
  const timeoutBCB = setTimeout(() => controladorBCB.abort(), 3500);

  try {
    const [resUSD, resEUR] = await Promise.all([
      fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.1/dados/ultimos/1?formato=json", {
        signal: controladorBCB.signal,
        headers: { "User-Agent": "PrintLog-Edge/1.0" },
      }),
      fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.21619/dados/ultimos/1?formato=json", {
        signal: controladorBCB.signal,
        headers: { "User-Agent": "PrintLog-Edge/1.0" },
      }),
    ]);
    clearTimeout(timeoutBCB);

    if (resUSD.ok && resEUR.ok) {
      const [dadosUSD, dadosEUR] = (await Promise.all([
        resUSD.json(),
        resEUR.json(),
      ])) as any[];

      const usdBrl = parseFloat(dadosUSD?.[0]?.valor);
      const eurBrl = parseFloat(dadosEUR?.[0]?.valor);

      if (usdBrl > 0 && eurBrl > 0) {
        return new Response(
          JSON.stringify({
            sucesso: true,
            origem: "banco_central_bcb_edge",
            USDBRL: Number(usdBrl.toFixed(4)),
            EURBRL: Number(eurBrl.toFixed(4)),
            dataReferenciaBCB: dadosUSD?.[0]?.data,
            timestamp: Date.now(),
          }),
          { headers: CORS_HEADERS }
        );
      }
    }
  } catch (erro) {
    console.warn("[Cambio-Edge] Tier 2 (BCB) falhou, acionando contingência:", erro);
  } finally {
    clearTimeout(timeoutBCB);
  }

  // === TIER 3: Contingência Garantida de Mercado ===
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
};

export const onRequest = onRequestGet;
