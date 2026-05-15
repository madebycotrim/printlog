/// <reference types="@cloudflare/workers-types" />
import { criptografar, descriptografar } from "./utilitarios/criptografia";

/**
 * API de Pedidos - v6.0 Blindagem Total (AES-GCM)
 * Protege detalhes dos projetos e observações contra vazamentos.
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
            const dados = await request.json() as any;
            const novoId = dados.id || crypto.randomUUID();
            
            const limparId = (val: any) => (!val || val === "null" || val === "0") ? null : String(val);

            const id_cliente = limparId(dados.id_cliente ?? dados.idCliente);
            const id_impressora = limparId(dados.id_impressora ?? dados.idImpressora);
            const valor_centavos = Number(dados.valor_centavos ?? dados.valorCentavos) || 0;
            const data_criacao = dados.data_criacao ?? dados.dataCriacao ?? new Date().toISOString();

            // Monta Dados Extras e Criptografa
            const dadosExtras = {
                material: dados.material ?? dados.material_base,
                materiais: dados.materiais ?? [],
                peso_gramas: dados.peso_gramas ?? dados.pesoGramas,
                tempo_minutos: dados.tempo_minutos ?? dados.tempoMinutos,
                observacoes: dados.observacoes,
                insumos_secundarios: dados.insumos_secundarios ?? dados.insumosSecundarios ?? [],
                pos_processo: dados.pos_processo ?? dados.posProcesso ?? [],
                configuracoes: dados.configuracoes ?? {}
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
            const dados = await request.json() as any;
            const limparId = (val: any) => (!val || val === "null") ? null : String(val);

            const descCripto = dados.descricao ? await criptografar(dados.descricao, chaveMestra) : undefined;
            const extrasCripto = dados.dados_extras ? await criptografar(
                typeof dados.dados_extras === 'string' ? dados.dados_extras : JSON.stringify(dados.dados_extras),
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
                    dados.limparDataConclusao ? 1 : 0, dados.data_conclusao ?? dados.dataConclusao ?? null,
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
                    dados.limparDataConclusao ? 1 : 0, dados.data_conclusao ?? dados.dataConclusao ?? null,
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
        console.error("[pedidos] Erro Protegido:", erro);
        return new Response(JSON.stringify({ sucesso: false, mensagem: "Erro ao processar dados protegidos." }), { 
            status: 500, headers: { "Content-Type": "application/json" } 
        });
    }
};
