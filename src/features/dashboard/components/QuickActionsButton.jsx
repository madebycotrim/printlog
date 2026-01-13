import React, { useState } from 'react';
import { Plus, Calculator, Package, Printer } from 'lucide-react';
import { useLocation } from 'wouter';

/**
 * Barra de Ações Rápidas - Design integrado ao dashboard
 */
export default function QuickActionsButton({ onActionClick }) {
    const [, setLocation] = useLocation();
    const [hoveredAction, setHoveredAction] = useState(null);

    const actions = [
        {
            id: 'new-project',
            label: 'Novo Projeto',
            icon: Calculator,
            color: 'sky',
            action: () => setLocation('/calculadora')
        },
        {
            id: 'add-filament',
            label: 'Adicionar Filamento',
            icon: Package,
            color: 'emerald',
            action: () => onActionClick('add-filament')
        },
        {
            id: 'add-printer',
            label: 'Adicionar Impressora',
            icon: Printer,
            color: 'amber',
            action: () => onActionClick('add-printer')
        }
    ];

    const colorClasses = {
        sky: {
            bg: 'bg-sky-500',
            hover: 'hover:bg-sky-400',
            text: 'text-sky-400',
            border: 'border-sky-500/20',
            glow: 'shadow-sky-500/20'
        },
        emerald: {
            bg: 'bg-emerald-500',
            hover: 'hover:bg-emerald-400',
            text: 'text-emerald-400',
            border: 'border-emerald-500/20',
            glow: 'shadow-emerald-500/20'
        },
        amber: {
            bg: 'bg-amber-500',
            hover: 'hover:bg-amber-400',
            text: 'text-amber-400',
            border: 'border-amber-500/20',
            glow: 'shadow-amber-500/20'
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-40">
            <div className="bg-zinc-950/90 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-2 shadow-2xl flex gap-2">
                {actions.map((action) => {
                    const Icon = action.icon;
                    const colors = colorClasses[action.color];
                    const isHovered = hoveredAction === action.id;

                    return (
                        <button
                            key={action.id}
                            onClick={action.action}
                            onMouseEnter={() => setHoveredAction(action.id)}
                            onMouseLeave={() => setHoveredAction(null)}
                            className={`
                                relative group
                                w-14 h-14 rounded-xl
                                flex items-center justify-center
                                transition-all duration-300
                                ${isHovered ? `${colors.bg} scale-110` : 'bg-zinc-900/50 hover:bg-zinc-900/50'}
                                border ${isHovered ? 'border-transparent' : colors.border}
                                shadow-lg ${isHovered ? colors.glow : ''}
                                active:scale-95
                            `}
                        >
                            <Icon
                                size={22}
                                strokeWidth={2.5}
                                className={`transition-colors duration-300 ${isHovered ? 'text-white' : colors.text}`}
                            />

                            {/* Tooltip */}
                            <div className={`
                                absolute bottom-full mb-3 left-1/2 -translate-x-1/2
                                px-3 py-1.5 rounded-lg
                                bg-zinc-950 border border-zinc-800
                                text-xs font-semibold text-white whitespace-nowrap
                                opacity-0 group-hover:opacity-100
                                pointer-events-none
                                transition-opacity duration-200
                                shadow-xl
                            `}>
                                {action.label}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-800" />
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
