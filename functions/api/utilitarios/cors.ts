/**
 * Utilitário de CORS Restritivo e Seguro
 * Valida a origem da requisição contra domínios autorizados.
 */

const ORIGENS_PERMITIDAS = [
  "https://printlog.com.br",
  "https://www.printlog.com.br",
];

export function obterOrigemPermitida(request: Request): string {
  const origin = request.headers.get("Origin") || "";

  // Origem exata permitida
  if (ORIGENS_PERMITIDAS.includes(origin)) {
    return origin;
  }

  // Permite subdomínios da Cloudflare Pages (*.printlog.pages.dev)
  if (origin.endsWith(".printlog.pages.dev")) {
    return origin;
  }

  // Permite localhost e 127.0.0.1 em desenvolvimento
  if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
    return origin;
  }

  // Padrão seguro para requisições diretas / sem Origin ou de origem externa desconhecida
  return "https://printlog.com.br";
}

export function aplicarHeadersCors(headers: Headers, request: Request, metodos = "GET, POST, OPTIONS"): Headers {
  const origem = obterOrigemPermitida(request);
  headers.set("Access-Control-Allow-Origin", origem);
  headers.set("Access-Control-Allow-Methods", metodos);
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-user-uid, x-user-email");
  headers.set("Access-Control-Max-Age", "86400");
  headers.set("Vary", "Origin");
  return headers;
}
