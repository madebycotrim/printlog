import { enviarJSON } from './[[path]]';

export async function gerenciarUsuarios({ request, db, userId, pathArray, env }) {
    const method = request.method;

    if (method === 'GET' && pathArray.includes('backup')) {
        try {
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
                    // Garantimos que o campo 'data' do projeto seja um objeto real antes de enviar
                    projects: projects.results.map(p => ({
                        ...p,
                        data: typeof p.data === 'string' ? JSON.parse(p.data) : p.data
                    }))
                }
            });
        } catch (err) {
            return enviarJSON({ error: "Erro na extração", details: err.message }, 500);
        }
    }

    if (method === 'GET' && pathArray.includes('health')) {
        try {
            const start = Date.now();
            // Uma consulta ultra leve apenas para testar a comunicação com o D1
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

    if (method === 'DELETE') {
        try {
            // Protocolo de expurgo (Clerk + D1)
            const clerkRes = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${env.CLERK_SECRET_KEY}` }
            });

            if (!clerkRes.ok) throw new Error("Falha ao invalidar credenciais no Clerk");

            await db.batch([
                db.prepare("DELETE FROM filaments WHERE user_id = ?").bind(userId),
                db.prepare("DELETE FROM printers WHERE user_id = ?").bind(userId),
                db.prepare("DELETE FROM calculator_settings WHERE user_id = ?").bind(userId),
                db.prepare("DELETE FROM projects WHERE user_id = ?").bind(userId)
            ]);

            return enviarJSON({ success: true, message: "Unidade de dados purgada." });
        } catch (err) {
            return enviarJSON({ error: "Erro no expurgo", details: err.message }, 500);
        }
    }

    return enviarJSON({ error: "Método não permitido" }, 405);
}