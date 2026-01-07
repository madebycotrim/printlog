import { sendJSON } from './_utils';

export async function handleUsers(method, idFromPath, db, userId) {
    
    // 1. Rota: GET /api/users/backup
    if (method === 'GET' && idFromPath === 'backup') {
        try {
            const results = await db.batch([
                db.prepare("SELECT * FROM filaments WHERE user_id = ?").bind(userId),
                db.prepare("SELECT * FROM printers WHERE user_id = ?").bind(userId),
                db.prepare("SELECT * FROM calculator_settings WHERE user_id = ?").bind(userId),
                db.prepare("SELECT * FROM projects WHERE user_id = ?").bind(userId)
            ]);

            return sendJSON({
                success: true,
                metadata: { 
                    generated_at: new Date().toISOString(),
                    counts: {
                        filaments: results[0]?.results?.length || 0,
                        printers: results[1]?.results?.length || 0,
                        projects: results[3]?.results?.length || 0
                    }
                },
                data: {
                    filaments: results[0]?.results || [],
                    printers: results[1]?.results || [],
                    settings: results[2]?.results?.[0] || null,
                    projects: (results[3]?.results || []).map(p => {
                        let parsedData = {};
                        try {
                            parsedData = typeof p.data === 'string' ? JSON.parse(p.data) : (p.data || {});
                        } catch (e) {
                            console.error(`Erro ao carregar os dados do projeto ${p.id}`);
                        }
                        return { ...p, data: parsedData };
                    })
                }
            });
        } catch (err) {
            return sendJSON({ error: "Ops! Tivemos um erro ao gerar o backup dos seus dados", details: err.message }, 500);
        }
    }

    // 2. Rota: DELETE /api/users
    // Apaga todo o histórico e as configurações do maker permanentemente
    if (method === 'DELETE') {
        try {
            await db.batch([
                db.prepare("DELETE FROM filaments WHERE user_id = ?").bind(userId),
                db.prepare("DELETE FROM printers WHERE user_id = ?").bind(userId),
                db.prepare("DELETE FROM calculator_settings WHERE user_id = ?").bind(userId),
                db.prepare("DELETE FROM projects WHERE user_id = ?").bind(userId)
            ]);
            
            return sendJSON({ 
                success: true, 
                message: "Todos os seus dados foram removidos com sucesso. Sentiremos sua falta!" 
            });
        } catch (err) {
            return sendJSON({ error: "Não conseguimos apagar os seus dados no momento. Tenta de novo mais tarde?", details: err.message }, 500);
        }
    }

    // 3. Fallback: Caso o caminho ou método não existam ou não sejam permitidos
    return sendJSON({ error: "Essa operação não é permitida ou este caminho não existe." }, 405);
}