import { enviarJSON } from './_utils';

/**
 * Registra uma atividade no log de auditoria
 * @param {Object} db - D1 Database
 * @param {string} orgId - ID da Organização
 * @param {string} userId - ID do Usuário que realizou a ação
 * @param {string} action - Código da ação (ex: 'PRINTER_CREATED')
 * @param {string} details - Detalhes legíveis (ex: 'Printer Voron 2.4 created')
 * @param {Object} metadata - (Opcional) Metadados JSON extras
 */
export async function logActivity(db, orgId, userId, action, details, metadata = {}) {
    try {
        const id = crypto.randomUUID();
        await db.prepare(`
            INSERT INTO activity_logs (id, org_id, user_id, action, details, metadata)
            VALUES (?, ?, ?, ?, ?, ?)
        `).bind(id, orgId, userId, action, details, JSON.stringify(metadata)).run();
    } catch (e) {
        console.error("Falha ao registrar log:", e);
        // Não quebrar o fluxo principal se o log falhar
    }
}

/**
 * API: Ler Logs de Auditoria
 */
export async function gerenciarAuditoria({ request, db, tenantId }) {
    if (request.method !== 'GET') return enviarJSON({ error: "Método não permitido" }, 405);

    try {
        const logs = await db.prepare(`
            SELECT * FROM activity_logs 
            WHERE org_id = ? 
            ORDER BY created_at DESC 
            LIMIT 100
        `).bind(tenantId).all();

        return enviarJSON(logs.results || []);
    } catch {
        return enviarJSON({ error: "Erro ao buscar logs" }, 500);
    }
}
