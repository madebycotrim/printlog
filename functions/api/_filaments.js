import { enviarJSON, paraNumero } from './_utils';
import { validateInput, schemas, sanitizeFields } from './_validation';
import { cacheQuery, invalidateCache } from './_cache';

/**
 * API DE GERENCIAMENTO DE FALHAS
 * Registra falhas de impressão e atualiza automaticamente o estoque de filamentos
 */
/**
 * API DE GERENCIAMENTO DE FALHAS
 * Registra falhas de impressão e atualiza automaticamente o estoque de filamentos
 */
export async function gerenciarFalhas({ request, db, userId }) {
    const method = request.method;

    try {
        if (method === 'GET') {
            // Retorna histórico de falhas e estatísticas agregadas
            const { results } = await db.prepare(`
                SELECT * FROM failures 
                ORDER BY created_at DESC 
                LIMIT 50
            `).all();

            // Calcula estatísticas totais de peso e custo desperdiçados
            const stats = await db.prepare(`
                SELECT 
                    SUM(weight_wasted) as total_weight, 
                    SUM(cost_wasted) as total_cost, 
                    COUNT(*) as total_failures 
                FROM failures 
            `).first();

            return enviarJSON({
                history: results || [],
                stats: {
                    totalWeight: stats?.total_weight || 0,
                    totalCost: stats?.total_cost || 0,
                    count: stats?.total_failures || 0
                }
            });
        }

        if (method === 'POST') {
            const rawData = await request.json();

            const validation = validateInput(rawData, schemas.failure);
            if (!validation.valid) {
                return enviarJSON({ error: "Dados inválidos", details: validation.errors }, 400);
            }

            const f = sanitizeFields(rawData, schemas.failure);
            const id = crypto.randomUUID();
            const date = new Date().toISOString();

            // 1. Registra a falha no histórico
            await db.prepare(`
                INSERT INTO failures (id, user_id, date, filament_id, printer_id, model_name, weight_wasted, cost_wasted, reason)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                id,
                userId,     // Autor da ação
                date,
                f.filamentId,
                f.printerId,
                f.modelName || "Impressão sem nome",
                paraNumero(f.weightWasted),
                paraNumero(f.costWasted),
                f.reason || "Falha genérica"
            ).run();

            // 2. Deduz automaticamente o peso desperdiçado do estoque (se houver filamento vinculado)
            if (f.filamentId && f.filamentId !== 'manual') {
                const filamento = await db.prepare("SELECT peso_atual FROM filaments WHERE id = ?").bind(f.filamentId).first();
                if (filamento) {
                    const novoPeso = Math.max(0, filamento.peso_atual - paraNumero(f.weightWasted));
                    await db.prepare("UPDATE filaments SET peso_atual = ? WHERE id = ?").bind(novoPeso, f.filamentId).run();
                }
            }

            return enviarJSON({ success: true, message: "Falha registrada e estoque atualizado." });
        }

    } catch (error) {
        return enviarJSON({ error: "Erro ao processar falhas", details: error.message }, 500);
    }
}

export async function gerenciarFilamentos({ request, db, userId, pathArray, url }) {
    const method = request.method;
    const idFromPath = pathArray[1];

    try {
        if (method === 'GET') {
            // Rota de Histórico Individual: /filaments/:id/history
            if (pathArray[2] === 'history' && idFromPath) {
                const filamentId = idFromPath;

                // 1. Buscar Falhas
                const failures = await db.prepare("SELECT * FROM failures WHERE filament_id = ? ORDER BY date DESC").bind(filamentId).all();

                // 2. Buscar Consumo em Projetos (Aprovados ou não, se já teve cálculo/uso)
                const { results: allProjects } = await db.prepare("SELECT * FROM projects ORDER BY created_at DESC LIMIT 100").all();

                const consumptions = [];
                (allProjects || []).forEach(proj => {
                    try {
                        const data = JSON.parse(proj.data || "{}");
                        // Verifica se este filamento está listado nos inputs do projeto
                        if (Array.isArray(data.entradas?.filamentos)) {
                            const usage = data.entradas.filamentos.find(f => String(f.id) === String(filamentId));
                            // Se tiver uso > 0
                            if (usage && (usage.peso || usage.weight)) {
                                consumptions.push({
                                    id: proj.id,
                                    date: proj.created_at,
                                    type: 'consumo', // Frontend pode tratar isso como 'Impressão'
                                    qtd: paraNumero(usage.peso || usage.weight),
                                    obs: data.entradas?.nomeProjeto || proj.label || "Projeto / Impressão",
                                    status: data.status // Passa status para frontend mostrar (Rascunho/Aprovado)
                                });
                            }
                        }
                    } catch (e) { }
                });

                // 3. Buscar Dados do Filamento (Abertura)
                const filament = await db.prepare("SELECT * FROM filaments WHERE id = ?").bind(filamentId).first();
                const opening = filament ? [{
                    id: 'opening',
                    date: filament.data_abertura || filament.created_at || new Date().toISOString(),
                    type: 'abertura',
                    qtd: 0,
                    obs: 'Carretel Aberto'
                }] : [];

                // 4. Buscar Logs Manuais (Tabela nova de logs de ajuste)
                let manualLogs = [];
                try {
                    // Tenta buscar, se tabela não existir vai dar erro (catch ignora) ou retorna vazio
                    const { results } = await db.prepare("SELECT * FROM filament_logs WHERE filament_id = ? ORDER BY date DESC").bind(filamentId).all();
                    if (results) {
                        manualLogs = results.map(l => ({
                            id: l.id,
                            date: l.date,
                            type: 'manual',
                            qtd: l.amount,
                            obs: l.obs || "Ajuste Manual"
                        }));
                    }
                } catch (e) { }

                // 5. Normalizar Falhas
                const normalizedFailures = (failures.results || []).map(f => ({
                    id: f.id,
                    date: f.date,
                    type: 'falha',
                    qtd: f.weight_wasted,
                    obs: f.reason || "Falha Registrada"
                }));

                // 6. Combinar e Ordenar
                const history = [...opening, ...consumptions, ...normalizedFailures, ...manualLogs].sort((a, b) => new Date(b.date) - new Date(a.date));

                // 7. Calcular Estatísticas
                const totalConsumed = history.reduce((acc, h) => acc + (h.qtd || 0), 0);
                const firstDate = new Date(opening[0]?.date || new Date());
                const now = new Date();
                const daysActive = Math.max(1, Math.floor((now - firstDate) / (1000 * 60 * 60 * 24)));
                const dailyAvg = totalConsumed / daysActive;

                return enviarJSON({
                    history,
                    stats: {
                        dailyAvg,
                        daysActive,
                        totalConsumed
                    }
                });
            }

            // Sem cache por enquanto
            const { results } = await db.prepare("SELECT * FROM filaments ORDER BY favorito DESC, nome ASC").all();
            return enviarJSON(results || []);
        }

        if (method === 'DELETE') {
            const id = idFromPath || url.searchParams.get('id');
            if (!id) return enviarJSON({ error: "ID do filamento necessário." }, 400);

            await db.prepare("DELETE FROM filaments WHERE id = ?").bind(id).run();
            // invalidateCache(`filaments:${tenantId}`);

            return enviarJSON({ success: true, message: "Filamento removido com sucesso." });
        }

        if (['POST', 'PUT', 'PATCH'].includes(method)) {
            const rawData = await request.json();
            const id = rawData.id || idFromPath || crypto.randomUUID();

            if (method === 'PATCH') {
                // Atualização parcial (apenas peso ou favorito)
                if (rawData.peso_atual !== undefined) {
                    const novoPeso = paraNumero(rawData.peso_atual);

                    // Busca peso antigo para calcular diferença e logar
                    const current = await db.prepare("SELECT peso_atual FROM filaments WHERE id = ?").bind(id).first();
                    if (current) {
                        const diff = (current.peso_atual || 0) - novoPeso;
                        // Se houve redução (consumo), loga. Se for aumento (correçâo), loga também?
                        // Vamos logar qualquer mudança significativa (> 1g) como ajuste manual
                        if (Math.abs(diff) >= 1) {
                            try {
                                await db.prepare(`CREATE TABLE IF NOT EXISTS filament_logs (
                                    id TEXT PRIMARY KEY, filament_id TEXT, date TEXT, type TEXT, amount REAL, obs TEXT
                                )`).run();

                                await db.prepare(`INSERT INTO filament_logs (id, filament_id, date, type, amount, obs) VALUES (?, ?, ?, ?, ?, ?)`)
                                    .bind(crypto.randomUUID(), id, new Date().toISOString(), 'manual', diff, "Ajuste Manual (Baixa/Correção)").run();
                            } catch (e) { console.error("Erro ao logar ajuste:", e); }
                        }
                    }

                    await db.prepare("UPDATE filaments SET peso_atual = ? WHERE id = ?")
                        .bind(novoPeso, id).run();
                }
                if (rawData.favorito !== undefined) {
                    await db.prepare("UPDATE filaments SET favorito = ? WHERE id = ?")
                        .bind(rawData.favorito ? 1 : 0, id).run();
                }

                // invalidateCache(`filaments:${tenantId}`);
                return enviarJSON({ success: true, message: "Filamento atualizado." });
            }

            // Validação completa para Criar/Editar
            const validation = validateInput(rawData, schemas.filament);
            if (!validation.valid) {
                return enviarJSON({ error: "Dados inválidos", details: validation.errors }, 400);
            }

            const da = sanitizeFields(rawData, schemas.filament);
            // Campos extras que não estão na validação mas salvamos
            const tags = JSON.stringify(rawData.tags || []);

            await db.prepare(`INSERT INTO filaments (id, user_id, nome, marca, material, cor_hex, peso_total, peso_atual, preco, data_abertura, favorito, tags) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET 
                nome=excluded.nome, marca=excluded.marca, material=excluded.material, cor_hex=excluded.cor_hex,
                peso_total=excluded.peso_total, peso_atual=excluded.peso_atual, preco=excluded.preco, 
                favorito=excluded.favorito, tags=excluded.tags`)
                .bind(id, userId, da.nome, da.marca, da.material, da.cor_hex, paraNumero(da.peso_total),
                    paraNumero(da.peso_atual), paraNumero(da.preco), rawData.data_abertura, da.favorito ? 1 : 0, tags).run();

            // invalidateCache(`filaments:${tenantId}`);
            return enviarJSON({ id, ...da, success: true });
        }
    } catch (error) {
        return enviarJSON({ error: "Erro ao processar filamentos", details: error.message }, 500);
    }
}
