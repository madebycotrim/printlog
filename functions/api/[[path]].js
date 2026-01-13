import { createClerkClient } from '@clerk/backend';
import { gerenciarFilamentos } from './_filaments';
import { gerenciarImpressoras } from './_printers';
import { gerenciarConfiguracoes } from './_settings';
import { gerenciarFalhas } from './_failures';
import { gerenciarProjetos } from './_projects';
import { gerenciarAprovacao } from './_approve';
import { gerenciarUsuarios } from './_users';
import { gerenciarInsumos } from './_supplies';
import { gerenciarTodos } from './_todos';
import { corsHeaders, enviarJSON, paraNumero } from './_utils';
import { checkRateLimit, getIdentifier } from './_rateLimit';

// Re-exportar para compatibilidade com outros arquivos
export { corsHeaders, enviarJSON, paraNumero };

export async function onRequest(context) {
    const { request, env, params } = context;
    const method = request.method;
    const url = new URL(request.url);
    const pathArray = params.path || [];
    const entity = pathArray[0];

    if (method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
        const clerk = createClerkClient({
            secretKey: env.CLERK_SECRET_KEY,
            publishableKey: env.CLERK_PUBLISHABLE_KEY
        });

        const authRequest = await clerk.authenticateRequest(request);
        if (!authRequest.isSignedIn) {
            return enviarJSON({ error: "Acesso negado. Por favor, faça login novamente." }, 401);
        }

        const userId = authRequest.toAuth().userId;

        // ==========================================
        // RATE LIMITING (100 req/min por usuário)
        // ==========================================
        const identifier = getIdentifier(request, userId);
        const rateCheck = checkRateLimit(identifier, 100);

        if (!rateCheck.allowed) {
            return new Response(JSON.stringify({
                error: "Muitas requisições. Por favor, aguarde antes de tentar novamente.",
                retryAfter: rateCheck.retryAfter
            }), {
                status: 429,
                headers: {
                    ...corsHeaders,
                    'Retry-After': String(rateCheck.retryAfter),
                    'X-RateLimit-Remaining': '0'
                }
            });
        }

        const db = env.DB;

        // Manutenção do esquema do banco de dados
        await db.batch([
            db.prepare(`CREATE TABLE IF NOT EXISTS filaments (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, nome TEXT NOT NULL, marca TEXT, material TEXT, cor_hex TEXT, peso_total REAL, peso_atual REAL, preco REAL, data_abertura TEXT, favorito INTEGER DEFAULT 0, tags TEXT DEFAULT '[]')`),
            db.prepare(`CREATE TABLE IF NOT EXISTS printers (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, nome TEXT NOT NULL, marca TEXT, modelo TEXT, status TEXT DEFAULT 'idle', potencia REAL DEFAULT 0, preco REAL DEFAULT 0, rendimento_total REAL DEFAULT 0, horas_totais REAL DEFAULT 0, ultima_manutencao_hora REAL DEFAULT 0, intervalo_manutencao REAL DEFAULT 300, historico TEXT)`),
            db.prepare(`CREATE TABLE IF NOT EXISTS calculator_settings (user_id TEXT PRIMARY KEY, custo_kwh REAL, valor_hora_humana REAL, custo_hora_maquina REAL, taxa_setup REAL, consumo_impressora_kw REAL, margem_lucro REAL, imposto REAL, taxa_falha REAL, desconto REAL, whatsapp_template TEXT, theme TEXT DEFAULT 'dark', primary_color TEXT DEFAULT 'sky')`),
            db.prepare(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, label TEXT NOT NULL, data TEXT, tags TEXT DEFAULT '[]', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),
            db.prepare(`CREATE TABLE IF NOT EXISTS todos (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, text TEXT NOT NULL, done INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`)
        ]);

        const ctx = { request, db, userId, pathArray, url, params, env };

        switch (entity) {
            case 'filaments': case 'filamentos': return await gerenciarFilamentos(ctx);
            case 'printers': case 'impressoras': return await gerenciarImpressoras(ctx);
            case 'settings': return await gerenciarConfiguracoes(ctx);
            case 'failures': return await gerenciarFalhas(ctx);
            case 'projects': return await gerenciarProjetos(ctx);
            case 'approve-budget': return await gerenciarAprovacao(ctx);
            case 'users': return await gerenciarUsuarios(ctx);
            case 'supplies': case 'insumos': return await gerenciarInsumos(ctx);
            case 'todos': return await gerenciarTodos(ctx);
            default: return enviarJSON({ error: "Rota não encontrada" }, 404);
        }

    } catch (err) {
        console.error("Erro no worker:", err.message);
        return enviarJSON({ error: "Erro interno no servidor", details: err.message }, 500);
    }
}