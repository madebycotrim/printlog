import { sendJSON } from './_utils';

export async function handleUsers(method, pathArray, db, userId) {
    const targetUserId = pathArray[2] || userId;
    if (method === 'GET' && pathArray.includes('backup')) {
        const results = await db.batch([
            db.prepare("SELECT * FROM filaments WHERE user_id = ?").bind(targetUserId),
            db.prepare("SELECT * FROM printers WHERE user_id = ?").bind(targetUserId),
            db.prepare("SELECT * FROM calculator_settings WHERE user_id = ?").bind(targetUserId),
            db.prepare("SELECT * FROM projects WHERE user_id = ?").bind(targetUserId)
        ]);
        return sendJSON({
            success: true,
            data: {
                filaments: results[0]?.results || [],
                printers: results[1]?.results || [],
                settings: results[2]?.results?.[0] || {},
                projects: (results[3]?.results || []).map(p => ({ ...p, data: JSON.parse(p.data || "{}") }))
            }
        });
    }
    if (method === 'DELETE') {
        await db.batch([
            db.prepare("DELETE FROM filaments WHERE user_id = ?").bind(userId),
            db.prepare("DELETE FROM printers WHERE user_id = ?").bind(userId),
            db.prepare("DELETE FROM calculator_settings WHERE user_id = ?").bind(userId),
            db.prepare("DELETE FROM projects WHERE user_id = ?").bind(userId)
        ]);
        return sendJSON({ success: true });
    }
}