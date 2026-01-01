// src/utils/pdfGenerator.js
import jsPDF from "jspdf";
import { formatCurrency } from "./numbers";

/**
 * geraPDFProfissional - Gera um relatório técnico detalhado em PDF.
 * Corrigido para suportar a estrutura aninhada de dados e multi-materiais.
 */
export const generateProfessionalPDF = (resultados, entradas) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    const cores = {
        zinco950: [9, 9, 11],    // Fundo ultra-escuro
        zinco900: [24, 24, 27],  // Cards
        zinco800: [39, 39, 42],  // Bordas
        zinco500: [113, 113, 122], // Texto secundário
        ceu500: [14, 165, 233],   // Destaques Sky
        branco: [255, 255, 255]
    };

    // --- 1. FUNDO TÉCNICO (Grid Milimétrico) ---
    doc.setDrawColor(240, 240, 240);
    doc.setLineWidth(0.1);
    for (let i = 0; i < 210; i += 5) doc.line(i, 0, i, 297);
    for (let i = 0; i < 297; i += 5) doc.line(0, i, 210, i);

    doc.setDrawColor(...cores.zinco800);
    doc.setLineWidth(0.5);
    // Marcadores de Canto
    doc.line(5, 5, 15, 5); doc.line(5, 5, 5, 15);
    doc.line(195, 292, 205, 292); doc.line(205, 282, 205, 292);

    // --- 2. CABEÇALHO INDUSTRIAL ---
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
    doc.text("SISTEMA_MAKER_V5.0 // ESTABILIDADE: OTIMIZADA", 15, 28);

    // Selo de Qualidade
    doc.setDrawColor(...cores.ceu500);
    doc.setLineWidth(0.5);
    doc.circle(180, 18, 12);
    doc.setFontSize(5);
    doc.text("QUALIDADE GARANTIDA", 180, 15, { align: 'center' });
    doc.setFontSize(8);
    doc.text("APROVADO", 180, 20, { align: 'center' });
    doc.setFontSize(4);
    doc.text("MAKER LOG SYSTEMS", 180, 23, { align: 'center' });

    // --- 3. EXTRAÇÃO DE DADOS (LÓGICA CORRIGIDA) ---
    const material = entradas.material || {};
    const tempo = entradas.tempo || {};
    const config = entradas.config || {};

    const pesoTotal = material.slots?.length > 0
        ? material.slots.reduce((acc, s) => acc + (Number(s.weight) || 0), 0)
        : (Number(material.pesoModelo || entradas.pesoModelo) || 0);

    const horasImp = Number(tempo.impressaoHoras || entradas.tempoImpressaoHoras) || 0;
    const minutosImp = Number(tempo.impressaoMinutos || entradas.tempoImpressaoMinutos) || 0;
    
    // Converte kW para Watts para o relatório
    const consumoKw = Number(config.consumoKw || entradas.consumoImpressoraKw) || 0;
    const wattsFormatado = consumoKw < 2 ? Math.round(consumoKw * 1000) : consumoKw;

    // --- 4. CARD DO PROJETO ---
    doc.setFillColor(...cores.zinco900);
    doc.roundedRect(12, 47, 186, 18, 1, 1, 'F'); 
    doc.setFillColor(...cores.branco);
    doc.setDrawColor(...cores.zinco800);
    doc.roundedRect(10, 45, 190, 20, 1, 1, 'FD');

    doc.setTextColor(...cores.zinco500);
    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    doc.text("IDENTIFICAÇÃO DO PROJETO // DATABASE_ENTRY", 15, 51);
    doc.setTextColor(...cores.zinco950);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bolditalic");
    doc.text(entradas.nomeProjeto?.toUpperCase() || "PROJETO_SEM_TITULO", 15, 60);

    // --- 5. MÓDULOS DE ESPECIFICAÇÃO ---
    const desenharModulo = (x, y, titulo, valor, passo) => {
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(...cores.zinco800);
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

    desenharModulo(10, 75, "MASSA_MATÉRIA_PRIMA", `${pesoTotal}g`, "01");
    desenharModulo(75, 75, "TEMPO_ESTIMADO_FAB", `${horasImp}h ${minutosImp}m`, "02");
    desenharModulo(140, 75, "POTÊNCIA_CONSUMIDA", `${wattsFormatado}W`, "03");

    // --- 6. COMPOSIÇÃO FINANCEIRA ---
    doc.setTextColor(...cores.zinco950);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("02. DETALHAMENTO DE CUSTOS E PRODUÇÃO", 10, 115);

    let eixoY = 125;
    const adicionarLinha = (label, valor) => {
        const num = Number(valor) || 0;
        if(num <= 0) return;
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

    adicionarLinha("Insumos Base (Filamentos / Resinas / Aditivos)", resultados.custoMaterial);
    adicionarLinha("Set-up de Hardware e Fatiamento Técnico", resultados.custoSetup);
    adicionarLinha("Mão de Obra Técnica e Pós-Processamento", resultados.custoMaoDeObra);
    adicionarLinha("Custos Operacionais (Depreciação / Energia)", (Number(resultados.custoEnergia) || 0) + (Number(resultados.custoMaquina) || 0));
    adicionarLinha("Logística, Proteção e Embalagem", (Number(resultados.custoEmbalagem) || 0) + (Number(resultados.custoFrete) || 0));
    adicionarLinha("Fundo de Reserva de Risco", resultados.valorRisco);
    adicionarLinha("Taxas Administrativas e Tributos", (Number(resultados.valorImpostos) || 0) + (Number(resultados.valorMarketplace) || 0));

    // --- 7. VALOR FINAL (Destaque) ---
    const totalY = 215;
    doc.setFillColor(...cores.zinco950);
    doc.rect(10, totalY, 190, 40, 'F');
    
    doc.setTextColor(...cores.ceu500);
    doc.setFontSize(7);
    doc.text("INVESTIMENTO_TOTAL_REQUERIDO", 18, totalY + 12);
    
    doc.setTextColor(...cores.branco);
    doc.setFontSize(32);
    doc.setFont("courier", "bold");
    const valorFinal = formatCurrency(resultados.precoComDesconto || resultados.precoSugerido || 0);
    doc.text(valorFinal, 18, totalY + 30);

    // Efeito Visual: Código de Barras Decorativo
    doc.setDrawColor(...cores.zinco800);
    for(let i=0; i<30; i+=2) {
        doc.line(160 + i, totalY + 15, 160 + i, totalY + 25);
    }

    // --- 8. RODAPÉ TÉCNICO ---
    doc.setFontSize(5.5);
    doc.setTextColor(...cores.zinco500);
    doc.text("Este documento é uma síntese técnica de custos. Validade dos valores: 07 dias corridos.", 10, 280);
    doc.setFont("helvetica", "bold");
    doc.text("MAKER LOG - SOLUÇÕES EM MANUFATURA ADITIVA // 2025", 10, 285);

    // --- 9. FINALIZAÇÃO ---
    window.open(doc.output('bloburl'), '_blank');
};