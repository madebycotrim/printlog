import { enviarJSON } from './_utils';
import { NIVEL_LOG } from './_constants';

/**
 * Registra uma atividade no log de auditoria
 * @param {Object} db - D1 Database
 * @param {string} userId - ID do Usuário que realizou a ação
 * @param {string} acao - Código da ação (ex: 'PRINTER_CREATED')
 * @param {string} detalhes - Detalhes legíveis
 * @param {Object} metadados - (Opcional) Metadados JSON extras
 * @param {string} nivel - Nível do log (info, warning, error)
 * @param {Request} request - Objeto Request original (para pegar IP/UA)
 */
export async function logActivity(db, userId, acao, detalhes, metadados = {}, nivel = NIVEL_LOG.INFO, request = null) {
    try {
        const id = crypto.randomUUID();
        const ipAddress = request?.headers.get('cf-connecting-ip') ||
            request?.headers.get('x-forwarded-for') ||
            'unknown';
        const userAgent = request?.headers.get('user-agent') || 'unknown';

        await db.prepare(`
            INSERT INTO sistema_log (id, usuario_id, acao, detalhes, metadados, ip_address, user_agent, nivel)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            id,
            userId,
            acao,
            detalhes,
            JSON.stringify(metadados),
            ipAddress,
            userAgent,
            nivel
        ).run();
    } catch (e) {
        console.error("Falha ao registrar log:", e);
    }
}

/**
 * API: Ler Logs de Auditoria
 */
export async function gerenciarAuditoria({ request, db, userId }) {
    if (request.method !== 'GET') return enviarJSON({ error: "Método não permitido" }, 405);

    try {
        const logs = await db.prepare(`
            SELECT * FROM sistema_log 
            ORDER BY criado_em DESC 
            LIMIT 100
        `).all();

        return enviarJSON(logs.results || []);
    } catch {
        return enviarJSON({ error: "Erro ao buscar logs" }, 500);
    }
}
