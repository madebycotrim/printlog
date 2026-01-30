import React, { useMemo } from 'react';
import { TrendingUp, Target, Clock, Award } from 'lucide-react';
import { useProjectsStore } from '../../projetos/logic/projetos';
import { useFilamentos } from '../../filamentos/logic/consultasFilamento';
import DashboardCard from './DashboardCard';

export default function PerformanceMetricsWidget() {
    const { projects } = useProjectsStore();
    const { data: filaments = [] } = useFilamentos();

    const metrics = useMemo(() => {
        const total = projects.length;
        const completed = (projects || []).filter(p => p.data?.status === 'finalizado').length;
        const failed = (projects || []).filter(p => p.data?.status === 'failed').length;
        const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Calculate average print time (Real Data)
        let totalHours = 0;
        let countWithTime = 0;

        (projects || []).forEach(p => {
            const timeObj = p.data?.entradas?.tempo;
            if (timeObj) {
                const h = Number(timeObj.impressaoHoras) || 0;
                const m = (Number(timeObj.impressaoMinutos) || 0) / 60;
                if (h + m > 0) {
                    totalHours += h + m;
                    countWithTime++;
                }
            }
        });

        const avgTime = countWithTime > 0 ? (totalHours / countWithTime).toFixed(1) : 0;

        // Most used material
        const materialCounts = {};
        (filaments || []).forEach(fil => {
            const mat = fil.material || 'Unknown';
            materialCounts[mat] = (materialCounts[mat] || 0) + 1;
        });
        const mostUsed = Object.entries(materialCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        return {
            successRate,
            avgTime,
            completed,
            failed,
            mostUsed,
            efficiency: total > 0 ? Math.round(((completed - failed) / total) * 100) : 0
        };
    }, [projects, filaments]);

    const stats = [
        {
            label: 'Taxa de Sucesso',
            value: `${metrics.successRate}%`,
            icon: Target,
            color: metrics.successRate >= 80 ? 'emerald' : metrics.successRate >= 60 ? 'amber' : 'rose'
        },
        {
            label: 'Tempo Médio',
            value: `${metrics.avgTime}h`,
            icon: Clock,
            color: 'sky'
        },
        {
            label: 'Material Favorito',
            value: metrics.mostUsed,
            icon: Award,
            color: 'purple'
        },
        {
            label: 'Eficiência',
            value: `${metrics.efficiency}%`,
            icon: TrendingUp,
            color: metrics.efficiency >= 70 ? 'emerald' : 'amber'
        }
    ];

    const getColorClasses = (color) => {
        const colors = {
            emerald: 'text-emerald-400',
            sky: 'text-sky-400',
            rose: 'text-rose-400',
            amber: 'text-amber-400',
            purple: 'text-purple-400'
        };
        return colors[color] || colors.sky;
    };

    return (
        <DashboardCard
            title="Performance"
            subtitle="Métricas gerais"
            icon={TrendingUp}
            accentColor="emerald"
            headerAction={
                <div className="flex items-center gap-2 text-[10px] font-bold">
                    <span className="text-emerald-400">{metrics.completed} OK</span>
                    <span className="text-zinc-700">|</span>
                    <span className="text-rose-400">{metrics.failed} Falhas</span>
                </div>
            }
        >
            <div className="grid grid-cols-2 gap-3 h-full">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className="p-3 rounded-xl bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700/50 transition-all hover-lift flex flex-col justify-center"
                        >
                            <div className="flex items-center gap-2 mb-1.5">
                                <Icon size={14} className={getColorClasses(stat.color)} />
                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider truncate">
                                    {stat.label}
                                </span>
                            </div>
                            <p className={`text-lg font-black font-mono truncate ${getColorClasses(stat.color)}`}>
                                {stat.value}
                            </p>
                        </div>
                    );
                })}
            </div>
        </DashboardCard>
    );
}
