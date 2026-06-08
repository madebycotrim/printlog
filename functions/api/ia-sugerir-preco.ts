/// <reference types="@cloudflare/workers-types" />

/**
 * AI de Precificação v2.0 - Cloudflare Workers AI
 * Estratégia de "Economia de Guerra": 
 * 1. Usa Modo JSON nativo do Llama-3-8B.
 * 2. Implementa Caching no D1 para evitar gastos redundantes de Neurons.
 */

interface Env {
    AI: any;
    DB: D1Database;
}

interface DadosPrecificacao {
    custoMaterial: number;
    custoEnergia: number;
    custoTrabalho: number;
    custoDepreciacao: number;
    lucroDesejadoPercentual: number;
    nomePeca?: string;
}

export const onRequest: PagesFunction<Env, any, { uid: string }> = async (context) => {
    const { env, request, data } = context;

    const usuarioId = data.uid;
    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    if (request.method !== "POST") return new Response("Método não permitido", { status: 405 });

    try {
        const dados = await request.json() as DadosPrecificacao;
        
        // 1. GERAÇÃO DA CHAVE DE CACHE (Baseada nos valores numéricos)
        // Se os custos e o lucro forem iguais, a sugestão provavelmente será a mesma.
        const cacheKey = `v2_${dados.custoMaterial}_${dados.custoEnergia}_${dados.custoTrabalho}_${dados.custoDepreciacao}_${dados.lucroDesejadoPercentual}`;

        // 2. TENTA BUSCAR NO CACHE DO D1 (Economia de Neurons)
        try {
            const cacheExistente = await env.DB.prepare(
                "SELECT resposta_json FROM cache_ia_precificacao WHERE chave_cache = ?"
            ).bind(cacheKey).first<{ resposta_json: string }>();

            if (cacheExistente) {
                console.log("[IA] Cache Hit! Economizando Neurons.");
                return new Response(cacheExistente.resposta_json, {
                    headers: { "Content-Type": "application/json", "X-Cache": "HIT" }
                });
            }
        } catch (e) {
            // Se a tabela não existir, apenas ignoramos o cache e seguimos para a IA
            console.warn("[IA] Tabela de cache não encontrada. Rodando sem cache.");
        }

        // 3. SE NÃO ESTIVER NO CACHE, CHAMA A IA
        const promptSistema = `Você é um especialista em precificação para impressão 3D no Brasil.
Responda APENAS com um objeto JSON válido.
Os custos fornecidos estão em REAIS (R$).

Regras de Precificação:
1. Calcule o Custo Total = Material + Energia + Trabalho + Máquina.
2. O valor de Piso deve ser no mínimo o Custo Total + 60%.
3. O valor Recomendado deve ser no mínimo o Custo Total + 100%.
4. O valor Premium deve ser no mínimo o Custo Total + 180%.
5. Não dê valores absurdos e astronômicos. Se o custo total for pequeno (ex: R$ 3,00), os preços devem ser proporcionais (ex: R$ 5, R$ 8, R$ 12).
6. Retorne os campos "valor" em REAIS (float, ex: 15.50).

Estrutura EXATA do JSON:
{
  "piso": { "valor": 0.0, "justificativa": "" },
  "recomendado": { "valor": 0.0, "justificativa": "" },
  "premium": { "valor": 0.0, "justificativa": "" },
  "dica": ""
}`;

        const promptUsuario = `DADOS DA PEÇA:
- Custo de Material: R$ ${dados.custoMaterial.toFixed(2)}
- Custo de Energia: R$ ${dados.custoEnergia.toFixed(2)}
- Custo de Mão de Obra: R$ ${dados.custoTrabalho.toFixed(2)}
- Custo de Depreciação: R$ ${dados.custoDepreciacao.toFixed(2)}
- Margem de Lucro Alvo: ${dados.lucroDesejadoPercentual}%
- Nome do Arquivo/Peça: ${dados.nomePeca || 'Peça 3D'}`;

        const aiResult = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
            messages: [
                { role: 'system', content: promptSistema },
                { role: 'user', content: promptUsuario }
            ],
            response_format: {
                type: 'json_schema',
                json_schema: {
                    name: 'precificacao',
                    schema: {
                        type: 'object',
                        properties: {
                            piso: {
                                type: 'object',
                                properties: {
                                    valor: { type: 'number' },
                                    justificativa: { type: 'string' }
                                },
                                required: ['valor', 'justificativa']
                            },
                            recomendado: {
                                type: 'object',
                                properties: {
                                    valor: { type: 'number' },
                                    justificativa: { type: 'string' }
                                },
                                required: ['valor', 'justificativa']
                            },
                            premium: {
                                type: 'object',
                                properties: {
                                    valor: { type: 'number' },
                                    justificativa: { type: 'string' }
                                },
                                required: ['valor', 'justificativa']
                            },
                            dica: { type: 'string' }
                        },
                        required: ['piso', 'recomendado', 'premium', 'dica']
                    }
                }
            },
            max_tokens: 600,
            temperature: 0.7
        });

        // O Workers AI com JSON Mode retorna o JSON como uma string dentro de aiResult.response
        const respostaFinal = aiResult.response;

        // 4. SALVA NO CACHE PARA PRÓXIMAS CONSULTAS (Background)
        context.waitUntil(
            env.DB.prepare(
                "INSERT OR IGNORE INTO cache_ia_precificacao (chave_cache, resposta_json) VALUES (?, ?)"
            ).bind(cacheKey, respostaFinal).run().catch(e => console.error("Erro ao salvar cache:", e))
        );

        return new Response(respostaFinal, {
            headers: { "Content-Type": "application/json", "X-Cache": "MISS" }
        });

    } catch (erro: any) {
        return new Response(JSON.stringify({ erro: erro.message }), { 
            status: 500, headers: { "Content-Type": "application/json" } 
        });
    }
};
