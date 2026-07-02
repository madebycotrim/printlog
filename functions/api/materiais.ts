/// <reference types="@cloudflare/workers-types" />

/**
 * API de Materiais - Cloudflare Pages Functions (v6.0 Definitive)
 */

interface Env {
    DB: D1Database;
}

/**
 * BUSCAR MATERIAIS
 */
export const onRequestGet: PagesFunction<Env, any, { uid: string }> = async (context) => {
    const { env, request, data } = context;

    // Obtido com segurança via Middleware JWT
    const usuarioId = data.uid;
    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    const url = new URL(request.url);
    const limit = url.searchParams.get("limit");
    const offset = url.searchParams.get("offset");
    const search = url.searchParams.get("search");

    let query = "SELECT * FROM materiais WHERE id_usuario = ? AND arquivado = 0";
    const bindParams: any[] = [usuarioId];

    if (search) {
        query += " AND (nome LIKE ? OR fabricante LIKE ?)";
        bindParams.push(`%${search}%`, `%${search}%`);
    }

    query += " ORDER BY data_criacao DESC";

    if (limit) {
        query += " LIMIT ?";
        bindParams.push(parseInt(limit, 10));
        
        if (offset) {
            query += " OFFSET ?";
            bindParams.push(parseInt(offset, 10));
        }
    }

    try {
        const stmt = env.DB.prepare(query).bind(...bindParams);
        const { results: materiais } = await stmt.all();

        const materiaisComHistorico = await Promise.all(materiais.map(async (m: any) => {
            const { results: historico } = await env.DB.prepare(
                "SELECT * FROM historico_uso_materiais WHERE id_material = ? AND id_usuario = ? ORDER BY data DESC LIMIT 10"
            ).bind(m.id, usuarioId).all();
            
            return {
                ...m,
                estoque: m.estoque_unidades,
                arquivado: m.arquivado === 1,
                historicoUso: historico || []
            };
        }));

        if (limit) {
            let countQuery = "SELECT COUNT(*) as total FROM materiais WHERE id_usuario = ? AND arquivado = 0";
            const countBindParams: any[] = [usuarioId];
            if (search) {
                countQuery += " AND (nome LIKE ? OR fabricante LIKE ?)";
                countBindParams.push(`%${search}%`, `%${search}%`);
            }
            
            const countResult = await env.DB.prepare(countQuery).bind(...countBindParams).first();
            const total = countResult ? (countResult.total as number) : 0;

            return new Response(JSON.stringify({ items: materiaisComHistorico, total }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify(materiaisComHistorico), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (erro: any) {
        return new Response(JSON.stringify({ erro: erro.message }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};

/**
 * CRIAR MATERIAL (POST)
 */
export const onRequestPost: PagesFunction<Env, any, { uid: string }> = async (context) => {
    const { env, request, data } = context;
    const usuarioId = data.uid;
    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    try {
        const dados = await request.json() as any;
        const id = dados.id || crypto.randomUUID();

        await env.DB.prepare(`
            INSERT INTO materiais (
                id, id_usuario, tipo, nome, tipo_material, fabricante,
                cor, preco_centavos, peso_gramas, estoque_unidades, peso_restante_gramas, arquivado,
                data_criacao
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
            ON CONFLICT(id) DO UPDATE SET
                tipo = excluded.tipo,
                nome = excluded.nome,
                tipo_material = excluded.tipo_material,
                fabricante = excluded.fabricante,
                cor = excluded.cor,
                preco_centavos = excluded.preco_centavos,
                peso_gramas = excluded.peso_gramas,
                estoque_unidades = excluded.estoque_unidades,
                peso_restante_gramas = excluded.peso_restante_gramas,
                arquivado = excluded.arquivado
        `).bind(
            id, 
            usuarioId, 
            dados.tipo, 
            dados.nome, 
            dados.tipoMaterial, 
            dados.fabricante || '',
            dados.cor || '', 
            dados.precoCentavos || 0, 
            dados.pesoGramas || 0, 
            dados.estoque || 0, 
            dados.pesoRestanteGramas || 0,
            new Date().toISOString()
        ).run();

        return new Response(JSON.stringify({ id, sucesso: true }), { 
            status: 201,
            headers: { "Content-Type": "application/json" }
        });
    } catch (erro: any) {
        return new Response(JSON.stringify({ erro: erro.message }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};

/**
 * ATUALIZAR MATERIAL (PATCH)
 */
export const onRequestPatch: PagesFunction<Env, any, { uid: string }> = async (context) => {
    const { env, request, data } = context;
    const usuarioId = data.uid;
    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    try {
        const dados = await request.json() as any;

        if (dados.registroUso) {
            const reg = dados.registroUso;
            await env.DB.prepare(`
                INSERT INTO historico_uso_materiais (
                    id, id_material, id_usuario, data, nome_peca, 
                    quantidade_gasta_gramas, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `).bind(
                crypto.randomUUID(), dados.id, usuarioId, reg.data, reg.nomePeca,
                reg.quantidadeGastaGramas, reg.status
            ).run();
        }

        await env.DB.prepare(`
            UPDATE materiais SET 
                estoque_unidades = ?,
                peso_restante_gramas = ?,
                preco_centavos = ?
            WHERE id = ? AND id_usuario = ?
        `).bind(
            dados.estoque, dados.pesoRestanteGramas, dados.precoCentavos, 
            dados.id, usuarioId
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

/**
 * EXCLUIR MATERIAL (DELETE)
 */
export const onRequestDelete: PagesFunction<Env, any, { uid: string }> = async (context) => {
    const { env, request, data } = context;
    const usuarioId = data.uid;
    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) return new Response("ID não informado", { status: 400 });

    try {
        // Hard Delete: Remove o material e também seu histórico para limpar o banco
        await env.DB.batch([
            env.DB.prepare("DELETE FROM materiais WHERE id = ? AND id_usuario = ?").bind(id, usuarioId),
            env.DB.prepare("DELETE FROM historico_uso_materiais WHERE id_material = ? AND id_usuario = ?").bind(id, usuarioId)
        ]);

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
