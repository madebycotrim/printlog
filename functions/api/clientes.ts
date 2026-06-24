/// <reference types="@cloudflare/workers-types" />
import { criptografar, descriptografar } from "./utilitarios/criptografia";
import { z } from "zod";

/**
 * API de Clientes - v4.0 Blindagem Total (AES-GCM) com Validação Zod
 * Protege PII (Nome, E-mail, Telefone, Notas) contra vazamentos.
 */

interface Env {
    DB: D1Database;
    ENCRYPTION_KEY: string;
}

const ZodClienteCriar = z.object({
    nome: z.string().min(1, "O nome do cliente é obrigatório"),
    email: z.string().email("E-mail inválido").nullable().optional().or(z.literal("")),
    telefone: z.string().nullable().optional(),
    observacoesCRM: z.string().nullable().optional(),
    tipo: z.string().optional(),
    fiel: z.boolean().optional()
});

const ZodClienteAtualizar = ZodClienteCriar.partial().extend({
    id: z.string().min(1, "O ID do cliente é obrigatório")
});

export const onRequest: PagesFunction<Env, any, { uid: string }> = async (context) => {
    const { env, request, data } = context;
    const usuarioId = data.uid;
    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const metodo = request.method;
    const chaveMestra = env.ENCRYPTION_KEY || "chave-temporaria-printlog-2026";

    try {
        // Migração automática (garante que as colunas existem no SQLite local)
        await env.DB.prepare(`ALTER TABLE clientes ADD COLUMN ltv_centavos INTEGER DEFAULT 0`).run().catch(() => {});
        await env.DB.prepare(`ALTER TABLE clientes ADD COLUMN total_produtos INTEGER DEFAULT 0`).run().catch(() => {});
        await env.DB.prepare(`ALTER TABLE clientes ADD COLUMN historico TEXT DEFAULT '[]'`).run().catch(() => {});
        await env.DB.prepare(`ALTER TABLE clientes ADD COLUMN tipo TEXT DEFAULT 'B2C'`).run().catch(() => {});
        await env.DB.prepare(`ALTER TABLE clientes ADD COLUMN fiel INTEGER DEFAULT 0`).run().catch(() => {});
        
        // ── BUSCAR (Com Descriptografia On-the-fly) ──
        if (metodo === "GET") {
            const { results } = await env.DB.prepare(
                "SELECT * FROM clientes WHERE id_usuario = ? AND arquivado = 0"
            ).bind(usuarioId).all();

            // Descriptografa os dados sensíveis antes de enviar para a UI
            const clientesProtegidos = await Promise.all(results.map(async (c: any) => {
                return {
                    ...c,
                    tipo: c.tipo || "B2C",
                    fiel: c.fiel === 1,
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
            const corpoRaw = await request.json();
            const dados = ZodClienteCriar.parse(corpoRaw) as any;
            const novoId = (corpoRaw as any).id || crypto.randomUUID();

            // Criptografa PII antes da persistência
            const [nomeCripto, emailCripto, telCripto, notasCripto] = await Promise.all([
                criptografar(dados.nome || 'Sem Nome', chaveMestra),
                dados.email ? criptografar(dados.email, chaveMestra) : Promise.resolve(null),
                dados.telefone ? criptografar(dados.telefone, chaveMestra) : Promise.resolve(null),
                dados.observacoesCRM ? criptografar(dados.observacoesCRM, chaveMestra) : Promise.resolve(''),
            ]);

            await env.DB.prepare(`
                INSERT INTO clientes (
                    id, id_usuario, nome, email, telefone, observacoes_crm, arquivado, data_criacao, ltv_centavos, total_produtos, historico, tipo, fiel
                ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, 0, 0, '[]', ?, ?)
            `).bind(
                novoId, 
                usuarioId, 
                nomeCripto, 
                emailCripto, 
                telCripto,
                notasCripto,
                new Date().toISOString(),
                dados.tipo || 'B2C',
                dados.fiel ? 1 : 0
            ).run();

            return new Response(JSON.stringify({ id: novoId, sucesso: true }), { 
                status: 201,
                headers: { "Content-Type": "application/json" }
            });
        }

        // ── ATUALIZAR (Com Criptografia) ──
        if (metodo === "PATCH" || metodo === "PUT") {
            const corpoRaw = await request.json();
            const dados = ZodClienteAtualizar.parse(corpoRaw) as any;
            
            // Prepara dados para atualização seletiva com criptografia
            const nomeCripto = dados.nome ? await criptografar(dados.nome, chaveMestra) : undefined;
            const emailCripto = dados.email !== undefined ? await criptografar(dados.email, chaveMestra) : undefined;
            const telCripto = dados.telefone !== undefined ? await criptografar(dados.telefone, chaveMestra) : undefined;
            const notasCripto = dados.observacoesCRM !== undefined ? await criptografar(dados.observacoesCRM, chaveMestra) : undefined;

            let historicoStr = null;
            if ((corpoRaw as any).historico !== undefined && (corpoRaw as any).historico !== null) {
                historicoStr = typeof (corpoRaw as any).historico === "string" ? (corpoRaw as any).historico : JSON.stringify((corpoRaw as any).historico);
            }

            await env.DB.prepare(`
                UPDATE clientes SET 
                    nome = COALESCE(?, nome), 
                    email = COALESCE(?, email), 
                    telefone = COALESCE(?, telefone), 
                    observacoes_crm = COALESCE(?, observacoes_crm),
                    ltv_centavos = COALESCE(?, ltv_centavos),
                    total_produtos = COALESCE(?, total_produtos),
                    historico = COALESCE(?, historico),
                    tipo = COALESCE(?, tipo),
                    fiel = COALESCE(?, fiel)
                WHERE id = ? AND id_usuario = ?
            `).bind(
                nomeCripto ?? null, 
                emailCripto ?? null, 
                telCripto ?? null,
                notasCripto ?? null,
                (corpoRaw as any).ltvCentavos ?? null,
                (corpoRaw as any).totalProdutos ?? null,
                historicoStr ?? null,
                dados.tipo ?? null,
                dados.fiel !== undefined ? (dados.fiel ? 1 : 0) : null,
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
        if (erro instanceof z.ZodError) {
            const mensagens = erro.errors.map(e => e.message).join(", ");
            return new Response(JSON.stringify({ 
                sucesso: false, 
                mensagem: `Erro de validação: ${mensagens}` 
            }), { 
                status: 400, 
                headers: { "Content-Type": "application/json" } 
            });
        }
        console.error("[Clientes API Error]:", erro);
        return new Response(JSON.stringify({ 
            sucesso: false,
            mensagem: "Ocorreu um erro interno no servidor ao processar os clientes."
        }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
