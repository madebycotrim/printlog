import { enviarJSON, paraNumero } from './_utils';
import { validateInput, schemas, sanitizeFields } from './_validation';
import { construirQueryComSoftDelete, softDelete, enviarJSON as enviarJSONHelper } from './_helpers';

export async function gerenciarFalhas({ request, db, userId }) {
    const method = request.method;

    try {
        if (method === 'GET') {
            // Retorna histórico de falhas
            const { results } = await db.prepare(`
                SELECT * FROM filamentos_log 
                WHERE tipo = 'falha'
                ORDER BY data DESC 
                LIMIT 50
            `).all();

            // Calcula estatísticas
            let stats = { total_weight: 0, total_cost: 0, total_failures: 0 };
            try {
                const s = await db.prepare(`
                    SELECT 
                        SUM(quantidade) as total_weight, 
                        SUM(custo) as total_cost, 
                        COUNT(*) as total_failures 
                    FROM filamentos_log 
                    WHERE tipo = 'falha'
                `).first();
                if (s) stats = s;
            } catch (e) { }

            const history = (results || []).map(r => ({
                id: r.id,
                date: r.data,
                filamentId: r.filamento_id,
                printerId: r.impressora_id,
                modelName: r.nome_modelo,
                weightWasted: r.quantidade,
                costWasted: r.custo,
                reason: r.observacao
            }));

            return enviarJSON({
                history: history,
                stats: {
                    totalWeight: stats?.total_weight || 0,
                    totalCost: stats?.total_cost || 0,
                    count: stats?.total_failures || 0
                }
            });
        }

        if (method === 'POST') {
            const rawData = await request.json();
            const validation = validateInput(rawData, schemas.failure);
            if (!validation.valid) {
                return enviarJSON({ error: "Dados inválidos", details: validation.errors }, 400);
            }

            const f = sanitizeFields(rawData, schemas.failure);
            const id = crypto.randomUUID();
            const date = new Date().toISOString();

            await db.prepare(`
                INSERT INTO filamentos_log (
                    id, filamento_id, data, tipo, quantidade, observacao, 
                    usuario_id, impressora_id, nome_modelo, custo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                id, f.filamento_id, date, 'falha', paraNumero(f.peso_perdido),
                f.observacao || "Falha genérica", userId, f.impressora_id || null,
                f.nome_modelo || "Impressão sem nome", paraNumero(f.custo_perdido)
            ).run();

            if (f.filamento_id && f.filamento_id !== 'manual') {
                const filamento = await db.prepare("SELECT peso_atual, versao FROM filamentos WHERE id = ?").bind(f.filamento_id).first();
                if (filamento) {
                    const novoPeso = Math.max(0, filamento.peso_atual - paraNumero(f.peso_perdido));
                    // Atualiza estoque e versão
                    await db.prepare("UPDATE filamentos SET peso_atual = ?, versao = versao + 1 WHERE id = ?")
                        .bind(novoPeso, f.filamento_id).run();
                }
            }

            return enviarJSON({ success: true, message: "Falha registrada com sucesso." });
        }

    } catch (error) {
        console.error("FATAL ERROR in gerenciarFalhas:", error);
        return enviarJSON({ error: "Erro ao processar falhas", details: error.message }, 500);
    }
}

export async function gerenciarFilamentos({ request, db, userId, pathArray, url }) {
    const method = request.method;
    const idFromPath = pathArray[1];

    try {
        if (method === 'GET') {
            // Histórico
            if (pathArray[2] === 'history' && idFromPath) {
                const filamentId = idFromPath;
                // FILTRO SOFT DELETE NÃO DEVE IMPEDIR VISUALIZAR HISTÓRICO SE TIVER O ID
                // Mas a busca do filamento em si pode informar se foi deletado

                const filament = await db.prepare("SELECT * FROM filamentos WHERE id = ?").bind(filamentId).first();
                // Se filamento não existe ou foi deletado (opcional: mostrar mas marcar como deletado)

                // Busca Projetos (Consumo)
                const { results: allProjects } = await db.prepare("SELECT * FROM projetos ORDER BY criado_em DESC LIMIT 100").all();
                const consumptions = [];
                (allProjects || []).forEach(proj => {
                    try {
                        const data = JSON.parse(proj.data || "{}");
                        if (Array.isArray(data.entradas?.filamentos)) {
                            const usage = data.entradas.filamentos.find(f => String(f.id) === String(filamentId));
                            if (usage && (usage.peso || usage.weight)) {
                                consumptions.push({
                                    id: proj.id,
                                    date: proj.criado_em,
                                    type: 'consumo',
                                    qtd: paraNumero(usage.peso || usage.weight),
                                    obs: data.entradas?.nomeProjeto || proj.nome || "Projeto / Impressão",
                                    status: data.status
                                });
                            }
                        }
                    } catch (e) { }
                });

                const opening = filament ? [{
                    id: 'opening',
                    date: filament.data_abertura || filament.criado_em || new Date().toISOString(),
                    type: 'abertura',
                    qtd: 0,
                    obs: 'Carretel Aberto' + (filament.deletado_em ? ' (Deletado)' : '')
                }] : [];

                let allLogs = [];
                try {
                    const { results } = await db.prepare("SELECT * FROM filamentos_log WHERE filamento_id = ? ORDER BY data DESC").bind(filamentId).all();
                    if (results) {
                        allLogs = results.map(l => ({
                            id: l.id,
                            date: l.data,
                            type: l.tipo || 'manual',
                            qtd: l.quantidade,
                            obs: l.observacao || "Registro",
                            printerId: l.impressora_id,
                            cost: l.custo
                        }));
                    }
                } catch (e) { }

                const history = [...opening, ...consumptions, ...allLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
                const totalConsumed = history.reduce((acc, h) => acc + (h.qtd || 0), 0);
                const firstDate = new Date(opening[0]?.date || new Date());
                const now = new Date();
                const daysActive = Math.max(1, Math.floor((now - firstDate) / (1000 * 60 * 60 * 24)));
                const dailyAvg = totalConsumed / daysActive;

                return enviarJSON({
                    history,
                    stats: { dailyAvg, daysActive, totalConsumed }
                });
            }

            // Listar Filamentos (COM SOFT DELETE)
            if (pathArray[2] === 'restore' && method === 'POST') {
                const id = idFromPath;
                if (!id) return enviarJSON({ error: "ID necessário." }, 400);

                // RESTAURAR
                const { restaurar } = await import('./_helpers');
                await restaurar(db, 'filamentos', id);
                return enviarJSON({ success: true, message: "Item restaurado." });
            }

            const apenasDeletados = url.searchParams.get('deleted') === 'true';
            const query = construirQueryComSoftDelete("SELECT * FROM filamentos", "filamentos", apenasDeletados);
            const { results } = await db.prepare(`${query} ORDER BY favorito DESC, nome ASC`).all();

            // Se pedir deletados, incluir flag para UI saber
            const finalResults = results?.map(r => ({ ...r, deleted: !!r.deletado_em })) || [];

            return enviarJSON(finalResults);
        }

        if (method === 'DELETE') {
            const id = idFromPath || url.searchParams.get('id');
            if (!id) return enviarJSON({ error: "ID do filamento necessário." }, 400);

            await softDelete(db, 'filamentos', id);
            return enviarJSON({ success: true, message: "Filamento removido com sucesso." });
        }

        if (['POST', 'PUT', 'PATCH'].includes(method)) {
            const rawData = await request.json();
            const id = rawData.id || idFromPath || crypto.randomUUID();

            // POST /history
            if (method === 'POST' && pathArray[2] === 'history' && idFromPath) {
                // Log manual
                const { type, qtd, obs, tipo, quantidade, observacao } = rawData;
                const valorQtd = quantidade ?? qtd;
                const valorTipo = tipo ?? type;
                if (!valorTipo || valorQtd === undefined) return enviarJSON({ error: "Campos obrigatórios." }, 400);

                const logId = crypto.randomUUID();
                await db.prepare(`INSERT INTO filamentos_log (id, filamento_id, data, tipo, quantidade, observacao, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?)`)
                    .bind(logId, String(idFromPath), new Date().toISOString(), valorTipo || 'manual', Number(valorQtd), observacao || obs || "Manual", userId).run();
                return enviarJSON({ success: true, message: "Histórico registrado." });
            }

            if (method === 'PATCH') {
                // Simplificado para update rápido (favorito, peso)
                // Implementar Optimistic Locking se versão vier no body
                let params = [];
                let sets = [];

                if (rawData.peso_atual !== undefined) {
                    const novoPeso = paraNumero(rawData.peso_atual);
                    sets.push("peso_atual = ?");
                    params.push(novoPeso);

                    // Log de ajuste se necessário
                    const current = await db.prepare("SELECT peso_atual FROM filamentos WHERE id = ?").bind(id).first();
                    if (current) {
                        const diff = (current.peso_atual || 0) - novoPeso;
                        if (Math.abs(diff) >= 1) {
                            try {
                                await db.prepare(`INSERT INTO filamentos_log (id, filamento_id, data, tipo, quantidade, observacao, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?)`)
                                    .bind(crypto.randomUUID(), id, new Date().toISOString(), 'manual', diff, "Ajuste Manual", userId).run();
                            } catch (e) { }
                        }
                    }
                }

                if (rawData.favorito !== undefined) {
                    sets.push("favorito = ?");
                    params.push(rawData.favorito ? 1 : 0);
                }

                // Sempre incrementa versão
                sets.push("versao = versao + 1");

                // Se cliente mandou versao para validar
                let whereClause = "WHERE id = ?";
                if (rawData.versaoCurrent) {
                    whereClause += " AND versao = ?";
                    params.push(id, rawData.versaoCurrent);
                } else {
                    params.push(id);
                }

                const res = await db.prepare(`UPDATE filamentos SET ${sets.join(', ')} ${whereClause}`).bind(...params).run();

                if (rawData.versaoCurrent && res.meta.changes === 0) {
                    return enviarJSON({ error: "Conflito de versão. Recarregue os dados." }, 409);
                }
                return enviarJSON({ success: true, message: "Filamento atualizado." });
            }

            // CREATE / UPDATE COMPLETO
            const validation = validateInput(rawData, schemas.filament);
            if (!validation.valid) {
                return enviarJSON({ error: "Dados inválidos", details: validation.errors }, 400);
            }

            const da = sanitizeFields(rawData, schemas.filament);
            const tags = JSON.stringify(rawData.tags || []);
            const now = new Date().toISOString();

            // Verifica se é Create ou Update baseado no ID ou method
            // Se for update, verificar versão

            // Tenta Insert primeiro, se falhar faz Update (Upsert logic do SQLite não suporta Optimistic Locking facilmente numa query só)
            // Melhor: Check existence
            const existing = await db.prepare("SELECT id, versao FROM filamentos WHERE id = ?").bind(id).first();

            if (existing) {
                // UPDATE
                if (rawData.versao && existing.versao !== rawData.versao) {
                    return enviarJSON({ error: "Conflito de versão. Dados desatualizados." }, 409);
                }

                await db.prepare(`
                    UPDATE filamentos SET 
                        nome=?, marca=?, material=?, cor_hex=?, diametro=?, 
                        peso_total=?, peso_atual=?, preco=?, favorito=?, tags=?,
                        VERSAO = versao + 1
                    WHERE id = ?
                `).bind(
                    da.nome, da.marca || null, da.material, da.cor_hex || null, da.diametro || null,
                    da.peso_total, da.peso_atual, da.preco, da.favorito ? 1 : 0, tags,
                    id
                ).run();

                return enviarJSON({ success: true, id });
            } else {
                // INSERT
                await db.prepare(`
                    INSERT INTO filamentos (
                        id, usuario_id, nome, marca, material, cor_hex, diametro, 
                        peso_total, peso_atual, preco, data_abertura, favorito, tags, 
                        versao, criado_em, atualizado_em
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
                `).bind(
                    id, userId, da.nome, da.marca || null, da.material, da.cor_hex || null, da.diametro || null,
                    da.peso_total, da.peso_atual, da.preco, rawData.data_abertura || null,
                    da.favorito ? 1 : 0, tags, now, now
                ).run();

                return enviarJSON({ success: true, id });
            }
        }
    } catch (error) {
        return enviarJSON({ error: "Erro processando filamento", details: error.message }, 500);
    }
}
