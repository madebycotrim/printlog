/// <reference types="@cloudflare/workers-types" />

/**
 * API de Clientes - Cloudflare Pages Functions (v3.0 Soft Delete)
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
        // BUSCAR (Apenas não arquivados)
        if (metodo === "GET") {
            const { results: clientes } = await env.DB.prepare(
                "SELECT * FROM clientes WHERE id_usuario = ? AND arquivado = 0 ORDER BY nome ASC"
            ).bind(usuarioId).all();
            return new Response(JSON.stringify(clientes), { headers: { "Content-Type": "application/json" } });
        }

        // CRIAR
        if (metodo === "POST") {
            const dados = await request.json() as any;
            const novoId = dados.id || crypto.randomUUID();
            await env.DB.prepare(`
                INSERT INTO clientes (
                    id, id_usuario, nome, email, telefone, observacoes_crm, arquivado, data_criacao, ltv_centavos, total_produtos, historico
                ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, 0, 0, '[]')
            `).bind(
                novoId, 
                usuarioId, 
                dados.nome || 'Sem Nome', 
                dados.email || null, 
                dados.telefone || null,
                dados.observacoesCRM || '',
                new Date().toISOString()
            ).run();
            return new Response(JSON.stringify({ id: novoId, sucesso: true }), { 
                status: 201,
                headers: { "Content-Type": "application/json" }
            });
        }

        // ATUALIZAR
        if (metodo === "PATCH" || metodo === "PUT") {
            const dados = await request.json() as any;
            
            // Garantir que historico seja string e não undefined
            let historicoStr = null;
            if (dados.historico !== undefined && dados.historico !== null) {
                historicoStr = typeof dados.historico === "string" ? dados.historico : JSON.stringify(dados.historico);
            }

            await env.DB.prepare(`
                UPDATE clientes SET 
                    nome = COALESCE(?, nome), 
                    email = COALESCE(?, email), 
                    telefone = COALESCE(?, telefone), 
                    observacoes_crm = COALESCE(?, observacoes_crm),
                    ltv_centavos = COALESCE(?, ltv_centavos),
                    total_produtos = COALESCE(?, total_produtos),
                    historico = COALESCE(?, historico)
                WHERE id = ? AND id_usuario = ?
            `).bind(
                dados.nome ?? null, 
                dados.email ?? null, 
                dados.telefone ?? null,
                dados.observacoesCRM ?? null,
                dados.ltvCentavos ?? null,
                dados.totalProdutos ?? null,
                historicoStr ?? null,
                dados.id ?? null, 
                usuarioId ?? null
            ).run();
            return new Response(JSON.stringify({ sucesso: true }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // EXCLUIR (SOFT DELETE)
        if (metodo === "DELETE") {
            if (!id) return new Response("ID não fornecido", { status: 400 });
            await env.DB.prepare(
                "UPDATE clientes SET arquivado = 1 WHERE id = ? AND id_usuario = ?"
            ).bind(id, usuarioId).run();
            return new Response(JSON.stringify({ sucesso: true }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response("Método não permitido", { status: 405 });
    } catch (erro: any) {
        console.error("[Clientes API Error]:", erro);
        return new Response(JSON.stringify({ 
            sucesso: false,
            mensagem: erro.message || "Erro inesperado no servidor." 
        }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
