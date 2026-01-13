import React from 'react';
import { useLocation } from 'wouter';
import { Plus, Calculator, Box, Settings, Zap } from 'lucide-react';

export default function QuickActionsWidget({ className = '' }) {
    const [, setLocation] = useLocation();

    const actions = [
        {
            id: 'new_project',
            label: 'Novo Projeto',
            icon: Calculator,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20',
            hover: 'group-hover:bg-purple-500 group-hover:text-white',
            action: () => setLocation('/calculadora')
        },
        {
            id: 'new_filament',
            label: 'Novo Filamento',
            icon: Box,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            hover: 'group-hover:bg-amber-500 group-hover:text-white',
            action: () => setLocation('/filamentos')
        },
        {
            id: 'clients',
            label: 'Novo Cliente',
            icon: Plus,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            hover: 'group-hover:bg-emerald-500 group-hover:text-white',
            action: () => { } // Placeholder
        },
        {
            id: 'settings',
            label: 'Configurações',
            icon: Settings,
            color: 'text-zinc-400',
            bg: 'bg-zinc-800/50',
            border: 'border-zinc-700/50',
            hover: 'group-hover:bg-zinc-700 group-hover:text-zinc-200',
            action: () => setLocation('/configuracoes')
        }
    ];

    return (
        <div className={`
            relative bg-zinc-950/40 border border-zinc-800/50 hover:border-zinc-700 hover:shadow-2xl transition-all duration-300 rounded-2xl p-6 overflow-hidden group
            ${className}
        `}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shadow-lg">
                    <Zap size={18} className="text-sky-400" />
                </div>
                <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 leading-none mb-1">
                        Ações Rápidas
                    </h3>
                    <p className="text-[10px] font-medium text-zinc-400">
                        Atalhos de produtividade
                    </p>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-3 relative z-10">
                {actions.map(action => (
                    <button
                        key={action.id}
                        onClick={action.action}
                        className={`
                            relative group p-3 rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg flex flex-col items-center justify-center gap-2 text-center
                            bg-zinc-900/50 hover:bg-zinc-800
                            ${action.border}
                        `}
                    >
                        <div className={`
                            w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300
                            ${action.bg} ${action.color} ${action.hover}
                        `}>
                            <action.icon size={20} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-zinc-200 transition-colors">
                            {action.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Decor */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-sky-500/5 rounded-full blur-[50px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
}
