/// <reference types="@cloudflare/workers-types" />

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
        if (metodo === "GET") {
            const { results: impressoras } = await env.DB.prepare(
                "SELECT * FROM impressoras WHERE id_usuario = ? ORDER BY nome ASC"
            ).bind(usuarioId).all();
            return new Response(JSON.stringify(impressoras), { headers: { "Content-Type": "application/json" } });
        }

        if (metodo === "POST") {
            const dados = await request.json() as any;
            const novoId = dados.id || crypto.randomUUID();
            await env.DB.prepare(`
                INSERT INTO impressoras (
                    id, id_usuario, nome, tecnologia, status, 
                    taxa_hora_centavos, horimetro_total_minutos,
                    intervalo_revisao_minutos, valor_compra_centavos,
                    observacoes, data_criacao
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                novoId, usuarioId, dados.nome, dados.tecnologia || 'FDM', 
                dados.status || 'livre', dados.taxaHoraCentavos || 0,
                dados.horimetroTotalMinutos || 0, 
                dados.intervaloRevisaoMinutos || 30000,
                dados.valorCompraCentavos || 0,
                dados.observacoes || '',
                new Date().toISOString()
            ).run();
            return new Response(JSON.stringify({ id: novoId, sucesso: true }), { status: 201 });
        }

        if (metodo === "PATCH" || metodo === "PUT") {
            const dados = await request.json() as any;
            await env.DB.prepare(`
                UPDATE impressoras SET 
                    nome = ?, tecnologia = ?, status = ?, 
                    taxa_hora_centavos = ?, horimetro_total_minutos = ?,
                    intervalo_revisao_minutos = ?, valor_compra_centavos = ?,
                    observacoes = ?, data_aposentadoria = ?
                WHERE id = ? AND id_usuario = ?
            `).bind(
                dados.nome, dados.tecnologia, dados.status,
                dados.taxaHoraCentavos, dados.horimetroTotalMinutos,
                dados.intervaloRevisaoMinutos, dados.valorCompraCentavos,
                dados.observacoes, dados.dataAposentadoria,
                dados.id, usuarioId
            ).run();
            return new Response(JSON.stringify({ sucesso: true }));
        }

        if (metodo === "DELETE") {
            if (!id) return new Response("ID não fornecido", { status: 400 });
            await env.DB.prepare(
                "DELETE FROM impressoras WHERE id = ? AND id_usuario = ?"
            ).bind(id, usuarioId).run();
            return new Response(JSON.stringify({ sucesso: true }));
        }

        return new Response("Método não permitido", { status: 405 });
    } catch (erro: any) {
        return new Response(JSON.stringify({ erro: erro.message }), { status: 500 });
    }
};
