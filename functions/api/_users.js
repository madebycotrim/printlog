import { enviarJSON } from './_utils';

/**
 * API DE GERENCIAMENTO DE USUÁRIOS
 * Endpoints: backup, health e exclusão (Strict Schema Match)
 */
export async function gerenciarUsuarios(ctx) {
    try {
        const { request, db, userId, pathArray } = ctx;
        const method = request.method;

        if (!userId) {
            return enviarJSON({ error: "DEBUG: userId is missing" }, 400);
        }

        // ==========================================
        // ENDPOINT: EXCLUSÃO PERMANENTE 
        // ==========================================
        if (method === 'DELETE') {
            try {
                // Baseado estritamente no full_schema.sql que o usuário confirmou
                // Apenas tabelas que possuem 'usuario_id' são listadas aqui.
                // 'assinaturas' foi removida pois não tem coluna de dono no schema.
                const tablesPT = [
                    'filamentos',
                    'filamentos_log',
                    'impressoras',
                    'impressoras_log',
                    'configuracoes_calculadora',
                    'projetos',
                    'tarefas',
                    'insumos',
                    'insumos_log',
                    'clientes'
                    // 'sistema_log' // MANTIDO PARA AUDITORIA/SEGURANÇA (LGPD)
                ];

                // Tabelas legadas (Inglês) para garantir limpeza de lixo antigo
                // 'subscriptions' e 'activity_logs' MANTIDOS (RETENÇÃO LEGAL/TECNICA)
                const tablesEN = [
                    'filaments', 'printers', 'calculator_settings',
                    'projects', 'supplies', 'todos', 'failures',
                    'clients', 'supply_events',
                    'filament_logs'
                ];

                const results = [];

                // 1. Processar Tabelas PT (usuario_id)
                for (const table of tablesPT) {
                    try {
                        const stmt = db.prepare(`DELETE FROM ${table} WHERE usuario_id = ?`);
                        await stmt.bind(userId).run();
                        results.push(`${table}: OK`);
                    } catch (e) {
                        // Ignora erro se tabela não existir
                        if (e.message?.includes('no such table')) {
                            // results.push(`${table}: Skipped`);
                        } else {
                            results.push(`${table}: Error (${e.message})`);
                        }
                    }
                }

                // 2. Processar Tabelas EN (user_id / org_id)
                for (const table of tablesEN) {
                    try {
                        // Tenta user_id primeiro
                        let col = 'user_id';
                        if (table === 'subscriptions') col = 'org_id';

                        const stmt = db.prepare(`DELETE FROM ${table} WHERE ${col} = ?`);
                        await stmt.bind(userId).run();
                        results.push(`${table}: OK`);
                    } catch (e) {
                        // Ignora table not found ou column not found
                    }
                }

                return enviarJSON({
                    success: true,
                    message: "Conta excluída com sucesso.",
                    details: results
                });

            } catch (innerErr) {
                return enviarJSON({
                    success: false,
                    error: "LOGIC_ERROR",
                    details: innerErr.message,
                    stack: innerErr.stack
                }, 200);
            }
        }

        if (method === 'GET' && pathArray.includes('backup')) {
            try {
                console.log("DEBUG BACKUP: Starting backup for", userId);
                // Fetch data from key tables for export
                const filaments = await db.prepare("SELECT * FROM filamentos WHERE usuario_id = ?").bind(userId).all();
                const printers = await db.prepare("SELECT * FROM impressoras WHERE usuario_id = ?").bind(userId).all();
                const clients = await db.prepare("SELECT * FROM clientes WHERE usuario_id = ?").bind(userId).all();
                const projects = await db.prepare("SELECT * FROM projetos WHERE usuario_id = ? ORDER BY criado_em DESC").bind(userId).all();
                const supplies = await db.prepare("SELECT * FROM insumos WHERE usuario_id = ?").bind(userId).all();

                return enviarJSON({
                    message: "Backup generated successfully",
                    data: {
                        filaments: filaments.results || [],
                        printers: printers.results || [],
                        clients: clients.results || [],
                        projects: projects.results || [],
                        supplies: supplies.results || []
                    }
                });
            } catch (err) {
                return enviarJSON({ error: "Failed to generate backup", details: err.message }, 500);
            }
        }
        if (method === 'GET' && pathArray.includes('health')) return enviarJSON({ status: 'online' });

        return enviarJSON({ error: "Method not allowed" }, 405);

    } catch (globalErr) {
        return Response.json({
            error: "GLOBAL_ERROR",
            details: globalErr.message
        }, { status: 200 });
    }
}