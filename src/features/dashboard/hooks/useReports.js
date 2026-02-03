import { useQuery } from '@tanstack/react-query';
import api from '../../../utils/api';

const fetcher = url => api.get(url).then(res => res.data);

export function useReports() {
    const { data: dashboard, isError: dashboardError, isLoading: dashboardLoading } = useQuery({
        queryKey: ['reports', 'dashboard'],
        queryFn: () => fetcher('/reports?tipo=dashboard')
    });

    const { data: costs, isError: costsError, isLoading: costsLoading } = useQuery({
        queryKey: ['reports', 'costs'],
        queryFn: () => fetcher('/reports?tipo=custos-projetos')
    });

    const { data: lowStock, isError: lowStockError, isLoading: lowStockLoading } = useQuery({
        queryKey: ['reports', 'lowStock'],
        queryFn: () => fetcher('/reports?tipo=estoque-baixo')
    });

    const { data: printerUsage, isError: printerUsageError, isLoading: printerUsageLoading } = useQuery({
        queryKey: ['reports', 'printerUsage'],
        queryFn: () => fetcher('/reports?tipo=uso-impressoras')
    });

    return {
        dashboard: dashboard || [],
        costs: costs || [],
        lowStock: lowStock || [],
        printerUsage: printerUsage || [],
        loading: dashboardLoading || costsLoading || lowStockLoading || printerUsageLoading,
        isError: dashboardError || costsError || lowStockError || printerUsageError
    };
}
