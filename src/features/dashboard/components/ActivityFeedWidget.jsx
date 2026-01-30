import React, { useMemo } from 'react';
import { Activity, Package, Printer, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { useFilamentos } from '../../filamentos/logic/consultasFilamento';
import { useProjectsStore } from '../../projetos/logic/projetos';
import DashboardCard from './DashboardCard';

export default function ActivityFeedWidget() {
    const { data: filaments = [] } = useFilamentos();
    const { projects } = useProjectsStore();

    // Generate activity feed from recent data
    const activities = useMemo(() => {
        const feed = [];

        // Recent filaments (last 5)
        (filaments || []).slice(-5).reverse().forEach(fil => {
            feed.push({
                id: `fil_${fil.id}`,
                type: 'filament',
                icon: Package,
                color: 'emerald',
                title: 'Filamento adicionado',
                description: `${fil.marca} ${fil.material} - ${fil.peso}g`,
                time: new Date(fil.id).toLocaleDateString()
            });
        });

        // Recent projects (last 5)
        (projects || []).slice(-5).reverse().forEach(proj => {
            const isFailed = proj.data?.status === 'failed';
            const isCompleted = proj.data?.status === 'finalizado';

            feed.push({
                id: `proj_${proj.id}`,
                type: isCompleted ? 'success' : isFailed ? 'failed' : 'project',
                icon: isCompleted ? CheckCircle : isFailed ? AlertTriangle : Printer,
                color: isCompleted ? 'emerald' : isFailed ? 'rose' : 'sky',
                title: isCompleted ? 'Projeto finalizado' : isFailed ? 'Impressão falhou' : 'Novo projeto',
                description: proj.label || proj.data?.entradas?.nomeProjeto || `Projeto #${String(proj.id).slice(0, 8)}`,
                time: new Date(proj.created_at || proj.id).toLocaleDateString()
            });
        });

        // Sort by time (most recent first) and limit to 8
        return feed.slice(0, 8);
    }, [filaments, projects]);

    const getColorClasses = (color) => {
        const colors = {
            emerald: 'text-emerald-400 bg-emerald-500/10',
            sky: 'text-sky-400 bg-sky-500/10',
            rose: 'text-rose-400 bg-rose-500/10',
            amber: 'text-amber-400 bg-amber-500/10'
        };
        return colors[color] || colors.sky;
    };

    return (
        <DashboardCard
            title="Atividades"
            subtitle={`${activities.length} recentes`}
            icon={Activity}
            accentColor="violet"
        >
            <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1 -mr-2">
                {activities.length > 0 ? (
                    activities.map((activity) => {
                        const Icon = activity.icon;
                        return (
                            <div
                                key={activity.id}
                                className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/30 border border-zinc-800/50 hover:border-violet-500/20 hover:bg-zinc-800/40 transition-all group/item"
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getColorClasses(activity.color)}`}>
                                    <Icon size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <p className="text-xs font-bold text-zinc-300 group-hover/item:text-white truncate transition-colors">
                                            {activity.title}
                                        </p>
                                        <span className="text-[9px] text-zinc-600 whitespace-nowrap ml-2">{activity.time}</span>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                                        {activity.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8 opacity-40">
                        <Activity size={32} className="text-zinc-500 mb-2" strokeWidth={1.5} />
                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-600">Sem atividades</p>
                    </div>
                )}
            </div>
        </DashboardCard>
    );
}
