import { sendJSON } from './_utils';

export async function handleUsers(method, pathArray, db, userId) {
    const targetUserId = pathArray[2] || userId;

    if (method === 'GET' && pathArray.includes('backup')) {
        try {
            const results = await db.batch([
                db.prepare("SELECT * FROM filaments WHERE user_id = ?").bind(targetUserId),
                db.prepare("SELECT * FROM printers WHERE user_id = ?").bind(targetUserId),
                db.prepare("SELECT * FROM calculator_settings WHERE user_id = ?").bind(targetUserId),
                db.prepare("SELECT * FROM projects WHERE user_id = ?").bind(targetUserId)
            ]);
            const filaments = results[0]?.results || [];
            const printers = results[1]?.results || [];
            const settings = results[2]?.results?.length > 0 ? results[2].results[0] : {};
            const projectsRaw = results[3]?.results || [];
            const projects = projectsRaw.map(p => ({ ...p, data: typeof p.data === 'string' ? JSON.parse(p.data) : p.data }));

            return sendJSON({
                success: true,
                metadata: { generated_at: new Date().toISOString() },
                data: { filaments, printers, settings, projects }
            });
        } catch (err) {
            return sendJSON({ error: "Falha técnica no Manifesto", details: err.message }, 500);
        }
    }
    if (method === 'DELETE') {
        await db.batch([
            db.prepare("DELETE FROM filaments WHERE user_id = ?").bind(userId),
            db.prepare("DELETE FROM printers WHERE user_id = ?").bind(userId),
            db.prepare("DELETE FROM calculator_settings WHERE user_id = ?").bind(userId),
            db.prepare("DELETE FROM projects WHERE user_id = ?").bind(userId)
        ]);
        return sendJSON({ success: true, message: "Expurgo completo realizado." });
    }
}