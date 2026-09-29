import i18n from "@/configuracoes/i18n";

export function obterLocaleAtivo(): { lang: string; currency: string } {
    const lang = i18n?.language || "pt-BR";
    if (lang.startsWith("en")) return { lang: "en-US", currency: "USD" };
    if (lang.startsWith("es")) return { lang: "es-ES", currency: "EUR" };
    return { lang: "pt-BR", currency: "BRL" };
}

/**
 * Converte centavos (inteiro) para string formatada de moeda conforme locale ativo.
 * Conforme Regra 6.0 do ecossistema PrintLog.
 */
export function centavosParaReais(centavos: number, moedaForcada?: string): string {
    const { lang, currency } = obterLocaleAtivo();
    return (centavos / 100).toLocaleString(lang, {
        style: "currency",
        currency: moedaForcada || currency,
    });
}

/**
 * Formata valores que exigem precisão decimal de até 4 dígitos (ex: insumos fracionados).
 */
export function formatarMoedaFracionada(centavos: number, digitosMax = 4): string {
    const { lang, currency } = obterLocaleAtivo();
    return (centavos / 100).toLocaleString(lang, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: digitosMax,
    });
}

/**
 * Extrai o valor numérico de uma string formatada (R$, %, etc)
 * Suporta vírgula decimal brasileira e ponto decimal americano.
 * Detecta automaticamente o separador decimal em casos como "1.234,56" ou "0,30".
 */
export function extrairValorNumerico(valor: any): number {
    if (valor === null || valor === undefined) return 0;
    if (typeof valor === "number") return valor;

    let str = String(valor).trim().replace(/R\$/g, "").replace(/%/g, "").replace(/\s/g, "");
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
 * Converte com segurança qualquer entrada de data para Date válida ou null.
 */
function parseDataSegura(data?: Date | string | number | null): Date | null {
    if (!data) return null;
    try {
        const d = typeof data === "number" && data < 10000000000 ? new Date(data * 1000) : new Date(data);
        return isNaN(d.getTime()) ? null : d;
    } catch {
        return null;
    }
}

/**
 * Formata um objeto Date para o padrão local (dd/mm/aaaa ou mm/dd/yyyy)
 */
export function formatarData(data?: Date | string | number | null): string {
    const d = parseDataSegura(data);
    if (!d) return "—";
    const { lang } = obterLocaleAtivo();
    return d.toLocaleDateString(lang);
}

/**
 * Formata um objeto Date para dd/mm (utilizado em cards/listas compactas)
 */
export function formatarDataCurta(data?: Date | string | number | null): string {
    const d = parseDataSegura(data);
    if (!d) return "—";
    const { lang } = obterLocaleAtivo();
    return d.toLocaleDateString(lang, {
        day: "2-digit",
        month: "2-digit",
    });
}

/**
 * Formata um objeto Date para o padrão completo local
 */
export function formatarDataCompleta(data?: Date | string | number | null): string {
    const d = parseDataSegura(data);
    if (!d) return "—";
    const { lang } = obterLocaleAtivo();
    return d.toLocaleDateString(lang, {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

/**
 * Formata um objeto Date para data e hora local
 */
export function formatarDataHora(data?: Date | string | number | null): string {
    const d = parseDataSegura(data);
    if (!d) return "—";
    const { lang } = obterLocaleAtivo();
    return d.toLocaleString(lang);
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
export function formatarDataOuRelativa(data?: Date | string | number | null): string {
    const d = parseDataSegura(data);
    if (!d) return "—";

    const hoje = new Date();
    const ontem = new Date();
    ontem.setDate(hoje.getDate() - 1);

    const { lang } = obterLocaleAtivo();

    const dataString = d.toLocaleDateString(lang);
    const hojeString = hoje.toLocaleDateString(lang);
    const ontemString = ontem.toLocaleDateString(lang);

    const hora = d.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });

    const hojeTexto = lang.startsWith("en") ? "Today" : lang.startsWith("es") ? "Hoy" : "Hoje";
    const ontemTexto = lang.startsWith("en") ? "Yesterday" : lang.startsWith("es") ? "Ayer" : "Ontem";

    if (dataString === hojeString) return `${hojeTexto}, ${hora}`;
    if (dataString === ontemString) return `${ontemTexto}, ${hora}`;
    
    return `${dataString}, ${hora}`;
}
