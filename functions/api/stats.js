// import { createClerkClient } from '@clerk/backend';
import { calcularUsoArmazenamento } from './_helpers';

// Helper de CORS
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': '*',
};

const MAX_STORAGE = 50 * 1024 * 1024; // 50MB

export async function gerenciarStats(context) {
    if (context.request.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }



    const { env } = context;

    try {
        const url = new URL(context.request.url);
        const userId = url.searchParams.get("userId"); // Pass userId from frontend

        // 1. Get Global DB Stats (for admin/monitoring)
        const pageSize = (await env.DB.prepare("PRAGMA page_size").first())?.page_size || 4096;
        const pageCount = (await env.DB.prepare("PRAGMA page_count").first())?.page_count || 0;
        const totalDbSize = pageSize * pageCount;

        let userUsage = 0;

        // 2. Calculate User Usage (if userId provided)
        if (userId) {
            userUsage = await calcularUsoArmazenamento(env.DB, userId);

            // 3. Get Item Counts for Dashboard
            const pFilaments = env.DB.prepare("SELECT COUNT(*) as count FROM filamentos WHERE usuario_id = ?").bind(userId).first();
            const pPrinters = env.DB.prepare("SELECT COUNT(*) as count FROM impressoras WHERE usuario_id = ?").bind(userId).first();
            const pClients = env.DB.prepare("SELECT COUNT(*) as count FROM clientes WHERE usuario_id = ?").bind(userId).first();
            const pProjects = env.DB.prepare("SELECT COUNT(*) as count FROM projetos WHERE usuario_id = ?").bind(userId).first();
            const pSupplies = env.DB.prepare("SELECT COUNT(*) as count FROM insumos WHERE usuario_id = ?").bind(userId).first();

            const [filaments, printers, clients, projects, supplies] = await Promise.all([
                pFilaments, pPrinters, pClients, pProjects, pSupplies
            ]);

            return new Response(JSON.stringify({
                count: 0, // Legacy field
                dbSize: totalDbSize,
                userUsage: userUsage,
                maxStorage: MAX_STORAGE,
                percentage: (userUsage / MAX_STORAGE) * 100,
                counts: {
                    filaments: filaments?.count || 0,
                    printers: printers?.count || 0,
                    clients: clients?.count || 0,
                    projects: projects?.count || 0,
                    supplies: supplies?.count || 0
                }
            }), {
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                }
            });
        }

        return new Response(JSON.stringify({
            count: 0,
            dbSize: totalDbSize,
            userUsage: 0,
            maxStorage: MAX_STORAGE,
            percentage: 0,
            counts: { filaments: 0, printers: 0, clients: 0, projects: 0, supplies: 0 }
        }), {
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        });
    } catch (err) {
        console.error("Erro ao buscar stats:", err);
        return new Response(JSON.stringify({ count: 0, error: err.message }), {
            status: 200,
            headers: corsHeaders
        });
    }
}
