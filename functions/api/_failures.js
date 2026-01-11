import { enviarJSON, paraNumero } from './[[path]]';

export async function gerenciarFalhas({ request, db, userId }) {
    const method = request.method;

    try {
        // Inicialização da tabela (executa apenas se não existir)
        await db.prepare(`
            CREATE TABLE IF NOT EXISTS failures (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                date TEXT NOT NULL,
                filament_id TEXT,
                printer_id TEXT,
                model_name TEXT,
                weight_wasted REAL,
                cost_wasted REAL,
                reason TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `).run();

        if (method === 'GET') {
            // Retorna estatísticas e histórico
            const { results } = await db.prepare(`
                SELECT * FROM failures 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT 50
            `).bind(userId).all();

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
            const f = await request.json();
            const id = crypto.randomUUID();
            const date = new Date().toISOString();

            // 1. Registra a falha
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

            // 2. Abate do estoque (se houver ID de filamento válido)
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
