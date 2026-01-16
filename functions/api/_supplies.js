import { enviarJSON, paraNumero } from './_utils';
import { validateInput, schemas, sanitizeFields } from './_validation';
import { cacheQuery, invalidateCache } from './_cache';

/**
 * API DE GERENCIAMENTO DE INSUMOS
 */
export async function gerenciarInsumos({ request, db, userId, tenantId, pathArray, url }) {
    const method = request.method;
    const idFromPath = pathArray[1];

    try {
        // ==========================================
        // GET: LISTAR INSUMOS
        // ==========================================
        if (method === 'GET') {
            const results = await cacheQuery(
                `supplies:${tenantId}`,
                30000,
                async () => {
                    const { results } = await db.prepare("SELECT * FROM supplies WHERE org_id = ? ORDER BY name ASC").bind(tenantId).all();
                    return results || [];
                }
            );
            return enviarJSON(results);
        }

        // ==========================================
        // DELETE: REMOVER INSUMO
        // ==========================================
        if (method === 'DELETE') {
            const id = idFromPath || url.searchParams.get('id');
            if (!id) return enviarJSON({ error: "ID do insumo necessário." }, 400);

            await db.prepare("DELETE FROM supplies WHERE id = ? AND org_id = ?").bind(id, tenantId).run();
            invalidateCache(`supplies:${tenantId}`);

            return enviarJSON({ success: true, message: "Insumo removido com sucesso." });
        }

        // ==========================================
        // POST/PUT: CRIAR OU ATUALIZAR INSUMO
        // ==========================================
        if (['POST', 'PUT'].includes(method)) {
            const rawData = await request.json();
            const id = rawData.id || idFromPath || crypto.randomUUID();

            const validation = validateInput(rawData, schemas.supply);
            if (!validation.valid) {
                return enviarJSON({ error: "Dados inválidos", details: validation.errors }, 400);
            }

            const data = sanitizeFields(rawData, schemas.supply);

            // Upsert
            await db.prepare(`INSERT INTO supplies (id, user_id, org_id, name, price, unit, min_stock, current_stock) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET 
                name=excluded.name, price=excluded.price, unit=excluded.unit, 
                min_stock=excluded.min_stock, current_stock=excluded.current_stock`)
                .bind(
                    id,
                    userId,
                    tenantId,
                    data.name,
                    paraNumero(data.price),
                    data.unit || 'un',
                    paraNumero(data.minStock),
                    paraNumero(data.currentStock)
                ).run();

            invalidateCache(`supplies:${tenantId}`);
            return enviarJSON({ id, ...data, success: true });
        }
    } catch (error) {
        console.error("Erro em insumos:", error);
        return enviarJSON({ error: "Erro ao processar insumos", details: error.message }, 500);
    }
}
