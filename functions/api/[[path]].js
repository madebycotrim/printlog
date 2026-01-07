import { createClerkClient } from '@clerk/backend';

export async function onRequest(context) {
    const { request, env, params } = context;
    const url = new URL(request.url);
    const pathArray = params.path || [];
    const entity = pathArray[0]; // filaments, printers, settings, projects, etc.
    const idFromPath = pathArray[1];
    const method = request.method;

    // 1. CONFIGURAÇÃO DE CORS E HELPERS
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Helper para respostas JSON padronizadas
    const sendJSON = (data, status = 200) =>
        Response.json(data, { status, headers: corsHeaders });

    // Helper para converter valores para número seguro (evita NaN no SQLite)
    const toNum = (val, fallback = 0) => {
        const n = Number(val);
        return isNaN(n) ? fallback : n;
    };

    // Resposta rápida para Preflight (CORS)
    if (method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
        // 2. AUTENTICAÇÃO COM CLERK
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

        // 3. MANUTENÇÃO DO SCHEMA (Otimizada para rodar apenas o necessário)
        // Nota: Em produção, o ideal é rodar isso via migrations do Wrangler CLI.
        await db.batch([
            db.prepare(`CREATE TABLE IF NOT EXISTS filaments (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, nome TEXT NOT NULL, marca TEXT, material TEXT, cor_hex TEXT, peso_total REAL, peso_atual REAL, preco REAL, data_abertura TEXT, favorito INTEGER DEFAULT 0)`),
            db.prepare(`CREATE TABLE IF NOT EXISTS printers (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, nome TEXT NOT NULL, marca TEXT, modelo TEXT, status TEXT DEFAULT 'idle', potencia REAL DEFAULT 0, preco REAL DEFAULT 0, rendimento_total REAL DEFAULT 0, horas_totais REAL DEFAULT 0, ultima_manutencao_hora REAL DEFAULT 0, intervalo_manutencao REAL DEFAULT 300, historico TEXT)`),
            db.prepare(`CREATE TABLE IF NOT EXISTS calculator_settings (user_id TEXT PRIMARY KEY, custo_kwh REAL, valor_hora_humana REAL, custo_hora_maquina REAL, taxa_setup REAL, consumo_impressora_kw REAL, margem_lucro REAL, imposto REAL, taxa_falha REAL, desconto REAL, whatsapp_template TEXT)`),
            db.prepare(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, label TEXT NOT NULL, data TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`)
        ]);

        // 4. ROTEAMENTO PRINCIPAL (SWITCH CASE)
        switch (entity) {

            case 'filaments':
            case 'filamentos':
                if (method === 'GET') {
                    const { results } = await db.prepare("SELECT * FROM filaments WHERE user_id = ? ORDER BY favorito DESC, nome ASC").bind(userId).all();
                    return sendJSON(results || []);
                }

                if (method === 'DELETE') {
                    const id = idFromPath || url.searchParams.get('id');
                    await db.prepare("DELETE FROM filaments WHERE id = ? AND user_id = ?").bind(id, userId).run();
                    return new Response(null, { status: 204, headers: corsHeaders });
                }

                if (['POST', 'PUT', 'PATCH'].includes(method)) {
                    const f = await request.json();
                    const id = f.id || idFromPath || crypto.randomUUID();

                    if (method === 'PATCH') {
                        await db.prepare("UPDATE filaments SET peso_atual = ? WHERE id = ? AND user_id = ?")
                            .bind(toNum(f.peso_atual), id, userId).run();
                        return sendJSON({ success: true });
                    }

                    await db.prepare(`INSERT INTO filaments (id, user_id, nome, marca, material, cor_hex, peso_total, peso_atual, preco, data_abertura, favorito) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET 
                        nome=excluded.nome, marca=excluded.marca, material=excluded.material, cor_hex=excluded.cor_hex,
                        peso_total=excluded.peso_total, peso_atual=excluded.peso_atual, favorito=excluded.favorito, preco=excluded.preco`)
                        .bind(id, userId, f.nome, f.marca, f.material, f.cor_hex, toNum(f.peso_total),
                            toNum(f.peso_atual), toNum(f.preco), f.data_abertura, f.favorito ? 1 : 0).run();
                    return sendJSON({ id, ...f });
                }
                break;

            case 'settings':
                if (method === 'GET') {
                    const data = await db.prepare("SELECT * FROM calculator_settings WHERE user_id = ?").bind(userId).first();
                    return sendJSON(data || {});
                }

                if (['POST', 'PUT'].includes(method)) {
                    const s = await request.json();
                    await db.prepare(`INSERT INTO calculator_settings (
                            user_id, custo_kwh, valor_hora_humana, custo_hora_maquina, taxa_setup, 
                            consumo_impressora_kw, margem_lucro, imposto, taxa_falha, desconto, whatsapp_template
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET 
                            custo_kwh=excluded.custo_kwh, valor_hora_humana=excluded.valor_hora_humana, 
                            custo_hora_maquina=excluded.custo_hora_maquina, taxa_setup=excluded.taxa_setup, 
                            consumo_impressora_kw=excluded.consumo_impressora_kw, margem_lucro=excluded.margem_lucro, 
                            imposto=excluded.imposto, taxa_falha=excluded.taxa_falha, desconto=excluded.desconto,
                            whatsapp_template=excluded.whatsapp_template`)
                        .bind(userId, toNum(s.custo_kwh), toNum(s.valor_hora_humana), toNum(s.custo_hora_maquina), toNum(s.taxa_setup),
                            toNum(s.consumo_impressora_kw), toNum(s.margem_lucro), toNum(s.imposto), toNum(s.taxa_falha),
                            toNum(s.desconto), String(s.whatsapp_template || "")).run();
                    return sendJSON({ success: true });
                }
                break;

            case 'printers':
            case 'impressoras':
                if (method === 'GET') {
                    const { results } = await db.prepare("SELECT * FROM printers WHERE user_id = ?").bind(userId).all();
                    return sendJSON(results || []);
                }

                if (method === 'DELETE') {
                    const id = idFromPath || url.searchParams.get('id');
                    await db.prepare("DELETE FROM printers WHERE id = ? AND user_id = ?").bind(id, userId).run();
                    return new Response(null, { status: 204, headers: corsHeaders });
                }

                if (['POST', 'PUT'].includes(method)) {
                    const p = await request.json();
                    const id = p.id || idFromPath || crypto.randomUUID();
                    const historico = JSON.stringify(p.historico || []);

                    await db.prepare(`INSERT INTO printers (id, user_id, nome, marca, modelo, status, potencia, preco, rendimento_total, horas_totais, ultima_manutencao_hora, intervalo_manutencao, historico) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET 
                        nome=excluded.nome, marca=excluded.marca, modelo=excluded.modelo, status=excluded.status, 
                        potencia=excluded.potencia, preco=excluded.preco, rendimento_total=excluded.rendimento_total,
                        horas_totais=excluded.horas_totais, ultima_manutencao_hora=excluded.ultima_manutencao_hora, 
                        intervalo_manutencao=excluded.intervalo_manutencao, historico=excluded.historico`)
                        .bind(id, userId, p.nome || p.name, p.marca || "", p.modelo || "", p.status || 'idle',
                            toNum(p.potencia), toNum(p.preco), toNum(p.rendimento_total),
                            toNum(p.horas_totais), toNum(p.ultima_manutencao_hora),
                            toNum(p.intervalo_manutencao, 300), historico).run();
                    return sendJSON({ id, ...p });
                }
                break;

            case 'projects':
                if (method === 'GET') {
                    const { results } = await db.prepare("SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC").bind(userId).all();
                    const formatted = (results || []).map(r => ({
                        id: r.id,
                        label: r.label || "Sem Nome",
                        data: JSON.parse(r.data || "{}"),
                        created_at: r.created_at
                    }));
                    return sendJSON(formatted);
                }

                if (['POST', 'PUT'].includes(method)) {
                    const p = await request.json();
                    const id = String(p.id || idFromPath || crypto.randomUUID());
                    const label = String(p.label || p.entradas?.nomeProjeto || "Novo Orçamento");
                    const dataStr = JSON.stringify({
                        entradas: p.entradas || p.data?.entradas || {},
                        resultados: p.resultados || p.data?.resultados || {},
                        status: p.status || p.data?.status || 'rascunho'
                    });

                    await db.prepare("INSERT INTO projects (id, user_id, label, data) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET label=excluded.label, data=excluded.data")
                        .bind(id, userId, label, dataStr).run();
                    return sendJSON({ id, label });
                }

                if (method === 'DELETE') {
                    const id = url.searchParams.get('id');
                    if (id) {
                        await db.prepare("DELETE FROM projects WHERE id = ? AND user_id = ?").bind(id, userId).run();
                    } else {
                        await db.prepare("DELETE FROM projects WHERE user_id = ?").bind(userId).run();
                    }
                    return sendJSON({ success: true });
                }
                break;

            case 'approve-budget':
                if (method === 'POST') {
                    const p = await request.json();
                    const projectId = String(p.projectId || "");
                    const printerId = String(p.printerId || "");

                    if (!projectId) return sendJSON({ error: "ID do projeto obrigatório" }, 400);

                    const project = await db.prepare("SELECT data FROM projects WHERE id = ? AND user_id = ?").bind(projectId, userId).first();
                    if (!project) return sendJSON({ error: "Projeto não encontrado" }, 404);

                    let pData = JSON.parse(project.data || "{}");
                    pData.status = "aprovado";

                    const batch = [
                        db.prepare("UPDATE projects SET data = ? WHERE id = ? AND user_id = ?").bind(JSON.stringify(pData), projectId, userId)
                    ];

                    if (printerId) {
                        batch.push(db.prepare("UPDATE printers SET horas_totais = horas_totais + ?, status = 'printing' WHERE id = ? AND user_id = ?")
                            .bind(toNum(p.totalTime), printerId, userId));
                    }

                    if (Array.isArray(p.filaments)) {
                        p.filaments.forEach(f => {
                            if (f.id && f.id !== 'manual') {
                                batch.push(db.prepare("UPDATE filaments SET peso_atual = MAX(0, peso_atual - ?) WHERE id = ? AND user_id = ?")
                                    .bind(toNum(f.peso || f.weight), String(f.id), userId));
                            }
                        });
                    }

                    await db.batch(batch);
                    return sendJSON({ success: true });
                }
                break;

            case 'users':
                // 1. Identificação do Operador
                // Certifique-se que o userId está vindo corretamente do token ou da URL
                const targetUserId = pathArray[2] || userId;

                if (method === 'GET' && pathArray.includes('backup')) {
                    try {
                        // Executamos as queries individualmente ou em batch, 
                        // mas com tratamento para tabelas vazias ou inexistentes.
                        const results = await db.batch([
                            db.prepare("SELECT * FROM filaments WHERE user_id = ?").bind(targetUserId),
                            db.prepare("SELECT * FROM printers WHERE user_id = ?").bind(targetUserId),
                            db.prepare("SELECT * FROM calculator_settings WHERE user_id = ?").bind(targetUserId),
                            db.prepare("SELECT * FROM projects WHERE user_id = ?").bind(targetUserId)
                        ]);

                        // Formatação segura dos resultados
                        const filaments = results[0]?.results || [];
                        const printers = results[1]?.results || [];
                        const settings = results[2]?.results?.length > 0 ? results[2].results[0] : {};
                        const projectsRaw = results[3]?.results || [];

                        const projects = projectsRaw.map(p => {
                            try {
                                return {
                                    ...p,
                                    data: typeof p.data === 'string' ? JSON.parse(p.data) : p.data
                                };
                            } catch (e) {
                                console.error("Erro ao processar JSON do projeto:", p.id);
                                return { ...p, data: {} }; // Fallback para não quebrar o backup
                            }
                        });

                        return sendJSON({
                            success: true,
                            metadata: {
                                operator_id: targetUserId,
                                generated_at: new Date().toISOString(),
                                system_version: "Maker_Core_4.2"
                            },
                            data: {
                                filaments,
                                printers,
                                settings,
                                projects
                            }
                        });

                    } catch (err) {
                        // Este retorno ajudará você a ver o erro real no console do navegador
                        return sendJSON({
                            success: false,
                            error: "Falha técnica no Manifesto",
                            details: err.message,
                            sql_hint: "Verifique se as tabelas filaments, printers, calculator_settings e projects existem no D1."
                        }, 500);
                    }
                }

                if (method === 'DELETE') {
                    try {
                        await db.batch([
                            db.prepare("DELETE FROM filaments WHERE user_id = ?").bind(userId),
                            db.prepare("DELETE FROM printers WHERE user_id = ?").bind(userId),
                            db.prepare("DELETE FROM calculator_settings WHERE user_id = ?").bind(userId),
                            db.prepare("DELETE FROM projects WHERE user_id = ?").bind(userId)
                        ]);

                        return sendJSON({
                            success: true,
                            message: "Expurgo completo realizado no D1."
                        });
                    } catch (err) {
                        return sendJSON({ error: "Erro ao deletar dados", details: err.message }, 500);
                    }
                }
                break;

            default:
                return sendJSON({ error: "Rota não encontrada" }, 404);
        }

    } catch (err) {
        console.error("ERRO NO WORKER:", err.message);
        return sendJSON({ error: "Erro Interno no Servidor", details: err.message }, 500);
    }
}
