import { jwtVerify, createRemoteJWKSet } from 'jose';
import { gerenciarFilamentos, gerenciarFalhas } from './_filaments';
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
                // Se for uma rota pública, pode passar sem user (ex: webhook), mas por padrão bloqueia API
                // return enviarJSON({ error: "Token de autenticação não fornecido." }, 401);
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

        // ==========================================
        // SINGLE USER CONTEXT (Org Logic Removed)
        // ==========================================
        const tenantId = userId;

        // ==========================================
        // RATE LIMITING (100 req/min por user)
        // ==========================================
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
            case 'setup': return await executarMigracoes(ctx);
            default: return enviarJSON({ error: "Rota não encontrada" }, 404);
        }

    } catch (err) {
        console.error("Erro no worker:", err.message);
        return enviarJSON({ error: "Erro interno no servidor", details: err.message }, 500);
    }
}

async function executarMigracoes(ctx) {
    const { db } = ctx;
    try {
        // 1. Cria tabelas com a nova coluna org_id
        await db.batch([
            // Filamentos
            db.prepare(`CREATE TABLE IF NOT EXISTS filaments (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, org_id TEXT, nome TEXT NOT NULL, marca TEXT, material TEXT, cor_hex TEXT, peso_total REAL, peso_atual REAL, preco REAL, data_abertura TEXT, favorito INTEGER DEFAULT 0, tags TEXT DEFAULT '[]')`),

            // Impressoras
            db.prepare(`CREATE TABLE IF NOT EXISTS printers (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, org_id TEXT, nome TEXT NOT NULL, marca TEXT, modelo TEXT, status TEXT DEFAULT 'idle', potencia REAL DEFAULT 0, preco REAL DEFAULT 0, rendimento_total REAL DEFAULT 0, horas_totais REAL DEFAULT 0, ultima_manutencao_hora REAL DEFAULT 0, intervalo_manutencao REAL DEFAULT 300, historico TEXT)`),

            // Configurações
            db.prepare(`CREATE TABLE IF NOT EXISTS calculator_settings (user_id TEXT PRIMARY KEY, org_id TEXT, custo_kwh REAL, valor_hora_humana REAL, custo_hora_maquina REAL, taxa_setup REAL, consumo_impressora_kw REAL, margem_lucro REAL, imposto REAL, taxa_falha REAL, desconto REAL, whatsapp_template TEXT, theme TEXT DEFAULT 'dark', primary_color TEXT DEFAULT 'sky')`),

            // Projetos
            db.prepare(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, org_id TEXT, label TEXT NOT NULL, data TEXT, tags TEXT DEFAULT '[]', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),

            // Todos
            db.prepare(`CREATE TABLE IF NOT EXISTS todos (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, org_id TEXT, text TEXT NOT NULL, done INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),

            // Falhas
            db.prepare(`CREATE TABLE IF NOT EXISTS failures (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, org_id TEXT, date TEXT, filament_id TEXT, printer_id TEXT, model_name TEXT, weight_wasted REAL, cost_wasted REAL, reason TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),

            // Insumos
            db.prepare(`CREATE TABLE IF NOT EXISTS supplies (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, org_id TEXT, name TEXT NOT NULL, price REAL, unit TEXT, min_stock REAL, current_stock REAL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),

            // Assinaturas (Billing)
            db.prepare(`CREATE TABLE IF NOT EXISTS subscriptions (org_id TEXT PRIMARY KEY, plan_id TEXT NOT NULL, status TEXT, current_period_end TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),

            // Clients
            db.prepare(`CREATE TABLE IF NOT EXISTS clients (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, org_id TEXT, name TEXT NOT NULL, email TEXT, phone TEXT, document TEXT, notes TEXT, address TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),

            // Logs de Auditoria
            db.prepare(`CREATE TABLE IF NOT EXISTS activity_logs (id TEXT PRIMARY KEY, org_id TEXT NOT NULL, user_id TEXT NOT NULL, action TEXT NOT NULL, details TEXT, metadata TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`)
        ]);

        // 2. Tenta adicionar a coluna org_id se ela não existir (Backfill estrutural)
        // D1 não tem "ADD COLUMN IF NOT EXISTS", então tentamos brute-force ignorando erro safe
        const tables = ['filaments', 'printers', 'calculator_settings', 'projects', 'todos', 'failures', 'supplies'];
        for (const table of tables) {
            try {
                await db.prepare(`ALTER TABLE ${table} ADD COLUMN org_id TEXT`).run();
            } catch {
                // Ignora erro se coluna já existir
            }
        }

        // 3. Update existing tables (Add Columns)
        // supplies: category, description, updated_at
        try { await db.prepare("ALTER TABLE supplies ADD COLUMN category TEXT DEFAULT 'Outros'").run(); } catch { }
        try { await db.prepare("ALTER TABLE supplies ADD COLUMN description TEXT").run(); } catch { }
        try { await db.prepare("ALTER TABLE supplies ADD COLUMN updated_at DATETIME").run(); } catch { }

        // 4. Create new tables (if not exists)
        await db.batch([
            // Supply Events (History)
            db.prepare(`CREATE TABLE IF NOT EXISTS supply_events (
                id TEXT PRIMARY KEY, 
                supply_id TEXT NOT NULL, 
                org_id TEXT, 
                user_id TEXT, 
                type TEXT CHECK(type IN ('create', 'update', 'manual', 'abertura', 'delete')), 
                old_stock REAL, 
                new_stock REAL, 
                quantity_change REAL, 
                cost REAL, 
                notes TEXT, 
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`)
        ]);

        // 5. Backfill de Dados: Preenche org_id com user_id onde estiver NULL
        for (const table of tables) {
            await db.prepare(`UPDATE ${table} SET org_id = user_id WHERE org_id IS NULL`).run();
        }

        return enviarJSON({ message: "Banco de dados atualizado para SaaS (Multi-tenancy) com sucesso!" });
    } catch (error) {
        return enviarJSON({ error: "Erro na migração", details: error.message }, 500);
    }
}