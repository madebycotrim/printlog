import { sendJSON, toNum } from './_utils';

export async function handleProjects(method, url, idFromPath, db, userId, request) {
    if (method === 'GET') {
        const { results } = await db.prepare("SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC").bind(userId).all();
        const formatted = (results || []).map(r => ({
            id: r.id,
            label: r.label || "Sem Nome",
            data: JSON.parse(r.data || "{}"),
            created_at: r.created_at
        }));
        return sendJSON(formatted);
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
        return sendJSON({ id, label });
    }
    if (method === 'DELETE') {
        const id = url.searchParams.get('id');
        if (id) {
            await db.prepare("DELETE FROM projects WHERE id = ? AND user_id = ?").bind(id, userId).run();
        } else {
            await db.prepare("DELETE FROM projects WHERE user_id = ?").bind(userId).run();
        }
        return sendJSON({ success: true });
    }
}

export async function handleApproveBudget(db, userId, request) {
    const p = await request.json();
    const projectId = String(p.projectId || "");
    const printerId = String(p.printerId || "");
    if (!projectId) return sendJSON({ error: "ID do projeto obrigatório" }, 400);

    const project = await db.prepare("SELECT data FROM projects WHERE id = ? AND user_id = ?").bind(projectId, userId).first();
    if (!project) return sendJSON({ error: "Projeto não encontrado" }, 404);

    let pData = JSON.parse(project.data || "{}");
    pData.status = "aprovado";

    const batch = [
        db.prepare("UPDATE projects SET data = ? WHERE id = ? AND user_id = ?").bind(JSON.stringify(pData), projectId, userId)
    ];
    if (printerId) {
        batch.push(db.prepare("UPDATE printers SET horas_totais = horas_totais + ?, status = 'printing' WHERE id = ? AND user_id = ?").bind(toNum(p.totalTime), printerId, userId));
    }
    if (Array.isArray(p.filaments)) {
        p.filaments.forEach(f => {
            if (f.id && f.id !== 'manual') {
                batch.push(db.prepare("UPDATE filaments SET peso_atual = MAX(0, peso_atual - ?) WHERE id = ? AND user_id = ?").bind(toNum(f.peso || f.weight), String(f.id), userId));
            }
        });
    }
    await db.batch(batch);
    return sendJSON({ success: true });
}