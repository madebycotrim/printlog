/// <reference types="@cloudflare/workers-types" />
import { criptografar, descriptografar } from "./utilitarios/criptografia";
import { z } from "zod";

/**
 * API de Pedidos - v6.0 Blindagem Total (AES-GCM) com Validação Zod
 * Protege detalhes dos projetos e observações contra vazamentos.
 */

interface Env {
    DB: D1Database;
    ENCRYPTION_KEY: string;
}

const ZodPedidoCriar = z.object({
    idCliente: z.string().nullable().optional(),
    id_cliente: z.string().nullable().optional(),
    idImpressora: z.string().nullable().optional(),
    id_impressora: z.string().nullable().optional(),
    descricao: z.string().min(1, "A descrição não pode ser vazia"),
    valorCentavos: z.number().int().min(0).optional(),
    valor_centavos: z.number().int().min(0).optional(),
    status: z.string().optional(),
    dataCriacao: z.string().optional(),
    data_criacao: z.string().optional(),
    dados_extras: z.string().optional()
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
    const chaveMestra = env.ENCRYPTION_KEY || "chave-temporaria-printlog-2026";

    try {
        // Migração automática (garante que a coluna de criptografia existe no SQLite local)
        await env.DB.prepare(`ALTER TABLE pedidos_impressao ADD COLUMN dados_extras TEXT DEFAULT NULL`).run().catch(() => {});

        // ── GET - Listar (Com Descriptografia) ──
        if (metodo === "GET") {
            const { results: pedidos } = await env.DB.prepare(
                "SELECT * FROM pedidos_impressao WHERE id_usuario = ? AND arquivado = 0"
            ).bind(usuarioId).all();

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

            // Ordena por data decrescente (já que o banco perde a ordem temporal se a data estivesse criptografada, 
            // mas aqui a data está limpa, então é só um ajuste de garantia)
            processados.sort((a, b) => new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime());

            return new Response(JSON.stringify(processados), { 
                headers: { "Content-Type": "application/json" } 
            });
        }

        // ── POST - Criar (Com Criptografia) ──
        if (metodo === "POST") {
            const corpoRaw = await request.json();
            const dados = ZodPedidoCriar.parse(corpoRaw) as any;
            const novoId = (corpoRaw as any).id || crypto.randomUUID();
            
            const limparId = (val: any) => (!val || val === "null" || val === "0") ? null : String(val);

            const id_cliente = limparId(dados.id_cliente ?? dados.idCliente);
            const id_impressora = limparId(dados.id_impressora ?? dados.idImpressora);
            const valor_centavos = Number(dados.valor_centavos ?? dados.valorCentavos) || 0;
            const data_criacao = dados.data_criacao ?? dados.dataCriacao ?? new Date().toISOString();

            // Monta Dados Extras e Criptografa
            const dadosExtras = {
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

            return new Response(JSON.stringify({ id: novoId, sucesso: true }), { 
                status: 201, headers: { "Content-Type": "application/json" } 
            });
        }

        // ── PATCH / PUT - Atualizar (Com Criptografia) ──
        if (metodo === "PATCH" || metodo === "PUT") {
            const corpoRaw = await request.json();
            const dados = ZodPedidoAtualizar.parse(corpoRaw) as any;
            const limparId = (val: any) => (!val || val === "null") ? null : String(val);

            const descCripto = dados.descricao ? await criptografar(dados.descricao, chaveMestra) : undefined;
            const extrasCripto = (corpoRaw as any).dados_extras ? await criptografar(
                typeof (corpoRaw as any).dados_extras === 'string' ? (corpoRaw as any).dados_extras : JSON.stringify((corpoRaw as any).dados_extras),
                chaveMestra
            ) : undefined;

            if (extrasCripto) {
                await env.DB.prepare(`
                    UPDATE pedidos_impressao SET 
                        status = ?, 
                        descricao = COALESCE(?, descricao),
                        valor_centavos = COALESCE(?, valor_centavos),
                        data_conclusao = CASE WHEN ? = 1 THEN NULL ELSE COALESCE(?, data_conclusao) END, 
                        id_cliente = COALESCE(?, id_cliente), 
                        id_impressora = COALESCE(?, id_impressora),
                        dados_extras = ?
                    WHERE id = ? AND id_usuario = ?
                `).bind(
                    dados.status ?? 'pendente', 
                    descCripto ?? null,
                    dados.valor_centavos ?? dados.valorCentavos ?? null,
                    (corpoRaw as any).limparDataConclusao ? 1 : 0, (corpoRaw as any).data_conclusao ?? (corpoRaw as any).dataConclusao ?? null,
                    limparId(dados.id_cliente ?? dados.idCliente),
                    limparId(dados.id_impressora ?? dados.idImpressora),
                    extrasCripto,
                    dados.id, usuarioId
                ).run();
            } else {
                await env.DB.prepare(`
                    UPDATE pedidos_impressao SET 
                        status = ?, 
                        data_conclusao = CASE WHEN ? = 1 THEN NULL ELSE COALESCE(?, data_conclusao) END
                    WHERE id = ? AND id_usuario = ?
                `).bind(
                    dados.status ?? 'pendente',
                    (corpoRaw as any).limparDataConclusao ? 1 : 0, (corpoRaw as any).data_conclusao ?? (corpoRaw as any).dataConclusao ?? null,
                    dados.id, usuarioId
                ).run();
            }

            return new Response(JSON.stringify({ sucesso: true }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // ── DELETE ──
        if (metodo === "DELETE") {
            await env.DB.prepare("DELETE FROM pedidos_impressao WHERE id = ? AND id_usuario = ?")
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
        console.error("[pedidos] Erro Protegido:", erro);
        return new Response(JSON.stringify({ 
            sucesso: false, 
            mensagem: "Ocorreu um erro interno no servidor ao processar os pedidos." 
        }), { 
            status: 500, 
            headers: { "Content-Type": "application/json" } 
        });
    }
};
