import { jwtVerify, createRemoteJWKSet } from 'jose';
import { gerenciarFilamentos, gerenciarFalhas } from './_filaments_v2';
import { gerenciarImpressoras } from './_printers';
import { gerenciarConfiguracoes } from './_settings';
import { gerenciarProjetos, aprovarProjeto } from './_projects';
import { gerenciarUsuarios } from './_users';
import { gerenciarInsumos } from './_supplies';
import { gerenciarTodos } from './_todos';
import { gerenciarAssinatura } from './_billing';
import { gerenciarClientes } from './_clients';
import { gerenciarAuditoria } from './_audit';
import { corsHeaders, enviarJSON, paraNumero } from './_utils';
import { checkRateLimit, getIdentifier } from './_rateLimit';
import { onRequest as resetDatabase } from './_reset_schema';
import { gerenciarStats } from './stats';



// Re-exportar para compatibilidade com outros arquivos
export { corsHeaders, enviarJSON, paraNumero };

// Cache the JWKS (Public Keys) for performance
const FIREBASE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));

export async function onRequest(context) {
    const { request, env, params } = context;
    const method = request.method;
    const url = new URL(request.url);
    const pathArray = params.path || [];
    const entity = pathArray[0];

    if (method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
        // --- SECURE AUTHENTICATION (JWT) ---
        let userId = null;

        try {
            const authHeader = request.headers.get("Authorization");
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                throw new Error("Token não fornecido");
            }

            const token = authHeader.split(" ")[1];
            const projectId = env.VITE_FIREBASE_PROJECT_ID;

            if (!projectId) {
                console.error("VITE_FIREBASE_PROJECT_ID não configurado no ambiente.");
                throw new Error("Erro de configuração do servidor.");
            }

            const { payload } = await jwtVerify(token, FIREBASE_JWKS, {
                issuer: `https://securetoken.google.com/${projectId}`,
                audience: projectId,
            });

            userId = payload.sub;

        } catch (err) {
            console.error("Falha na autenticação:", err.message);
            return enviarJSON({ error: "Acesso não autorizado.", details: err.message }, 401);
        }

        const tenantId = userId;
        const identifier = getIdentifier(request, tenantId);
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
        const ctx = { request, db, userId, tenantId, pathArray, url, params, env };

        switch (entity) {
            case 'filaments': case 'filamentos': return await gerenciarFilamentos(ctx);
            case 'printers': case 'impressoras': return await gerenciarImpressoras(ctx);
            case 'settings': return await gerenciarConfiguracoes(ctx);
            case 'failures': return await gerenciarFalhas(ctx);
            case 'projects': return await gerenciarProjetos(ctx);
            case 'approve-budget': return await aprovarProjeto(ctx);
            case 'users': return await gerenciarUsuarios(ctx);
            case 'supplies': case 'insumos': return await gerenciarInsumos(ctx);
            case 'clients': case 'clientes': return await gerenciarClientes(ctx);
            case 'todos': return await gerenciarTodos(ctx);
            case 'billing': return await gerenciarAssinatura(ctx);
            case 'audit': return await gerenciarAuditoria(ctx);
            case 'stats': return await gerenciarStats(ctx);
            case 'setup': return await resetDatabase(ctx);
            default: return enviarJSON({ error: "Rota não encontrada" }, 404);
        }

    } catch (err) {
        console.error("Erro no worker:", err.message);
        // FORCE 200 TO DEBUG IN FRONTEND
        return enviarJSON({
            error: "Erro interno no servidor",
            details: err.message
        }, 500);
    }
}
