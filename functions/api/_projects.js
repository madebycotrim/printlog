import { enviarJSON } from './_utils';
import { validateInput, schemas } from './_validation';
import { cacheQuery, invalidateCache } from './_cache';

export async function gerenciarProjetos({ request, db, userId, url, params }) {
    const method = request.method;
    const pathArray = params.path || [];
    const idFromPath = pathArray[1];

    try {
        if (method === 'GET') {
            // Cache de 30 segundos para lista de projetos
            const formatted = await cacheQuery(
                `projects:${userId}`,
                30000,
                async () => {
                    const { results } = await db.prepare("SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC").bind(userId).all();
                    return (results || []).map(r => ({
                        id: r.id,
                        label: r.label || "Sem Nome",
                        data: JSON.parse(r.data || "{}"),
                        created_at: r.created_at
                    }));
                }
            );
            return enviarJSON(formatted);
        }

        if (['POST', 'PUT'].includes(method)) {
            const rawData = await request.json();
            const id = String(rawData.id || idFromPath || crypto.randomUUID());

            // Validação
            const validation = validateInput(rawData, schemas.project);
            if (!validation.valid) {
                return enviarJSON({ error: "Dados inválidos", details: validation.errors }, 400);
            }

            const label = String(rawData.label || rawData.entradas?.nomeProjeto || "Novo Orçamento");

            // Flexibilidade mantida para estrutura complexa do projeto
            const dataStr = JSON.stringify({
                entradas: rawData.entradas || rawData.data?.entradas || {},
                resultados: rawData.resultados || rawData.data?.resultados || {},
                status: rawData.status || rawData.data?.status || 'rascunho'
            });

            await db.prepare("INSERT INTO projects (id, user_id, label, data) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET label=excluded.label, data=excluded.data")
                .bind(id, userId, label, dataStr).run();

            invalidateCache(`projects:${userId}`);

            return enviarJSON({ id, label, success: true });
        }

        if (method === 'DELETE') {
            const id = url.searchParams.get('id') || idFromPath;

            if (id) {
                await db.prepare("DELETE FROM projects WHERE id = ? AND user_id = ?").bind(id, userId).run();
            } else {
                await db.prepare("DELETE FROM projects WHERE user_id = ?").bind(userId).run();
            }

            invalidateCache(`projects:${userId}`);

            return enviarJSON({ success: true, message: "Projeto(s) removido(s)." });
        }
    } catch (error) {
        return enviarJSON({ error: "Erro ao gerenciar projetos", details: error.message }, 500);
    }
}