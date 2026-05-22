/// <reference types="@cloudflare/workers-types" />
import { criptografar } from "./utilitarios/criptografia";

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  ENCRYPTION_KEY: string;
  FIREBASE_PROJECT_ID?: string;
}

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  const raw = atob(base64);
  const val = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    val[i] = raw.charCodeAt(i);
  }
  return val;
}

let cachedJWKs: any = null;
let cachedJWKsExpiry = 0;

async function getGoogleJWKs() {
  const now = Date.now();
  if (cachedJWKs && now < cachedJWKsExpiry) {
    return cachedJWKs;
  }
  const response = await fetch(
    "https://www.googleapis.com/robot/v1/metadata/jwk/securetoken@system.gserviceaccount.com"
  );
  if (!response.ok) {
    throw new Error("Failed to fetch Google JWKs");
  }
  const data = (await response.json()) as any;
  cachedJWKs = data.keys;
  const cacheControl = response.headers.get("cache-control");
  let maxAge = 3600;
  if (cacheControl) {
    const match = cacheControl.match(/max-age=(\d+)/);
    if (match) {
      maxAge = parseInt(match[1], 10);
    }
  }
  cachedJWKsExpiry = now + maxAge * 1000;
  return cachedJWKs;
}

async function verifyFirebaseToken(
  token: string,
  firebaseProjectId: string
): Promise<{ uid: string; email?: string }> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }
  const headerPart = parts[0];
  const payloadPart = parts[1];
  const signaturePart = parts[2];

  const header = JSON.parse(new TextDecoder().decode(base64UrlDecode(headerPart)));
  if (header.alg !== "RS256") {
    throw new Error("Unsupported algorithm: " + header.alg);
  }
  if (!header.kid) {
    throw new Error("Missing kid in JWT header");
  }

  const keys = await getGoogleJWKs();
  const keyData = keys.find((key: any) => key.kid === header.kid);
  if (!keyData) {
    throw new Error("No matching JWK found for kid: " + header.kid);
  }

  const publicKey = await crypto.subtle.importKey(
    "jwk",
    keyData,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["verify"]
  );

  const encoder = new TextEncoder();
  const dataToVerify = encoder.encode(`${headerPart}.${payloadPart}`);
  const signatureBytes = base64UrlDecode(signaturePart);

  const isValid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    publicKey,
    signatureBytes,
    dataToVerify
  );
  if (!isValid) {
    throw new Error("Invalid signature");
  }

  const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadPart)));
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) {
    throw new Error("Token expired");
  }
  if (payload.aud !== firebaseProjectId) {
    throw new Error(`Invalid audience: expected ${firebaseProjectId}, got ${payload.aud}`);
  }
  if (payload.iss !== `https://securetoken.google.com/${firebaseProjectId}`) {
    throw new Error("Invalid issuer");
  }
  if (typeof payload.sub !== "string" || !payload.sub) {
    throw new Error("Invalid subject (uid)");
  }

  return {
    uid: payload.sub,
    email: payload.email,
  };
}

/**
 * Middleware Global - Autenticação, Privacidade e Conformidade
 * Versão Corrigida: Evita erros 500 ao tratar o ciclo de vida da Resposta.
 */
export const onRequest: PagesFunction<Env, any, { uid: string; email?: string }> = async (context) => {
    const { request, env, next } = context;
    const url = new URL(request.url);

    // Inicializa dados para evitar undefined em cascata
    context.data.uid = "";
    context.data.email = "";

    try {
        // 1. Extração de Identidade (JWT)
        const authHeader = request.headers.get("Authorization");
        const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
        let authenticated = false;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            try {
                const projectId = env.FIREBASE_PROJECT_ID || "printlog-85fe6";
                const verified = await verifyFirebaseToken(token, projectId);
                context.data.uid = verified.uid;
                context.data.email = verified.email || "";
                authenticated = true;
            } catch (e: any) {
                console.warn("[Middleware] Falha ao verificar JWT:", e.message);
            }
        }

        // Fallback para header de dev apenas localmente
        if (!authenticated && isLocal) {
            context.data.uid = request.headers.get("x-user-uid") || "";
            context.data.email = request.headers.get("x-user-email") || "";
        }

        const uid = context.data.uid;
        const cookies = request.headers.get("Cookie") || "";
        const aceitouPrivacidade = cookies.includes("printlog_consentimento=aceito");
        const jaRegistrado = cookies.includes("printlog_sessao_ativa=1");

        // 2. Executa a requisição principal ANTES de qualquer lógica de modificação de resposta
        const resposta = await next();

        // 3. Lógica de Log (Só se for API, logado, aceitou e não tem log recente)
        if (uid && url.pathname.startsWith("/api") && aceitouPrivacidade && !jaRegistrado) {
            const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || "127.0.0.1";
            const ua = request.headers.get("user-agent") || "desconhecido";
            const chaveMestra = env.ENCRYPTION_KEY || "chave-temporaria-printlog-2026";

            context.waitUntil((async () => {
                try {
                    const ipProt = await criptografar(ip, chaveMestra);
                    const uaProt = await criptografar(ua, chaveMestra);
                    await env.DB.prepare(`
                        INSERT INTO logs_acesso (id, id_usuario, data_acesso, ip_acesso, user_agent)
                        VALUES (?, ?, ?, ?, ?)
                    `).bind(crypto.randomUUID(), uid, new Date().toISOString(), ipProt, uaProt).run();
                } catch (e) {
                    console.error("[Log Error]", e);
                }
            })());

            // 4. Injeta o cookie de throttle na resposta clonada para evitar duplicidade
            const novaResposta = new Response(resposta.body, resposta);
            novaResposta.headers.append("Set-Cookie", "printlog_sessao_ativa=1; path=/; max-age=300; SameSite=Lax");
            return novaResposta;
        }

        return resposta;

    } catch (erro: any) {
        console.error("[Middleware Fatal]", erro);
        // Em caso de erro catastrófico no middleware, tenta deixar a requisição passar
        return await next();
    }
};
