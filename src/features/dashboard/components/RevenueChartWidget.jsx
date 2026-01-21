import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { RevenueLineChart } from '../../../components/charts/ChartComponents';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function RevenueChartWidget({ projects = [] }) {
    const chartData = useMemo(() => {
        // Group projects by date
        const grouped = projects.reduce((acc, project) => {
            if (!project.data || !project.createdAt) return acc;

            const date = format(parseISO(project.createdAt), 'dd/MM', { locale: ptBR });
            const receita = Number(project.data.preco_final || 0);
            const custo = Number(project.data.custo_total || 0);
            const lucro = receita - custo;

            if (!acc[date]) {
                acc[date] = { date, receita: 0, custo: 0, lucro: 0, count: 0 };
            }

            acc[date].receita += receita;
            acc[date].custo += custo;
            acc[date].lucro += lucro;
            acc[date].count += 1;

            return acc;
        }, {});

        return Object.values(grouped).sort((a, b) => {
            const [dayA, monthA] = a.date.split('/');
            const [dayB, monthB] = b.date.split('/');
            return monthA === monthB ? dayA - dayB : monthA - monthB;
        });
    }, [projects]);

    const totalRevenue = chartData.reduce((sum, d) => sum + d.receita, 0);
    const trend = chartData.length > 1
        ? ((chartData[chartData.length - 1].receita / chartData[0].receita - 1) * 100).toFixed(1)
        : 0;

    return (
        <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 h-full flex flex-col hover:border-zinc-700 transition-all">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Evolução Financeira</h3>
                <div className="flex items-center gap-2">
                    {trend >= 0 ? (
                        <>
                            <TrendingUp size={14} className="text-emerald-500" />
                            <span className="text-xs font-bold text-emerald-500">+{trend}%</span>
                        </>
                    ) : (
                        <>
                            <TrendingDown size={14} className="text-rose-500" />
                            <span className="text-xs font-bold text-rose-500">{trend}%</span>
                        </>
                    )}
                </div>
            </div>

            {chartData.length > 0 ? (
                <RevenueLineChart data={chartData} />
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <TrendingUp size={32} className="text-zinc-700 mb-2" />
                    <p className="text-xs text-zinc-500">Sem dados para exibir</p>
                    <p className="text-[10px] text-zinc-600 mt-1">Crie projetos para ver o gráfico</p>
                </div>
            )}
        </div>
    );
}
