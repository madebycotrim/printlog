// ========================================
// VALIDAÇÃO RIGOROSA DE INPUTS
// ========================================

/**
 * Schemas de validação para cada entidade do sistema
 */
export const schemas = {
    filament: {
        nome: { type: 'string', minLength: 1, maxLength: 100, required: true },
        marca: { type: 'string', maxLength: 50 },
        material: { type: 'string', maxLength: 20 },
        cor_hex: { type: 'string', pattern: /^#[0-9A-Fa-f]{6}$/, required: true },
        peso_total: { type: 'number', min: 1, max: 10000, required: true },
        peso_atual: { type: 'number', min: 0, max: 10000, required: true },
        preco: { type: 'number', min: 0, max: 100000, required: true },
        favorito: { type: 'boolean' }
    },

    printer: {
        nome: { type: 'string', minLength: 1, maxLength: 100, required: true },
        marca: { type: 'string', maxLength: 50 },
        modelo: { type: 'string', maxLength: 50 },
        status: { type: 'string', enum: ['idle', 'printing', 'offline', 'maintenance'] },
        potencia: { type: 'number', min: 0, max: 5000 },
        preco: { type: 'number', min: 0, max: 1000000 },
        horas_totais: { type: 'number', min: 0, max: 100000 },
        intervalo_manutencao: { type: 'number', min: 1, max: 10000 }
    },

    project: {
        label: { type: 'string', minLength: 1, maxLength: 200, required: true },
        data: { type: 'object', required: true }
    },

    settings: {
        custo_kwh: { type: 'number', min: 0, max: 10 },
        valor_hora_humana: { type: 'number', min: 0, max: 1000 },
        custo_hora_maquina: { type: 'number', min: 0, max: 1000 },
        taxa_setup: { type: 'number', min: 0, max: 10000 },
        consumo_impressora_kw: { type: 'number', min: 0, max: 5 },
        margem_lucro: { type: 'number', min: 0, max: 100 },
        imposto: { type: 'number', min: 0, max: 100 },
        taxa_falha: { type: 'number', min: 0, max: 100 },
        desconto: { type: 'number', min: 0, max: 100 },
        whatsapp_template: { type: 'string', maxLength: 1000 }
    },

    failure: {
        filamentId: { type: 'string', required: true },
        printerId: { type: 'string' },
        modelName: { type: 'string', maxLength: 200 },
        weightWasted: { type: 'number', min: 0, required: true },
        costWasted: { type: 'number', min: 0 },
        reason: { type: 'string', maxLength: 500 }
    },

    supply: {
        name: { type: 'string', minLength: 1, maxLength: 100, required: true },
        price: { type: 'number', min: 0, max: 100000, required: true },
        unit: { type: 'string', enum: ['un', 'kg', 'g', 'l', 'ml', 'm', 'cm'], required: true },
        minStock: { type: 'number', min: 0, max: 10000 },
        currentStock: { type: 'number', min: 0, max: 10000 }
    }
};

/**
 * Valida um valor individual contra suas regras
 * @param {any} value - Valor a ser validado
 * @param {Object} rules - Regras de validação
 * @param {string} fieldName - Nome do campo (para mensagens de erro)
 * @returns {{valid: boolean, error?: string}}
 */
function validateField(value, rules, fieldName) {
    // Campo obrigatório
    if (rules.required && (value === null || value === undefined || value === '')) {
        return { valid: false, error: `Campo '${fieldName}' é obrigatório` };
    }

    // Se não é obrigatório e está vazio, não valida o resto
    if (!rules.required && (value === null || value === undefined || value === '')) {
        return { valid: true };
    }

    // Validação de tipo
    if (rules.type === 'string' && typeof value !== 'string') {
        return { valid: false, error: `Campo '${fieldName}' deve ser texto` };
    }

    if (rules.type === 'number') {
        const num = Number(value);
        if (isNaN(num) || !isFinite(num)) {
            return { valid: false, error: `Campo '${fieldName}' deve ser número válido` };
        }

        if (rules.min !== undefined && num < rules.min) {
            return { valid: false, error: `Campo '${fieldName}' deve ser >= ${rules.min}` };
        }

        if (rules.max !== undefined && num > rules.max) {
            return { valid: false, error: `Campo '${fieldName}' deve ser <= ${rules.max}` };
        }
    }

    if (rules.type === 'boolean' && typeof value !== 'boolean') {
        return { valid: false, error: `Campo '${fieldName}' deve ser verdadeiro/falso` };
    }

    // Validação de comprimento (strings)
    if (rules.type === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
            return { valid: false, error: `Campo '${fieldName}' deve ter pelo menos ${rules.minLength} caracteres` };
        }

        if (rules.maxLength && value.length > rules.maxLength) {
            return { valid: false, error: `Campo '${fieldName}' deve ter no máximo ${rules.maxLength} caracteres` };
        }

        // Validação de padrão (regex)
        if (rules.pattern && !rules.pattern.test(value)) {
            return { valid: false, error: `Campo '${fieldName}' está em formato inválido` };
        }

        // Validação de enum
        if (rules.enum && !rules.enum.includes(value)) {
            return { valid: false, error: `Campo '${fieldName}' deve ser um dos valores: ${rules.enum.join(', ')}` };
        }
    }

    return { valid: true };
}

/**
 * Valida um objeto completo contra um schema
 * @param {Object} data - Dados a serem validados
 * @param {Object} schema - Schema de validação
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateInput(data, schema) {
    const errors = [];

    if (!data || typeof data !== 'object') {
        return { valid: false, errors: ['Dados inválidos'] };
    }

    // Valida cada campo do schema
    for (const [fieldName, rules] of Object.entries(schema)) {
        const result = validateField(data[fieldName], rules, fieldName);
        if (!result.valid) {
            errors.push(result.error);
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Remove campos não permitidos do objeto (previne poluição de dados)
 * @param {Object} data - Dados de entrada
 * @param {Object} schema - Schema permitido
 * @returns {Object} Objeto apenas com campos permitidos
 */
export function sanitizeFields(data, schema) {
    const clean = {};

    for (const key of Object.keys(schema)) {
        if (data[key] !== undefined) {
            clean[key] = data[key];
        }
    }

    return clean;
}
