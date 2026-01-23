// import { createClerkClient } from '@clerk/backend';

// Helper de CORS
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': '*',
};

export async function onRequest(context) {
    if (context.request.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    const { env } = context;

    try {
        // Query D1 for real user count (users who have configured settings)
        const result = await env.DB.prepare("SELECT COUNT(*) as qtd FROM calculator_settings").first();
        const totalUsers = result?.qtd || 0;

        return new Response(JSON.stringify({
            count: totalUsers
        }), {
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        });

    } catch (err) {
        console.error("Erro ao buscar stats:", err);
        // Fallback for fail-safe
        return new Response(JSON.stringify({ count: 100 }), {
            status: 200,
            headers: corsHeaders
        });
    }
}
