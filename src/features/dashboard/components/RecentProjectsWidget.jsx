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
                    projects.slice(0, 4).map((proj) => (
                        <div
                            key={proj.id}
                            className="group/item relative flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-white/5 hover:bg-zinc-800/40 hover:border-violet-500/20 transition-all overflow-hidden"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-lg bg-black/20 border border-white/5 flex items-center justify-center font-black text-[9px] text-zinc-600 group-hover/item:border-violet-500/30 group-hover/item:text-violet-400 transition-colors shrink-0">
                                    #{String(proj.id).slice(0, 3)}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-zinc-300 group-hover/item:text-white truncate transition-colors">
                                        {proj.label}
                                    </h4>
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">
                                        {new Date(proj.created_at || Date.now()).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0 px-2">
                                <div className="text-right hidden sm:block">
                                    <span className="block text-xs font-mono font-bold text-emerald-400">
                                        {formatCurrency(proj.resultados?.precoFinal || 0)}
                                    </span>
                                </div>

                                {/* Actions (Show on Hover) */}
                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover/item:opacity-100 transition-all sm:translate-x-2 sm:group-hover/item:translate-x-0">
                                    <button
                                        onClick={() => handleDuplicate(proj)}
                                        className="p-1.5 rounded-md hover:bg-sky-500/10 hover:text-sky-400 text-zinc-500 transition-colors"
                                        title="Duplicar"
                                    >
                                        <Copy size={12} />
                                    </button>
                                    <button
                                        onClick={() => handleConclude(proj.id)}
                                        className="p-1.5 rounded-md hover:bg-emerald-500/10 hover:text-emerald-400 text-zinc-500 transition-colors"
                                        title="Concluir"
                                    >
                                        <CheckCircle size={12} />
                                    </button>
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
