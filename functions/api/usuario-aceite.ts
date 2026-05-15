/// <reference types="@cloudflare/workers-types" />

/**
 * API de Registro de Consentimento (LGPD)
 * Salva a prova de que o usuário aceitou os termos e a política.
 * Base Legal: Consentimento (Art. 7º, I — LGPD)
 */

interface Env {
    DB: D1Database;
}

export const onRequestPost: PagesFunction<Env, any, { uid: string }> = async (context) => {
    const { env, data, request } = context;
    const usuarioId = data.uid;

    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    try {
        const corpo = await request.json() as any;

        await env.DB.prepare(`
            INSERT INTO aceite_termos (id_usuario, data_aceite, versao_termos, versao_politica)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(id_usuario) DO UPDATE SET
                data_aceite = excluded.data_aceite,
                versao_termos = excluded.versao_termos,
                versao_politica = excluded.versao_politica
        `).bind(
            usuarioId,
            new Date().toISOString(),
            corpo.versao_termos || "2026-05-14",
            corpo.versao_politica || "2026-05-14"
        ).run();

        return new Response(JSON.stringify({ sucesso: true }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (erro: any) {
        return new Response(JSON.stringify({ erro: erro.message }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
