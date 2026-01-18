import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../../utils/numbers';
import DashboardCard from './DashboardCard';


/**
 * Widget de Resumo Financeiro Renovado
 */
export default function FinancialSummaryWidget({ projects = [], className = '' }) {
    const financial = useMemo(() => {
        if (!Array.isArray(projects) || projects.length === 0) {
            return { revenue: 0, costs: 0, profit: 0, margin: 0, projectCount: 0 };
        }

        let totalRevenue = 0;
        let totalCosts = 0;

        projects.forEach(project => {
            const data = project.data || {};
            const results = data.resultados || {};
            // Receita
            totalRevenue += Number(results.precoComDesconto || results.precoSugerido || 0);
            // Custos
            totalCosts += Number(results.custoTotalProducao || 0);
        });

        const profit = totalRevenue - totalCosts;
        const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

        return {
            revenue: totalRevenue,
            costs: totalCosts,
            profit,
            margin,
            projectCount: projects.length
        };
    }, [projects]);

    const isPositive = financial.profit >= 0;
    const accentColor = isPositive ? 'emerald' : 'rose';

    return (
        <DashboardCard
            title="Resumo Financeiro"
            subtitle={`${financial.projectCount} projetos totais`}
            icon={DollarSign}
            accentColor={accentColor}
            className={className}
        >
            {financial.projectCount === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 opacity-40">
                    <AlertCircle size={32} strokeWidth={1.5} className="mb-2 text-zinc-500" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Sem dados financeiros</p>
                </div>
            ) : (
                <div className="flex flex-col h-full justify-between gap-4">
                    {/* Métricas Principais */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                                Receita
                            </span>
                            <p className="text-xl xl:text-2xl font-mono font-black text-emerald-400 tracking-tight">
                                {formatCurrency(financial.revenue)}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500/50" />
                                Custos
                            </span>
                            <p className="text-xl xl:text-2xl font-mono font-black text-rose-400 tracking-tight">
                                {formatCurrency(financial.costs)}
                            </p>
                        </div>
                    </div>

                    {/* Destaque de Lucro */}
                    <div className={`mt-auto p-5 rounded-2xl border ${isPositive ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-rose-500/5 border-rose-500/10'} relative overflow-hidden group/profit`}>
                        <div className="relative z-10 flex justify-between items-end">
                            <div>
                                <span className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    Lucro Líquido
                                </span>
                                <p className={`text-3xl font-mono font-black tracking-tighter ${isPositive ? 'text-white' : 'text-rose-200'}`}>
                                    {formatCurrency(financial.profit)}
                                </p>
                            </div>

                            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${isPositive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                                {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {Math.abs(financial.margin).toFixed(1)}%
                            </div>
                        </div>

                        {/* Background Decorativo */}
                        <div className={`absolute -right-4 -bottom-4 opacity-10 transform rotate-12 group-hover/profit:scale-110 transition-transform duration-500 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {isPositive ? <TrendingUp size={80} /> : <TrendingDown size={80} />}
                        </div>
                    </div>
                </div>
            )}
        </DashboardCard>
    );
}
