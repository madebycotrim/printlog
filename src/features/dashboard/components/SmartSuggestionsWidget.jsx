import React, { useMemo } from 'react';
import { Zap, Calculator, Package, Printer, TrendingUp, HelpCircle, ChevronRight } from 'lucide-react';
import { generateRecommendations } from '../../../utils/recommendations';

const iconMap = {
    Calculator,
    Package,
    Printer,
    TrendingUp,
    Zap,
    HelpCircle
};

const colorMap = {
    sky: 'from-sky-500/10 to-sky-600/10 border border-sky-500/20 text-sky-400',
    rose: 'from-rose-500/10 to-rose-600/10 border-rose-500/20 text-rose-400',
    emerald: 'from-emerald-500/10 to-emerald-600/10 border-emerald-500/20 text-emerald-400',
    amber: 'from-amber-500/10 to-amber-600/10 border-amber-500/20 text-amber-400',
    violet: 'from-violet-500/10 to-violet-600/10 border-violet-500/20 text-violet-400'
};

export default function SmartSuggestionsWidget({ filaments, printers, projects }) {
    const recommendations = useMemo(() => {
        return generateRecommendations(filaments, printers, projects);
    }, [filaments, printers, projects]);

    const getPriorityBadge = (priority) => {
        const badges = {
            critical: <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-rose-500/20 text-rose-400 rounded">Urgente</span>,
            high: <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-amber-500/20 text-amber-400 rounded">Alta</span>,
            medium: <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-sky-500/20 text-sky-400 rounded">Média</span>,
            low: <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-zinc-600/20 text-zinc-500 rounded">Baixa</span>
        };
        return badges[priority] || badges.low;
    };

    return (
        <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 h-full flex flex-col hover:border-zinc-700 transition-all">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-violet-500/10 rounded-lg">
                    <Zap className="text-violet-500" size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">O que Fazer Agora</h3>
                    <p className="text-[10px] text-zinc-500 font-medium">Sugestões inteligentes</p>
                </div>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
                {recommendations.length > 0 ? (
                    recommendations.map((rec) => {
                        const Icon = iconMap[rec.icon] || Zap;
                        const colorClass = colorMap[rec.color] || colorMap.violet;

                        return (
                            <button
                                key={rec.id}
                                onClick={rec.action}
                                className={`w-full p-3 rounded-xl bg-gradient-to-br ${colorClass} hover:scale-[1.02] transition-all group`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-zinc-900/50 rounded-lg shrink-0">
                                        <Icon size={16} />
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold text-white truncate">{rec.title}</span>
                                            {getPriorityBadge(rec.priority)}
                                        </div>
                                        <p className="text-xs text-zinc-400">{rec.description}</p>
                                    </div>
                                    <ChevronRight size={16} className="text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
                                </div>
                            </button>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                        <Zap size={32} className="text-zinc-700 mb-2" />
                        <p className="text-xs text-zinc-500 font-medium">Tudo em ordem!</p>
                        <p className="text-[10px] text-zinc-600 mt-1">Nenhuma ação urgente no momento</p>
                    </div>
                )}
            </div>
        </div>
    );
}
