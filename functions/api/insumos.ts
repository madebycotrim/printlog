/// <reference types="@cloudflare/workers-types" />

/**
 * API de Insumos - Cloudflare Pages Functions (v7.0 Soft Delete)
 */

interface Env {
    DB: D1Database;
}

/**
 * BUSCAR INSUMOS (Apenas Ativos)
 */
export const onRequest: PagesFunction<Env, any, { uid: string }> = async (context) => {
    const { env, data } = context;

    // Obtido com segurança via Middleware JWT
    const usuarioId = data.uid;
    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    try {
        const { results: insumos } = await env.DB.prepare(
            "SELECT * FROM insumos WHERE id_usuario = ? AND arquivado = 0 ORDER BY nome ASC"
        ).bind(usuarioId).all();

        const insumosComHistorico = await Promise.all(insumos.map(async (i: any) => {
            const { results: historico } = await env.DB.prepare(
                "SELECT * FROM movimentacoes_insumo WHERE insumo_id = ? AND id_usuario = ? ORDER BY data DESC"
            ).bind(i.id, usuarioId).all();

            return {
                ...i,
                itemFracionavel: i.item_fracionavel === 1,
                custoMedioUnidade: i.custo_medio_unidade,
                quantidadeAtual: i.quantidade_atual,
                quantidadeMinima: i.quantidade_minima,
                unidadeMedida: i.unidade_medida,
                unidadeConsumo: i.unidade_consumo,
                arquivado: i.arquivado === 1,
                historico: historico || []
            };
        }));

        return new Response(JSON.stringify(insumosComHistorico), {
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
 * CRIAR INSUMO (POST)
 */
export const onRequestPost: PagesFunction<Env, any, { uid: string }> = async (context) => {
    const { env, request, data } = context;
    const usuarioId = data.uid;
    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    try {
        const dados = await request.json() as any;
        const id = dados.id || crypto.randomUUID();

        await env.DB.prepare(`
            INSERT INTO insumos (
                id, id_usuario, nome, descricao, categoria, unidade_medida, 
                quantidade_atual, quantidade_minima, custo_medio_unidade,
                link_compra, marca, item_fracionavel, rendimento_total, unidade_consumo,
                arquivado, data_criacao, icone
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                nome = excluded.nome,
                descricao = excluded.descricao,
                categoria = excluded.categoria,
                unidade_medida = excluded.unidade_medida,
                quantidade_atual = excluded.quantidade_atual,
                quantidade_minima = excluded.quantidade_minima,
                custo_medio_unidade = excluded.custo_medio_unidade,
                link_compra = excluded.link_compra,
                marca = excluded.marca,
                item_fracionavel = excluded.item_fracionavel,
                rendimento_total = excluded.rendimento_total,
                unidade_consumo = excluded.unidade_consumo,
                icone = excluded.icone,
                arquivado = excluded.arquivado
        `).bind(
            id, 
            usuarioId, 
            dados.nome || 'Novo Insumo', 
            dados.descricao || '', 
            dados.categoria || 'Geral', 
            dados.unidadeMedida || 'un',
            dados.quantidadeAtual || 0, 
            dados.quantidadeMinima || 0, 
            dados.custoMedioUnidade || 0,
            dados.linkCompra || '', 
            dados.marca || '', 
            dados.itemFracionavel ? 1 : 0, 
            dados.rendimentoTotal || null, 
            dados.unidadeConsumo || null,
            new Date().toISOString(),
            dados.icone || null
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
 * ATUALIZAR INSUMO (PATCH)
 */
export const onRequestPatch: PagesFunction<Env, any, { uid: string }> = async (context) => {
    const { env, request, data } = context;
    const usuarioId = data.uid;
    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    try {
        const dados = await request.json() as any;

        if (dados.movimentacao) {
            const m = dados.movimentacao;
            await env.DB.prepare(`
                INSERT INTO movimentacoes_insumo (
                    id, insumo_id, id_usuario, data, tipo, 
                    quantidade, valor_total, motivo, observacao
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                crypto.randomUUID(), dados.id, usuarioId, m.data, m.tipo,
                m.quantidade, m.valorTotal, m.motivo, m.observacao
            ).run();
        }

        await env.DB.prepare(`
            UPDATE insumos SET 
                quantidade_atual = ?,
                custo_medio_unidade = ?,
                data_atualizacao = datetime('now')
            WHERE id = ? AND id_usuario = ?
        `).bind(
            dados.quantidadeAtual, dados.custoMedioUnidade, dados.id, usuarioId
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
 * ARQUIVAR INSUMO (DELETE como SOFT DELETE)
 */
export const onRequestDelete: PagesFunction<Env, any, { uid: string }> = async (context) => {
    const { env, request, data } = context;
    const usuarioId = data.uid;
    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) return new Response("ID não informado", { status: 400 });

    try {
        // Hard Delete: Remove o insumo e todas as suas movimentações vinculadas
        await env.DB.batch([
            env.DB.prepare("DELETE FROM insumos WHERE id = ? AND id_usuario = ?").bind(id, usuarioId),
            env.DB.prepare("DELETE FROM movimentacoes_insumo WHERE insumo_id = ? AND id_usuario = ?").bind(id, usuarioId)
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
