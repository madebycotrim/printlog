/// <reference types="@cloudflare/workers-types" />
import { criptografar, descriptografar } from "./utilitarios/criptografia";

/**
 * API de Clientes - v4.0 Blindagem Total (AES-GCM)
 * Protege PII (Nome, E-mail, Telefone, Notas) contra vazamentos.
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
        // ── BUSCAR (Com Descriptografia On-the-fly) ──
        if (metodo === "GET") {
            const { results } = await env.DB.prepare(
                "SELECT * FROM clientes WHERE id_usuario = ? AND arquivado = 0"
            ).bind(usuarioId).all();

            // Descriptografa os dados sensíveis antes de enviar para a UI
            const clientesProtegidos = await Promise.all(results.map(async (c: any) => {
                return {
                    ...c,
                    nome: await descriptografar(c.nome, chaveMestra) || c.nome,
                    email: c.email ? await descriptografar(c.email, chaveMestra) : null,
                    telefone: c.telefone ? await descriptografar(c.telefone, chaveMestra) : null,
                    observacoesCRM: c.observacoes_crm ? await descriptografar(c.observacoes_crm, chaveMestra) : null,
                };
            }));

            // Ordenação manual (já que o banco não consegue ordenar dado criptografado)
            clientesProtegidos.sort((a, b) => a.nome.localeCompare(b.nome));

            return new Response(JSON.stringify(clientesProtegidos), { 
                headers: { "Content-Type": "application/json" } 
            });
        }

        // ── CRIAR (Com Criptografia) ──
        if (metodo === "POST") {
            const dados = await request.json() as any;
            const novoId = dados.id || crypto.randomUUID();

            // Criptografa PII antes da persistência
            const [nomeCripto, emailCripto, telCripto, notasCripto] = await Promise.all([
                criptografar(dados.nome || 'Sem Nome', chaveMestra),
                dados.email ? criptografar(dados.email, chaveMestra) : Promise.resolve(null),
                dados.telefone ? criptografar(dados.telefone, chaveMestra) : Promise.resolve(null),
                dados.observacoesCRM ? criptografar(dados.observacoesCRM, chaveMestra) : Promise.resolve(''),
            ]);

            await env.DB.prepare(`
                INSERT INTO clientes (
                    id, id_usuario, nome, email, telefone, observacoes_crm, arquivado, data_criacao, ltv_centavos, total_produtos, historico
                ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, 0, 0, '[]')
            `).bind(
                novoId, 
                usuarioId, 
                nomeCripto, 
                emailCripto, 
                telCripto,
                notasCripto,
                new Date().toISOString()
            ).run();

            return new Response(JSON.stringify({ id: novoId, sucesso: true }), { 
                status: 201,
                headers: { "Content-Type": "application/json" }
            });
        }

        // ── ATUALIZAR (Com Criptografia) ──
        if (metodo === "PATCH" || metodo === "PUT") {
            const dados = await request.json() as any;
            
            // Prepara dados para atualização seletiva com criptografia
            const nomeCripto = dados.nome ? await criptografar(dados.nome, chaveMestra) : undefined;
            const emailCripto = dados.email !== undefined ? await criptografar(dados.email, chaveMestra) : undefined;
            const telCripto = dados.telefone !== undefined ? await criptografar(dados.telefone, chaveMestra) : undefined;
            const notasCripto = dados.observacoesCRM !== undefined ? await criptografar(dados.observacoesCRM, chaveMestra) : undefined;

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
                nomeCripto ?? null, 
                emailCripto ?? null, 
                telCripto ?? null,
                notasCripto ?? null,
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

        // ── EXCLUIR ──
        if (metodo === "DELETE") {
            if (!id) return new Response("ID não fornecido", { status: 400 });
            await env.DB.prepare("DELETE FROM clientes WHERE id = ? AND id_usuario = ?")
                .bind(id, usuarioId).run();
            return new Response(JSON.stringify({ sucesso: true }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response("Método não permitido", { status: 405 });
    } catch (erro: any) {
        console.error("[Clientes API Error]:", erro);
        return new Response(JSON.stringify({ 
            sucesso: false,
            mensagem: String(erro?.stack || erro?.message || JSON.stringify(erro) || "Erro Desconhecido")
        }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
