/// <reference types="@cloudflare/workers-types" />

/**
 * API de Insumos - Cloudflare Pages Functions
 * Gerencia Fitas, Colas, Limpeza e Acabamento no D1.
 */

interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { env, request } = context;
    const usuarioId = request.headers.get("x-usuario-id");

    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    try {
        const { results: insumos } = await env.DB.prepare(
            "SELECT * FROM insumos WHERE id_usuario = ? ORDER BY nome ASC"
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
                historico: historico
            };
        }));

        return new Response(JSON.stringify(insumosComHistorico), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (erro: any) {
        return new Response(JSON.stringify({ erro: erro.message }), { status: 500 });
    }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { env, request } = context;
    const usuarioId = request.headers.get("x-usuario-id");
    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    const dados = await request.json() as any;
    const id = dados.id || crypto.randomUUID();

    try {
        await env.DB.prepare(`
            INSERT INTO insumos (
                id, id_usuario, nome, descricao, categoria, unidade_medida, 
                quantidade_atual, quantidade_minima, custo_medio_unidade,
                link_compra, marca, item_fracionavel, rendimento_total, unidade_consumo,
                data_criacao
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            id, 
            usuarioId, 
            dados.nome || 'Sem Nome', 
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
            new Date().toISOString()
        ).run();

        return new Response(JSON.stringify({ id, sucesso: true }), { status: 201 });
    } catch (erro: any) {
        return new Response(JSON.stringify({ erro: erro.message }), { status: 500 });
    }
};

export const onRequestPatch: PagesFunction<Env> = async (context) => {
    const { env, request } = context;
    const usuarioId = request.headers.get("x-usuario-id");
    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    const dados = await request.json() as any;

    try {
        // Registrar movimentação se houver
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

        // Atualizar insumo principal
        await env.DB.prepare(`
            UPDATE insumos SET 
                quantidade_atual = ?,
                custo_medio_unidade = ?,
                data_atualizacao = datetime('now')
            WHERE id = ? AND id_usuario = ?
        `).bind(
            dados.quantidadeAtual, dados.custoMedioUnidade, dados.id, usuarioId
        ).run();

        return new Response(JSON.stringify({ sucesso: true }));
    } catch (erro: any) {
        return new Response(JSON.stringify({ erro: erro.message }), { status: 500 });
    }
};
