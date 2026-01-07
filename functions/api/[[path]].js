import { createClerkClient } from '@clerk/backend';
import { corsHeaders, sendJSON, initSchema } from './_utils';
import { handleFilaments } from './_filaments';
import { handlePrinters } from './_printers';
import { handleSettings } from './_settings';
import { handleProjects, handleApproveBudget } from './_projects';
import { handleUsers } from './_users';

// Variável global para controle de inicialização do Banco (opcional para Workers)
let dbInitialized = false;

export async function onRequest(context) {
    const { request, env, params } = context;
    const url = new URL(request.url);
    const method = request.method;

    // 1. Early return para CORS OPTIONS
    if (method === "OPTIONS") {
        return new Response(null, { 
            headers: { 
                ...corsHeaders,
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            } 
        });
    }

    try {
        // 2. Inicialização do Clerk (Secret Key é obrigatória no Backend)
        const clerk = createClerkClient({
            secretKey: env.CLERK_SECRET_KEY,
        });

        // 3. Autenticação robusta
        const authRequest = await clerk.authenticateRequest(request);
        
        if (!authRequest.isSignedIn) {
            return sendJSON({ error: "Sessão inválida ou expirada" }, 401);
        }

        const { userId } = authRequest.toAuth();
        const db = env.DB;

        // 4. Otimização do Schema: Só roda se necessário
        // Nota: O ideal é rodar isso via 'wrangler d1 execute ...' no deploy
        if (!dbInitialized) {
            await initSchema(db);
            dbInitialized = true; 
        }

        // 5. Parsing de rota mais limpo
        const pathArray = params.path || [];
        const [entity, idFromPath] = pathArray;

        // 6. Roteamento
        switch (entity) {
            case 'filaments':
            case 'filamentos':
                return await handleFilaments(method, url, idFromPath, db, userId, request);
            
            case 'printers':
            case 'impressoras':
                return await handlePrinters(method, url, idFromPath, db, userId, request);

            case 'settings':
                return await handleSettings(method, db, userId, request);

            case 'projects':
                return await handleProjects(method, url, idFromPath, db, userId, request);

            case 'approve-budget':
                if (method === 'POST') return await handleApproveBudget(db, userId, request);
                return sendJSON({ error: "Método não permitido" }, 405);

            case 'users':
                return await handleUsers(method, idFromPath, db, userId);
            
            default:
                return sendJSON({ error: "Rota inexistente" }, 404);
        }
    } catch (err) {
        console.error("Erro no Worker:", err); // Log para debug no painel da Cloudflare
        return sendJSON({ 
            error: "Erro Interno no Servidor", 
            message: err.message 
        }, 500);
    }
}