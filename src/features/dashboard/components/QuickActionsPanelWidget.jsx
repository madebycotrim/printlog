import React from 'react';
import { Plus, PackagePlus, Printer, FileText, Upload } from 'lucide-react';
import { useLocation } from 'wouter';

export default function QuickActionsPanelWidget() {
    const [, setLocation] = useLocation();

    const actions = [
        {
            id: 'add_filament',
            label: 'Novo Filamento',
            icon: PackagePlus,
            color: 'emerald',
            path: '/filamentos'
        },
        {
            id: 'add_printer',
            label: 'Nova Impressora',
            icon: Printer,
            color: 'sky',
            path: '/impressoras'
        },
        {
            id: 'new_project',
            label: 'Novo Projeto',
            icon: FileText,
            color: 'purple',
            path: '/calculadora'
        },
        {
            id: 'import_gcode',
            label: 'Importar GCode',
            icon: Upload,
            color: 'amber',
            onClick: () => {
                // Trigger file input (will be handled by parent)
                const event = new CustomEvent('triggerGCodeImport');
                window.dispatchEvent(event);
            }
        }
    ];

    const getColorClasses = (color) => {
        const colors = {
            emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20',
            sky: 'bg-sky-500/10 border-sky-500/20 text-sky-400 hover:bg-sky-500/20',
            purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20',
            amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
        };
        return colors[color] || colors.sky;
    };

    return (
        <div className="h-full bg-zinc-950/40 border border-zinc-800/50 hover:border-zinc-700 hover:shadow-2xl transition-all duration-300 rounded-2xl p-5 flex flex-col group overflow-hidden relative">

            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Header */}
            <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus size={18} className="text-blue-400" />
                </div>
                <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 leading-none">
                        Ações Rápidas
                    </h3>
                    <p className="text-[10px] font-medium text-zinc-600">Acessos diretos</p>
                </div>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-2 gap-3 relative z-10">
                {actions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={action.id}
                            onClick={() => action.path ? setLocation(action.path) : action.onClick?.()}
                            className={`
                                flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-200
                                hover:scale-105 active:scale-95 hover-lift
                                ${getColorClasses(action.color)}
                            `}
                            title={action.label}
                        >
                            <Icon size={22} strokeWidth={2} />
                            <span className="text-xs font-bold text-center leading-tight">
                                {action.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
