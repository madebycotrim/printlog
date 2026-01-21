/**
 * UTILS - PRINTLOG
 * Central de processamento de dados, conversões e formatações.
 */

// Cache de formatadores para ganho de performance em listas grandes
const formatters = {
    currency: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }),
    decimal: (digits) => new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
    })
};

/**
 * Converte qualquer entrada (String com R$, %, pontos ou vírgulas) em Float puro.
 * Resolve conflitos entre formatos americanos (1,200.50) e brasileiros (1.200,50).
 */
export const analisarNumero = (value) => {
    if (typeof value === 'number') return isFinite(value) ? value : 0;
    if (!value || typeof value !== 'string') return 0;

    // Remove tudo que não é número, ponto ou vírgula
    let clean = value.replace(/[^\d,.]/g, '').trim();

    // Heurística de separador decimal:
    // Se houver ponto e vírgula, o último é o decimal.
    const lastDot = clean.lastIndexOf('.');
    const lastComma = clean.lastIndexOf(',');

    if (lastDot !== -1 && lastComma !== -1) {
        if (lastComma > lastDot) {
            // Formato brasileiro: 1.234,56 -> 1234.56
            clean = clean.replace(/\./g, '').replace(',', '.');
        } else {
            // Formato americano: 1,234.56 -> 1234.56
            clean = clean.replace(/,/g, '');
        }
    } else if (lastComma !== -1) {
        // Apenas vírgula: 1234,56 -> 1234.56
        clean = clean.replace(',', '.');
    }

    const result = parseFloat(clean);
    return Number.isFinite(result) ? result : 0;
};

/**
 * Gera IDs únicos. 
 * Usa Crypto API nativa (muito rápido) com fallback robusto.
 */
export const gerarUUID = () => {
    try {
        return crypto.randomUUID();
    } catch {
        // Fallback para ambientes antigos ou sem SSL
        return Array.from({ length: 3 }, () =>
            Math.random().toString(36).substring(2, 9)
        ).join('-');
    }
};



/**
 * Formata moeda (R$ 1.234,56)
 */
export const formatarMoeda = (n) => formatters.currency.format(analisarNumero(n));

/**
 * Formata decimais (1.234,56)
 * @param {number} n - Valor
 * @param {number} digits - Quantidade de casas decimais
 */
export const formatarDecimal = (n, digits = 2) => {
    // Para performance, não recriamos o Intl se for o padrão de 2 dígitos
    if (digits === 2) return formatters.decimal(2).format(analisarNumero(n));
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
    }).format(analisarNumero(n));
};





/**
 * Formata números grandes de forma compacta (ex: 1.2k, 1.5M).
 */
export const formatarCompacto = (val) => {
    const n = analisarNumero(val);
    if (!n) return "0";

    return new Intl.NumberFormat("pt-BR", {
        notation: Math.abs(n) >= 1000 ? "compact" : "standard",
        maximumFractionDigits: 1,
    }).format(n).toLowerCase();
};

// ========================================
// ALIASES DE COMPATIBILIDADE (MANTIDOS)
// Mantidos apenas os aliases que são usados no código
// ========================================
export const parseNumber = analisarNumero;
export const formatCurrency = formatarMoeda;
export const formatDecimal = formatarDecimal;
export const formatCompact = formatarCompacto;