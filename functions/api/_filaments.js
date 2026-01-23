import { enviarJSON, paraNumero } from './_utils';
import { validateInput, schemas, sanitizeFields } from './_validation';
import { cacheQuery, invalidateCache } from './_cache';

/**
 * API DE GERENCIAMENTO DE FALHAS
 * Registra falhas de impressão e atualiza automaticamente o estoque de filamentos
 */
export async function gerenciarFalhas({ request, db, userId, tenantId }) {
    const method = request.method;

    try {
        if (method === 'GET') {
            // Retorna histórico de falhas e estatísticas agregadas (Escopo: Tenant)
            const { results } = await db.prepare(`
                SELECT * FROM failures 
                WHERE org_id = ? 
                ORDER BY created_at DESC 
                LIMIT 50
            `).bind(tenantId).all();

            // Calcula estatísticas totais de peso e custo desperdiçados
            const stats = await db.prepare(`
                SELECT 
                    SUM(weight_wasted) as total_weight, 
                    SUM(cost_wasted) as total_cost, 
                    COUNT(*) as total_failures 
                FROM failures 
                WHERE org_id = ?
            `).bind(tenantId).first();

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
                INSERT INTO failures (id, user_id, org_id, date, filament_id, printer_id, model_name, weight_wasted, cost_wasted, reason)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                id,
                userId,     // Autor da ação
                tenantId,   // Dono do dado
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
                const filamento = await db.prepare("SELECT peso_atual FROM filaments WHERE id = ? AND org_id = ?").bind(f.filamentId, tenantId).first();
                if (filamento) {
                    const novoPeso = Math.max(0, filamento.peso_atual - paraNumero(f.weightWasted));
                    await db.prepare("UPDATE filaments SET peso_atual = ? WHERE id = ? AND org_id = ?").bind(novoPeso, f.filamentId, tenantId).run();
                }
            }

            return enviarJSON({ success: true, message: "Falha registrada e estoque atualizado." });
        }

    } catch (error) {
        return enviarJSON({ error: "Erro ao processar falhas", details: error.message }, 500);
    }
}

export async function gerenciarFilamentos({ request, db, userId, tenantId, pathArray, url }) {
    const method = request.method;
    const idFromPath = pathArray[1];

    try {
        if (method === 'GET') {
            // Cache de 30 segundos para lista de filamentos (Key inclui tenantId)
            const results = await cacheQuery(
                `filaments:${tenantId}`,
                30000,
                async () => {
                    const { results } = await db.prepare("SELECT * FROM filaments WHERE org_id = ? ORDER BY favorito DESC, nome ASC").bind(tenantId).all();
                    return results || [];
                }
            );
            return enviarJSON(results);
        }

        if (method === 'DELETE') {
            const id = idFromPath || url.searchParams.get('id');
            if (!id) return enviarJSON({ error: "ID do filamento necessário." }, 400);

            await db.prepare("DELETE FROM filaments WHERE id = ? AND org_id = ?").bind(id, tenantId).run();
            invalidateCache(`filaments:${tenantId}`);

            return enviarJSON({ success: true, message: "Filamento removido com sucesso." });
        }

        if (['POST', 'PUT', 'PATCH'].includes(method)) {
            const rawData = await request.json();
            const id = rawData.id || idFromPath || crypto.randomUUID();

            if (method === 'PATCH') {
                // Atualização parcial (apenas peso ou favorito)
                if (rawData.peso_atual !== undefined) {
                    await db.prepare("UPDATE filaments SET peso_atual = ? WHERE id = ? AND org_id = ?")
                        .bind(paraNumero(rawData.peso_atual), id, tenantId).run();
                }
                if (rawData.favorito !== undefined) {
                    await db.prepare("UPDATE filaments SET favorito = ? WHERE id = ? AND org_id = ?")
                        .bind(rawData.favorito ? 1 : 0, id, tenantId).run();
                }

                invalidateCache(`filaments:${tenantId}`);
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

            await db.prepare(`INSERT INTO filaments (id, user_id, org_id, nome, marca, material, cor_hex, peso_total, peso_atual, preco, data_abertura, favorito, tags) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET 
                nome=excluded.nome, marca=excluded.marca, material=excluded.material, cor_hex=excluded.cor_hex,
                peso_total=excluded.peso_total, peso_atual=excluded.peso_atual, preco=excluded.preco, 
                favorito=excluded.favorito, tags=excluded.tags`)
                .bind(id, userId, tenantId, da.nome, da.marca, da.material, da.cor_hex, paraNumero(da.peso_total),
                    paraNumero(da.peso_atual), paraNumero(da.preco), rawData.data_abertura, da.favorito ? 1 : 0, tags).run();

            invalidateCache(`filaments:${tenantId}`);
            return enviarJSON({ id, ...da, success: true });
        }
    } catch (error) {
        return enviarJSON({ error: "Erro ao processar filamentos", details: error.message }, 500);
    }
}
