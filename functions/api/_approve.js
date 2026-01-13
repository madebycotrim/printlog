import { enviarJSON, paraNumero } from './_utils';

/**
 * API DE APROVAÇÃO DE ORÇAMENTOS
 * Aprova orçamento, atualiza status do projeto, deduz filamento do estoque e registra horas na impressora
 */
export async function gerenciarAprovacao({ request, db, userId }) {
    if (request.method !== 'POST') return enviarJSON({ error: "Método não permitido" }, 405);

    const p = await request.json();
    const projectId = String(p.projectId || "");
    const printerId = String(p.printerId || "");

    // Validações de entrada
    if (!projectId) return enviarJSON({ error: "ID do projeto obrigatório" }, 400);

    // Busca o projeto no banco de dados
    const project = await db.prepare("SELECT data FROM projects WHERE id = ? AND user_id = ?").bind(projectId, userId).first();
    if (!project) return enviarJSON({ error: "Projeto não encontrado" }, 404);

    // Atualiza o status do projeto para "aprovado"
    let pData = JSON.parse(project.data || "{}");
    pData.status = "aprovado";

    // Cria lista de operações em batch para executar atomicamente
    const batch = [
        db.prepare("UPDATE projects SET data = ? WHERE id = ? AND user_id = ?").bind(JSON.stringify(pData), projectId, userId)
    ];

    // Se houver impressora vinculada, incrementa as horas totais e altera status
    if (printerId) {
        batch.push(db.prepare("UPDATE printers SET horas_totais = horas_totais + ?, status = 'printing' WHERE id = ? AND user_id = ?")
            .bind(paraNumero(p.totalTime), printerId, userId));
    }

    // Deduz o filamento utilizado do estoque (suporta múltiplos filamentos)
    if (Array.isArray(p.filaments)) {
        p.filaments.forEach(f => {
            if (f.id && f.id !== 'manual') {
                batch.push(db.prepare("UPDATE filaments SET peso_atual = MAX(0, peso_atual - ?) WHERE id = ? AND user_id = ?")
                    .bind(paraNumero(f.peso || f.weight), String(f.id), userId));
            }
        });
    }

    // Executa todas as operações em uma única transação
    await db.batch(batch);
    return enviarJSON({ success: true });
}