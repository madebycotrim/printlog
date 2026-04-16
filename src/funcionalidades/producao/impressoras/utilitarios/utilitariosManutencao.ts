/**
 * Utilitários para lógica de manutenção preventiva baseada em horímetro.
 * Segue o padrão PrintLog v9.0.
 */

export type StatusVidaUtil = 'normal' | 'aviso' | 'critico';

/**
 * Calcula o percentual de vida útil percorrido em relação ao limite de revisão.
 */
export function calcularPercentualVidaUtil(horimetroMinutos: number, intervaloRevisaoMinutos: number): number {
    if (!intervaloRevisaoMinutos || intervaloRevisaoMinutos <= 0) return 0;
    const percentual = (horimetroMinutos / intervaloRevisaoMinutos) * 100;
    return Math.min(Math.max(percentual, 0), 100);
}

/**
 * Determina o status semântico da manutenção.
 * Regra: 
 * - < 90%: Normal
 * - 90% a 100%: Aviso
 * - > 100%: Crítico
 */
export function obterStatusManutencao(horimetroMinutos: number, intervaloRevisaoMinutos: number): StatusVidaUtil {
    if (!intervaloRevisaoMinutos || intervaloRevisaoMinutos <= 0) return 'normal';

    const percentual = (horimetroMinutos / intervaloRevisaoMinutos) * 100;

    if (percentual >= 100) return 'critico';
    if (percentual >= 90) return 'aviso';
    return 'normal';
}

/**
 * Retorna as cores do sistema para cada status.
 */
export function obterCorStatusManutencao(status: StatusVidaUtil): { bg: string; text: string; hex: string } {
    switch (status) {
        case 'critico':
            return { bg: 'bg-rose-500', text: 'text-rose-500', hex: '#f43f5e' };
        case 'aviso':
            return { bg: 'bg-amber-500', text: 'text-amber-500', hex: '#f59e0b' };
        default:
            return { bg: 'bg-emerald-500', text: 'text-emerald-500', hex: '#10b981' };
    }
}
