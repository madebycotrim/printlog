/**
 * AI-powered recommendation engine for dashboard suggestions
 */

export const generateRecommendations = (filaments, printers, projects) => {
    const recommendations = [];

    // 1. Material stock recommendations
    const lowStockMaterials = filaments?.filter(f => {
        const percent = (Number(f.peso_atual_grama || 0) / Number(f.peso_total_grama || 1)) * 100;
        return percent < 30;
    }) || [];

    lowStockMaterials.forEach(material => {
        const percent = (Number(material.peso_atual_grama || 0) / Number(material.peso_total_grama || 1)) * 100;
        recommendations.push({
            id: `buy-material-${material.id}`,
            priority: percent < 10 ? 'critical' : 'high',
            type: 'BUY_MATERIAL',
            title: `Comprar ${material.marca} ${material.nome}`,
            description: `Estoque em ${percent.toFixed(0)}%`,
            action: () => window.dispatchEvent(new CustomEvent('open-filament-modal', { detail: material })),
            actionLabel: 'Comprar',
            icon: 'Package',
            color: 'rose'
        });
    });

    // 2. Pending projects
    const pendingProjects = projects?.filter(p =>
        p.data?.status !== 'finalizado' && p.data?.status !== 'cancelado'
    ) || [];

    if (pendingProjects.length > 0) {
        recommendations.push({
            id: 'complete-projects',
            priority: pendingProjects.length > 5 ? 'high' : 'medium',
            type: 'COMPLETE_PROJECT',
            title: `Finalizar ${pendingProjects.length} projeto${pendingProjects.length > 1 ? 's' : ''}`,
            description: 'Projetos pendentes de conclusão',
            action: () => window.location.href = '/calculadora',
            actionLabel: 'Ver Projetos',
            icon: 'Calculator',
            color: 'sky'
        });
    }

    // 3. Printer maintenance
    const printersNeedingMaintenance = printers?.filter(p => {
        const hours = Number(p.horas_totais || 0);
        return hours > 100 && hours % 100 < 10; // Around maintenance interval
    }) || [];

    printersNeedingMaintenance.forEach(printer => {
        recommendations.push({
            id: `maintenance-${printer.id}`,
            priority: 'medium',
            type: 'MAINTENANCE',
            title: `Manutenção em ${printer.nome}`,
            description: `${printer.horas_totais}h de uso`,
            action: () => window.dispatchEvent(new CustomEvent('open-printer-modal', { detail: printer })),
            actionLabel: 'Agendar',
            icon: 'Printer',
            color: 'emerald'
        });
    });

    // 4. Optimization suggestions
    if (projects && projects.length > 10) {
        const recentProjects = projects.slice(-10);
        const avgProfit = recentProjects.reduce((sum, p) => {
            const revenue = Number(p.resultados?.precoFinal || 0);
            const cost = Number(p.data?.custo_total || 0);
            return sum + (revenue - cost);
        }, 0) / recentProjects.length;

        const lowProfitProjects = recentProjects.filter(p => {
            const revenue = Number(p.resultados?.precoFinal || 0);
            const cost = Number(p.data?.custo_total || 0);
            const profit = revenue - cost;
            return profit < avgProfit * 0.5;
        });

        if (lowProfitProjects.length > 3) {
            recommendations.push({
                id: 'optimize-costs',
                priority: 'medium',
                type: 'OPTIMIZE',
                title: 'Otimizar custos dos projetos',
                description: `${lowProfitProjects.length} projetos com lucro baixo`,
                action: () => window.location.href = '/dashboard',
                actionLabel: 'Analisar',
                icon: 'TrendingUp',
                color: 'amber'
            });
        }
    }

    // 5. First-time user tips
    if (projects?.length === 0) {
        recommendations.push({
            id: 'create-first-project',
            priority: 'high',
            type: 'TIP',
            title: 'Criar seu primeiro orçamento',
            description: 'Comece calculando o preço de uma impressão',
            action: () => window.location.href = '/calculadora',
            actionLabel: 'Começar',
            icon: 'Zap',
            color: 'violet'
        });
    }

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return recommendations
        .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
        .slice(0, 5); // Top 5 recommendations
};
