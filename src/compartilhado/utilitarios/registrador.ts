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
 * Registrador centralizado do sistema.
 * Proibido o uso de console.log/error diretamente nos arquivos de domínio.
 */
export const registrar = {
    info: (contexto: ContextoLog, mensagem: string) => {
        console.info(JSON.stringify({ nivel: 'info', ...contexto, mensagem, data: new Date().toISOString() }));
    },
    warn: (contexto: ContextoLog, mensagem: string) => {
        console.warn(JSON.stringify({ nivel: 'warn', ...contexto, mensagem, data: new Date().toISOString() }));
    },
    error: (contexto: ContextoLog, mensagem: string, causaOriginal?: unknown) => {
        console.error(JSON.stringify({
            nivel: 'error',
            ...contexto,
            mensagem,
            causa: causaOriginal instanceof Error ? causaOriginal.message : causaOriginal,
            data: new Date().toISOString()
        }));
    },
    fatal: (contexto: ContextoLog, mensagem: string, causaOriginal?: unknown) => {
        console.error(JSON.stringify({ nivel: 'fatal', ...contexto, mensagem, causa: causaOriginal, data: new Date().toISOString() }));
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
