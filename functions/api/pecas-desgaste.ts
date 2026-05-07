/// <reference types="@cloudflare/workers-types" />

/**
 * API de Peças de Desgaste - Cloudflare Pages Functions (v2.0 Soft Delete)
 */

interface Env {
    DB: D1Database;
}

export const onRequest: PagesFunction<Env, any, { uid: string }> = async (context) => {
    const { env, request, data } = context;

    // Obtido com segurança via Middleware JWT
    const usuarioId = data.uid;
    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const idImpressora = url.searchParams.get("idImpressora");
    const metodo = request.method;

    try {
        // GET - Listar (Com Fallback para Esquemas Antigos)
        if (metodo === "GET") {
            let query = "SELECT * FROM pecas_desgaste WHERE id_usuario = ?";
            let params = [usuarioId];

            if (idImpressora) {
                query += " AND id_impressora = ?";
                params.push(idImpressora);
            }

            try {
                const { results } = await env.DB.prepare(query + " AND arquivado = 0").bind(...params).all();
                return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
            } catch (e) {
                const { results } = await env.DB.prepare(query).bind(...params).all();
                return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
            }
        }

        // POST - Criar / Atualizar
        if (metodo === "POST") {
            const dados = await request.json() as any;
            const idParaUsar = dados.id || crypto.randomUUID();
            
            await env.DB.prepare(`
                INSERT INTO pecas_desgaste (
                    id, id_usuario, id_impressora, nome, vida_util_minutos, 
                    horas_uso_atual_minutos, data_ultima_troca, arquivado
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 0)
                ON CONFLICT(id) DO UPDATE SET
                    nome = excluded.nome,
                    vida_util_minutos = excluded.vida_util_minutos,
                    horas_uso_atual_minutos = excluded.horas_uso_atual_minutos,
                    data_ultima_troca = excluded.data_ultima_troca
            `).bind(
                idParaUsar, usuarioId, dados.idImpressora, dados.nome, 
                dados.vidaUtilMinutos || 0, dados.horasUsoAtualMinutos || 0,
                dados.dataUltimaTroca || new Date().toISOString()
            ).run();

            return new Response(JSON.stringify({ id: idParaUsar, sucesso: true }), { 
                status: 201,
                headers: { "Content-Type": "application/json" }
            });
        }

        // DELETE - Hard Delete (Limpeza de Espaço)
        if (metodo === "DELETE") {
            if (!id) return new Response("ID não informado", { status: 400 });
            
            await env.DB.prepare(
                "DELETE FROM pecas_desgaste WHERE id = ? AND id_usuario = ?"
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
