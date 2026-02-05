import { enviarJSON, paraNumero } from './_utils';
import { validateInput, schemas, sanitizeFields } from './_validation';
import { construirQueryComSoftDelete, softDelete } from './_helpers';

/**
 * API DE GERENCIAMENTO DE INSUMOS
 */
export async function gerenciarInsumos({ request, db, userId, pathArray, url }) {
    const method = request.method;
    const idFromPath = pathArray[1];
    const subRoute = pathArray[2]; // ex: 'history'

    try {
        // ==========================================
        // GET: LISTAR HISTÓRICO
        // ==========================================
        if (method === 'GET' && subRoute === 'history') {
            if (!idFromPath) return enviarJSON({ error: "ID necessário" }, 400);

            // Fetch Supply Details (for creation date)
            const supply = await db.prepare("SELECT criado_em, estoque_atual FROM insumos WHERE id = ?").bind(idFromPath).first();

            // Fetch Logs
            const logs = await db.prepare(`
                SELECT * FROM insumos_log 
                WHERE insumo_id = ? 
                ORDER BY criado_em DESC
            `).bind(idFromPath).all();

            const history = logs.results || [];

            // Synthesize Creation Log from Supply Data
            if (supply) {
                history.push({
                    id: 'creation-event',
                    insumo_id: idFromPath,
                    tipo: 'criacao',
                    mudanca_quantidade: 0,
                    observacoes: 'Item criado no sistema',
                    criado_em: supply.criado_em
                });
            }

            // Sort merged list by date DESC
            history.sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em));

            return enviarJSON({ history });
        }

        // ==========================================
        // GET: LISTAR INSUMOS
        // ==========================================
        if (method === 'GET') {
            const query = construirQueryComSoftDelete("SELECT * FROM insumos", "insumos");
            const { results } = await db.prepare(`${query} ORDER BY nome ASC`).all();
            return enviarJSON(results || []);
        }

        // ==========================================
        // DELETE: REMOVER INSUMO
        // ==========================================
        if (method === 'DELETE') {
            const id = idFromPath || url.searchParams.get('id');
            if (!id) return enviarJSON({ error: "ID do insumo necessário." }, 400);

            await softDelete(db, 'insumos', id);
            return enviarJSON({ success: true, message: "Insumo removido com sucesso." });
        }

        // ==========================================
        // POST/PUT: CRIAR OU ATUALIZAR INSUMO
        // ==========================================
        if (['POST', 'PUT'].includes(method)) {
            const rawData = await request.json();
            const id = rawData.id || idFromPath || crypto.randomUUID();

            const validation = validateInput(rawData, schemas.supply);
            if (!validation.valid) {
                return enviarJSON({ error: "Dados inválidos", details: validation.errors }, 400);
            }

            const data = sanitizeFields(rawData, schemas.supply);
            const newStock = paraNumero(data.estoque_atual);
            const newPrice = paraNumero(data.preco);

            // 1. Buscar estado atual para comparação
            const currentItem = await db.prepare("SELECT * FROM insumos WHERE id = ?").bind(id).first();

            const isNew = !currentItem;
            const oldStock = currentItem ? (currentItem.estoque_atual || 0) : 0;
            const stockDiff = newStock - oldStock;

            // Check version conflict if updating
            if (!isNew && rawData.versao && currentItem.versao !== rawData.versao) {
                return enviarJSON({ error: "Conflito de versão." }, 409);
            }

            // 2. Preparar batch de operações
            const commands = [];

            // Upsert do Insumo
            commands.push(db.prepare(`
                INSERT INTO insumos (id, usuario_id, nome, preco, unidade, estoque_minimo, estoque_atual, categoria, marca, link_compra, descricao, atualizado_em, unidade_uso, rendimento_estoque, versao) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1) 
                ON CONFLICT(id) DO UPDATE SET 
                nome=excluded.nome, preco=excluded.preco, unidade=excluded.unidade, 
                estoque_minimo=excluded.estoque_minimo, estoque_atual=excluded.estoque_atual,
                categoria=excluded.categoria, marca=excluded.marca, link_compra=excluded.link_compra,
                descricao=excluded.descricao, atualizado_em=excluded.atualizado_em,
                unidade_uso=excluded.unidade_uso, rendimento_estoque=excluded.rendimento_estoque,
                versao=versao+1
            `).bind(
                id, userId,
                data.nome, newPrice, data.unidade || 'un',
                paraNumero(data.estoque_minimo), newStock,
                data.categoria || 'geral',
                data.marca || '',
                data.link_compra || '',
                data.descricao || '',
                new Date().toISOString(),
                data.unidade_uso || '',
                paraNumero(data.rendimento_estoque) || 1
            ));

            // 3. Registrar Evento APENAS se houve mudança de estoque (IGNORAR CRIAÇÃO)
            if (!isNew && Math.abs(stockDiff) > 0.001) {
                const eventType = Math.abs(stockDiff) > 0 ? 'manual' : 'atualizacao';

                commands.push(db.prepare(`
                    INSERT INTO insumos_log (id, insumo_id, usuario_id, tipo, estoque_anterior, estoque_novo, mudanca_quantidade, custo, observacoes)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
                    crypto.randomUUID(),
                    id, userId,
                    eventType,
                    oldStock,
                    newStock,
                    stockDiff,
                    Math.abs(stockDiff * newPrice),
                    'Ajuste manual de estoque'
                ));
            }

            await db.batch(commands);
            return enviarJSON({ id, ...data, success: true });
        }
    } catch (error) {
        console.error("Erro em insumos:", error);
        return enviarJSON({ error: "Erro ao processar insumos", details: error.message }, 500);
    }
}
