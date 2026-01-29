/**
 * Normaliza uma string para facilitar buscas agnósticas a acentos e case.
 * Ex: "Cópia" -> "copia", "Atenção" -> "atencao"
 * @param {string} str 
 * @returns {string}
 */
export const normalizeString = (str) => {
    if (!str) return "";
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
};
