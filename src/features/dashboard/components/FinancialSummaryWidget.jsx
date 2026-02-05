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
                <div className="flex flex-col h-full justify-between gap-6">
                    {/* Visualização de Lucro Principal (Hero) */}
                    <div className={`relative overflow-hidden rounded-2xl p-6 border transition-all duration-500 group/hero
                        ${isPositive
                            ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20 hover:border-emerald-500/30'
                            : 'bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border-rose-500/20 hover:border-rose-500/30'
                        }
                    `}>
                        <div className="relative z-10 flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    Lucro Líquido
                                </span>
                                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border backdrop-blur-sm
                                    ${isPositive
                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/20'
                                        : 'bg-rose-500/20 text-rose-300 border-rose-500/20'
                                    }
                                `}>
                                    {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    {Math.abs(financial.margin).toFixed(1)}%
                                </div>
                            </div>

                            <p className="text-3xl xl:text-4xl font-mono font-black tracking-tighter text-white mt-2">
                                {formatCurrency(financial.profit)}
                            </p>
                        </div>

                        {/* Background Decorativo */}
                        <div className={`absolute -right-6 -bottom-6 opacity-[0.07] transform rotate-12 group-hover/hero:scale-110 group-hover/hero:rotate-6 transition-all duration-700 ease-out ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isPositive ? <TrendingUp size={120} /> : <TrendingDown size={120} />}
                        </div>
                    </div>

                    {/* Métricas Secundárias */}
                    <div className="grid grid-cols-2 gap-4 px-2">
                        <div className="space-y-1 group/item">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2 group-hover/item:text-zinc-400 transition-colors">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_currentColor] opacity-60" />
                                Receita
                            </span>
                            <p className="text-lg font-mono font-bold text-zinc-300 group-hover/item:text-emerald-300 transition-colors">
                                {formatCurrency(financial.revenue)}
                            </p>
                        </div>
                        <div className="space-y-1 group/item">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2 group-hover/item:text-zinc-400 transition-colors">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_currentColor] opacity-60" />
                                Custos
                            </span>
                            <p className="text-lg font-mono font-bold text-zinc-300 group-hover/item:text-rose-300 transition-colors">
                                {formatCurrency(financial.costs)}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </DashboardCard>
    );
}
