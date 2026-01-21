

/**
 * Converte valores para número de forma segura, tratando padrões brasileiros.
 */
const limparNumero = (valor) => {
    if (valor === undefined || valor === null || valor === '') return 0;
    if (typeof valor === 'number') return valor;

    let texto = String(valor).trim();
    // Tratamento de padrão brasileiro: 1.200,50 -> 1200.50
    if (texto.includes(',')) {
        texto = texto.replace(/\./g, '').replace(',', '.');
    }
    const numero = parseFloat(texto);
    return isNaN(numero) ? 0 : numero;
};

/**
 * Mapeia do Frontend (Inglês/CamelCase) para o Backend (Português/Snake_Case)
 * Garante que os dados estejam no formato esperado pelo banco de dados D1 (SQLite).
 */
export const prepararParaD1 = (dados = {}) => {
    // Garante que o histórico seja uma string JSON válida para o SQLite
    let historicoFormatado = "[]";
    try {
        const h = dados.history || dados.historico || [];
        historicoFormatado = typeof h === 'string' ? h : JSON.stringify(h);
    } catch (erro) {
        console.error("Erro ao serializar histórico:", erro);
    }

    return {
        id: dados.id || crypto.randomUUID(),
        nome: (dados.nome || "Nova Unidade").trim(),
        marca: (dados.marca || "Genérica").trim(),
        modelo: (dados.modelo || "FDM").trim(),
        status: dados.status || "idle",
        potencia: limparNumero(dados.potencia),
        preco: limparNumero(dados.preco),
        rendimento_total: limparNumero(dados.rendimento_total),
        horas_totais: limparNumero(dados.horas_totais),
        ultima_manutencao_hora: limparNumero(dados.ultima_manutencao_hora),
        intervalo_manutencao: limparNumero(dados.intervalo_manutencao || 300),
        historico: historicoFormatado
    };
};

/**
 * (DEPRECATED) ZUSTAND STORE REMOVIDO
 * Migrado para React Query em src/features/impressoras/logic/printerQueries.js
 */