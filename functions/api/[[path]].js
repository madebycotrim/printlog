import { createClerkClient } from '@clerk/backend';

export async function onRequest(context) {
    const { request, env, params } = context;
    const url = new URL(request.url);
    const pathArray = params.path || [];
    const entity = pathArray[0]; 
    const method = request.method;

    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // 1. Resposta para Preflight (CORS)
    if (method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    // 2. Verificação de Chaves Clerk
    if (!env.CLERK_SECRET_KEY || !env.CLERK_PUBLISHABLE_KEY) {
        return Response.json({ error: "Chaves do Clerk não configuradas no painel da Cloudflare." }, { status: 500, headers: corsHeaders });
    }

    try {
        // 3. AUTENTICAÇÃO
        const clerk = createClerkClient({
            secretKey: env.CLERK_SECRET_KEY,
            publishableKey: env.CLERK_PUBLISHABLE_KEY
        });

        const authRequest = await clerk.authenticateRequest(request);
        if (!authRequest.isSignedIn) {
            return Response.json({ error: "Não autorizado" }, { status: 401, headers: corsHeaders });
        }

        const userId = authRequest.toAuth().userId;
        const db = env.DB;

        if (!db) return Response.json({ error: "D1 não conectado." }, { status: 500, headers: corsHeaders });

        // 4. AUTO-MIGRAÇÃO E CORREÇÃO DE SCHEMA (Resolve o erro SQLITE_ERROR: no such column)
        await db.batch([
            db.prepare(`CREATE TABLE IF NOT EXISTS filaments (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, nome TEXT NOT NULL, marca TEXT, material TEXT, cor_hex TEXT, peso_total REAL, peso_atual REAL, preco REAL, data_abertura TEXT, favorito INTEGER DEFAULT 0)`),
            db.prepare(`CREATE TABLE IF NOT EXISTS printers (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, nome TEXT NOT NULL, marca TEXT, modelo TEXT, status TEXT DEFAULT 'idle', potencia REAL DEFAULT 0, preco REAL DEFAULT 0, rendimento_total REAL DEFAULT 0, horas_totais REAL DEFAULT 0, ultima_manutencao_hora REAL DEFAULT 0, intervalo_manutencao REAL DEFAULT 300, historico TEXT)`),
            db.prepare(`CREATE TABLE IF NOT EXISTS calculator_settings (user_id TEXT PRIMARY KEY, custo_kwh REAL, valor_hora_humana REAL, custo_hora_maquina REAL, taxa_setup REAL, consumo_impressora_kw REAL, margem_lucro REAL, imposto REAL, taxa_falha REAL, desconto REAL)`),
            db.prepare(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, label TEXT NOT NULL, data TEXT)`)
        ]);

        // Tenta adicionar a coluna created_at se ela não existir (Ignora erro se já existir)
        const tablesToFix = ['filaments', 'printers', 'projects'];
        for (const table of tablesToFix) {
            try {
                await db.prepare(`ALTER TABLE ${table} ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP`).run();
            } catch (e) { /* Coluna já existe, ignora */ }
        }

        // 5. ROTEAMENTO

        // --- FILAMENTOS ---
        if (entity === 'filaments' || entity === 'filamentos') {
            if (method === 'GET') {
                const { results } = await db.prepare("SELECT * FROM filaments WHERE user_id = ? ORDER BY favorito DESC, created_at DESC").bind(userId).all();
                return Response.json(results || [], { headers: corsHeaders });
            }
            if (method === 'POST') {
                const f = await request.json();
                const id = f.id || crypto.randomUUID();
                await db.prepare(`
                    INSERT INTO filaments (id, user_id, nome, marca, material, cor_hex, peso_total, peso_atual, preco, data_abertura, favorito)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        nome=excluded.nome, marca=excluded.marca, material=excluded.material, cor_hex=excluded.cor_hex,
                        peso_total=excluded.peso_total, peso_atual=excluded.peso_atual, preco=excluded.preco, favorito=excluded.favorito
                `).bind(String(id), userId, String(f.nome), String(f.marca || ""), String(f.material || "PLA"), String(f.cor_hex || "#000000"), Number(f.peso_total), Number(f.peso_atual), Number(f.preco), String(f.data_abertura), f.favorito ? 1 : 0).run();
                return Response.json({ id, ...f }, { status: 201, headers: corsHeaders });
            }
            if (method === 'DELETE') {
                const id = url.searchParams.get('id');
                await db.prepare("DELETE FROM filaments WHERE id = ? AND user_id = ?").bind(id, userId).run();
                return new Response(null, { status: 204, headers: corsHeaders });
            }
        }

        // --- IMPRESSORAS ---
        if (entity === 'printers' || entity === 'impressoras') {
            if (method === 'GET') {
                const { results } = await db.prepare("SELECT * FROM printers WHERE user_id = ? ORDER BY created_at DESC").bind(userId).all();
                return Response.json(results || [], { headers: corsHeaders });
            }
            if (method === 'POST') {
                const p = await request.json();
                const id = p.id || crypto.randomUUID();
                const hist = typeof p.history === 'string' ? p.history : JSON.stringify(p.history || p.historico || []);
                await db.prepare(`
                    INSERT INTO printers (id, user_id, nome, marca, modelo, status, potencia, preco, rendimento_total, horas_totais, ultima_manutencao_hora, intervalo_manutencao, historico)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        nome=excluded.nome, status=excluded.status, potencia=excluded.potencia, preco=excluded.preco, 
                        rendimento_total=excluded.rendimento_total, horas_totais=excluded.horas_totais, 
                        ultima_manutencao_hora=excluded.ultima_manutencao_hora, intervalo_manutencao=excluded.intervalo_manutencao, historico=excluded.historico
                `).bind(String(id), userId, String(p.nome || p.name), String(p.marca || p.brand || ""), String(p.modelo || p.model || ""), String(p.status || "idle"), Number(p.potencia || 0), Number(p.preco || 0), Number(p.rendimento_total || 0), Number(p.horas_totais || 0), Number(p.ultima_manutencao_hora || 0), Number(p.intervalo_manutencao || 300), hist).run();
                return Response.json({ id, ...p }, { status: 201, headers: corsHeaders });
            }
            if (method === 'DELETE') {
                const id = url.searchParams.get('id');
                await db.prepare("DELETE FROM printers WHERE id = ? AND user_id = ?").bind(id, userId).run();
                return new Response(null, { status: 204, headers: corsHeaders });
            }
        }

        // --- CONFIGURAÇÕES ---
        if (entity === 'settings') {
            if (method === 'GET') {
                const data = await db.prepare("SELECT * FROM calculator_settings WHERE user_id = ?").bind(userId).first();
                return Response.json(data || {}, { headers: corsHeaders });
            }
            if (method === 'POST') {
                const s = await request.json();
                await db.prepare(`
                    INSERT INTO calculator_settings (user_id, custo_kwh, valor_hora_humana, custo_hora_maquina, taxa_setup, consumo_impressora_kw, margem_lucro, imposto, taxa_falha, desconto)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(user_id) DO UPDATE SET
                        custo_kwh=excluded.custo_kwh, valor_hora_humana=excluded.valor_hora_humana, custo_hora_maquina=excluded.custo_hora_maquina,
                        taxa_setup=excluded.taxa_setup, consumo_impressora_kw=excluded.consumo_impressora_kw, margem_lucro=excluded.margem_lucro,
                        imposto=excluded.imposto, taxa_falha=excluded.taxa_falha, desconto=excluded.desconto
                `).bind(userId, Number(s.custo_kwh), Number(s.valor_hora_humana), Number(s.custo_hora_maquina), Number(s.taxa_setup), Number(s.consumo_impressora_kw), Number(s.margem_lucro), Number(s.imposto), Number(s.taxa_falha), Number(s.desconto)).run();
                return Response.json({ success: true }, { headers: corsHeaders });
            }
        }

        // --- PROJETOS ---
        if (entity === 'projects') {
            if (method === 'GET') {
                const { results } = await db.prepare("SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC").bind(userId).all();
                const formatted = results.map(r => ({
                    id: r.id,
                    label: r.label,
                    data: JSON.parse(r.data || "{}"),
                    created_at: r.created_at
                }));
                return Response.json(formatted, { headers: corsHeaders });
            }
            if (method === 'POST') {
                const p = await request.json();
                const id = p.id || crypto.randomUUID();
                await db.prepare(`
                    INSERT INTO projects (id, user_id, label, data) 
                    VALUES (?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET label = excluded.label, data = excluded.data
                `).bind(String(id), userId, String(p.label || "Projeto"), JSON.stringify(p.data || {})).run();
                return Response.json({ id, ...p }, { status: 201, headers: corsHeaders });
            }
            if (method === 'DELETE') {
                const id = url.searchParams.get('id');
                if (id) {
                    await db.prepare("DELETE FROM projects WHERE id = ? AND user_id = ?").bind(id, userId).run();
                } else {
                    await db.prepare("DELETE FROM projects WHERE user_id = ?").bind(userId).run();
                }
                return Response.json({ success: true }, { headers: corsHeaders });
            }
        }

        // --- APROVAR ORÇAMENTO ---
        if (entity === 'approve-budget' && method === 'POST') {
            const { projectId, printerId, filaments, totalTime } = await request.json();
            
            const project = await db.prepare("SELECT data FROM projects WHERE id = ? AND user_id = ?").bind(projectId, userId).first();
            if (!project) return Response.json({ error: "Projeto não encontrado" }, { status: 404, headers: corsHeaders });

            let projectData = JSON.parse(project.data || "{}");
            projectData.status = "producao";

            const batch = [
                db.prepare(`UPDATE projects SET data = ? WHERE id = ? AND user_id = ?`).bind(JSON.stringify(projectData), projectId, userId),
                db.prepare(`UPDATE printers SET horas_totais = horas_totais + ?, status = 'printing' WHERE id = ? AND user_id = ?`).bind(Number(totalTime || 0), printerId, userId)
            ];

            if (Array.isArray(filaments)) {
                filaments.forEach(f => {
                    if (f.id && f.id !== 'manual') {
                        batch.push(db.prepare(`UPDATE filaments SET peso_atual = peso_atual - ? WHERE id = ? AND user_id = ?`).bind(Number(f.peso), f.id, userId));
                    }
                });
            }

            await db.batch(batch);
            return Response.json({ success: true }, { headers: corsHeaders });
        }

        return Response.json({ error: "Rota não encontrada" }, { status: 404, headers: corsHeaders });

    } catch (err) {
        console.error("API Error:", err.message);
        return Response.json({ error: "Erro interno", details: err.message }, { status: 500, headers: corsHeaders });
    }
}
