import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { FileDown, Loader2 } from 'lucide-react';
import { formatCurrency } from '../../../utils/numbers';
import { PDF_COLORS, drawPDFHeader } from '../../../utils/pdfUtils';

export default function BotaoGerarPDF({ projeto, cliente }) {
    const { user } = useUser();
    const [loading, setLoading] = useState(false);

    // Se não tiver projeto ou dados, não renderiza
    if (!projeto) return null;

    const gerarPDF = async () => {
        setLoading(true);
        try {
            const { default: jsPDF } = await import("jspdf");
            const { default: autoTable } = await import("jspdf-autotable");

            const doc = new jsPDF('p', 'mm', 'a4');
            const data = projeto.data || {};
            const ent = data.entradas || {};
            const res = data.resultados || {};
            const idProjeto = String(projeto.id).slice(0, 8).toUpperCase();

            // 1. Cabeçalho
            drawPDFHeader(doc, "ORÇAMENTO", `#${idProjeto}`, user);

            let currentY = 50;
            const cores = PDF_COLORS;

            // 2. Info Grid (Cliente e Fornecedor)
            const leftX = 15;
            const rightX = 110;

            // Coluna Esquerda: Cliente
            doc.setFontSize(10);
            doc.setTextColor(...cores.zinco950);
            doc.setFont("helvetica", "bold");
            doc.text("CLIENTE", leftX, currentY);

            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...cores.zinco800);
            currentY += 5;

            const nomeCliente = cliente?.nome || ent.clienteNome || "Cliente Final";
            doc.text(nomeCliente.toUpperCase(), leftX, currentY);
            currentY += 4;

            if (cliente?.empresa) {
                doc.setFontSize(8);
                doc.setTextColor(...cores.zinco500);
                doc.text(cliente.empresa, leftX, currentY);
                currentY += 4;
            }

            doc.setFontSize(8);
            doc.setTextColor(...cores.zinco500);
            currentY += 2;
            doc.text(cliente?.email || "-", leftX, currentY);
            currentY += 4;
            doc.text(cliente?.telefone || "-", leftX, currentY);

            // Reset Y para coluna direita
            let rightY = 50;

            // Coluna Direita: Fornecedor
            doc.setFontSize(10);
            doc.setTextColor(...cores.zinco950);
            doc.setFont("helvetica", "bold");
            doc.text("FORNECEDOR", rightX, rightY);

            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...cores.zinco800);
            rightY += 5;

            doc.text((user?.fullName || "Oficina de Impressão 3D").toUpperCase(), rightX, rightY);
            rightY += 4;

            doc.setFontSize(8);
            doc.setTextColor(...cores.zinco500);
            rightY += 2;
            doc.text(user?.primaryEmailAddress?.emailAddress || "-", rightX, rightY);

            currentY = Math.max(currentY, rightY) + 15;

            // 3. Tabela de Itens
            const precoBase = res.precoSugerido || 0;
            const desconto = res.precoSugerido - (res.precoComDesconto || 0);
            const final = res.precoComDesconto || 0;
            const qtd = Number(ent.qtdPecas) || 1;
            const unitario = final / qtd;

            // Detalhes técnicos para a descrição
            const material = ent.material?.material || "PLA";
            const peso = Math.round(Number(ent.material?.pesoModelo) || 0);
            const horas = Math.round(Number(ent.tempo?.impressaoHoras) || 0);
            const minutos = Number(ent.tempo?.impressaoMinutos) || 0;
            const detalhes = `Impressão 3D • ${material} • ${peso}g • ${horas}h${minutos}m`;

            autoTable(doc, {
                startY: currentY,
                head: [['DESCRIÇÃO', 'QTD', 'UNITÁRIO', 'TOTAL']],
                body: [
                    [
                        {
                            content: (ent.nomeProjeto || "Projeto Personalizado") + "\n" + detalhes,
                            styles: { fontStyle: 'bold' }
                        },
                        qtd,
                        formatCurrency(unitario),
                        formatCurrency(final)
                    ]
                ],
                headStyles: {
                    fillColor: cores.zinco950,
                    textColor: cores.branco,
                    fontStyle: 'bold'
                },
                columnStyles: {
                    0: { cellWidth: 'auto' },
                    1: { cellWidth: 20, halign: 'center' },
                    2: { cellWidth: 35, halign: 'right' },
                    3: { cellWidth: 35, halign: 'right' }
                },
                styles: {
                    font: 'helvetica',
                    fontSize: 9,
                    cellPadding: 4,
                    overflow: 'linebreak'
                },
                theme: 'striped'
            });

            currentY = doc.lastAutoTable.finalY + 10;

            // 4. Totais
            const totalsX = 130;
            const valX = 195;

            doc.setFontSize(9);

            // Subtotal
            doc.setTextColor(...cores.zinco500);
            doc.text("Subtotal", totalsX, currentY);
            doc.setTextColor(...cores.zinco900);
            doc.text(formatCurrency(precoBase), valX, currentY, { align: 'right' });
            currentY += 5;

            // Desconto (se houver)
            if (desconto > 0.01) {
                doc.setTextColor(...cores.zinco500);
                doc.text("Desconto", totalsX, currentY);
                doc.setTextColor(239, 68, 68); // Rose/Red
                doc.text(`- ${formatCurrency(desconto)}`, valX, currentY, { align: 'right' });
                currentY += 5;
            }

            // Linha separadora
            doc.setDrawColor(...cores.zinco200 || [228, 228, 231]);
            doc.line(totalsX, currentY, 195, currentY);
            currentY += 6;

            // Total Final
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...cores.zinco950);
            doc.text("TOTAL", totalsX, currentY);
            doc.text(formatCurrency(final), valX, currentY, { align: 'right' });

            // 5. Rodapé
            const footerY = 280;
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...cores.zinco400 || [161, 161, 170]);
            doc.text("Este orçamento é válido por 7 dias. Obrigado pela preferência!", 105, footerY, { align: 'center' });

            // Salvar
            const fileName = `Orcamento_${data.label || 'PrintLog'}_${new Date().toISOString().slice(0, 10)}.pdf`;
            doc.save(fileName);

        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            alert("Não foi possível gerar o PDF. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={gerarPDF}
            disabled={loading}
            className="p-2 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
            title="Baixar Orçamento (PDF)"
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
        </button>
    );
}
