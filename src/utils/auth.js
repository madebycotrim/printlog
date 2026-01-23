/**
 * Tradutor de Erros do Clerk para PT-BR
 * Converte códigos de erro do Clerk em mensagens amigáveis
 */

export const authErrorMessages = {
    // Firebase Auth Errors
    'auth/invalid-email': 'Email inválido.',
    'auth/user-disabled': 'Usuário desativado.',
    'auth/user-not-found': 'Usuário não encontrado.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/email-already-in-use': 'Este email já está em uso.',
    'auth/weak-password': 'A senha é muito fraca.',
    'auth/operation-not-allowed': 'Operação não permitida.',
    'auth/invalid-credential': 'Credenciais inválidas.',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',

    // Legacy / Generic Mappings
    'form_password_incorrect': 'Senha incorreta. Tente novamente.',
    'form_identifier_not_found': 'Usuário não encontrado.',
    'session_exists': 'Você já está conectado.',
};

/**
 * Traduz erro de Autenticação para PT-BR
 * @param {string} code - Código do erro (Firebase/Auth)
 * @returns {string} Mensagem traduzida
 */
export function translateAuthError(code) {
    return authErrorMessages[code] || 'Ocorreu um erro inesperado. Tente novamente.';
}

/**
 * Extrai mensagem de erro de objeto de Autenticação
 * @param {Error} error - Erro
 * @returns {string} Mensagem traduzida
 */
export function getAuthErrorMessage(error) {
    if (!error) return 'Erro desconhecido.';

    // Firebase Auth throws an object with a 'code' property
    if (error.code) {
        return translateAuthError(error.code);
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
