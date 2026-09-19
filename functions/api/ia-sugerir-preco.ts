/// <reference types="@cloudflare/workers-types" />

/**
 * AI de Precificação e Inteligência Maker v3.0 - Cloudflare Workers AI
 * Modelo: @cf/meta/llama-3.2-3b-instruct
 * Capacidades:
 * 1. 4 Estratégias: Piso/Atacado, Recomendado, Premium e Express (Urgência)
 * 2. Análise Técnica & Score de Risco de Impressão (1-10)
 * 3. Proposta Comercial pronta para WhatsApp
 * 4. Cache Inteligente no D1 para economia de Neurons
 */

interface Env {
    AI: any;
    DB: D1Database;
}

interface ItemMaterial {
    nome: string;
    quantidade: number;
    tipo?: string;
    cor?: string;
}

interface ItemPosProcesso {
    nome: string;
    valor: number;
}

interface DadosPrecificacao {
    custoMaterial: number;
    custoEnergia: number;
    custoTrabalho: number;
    custoDepreciacao: number;
    lucroDesejadoPercentual: number;
    nomePeca?: string;
    pesoGramas?: number;
    tempoMinutos?: number;
    quantidade?: number;
    tipoCliente?: "B2B" | "B2C";
    bandeiraTarifaria?: string;
    materiais?: ItemMaterial[];
    posProcesso?: ItemPosProcesso[];
}

export const onRequest: PagesFunction<Env, any, { uid: string }> = async (context) => {
    const { env, request, data } = context;

    const usuarioId = data.uid;
    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    if (request.method !== "POST") return new Response("Método não permitido", { status: 405 });

    try {
        const dados = await request.json() as DadosPrecificacao;
        
        const custoTotal = (dados.custoMaterial || 0) + (dados.custoEnergia || 0) + (dados.custoTrabalho || 0) + (dados.custoDepreciacao || 0);
        const materiaisStr = (dados.materiais || []).map(m => `${m.nome} (${m.quantidade}g)`).join(", ") || `${dados.pesoGramas || 0}g de filamento/resina`;
        const posProcessoStr = (dados.posProcesso || []).map(p => p.nome).join(", ") || "Nenhum";
        const qtd = Math.max(1, dados.quantidade || 1);
        const tempoH = Math.round(((dados.tempoMinutos || 0) / 60) * 10) / 10;

        // 1. GERAÇÃO DA CHAVE DE CACHE (Baseada em custos, tempo e materiais)
        const hashInputs = `${Math.round(custoTotal * 10)}_${dados.lucroDesejadoPercentual}_${Math.round(dados.tempoMinutos || 0)}_${qtd}_${dados.tipoCliente || 'B2C'}`;
        const cacheKey = `v3_${hashInputs}`;

        // 2. TENTA BUSCAR NO CACHE DO D1 (Economia de Neurons)
        try {
            const cacheExistente = await env.DB.prepare(
                "SELECT resposta_json FROM cache_ia_precificacao WHERE chave_cache = ?"
            ).bind(cacheKey).first<{ resposta_json: string }>();

            if (cacheExistente && cacheExistente.resposta_json) {
                try {
                    const dadosValidados = JSON.parse(cacheExistente.resposta_json);
                    if (dadosValidados && typeof dadosValidados === "object" && dadosValidados.recomendado) {
                        return new Response(cacheExistente.resposta_json, {
                            headers: { "Content-Type": "application/json", "X-Cache": "HIT" }
                        });
                    }
                } catch {
                    // cache corrompido, segue para execução
                }
            }
        } catch {
            // Tabela opcional ou ausente, segue sem travar
        }

        // 3. SE NÃO ESTIVER NO CACHE, CHAMA A IA COM PROMPT ESPECIALIZADO EM IMPRESSÃO 3D
        const promptSistema = `Você é um consultor sênior em engenharia de manufatura aditiva (impressão 3D) e precificação comercial no mercado brasileiro.
Responda APENAS com um objeto JSON estritamente válido, sem texto antes ou depois.
Os valores monetários devem ser números reais em REAIS (ex: 28.50).

Diretrizes de Precificação e Risco:
1. Custo Operacional Base = R$ ${custoTotal.toFixed(2)}. Se o custo base for muito baixo (< R$ 5,00), aplique uma taxa de setup mínima de oficina (R$ 10,00 - R$ 15,00).
2. Estratégias:
   - "piso": Margem conservadora (mínimo Custo + 50-60%). Ideal para lotes grandes B2B ou atacado.
   - "recomendado": Margem de sustentabilidade saudável (Custo + 90-130%). Ideal para varejo e novos clientes.
   - "premium": Margem de alto valor percebido (Custo + 160-220%). Para peças com pós-processo, clientes exigentes ou peças técnicas.
   - "express": Taxa de urgência/furar fila (+35-50% sobre o Recomendado) para produção imediata.
3. Análise Técnica:
   - scoreRisco: Inteiro de 1 a 10 (considere: impressões longas > 6h aumentam risco térmico/queda de energia; materiais técnicos como ABS/Nylon/TPU têm maior risco de warp/entupimento).
   - nivelComplexidade: Uma das opções: "Baixa", "Média", "Alta", "Crítica".
   - alertas: Array de até 3 alertas técnicos concisos sobre a impressão e cuidados de pós-processo.
4. Pitch Comercial (textoWhatsApp):
   - Mensagem comercial educada, persuasiva e formatada com emojis e negrito markdown (*) para envio direto ao cliente via WhatsApp. Deve citar o nome da peça, material, tempo de produção estimado, cuidados inclusos e proposta de valor.`;

        const promptUsuario = `DADOS DO PROJETO 3D:
- Nome da Peça: ${dados.nomePeca || 'Peça Sob Medida 3D'}
- Quantidade: ${qtd} unidade(s)
- Tempo Estimado de Máquina: ${tempoH} horas (${dados.tempoMinutos || 0} min)
- Materiais Envolvidos: ${materiaisStr}
- Pós-Processamento: ${posProcessoStr}
- Custo de Material: R$ ${(dados.custoMaterial || 0).toFixed(2)}
- Custo de Energia Elétrica: R$ ${(dados.custoEnergia || 0).toFixed(2)} (Bandeira: ${dados.bandeiraTarifaria || 'Padrão'})
- Custo de Mão de Obra/Setup: R$ ${(dados.custoTrabalho || 0).toFixed(2)}
- Custo de Depreciação de Máquinas: R$ ${(dados.custoDepreciacao || 0).toFixed(2)}
- Custo Total de Fabricação: R$ ${custoTotal.toFixed(2)}
- Margem Alvo do Maker: ${dados.lucroDesejadoPercentual}%
- Perfil do Cliente: ${dados.tipoCliente === 'B2B' ? 'B2B (Empresa / Comercial)' : 'B2C (Consumidor Final)'}`;

        const aiResult = await env.AI.run('@cf/meta/llama-3.2-3b-instruct', {
            messages: [
                { role: 'system', content: promptSistema },
                { role: 'user', content: promptUsuario }
            ],
            response_format: {
                type: 'json_schema',
                json_schema: {
                    name: 'precificacao_maker_v3',
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
                            express: {
                                type: 'object',
                                properties: {
                                    valor: { type: 'number' },
                                    justificativa: { type: 'string' }
                                },
                                required: ['valor', 'justificativa']
                            },
                            analiseTecnica: {
                                type: 'object',
                                properties: {
                                    scoreRisco: { type: 'number' },
                                    nivelComplexidade: { type: 'string' },
                                    alertas: {
                                        type: 'array',
                                        items: { type: 'string' }
                                    }
                                },
                                required: ['scoreRisco', 'nivelComplexidade', 'alertas']
                            },
                            pitchComercial: {
                                type: 'object',
                                properties: {
                                    textoWhatsApp: { type: 'string' }
                                },
                                required: ['textoWhatsApp']
                            },
                            dica: { type: 'string' }
                        },
                        required: ['piso', 'recomendado', 'premium', 'express', 'analiseTecnica', 'pitchComercial', 'dica']
                    }
                }
            },
            max_tokens: 850,
            temperature: 0.6
        });

        let respostaFinal = aiResult.response;
        if (typeof respostaFinal !== "string") {
            respostaFinal = JSON.stringify(respostaFinal);
        }

        // 4. SALVA NO CACHE EM BACKGROUND
        context.waitUntil(
            env.DB.prepare(
                "INSERT OR IGNORE INTO cache_ia_precificacao (chave_cache, resposta_json) VALUES (?, ?)"
            ).bind(cacheKey, respostaFinal).run().catch(() => {})
        );

        return new Response(respostaFinal, {
            headers: { "Content-Type": "application/json", "X-Cache": "MISS" }
        });

    } catch (erro: any) {
        return new Response(JSON.stringify({ erro: erro?.message || "Erro no processamento da IA" }), { 
            status: 500, headers: { "Content-Type": "application/json" } 
        });
    }
};

