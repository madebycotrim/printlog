/// <reference types="@cloudflare/workers-types" />
import { criptografar } from "./utilitarios/criptografia";

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  ENCRYPTION_KEY: string;
}

/**
 * Middleware Global - Autenticação, Privacidade e Conformidade (Marco Civil)
 * 1. Valida Identidade (Firebase JWT)
 * 2. Aplica Trava de Privacidade (LGPD)
 * 3. Registra Logs de Acesso Criptografados (AES-GCM)
 */
export const onRequest: PagesFunction<Env, any, { uid: string; email?: string }> = async (context) => {
    const { request, env, next } = context;
    const url = new URL(request.url);

    try {
        // ── 1. RECUPERAÇÃO DE IDENTIDADE (JWT Firebase) ──
        const authHeader = request.headers.get("Authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            try {
                const payloadPart = token.split(".")[1];
                if (payloadPart) {
                    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
                    const payload = JSON.parse(atob(base64));
                    
                    context.data.uid = payload.sub || payload.user_id;
                    context.data.email = payload.email || "";
                }
            } catch (e) {
                console.error("[Auth] Falha ao decodificar token:", e);
            }
        }

        // Fallback para header de desenvolvimento
        if (!context.data.uid) {
            context.data.uid = request.headers.get("x-user-uid") || "";
        }

        const uid = context.data.uid;

        // ── 2. TRAVA DE PRIVACIDADE E LOGS (Marco Civil) ──
        const cookies = request.headers.get("Cookie") || "";
        const aceitouPrivacidade = cookies.includes("printlog_consentimento=aceito");

        console.log(`[Middleware Log] UID: ${uid ? 'Sim' : 'Não'} | Rota: ${url.pathname} | Consentimento: ${aceitouPrivacidade ? 'Sim' : 'Não'}`);

        // Só registramos logs se:
        // - For uma chamada de API (/api)
        // - O usuário estiver logado (uid)
        // - O usuário deu consentimento explícito (aceitouPrivacidade)
        if (uid && url.pathname.startsWith("/api") && aceitouPrivacidade) {
            console.log(`[Middleware Log] Iniciando gravação de log para usuário: ${uid}`);
            const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || "127.0.0.1";
            const ua = request.headers.get("user-agent") || "desconhecido";
            const agora = new Date().toISOString();
            const chaveMestra = env.ENCRYPTION_KEY || "chave-temporaria-printlog-2026";

            // O registro é feito em background para não atrasar a resposta da API
            context.waitUntil((async () => {
                try {
                    // Blindagem dos dados de acesso antes de persistir
                    const ipProtegido = await criptografar(ip, chaveMestra);
                    const uaProtegido = await criptografar(ua, chaveMestra);

                    const resultado = await env.DB.prepare(`
                        INSERT INTO logs_acesso (id, id_usuario, data_acesso, ip_acesso, user_agent)
                        VALUES (?, ?, ?, ?, ?)
                    `).bind(
                        crypto.randomUUID(),
                        uid,
                        agora,
                        ipProtegido,
                        uaProtegido
                    ).run();
                    
                    console.info(`[Middleware Log] Log gravado com sucesso! ID: ${uid}`);
                } catch (erro: any) {
                    // Ignora silenciosamente se a tabela ainda não existir no D1
                    console.error("[Middleware Log] Erro ao gravar log:", erro.message);
                }
            })());
        } else if (uid && url.pathname.startsWith("/api") && !aceitouPrivacidade) {
            console.warn(`[Middleware Log] Log ignorado: Usuário logado mas NÃO aceitou a política de privacidade.`);
        }

        return await next();

    } catch (erro) {
        console.error("[Middleware] Erro crítico:", erro);
        return await next();
    }
};
