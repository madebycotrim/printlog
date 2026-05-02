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
 * Converte centavos ou valor decimal para string formatada de Reais com precisão variável.
 * @param valor - Valor numérico
 * @param decimais - Quantidade de casas decimais (padrão 2)
 */
export function formatarMoedaFinancas(valor: number, decimais = 2): string {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: decimais,
        maximumFractionDigits: decimais,
    });
}

/**
 * Extrai o valor numérico de uma string formatada (R$, %, etc)
 * Suporta vírgula decimal brasileira.
 */
/**
 * Extrai o valor numérico de uma string formatada (R$, %, etc)
 * Suporta vírgula decimal brasileira e ponto decimal americano.
 * Detecta automaticamente o separador decimal em casos como "1.234,56" ou "0,30".
 */
export function extrairValorNumerico(valor: any): number {
    if (valor === null || valor === undefined) return 0;
    if (typeof valor === "number") return valor;

    let str = String(valor).trim().replace("R$", "").replace("%", "").replace(/\s/g, "");
    if (!str) return 0;

    // Detecta se o padrão é BR (1.234,56) ou US (1,234.56)
    const ultimaVirgula = str.lastIndexOf(",");
    const ultimoPonto = str.lastIndexOf(".");

    if (ultimaVirgula > ultimoPonto) {
        // Padrão Brasileiro: 1.234,56 -> remove pontos (milhar), troca vírgula por ponto (decimal)
        str = str.replace(/\./g, "").replace(",", ".");
    } else if (ultimoPonto > ultimaVirgula) {
        // Padrão Americano: 1,234.56 -> remove vírgulas (milhar)
        str = str.replace(/,/g, "");
    } else if (ultimaVirgula !== -1) {
        // Apenas vírgula: 0,30 -> troca por ponto
        str = str.replace(",", ".");
    }

    const num = Number(str);
    return isNaN(num) ? 0 : num;
}

/**
 * Formata um valor numérico para porcentagem (00,00%)
 * @param valor - String de dígitos
 * @returns String formatada com %
 */
export function formatarPorcentagem(valor: string): string {
    if (!valor) return "0,00%";
    
    let limpo = valor.replace("%", "").trim().replace(",", ".");
    const valorNumerico = Number(limpo);
    
    if (isNaN(valorNumerico)) return "0,00%";
 
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
