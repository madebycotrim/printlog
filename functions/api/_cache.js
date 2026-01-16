// ========================================
// CACHE EM MEMÓRIA COM TTL
// ========================================

/**
 * Sistema de cache simples com Time-To-Live
 * Reduz latência de queries D1 repetidas
 */

const cache = new Map();


/**
 * Executa query com cache
 * @param {string} key - Chave única para o cache
 * @param {number} ttl - Time-to-live em milissegundos
 * @param {Function} queryFn - Função assíncrona que executa a query
 * @returns {Promise<any>} Resultado da query (cache ou fresh)
 */
export async function cacheQuery(key, ttl, queryFn) {
    const now = Date.now();
    const cached = cache.get(key);

    // Se tem cache válido, retorna
    if (cached && now < cached.expiry) {
        return cached.data;
    }

    // Executa query e armazena no cache
    const data = await queryFn();
    cache.set(key, {
        data,
        expiry: now + ttl
    });

    return data;
}

/**
 * Invalida cache por padrão de chave
 * @param {string|RegExp} pattern - Padrão de chave a invalidar
 */
export function invalidateCache(pattern) {
    if (typeof pattern === 'string') {
        // Invalidação exata
        cache.delete(pattern);
    } else if (pattern instanceof RegExp) {
        // Invalidação por regex
        for (const key of cache.keys()) {
            if (pattern.test(key)) {
                cache.delete(key);
            }
        }
    }
}

/**
 * Limpa todo o cache
 */
export function clearCache() {
    cache.clear();
}

/**
 * Retorna estatísticas do cache
 * @returns {{size: number, keys: string[]}}
 */
export function getCacheStats() {
    return {
        size: cache.size,
        keys: Array.from(cache.keys())
    };
}
