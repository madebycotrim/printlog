import { enviarJSON } from './[[path]]';

/**
 * API DE GERENCIAMENTO DE USUÁRIOS
 * Endpoints: backup de dados, health check e exclusão completa de conta
 */
export async function gerenciarUsuarios({ request, db, userId, pathArray, env }) {
    const method = request.method;

    // ==========================================
    // ENDPOINT: BACKUP DE DADOS DO USUÁRIO
    // ==========================================
    if (method === 'GET' && pathArray.includes('backup')) {
        try {
            // Busca todos os dados do usuário em paralelo
            const [filaments, printers, settings, projects] = await db.batch([
                db.prepare("SELECT * FROM filaments WHERE user_id = ?").bind(userId),
                db.prepare("SELECT * FROM printers WHERE user_id = ?").bind(userId),
                db.prepare("SELECT * FROM calculator_settings WHERE user_id = ?").bind(userId),
                db.prepare("SELECT * FROM projects WHERE user_id = ?").bind(userId)
            ]);

            return enviarJSON({
                success: true,
                data: {
                    metadata: {
                        export_version: "2.0",
                        user_id: userId,
                        generated_at: new Date().toISOString(),
                        system: "PrintLog .SYS"
                    },
                    filaments: filaments.results,
                    printers: printers.results,
                    settings: settings.results[0] || {},
                    // Garante que o campo 'data' do projeto seja parseado corretamente
                    projects: projects.results.map(p => ({
                        ...p,
                        data: typeof p.data === 'string' ? JSON.parse(p.data) : p.data
                    }))
                }
            });
        } catch (err) {
            return enviarJSON({ error: "Erro na extração de dados", details: err.message }, 500);
        }
    }

    // ==========================================
    // ENDPOINT: HEALTH CHECK DO BANCO D1
    // ==========================================
    if (method === 'GET' && pathArray.includes('health')) {
        try {
            const start = Date.now();
            // Consulta leve para testar a conexão com o banco D1
            await db.prepare("SELECT 1").first();
            const latency = Date.now() - start;

            return enviarJSON({
                success: true,
                status: 'online',
                latency: latency
            });
        } catch (_err) {
            return enviarJSON({ success: false, status: 'offline' }, 500);
        }
    }

    // ==========================================
    // ENDPOINT: EXCLUSÃO PERMANENTE DE CONTA
    // ==========================================
    if (method === 'DELETE') {
        try {
            // TODO: Implementar exclusão no Firebase via Admin SDK ou Cloud Functions
            // Por enquanto, apenas removemos os dados do banco D1

            // 2. Remove todos os dados do usuário do banco D1
            await db.batch([
                db.prepare("DELETE FROM filaments WHERE user_id = ?").bind(userId),
                db.prepare("DELETE FROM printers WHERE user_id = ?").bind(userId),
                db.prepare("DELETE FROM calculator_settings WHERE user_id = ?").bind(userId),
                db.prepare("DELETE FROM projects WHERE user_id = ?").bind(userId)
            ]);

            return enviarJSON({ success: true, message: "Dados removidos. A conta deve ser excluída manualmente no Firebase." });
        } catch (err) {
            return enviarJSON({ error: "Erro ao excluir dados", details: err.message }, 500);
        }
    }

    return enviarJSON({ error: "Método não permitido" }, 405);
}