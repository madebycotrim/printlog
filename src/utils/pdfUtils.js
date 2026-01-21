

export const PDF_COLORS = {
    zinco950: [9, 9, 11],
    zinco900: [24, 24, 27],
    zinco800: [39, 39, 42],
    zinco500: [113, 113, 122],
    ceu500: [14, 165, 233],
    verde500: [16, 185, 129],
    branco: [255, 255, 255],
    grade: [240, 240, 240]
};

/**
 * Desenha o cabeçalho padrão dos relatórios PDF
 * @param {jsPDF} doc Instância do jsPDF
 * @param {string} title Título principal (ex: RELATÓRIO)
 * @param {string} subtitle Subtítulo (ex: TÉCNICO DE FABRICAÇÃO)
 * @param {object} user Objeto do usuário para identificar o operador
 */
export const drawPDFHeader = (doc, title, subtitle) => {
    // --- 1. FUNDO TÉCNICO ---
    doc.setDrawColor(...PDF_COLORS.grade);
    doc.setLineWidth(0.1);
    // Grid removido para visual mais limpo
    // for (let i = 0; i < 210; i += 5) doc.line(i, 0, i, 297);
    // for (let i = 0; i < 297; i += 5) doc.line(0, i, 210, i);

    // --- 2. CABEÇALHO VISUAL ---
    doc.setFillColor(...PDF_COLORS.zinco950);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setFillColor(...PDF_COLORS.ceu500);
    doc.rect(0, 35, 210, 0.8, 'F');

    // Títulos
    // Títulos
    doc.setTextColor(...PDF_COLORS.branco);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18); // Levemente menor para elegância
    doc.text(title, 15, 20);
    doc.setTextColor(...PDF_COLORS.ceu500);
    // Ajuste de espaçamento
    doc.text(subtitle, 15 + doc.getTextWidth(title) + 3, 20);

    // Metadados
    doc.setFontSize(7);
    doc.setTextColor(...PDF_COLORS.zinco500);
    doc.setFont("courier", "bold");

    // Detalhes de canto (Design)
    doc.setDrawColor(...PDF_COLORS.ceu500);
    doc.setLineWidth(0.5);
    doc.line(10, 10, 15, 10);
    doc.line(10, 10, 10, 15);

    // Info do Operador
    const dataEmissao = new Date().toLocaleDateString('pt-BR');
    const refId = Math.random().toString(36).toUpperCase().substring(2, 10);

    doc.text(`GERADO EM: ${dataEmissao} // REF_ID: ${refId}`, 15, 28);
    // Opcional: Mostrar operador no canto direito se desejar, ou manter padrão
    // doc.text(`OPERADOR: ${operador}`, 130, 28); 
};
