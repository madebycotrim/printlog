import { enviarJSON, paraNumero } from './_utils';
import { validateInput, schemas, sanitizeFields } from './_validation';
import { cacheQuery, invalidateCache } from './_cache';

/**
 * API DE GERENCIAMENTO DE INSUMOS
 */
/**
 * API DE GERENCIAMENTO DE INSUMOS
 */
export async function gerenciarInsumos({ request, db, userId, pathArray, url }) {
    const method = request.method;
    const idFromPath = pathArray[1];
    const subRoute = pathArray[2]; // ex: 'history'

    try {
        // ==========================================
        // GET: LISTAR HISTÓRICO
        // ==========================================
        if (method === 'GET' && subRoute === 'history') {
            if (!idFromPath) return enviarJSON({ error: "ID necessário" }, 400);

            const history = await db.prepare(`
                SELECT * FROM supply_events 
                WHERE supply_id = ? 
                ORDER BY created_at DESC
            `).bind(idFromPath).all();

            return enviarJSON({ history: history.results || [] });
        }

        // ==========================================
        // GET: LISTAR INSUMOS
        // ==========================================
        if (method === 'GET') {
            // Removido cacheQuery por enquanto para simplificar e evitar problemas de cache com org_id
            const { results } = await db.prepare("SELECT * FROM supplies ORDER BY name ASC").all();
            return enviarJSON(results || []);
        }

        // ==========================================
        // DELETE: REMOVER INSUMO
        // ==========================================
        if (method === 'DELETE') {
            const id = idFromPath || url.searchParams.get('id');
            if (!id) return enviarJSON({ error: "ID do insumo necessário." }, 400);

            await db.batch([
                db.prepare("DELETE FROM supplies WHERE id = ?").bind(id),
                db.prepare("DELETE FROM supply_events WHERE supply_id = ?").bind(id)
            ]);

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
            const newStock = paraNumero(data.currentStock);
            const newPrice = paraNumero(data.price);

            // 1. Buscar estado atual para comparação
            const currentItem = await db.prepare("SELECT * FROM supplies WHERE id = ?").bind(id).first();

            const isNew = !currentItem;
            const oldStock = currentItem ? (currentItem.currentStock || 0) : 0;
            const stockDiff = newStock - oldStock;

            // 2. Preparar batch de operações
            const commands = [];

            // Upsert do Insumo
            commands.push(db.prepare(`
                INSERT INTO supplies (id, user_id, name, price, unit, min_stock, current_stock, category, description, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
                ON CONFLICT(id) DO UPDATE SET 
                name=excluded.name, price=excluded.price, unit=excluded.unit, 
                min_stock=excluded.min_stock, current_stock=excluded.current_stock,
                category=excluded.category, description=excluded.description, updated_at=excluded.updated_at
            `).bind(
                id, userId,
                data.name, newPrice, data.unit || 'un',
                paraNumero(data.minStock), newStock,
                rawData.category || rawData.categoria || data.category || 'geral',
                data.description || '',
                new Date().toISOString()
            ));

            // 3. Registrar Evento se houve mudança de estoque ou é novo
            if (isNew || Math.abs(stockDiff) > 0.001) {
                const eventType = isNew ? 'create' : (Math.abs(stockDiff) > 0 ? 'manual' : 'update');

                commands.push(db.prepare(`
                    INSERT INTO supply_events (id, supply_id, user_id, type, old_stock, new_stock, quantity_change, cost, notes)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
                    crypto.randomUUID(),
                    id, userId,
                    eventType,
                    oldStock,
                    newStock,
                    stockDiff,
                    0,
                    isNew ? 'Insumo cadastrado' : 'Ajuste manual de estoque'
                ));
            }

            await db.batch(commands);
            return enviarJSON({ id, ...data, success: true });
        }
    } catch (error) {
        console.error("Erro em insumos:", error);
        return enviarJSON({ error: "Erro ao processar insumos", details: error.message }, 500);
    }
}
