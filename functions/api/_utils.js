// ========================================
// UTILITÁRIOS DO BACKEND - CLOUDFLARE D1
// ========================================

/**
 * Cabeçalhos CORS para permitir requisições do frontend
 */
export const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * Envia resposta JSON com CORS habilitado
 * @param {Object} data - Dados a serem enviados
 * @param {number} status - Código HTTP de status (padrão: 200)
 * @returns {Response} Resposta formatada em JSON
 */
export const enviarJSON = (data, status = 200) =>
    Response.json(data, { status, headers: corsHeaders });

/**
 * Converte valor para número tratando formato brasileiro
 * @param {any} val - Valor a ser convertido (pode conter vírgula como decimal)
 * @param {number} fallback - Valor padrão caso conversão falhe
 * @returns {number} Número convertido ou valor padrão
 */
export const paraNumero = (val, fallback = 0) => {
    if (val === null || val === undefined || val === '') return fallback;
    // Converte string para número tratando vírgula brasileira como separador decimal
    const n = Number(String(val).replace(',', '.'));
    return isNaN(n) ? fallback : n;
};