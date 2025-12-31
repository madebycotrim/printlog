// Worker Completo - PrintLog ERP Farm Manager
import { createClerkClient } from '@clerk/backend';

export async function onRequest(context) {
    const { request, env, params } = context;
    const pathArray = params.path || [];
    const entity = pathArray[0];
    const method = request.method;
    const url = new URL(request.url);

    try {
        // 1. VALIDAÇÃO DE AMBIENTE
        if (!env.CLERK_SECRET_KEY || !env.CLERK_PUBLISHABLE_KEY) {
            return Response.json({ error: "Configuração de API Clerk incompleta" }, { status: 500 });
        }

        const clerk = createClerkClient({
            secretKey: env.CLERK_SECRET_KEY,
            publishableKey: env.CLERK_PUBLISHABLE_KEY
        });

        // 2. AUTENTICAÇÃO
        const authRequest = await clerk.authenticateRequest(request);
        if (!authRequest.isSignedIn) {
            return Response.json({ error: "Não autorizado" }, { status: 401 });
        }

        const userId = authRequest.toAuth().userId;
        const db = env.DB; 

        if (!db) return Response.json({ error: "D1 não conectado" }, { status: 500 });

        // 3. AUTO-MIGRAÇÃO (Garante estrutura atualizada)
        await db.batch([
            db.prepare(`
                CREATE TABLE IF NOT EXISTS filaments (
                    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, nome TEXT NOT NULL,
                    marca TEXT, material TEXT, cor_hex TEXT, peso_total REAL,
                    peso_atual REAL, preco REAL, data_abertura TEXT, favorito INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `),
            db.prepare(`
                CREATE TABLE IF NOT EXISTS printers (
                    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, nome TEXT NOT NULL,
                    marca TEXT, modelo TEXT, status TEXT DEFAULT 'idle', potencia REAL DEFAULT 0,
                    preco REAL DEFAULT 0, rendimento_total REAL DEFAULT 0, horas_totais REAL DEFAULT 0,
                    ultima_manutencao_hora REAL DEFAULT 0, intervalo_manutencao REAL DEFAULT 300,
                    historico TEXT DEFAULT '[]', created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `),
            db.prepare(`
                CREATE TABLE IF NOT EXISTS calculator_settings (
                    user_id TEXT PRIMARY KEY, custo_kwh REAL, valor_hora_humana REAL,
                    custo_hora_maquina REAL, taxa_setup REAL, consumo_impressora_kw REAL,
                    margem_lucro REAL, imposto REAL, taxa_falha REAL, desconto REAL
                )
            `),
            db.prepare(`
                CREATE TABLE IF NOT EXISTS projects (
                    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, nome TEXT NOT NULL,
                    payload TEXT, data_criacao TEXT
                )
            `)
        ]);

        // 4. ROTEAMENTO

        // --- FILAMENTOS ---
        if (entity === 'filaments' || entity === 'filamentos') {
            if (method === 'GET') {
                const { results } = await db.prepare("SELECT * FROM filaments WHERE user_id = ? ORDER BY created_at DESC").bind(userId).all();
                return Response.json(results || []);
            }
            if (method === 'POST') {
                const f = await request.json();
                const id = f.id || crypto.randomUUID();
                const pesoTotal = Number(f.peso_total) || 0;
                const pesoAtual = (f.peso_atual !== undefined && f.peso_atual !== null) ? Number(f.peso_atual) : pesoTotal;
                await db.prepare(`
                    INSERT INTO filaments (id, user_id, nome, marca, material, cor_hex, peso_total, peso_atual, preco, data_abertura, favorito)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        nome=excluded.nome, marca=excluded.marca, material=excluded.material, cor_hex=excluded.cor_hex,
                        peso_total=excluded.peso_total, peso_atual=excluded.peso_atual, preco=excluded.preco, favorito=excluded.favorito
                `).bind(id, userId, f.nome, f.marca, f.material, f.cor_hex, pesoTotal, pesoAtual, Number(f.preco), f.data_abertura, f.favorito ? 1 : 0).run();
                return Response.json({ id, ...f });
            }
            if (method === 'DELETE') {
                const id = url.searchParams.get('id');
                await db.prepare("DELETE FROM filaments WHERE id = ? AND user_id = ?").bind(id, userId).run();
                return new Response(null, { status: 204 });
            }
        }

        // --- IMPRESSORAS ---
        if (entity === 'printers' || entity === 'impressoras') {
            if (method === 'GET') {
                const { results } = await db.prepare("SELECT * FROM printers WHERE user_id = ?").bind(userId).all();
                return Response.json(results || []);
            }
            if (method === 'POST') {
                const p = await request.json();
                const id = p.id || crypto.randomUUID();
                await db.prepare(`
                    INSERT INTO printers (id, user_id, nome, marca, modelo, status, potencia, preco, horas_totais)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        nome=excluded.nome, status=excluded.status, potencia=excluded.potencia, horas_totais=excluded.horas_totais
                `).bind(id, userId, p.nome, p.marca, p.modelo, p.status || 'idle', Number(p.potencia), Number(p.preco), Number(p.horas_totais || 0)).run();
                return Response.json({ id, ...p });
            }
        }

        // --- CONFIGURAÇÕES ---
        if (entity === 'settings') {
            if (method === 'GET') {
                const data = await db.prepare("SELECT * FROM calculator_settings WHERE user_id = ?").bind(userId).first();
                return Response.json(data || {});
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
                `).bind(userId, s.custo_kwh, s.valor_hora_humana, s.custo_hora_maquina, s.taxa_setup, s.consumo_impressora_kw, s.margem_lucro, s.imposto, s.taxa_falha, s.desconto).run();
                return Response.json({ success: true });
            }
        }

        // --- PROJETOS (Rascunhos e Updates de Status) ---
        if (entity === 'projects') {
            if (method === 'GET') {
                const { results } = await db.prepare("SELECT * FROM projects WHERE user_id = ? ORDER BY data_criacao DESC").bind(userId).all();
                return Response.json(results.map(r => ({
                    id: r.id,
                    label: r.nome,
                    data: JSON.parse(r.payload),
                    timestamp: new Date(r.data_criacao).toLocaleString('pt-BR')
                })));
            }
            if (method === 'POST') {
                const p = await request.json();
                const id = p.id || crypto.randomUUID();
                const dataStr = new Date().toISOString();
                
                // Suporte para Update de Status e Dados (ON CONFLICT)
                await db.prepare(`
                    INSERT INTO projects (id, user_id, nome, payload, data_criacao) 
                    VALUES (?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        nome=excluded.nome,
                        payload=excluded.payload
                `).bind(id, userId, p.label, JSON.stringify(p.data), dataStr).run();

                return Response.json({ id, label: p.label, timestamp: new Date(dataStr).toLocaleString('pt-BR'), data: p.data });
            }
            if (method === 'DELETE') {
                const id = url.searchParams.get('id');
                if (id) await db.prepare("DELETE FROM projects WHERE id = ? AND user_id = ?").bind(id, userId).run();
                else await db.prepare("DELETE FROM projects WHERE user_id = ?").bind(userId).run();
                return new Response(null, { status: 204 });
            }
        }

        // --- 🚀 ROTA DE APROVAÇÃO (A Mágica do Batch) ---
        if (entity === 'approve-budget' && method === 'POST') {
            const { projectId, printerId, filaments, totalTime } = await request.json();

            const batchOperations = [
                // 1. Atualiza o status do projeto para aprovado dentro do JSON
                db.prepare(`
                    UPDATE projects 
                    SET payload = json_set(payload, '$.status', 'aprovado') 
                    WHERE id = ? AND user_id = ?
                `).bind(projectId, userId),
                
                // 2. Adiciona as horas na impressora
                db.prepare(`
                    UPDATE printers 
                    SET horas_totais = horas_totais + ? 
                    WHERE id = ? AND user_id = ?
                `).bind(Number(totalTime), printerId, userId)
            ];

            // 3. Desconta cada filamento do estoque (Multi-cor ou Único)
            filaments.forEach(f => {
                if (f.id && f.id !== 'manual') {
                    batchOperations.push(
                        db.prepare(`
                            UPDATE filaments 
                            SET peso_atual = peso_atual - ? 
                            WHERE id = ? AND user_id = ?
                        `).bind(Number(f.peso), f.id, userId)
                    );
                }
            });

            await db.batch(batchOperations);
            return Response.json({ success: true, message: "Orçamento aprovado e estoque atualizado!" });
        }

        return Response.json({ error: "Rota não encontrada" }, { status: 404 });

    } catch (err) {
        console.error("Worker Error:", err);
        return Response.json({ error: "Erro interno", details: err.message }, { status: 500 });
    }
}