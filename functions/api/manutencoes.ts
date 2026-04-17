/// <reference types="@cloudflare/workers-types" />

/**
 * API de Manutenções - Cloudflare Pages Functions (v2.0 Soft Delete)
 */

interface Env {
    DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
    const { env, request } = context;
    const usuarioId = request.headers.get("x-usuario-id");
    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const idImpressora = url.searchParams.get("idImpressora");
    const metodo = request.method;

    try {
        // GET - Listar (Apenas Ativos)
        if (metodo === "GET") {
            let query = "SELECT * FROM registros_manutencao WHERE id_usuario = ? AND arquivado = 0";
            let params = [usuarioId];

            if (idImpressora) {
                query += " AND id_impressora = ?";
                params.push(idImpressora);
            }

            const { results } = await env.DB.prepare(query).bind(...params).all();
            return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
        }

        // POST - Criar
        if (metodo === "POST") {
            const dados = await request.json() as any;
            const novoId = dados.id || crypto.randomUUID();
            await env.DB.prepare(`
                INSERT INTO registros_manutencao (
                    id, id_usuario, id_impressora, data, tipo, descricao, custo_centavos, observacoes, arquivado
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
            `).bind(
                novoId, usuarioId, dados.idImpressora, dados.data || new Date().toISOString(),
                dados.tipo, dados.descricao, dados.custoCentavos || 0, dados.observacoes || ''
            ).run();
            return new Response(JSON.stringify({ id: novoId, sucesso: true }), { 
                status: 201,
                headers: { "Content-Type": "application/json" }
            });
        }

        // DELETE - Soft Delete
        if (metodo === "DELETE") {
            if (!id) return new Response("ID não informado", { status: 400 });
            await env.DB.prepare(
                "UPDATE registros_manutencao SET arquivado = 1 WHERE id = ? AND id_usuario = ?"
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
