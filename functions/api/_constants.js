
export const STATUS_PROJETO = {
    RASCUNHO: 'rascunho',
    APROVADO: 'aprovado',
    IMPRIMINDO: 'imprimindo',
    CONCLUIDO: 'concluido',
    CANCELADO: 'cancelado'
};

export const TRANSICOES_STATUS = {
    'rascunho': ['aprovado', 'cancelado', 'rascunho'], // Permite update no próprio status
    'aprovado': ['imprimindo', 'cancelado', 'rascunho'], // Pode voltar pra rascunho se precisar corrigir
    'imprimindo': ['concluido', 'cancelado', 'aprovado'], // Pode pausar/voltar
    'concluido': [], // Estado final, mas talvez reabrir? Por enquanto não.
    'cancelado': ['rascunho'] // Pode reativar como rascunho
};

export const NIVEL_LOG = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error'
};

/**
 * Valida se a transição de status é permitida
 * @param {string} statusAtual 
 * @param {string} statusNovo 
 * @returns {object} { valido: boolean, erro: string }
 */
export function validarTransicaoStatus(statusAtual, statusNovo) {
    // Se não mudar, é válido
    if (statusAtual === statusNovo) return { valido: true };

    const transicoesValidas = TRANSICOES_STATUS[statusAtual];

    // Status atual desconhecido ou inválido (ex: null), assume que pode ir pro RASCUNHO inicial
    if (!statusAtual && statusNovo === STATUS_PROJETO.RASCUNHO) {
        return { valido: true };
    }

    if (!transicoesValidas) {
        return { valido: false, erro: `Status atual inválido: ${statusAtual}` };
    }

    if (!transicoesValidas.includes(statusNovo)) {
        return {
            valido: false,
            erro: `Transição inválida de '${statusAtual}' para '${statusNovo}'.`
        };
    }

    return { valido: true };
}
