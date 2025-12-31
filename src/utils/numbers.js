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
export const parseNumber = (value) => {
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
export const generateUUID = () => {
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
 * Determina se uma cor HEX é escura.
 * Útil para decidir se o texto sobre a cor deve ser Branco ou Preto.
 * @param {string} hex - Cor em formato #000, #000000 ou #00000000
 */
export const isColorDark = (hex) => {
    if (!hex || typeof hex !== 'string') return false;
    
    // Limpa e normaliza o hex
    let color = hex.replace('#', '');
    if (color.length === 3) {
        color = color.split('').map(c => c + c).join('');
    }

    // Ignora canal alpha se existir (#RRGGBBAA)
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);

    // Fórmula de luminosidade percebida (mais precisa que YIQ puro)
    // 0 é preto total, 255 é branco total.
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 140; // 140 é um threshold equilibrado para UI dark mode
};

/**
 * Formata moeda (R$ 1.234,56)
 */
export const formatCurrency = (n) => formatters.currency.format(parseNumber(n));

/**
 * Formata decimais (1.234,56)
 * @param {number} n - Valor
 * @param {number} digits - Quantidade de casas decimais
 */
export const formatDecimal = (n, digits = 2) => {
    // Para performance, não recriamos o Intl se for o padrão de 2 dígitos
    if (digits === 2) return formatters.decimal(2).format(parseNumber(n));
    return new Intl.NumberFormat('pt-BR', { 
        minimumFractionDigits: digits, 
        maximumFractionDigits: digits 
    }).format(parseNumber(n));
};

/**
 * Formata peso (g ou kg) dependendo da magnitude.
 * Útil para filamentos.
 */
export const formatWeight = (grams) => {
    const val = parseNumber(grams);
    if (val >= 1000) {
        return `${formatDecimal(val / 1000, 2)}kg`;
    }
    return `${Math.round(val)}g`;
};

/**
 * Calcula porcentagem de uso (ex: estoque de rolo)
 */
export const calculatePercentage = (current, total) => {
    const c = parseNumber(current);
    const t = parseNumber(total);
    if (t <= 0) return 0;
    const pct = (c / t) * 100;
    return Math.min(Math.max(pct, 0), 100); // Garante entre 0 e 100
};