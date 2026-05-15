/// <reference types="@cloudflare/workers-types" />
import { criptografar } from "./utilitarios/criptografia";

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  ENCRYPTION_KEY: string;
}

/**
 * Middleware Global: Gerenciamento de Logs Criptografados (Marco Civil)
 * Implementa segurança de dados em nível de aplicação antes do armazenamento.
 */
export const onRequest: PagesFunction<Env> = async (context) => {
    const { request, env, next } = context;
    const url = new URL(request.url);

    // Ignora arquivos estáticos para economizar processamento
    if (url.pathname.includes(".") && !url.pathname.startsWith("/api")) {
        return next();
    }

    // ── TRAVA DE PRIVACIDADE: Só loga se houver consentimento explícito (Banner clicado) ──
    const cookies = request.headers.get("Cookie") || "";
    const aceitouPrivacidade = cookies.includes("printlog_consentimento=aceito");

    // Recupera UID (injetado por outros middlewares ou headers de autenticação)
    const uid = request.headers.get("x-user-uid"); 
    const chaveMestra = env.ENCRYPTION_KEY || "chave-temporaria-printlog-2026";

    // ── REGISTRO DE ACESSO PROTEGIDO ──
    if (uid && url.pathname.startsWith("/api") && aceitouPrivacidade) {
        const ipOriginal = request.headers.get("cf-connecting-ip") || "0.0.0.0";
        const uaOriginal = request.headers.get("user-agent") || "Desconhecido";

        context.waitUntil(
            (async () => {
                try {
                    // Criptografia AES-GCM antes de salvar no banco D1
                    const [ipProtegido, uaProtegido] = await Promise.all([
                        criptografar(ipOriginal, chaveMestra),
                        criptografar(uaOriginal, chaveMestra)
                    ]);

                    // Tenta inserir, mas não quebra se a tabela não existir ainda
                    await env.DB.prepare(
                        "INSERT INTO logs_acesso (id, id_usuario, data_acesso, ip_acesso, user_agent) VALUES (?, ?, ?, ?, ?)"
                    ).bind(
                        crypto.randomUUID(),
                        uid,
                        new Date().toISOString(),
                        ipProtegido,
                        uaProtegido
                    ).run();
                } catch (e) {
                    console.error("[Seguranca] Falha ao registrar log (tabela pode não existir):", e);
                }
            })()
        );
    }

    return next();
};
