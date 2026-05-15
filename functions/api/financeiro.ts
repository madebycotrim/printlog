/// <reference types="@cloudflare/workers-types" />
import { criptografar, descriptografar } from "./utilitarios/criptografia";

/**
 * API Financeira - v6.0 Blindagem Total (AES-GCM)
 * Protege descrições e categorias contra vazamentos de dados de negócio.
 */

interface Env {
    DB: D1Database;
    ENCRYPTION_KEY: string;
}

export const onRequest: PagesFunction<Env, any, { uid: string }> = async (context) => {
    const { env, request, data } = context;
    const usuarioId = data.uid;
    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const metodo = request.method;
    const chaveMestra = env.ENCRYPTION_KEY || "chave-temporaria-printlog-2026";

    try {
        // ── GET - Listar (Com Descriptografia) ──
        if (metodo === "GET") {
            const { results: lancamentos } = await env.DB.prepare(
                "SELECT * FROM lancamentos_financeiros WHERE id_usuario = ? AND arquivado = 0"
            ).bind(usuarioId).all();

            const processados = await Promise.all(lancamentos.map(async (l: any) => {
                return {
                    ...l,
                    descricao: await descriptografar(l.descricao, chaveMestra) || l.descricao,
                    categoria: l.categoria ? (await descriptografar(l.categoria, chaveMestra) || l.categoria) : 'Geral',
                };
            }));

            // Ordena por data decrescente
            processados.sort((a, b) => new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime());

            return new Response(JSON.stringify(processados), { headers: { "Content-Type": "application/json" } });
        }

        // ── POST - Registrar (Com Criptografia) ──
        if (metodo === "POST") {
            const dados = await request.json() as any;
            const novoId = dados.id || crypto.randomUUID();

            const [descCripto, catCripto] = await Promise.all([
                criptografar(dados.descricao, chaveMestra),
                criptografar(dados.categoria || 'Geral', chaveMestra)
            ]);

            await env.DB.prepare(`
                INSERT INTO lancamentos_financeiros (
                    id, id_usuario, id_pedido, id_cliente, tipo, 
                    valor_centavos, descricao, categoria, arquivado, data_criacao
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
            `).bind(
                novoId, usuarioId, dados.idPedido || dados.idReferencia || null, dados.idCliente || null,
                dados.tipo, Math.abs(dados.valorCentavos), 
                descCripto, catCripto,
                dados.data || new Date().toISOString()
            ).run();

            return new Response(JSON.stringify({ id: novoId, sucesso: true }), { 
                status: 201,
                headers: { "Content-Type": "application/json" } 
            });
        }

        // ── PATCH - Atualizar (Com Criptografia) ──
        if (metodo === "PATCH" || metodo === "PUT") {
            const dados = await request.json() as any;
            if (!dados.id) return new Response(JSON.stringify({ erro: "ID necessário" }), { status: 400 });

            const descCripto = dados.descricao ? await criptografar(dados.descricao, chaveMestra) : undefined;
            const catCripto = dados.categoria ? await criptografar(dados.categoria, chaveMestra) : undefined;

            await env.DB.prepare(`
                UPDATE lancamentos_financeiros SET 
                    descricao = COALESCE(?, descricao),
                    valor_centavos = COALESCE(?, valor_centavos),
                    categoria = COALESCE(?, categoria),
                    id_cliente = COALESCE(?, id_cliente),
                    data_criacao = COALESCE(?, data_criacao)
                WHERE id = ? AND id_usuario = ?
            `).bind(
                descCripto ?? null,
                dados.valorCentavos ?? null,
                catCripto ?? null,
                dados.idCliente ?? null,
                dados.dataCriacao ?? null,
                dados.id,
                usuarioId
            ).run();

            return new Response(JSON.stringify({ sucesso: true }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // ── DELETE ──
        if (metodo === "DELETE") {
            await env.DB.prepare("DELETE FROM lancamentos_financeiros WHERE id = ? AND id_usuario = ?")
                .bind(id, usuarioId).run();
            return new Response(JSON.stringify({ sucesso: true }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response("Método não permitido", { status: 405 });
    } catch (erro: any) {
        return new Response(JSON.stringify({ erro: "Erro ao processar finanças protegidas." }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
