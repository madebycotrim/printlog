import React from 'react';
import { FolderOpen, ArrowRight, Copy, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../../../utils/numbers';
import { useLocation } from 'wouter';
import DashboardCard from './DashboardCard';
import EstadoVazio from '../../../components/ui/EstadoVazio';

export default function RecentProjectsWidget({ projects, onDuplicate, onConclude }) {
    const [, setLocation] = useLocation();

    const handleDuplicate = (proj) => {
        if (onDuplicate) onDuplicate(proj);
        else setLocation(`/calculadora?load=${proj.id}`);
    };

    const handleConclude = (id) => {
        if (onConclude) onConclude(id);
    };

    return (
        <DashboardCard
            title="Projetos Recentes"
            subtitle={`${projects ? projects.length : 0} em andamento`}
            icon={FolderOpen}
            accentColor="violet"
            headerAction={
                <a
                    href="/calculadora"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-zinc-300 border border-white/5 transition-all hover:pr-4 group/link"
                >
                    Ver Todos
                    <ArrowRight size={10} className="group-hover/link:translate-x-0.5 transition-transform" />
                </a>
            }
        >
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-2 space-y-2">
                {projects && projects.length > 0 ? (
                    projects.slice(0, 5).map((proj) => (
                        <div
                            key={proj.id}
                            className="group/item relative flex items-center justify-between p-2.5 rounded-lg border border-white/5 hover:bg-zinc-800/60 hover:border-zinc-700 transition-all cursor-default"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                {/* Icon / Avatar */}
                                <div className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500 group-hover/item:text-zinc-300 group-hover/item:border-zinc-700 transition-colors shrink-0">
                                    {String(proj.label || 'PRO').substring(0, 2).toUpperCase()}
                                </div>

                                <div className="min-w-0 flex flex-col">
                                    <h4 className="text-xs font-bold text-zinc-300 group-hover/item:text-zinc-100 truncate transition-colors leading-tight">
                                        {proj.label}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[9px] text-zinc-500 font-medium">
                                            {new Date(proj.created_at || Date.now()).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                        </span>
                                        {/* Status Dot */}
                                        <div className={`w-1.5 h-1.5 rounded-full ${proj.data?.status === 'finalizado' ? 'bg-emerald-500/50' : 'bg-amber-500/50'}`} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 pl-2">
                                <div className="text-right">
                                    <span className="block text-xs font-mono font-bold text-zinc-200">
                                        {formatCurrency(proj.resultados?.precoFinal || 0)}
                                    </span>
                                </div>

                                {/* Actions - Always visible on mobile, hover on desktop */}
                                <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleDuplicate(proj)}
                                        className="p-1.5 rounded-md hover:bg-zinc-700 text-zinc-500 hover:text-zinc-200 transition-colors"
                                        title="Duplicar"
                                    >
                                        <Copy size={12} />
                                    </button>
                                    {proj.data?.status !== 'finalizado' && (
                                        <button
                                            onClick={() => handleConclude(proj.id)}
                                            className="p-1.5 rounded-md hover:bg-emerald-500/20 text-zinc-500 hover:text-emerald-400 transition-colors"
                                            title="Concluir"
                                        >
                                            <CheckCircle size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <EstadoVazio
                        icon={FolderOpen}
                        title="Sem projetos recentes"
                        description="Crie orçamentos para controlar seus lucros."
                        action={
                            <a
                                href="/calculadora"
                                className="px-3 py-1.5 rounded-lg bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 border border-violet-500/20 text-[10px] font-bold transition-all"
                            >
                                Novo Projeto
                            </a>
                        }
                    />
                )}
            </div>
        </DashboardCard>
    );
}
