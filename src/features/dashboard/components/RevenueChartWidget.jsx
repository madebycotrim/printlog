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


    const trend = chartData.length > 1
        ? ((chartData[chartData.length - 1].receita / chartData[0].receita - 1) * 100).toFixed(1)
        : 0;

    const currentTotal = chartData.reduce((acc, curr) => acc + curr.receita, 0);

    return (
        <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 h-full flex flex-col hover:border-zinc-700 transition-all group/chart">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Evolução Financeira</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-mono font-black text-zinc-100 tracking-tight">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentTotal)}
                        </span>
                        <div className={`flex items-center gap-0.5 text-[10px] font-bold ${trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            {trend}%
                        </div>
                    </div>
                </div>

                {/* Timeframe Pill */}
                <div className="px-2 py-1 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-[10px] font-medium text-zinc-400">
                    Últimos 30 dias
                </div>
            </div>

            <div className="flex-1 min-h-[200px] relative">
                {chartData.length > 0 ? (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent opacity-0 group-hover/chart:opacity-100 transition-opacity duration-700" />
                        <RevenueLineChart data={chartData} />
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8 opacity-50">
                        <TrendingUp size={32} className="text-zinc-700 mb-2" />
                        <p className="text-xs text-zinc-500 font-medium">Sem dados para exibir</p>
                    </div>
                )}
            </div>
        </div>
    );
}
