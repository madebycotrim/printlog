// ========================================
// RATE LIMITING - PROTEÇÃO CONTRA ATAQUES
// ========================================

/**
 * Sistema de rate limiting em memória
 * Limita requisições por userId (autenticado) ou IP (não autenticado)
 */

const rateLimitMap = new Map();


/**
 * Verifica se o identificador (userId ou IP) excedeu o limite de requisições
 * @param {string} identifier - userId ou IP do cliente
 * @param {number} limit - Número máximo de requisições por minuto
 * @returns {{allowed: boolean, retryAfter?: number, remaining?: number}}
 */
export function checkRateLimit(identifier, limit = 100) {
    const now = Date.now();
    const userRequests = rateLimitMap.get(identifier) || [];

    // Remove requisições antigas (>1min)
    const recent = userRequests.filter(t => now - t < 60000);

    if (recent.length >= limit) {
        const oldestRequest = Math.min(...recent);
        const retryAfter = Math.ceil((oldestRequest + 60000 - now) / 1000);
        return {
            allowed: false,
            retryAfter,
            remaining: 0
        };
    }

    // Adiciona nova requisição
    recent.push(now);
    rateLimitMap.set(identifier, recent);

    return {
        allowed: true,
        remaining: limit - recent.length
    };
}

/**
 * Extrai identificador único do request (userId se autenticado, senão IP)
 * @param {Request} request - Request do Cloudflare Worker
 * @param {string|null} userId - ID do usuário autenticado (pode ser null)
 * @returns {string} Identificador único
 */
export function getIdentifier(request, userId = null) {
    if (userId) return `user:${userId}`;

    // Tenta pegar IP real do header CF-Connecting-IP (Cloudflare)
    const ip = request.headers.get('CF-Connecting-IP') ||
        request.headers.get('X-Forwarded-For')?.split(',')[0] ||
        'unknown';

    return `ip:${ip}`;
}
