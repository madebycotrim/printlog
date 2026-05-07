/// <reference types="@cloudflare/workers-types" />

/**
 * API Financeira - Cloudflare Pages Functions (v4.0 Soft Delete)
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
    const metodo = request.method;

    try {
        // GET - Listar (Apenas Ativos)
        if (metodo === "GET") {
            const { results: lancamentos } = await env.DB.prepare(
                "SELECT * FROM lancamentos_financeiros WHERE id_usuario = ? AND arquivado = 0 ORDER BY data_criacao DESC"
            ).bind(usuarioId).all();
            return new Response(JSON.stringify(lancamentos), { headers: { "Content-Type": "application/json" } });
        }

        // POST - Registrar
        if (metodo === "POST") {
            const dados = await request.json() as any;
            const novoId = dados.id || crypto.randomUUID();
            await env.DB.prepare(`
                INSERT INTO lancamentos_financeiros (
                    id, id_usuario, id_pedido, id_cliente, tipo, 
                    valor_centavos, descricao, categoria, arquivado, data_criacao
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
            `).bind(
                novoId, usuarioId, dados.idPedido || dados.idReferencia || null, dados.idCliente || null,
                dados.tipo, Math.abs(dados.valorCentavos), 
                dados.descricao, dados.categoria || 'Geral',
                dados.data || new Date().toISOString()
            ).run();
            return new Response(JSON.stringify({ id: novoId, sucesso: true }), { 
                status: 201,
                headers: { "Content-Type": "application/json" } 
            });
        }

        // DELETE - Hard Delete (Liberação de Espaço)
        if (metodo === "DELETE") {
            if (!id) return new Response(JSON.stringify({ erro: "ID não fornecido" }), { status: 400, headers: { "Content-Type": "application/json" } });
            
            await env.DB.prepare(
                "DELETE FROM lancamentos_financeiros WHERE id = ? AND id_usuario = ?"
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
