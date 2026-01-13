import React, { useMemo } from 'react';
import { Package, TrendingUp, TrendingDown, CircleDashed } from 'lucide-react';
import { formatCurrency, formatDecimal } from '../../../utils/numbers';
import DashboardCard from './DashboardCard';
import { useFilamentStore } from '../../filamentos/logic/filaments';

export default function ResourceSummaryWidget({ className = '' }) {
    const { filaments } = useFilamentStore();

    const stats = useMemo(() => {
        if (!filaments || filaments.length === 0) return null;

        let totalValue = 0;
        let totalWeight = 0; // in kg
        let materialCounts = {};

        filaments.forEach(f => {
            const price = Number(f.preco) || 0;
            const weight = Number(f.peso) || 1000; // default 1kg if missing
            const remaining = f.peso_restante !== undefined ? Number(f.peso_restante) : weight;

            // Value calculation based on remaining weight ratio
            const valueRatio = remaining / weight;
            totalValue += price * valueRatio;

            totalWeight += remaining / 1000; // convert g to kg

            // Material distribution
            const type = f.material || 'Outros';
            materialCounts[type] = (materialCounts[type] || 0) + 1;
        });

        // Get top 3 materials
        const topMaterials = Object.entries(materialCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([name, count]) => ({
                name,
                count,
                percentage: (count / filaments.length) * 100
            }));

        return {
            totalValue,
            totalWeight,
            count: filaments.length,
            topMaterials
        };
    }, [filaments]);

    if (!stats) return null;

    return (
        <DashboardCard
            title="Recursos"
            subtitle="Inventário e Materiais"
            icon={Package}
            accentColor="emerald"
            className={className}
        >
            <div className="flex flex-col h-full justify-between gap-4">

                {/* Top Statistics Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Valor Total</span>
                        <p className="text-2xl font-mono font-black text-white tracking-tight">
                            {formatCurrency(stats.totalValue)}
                        </p>
                    </div>
                    <div className="space-y-1 text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Peso (Estimado)</span>
                        <p className="text-2xl font-mono font-black text-emerald-400 tracking-tight">
                            {formatDecimal(stats.totalWeight, 1)} <span className="text-sm text-zinc-600">kg</span>
                        </p>
                    </div>
                </div>

                {/* Distribution Bar */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-400">Distribuição</span>
                        <span className="text-[10px] font-mono font-bold text-zinc-600">{stats.count} Rolos</span>
                    </div>

                    <div className="flex h-2 w-full rounded-full overflow-hidden bg-zinc-800/50">
                        {stats.topMaterials.map((mat, i) => (
                            <div
                                key={mat.name}
                                style={{ width: `${mat.percentage}%` }}
                                className={`h-full ${i === 0 ? 'bg-emerald-500' :
                                    i === 1 ? 'bg-emerald-500/60' :
                                        'bg-emerald-500/30'
                                    }`}
                            />
                        ))}
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-medium text-zinc-500">
                        {stats.topMaterials.map((mat, i) => (
                            <div key={mat.name} className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-emerald-500' :
                                    i === 1 ? 'bg-emerald-500/60' :
                                        'bg-emerald-500/30'
                                    }`} />
                                <span>{mat.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </DashboardCard>
    );
}
