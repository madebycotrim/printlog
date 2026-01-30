import { formatCurrency } from "./numbers";
import { PDF_COLORS, drawPDFHeader } from "./pdfUtils";

/**
 * GERADOR DE PDF PROFISSIONAL
 * Cria relatório técnico de fabricação com detalhamento de custos e especificações
 * @param {Object} resultados - Dados calculados pelo motor de precificação
 * @param {Object} entradas - Dados de entrada do formulário (projeto, material, tempo, custos)
 * @param {Number} precoFinalExibido - Preço final exibido (com arredondamentos manuais, se houver)
 * @returns {Promise<void>} Abre PDF em nova aba do navegador
 */
export const generateProfessionalPDF = async (resultados, entradas, precoFinalExibido) => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF('p', 'mm', 'a4');

    // Desenha cabeçalho padrão
    // Nota: Passamos null para user pois essa função não recebe o objeto user atualmente.
    // Se necessário, pode-se passar como argumento extra no futuro.
    drawPDFHeader(doc, "RELATÓRIO", "TÉCNICO DE FABRICAÇÃO", null);

    const cores = PDF_COLORS; // Alias para manter compatibilidade com código abaixo se necessário ou usar direto

    // --- 3. DADOS DE PROJETO ---
    doc.setFillColor(...cores.branco);
    doc.setDrawColor(...cores.zinco800);
    doc.roundedRect(10, 45, 190, 20, 1, 1, 'FD');

    doc.setTextColor(...cores.zinco500);
    doc.setFontSize(6);
    doc.text("IDENTIFICAÇÃO DO PROJETO", 15, 51);
    doc.setTextColor(...cores.zinco950);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bolditalic");
    doc.text(entradas.nomeProjeto?.toUpperCase() || "PROJETO_SEM_TITULO", 15, 60);

    // --- 4. ESPECIFICAÇÕES TÉCNICAS ---
    const material = entradas.material || {};
    const tempo = entradas.tempo || {};
    const pesoTotal = material.slots?.length > 0
        ? material.slots.reduce((acc, s) => acc + (Number(String(s.weight).replace(',', '.')) || 0), 0)
        : (Number(String(material.pesoModelo || entradas.pesoModelo).replace(',', '.')) || 0);

    const horasImp = Number(tempo.impressaoHoras) || 0;
    const minutosImp = Number(tempo.impressaoMinutos) || 0;

    const desenharModulo = (x, y, titulo, valor, passo) => {
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(x, y, 60, 25, 0.5, 0.5, 'FD');
        doc.setFillColor(...cores.zinco950);
        doc.rect(x, y, 60, 5, 'F');
        doc.setTextColor(...cores.branco);
        doc.setFontSize(5);
        doc.text(titulo, x + 3, y + 3.5);
        doc.text(`MOD_${passo}`, x + 50, y + 3.5);
        doc.setTextColor(...cores.zinco950);
        doc.setFontSize(11);
        doc.setFont("courier", "bold");
        doc.text(String(valor), x + 30, y + 17, { align: 'center' });
    };

    desenharModulo(10, 75, "MASSA_ESTIMADA", `${pesoTotal}g`, "01");
    desenharModulo(75, 75, "TEMPO_PRODUÇÃO", `${horasImp}h ${minutosImp}m`, "02");
    desenharModulo(140, 75, "QUANTIDADE", `${entradas.qtdPecas || 1} UN`, "03");

    // --- 5. COMPOSIÇÃO DE CUSTOS ---
    doc.setTextColor(...cores.zinco950);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("02. DETALHAMENTO DE INSUMOS E PROCESSAMENTO", 10, 115);

    let eixoY = 125;
    const adicionarLinha = (label, valor) => {
        const num = Number(valor) || 0;
        if (num <= 0) return;
        doc.setFont("helvetica", "bolditalic");
        doc.setFontSize(8);
        doc.setTextColor(...cores.zinco900);
        doc.text(label, 15, eixoY);
        doc.setFont("courier", "bold");
        doc.text(formatCurrency(num), 195, eixoY, { align: 'right' });
        doc.setDrawColor(...cores.zinco800);
        doc.setLineWidth(0.1);
        doc.line(15, eixoY + 3, 195, eixoY + 3);
        eixoY += 10;
    };

    adicionarLinha("Insumos de Impressão (Material Base)", resultados.custoMaterial);
    adicionarLinha("Processamento Energético (KWh)", resultados.custoEnergia);
    adicionarLinha("Depreciação de Ativos (Máquina/Hardware)", resultados.custoMaquina + (resultados.reservaManutencao || 0));
    adicionarLinha("Mão de Obra e Setup Técnico", resultados.custoMaoDeObra + resultados.custoSetup);
    if ((resultados.custoEmbalagem + resultados.custoFrete + resultados.custosExtras) > 0) {
        adicionarLinha("Logística e Gastos Adicionais", resultados.custoEmbalagem + resultados.custoFrete + resultados.custosExtras);
    }
    adicionarLinha("Encargos e Taxas Operacionais", resultados.valorImpostos + resultados.valorMarketplace);

    // --- 6. VALOR FINAL (SINCRONIZADO) ---
    const totalY = 220;
    doc.setFillColor(...cores.zinco950);
    doc.rect(10, totalY, 190, 40, 'F');
    doc.setTextColor(...cores.ceu500);
    doc.setFontSize(7);
    doc.text("VALOR TOTAL DO INVESTIMENTO", 18, totalY + 12);
    doc.setTextColor(...cores.branco);
    doc.setFontSize(34);
    doc.setFont("courier", "bold");
    // Usa o preço final manual se existir, senão usa o calculado
    const precoExibir = precoFinalExibido || resultados.precoComDesconto || resultados.precoSugerido;
    doc.text(formatCurrency(precoExibir), 18, totalY + 30);

    // --- 7. RODAPÉ ---
    doc.setFontSize(6);
    doc.setTextColor(...cores.zinco500);
    const anoAtual = new Date().getFullYear();
    doc.text(`PRINTLOG // ${anoAtual}`, 10, 285);
    doc.text("Relatório gerado automaticamente. Valores sujeitos a alteração.", 10, 290);

    // Abre o PDF em nova aba do navegador
    window.open(doc.output('bloburl'), '_blank');
};
