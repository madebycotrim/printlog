import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatarMoeda } from './numbers';

export const exportDashboardToPDF = (data) => {
    const { projects, printers, filaments, stats } = data;
    const doc = new jsPDF();

    // Título
    doc.setFontSize(20);
    doc.setTextColor(14, 165, 233); // Sky blue
    doc.text('PrintLog - Dashboard', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}`, 14, 28);

    // KPIs
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Resumo Financeiro', 14, 40);

    doc.autoTable({
        startY: 45,
        head: [['Métrica', 'Valor']],
        body: [
            ['Receita Total', formatarMoeda(stats?.receitaTotal || 0)],
            ['Custos Totais', formatarMoeda(stats?.custoTotal || 0)],
            ['Lucro Líquido', formatarMoeda(stats?.lucroTotal || 0)],
        ],
        theme: 'grid',
        headStyles: { fillColor: [14, 165, 233] },
        styles: { fontSize: 10 }
    });

    // Projetos Recentes
    if (projects && projects.length > 0) {
        const yPos = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.text('Projetos Recentes', 14, yPos);

        doc.autoTable({
            startY: yPos + 5,
            head: [['ID', 'Nome', 'Data', 'Valor']],
            body: projects.slice(0, 10).map(p => [
                `#${p.id}`,
                p.label || 'Sem nome',
                format(new Date(p.created_at), 'dd/MM/yyyy'),
                formatarMoeda(p.resultados?.precoFinal || 0)
            ]),
            theme: 'striped',
            headStyles: { fillColor: [14, 165, 233] },
            styles: { fontSize: 9 }
        });
    }

    // Impressoras
    if (printers && printers.length > 0) {
        const yPos = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.text('Impressoras', 14, yPos);

        doc.autoTable({
            startY: yPos + 5,
            head: [['Nome', 'Marca/Modelo', 'Status', 'Horas']],
            body: printers.map(p => [
                p.nome,
                `${p.marca} ${p.modelo}`,
                p.status || 'idle',
                `${p.horas_totais || 0}h`
            ]),
            theme: 'striped',
            headStyles: { fillColor: [16, 185, 129] },
            styles: { fontSize: 9 }
        });
    }

    // Save
    doc.save(`dashboard-printlog-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`);
};

export const exportToExcel = (data) => {
    // Simple CSV export (Excel compatible)
    const { projects } = data;

    if (!projects || projects.length === 0) {
        alert('Nenhum dado para exportar');
        return;
    }

    const headers = ['ID', 'Nome', 'Data', 'Receita', 'Custo', 'Lucro'];
    const rows = projects.map(p => [
        p.id,
        p.label || 'Sem nome',
        format(new Date(p.created_at), 'dd/MM/yyyy'),
        p.resultados?.precoFinal || 0,
        p.data?.custo_total || 0,
        (p.resultados?.precoFinal || 0) - (p.data?.custo_total || 0)
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `projetos-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
};
