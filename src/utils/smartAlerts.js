import { differenceInDays, subDays, parseISO } from 'date-fns';

/**
 * Predicts when a material will run out based on consumption rate
 */
export const predictMaterialRunout = (filament, projects) => {
    if (!filament || !projects) return null;

    const currentStock = Number(filament.peso_atual_grama || 0);
    const totalWeight = Number(filament.peso_total_grama || 1000);

    if (currentStock <= 0) {
        return {
            daysRemaining: 0,
            severity: 'critical',
            message: `${filament.marca} ${filament.nome} esgotado`,
            action: 'BUY_NOW'
        };
    }

    // Calculate consumption rate (last 30 days)
    const thirtyDaysAgo = subDays(new Date(), 30);
    const recentProjects = projects.filter(p => {
        if (!p.createdAt) return false;
        const projectDate = parseISO(p.createdAt);
        return projectDate >= thirtyDaysAgo && p.data?.filamento_id === filament.id;
    });

    if (recentProjects.length === 0) {
        // No  recent usage - just check current stock percentage
        const stockPercent = (currentStock / totalWeight) * 100;
        if (stockPercent < 20) {
            return {
                daysRemaining: null,
                severity: 'warning',
                message: `${filament.marca} ${filament.nome} baixo (${stockPercent.toFixed(0)}%)`,
                action: 'BUY_SOON'
            };
        }
        return null;
    }

    // Calculate total consumption
    const totalConsumed = recentProjects.reduce((sum, p) => {
        return sum + Number(p.data?.peso_filamento || 0);
    }, 0);

    const dailyConsumption = totalConsumed / 30; // grams per day

    if (dailyConsumption === 0) return null;

    const daysRemaining = Math.floor(currentStock / dailyConsumption);

    if (daysRemaining < 3) {
        return {
            daysRemaining,
            severity: 'critical',
            message: `${filament.marca} ${filament.nome} acaba em ${daysRemaining} dias`,
            action: 'BUY_NOW',
            consumption: dailyConsumption
        };
    }

    if (daysRemaining < 7) {
        return {
            daysRemaining,
            severity: 'warning',
            message: `${filament.marca} ${filament.nome} acaba em ${daysRemaining} dias`,
            action: 'BUY_SOON',
            consumption: dailyConsumption
        };
    }

    return null; // Stock is fine
};

/**
 * Suggests maintenance based on printer usage
 */
export const suggestMaintenance = (printer) => {
    if (!printer) return null;

    const totalHours = Number(printer.horas_totais || 0);
    const lastMaintenance = printer.ultima_manutencao
        ? parseISO(printer.ultima_manutencao)
        : null;

    // Maintenance intervals (hours)
    const intervals = {
        minor: 100,  // Lubrication, cleaning
        major: 500,  // Belt replacement, etc
        critical: 1000 // Full overhaul
    };

    const hoursSinceMaintenance = lastMaintenance
        ? totalHours - Number(printer.horas_na_manutencao || 0)
        : totalHours;

    if (hoursSinceMaintenance >= intervals.critical) {
        return {
            type: 'critical',
            severity: 'critical',
            message: `${printer.nome} precisa de manutenção completa (${totalHours}h)`,
            action: 'SCHEDULE_NOW',
            hours: totalHours
        };
    }

    if (hoursSinceMaintenance >= intervals.major) {
        return {
            type: 'major',
            severity: 'warning',
            message: `${printer.nome} precisa de manutenção (${totalHours}h)`,
            action: 'SCHEDULE_SOON',
            hours: totalHours
        };
    }

    if (hoursSinceMaintenance >= intervals.minor) {
        return {
            type: 'minor',
            severity: 'info',
            message: `${printer.nome} pode precisar de limpeza (${totalHours}h)`,
            action: 'CONSIDER',
            hours: totalHours
        };
    }

    return null;
};

/**
 * Detects cost anomalies in projects
 */
export const detectCostAnomaly = (project, projectHistory) => {
    if (!project || !projectHistory || projectHistory.length < 5) return null;

    const currentCost = Number(project.data?.custo_total || 0);

    // Calculate average cost of similar projects (last 30)
    const recentProjects = projectHistory
        .filter(p => p.id !== project.id)
        .slice(-30);

    if (recentProjects.length < 5) return null;

    const avgCost = recentProjects.reduce((sum, p) => {
        return sum + Number(p.data?.custo_total || 0);
    }, 0) / recentProjects.length;

    const deviation = ((currentCost - avgCost) / avgCost) * 100;

    if (deviation > 50) {
        return {
            severity: 'warning',
            message: `Projeto "${project.label}" com custo ${deviation.toFixed(0)}% acima da média`,
            action: 'REVIEW',
            currentCost,
            avgCost,
            deviation
        };
    }

    if (deviation > 100) {
        return {
            severity: 'critical',
            message: `Projeto "${project.label}" com custo MUITO alto (${deviation.toFixed(0)}% acima)`,
            action: 'REVIEW_URGENT',
            currentCost,
            avgCost,
            deviation
        };
    }

    return null;
};

/**
 * Generate all smart alerts for dashboard
 */
export const generateSmartAlerts = (filaments, printers, projects) => {
    const alerts = [];

    // Material predictions
    filaments?.forEach(filament => {
        const prediction = predictMaterialRunout(filament, projects);
        if (prediction) {
            alerts.push({
                id: `material-${filament.id}`,
                type: 'material',
                ...prediction,
                data: filament
            });
        }
    });

    // Maintenance suggestions
    printers?.forEach(printer => {
        const suggestion = suggestMaintenance(printer);
        if (suggestion) {
            alerts.push({
                id: `maintenance-${printer.id}`,
                type: 'maintenance',
                ...suggestion,
                data: printer
            });
        }
    });

    // Cost anomalies (check recent projects)
    const recentProjects = projects?.slice(-10) || [];
    recentProjects.forEach(project => {
        const anomaly = detectCostAnomaly(project, projects);
        if (anomaly) {
            alerts.push({
                id: `cost-${project.id}`,
                type: 'cost',
                ...anomaly,
                data: project
            });
        }
    });

    // Sort by severity
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
};
