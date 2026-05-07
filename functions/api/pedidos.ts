/// <reference types="@cloudflare/workers-types" />

/**
 * API de Pedidos - Cloudflare Pages Functions (v5.0 Soft Delete)
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
        // GET - Listar (Apenas Ativos)
        if (metodo === "GET") {
            const { results: pedidos } = await env.DB.prepare(
                "SELECT * FROM pedidos_impressao WHERE id_usuario = ? AND arquivado = 0 ORDER BY data_criacao DESC"
            ).bind(usuarioId).all();

            // Desempacotar dados extras para o frontend ver as colunas virtuais
            const processados = pedidos.map((p: any) => {
                if (p.dados_extras) {
                    try {
                        const extras = JSON.parse(p.dados_extras);
                        return { ...p, ...extras };
                    } catch (e) { return p; }
                }
                return p;
            });

            return new Response(JSON.stringify(processados), { headers: { "Content-Type": "application/json" } });
        }

        // POST - Criar
        if (metodo === "POST") {
            const dados = await request.json() as any;
            const novoId = dados.id || crypto.randomUUID();
            
            // Função auxiliar para limpar IDs e evitar erros de Foreign Key
            const limparId = (id: any) => {
                if (!id || id === "" || id === "null" || id === "undefined" || id === "0") return null;
                return String(id);
            };

            const id_cliente = limparId(dados.id_cliente ?? dados.idCliente);
            const id_impressora = limparId(dados.id_impressora ?? dados.idImpressora);
            const valor_centavos = dados.valor_centavos ?? dados.valorCentavos ?? 0;
            const data_criacao = dados.data_criacao ?? dados.dataCriacao ?? new Date().toISOString();
            const descricao = dados.descricao ?? '';
            // Se o front-end já mandou dados_extras pré-montados (via apiPedidos.mapearParaBanco),
            // use-os diretamente. Só monta manualmente se não vier.
            let dadosExtrasStr: string;
            if (dados.dados_extras) {
                // Front-end já serializou — usa direto
                dadosExtrasStr = typeof dados.dados_extras === 'string' 
                    ? dados.dados_extras 
                    : JSON.stringify(dados.dados_extras);
            } else {
                // Fallback: monta a partir dos campos individuais
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
                dadosExtrasStr = JSON.stringify(dadosExtras);
            }

            try {
                await env.DB.prepare(`
                    INSERT INTO pedidos_impressao (
                        id, id_usuario, id_cliente, id_impressora, descricao, 
                        status, valor_centavos, data_criacao, dados_extras, arquivado
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
                `).bind(
                    novoId, 
                    usuarioId, 
                    id_cliente, 
                    id_impressora, 
                    descricao, 
                    dados.status ?? 'pendente', 
                    Number(valor_centavos) || 0, 
                    data_criacao,
                    dadosExtrasStr
                ).run();

                return new Response(JSON.stringify({ id: novoId, sucesso: true }), { 
                    status: 201, 
                    headers: { "Content-Type": "application/json" } 
                });
            } catch (erroD1: any) {
                console.error("[pedidos] Erro D1:", erroD1);
                return new Response(
                    JSON.stringify({ 
                        sucesso: false, 
                        mensagem: `Erro no Banco (D1): ${erroD1.message}`,
                        detalhes: erroD1.cause?.message || erroD1.stack,
                        dadosEnviados: { novoId, usuarioId, id_cliente, id_impressora }
                    }),
                    { status: 500, headers: { "Content-Type": "application/json" } }
                );
            }
        }

        // PATCH / PUT - Atualizar
        if (metodo === "PATCH" || metodo === "PUT") {
            const dados = await request.json() as any;

            const limparId = (val: any) => {
                if (!val || val === "" || val === "null" || val === "undefined") return null;
                return String(val);
            };
            
            const id_cliente = limparId(dados.id_cliente ?? dados.idCliente);
            const id_impressora = limparId(dados.id_impressora ?? dados.idImpressora);
            const valor_centavos = dados.valor_centavos ?? dados.valorCentavos;
            const data_conclusao = dados.data_conclusao ?? dados.dataConclusao ?? null;

            // Resolve dados_extras: usa o que veio do front, ou preserva o existente no banco
            let dadosExtrasFinais: string | null = null;
            if (dados.dados_extras) {
                dadosExtrasFinais = typeof dados.dados_extras === 'string'
                    ? dados.dados_extras
                    : JSON.stringify(dados.dados_extras);
            }

            try {
                // Se dados_extras não veio no payload, NÃO sobrescreve o que já existe
                if (dadosExtrasFinais) {
                    await env.DB.prepare(`
                        UPDATE pedidos_impressao SET 
                            status = ?, 
                            descricao = CASE WHEN ? IS NOT NULL AND ? != '' THEN ? ELSE descricao END,
                            valor_centavos = CASE WHEN ? IS NOT NULL THEN ? ELSE valor_centavos END,
                            data_conclusao = CASE WHEN ? = 1 THEN NULL ELSE COALESCE(?, data_conclusao) END, 
                            id_cliente = COALESCE(?, id_cliente), 
                            id_impressora = COALESCE(?, id_impressora),
                            dados_extras = ?
                        WHERE id = ? AND id_usuario = ?
                    `).bind(
                        dados.status ?? 'pendente', 
                        dados.descricao ?? null, dados.descricao ?? null, dados.descricao ?? null,
                        valor_centavos ?? null, valor_centavos ?? null,
                        dados.limparDataConclusao ? 1 : 0, data_conclusao,
                        id_cliente,
                        id_impressora,
                        dadosExtrasFinais,
                        dados.id, 
                        usuarioId
                    ).run();
                } else {
                    // Atualização leve (só status, sem tocar em dados_extras ou outros campos)
                    await env.DB.prepare(`
                        UPDATE pedidos_impressao SET 
                            status = ?, 
                            data_conclusao = CASE WHEN ? = 1 THEN NULL ELSE COALESCE(?, data_conclusao) END
                        WHERE id = ? AND id_usuario = ?
                    `).bind(
                        dados.status ?? 'pendente',
                        dados.limparDataConclusao ? 1 : 0, data_conclusao,
                        dados.id, 
                        usuarioId
                    ).run();
                }

                return new Response(JSON.stringify({ sucesso: true }), {
                    headers: { "Content-Type": "application/json" }
                });
            } catch (erroD1: any) {
                console.error("[pedidos] Erro PATCH D1:", erroD1);
                return new Response(
                    JSON.stringify({ 
                        sucesso: false, 
                        mensagem: `Erro no Banco (D1): ${erroD1.message}`,
                        detalhes: erroD1.cause?.message || erroD1.stack
                    }),
                    { status: 500, headers: { "Content-Type": "application/json" } }
                );
            }
        }

        // DELETE - Hard Delete (Economia de Espaço D1)
        if (metodo === "DELETE") {
            if (!id) return new Response(JSON.stringify({ erro: "ID não fornecido" }), { status: 400, headers: { "Content-Type": "application/json" } });
            
            await env.DB.prepare(
                "DELETE FROM pedidos_impressao WHERE id = ? AND id_usuario = ?"
            ).bind(id, usuarioId).run();

            return new Response(JSON.stringify({ sucesso: true }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response("Método não permitido", { status: 405 });
    } catch (erro: any) {
        console.error("[pedidos] Erro:", erro);
        return new Response(
            JSON.stringify({ 
                sucesso: false, 
                mensagem: erro.message || "Erro inesperado no servidor.",
                codigo: erro.code
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};
