import { enviarJSON, paraNumero } from './_utils';
import { validateInput, schemas, sanitizeFields } from './_validation';

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
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT 50
            `).bind(userId).all();

            // Calcula estatísticas totais de peso e custo desperdiçados
            const stats = await db.prepare(`
                SELECT 
                    SUM(weight_wasted) as total_weight, 
                    SUM(cost_wasted) as total_cost, 
                    COUNT(*) as total_failures 
                FROM failures 
                WHERE user_id = ?
            `).bind(userId).first();

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
                userId,
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
                const filamento = await db.prepare("SELECT peso_atual FROM filaments WHERE id = ? AND user_id = ?").bind(f.filamentId, userId).first();
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
