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
export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { env, request } = context;
    const usuarioId = request.headers.get("x-usuario-id");
    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    try {
        const { results: materiais } = await env.DB.prepare(
            "SELECT * FROM materiais WHERE id_usuario = ? AND arquivado = 0 ORDER BY data_criacao DESC"
        ).bind(usuarioId).all();

        const materiaisComHistorico = await Promise.all(materiais.map(async (m: any) => {
            const { results: historico } = await env.DB.prepare(
                "SELECT * FROM historico_uso_materiais WHERE id_material = ? AND id_usuario = ? ORDER BY data DESC"
            ).bind(m.id, usuarioId).all();
            
            return {
                ...m,
                estoque: m.estoque_unidades,
                arquivado: m.arquivado === 1,
                historicoUso: historico || []
            };
        }));

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
export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { env, request } = context;
    const usuarioId = request.headers.get("x-usuario-id");
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
export const onRequestPatch: PagesFunction<Env> = async (context) => {
    const { env, request } = context;
    const usuarioId = request.headers.get("x-usuario-id");
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
export const onRequestDelete: PagesFunction<Env> = async (context) => {
    const { env, request } = context;
    const usuarioId = request.headers.get("x-usuario-id");
    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) return new Response("ID não informado", { status: 400 });

    try {
        // Soft Delete: Mantém o registro mas marca como arquivado
        await env.DB.prepare(
            "UPDATE materiais SET arquivado = 1 WHERE id = ? AND id_usuario = ?"
        ).bind(id, usuarioId).run();

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
