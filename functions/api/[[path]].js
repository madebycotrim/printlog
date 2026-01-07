import { createClerkClient } from '@clerk/backend';
import { handleFilaments } from './_filaments';
import { handlePrinters } from './_printers';
import { handleSettings } from './_settings';
import { handleProjects } from './_projects';
import { handleApprove } from './_approve';
import { handleUsers } from './_users';

export const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const sendJSON = (data, status = 200) =>
    Response.json(data, { status, headers: corsHeaders });

export const toNum = (val, fallback = 0) => {
    const n = Number(val);
    return isNaN(n) ? fallback : n;
};

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
            return sendJSON({ error: "Não autorizado" }, 401);
        }

        const userId = authRequest.toAuth().userId;
        const db = env.DB;

        // MANUTENÇÃO DO SCHEMA (Original)
        await db.batch([
            db.prepare(`CREATE TABLE IF NOT EXISTS filaments (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, nome TEXT NOT NULL, marca TEXT, material TEXT, cor_hex TEXT, peso_total REAL, peso_atual REAL, preco REAL, data_abertura TEXT, favorito INTEGER DEFAULT 0)`),
            db.prepare(`CREATE TABLE IF NOT EXISTS printers (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, nome TEXT NOT NULL, marca TEXT, modelo TEXT, status TEXT DEFAULT 'idle', potencia REAL DEFAULT 0, preco REAL DEFAULT 0, rendimento_total REAL DEFAULT 0, horas_totais REAL DEFAULT 0, ultima_manutencao_hora REAL DEFAULT 0, intervalo_manutencao REAL DEFAULT 300, historico TEXT)`),
            db.prepare(`CREATE TABLE IF NOT EXISTS calculator_settings (user_id TEXT PRIMARY KEY, custo_kwh REAL, valor_hora_humana REAL, custo_hora_maquina REAL, taxa_setup REAL, consumo_impressora_kw REAL, margem_lucro REAL, imposto REAL, taxa_falha REAL, desconto REAL, whatsapp_template TEXT)`),
            db.prepare(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, label TEXT NOT NULL, data TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`)
        ]);

        const ctx = { request, db, userId, pathArray, url, params };

        switch (entity) {
            case 'filaments': case 'filamentos': return await handleFilaments(ctx);
            case 'printers': case 'impressoras': return await handlePrinters(ctx);
            case 'settings': return await handleSettings(ctx);
            case 'projects': return await handleProjects(ctx);
            case 'approve-budget': return await handleApprove(ctx);
            case 'users': return await handleUsers(ctx);
            default: return sendJSON({ error: "Rota não encontrada" }, 404);
        }

    } catch (err) {
        console.error("ERRO NO WORKER:", err.message);
        return sendJSON({ error: "Erro Interno no Servidor", details: err.message }, 500);
    }
}
