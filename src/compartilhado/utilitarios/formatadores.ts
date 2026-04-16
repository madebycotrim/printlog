/**
 * Formata um valor numérico para o padrão de moeda BRL (R$ 0,00)
 * @param valor - String de dígitos
 * @returns String formatada em R$
 */
export function formatarMoedaBr(valor: string): string {
    const apenasDigitos = valor.replace(/\D/g, "");
    const valorNumerico = Number(apenasDigitos) / 100;

    return valorNumerico.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

/**
 * Converte centavos (inteiro) para string formatada de Reais.
 * Conforme Regra 6.0 do ecossistema PrintLog.
 */
export function centavosParaReais(centavos: number): string {
    return (centavos / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

/**
 * Formata um valor numérico para porcentagem (00,00%)
 * @param valor - String de dígitos
 * @returns String formatada com %
 */
export function formatarPorcentagem(valor: string): string {
    const apenasDigitos = valor.replace(/\D/g, "");
    if (!apenasDigitos) return "0,00%";

    const valorNumerico = Number(apenasDigitos) / 100;
    return valorNumerico.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }) + "%";
}

/**
 * Remove formatação e retorna apenas os dígitos como string
 */
export function extrairApenasDigitos(valor: string): string {
    return valor.replace(/\D/g, "");
}

/**
 * Formata um objeto Date para o padrão brasileiro (dd/mm/aaaa)
 */
export function formatarData(data: Date | string | number): string {
    const d = new Date(data);
    return d.toLocaleDateString("pt-BR");
}

/**
 * Formata um objeto Date para dd/mm (utilizado em cards/listas compactas)
 */
export function formatarDataCurta(data: Date | string | number): string {
    const d = new Date(data);
    return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
    });
}

/**
 * Formata um objeto Date para o padrão brasileiro com hora (dd/mm/aaaa HH:mm)
 */
export function formatarDataHora(data: Date | string | number): string {
    const d = new Date(data);
    return d.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

/**
 * Retorna o termo correto (singular/plural) baseado na quantidade.
 * Ex: pluralizar(2, "unidade", "unidades") -> "2 unidades"
 */
export function pluralizar(valor: number, singular: string, plural: string): string {
    const termo = Math.abs(valor) === 1 ? singular : plural;
    return `${valor} ${termo}`;
}
