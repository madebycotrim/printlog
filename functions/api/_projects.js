import { sendJSON, toNum } from './_utils';

export async function handleProjects(method, url, idFromPath, db, userId, request) {
    // 1. LISTAR PROJETOS
    if (method === 'GET') {
        try {
            const { results } = await db.prepare(
                "SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC"
            ).bind(userId).all();

            const parsedResults = (results || []).map(r => {
                try {
                    return { ...r, data: JSON.parse(r.data || "{}") };
                } catch (e) {
                    return { ...r, data: {}, _error: "Erro ao processar dados do projeto" };
                }
            });

            return sendJSON(parsedResults);
        } catch (err) {
            return sendJSON({ error: "Erro ao buscar projetos" }, 500);
        }
    }

    // 2. CRIAR OU ATUALIZAR (UPSERT)
    if (['POST', 'PUT'].includes(method)) {
        try {
            const p = await request.json();
            // Prioridade do ID: Corpo do JSON > URL > Novo UUID
            const id = String(p.id || idFromPath || crypto.randomUUID());
            const label = String(p.label || p.entradas?.nomeProjeto || "Novo Orçamento");
            
            const dataStr = JSON.stringify({ 
                entradas: p.entradas || {}, 
                resultados: p.resultados || {}, 
                status: p.status || 'rascunho',
                updated_at: new Date().toISOString()
            });

            await db.prepare(`
                INSERT INTO projects (id, user_id, label, data) 
                VALUES (?, ?, ?, ?) 
                ON CONFLICT(id) DO UPDATE SET 
                    label=excluded.label, 
                    data=excluded.data
            `).bind(id, userId, label, dataStr).run();

            return sendJSON({ id, label, success: true });
        } catch (err) {
            return sendJSON({ error: "Erro ao salvar projeto", details: err.message }, 400);
        }
    }

    // 3. DELETAR
    if (method === 'DELETE') {
        // Tenta pegar o ID tanto do path (/api/projects/ID) quanto da query (?id=ID)
        const idToDelete = idFromPath || url.searchParams.get('id');

        if (idToDelete) {
            await db.prepare("DELETE FROM projects WHERE id = ? AND user_id = ?").bind(idToDelete, userId).run();
            return sendJSON({ success: true, message: "Projeto removido" });
        } else {
            // Se não passar ID, talvez você não queira deletar TUDO por acidente. 
            // Adicionei uma proteção aqui.
            return sendJSON({ error: "ID não fornecido para exclusão" }, 400);
        }
    }
}

export async function handleApproveBudget(db, userId, request) {
    try {
        const p = await request.json();
        const projectId = String(p.projectId || "");
        const printerId = String(p.printerId || "");

        // Busca o projeto original
        const project = await db.prepare("SELECT data FROM projects WHERE id = ? AND user_id = ?")
            .bind(projectId, userId)
            .first();

        if (!project) return sendJSON({ error: "Projeto não encontrado" }, 404);

        let pData = JSON.parse(project.data || "{}");
        pData.status = "aprovado";
        pData.approved_at = new Date().toISOString();

        const batch = [];

        // 1. Atualiza o status do projeto
        batch.push(
            db.prepare("UPDATE projects SET data = ? WHERE id = ? AND user_id = ?")
              .bind(JSON.stringify(pData), projectId, userId)
        );

        // 2. Atualiza a impressora (soma horas e muda status)
        if (printerId && printerId !== 'none') {
            batch.push(
                db.prepare(`
                    UPDATE printers 
                    SET horas_totais = horas_totais + ?, 
                        status = 'printing' 
                    WHERE id = ? AND user_id = ?
                `).bind(toNum(p.totalTime), printerId, userId)
            );
        }

        // 3. Baixa no estoque de filamentos
        if (Array.isArray(p.filaments)) {
            for (const f of p.filaments) {
                const fId = String(f.id || "");
                const weightToDeduct = toNum(f.peso || f.weight);

                if (fId && fId !== 'manual' && weightToDeduct > 0) {
                    batch.push(
                        db.prepare(`
                            UPDATE filaments 
                            SET peso_atual = MAX(0, peso_atual - ?) 
                            WHERE id = ? AND user_id = ?
                        `).bind(weightToDeduct, fId, userId)
                    );
                }
            }
        }

        if (batch.length > 0) {
            await db.batch(batch);
        }

        return sendJSON({ success: true, status: "aprovado" });

    } catch (err) {
        return sendJSON({ error: "Erro ao aprovar orçamento", details: err.message }, 500);
    }
}