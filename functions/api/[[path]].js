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
