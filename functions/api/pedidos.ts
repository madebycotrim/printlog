/// <reference types="@cloudflare/workers-types" />
import { criptografar, descriptografar, obterChaveMestra } from "./utilitarios/criptografia";
import { z } from "zod";

/**
 * API de Pedidos - v6.0 Blindagem Total (AES-GCM) com Validação Zod
 * Protege detalhes dos projetos e observações contra vazamentos.
 */

interface Env {
    DB: D1Database;
    ENCRYPTION_KEY: string;
    ENVIRONMENT?: string;
}

const ZodPedidoCriar = z.object({
    idCliente: z.string().trim().max(100).nullable().optional(),
    id_cliente: z.string().trim().max(100).nullable().optional(),
    idImpressora: z.string().trim().max(100).nullable().optional(),
    id_impressora: z.string().trim().max(100).nullable().optional(),
    descricao: z.string().trim().min(1, "A descrição não pode ser vazia").max(500, "A descrição não pode exceder 500 caracteres"),
    valorCentavos: z.number().int("O valor deve ser um número inteiro em centavos").min(0).max(100_000_000).optional(),
    valor_centavos: z.number().int("O valor deve ser um número inteiro em centavos").min(0).max(100_000_000).optional(),
    status: z.string().trim().max(50).optional(),
    dataCriacao: z.string().max(50).optional(),
    data_criacao: z.string().max(50).optional(),
    dados_extras: z.string().max(50000).optional()
});

const ZodPedidoAtualizar = ZodPedidoCriar.partial().extend({
    id: z.string().min(1, "O ID do pedido é obrigatório")
});

export const onRequest: PagesFunction<Env, any, { uid: string }> = async (context) => {
    const { env, request, data } = context;
    const usuarioId = data.uid;
    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const metodo = request.method;
    const chaveMestra = obterChaveMestra(env);

    // ── Helper para limpar e padronizar IDs ──
    const limparId = (val: any): string | null => {
        if (val === undefined || val === null) return null;
        const str = String(val).trim();
        if (
            str === "" || 
            str === "null" || 
            str === "undefined" || 
            str === "0" || 
            str === "NaN" || 
            str === "none" ||
            str === "sem_cliente" ||
            str === "false"
        ) {
            return null;
        }
        return str;
    };

    // ── Helpers para validar existência no D1 antes de persistir (Evita SQLITE_CONSTRAINT_FOREIGNKEY) ──
    const validarClienteExiste = async (idCliente: string | null): Promise<string | null> => {
        if (!idCliente) return null;
        try {
            const row = await env.DB.prepare(
                "SELECT id FROM clientes WHERE id = ? AND id_usuario = ?"
            ).bind(idCliente, usuarioId).first();
            return row ? idCliente : null;
        } catch (e) {
            console.warn("[pedidos] Erro ao verificar FK de cliente:", e);
            return null;
        }
    };

    const validarImpressoraExiste = async (idImpressora: string | null): Promise<string | null> => {
        if (!idImpressora) return null;
        try {
            const row = await env.DB.prepare(
                "SELECT id FROM impressoras WHERE id = ? AND id_usuario = ?"
            ).bind(idImpressora, usuarioId).first();
            return row ? idImpressora : null;
        } catch (e) {
            console.warn("[pedidos] Erro ao verificar FK de impressora:", e);
            return null;
        }
    };

    // ── Helper para atualizar LTV do Cliente ──
    const atualizarMetricasCliente = async (idCliente: string | null | undefined) => {
        if (!idCliente || idCliente === "null" || idCliente === "0" || idCliente === "undefined") return;
        try {
            await env.DB.prepare(`
                UPDATE clientes 
                SET 
                    ltv_centavos = (
                        SELECT COALESCE(SUM(valor_centavos), 0) 
                        FROM pedidos_impressao 
                        WHERE id_cliente = ? AND status IN ('concluido', 'arquivado') AND arquivado = 0
                    ),
                    total_produtos = (
                        SELECT COUNT(*) 
                        FROM pedidos_impressao 
                        WHERE id_cliente = ? AND status IN ('concluido', 'arquivado') AND arquivado = 0
                    )
                WHERE id = ?
            `).bind(idCliente, idCliente, idCliente).run();
        } catch (e) {
            console.error("[pedidos] Erro ao atualizar métricas do cliente:", e);
        }
    };

    try {
        // Garantir criação da tabela e colunas necessárias (Migração robusta para D1)
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS pedidos_impressao (
                id TEXT PRIMARY KEY,
                id_usuario TEXT NOT NULL,
                id_cliente TEXT,
                id_impressora TEXT,
                descricao TEXT,
                status TEXT NOT NULL DEFAULT 'pendente',
                valor_centavos INTEGER NOT NULL DEFAULT 0,
                data_criacao TEXT,
                data_conclusao TEXT,
                dados_extras TEXT,
                arquivado INTEGER NOT NULL DEFAULT 0
            )
        `).run().catch(() => {});

        await env.DB.prepare(`ALTER TABLE pedidos_impressao ADD COLUMN id_impressora TEXT DEFAULT NULL`).run().catch(() => {});
        await env.DB.prepare(`ALTER TABLE pedidos_impressao ADD COLUMN arquivado INTEGER DEFAULT 0`).run().catch(() => {});
        await env.DB.prepare(`ALTER TABLE pedidos_impressao ADD COLUMN dados_extras TEXT DEFAULT NULL`).run().catch(() => {});
        await env.DB.prepare(`ALTER TABLE pedidos_impressao ADD COLUMN data_conclusao TEXT DEFAULT NULL`).run().catch(() => {});
        await env.DB.prepare(`ALTER TABLE pedidos_impressao ADD COLUMN valor_centavos INTEGER DEFAULT 0`).run().catch(() => {});

        // ── GET - Listar (Com Descriptografia) ──
        if (metodo === "GET") {
            const clienteId = url.searchParams.get("clienteId");
            
            let sql = "SELECT * FROM pedidos_impressao WHERE id_usuario = ? AND arquivado = 0";
            const params: any[] = [usuarioId];
            
            if (clienteId) {
                sql += " AND id_cliente = ?";
                params.push(clienteId);
            }
            
            const { results: pedidos } = await env.DB.prepare(sql).bind(...params).all();

            const processados = await Promise.all(pedidos.map(async (p: any) => {
                // Descriptografa Descrição e Dados Extras
                const descDescripto = await descriptografar(p.descricao, chaveMestra) || p.descricao;
                const extrasRaw = p.dados_extras ? await descriptografar(p.dados_extras, chaveMestra) : null;
                
                let extras = {};
                if (extrasRaw) {
                    try { extras = JSON.parse(extrasRaw); } catch (e) { /* fallback */ }
                } else if (p.dados_extras && !p.dados_extras.includes(":")) {
                    // Fallback para dados legados não criptografados
                    try { extras = JSON.parse(p.dados_extras); } catch (e) { /* fallback */ }
                }

                return { 
                    ...p, 
                    descricao: descDescripto,
                    ...extras 
                };
            }));

            processados.sort((a, b) => new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime());

            return new Response(JSON.stringify(processados), { 
                headers: { "Content-Type": "application/json" } 
            });
        }

        // ── POST - Criar (Com Criptografia e Blindagem contra SQLITE_CONSTRAINT_FOREIGNKEY) ──
        if (metodo === "POST") {
            const corpoRaw = await request.json();
            const dados = ZodPedidoCriar.parse(corpoRaw) as any;
            const novoId = (corpoRaw as any).id || crypto.randomUUID();
            
            const idClienteBruto = limparId(dados.id_cliente ?? dados.idCliente);
            const idImpressoraBruta = limparId(dados.id_impressora ?? dados.idImpressora);

            // Valida existência no D1 para não estourar FOREIGN KEY
            const id_cliente = await validarClienteExiste(idClienteBruto);
            const id_impressora = await validarImpressoraExiste(idImpressoraBruta);

            const valor_centavos = Math.round(Number(dados.valor_centavos ?? dados.valorCentavos) || 0);
            const data_criacao = dados.data_criacao ?? dados.dataCriacao ?? new Date().toISOString();

            // Monta Dados Extras preservando referências originais caso FK seja anulada
            const dadosExtras = {
                idClienteOriginal: idClienteBruto,
                idImpressoraOriginal: idImpressoraBruta,
                material: (corpoRaw as any).material ?? (corpoRaw as any).material_base,
                materiais: (corpoRaw as any).materiais ?? [],
                peso_gramas: (corpoRaw as any).peso_gramas ?? (corpoRaw as any).pesoGramas,
                tempo_minutos: (corpoRaw as any).tempo_minutos ?? (corpoRaw as any).tempoMinutos,
                observacoes: (corpoRaw as any).observacoes,
                insumos_secundarios: (corpoRaw as any).insumos_secundarios ?? (corpoRaw as any).insumosSecundarios ?? [],
                pos_processo: (corpoRaw as any).pos_processo ?? (corpoRaw as any).posProcesso ?? [],
                configuracoes: (corpoRaw as any).configuracoes ?? {}
            };

            const [descCripto, extrasCripto] = await Promise.all([
                criptografar(dados.descricao || 'Novo Projeto', chaveMestra),
                criptografar(JSON.stringify(dadosExtras), chaveMestra)
            ]);

            try {
                await env.DB.prepare(`
                    INSERT INTO pedidos_impressao (
                        id, id_usuario, id_cliente, id_impressora, descricao, 
                        status, valor_centavos, data_criacao, dados_extras, arquivado
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
                `).bind(
                    novoId, usuarioId, id_cliente, id_impressora, 
                    descCripto, dados.status ?? 'pendente', valor_centavos, 
                    data_criacao, extrasCripto
                ).run();
            } catch (insertErr: any) {
                if (insertErr?.message?.includes("FOREIGN KEY constraint failed")) {
                    console.warn("[pedidos] Foreign Key constraint interceptada no INSERT. Salvando com FKs nulas para resiliência.");
                    await env.DB.prepare(`
                        INSERT INTO pedidos_impressao (
                            id, id_usuario, id_cliente, id_impressora, descricao, 
                            status, valor_centavos, data_criacao, dados_extras, arquivado
                        ) VALUES (?, ?, NULL, NULL, ?, ?, ?, ?, ?, 0)
                    `).bind(
                        novoId, usuarioId, 
                        descCripto, dados.status ?? 'pendente', valor_centavos, 
                        data_criacao, extrasCripto
                    ).run();
                } else {
                    throw insertErr;
                }
            }

            if (id_cliente) {
                await atualizarMetricasCliente(id_cliente);
            }

            return new Response(JSON.stringify({ id: novoId, sucesso: true }), { 
                status: 201, headers: { "Content-Type": "application/json" } 
            });
        }

        // ── PATCH / PUT - Atualizar (Com Criptografia e Blindagem contra SQLITE_CONSTRAINT_FOREIGNKEY) ──
        if (metodo === "PATCH" || metodo === "PUT") {
            const corpoRaw = await request.json();
            const dados = ZodPedidoAtualizar.parse(corpoRaw) as any;

            const descCripto = dados.descricao ? await criptografar(dados.descricao, chaveMestra) : undefined;
            const extrasCripto = (corpoRaw as any).dados_extras ? await criptografar(
                typeof (corpoRaw as any).dados_extras === 'string' ? (corpoRaw as any).dados_extras : JSON.stringify((corpoRaw as any).dados_extras),
                chaveMestra
            ) : undefined;

            const temClienteDefinido = dados.idCliente !== undefined || dados.id_cliente !== undefined;
            const temImpressoraDefinida = dados.idImpressora !== undefined || dados.id_impressora !== undefined;

            const idClienteBruto = temClienteDefinido ? limparId(dados.id_cliente ?? dados.idCliente) : undefined;
            const idImpressoraBruta = temImpressoraDefinida ? limparId(dados.id_impressora ?? dados.idImpressora) : undefined;

            const id_cliente = idClienteBruto !== undefined ? await validarClienteExiste(idClienteBruto) : undefined;
            const id_impressora = idImpressoraBruta !== undefined ? await validarImpressoraExiste(idImpressoraBruta) : undefined;

            const executarAtualizacao = async (usarFKs: boolean) => {
                const clienteParam = usarFKs ? (id_cliente !== undefined ? id_cliente : null) : null;
                const impressoraParam = usarFKs ? (id_impressora !== undefined ? id_impressora : null) : null;

                if (extrasCripto) {
                    await env.DB.prepare(`
                        UPDATE pedidos_impressao SET 
                            status = ?, 
                            descricao = COALESCE(?, descricao),
                            valor_centavos = COALESCE(?, valor_centavos),
                            data_conclusao = CASE WHEN ? = 1 THEN NULL ELSE COALESCE(?, data_conclusao) END, 
                            id_cliente = CASE WHEN ? = 1 THEN ? ELSE id_cliente END, 
                            id_impressora = CASE WHEN ? = 1 THEN ? ELSE id_impressora END,
                            dados_extras = ?
                        WHERE id = ? AND id_usuario = ?
                    `).bind(
                        dados.status ?? 'pendente', 
                        descCripto ?? null,
                        dados.valor_centavos ?? dados.valorCentavos ?? null,
                        (corpoRaw as any).limparDataConclusao ? 1 : 0, (corpoRaw as any).data_conclusao ?? (corpoRaw as any).dataConclusao ?? null,
                        temClienteDefinido ? 1 : 0, clienteParam,
                        temImpressoraDefinida ? 1 : 0, impressoraParam,
                        extrasCripto,
                        dados.id, usuarioId
                    ).run();
                } else {
                    await env.DB.prepare(`
                        UPDATE pedidos_impressao SET 
                            status = ?, 
                            data_conclusao = CASE WHEN ? = 1 THEN NULL ELSE COALESCE(?, data_conclusao) END,
                            id_cliente = CASE WHEN ? = 1 THEN ? ELSE id_cliente END,
                            id_impressora = CASE WHEN ? = 1 THEN ? ELSE id_impressora END
                        WHERE id = ? AND id_usuario = ?
                    `).bind(
                        dados.status ?? 'pendente',
                        (corpoRaw as any).limparDataConclusao ? 1 : 0, (corpoRaw as any).data_conclusao ?? (corpoRaw as any).dataConclusao ?? null,
                        temClienteDefinido ? 1 : 0, clienteParam,
                        temImpressoraDefinida ? 1 : 0, impressoraParam,
                        dados.id, usuarioId
                    ).run();
                }
            };

            try {
                await executarAtualizacao(true);
            } catch (patchErr: any) {
                if (patchErr?.message?.includes("FOREIGN KEY constraint failed")) {
                    console.warn("[pedidos] Foreign Key constraint interceptada no PATCH. Reexecutando sem FK restritiva.");
                    await executarAtualizacao(false);
                } else {
                    throw patchErr;
                }
            }

            let idClienteParaAtualizar = id_cliente;
            if (!idClienteParaAtualizar) {
                const pedidoAtual = await env.DB.prepare("SELECT id_cliente FROM pedidos_impressao WHERE id = ?").bind(dados.id).first();
                if (pedidoAtual) idClienteParaAtualizar = (pedidoAtual as any).id_cliente;
            }
            if (idClienteParaAtualizar) {
                await atualizarMetricasCliente(idClienteParaAtualizar);
            }

            return new Response(JSON.stringify({ sucesso: true }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // ── DELETE ──
        if (metodo === "DELETE") {
            const pedidoAtual = await env.DB.prepare("SELECT id_cliente FROM pedidos_impressao WHERE id = ?").bind(id).first();
            
            // Desvincular dependências com foreign keys antes de deletar
            await env.DB.prepare("UPDATE historico_uso_materiais SET id_pedido = NULL WHERE id_pedido = ? AND id_usuario = ?")
                .bind(id, usuarioId).run().catch(() => {});

            await env.DB.prepare("DELETE FROM pedidos_impressao WHERE id = ? AND id_usuario = ?")
                .bind(id, usuarioId).run();

            if (pedidoAtual && (pedidoAtual as any).id_cliente) {
                await atualizarMetricasCliente((pedidoAtual as any).id_cliente);
            }
            return new Response(JSON.stringify({ sucesso: true }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response("Método não permitido", { status: 405 });
    } catch (erro: any) {
        if (erro instanceof z.ZodError) {
            const mensagens = erro.issues.map((e: any) => e.message).join(", ");
            return new Response(JSON.stringify({ 
                sucesso: false, 
                mensagem: `Erro de validação: ${mensagens}` 
            }), { 
                status: 400, 
                headers: { "Content-Type": "application/json" } 
            });
        }
        console.error("[pedidos] Erro ao processar pedido:", erro?.message || erro, erro?.stack);
        return new Response(JSON.stringify({ 
            sucesso: false, 
            mensagem: erro?.message ? `Erro ao processar pedido: ${erro.message}` : "Ocorreu um erro interno no servidor ao processar os pedidos." 
        }), { 
            status: 500, 
            headers: { "Content-Type": "application/json" } 
        });
    }
};
