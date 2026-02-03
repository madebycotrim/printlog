import { enviarJSON, paraNumero } from './_utils';
import { validateInput, schemas } from './_validation';
import { STATUS_PROJETO, validarTransicaoStatus } from './_constants';
import { construirQueryComSoftDelete, softDelete } from './_helpers';

/**
 * API DE APROVAÇÃO DE ORÇAMENTOS (Específica para mudança de status direto)
 * Aprova orçamento, atualiza status do projeto, deduz filamento do estoque e registra horas na impressora
 */
export async function aprovarProjeto({ request, db, userId }) {
    if (request.method !== 'POST') return enviarJSON({ error: "Método não permitido" }, 405);

    const p = await request.json();
    const projectId = String(p.projectId || "");
    const printerId = String(p.printerId || "");

    if (!projectId) return enviarJSON({ error: "ID do projeto obrigatório" }, 400);

    // Busca versão e dados atuais
    const project = await db.prepare("SELECT data, nome, versao, status FROM projetos WHERE id = ?").bind(projectId).first();
    if (!project) return enviarJSON({ error: "Projeto não encontrado" }, 404);

    let pData = JSON.parse(project.data || "{}");
    const statusAtual = pData.status || 'rascunho';
    const statusNovo = STATUS_PROJETO.APROVADO;

    // Valida Transição
    const validacao = validarTransicaoStatus(statusAtual, statusNovo);
    if (!validacao.valido) {
        return enviarJSON({ error: validacao.erro }, 400);
    }

    pData.status = statusNovo;
    const now = new Date().toISOString();
    const nomeProjeto = project.nome || pData.entradas?.nomeProjeto || "Projeto";

    // Batch operations
    const batch = [];

    // Atualiza projeto com nova versão
    batch.push(db.prepare(`
        UPDATE projetos 
        SET data = ?, status = ?, versao = versao + 1, atualizado_em = ?
        WHERE id = ? AND versao = ?
    `).bind(JSON.stringify(pData), statusNovo, now, projectId, project.versao));

    // Impressora
    if (printerId) {
        const totalTime = paraNumero(p.totalTime);
        batch.push(db.prepare("UPDATE impressoras SET horas_totais = horas_totais + ?, status = 'printing', atualizado_em = ? WHERE id = ?")
            .bind(totalTime, now, printerId));

        if (totalTime > 0) {
            batch.push(db.prepare(`
                INSERT INTO impressoras_log (id, impressora_id, usuario_id, data, tipo, observacao, horas_operacao, projeto_id)
                VALUES (?, ?, ?, ?, 'uso', ?, ?, ?)
            `).bind(crypto.randomUUID(), printerId, userId, now, `Projeto: ${nomeProjeto}`, totalTime, projectId));
        }
    }

    // Filamentos
    if (Array.isArray(p.filamentos)) {
        p.filamentos.forEach(f => {
            if (f.id && f.id !== 'manual') {
                const peso = paraNumero(f.peso);
                const custo = paraNumero(f.custo || 0);

                batch.push(db.prepare("UPDATE filamentos SET peso_atual = MAX(0, peso_atual - ?), versao = versao + 1, atualizado_em = ? WHERE id = ?")
                    .bind(peso, now, String(f.id)));

                if (peso > 0) {
                    batch.push(db.prepare(`
                        INSERT INTO filamentos_log (id, filamento_id, data, tipo, quantidade, observacao, usuario_id, impressora_id, nome_modelo, custo, projeto_id)
                        VALUES (?, ?, ?, 'consumo', ?, ?, ?, ?, ?, ?, ?)
                    `).bind(crypto.randomUUID(), String(f.id), now, peso, `Projeto: ${nomeProjeto}`, userId, printerId || null, nomeProjeto, custo, projectId));
                }
            }
        });
    }

    const results = await db.batch(batch);
    // Verifica se o update do projeto falhou (banco retorna resultados para cada statement)
    if (results[0].meta.changes === 0) {
        return enviarJSON({ error: "Conflito de versão ou projeto não encontrado. Tente novamente." }, 409);
    }

    return enviarJSON({ success: true, message: "Projeto aprovado com sucesso." });
}

export async function gerenciarProjetos({ request, db, userId, url, params }) {
    const method = request.method;
    const pathArray = params.path || [];
    const idFromPath = pathArray[1];

    try {
        if (method === 'GET') {
            const query = construirQueryComSoftDelete("SELECT * FROM projetos", "projetos");
            const { results } = await db.prepare(`${query} ORDER BY criado_em DESC`).all();

            const formatted = (results || []).map(r => ({
                id: r.id,
                nome: r.nome || "Sem Nome",
                data: JSON.parse(r.data || "{}"),
                criado_em: r.criado_em,
                status: r.status, // Agora temos status na coluna raiz também (idealmente) ou só no JSON
                versao: r.versao
            }));

            return enviarJSON(formatted);
        }

        if (['POST', 'PUT'].includes(method)) {
            const rawData = await request.json();
            const id = String(rawData.id || idFromPath || crypto.randomUUID());

            // Validação
            const validation = validateInput(rawData, schemas.project);
            if (!validation.valid) return enviarJSON({ error: "Dados inválidos", details: validation.errors }, 400);

            const nome = String(rawData.nome || rawData.entradas?.nomeProjeto || "Novo Orçamento");
            // Nota: rawData pode vir com estrutura aninhada, simplificamos aqui
            const statusNovo = rawData.status || rawData.data?.status || STATUS_PROJETO.RASCUNHO;

            // Busca atual para validar transição e versão
            const existing = await db.prepare("SELECT * FROM projetos WHERE id = ?").bind(id).first();

            if (existing) {
                // UPDATE
                const dataExisting = JSON.parse(existing.data || "{}");
                const statusAtual = existing.status || dataExisting.status || STATUS_PROJETO.RASCUNHO;

                if (statusNovo !== statusAtual) {
                    const check = validarTransicaoStatus(statusAtual, statusNovo);
                    if (!check.valido) return enviarJSON({ error: check.erro }, 400);
                }

                if (rawData.versao && existing.versao !== rawData.versao) {
                    return enviarJSON({ error: "Conflito de versão. Recarregue a página." }, 409);
                }

                const dataStr = JSON.stringify({
                    entradas: rawData.entradas || rawData.data?.entradas || {},
                    resultados: rawData.resultados || rawData.data?.resultados || {},
                    status: statusNovo
                });

                const res = await db.prepare(`
                    UPDATE projetos 
                    SET nome = ?, data = ?, status = ?, versao = versao + 1, atualizado_em = CURRENT_TIMESTAMP
                    WHERE id = ?
                `).bind(nome, dataStr, statusNovo, id).run();

                return enviarJSON({ id, nome, success: true, versao: (existing.versao + 1) });
            } else {
                // CREATE
                const dataStr = JSON.stringify({
                    entradas: rawData.entradas || rawData.data?.entradas || {},
                    resultados: rawData.resultados || rawData.data?.resultados || {},
                    status: statusNovo
                });

                await db.prepare(`
                    INSERT INTO projetos (id, usuario_id, nome, data, status, versao, criado_em, atualizado_em) 
                    VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                `).bind(id, userId, nome, dataStr, statusNovo).run();

                return enviarJSON({ id, nome, success: true, versao: 1 });
            }
        }

        if (method === 'DELETE') {
            const id = url.searchParams.get('id') || idFromPath;
            if (id) {
                await softDelete(db, 'projetos', id);
            } else {
                return enviarJSON({ error: "ID necessário" }, 400);
            }
            return enviarJSON({ success: true });
        }
    } catch (error) {
        return enviarJSON({ error: "Erro ao gerenciar projetos", details: error.message }, 500);
    }
}
