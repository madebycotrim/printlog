import { useMemo, useState, useEffect, useCallback } from 'react'; // Added useState, useEffect, useCallback
import api from '../../../utils/api';
import { useFilamentStore } from '../../filamentos/logic/filaments';
import { usePrinterStore } from '../../impressoras/logic/printer';
import { useSupplyStore } from '../../insumos/logic/supplies';

/**
 * Hook customizado para agregar dados do dashboard
 * Combina informações de impressoras, filamentos e orçamentos
 */
export function useDashboardData() {
    const { filaments, loading: filamentsLoading } = useFilamentStore();
    const { printers, loading: printersLoading } = usePrinterStore();
    const { supplies, fetchSupplies, loading: suppliesLoading } = useSupplyStore();
    const [failureStats, setFailureStats] = useState({ totalWeight: 0, totalCost: 0 }); // New state

    // Ensure supplies are loaded
    useEffect(() => {
        fetchSupplies();
    }, [fetchSupplies]);

    // Fetch Failures
    const fetchFailures = useCallback(async () => {
        try {
            const res = await api.get('/failures');
            if (res.data?.stats) setFailureStats(res.data.stats);
        } catch (error) {
            console.error("Erro ao buscar falhas:", error);
        }
    }, []);

    useEffect(() => {
        fetchFailures();
    }, [fetchFailures]);

    // Alertas críticos de filamentos
    const filamentAlerts = useMemo(() => {
        if (!Array.isArray(filaments)) return [];

        return filaments
            .filter(f => {
                const atual = Number(f.peso_atual) || 0;
                const total = Math.max(1, Number(f.peso_total) || 1000);
                const percentual = (atual / total) * 100;
                return percentual <= 20 || atual < 150;
            })
            .map(f => ({
                id: f.id,
                type: 'filament',
                severity: 'critical',
                title: 'Filamento em estoque crítico',
                message: `${f.nome} ${f.material} - ${Math.round((Number(f.peso_atual) / Number(f.peso_total)) * 100)}% restante`,
                item: f
            }));
    }, [filaments]);

    // Alertas de impressoras
    const printerAlerts = useMemo(() => {
        if (!Array.isArray(printers)) return [];

        return printers
            .filter(p => {
                // Alertas para impressoras com problemas ou manutenção necessária
                return p.status === 'maintenance' || p.status === 'error';
            })
            .map(p => ({
                id: p.id,
                type: 'printer',
                severity: p.status === 'error' ? 'critical' : 'warning',
                title: p.status === 'error' ? 'Impressora com erro' : 'Manutenção necessária',
                message: `${p.nome || p.modelo} precisa de atenção`,
                item: p
            }));
    }, [printers]);

    // Combinar todos os alertas
    const allAlerts = useMemo(() => {
        return [...filamentAlerts, ...printerAlerts].sort((a, b) => {
            // Críticos primeiro
            if (a.severity === 'critical' && b.severity !== 'critical') return -1;
            if (a.severity !== 'critical' && b.severity === 'critical') return 1;
            return 0;
        });
    }, [filamentAlerts, printerAlerts]);

    // Estatísticas financeiras de filamentos
    const filamentFinancials = useMemo(() => {
        if (!Array.isArray(filaments)) return { totalValue: 0, totalWeight: 0 };

        let totalValue = 0;
        let totalWeight = 0;

        filaments.forEach(f => {
            const atual = Number(f.peso_atual) || 0;
            const total = Math.max(1, Number(f.peso_total) || 1000);
            const preco = Number(f.preco) || 0;

            totalWeight += atual;
            totalValue += (preco / total) * atual;
        });

        return {
            totalValue,
            totalWeight: totalWeight / 1000, // Converter para kg
            materialCount: filaments.length
        };
    }, [filaments]);

    // Status de impressoras
    const printerStats = useMemo(() => {
        if (!Array.isArray(printers)) return { total: 0, active: 0, idle: 0, error: 0 };

        const stats = {
            total: printers.length,
            active: 0,
            idle: 0,
            maintenance: 0,
            error: 0
        };

        printers.forEach(p => {
            if (p.status === 'printing') stats.active++;
            else if (p.status === 'idle') stats.idle++;
            else if (p.status === 'maintenance') stats.maintenance++;
            else if (p.status === 'error') stats.error++;
        });

        return stats;
    }, [printers]);

    return {
        alerts: allAlerts,
        filamentFinancials,
        printerStats,
        loading: filamentsLoading || printersLoading || suppliesLoading,
        criticalAlertsCount: allAlerts.filter(a => a.severity === 'critical').length,
        failureStats, // Expose failure stats
        fetchFailures // Explore fetch function
    };
};

