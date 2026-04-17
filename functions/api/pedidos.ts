/// <reference types="@cloudflare/workers-types" />

/**
 * API de Pedidos - Cloudflare Pages Functions (v5.0 Soft Delete)
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
    const metodo = request.method;

    try {
        // GET - Listar (Apenas Ativos)
        if (metodo === "GET") {
            const { results: pedidos } = await env.DB.prepare(
                "SELECT * FROM pedidos_impressao WHERE id_usuario = ? AND arquivado = 0 ORDER BY data_criacao DESC"
            ).bind(usuarioId).all();
            return new Response(JSON.stringify(pedidos), { headers: { "Content-Type": "application/json" } });
        }

        // POST - Criar
        if (metodo === "POST") {
            const dados = await request.json() as any;
            const novoId = dados.id || crypto.randomUUID();
            await env.DB.prepare(`
                INSERT INTO pedidos_impressao (
                    id, id_usuario, id_cliente, descricao, status, valor_centavos, data_criacao, arquivado
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 0)
            `).bind(
                novoId, usuarioId, dados.idCliente, dados.descricao, 
                dados.status || 'pendente', dados.valorCentavos,
                dados.dataCriacao || new Date().toISOString()
            ).run();
            return new Response(JSON.stringify({ id: novoId, sucesso: true }), { 
                status: 201, 
                headers: { "Content-Type": "application/json" } 
            });
        }

        // PATCH / PUT - Atualizar
        if (metodo === "PATCH" || metodo === "PUT") {
            const dados = await request.json() as any;
            await env.DB.prepare(`
                UPDATE pedidos_impressao SET 
                    status = ?, descricao = ?, valor_centavos = ?,
                    data_conclusao = ?, id_cliente = ?
                WHERE id = ? AND id_usuario = ?
            `).bind(
                dados.status, dados.descricao, dados.valorCentavos,
                dados.dataConclusao, dados.idCliente, dados.id, usuarioId
            ).run();
            return new Response(JSON.stringify({ sucesso: true }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // DELETE - Soft Delete
        if (metodo === "DELETE") {
            if (!id) return new Response(JSON.stringify({ erro: "ID não fornecido" }), { status: 400, headers: { "Content-Type": "application/json" } });
            await env.DB.prepare(
                "UPDATE pedidos_impressao SET arquivado = 1 WHERE id = ? AND id_usuario = ?"
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
