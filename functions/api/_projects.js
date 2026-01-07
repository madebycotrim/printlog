import { sendJSON, toNum } from './_utils';

export async function handleProjects(method, url, idFromPath, db, userId, request) {
    if (method === 'GET') {
        try {
            const { results } = await db.prepare(
                "SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC"
            ).bind(userId).all();

            const parsedResults = (results || []).map(r => {
                try {
                    return { ...r, data: JSON.parse(r.data || "{}") };
                } catch (e) {
                    return { ...r, data: {}, _error: "Erro ao processar JSON" };
                }
            });

            return sendJSON(parsedResults);
        } catch (err) {
            return sendJSON({ error: "Erro ao buscar projetos" }, 500);
        }
    }

    if (['POST', 'PUT'].includes(method)) {
        try {
            const p = await request.json();
            const id = String(p.id || idFromPath || crypto.randomUUID());
            const label = String(p.label || p.entradas?.nomeProjeto || "Novo Orçamento");
            
            // Extraímos valores para as colunas reais do banco (facilita filtros futuros)
            const status = p.status || p.data?.status || 'rascunho';
            const totalBudget = toNum(p.resultados?.precoFinal || p.total_budget);

            const dataStr = JSON.stringify({ 
                entradas: p.entradas || {}, 
                resultados: p.resultados || {}, 
                status: status,
                updated_at: new Date().toISOString()
            });

            // CORREÇÃO: Agora salvamos nas colunas específicas que você criou no _utils.js
            await db.prepare(`
                INSERT INTO projects (id, user_id, label, status, total_budget, data) 
                VALUES (?, ?, ?, ?, ?, ?) 
                ON CONFLICT(id) DO UPDATE SET 
                    label=excluded.label, 
                    status=excluded.status,
                    total_budget=excluded.total_budget,
                    data=excluded.data
            `).bind(id, userId, label, status, totalBudget, dataStr).run();

            return sendJSON({ id, label, success: true });
        } catch (err) {
            return sendJSON({ error: "Erro ao salvar projeto", details: err.message }, 400);
        }
    }

    if (method === 'DELETE') {
        const idToDelete = idFromPath || url.searchParams.get('id');
        if (idToDelete) {
            await db.prepare("DELETE FROM projects WHERE id = ? AND user_id = ?").bind(idToDelete, userId).run();
            return sendJSON({ success: true, message: "Projeto removido" });
        }
        return sendJSON({ error: "ID não fornecido" }, 400);
    }
}

export async function handleApproveBudget(db, userId, request) {
    try {
        const p = await request.json();
        const projectId = String(p.projectId || "");
        const printerId = String(p.printerId || "");

        const project = await db.prepare("SELECT data FROM projects WHERE id = ? AND user_id = ?")
            .bind(projectId, userId).first();

        if (!project) return sendJSON({ error: "Projeto não encontrado" }, 404);

        let pData = JSON.parse(project.data || "{}");
        pData.status = "aprovado";
        pData.approved_at = new Date().toISOString();

        const batch = [];

        // 1. Atualiza o status do projeto (Tanto na coluna real quanto no JSON)
        batch.push(
            db.prepare("UPDATE projects SET status = 'aprovado', data = ? WHERE id = ? AND user_id = ?")
              .bind(JSON.stringify(pData), projectId, userId)
        );

        // 2. Atualiza a impressora
        if (printerId && printerId !== 'none') {
            const horasParaAdicionar = toNum(p.totalTime || pData.resultados?.tempoTotal);
            batch.push(
                db.prepare(`
                    UPDATE printers 
                    SET horas_totais = horas_totais + ?, 
                        status = 'printing' 
                    WHERE id = ? AND user_id = ?
                `).bind(horasParaAdicionar, printerId, userId)
            );
        }

        // 3. Baixa de filamentos
        const filamentos = p.filaments || pData.resultados?.filamentosUsados || [];
        if (Array.isArray(filamentos)) {
            for (const f of filamentos) {
                const fId = String(f.id || "");
                const peso = toNum(f.peso || f.gastoGrama);
                if (fId && fId !== 'manual' && peso > 0) {
                    batch.push(
                        db.prepare("UPDATE filaments SET peso_atual = MAX(0, peso_atual - ?) WHERE id = ? AND user_id = ?")
                          .bind(peso, fId, userId)
                    );
                }
            }
        }

        await db.batch(batch);
        return sendJSON({ success: true, status: "aprovado" });
    } catch (err) {
        return sendJSON({ error: "Erro ao aprovar", details: err.message }, 500);
    }
}