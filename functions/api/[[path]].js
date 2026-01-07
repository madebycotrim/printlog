import { createClerkClient } from '@clerk/backend';
import { sendJSON, initSchema, corsHeaders } from './_utils';
import { handleFilaments } from './_filaments';
import { handlePrinters } from './_printers';
import { handleSettings } from './_settings';
import { handleProjects, handleApproveBudget } from './_projects';
import { handleUsers } from './_users';

export async function onRequest(context) {
    const { request, env, params } = context;
    const url = new URL(request.url);
    const pathArray = params.path || [];
    const entity = pathArray[0];
    const idFromPath = pathArray[1];
    const method = request.method;

    if (method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
        const clerk = createClerkClient({
            secretKey: env.CLERK_SECRET_KEY,
            publishableKey: env.CLERK_PUBLISHABLE_KEY
        });

        const authRequest = await clerk.authenticateRequest(request);
        if (!authRequest.isSignedIn) return sendJSON({ error: "Não autorizado" }, 401);

        const userId = authRequest.toAuth().userId;
        const db = env.DB;

        // Inicializa o banco com as tabelas originais
        await initSchema(db);

        switch (entity) {
            case 'filaments': case 'filamentos':
                return await handleFilaments(method, url, idFromPath, db, userId, request);
            
            case 'settings':
                return await handleSettings(method, db, userId, request);
            
            case 'printers': case 'impressoras':
                return await handlePrinters(method, url, idFromPath, db, userId, request);
            
            case 'projects': case 'projetos':
                return await handleProjects(method, url, idFromPath, db, userId, request);
            
            case 'approve-budget':
                return await handleApproveBudget(db, userId, request);
            
            case 'users':
                return await handleUsers(method, pathArray, db, userId);
            
            default:
                return sendJSON({ error: "Rota não encontrada" }, 404);
        }
    } catch (err) {
        console.error("ERRO NO WORKER:", err.message);
        return sendJSON({ error: "Erro Interno no Servidor", details: err.message }, 500);
    }
}