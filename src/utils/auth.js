/**
 * Tradutor de Erros do Clerk para PT-BR
 * Converte códigos de erro do Clerk em mensagens amigáveis
 */

export const clerkErrorMessages = {
    // Erros de Login
    'form_password_incorrect': 'Senha incorreta. Tente novamente.',
    'form_identifier_not_found': 'Usuário não encontrado.',
    'session_exists': 'Você já está conectado.',
    'needs_second_factor': 'Código de verificação necessário.',

    // Erros de Signup
    'form_identifier_exists': 'Este email já está em uso.',
    'form_password_pwned': 'Esta senha é muito comum. Escolha uma mais segura.',
    'form_password_length_too_short': 'A senha deve ter no mínimo 8 caracteres.',
    'form_password_validation_failed': 'Senha muito fraca. Use letras, números e símbolos.',

    // Erros de Verificação
    'form_code_incorrect': 'Código de verificação incorreto.',
    'verification_expired': 'Código expirado. Solicite um novo.',
    'verification_failed': 'Falha na verificação. Tente novamente.',

    // Erros de Rede
    'clerk_network_error': 'Erro de conexão. Verifique sua internet.',
    'rate_limit_exceeded': 'Muitas tentativas. Aguarde alguns minutos.',

    // Erros Genéricos
    'authorization_invalid': 'Sessão inválida. Faça login novamente.',
    'client_uat_without_clerk_js': 'Erro ao carregar sistema de autenticação.',
    'session_not_found': 'Sessão não encontrada. Faça login novamente.',
    'internal_error': 'Erro interno. Tente mais tarde.',
    'form_username_invalid': 'Nome de usuário inválido.'
};

/**
 * Traduz erro do Clerk para PT-BR
 * @param {string} code - Código do erro Clerk
 * @returns {string} Mensagem traduzida
 */
export function translateClerkError(code) {
    return clerkErrorMessages[code] || 'Ocorreu um erro inesperado. Tente novamente.';
}

/**
 * Extrai mensagem de erro de objeto Clerk
 * @param {Error} error - Erro do Clerk
 * @returns {string} Mensagem traduzida
 */
export function getClerkErrorMessage(error) {
    if (!error) return 'Erro desconhecido.';

    // Clerk retorna erros em error.errors[]
    if (error.errors && error.errors.length > 0) {
        const firstError = error.errors[0];
        return translateClerkError(firstError.code);
    }

    // Fallback para mensagem genérica
    return error.message || 'Ocorreu um erro. Tente novamente.';
}

/**
 * Valida email
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Valida senha
 * @param {string} password
 * @returns {{valid: boolean, message: string}}
 */
export function validatePassword(password) {
    if (!password || password.length < 8) {
        return { valid: false, message: 'A senha deve ter no mínimo 8 caracteres.' };
    }

    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'A senha deve conter pelo menos uma letra maiúscula.' };
    }

    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'A senha deve conter pelo menos uma letra minúscula.' };
    }

    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'A senha deve conter pelo menos um número.' };
    }

    return { valid: true, message: '' };
}

/**
 * Sanitiza input de usuário
 * @param {string} input
 * @returns {string}
 */
export function sanitizeInput(input) {
    if (!input) return '';
    return input.trim().replace(/[<>]/g, '');
}

/**
 * Salva URL de redirecionamento
 * @param {string} url
 */
export function saveRedirectUrl(url) {
    if (url && url !== '/login' && url !== '/register') {
        sessionStorage.setItem('redirect_after_login', url);
    }
}

/**
 * Recupera e limpa URL de redirecionamento
 * @returns {string}
 */
export function getRedirectUrl() {
    const url = sessionStorage.getItem('redirect_after_login') || '/dashboard';
    sessionStorage.removeItem('redirect_after_login');
    return url;
}

/**
 * Limpa dados de autenticação
 */
export function clearAuthData() {
    sessionStorage.removeItem('redirect_after_login');
    localStorage.removeItem('last_login');
}

/**
 * Calcula força da senha
 * @param {string} password 
 * @returns {{pontuacao: number, rotulo: string, cor: string}}
 */
export function calculatePasswordStrength(password) {
    if (!password) return { pontuacao: 0, rotulo: "Aguardando", cor: "zinc" };

    let pontuacao = 0;
    if (password.length >= 8) pontuacao += 25;
    if (password.length >= 12) pontuacao += 25;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) pontuacao += 25;
    if (/[^A-Za-z0-9]/.test(password)) pontuacao += 25;

    if (pontuacao <= 25) return { pontuacao, rotulo: "Fraca", cor: "rose" };
    if (pontuacao <= 50) return { pontuacao, rotulo: "Média", cor: "amber" };
    if (pontuacao <= 75) return { pontuacao, rotulo: "Forte", cor: "sky" };
    return { pontuacao, rotulo: "Excelente", cor: "emerald" };
}
