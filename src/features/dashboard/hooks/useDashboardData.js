import { useMemo, useState, useEffect, useCallback } from 'react';
import api from '../../../utils/api';
import { useFilamentos } from '../../filamentos/logic/consultasFilamento';
import { usePrinters } from '../../impressoras/logic/consultasImpressora';
import { useSupplyStore } from '../../insumos/logic/supplies';
import { useReports } from './useReports';

/**
 * Hook customizado para agregar dados do dashboard
 * Combina informações de impressoras, filamentos, orçamentos e relatórios do servidor
 */
export function useDashboardData() {
    const { data: filaments = [], isLoading: filamentsLoading } = useFilamentos();
    const { data: printers = [], isLoading: printersLoading } = usePrinters();
    const { fetchSupplies, loading: suppliesLoading } = useSupplyStore();
    const [failureStats, setFailureStats] = useState({ totalWeight: 0, totalCost: 0 });

    // Consumir relatórios do servidor (Views)
    const { dashboard, costs, lowStock, printerUsage, loading: reportsLoading } = useReports();

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

    // Alertas do Servidor (View alertas_estoque_baixo)
    const serverAlerts = useMemo(() => {
        if (!Array.isArray(lowStock)) return [];
        return lowStock.map(item => ({
            id: item.id,
            type: item.tipo === 'filamento' ? 'filament' : 'supply',
            severity: item.percentual <= 10 ? 'critical' : 'warning',
            title: `${item.tipo === 'filamento' ? 'Filamento' : 'Insumo'} Baixo`,
            message: `${item.nome} - ${Math.round(item.percentual)}% restante (${item.atual} / ${item.minimo})`,
            item: item
        }));
    }, [lowStock]);

    // Alertas de impressoras (mantido client-side pois depende de status realtime da UI/Socket muitas vezes)
    const printerAlerts = useMemo(() => {
        if (!Array.isArray(printers)) return [];

        return printers
            .filter(p => p.status === 'maintenance' || p.status === 'error')
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
        return [...serverAlerts, ...printerAlerts].sort((a, b) => {
            if (a.severity === 'critical' && b.severity !== 'critical') return -1;
            if (a.severity !== 'critical' && b.severity === 'critical') return 1;
            return 0;
        });
    }, [serverAlerts, printerAlerts]);

    // Estatísticas financeiras de filamentos (calculado no cliente para manter reatividade imediata)
    const filamentFinancials = useMemo(() => {
        if (!Array.isArray(filaments)) return { totalValue: 0, totalWeight: 0 };

        let totalValue = 0;
        let totalWeight = 0;

        filaments.forEach(f => {
            const atual = Number(f.peso_atual) || 0;
            const preco = Number(f.preco) || 0;
            const total = Math.max(1, Number(f.peso_total) || 1000);

            totalWeight += atual;
            totalValue += (preco / total) * atual;
        });

        return {
            totalValue,
            totalWeight: totalWeight / 1000,
            materialCount: filaments.length
        };
    }, [filaments]);

    // Status de impressoras
    const printerStats = useMemo(() => {
        if (!Array.isArray(printers)) return { total: 0, active: 0, idle: 0, error: 0 };
        return {
            total: printers.length,
            active: printers.filter(p => p.status === 'printing').length,
            idle: printers.filter(p => p.status === 'idle').length,
            maintenance: printers.filter(p => p.status === 'maintenance').length,
            error: printers.filter(p => p.status === 'error').length
        };
    }, [printers]);

    return {
        alerts: allAlerts,
        filamentFinancials,
        printerStats,
        loading: filamentsLoading || printersLoading || suppliesLoading || reportsLoading,
        criticalAlertsCount: allAlerts.filter(a => a.severity === 'critical').length,
        failureStats,

        // Novos dados dos relatórios
        reports: {
            dashboard, // Consumo diário (para gráficos)
            costs,     // Custos por projeto
            printerUsage // Uso consolidado
        }
    };
}

