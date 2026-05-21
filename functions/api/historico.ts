/// <reference types="@cloudflare/workers-types" />

/**
 * API de Histórico de Cálculos (Snapshots) - Cloudflare Pages Functions
 * Finalidade: Armazenamento de variações de cálculo | Base Legal: Contrato (Art. 7º, V — LGPD)
 */

interface Env {
    DB: D1Database;
}

export const onRequest: PagesFunction<Env, any, { uid: string; email?: string }> = async (context) => {
    const { env, data, request } = context;

    const metodo = request.method;

    // Tratamento de CORS Preflight (OPTIONS)
    if (metodo === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Max-Age": "86400"
            }
        });
    }

    const usuarioId = data.uid;
    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    try {
        if (metodo === "GET") {
            const { results } = await env.DB.prepare(
                "SELECT id, nome, dados_json as dadosJson, criado_em as criadoEm FROM historico_calculos WHERE id_usuario = ? ORDER BY criado_em DESC"
            ).bind(usuarioId).all();

            const historico = results.map((row: any) => ({
                id: row.id,
                nome: row.nome,
                criadoEm: row.criadoEm,
                dados: JSON.parse(row.dadosJson)
            }));

            return new Response(JSON.stringify(historico), { 
                headers: { "Content-Type": "application/json" } 
            });
        }

        if (metodo === "POST") {
            const body = await request.json() as any;
            const id = body.id || crypto.randomUUID();
            const nome = body.nome;
            const dadosJson = JSON.stringify(body.dados);
            const criadoEm = new Date().toISOString();

            // INSERT OR REPLACE para permitir a sobreposição do rascunho_ativo
            await env.DB.prepare(
                "INSERT OR REPLACE INTO historico_calculos (id, id_usuario, nome, dados_json, criado_em) VALUES (?, ?, ?, ?, ?)"
            ).bind(id, usuarioId, nome, dadosJson, criadoEm).run();

            return new Response(JSON.stringify({ sucesso: true, id }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        if (metodo === "DELETE") {
            const url = new URL(request.url);
            const id = url.searchParams.get("id");

            if (!id) return new Response("ID não informado", { status: 400 });

            await env.DB.prepare(
                "DELETE FROM historico_calculos WHERE id = ? AND id_usuario = ?"
            ).bind(id, usuarioId).run();

            return new Response(JSON.stringify({ sucesso: true }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response("Método não permitido", { status: 405 });
    } catch (erro: any) {
        return new Response(JSON.stringify({ erro: erro.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
