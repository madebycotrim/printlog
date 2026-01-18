import { createClerkClient } from '@clerk/backend';

// Helper de CORS (exportado de _utils, mas redefinido aqui para isolamento se necessário, ou importado)
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': '*',
};

export async function onRequest(context) {
    // Handle OPTIONS for CORS
    if (context.request.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    const { env } = context;

    try {
        const clerk = createClerkClient({
            secretKey: env.CLERK_SECRET_KEY,
            publishableKey: env.CLERK_PUBLISHABLE_KEY
        });

        // Fetch total user count from Clerk
        const totalUsers = await clerk.users.getCount();

        return new Response(JSON.stringify({
            count: totalUsers,
            // Fallback fake data if count fails or is 0 (optional, but requested "real" so we trust it)
        }), {
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        });

    } catch (err) {
        // Fallback robusto: se falhar (ex: rate limit), retorna um erro silencioso ou número estimado
        console.error("Erro ao buscar stats:", err);
        return new Response(JSON.stringify({ count: null, error: err.message }), {
            status: 500,
            headers: corsHeaders
        });
    }
}
