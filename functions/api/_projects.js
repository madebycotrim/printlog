import { enviarJSON } from './[[path]]';

export async function gerenciarProjetos({ request, db, userId, url, params }) {
    const method = request.method;
    const pathArray = params.path || [];
    const idFromPath = pathArray[1];

    try {
        if (method === 'GET') {
            const { results } = await db.prepare("SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC").bind(userId).all();
            const formatted = (results || []).map(r => ({
                id: r.id,
                label: r.label || "Sem Nome",
                data: JSON.parse(r.data || "{}"),
                created_at: r.created_at
            }));
            return enviarJSON(formatted);
        }

        if (['POST', 'PUT'].includes(method)) {
            const p = await request.json();
            const id = String(p.id || idFromPath || crypto.randomUUID());
            const label = String(p.label || p.entradas?.nomeProjeto || "Novo Orçamento");
            const dataStr = JSON.stringify({
                entradas: p.entradas || p.data?.entradas || {},
                resultados: p.resultados || p.data?.resultados || {},
                status: p.status || p.data?.status || 'rascunho'
            });

            await db.prepare("INSERT INTO projects (id, user_id, label, data) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET label=excluded.label, data=excluded.data")
                .bind(id, userId, label, dataStr).run();
            return enviarJSON({ id, label, success: true });
        }

        if (method === 'DELETE') {
            const id = url.searchParams.get('id') || idFromPath;
            if (id) {
                await db.prepare("DELETE FROM projects WHERE id = ? AND user_id = ?").bind(id, userId).run();
            } else {
                await db.prepare("DELETE FROM projects WHERE user_id = ?").bind(userId).run();
            }
            return enviarJSON({ success: true, message: "Projeto(s) removido(s)." });
        }
    } catch (error) {
        return enviarJSON({ error: "Erro ao gerenciar projetos", details: error.message }, 500);
    }
}