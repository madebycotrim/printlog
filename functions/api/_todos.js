import { enviarJSON } from './_utils';

export async function gerenciarTodos({ request, db, userId, tenantId, url }) {
    const method = request.method;

    try {
        // LISTAR
        if (method === 'GET') {
            const todos = await db.prepare("SELECT * FROM tarefas WHERE deletado_em IS NULL ORDER BY criado_em DESC").all();
            const formatted = (todos.results || []).map(t => ({
                id: t.id,
                text: t.texto,
                done: !!t.concluida,
                created_at: t.criado_em
            }));
            return enviarJSON(formatted);
        }

        // CRIAR
        if (method === 'POST') {
            const { text } = await request.json();
            if (!text) return enviarJSON({ error: "Texto obrigatório" }, 400);

            const id = crypto.randomUUID();
            await db.prepare("INSERT INTO tarefas (id, usuario_id, texto, concluida) VALUES (?, ?, ?, 0)")
                .bind(id, userId, text)
                .run();

            return enviarJSON({ id, text, done: 0, created_at: new Date().toISOString() }, 201);
        }

        // ATUALIZAR (Toggle Done ou Editar Texto)
        if (method === 'PUT') {
            const { id, done, text } = await request.json();
            if (!id) return enviarJSON({ error: "ID obrigatório" }, 400);

            if (text !== undefined && done !== undefined) {
                await db.prepare("UPDATE tarefas SET texto = ?, concluida = ? WHERE id = ?")
                    .bind(text, done ? 1 : 0, id).run();
            } else if (done !== undefined) {
                await db.prepare("UPDATE tarefas SET concluida = ? WHERE id = ?")
                    .bind(done ? 1 : 0, id).run();
            } else if (text !== undefined) {
                await db.prepare("UPDATE tarefas SET texto = ? WHERE id = ?")
                    .bind(text, id).run();
            }

            return enviarJSON({ success: true });
        }

        // DELETAR (Soft Delete)
        if (method === 'DELETE') {
            const urlId = url.searchParams.get('id');
            let bodyId = null;

            if (!urlId) {
                const body = await request.json().catch(() => ({}));
                bodyId = body.id;
            }

            const targetId = urlId || bodyId;

            if (!targetId) return enviarJSON({ error: "ID obrigatório" }, 400);

            await db.prepare("UPDATE tarefas SET deletado_em = ? WHERE id = ?")
                .bind(new Date().toISOString(), targetId)
                .run();

            return enviarJSON({ success: true });
        }

        return enviarJSON({ error: "Método não permitido" }, 405);

    } catch (error) {
        console.error("Erro em todos:", error);
        return enviarJSON({ error: "Erro interno", details: error.message }, 500);
    }
}
