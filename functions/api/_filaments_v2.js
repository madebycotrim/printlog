import { enviarJSON, paraNumero } from './_utils';
import { validateInput, schemas, sanitizeFields } from './_validation';
import { cacheQuery, invalidateCache } from './_cache';

/**
 * API DE GERENCIAMENTO DE FALHAS
 * Registra falhas de impressão e atualiza automaticamente o estoque de filamentos
 */
/**
 * API DE GERENCIAMENTO DE FALHAS
 * Registra falhas de impressão e atualiza automaticamente o estoque de filamentos
 */
// --------------------------------------------------------------------------------
// API DE GERENCIAMENTO DE FALHAS (Unificado com Logs)
// --------------------------------------------------------------------------------
export async function gerenciarFalhas({ request, db, userId }) {
    const method = request.method;

    try {
        // (Removido: Auto-migration agora é feito no setup, não em cada request)
        // Isso evita latência e previne erros de concorrência.


        if (method === 'GET') {
            console.log("🔍 Entrou em gerenciarFalhas GET. User:", userId);

            // Ensure table exists (Lazy Initialization)
            await db.prepare(`CREATE TABLE IF NOT EXISTS filament_logs (
                id TEXT PRIMARY KEY, 
                filament_id TEXT NOT NULL, 
                date TEXT NOT NULL, 
                type TEXT NOT NULL CHECK(type IN ('falha', 'manual', 'abertura', 'consumo', 'ajuste')),
                amount REAL DEFAULT 0, 
                obs TEXT,
                user_id TEXT NOT NULL,
                printer_id TEXT,
                model_name TEXT,
                cost REAL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`).run();

            // Retorna histórico de falhas (agora vindo de filament_logs)
            const { results } = await db.prepare(`
                SELECT * FROM filament_logs 
                WHERE type = 'falha'
                ORDER BY date DESC 
                LIMIT 50
            `).all();

            // Calcula estatísticas
            let stats = { total_weight: 0, total_cost: 0, total_failures: 0 };
            try {
                const s = await db.prepare(`
                    SELECT 
                        SUM(amount) as total_weight, 
                        SUM(cost) as total_cost, 
                        COUNT(*) as total_failures 
                    FROM filament_logs 
                    WHERE type = 'falha'
                `).first();
                if (s) stats = s;
            } catch (e) {
                // Fallback: Se der erro (ex: coluna 'cost' não existe), tenta sem ela ou retorna zerado
                try {
                    const s = await db.prepare(`
                        SELECT 
                            SUM(amount) as total_weight, 
                            0 as total_cost, 
                            COUNT(*) as total_failures 
                        FROM filament_logs 
                        WHERE type = 'falha'
                    `).first();
                    if (s) stats = s;
                } catch (e2) { }
            }

            // Normaliza retorno para o frontend (mapeando colunas novas para as esperadas se necessário)
            const history = (results || []).map(r => ({
                id: r.id,
                date: r.date,
                filamentId: r.filament_id,
                printerId: r.printer_id,
                modelName: r.model_name,
                weightWasted: r.amount,
                costWasted: r.cost,
                reason: r.obs
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

            // Validação
            const validation = validateInput(rawData, schemas.failure);
            if (!validation.valid) {
                return enviarJSON({ error: "Dados inválidos", details: validation.errors }, 400);
            }

            const f = sanitizeFields(rawData, schemas.failure);
            const id = crypto.randomUUID();
            const date = new Date().toISOString();

            // 1. Registra a falha na tabela UNIFICADA (filament_logs)
            // Campos: id, filament_id, date, type, amount (weight), obs (reason), user_id, printer_id, model_name, cost
            await db.prepare(`
                INSERT INTO filament_logs (
                    id, filament_id, date, type, amount, obs, 
                    user_id, printer_id, model_name, cost
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                id,
                f.filamentId,
                date,
                'falha',
                paraNumero(f.weightWasted),
                f.reason || "Falha genérica",
                userId,
                f.printerId || null,
                f.modelName || "Impressão sem nome",
                paraNumero(f.costWasted)
            ).run();

            // 2. Deduz do estoque (se houver filamento)
            if (f.filamentId && f.filamentId !== 'manual') {
                const filamento = await db.prepare("SELECT peso_atual FROM filaments WHERE id = ?").bind(f.filamentId).first();
                if (filamento) {
                    const novoPeso = Math.max(0, filamento.peso_atual - paraNumero(f.weightWasted));
                    await db.prepare("UPDATE filaments SET peso_atual = ? WHERE id = ?").bind(novoPeso, f.filamentId).run();
                }
            }

            return enviarJSON({ success: true, message: "Falha registrada com sucesso." });
        }

    } catch (error) {
        console.error("FATAL ERROR in gerenciarFalhas:", error);
        console.error("Stack:", error.stack);
        return enviarJSON({
            error: "Erro ao processar falhas",
            details: error.message,
            stack: error.stack
        }, 500);
    }
}

export async function gerenciarFilamentos({ request, db, userId, pathArray, url }) {
    const method = request.method;
    const idFromPath = pathArray[1];

    try {
        if (method === 'GET') {
            // Rota de Histórico Individual: /filaments/:id/history
            if (pathArray[2] === 'history' && idFromPath) {
                const filamentId = idFromPath;

                // 1. (Tabela 'failures' foi migrada e unificada em 'filament_logs')
                // Não é mais necessário buscar nela.

                // 2. Buscar Consumo em Projetos (Aprovados ou não, se já teve cálculo/uso)
                const { results: allProjects } = await db.prepare("SELECT * FROM projects ORDER BY created_at DESC LIMIT 100").all();

                const consumptions = [];
                (allProjects || []).forEach(proj => {
                    try {
                        const data = JSON.parse(proj.data || "{}");
                        // Verifica se este filamento está listado nos inputs do projeto
                        if (Array.isArray(data.entradas?.filamentos)) {
                            const usage = data.entradas.filamentos.find(f => String(f.id) === String(filamentId));
                            // Se tiver uso > 0
                            if (usage && (usage.peso || usage.weight)) {
                                consumptions.push({
                                    id: proj.id,
                                    date: proj.created_at,
                                    type: 'consumo', // Frontend pode tratar isso como 'Impressão'
                                    qtd: paraNumero(usage.peso || usage.weight),
                                    obs: data.entradas?.nomeProjeto || proj.label || "Projeto / Impressão",
                                    status: data.status // Passa status para frontend mostrar (Rascunho/Aprovado)
                                });
                            }
                        }
                    } catch (e) { }
                });

                // 3. Buscar Dados do Filamento (Abertura)
                const filament = await db.prepare("SELECT * FROM filaments WHERE id = ?").bind(filamentId).first();
                const opening = filament ? [{
                    id: 'opening',
                    date: filament.data_abertura || filament.created_at || new Date().toISOString(),
                    type: 'abertura',
                    qtd: 0,
                    obs: 'Carretel Aberto'
                }] : [];

                // 4. Buscar Logs (Inclui: 'manual', 'falha', 'ajuste', etc.)
                // Agora 'fails' também virão daqui
                let allLogs = [];
                try {
                    // Ensure columns exist just in case read happens before write
                    try { await db.prepare("ALTER TABLE filament_logs ADD COLUMN user_id TEXT").run(); } catch (e) { }
                    try { await db.prepare("ALTER TABLE filament_logs ADD COLUMN printer_id TEXT").run(); } catch (e) { }

                    const { results } = await db.prepare("SELECT * FROM filament_logs WHERE filament_id = ? ORDER BY date DESC").bind(filamentId).all();
                    if (results) {
                        allLogs = results.map(l => ({
                            id: l.id,
                            date: l.date,
                            type: l.type || 'manual', // 'falha' | 'manual' | ...
                            qtd: l.amount,
                            // Se for falha, podemos querer mostrar reason, senão obs
                            obs: l.obs || "Registro",
                            // Campos extras opcionais
                            printerId: l.printer_id,
                            cost: l.cost
                        }));
                    }
                } catch (e) { }

                // 5. Combinar e Ordenar
                const history = [...opening, ...consumptions, ...allLogs].sort((a, b) => new Date(b.date) - new Date(a.date));

                // 7. Calcular Estatísticas
                const totalConsumed = history.reduce((acc, h) => acc + (h.qtd || 0), 0);
                const firstDate = new Date(opening[0]?.date || new Date());
                const now = new Date();
                const daysActive = Math.max(1, Math.floor((now - firstDate) / (1000 * 60 * 60 * 24)));
                const dailyAvg = totalConsumed / daysActive;

                return enviarJSON({
                    history,
                    stats: {
                        dailyAvg,
                        daysActive,
                        totalConsumed
                    }
                });
            }

            // Sem cache por enquanto
            const { results } = await db.prepare("SELECT * FROM filaments ORDER BY favorito DESC, nome ASC").all();
            return enviarJSON(results || []);
        }

        if (method === 'DELETE') {
            const id = idFromPath || url.searchParams.get('id');
            if (!id) return enviarJSON({ error: "ID do filamento necessário." }, 400);

            await db.prepare("DELETE FROM filaments WHERE id = ?").bind(id).run();
            // invalidateCache(`filaments:${tenantId}`);

            return enviarJSON({ success: true, message: "Filamento removido com sucesso." });
        }

        if (['POST', 'PUT', 'PATCH'].includes(method)) {
            // DEBUG: REMOVE THIS LINE AFTER VERIFICATION
            // throw new Error("DEBUG: O código foi atualizado com sucesso! (Pode remover este erro)");

            const rawData = await request.json();
            const id = rawData.id || idFromPath || crypto.randomUUID();

            // ROTA ESPECÍFICA: POST /filaments/:id/history (Registro Manual de Histórico)
            if (method === 'POST' && pathArray[2] === 'history' && idFromPath) {
                const { type, qtd, obs } = rawData;

                if (!type || qtd === undefined) {
                    return enviarJSON({ error: "Campos type e qtd são obrigatórios." }, 400);
                }

                try {
                    await db.prepare(`CREATE TABLE IF NOT EXISTS filament_logs (
                        id TEXT PRIMARY KEY, 
                        filament_id TEXT NOT NULL, 
                        date TEXT NOT NULL, 
                        type TEXT NOT NULL CHECK(type IN ('falha', 'manual', 'abertura', 'consumo', 'ajuste')),
                        amount REAL DEFAULT 0, 
                        obs TEXT,
                        user_id TEXT NOT NULL,
                        printer_id TEXT,
                        model_name TEXT,
                        cost REAL DEFAULT 0,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )`).run();

                    // Ensure 'type' column exists (migration for older DBs)
                    try { await db.prepare("ALTER TABLE filament_logs ADD COLUMN type TEXT").run(); } catch (e) { }

                    const logId = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : String(Date.now() + Math.random());
                    const logDate = new Date().toISOString();
                    const logType = String(type || 'manual');
                    const logAmount = (Number(qtd) || 0); // Hard fallback
                    const logObs = String(obs || "Registro Manual");
                    const logFilamentId = String(idFromPath);
                    const logAmountNumeric = Number(logAmount); // Ensure number

                    try {
                        await db.prepare(`INSERT INTO filament_logs (id, filament_id, date, type, amount, obs, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)`)
                            .bind(logId, logFilamentId, logDate, logType, logAmountNumeric, logObs, userId)
                            .run();
                    } catch (dbError) {
                        throw new Error(`DB Error: ${dbError.message} | Values: id=${typeof logId}, filId=${typeof logFilamentId} (${logFilamentId}), type=${typeof logType} (${logType}), amt=${typeof logAmountNumeric} (${logAmountNumeric})`);
                    }

                    return enviarJSON({ success: true, message: "Histórico registrado." });
                } catch (e) {
                    return enviarJSON({ error: "Erro ao gravar log", details: e.message }, 500);
                }
            }

            if (method === 'PATCH') {
                // Atualização parcial (apenas peso ou favorito)
                if (rawData.peso_atual !== undefined) {
                    const novoPeso = paraNumero(rawData.peso_atual);

                    // Busca peso antigo para calcular diferença e logar
                    const current = await db.prepare("SELECT peso_atual FROM filaments WHERE id = ?").bind(id).first();
                    if (current) {
                        const diff = (current.peso_atual || 0) - novoPeso;
                        // Se houve redução (consumo), loga. Se for aumento (correçâo), loga também?
                        // Vamos logar qualquer mudança significativa (> 1g) como ajuste manual
                        if (Math.abs(diff) >= 1) {
                            try {
                                await db.prepare(`CREATE TABLE IF NOT EXISTS filament_logs (
                                    id TEXT PRIMARY KEY, 
                                    filament_id TEXT NOT NULL, 
                                    date TEXT NOT NULL, 
                                    type TEXT NOT NULL CHECK(type IN ('falha', 'manual', 'abertura', 'consumo', 'ajuste')),
                                    amount REAL DEFAULT 0, 
                                    obs TEXT,
                                    user_id TEXT NOT NULL,
                                    printer_id TEXT,
                                    model_name TEXT,
                                    cost REAL DEFAULT 0,
                                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                                )`).run();

                                await db.prepare(`INSERT INTO filament_logs (id, filament_id, date, type, amount, obs, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)`)
                                    .bind(crypto.randomUUID(), id, new Date().toISOString(), 'manual', diff, "Ajuste Manual (Baixa/Correção)", userId).run();
                            } catch (e) { console.error("Erro ao logar ajuste:", e); }
                        }
                    }

                    await db.prepare("UPDATE filaments SET peso_atual = ? WHERE id = ?")
                        .bind(novoPeso, id).run();
                }
                if (rawData.favorito !== undefined) {
                    await db.prepare("UPDATE filaments SET favorito = ? WHERE id = ?")
                        .bind(rawData.favorito ? 1 : 0, id).run();
                }

                // invalidateCache(`filaments:${tenantId}`);
                return enviarJSON({ success: true, message: "Filamento atualizado." });
            }

            // Validação completa para Criar/Editar
            const validation = validateInput(rawData, schemas.filament);
            if (!validation.valid) {
                return enviarJSON({ error: "Dados inválidos", details: validation.errors }, 400);
            }

            const da = sanitizeFields(rawData, schemas.filament);
            // Campos extras que não estão na validação mas salvamos
            const tags = JSON.stringify(rawData.tags || []);



            await db.prepare(`INSERT INTO filaments (id, user_id, nome, marca, material, cor_hex, diametro, peso_total, peso_atual, preco, data_abertura, favorito, tags) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET 
                nome=excluded.nome, marca=excluded.marca, material=excluded.material, cor_hex=excluded.cor_hex, diametro=excluded.diametro,
                peso_total=excluded.peso_total, peso_atual=excluded.peso_atual, preco=excluded.preco, 
                favorito=excluded.favorito, tags=excluded.tags`)
                .bind(id, userId, da.nome, da.marca || null, da.material || null, da.cor_hex, da.diametro || '1.75', paraNumero(da.peso_total),
                    paraNumero(da.peso_atual), paraNumero(da.preco), rawData.data_abertura || null, da.favorito ? 1 : 0, tags).run();

            // invalidateCache(`filaments:${tenantId}`);
            return enviarJSON({ id, ...da, success: true });
        }
    } catch (error) {
        return enviarJSON({ error: "Erro ao processar filamentos", details: error.message }, 500);
    }
}
