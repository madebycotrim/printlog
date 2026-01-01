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

    if (method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
        const clerk = createClerkClient({ 
            secretKey: env.CLERK_SECRET_KEY, 
            publishableKey: env.CLERK_PUBLISHABLE_KEY 
        });

        const authRequest = await clerk.authenticateRequest(request);
        if (!authRequest.isSignedIn) return Response.json({ error: "Não autorizado" }, { status: 401, headers: corsHeaders });

        const userId = authRequest.toAuth().userId;
        const db = env.DB;

        // --- MANUTENÇÃO AUTOMÁTICA ---
        await db.batch([
            db.prepare(`CREATE TABLE IF NOT EXISTS filaments (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, nome TEXT NOT NULL, marca TEXT, material TEXT, cor_hex TEXT, peso_total REAL, peso_atual REAL, preco REAL, data_abertura TEXT, favorito INTEGER DEFAULT 0)`),
            db.prepare(`CREATE TABLE IF NOT EXISTS printers (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, nome TEXT NOT NULL, marca TEXT, modelo TEXT, status TEXT DEFAULT 'idle', potencia REAL DEFAULT 0, preco REAL DEFAULT 0, rendimento_total REAL DEFAULT 0, horas_totais REAL DEFAULT 0, ultima_manutencao_hora REAL DEFAULT 0, intervalo_manutencao REAL DEFAULT 300, historico TEXT)`),
            db.prepare(`CREATE TABLE IF NOT EXISTS calculator_settings (user_id TEXT PRIMARY KEY, custo_kwh REAL, valor_hora_humana REAL, custo_hora_maquina REAL, taxa_setup REAL, consumo_impressora_kw REAL, margem_lucro REAL, imposto REAL, taxa_falha REAL, desconto REAL)`),
            db.prepare(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, label TEXT NOT NULL, data TEXT)`)
        ]);

        // --- ROTEAMENTO ---

        // PROJECTS
        if (entity === 'projects') {
            if (method === 'GET') {
                let results;
                try {
                    // Tenta ordenar por created_at
                    const query = await db.prepare("SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC").bind(userId).all();
                    results = query.results;
                } catch (e) {
                    // Fallback caso a coluna ainda não tenha sido criada manualmente
                    const query = await db.prepare("SELECT * FROM projects WHERE user_id = ? ORDER BY id DESC").bind(userId).all();
                    results = query.results;
                }

                const formatted = (results || []).map(r => ({
                    id: r.id,
                    label: r.label || r.nome || "Sem Nome",
                    data: JSON.parse(r.data || r.payload || "{}"),
                    created_at: r.created_at || ""
                }));
                return Response.json(formatted, { headers: corsHeaders });
            }
            if (method === 'POST') {
                const p = await request.json();
                const id = p.id || crypto.randomUUID();
                const label = p.label || p.nome || "Novo Orçamento";
                const dataStr = JSON.stringify(p.data || p.payload || {});
                await db.prepare("INSERT INTO projects (id, user_id, label, data) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET label=excluded.label, data=excluded.data")
                    .bind(id, userId, label, dataStr).run();
                return Response.json({ id, label, data: JSON.parse(dataStr) }, { headers: corsHeaders });
            }
            if (method === 'DELETE') {
                const id = url.searchParams.get('id');
                if (id) await db.prepare("DELETE FROM projects WHERE id = ? AND user_id = ?").bind(id, userId).run();
                else await db.prepare("DELETE FROM projects WHERE user_id = ?").bind(userId).run();
                return Response.json({ success: true }, { headers: corsHeaders });
            }
        }

        // PRINTERS
        if (entity === 'printers' || entity === 'impressoras') {
            if (method === 'GET') {
                const { results } = await db.prepare("SELECT * FROM printers WHERE user_id = ?").bind(userId).all();
                return Response.json(results || [], { headers: corsHeaders });
            }
            if (method === 'POST') {
                const p = await request.json();
                const id = p.id || crypto.randomUUID();
                const h = JSON.stringify(p.history || p.historico || []);
                await db.prepare(`INSERT INTO printers (id, user_id, nome, marca, modelo, status, potencia, preco, rendimento_total, horas_totais, ultima_manutencao_hora, intervalo_manutencao, historico) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET nome=excluded.nome, status=excluded.status, horas_totais=excluded.horas_totais, historico=excluded.historico`)
                    .bind(id, userId, p.nome || p.name || "Impressora", p.marca || p.brand || "", p.modelo || p.model || "", p.status || 'idle', Number(p.potencia || 0), Number(p.preco || 0), Number(p.rendimento_total || 0), Number(p.horas_totais || 0), Number(p.ultima_manutencao_hora || 0), Number(p.intervalo_manutencao || 300), h).run();
                return Response.json({ id, ...p }, { headers: corsHeaders });
            }
            if (method === 'DELETE') {
                const id = url.searchParams.get('id');
                await db.prepare("DELETE FROM printers WHERE id = ? AND user_id = ?").bind(id, userId).run();
                return new Response(null, { status: 204, headers: corsHeaders });
            }
        }

        // FILAMENTS
        if (entity === 'filaments' || entity === 'filamentos') {
            if (method === 'GET') {
                const { results } = await db.prepare("SELECT * FROM filaments WHERE user_id = ? ORDER BY favorito DESC, nome ASC").bind(userId).all();
                return Response.json(results || [], { headers: corsHeaders });
            }
            if (method === 'POST') {
                const f = await request.json();
                const id = f.id || crypto.randomUUID();
                await db.prepare(`INSERT INTO filaments (id, user_id, nome, marca, material, cor_hex, peso_total, peso_atual, preco, data_abertura, favorito) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET nome=excluded.nome, peso_atual=excluded.peso_atual, favorito=excluded.favorito`)
                    .bind(id, userId, f.nome, f.marca, f.material, f.cor_hex, Number(f.peso_total || 0), Number(f.peso_atual || 0), Number(f.preco || 0), f.data_abertura, f.favorito ? 1 : 0).run();
                return Response.json({ id, ...f }, { headers: corsHeaders });
            }
            if (method === 'DELETE') {
                const id = url.searchParams.get('id');
                await db.prepare("DELETE FROM filaments WHERE id = ? AND user_id = ?").bind(id, userId).run();
                return new Response(null, { status: 204, headers: corsHeaders });
            }
        }

        // SETTINGS
        if (entity === 'settings') {
            if (method === 'GET') {
                const data = await db.prepare("SELECT * FROM calculator_settings WHERE user_id = ?").bind(userId).first();
                return Response.json(data || {}, { headers: corsHeaders });
            }
            if (method === 'POST') {
                const s = await request.json();
                await db.prepare(`INSERT INTO calculator_settings (user_id, custo_kwh, valor_hora_humana, custo_hora_maquina, taxa_setup, consumo_impressora_kw, margem_lucro, imposto, taxa_falha, desconto) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET custo_kwh=excluded.custo_kwh, margem_lucro=excluded.margem_lucro`)
                    .bind(userId, Number(s.custo_kwh || 0), Number(s.valor_hora_humana || 0), Number(s.custo_hora_maquina || 0), Number(s.taxa_setup || 0), Number(s.consumo_impressora_kw || 0), Number(s.margem_lucro || 0), Number(s.imposto || 0), Number(s.taxa_falha || 0), Number(s.desconto || 0)).run();
                return Response.json({ success: true }, { headers: corsHeaders });
            }
        }

        // APPROVE BUDGET
        if (entity === 'approve-budget' && method === 'POST') {
            const { projectId, printerId, filaments, totalTime } = await request.json();
            const project = await db.prepare("SELECT data FROM projects WHERE id = ? AND user_id = ?").bind(projectId, userId).first();
            if (!project) return Response.json({ error: "Projeto não encontrado" }, { status: 404, headers: corsHeaders });

            let pData = JSON.parse(project.data || project.payload || "{}");
            pData.status = "producao";

            const batch = [
                db.prepare("UPDATE projects SET data = ? WHERE id = ? AND user_id = ?").bind(JSON.stringify(pData), projectId, userId),
                db.prepare("UPDATE printers SET horas_totais = horas_totais + ?, status = 'printing' WHERE id = ? AND user_id = ?").bind(Number(totalTime || 0), printerId, userId)
            ];

            if (Array.isArray(filaments)) {
                filaments.forEach(f => {
                    if (f.id && f.id !== 'manual') batch.push(db.prepare("UPDATE filaments SET peso_atual = peso_atual - ? WHERE id = ? AND user_id = ?").bind(Number(f.peso), f.id, userId));
                });
            }
            await db.batch(batch);
            return Response.json({ success: true }, { headers: corsHeaders });
        }

        return Response.json({ error: "Rota não encontrada" }, { status: 404, headers: corsHeaders });
    } catch (err) {
        return Response.json({ error: "Erro Interno", details: err.message }, { status: 500, headers: corsHeaders });
    }
}
