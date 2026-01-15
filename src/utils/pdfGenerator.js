import jsPDF from "jspdf";
import { formatCurrency } from "./numbers";

/**
 * GERADOR DE PDF PROFISSIONAL
 * Cria relatório técnico de fabricação com detalhamento de custos e especificações
 * @param {Object} resultados - Dados calculados pelo motor de precificação
 * @param {Object} entradas - Dados de entrada do formulário (projeto, material, tempo, custos)
 * @param {Number} precoFinalExibido - Preço final exibido (com arredondamentos manuais, se houver)
 * @returns {void} Abre PDF em nova aba do navegador
 */
export const gerarPDFProfissional = (resultados, entradas, precoFinalExibido) => {
    const doc = new jsPDF('p', 'mm', 'a4');

    const cores = {
        zinco950: [9, 9, 11],
        zinco900: [24, 24, 27],
        zinco800: [39, 39, 42],
        zinco500: [113, 113, 122],
        ceu500: [14, 165, 233],
        branco: [255, 255, 255]
    };

    // --- 1. FUNDO TÉCNICO ---
    doc.setDrawColor(240, 240, 240);
    doc.setLineWidth(0.1);
    for (let i = 0; i < 210; i += 5) doc.line(i, 0, i, 297);
    for (let i = 0; i < 297; i += 5) doc.line(0, i, 210, i);

    // --- 2. CABEÇALHO ---
    doc.setFillColor(...cores.zinco950);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setFillColor(...cores.ceu500);
    doc.rect(0, 35, 210, 0.8, 'F');

    doc.setTextColor(...cores.branco);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("RELATÓRIO", 15, 20);
    doc.setTextColor(...cores.ceu500);
    doc.text("TÉCNICO DE FABRICAÇÃO", 65, 20);

    doc.setFontSize(7);
    doc.setTextColor(...cores.zinco500);
    doc.setFont("courier", "bold");
    const dataEmissao = new Date().toLocaleDateString('pt-BR');
    doc.text(`GERADO EM: ${dataEmissao} // REF_ID: ${Math.random().toString(36).toUpperCase().substring(2, 10)}`, 15, 28);

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
    doc.text(`MAKER LOG - SISTEMAS DE GESTÃO PARA MANUFATURA ADITIVA // ${anoAtual}`, 10, 285);
    doc.text("Este relatório é uma estimativa técnica baseada nos parâmetros fornecidos.", 10, 290);

    // Abre o PDF em nova aba do navegador
    window.open(doc.output('bloburl'), '_blank');
};

// Alias de compatibilidade (deprecated - usar gerarPDFProfissional)
export const generateProfessionalPDF = gerarPDFProfissional;