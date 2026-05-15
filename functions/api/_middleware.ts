/// <reference types="@cloudflare/workers-types" />
import { criptografar } from "./utilitarios/criptografia";

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  ENCRYPTION_KEY: string;
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
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            try {
                const payloadPart = token.split(".")[1];
                if (payloadPart) {
                    let base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
                    while (base64.length % 4) base64 += '=';
                    const payload = JSON.parse(atob(base64));
                    context.data.uid = payload.sub || payload.user_id || "";
                    context.data.email = payload.email || "";
                }
            } catch (e) {
                console.warn("[Middleware] Falha ao decodificar JWT");
            }
        }

        // Fallback para header de dev
        if (!context.data.uid) {
            context.data.uid = request.headers.get("x-user-uid") || "";
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
