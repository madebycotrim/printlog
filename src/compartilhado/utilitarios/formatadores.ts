
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
 * Formata um objeto Date para o padrão brasileiro completo (Ex: 15 de março de 2024)
 */
export function formatarDataCompleta(data: Date | string | number): string {
    const d = new Date(data);
    return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
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
/**
 * Formata uma string para máscara de telefone brasileira (10 ou 11 dígitos).
 * @param valor - String de dígitos
 * @returns String formatada: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
export function formatarTelefone(valor: string): string {
    const limpo = valor.replace(/\D/g, "");
    if (limpo.length <= 10) {
        return limpo.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return limpo.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
}
/**
 * Formata uma data de forma amigável (Hoje, Ontem ou Data completa)
 */
export function formatarDataOuRelativa(data: Date | string | number): string {
    const d = new Date(data);
    const hoje = new Date();
    const ontem = new Date();
    ontem.setDate(hoje.getDate() - 1);

    const dataString = d.toLocaleDateString("pt-BR");
    const hojeString = hoje.toLocaleDateString("pt-BR");
    const ontemString = ontem.toLocaleDateString("pt-BR");

    const hora = d.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });

    if (dataString === hojeString) return `Hoje, ${hora}`;
    if (dataString === ontemString) return `Ontem, ${hora}`;
    
    return `${dataString}, ${hora}`;
}
