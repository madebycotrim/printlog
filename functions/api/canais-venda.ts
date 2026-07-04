/// <reference types="@cloudflare/workers-types" />

interface Env {
    DB: D1Database;
}

/**
 * BUSCAR CANAIS DE VENDA
 */
export const onRequestGet: PagesFunction<Env, any, { uid: string }> = async (context) => {
    const { env, data } = context;

    const usuarioId = data.uid;
    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    try {
        const stmt = env.DB.prepare("SELECT * FROM canais_venda WHERE id_usuario = ? ORDER BY criado_em ASC").bind(usuarioId);
        const { results } = await stmt.all();

        return new Response(JSON.stringify(results), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e: any) {
        return new Response(`Erro ao buscar canais de venda: ${e.message}`, { status: 500 });
    }
};

/**
 * CRIAR CANAL DE VENDA
 */
export const onRequestPost: PagesFunction<Env, any, { uid: string }> = async (context) => {
    const { env, request, data } = context;

    const usuarioId = data.uid;
    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    try {
        const body: any = await request.json();

        // Validar dados básicos
        if (!body.id || !body.nome) {
            return new Response("ID e Nome são obrigatórios", { status: 400 });
        }

        const stmt = env.DB.prepare(`
            INSERT INTO canais_venda (id, id_usuario, nome, taxa_pontos_base, fixa_centavos, frete_centavos)
            VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
            body.id,
            usuarioId,
            body.nome,
            body.taxa_pontos_base ?? 0,
            body.fixa_centavos ?? 0,
            body.frete_centavos ?? 0
        );

        await stmt.run();

        return new Response(JSON.stringify({ sucesso: true, id: body.id }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e: any) {
        return new Response(`Erro ao criar canal de venda: ${e.message}`, { status: 500 });
    }
};

/**
 * ATUALIZAR CANAL DE VENDA
 */
export const onRequestPut: PagesFunction<Env, any, { uid: string }> = async (context) => {
    const { env, request, data } = context;

    const usuarioId = data.uid;
    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    try {
        const body: any = await request.json();

        if (!body.id) {
            return new Response("ID é obrigatório para atualização", { status: 400 });
        }

        const stmt = env.DB.prepare(`
            UPDATE canais_venda 
            SET nome = ?, taxa_pontos_base = ?, fixa_centavos = ?, frete_centavos = ?, atualizado_em = datetime('now')
            WHERE id = ? AND id_usuario = ?
        `).bind(
            body.nome,
            body.taxa_pontos_base ?? 0,
            body.fixa_centavos ?? 0,
            body.frete_centavos ?? 0,
            body.id,
            usuarioId
        );

        await stmt.run();

        return new Response(JSON.stringify({ sucesso: true }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e: any) {
        return new Response(`Erro ao atualizar canal de venda: ${e.message}`, { status: 500 });
    }
};

/**
 * DELETAR CANAL DE VENDA
 */
export const onRequestDelete: PagesFunction<Env, any, { uid: string }> = async (context) => {
    const { env, request, data } = context;

    const usuarioId = data.uid;
    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
        return new Response("ID não fornecido", { status: 400 });
    }

    try {
        const stmt = env.DB.prepare("DELETE FROM canais_venda WHERE id = ? AND id_usuario = ?").bind(id, usuarioId);
        await stmt.run();

        return new Response(JSON.stringify({ sucesso: true }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e: any) {
        return new Response(`Erro ao excluir canal de venda: ${e.message}`, { status: 500 });
    }
};
