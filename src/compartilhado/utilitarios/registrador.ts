/**
 * @file registrador.ts
 * @description Logger centralizado conforme Regra 11.
 * @note Implementação inicial simplificada para evitar conflitos de dependência, 
 *       mantendo a API compatível com o ecossistema PrintLog.
 */

interface ContextoLog extends Record<string, unknown> {
    rastreioId: string;
}

/**
 * Níveis de log suportados pelo sistema.
 */
const NIVEIS_LOG = {
    info: 0,
    warn: 1,
    error: 2,
    fatal: 3
} as const;

type NivelLog = keyof typeof NIVEIS_LOG;

/**
 * Define o nível mínimo de log baseado no ambiente.
 * Padrão: 'warn' no desenvolvimento para evitar ruído, 'error' em produção.
 */
const NIVEL_MINIMO: NivelLog = (import.meta.env.VITE_LOG_LEVEL as NivelLog) || (import.meta.env.DEV ? 'warn' : 'error');

const deveRegistrar = (nivel: NivelLog): boolean => {
    return NIVEIS_LOG[nivel] >= NIVEIS_LOG[NIVEL_MINIMO];
};

/**
 * Registrador centralizado do sistema.
 * Proibido o uso de console.log/error diretamente nos arquivos de domínio.
 */
export const registrar = {
    info: (contexto: ContextoLog, mensagem: string) => {
        if (deveRegistrar('info')) {
            console.info(JSON.stringify({ nivel: 'info', ...contexto, mensagem, data: new Date().toISOString() }));
        }
    },
    warn: (contexto: ContextoLog, mensagem: string) => {
        if (deveRegistrar('warn')) {
            console.warn(JSON.stringify({ nivel: 'warn', ...contexto, mensagem, data: new Date().toISOString() }));
        }
    },
    error: (contexto: ContextoLog, mensagem: string, causaOriginal?: unknown) => {
        if (deveRegistrar('error')) {
            console.error(JSON.stringify({
                nivel: 'error',
                ...contexto,
                mensagem,
                causa: causaOriginal instanceof Error ? causaOriginal.message : causaOriginal,
                data: new Date().toISOString()
            }));
        }
    },
    fatal: (contexto: ContextoLog, mensagem: string, causaOriginal?: unknown) => {
        if (deveRegistrar('fatal')) {
            console.error(JSON.stringify({ nivel: 'fatal', ...contexto, mensagem, causa: causaOriginal, data: new Date().toISOString() }));
        }
    }
};

/**
 * Higieniza dados sensíveis (LGPD) para logs.
 * @lgpd Art. 5º, X - Higienização de PII em logs de operação.
 */
export function mascararDadoPessoal(valor: string, tipo: 'cpf' | 'email' | 'cartao' | 'token'): string {
    if (!valor) return valor;

    switch (tipo) {
        case 'cpf':
            return valor.replace(/^(\d{3}).*(\d{2})$/, '$1.***.***-$2');
        case 'email':
            const [usuario, dominio] = valor.split('@');
            return `${usuario.substring(0, 2)}***@${dominio}`;
        case 'token':
        case 'cartao':
            return `****${valor.slice(-4)}`;
        default:
            return '********';
    }
}
