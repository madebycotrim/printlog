import { enviarJSON } from './_utils';

export async function gerenciarTodos({ request, db, userId, url }) {
    const method = request.method;

    try {
        // LISTAR
        if (method === 'GET') {
            const todos = await db.prepare("SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC").bind(userId).all();
            return enviarJSON(todos.results || []);
        }

        // CRIAR
        if (method === 'POST') {
            const { text } = await request.json();
            if (!text) return enviarJSON({ error: "Texto obrigatório" }, 400);

            const id = crypto.randomUUID();
            await db.prepare("INSERT INTO todos (id, user_id, text, done) VALUES (?, ?, ?, 0)")
                .bind(id, userId, text)
                .run();

            return enviarJSON({ id, text, done: 0, created_at: new Date().toISOString() }, 201);
        }

        // ATUALIZAR (Toggle Done ou Editar Texto)
        if (method === 'PUT') {
            const { id, done, text } = await request.json();
            if (!id) return enviarJSON({ error: "ID obrigatório" }, 400);

            // Fetch current to verify ownership? Where clause handles it.
            // Build dynamic query or just update all fields?
            // User might send specific fields.

            // Simpler: require all fields or handle partial.
            // Let's handle partial updates if possible, or just expect full object.
            // TodoWidget usually toggles `done`.

            if (text !== undefined && done !== undefined) {
                await db.prepare("UPDATE todos SET text = ?, done = ? WHERE id = ? AND user_id = ?")
                    .bind(text, done ? 1 : 0, id, userId).run();
            } else if (done !== undefined) {
                await db.prepare("UPDATE todos SET done = ? WHERE id = ? AND user_id = ?")
                    .bind(done ? 1 : 0, id, userId).run();
            } else if (text !== undefined) {
                await db.prepare("UPDATE todos SET text = ? WHERE id = ? AND user_id = ?")
                    .bind(text, id, userId).run();
            }

            return enviarJSON({ success: true });
        }

        // DELETAR
        if (method === 'DELETE') {
            const urlId = url.searchParams.get('id');
            let bodyId = null;

            if (!urlId) {
                const body = await request.json().catch(() => ({}));
                bodyId = body.id;
            }

            const targetId = urlId || bodyId;

            if (!targetId) return enviarJSON({ error: "ID obrigatório" }, 400);

            await db.prepare("DELETE FROM todos WHERE id = ? AND user_id = ?")
                .bind(targetId, userId)
                .run();

            return enviarJSON({ success: true });
        }

        return enviarJSON({ error: "Método não permitido" }, 405);

    } catch (error) {
        console.error("Erro em todos:", error);
        return enviarJSON({ error: "Erro interno", details: error.message }, 500);
    }
}
