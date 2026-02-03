/**
 * Constrói a cláusula WHERE para filtrar registros deletados (Soft Delete)
 * @param {string} alias - Alias da tabela na query (ex: 'f' para filamentos)
 * @param {boolean} apenasDeletados - Se true, retorna APENAS os deletados. Se false, retorna apenas os NÃO deletados.
 * @returns {string} Cláusula SQL
 */
export function construirQueryComSoftDelete(baseQuery, alias = '', apenasDeletados = false) {
    const hasWhere = baseQuery.toUpperCase().includes('WHERE');
    const prefixo = alias ? `${alias}.` : '';
    const condicao = apenasDeletados
        ? `${prefixo}deletado_em IS NOT NULL`
        : `${prefixo}deletado_em IS NULL`;

    if (hasWhere) {
        return `${baseQuery} AND ${condicao}`;
    }
    return `${baseQuery} WHERE ${condicao}`;
}

/**
 * Realiza o Soft Delete de um registro
 * @param {D1Database} db 
 * @param {string} tabela 
 * @param {string} id 
 * @returns {Promise<D1Result>}
 */
export async function softDelete(db, tabela, id) {
    return await db.prepare(`
        UPDATE ${tabela} 
        SET deletado_em = ? 
        WHERE id = ?
    `).bind(new Date().toISOString(), id).run();
}

/**
 * Restaura um registro deletado
 * @param {D1Database} db 
 * @param {string} tabela 
 * @param {string} id 
 * @returns {Promise<D1Result>}
 */
export async function restaurar(db, tabela, id) {
    return await db.prepare(`
        UPDATE ${tabela} 
        SET deletado_em = NULL 
        WHERE id = ?
    `).bind(id).run();
}

/**
 * Envia resposta JSON padronizada
 * @param {any} data 
 * @param {number} status 
 * @returns {Response}
 */
export function enviarJSON(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    });
}

/**
 * Calcula o uso de armazenamento estimado para um usuário
 * @param {D1Database} db 
 * @param {string} userId 
 * @returns {Promise<number>} Tamanho em bytes
 */
export async function calcularUsoArmazenamento(db, userId) {
    if (!userId) return 0;

    // Tabelas para somar
    const queries = [
        `SELECT SUM(LENGTH(nome) + LENGTH(descricao) + 100) as size FROM filamentos WHERE usuario_id = ?`,
        `SELECT SUM(LENGTH(nome) + LENGTH(descricao) + 100) as size FROM insumos WHERE usuario_id = ?`,
        `SELECT SUM(LENGTH(nome) + 100) as size FROM projetos WHERE usuario_id = ?`,
        `SELECT SUM(LENGTH(observacao) + 50) as size FROM filamentos_log WHERE usuario_id = ?`,
        `SELECT SUM(LENGTH(observacoes) + 50) as size FROM insumos_log WHERE usuario_id = ?`
    ];

    const batch = await db.batch(queries.map(q => db.prepare(q).bind(userId)));
    return batch.reduce((acc, res) => acc + (res.results[0]?.size || 0), 0);
}

/**
 * Verifica se o usuário excedeu a quota de armazenamento (1GB)
 * @param {D1Database} db 
 * @param {string} userId 
 * @throws {Error} Se exceder a quota
 */
export async function verificarQuota(db, userId) {
    const MAX_STORAGE = 1024 * 1024 * 1024; // 1GB
    const usado = await calcularUsoArmazenamento(db, userId);

    if (usado >= MAX_STORAGE) {
        throw new Error("QUOTA_EXCEEDED");
    }
}
