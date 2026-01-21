import { enviarJSON, paraNumero } from './_utils';
import { validateInput, schemas } from './_validation';
import { cacheQuery, invalidateCache } from './_cache';

/**
 * API DE APROVAÇÃO DE ORÇAMENTOS
 * Aprova orçamento, atualiza status do projeto, deduz filamento do estoque e registra horas na impressora
 */
export async function aprovarProjeto({ request, db, tenantId }) {
    if (request.method !== 'POST') return enviarJSON({ error: "Método não permitido" }, 405);

    const p = await request.json();
    const projectId = String(p.projectId || "");
    const printerId = String(p.printerId || "");

    // Validações de entrada
    if (!projectId) return enviarJSON({ error: "ID do projeto obrigatório" }, 400);

    // Busca o projeto no banco de dados (Escopo: Tenant)
    const project = await db.prepare("SELECT data FROM projects WHERE id = ? AND org_id = ?").bind(projectId, tenantId).first();
    if (!project) return enviarJSON({ error: "Projeto não encontrado" }, 404);

    // Atualiza o status do projeto para "aprovado"
    let pData = JSON.parse(project.data || "{}");
    pData.status = "aprovado";

    // Cria lista de operações em batch para executar atomicamente
    const batch = [
        db.prepare("UPDATE projects SET data = ? WHERE id = ? AND org_id = ?").bind(JSON.stringify(pData), projectId, tenantId)
    ];

    // Se houver impressora vinculada, incrementa as horas totais e altera status
    if (printerId) {
        batch.push(db.prepare("UPDATE printers SET horas_totais = horas_totais + ?, status = 'printing' WHERE id = ? AND org_id = ?")
            .bind(paraNumero(p.totalTime), printerId, tenantId));
    }

    // Deduz o filamento utilizado do estoque (suporta múltiplos filamentos)
    if (Array.isArray(p.filaments)) {
        p.filaments.forEach(f => {
            if (f.id && f.id !== 'manual') {
                batch.push(db.prepare("UPDATE filaments SET peso_atual = MAX(0, peso_atual - ?) WHERE id = ? AND org_id = ?")
                    .bind(paraNumero(f.peso || f.weight), String(f.id), tenantId));
            }
        });
    }

    // Executa todas as operações em uma única transação
    await db.batch(batch);
    invalidateCache(`projects:${tenantId}`); // Invalida cache de projetos do tenant
    return enviarJSON({ success: true });
}

export async function gerenciarProjetos({ request, db, userId, tenantId, url, params }) {
    const method = request.method;
    const pathArray = params.path || [];
    const idFromPath = pathArray[1];

    try {
        if (method === 'GET') {
            // Cache de 30 segundos para lista de projetos
            const formatted = await cacheQuery(
                `projects:${tenantId}`,
                30000,
                async () => {
                    const { results } = await db.prepare("SELECT * FROM projects WHERE org_id = ? ORDER BY created_at DESC").bind(tenantId).all();
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

            await db.prepare("INSERT INTO projects (id, user_id, org_id, label, data) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET label=excluded.label, data=excluded.data")
                .bind(id, userId, tenantId, label, dataStr).run();

            invalidateCache(`projects:${tenantId}`);

            return enviarJSON({ id, label, success: true });
        }

        if (method === 'DELETE') {
            const id = url.searchParams.get('id') || idFromPath;

            if (id) {
                await db.prepare("DELETE FROM projects WHERE id = ? AND org_id = ?").bind(id, tenantId).run();
            } else {
                await db.prepare("DELETE FROM projects WHERE org_id = ?").bind(tenantId).run();
            }

            invalidateCache(`projects:${tenantId}`);

            return enviarJSON({ success: true, message: "Projeto(s) removido(s)." });
        }
    } catch (error) {
        return enviarJSON({ error: "Erro ao gerenciar projetos", details: error.message }, 500);
    }
}
