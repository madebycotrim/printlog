import React from 'react';
import { Maximize2, Minimize2, X, Move } from 'lucide-react';

/**
 * DashboardCard - Wrapper premium unificado para todos os widgets
 * 
 * @param {string} title - Título do widget
 * @param {string} subtitle - Subtítulo ou contador (opcional)
 * @param {React.ElementType} icon - Ícone Lucide
 * @param {string} accentColor - Cor de destaque (classe Tailwind: 'emerald', 'sky', 'rose', etc)
 * @param {React.ReactNode} children - Conteúdo do widget
 * @param {React.ReactNode} headerAction - Ação extra no header (opcional)
 * @param {boolean} isEditing - Modo de edição ativo
 * @param {Function} onRemove - Handler para remover widget
 * @param {Function} onExpand - Handler para expandir widget
 * @param {boolean} isExpanded - Se está expandido
 */
export default function DashboardCard({
    title,
    subtitle,
    icon: Icon,
    accentColor = 'zinc',
    children,
    headerAction,
    isEditing = false,
    onRemove,
    onExpand,
    isExpanded,
    className = ''
}) {
    // Mapeamento de Cores para Estilos
    const colorStyles = {
        emerald: {
            bg: 'bg-zinc-900/40',
            border: 'border-zinc-800/50',
            iconBg: 'bg-emerald-500/10',
            iconColor: 'text-emerald-400',
            glow: 'shadow-emerald-500/5',
            hoverBorder: 'group-hover:border-emerald-500/50'
        },
        sky: {
            bg: 'bg-zinc-900/40',
            border: 'border-zinc-800/50',
            iconBg: 'bg-sky-500/10',
            iconColor: 'text-sky-400',
            glow: 'shadow-sky-500/5',
            hoverBorder: 'group-hover:border-sky-500/50'
        },
        rose: {
            bg: 'bg-zinc-900/40',
            border: 'border-zinc-800/50',
            iconBg: 'bg-rose-500/10',
            iconColor: 'text-rose-400',
            glow: 'shadow-rose-500/5',
            hoverBorder: 'group-hover:border-rose-500/50'
        },
        amber: {
            bg: 'bg-zinc-900/40',
            border: 'border-zinc-800/50',
            iconBg: 'bg-amber-500/10',
            iconColor: 'text-amber-400',
            glow: 'shadow-amber-500/5',
            hoverBorder: 'group-hover:border-amber-500/50'
        },
        violet: {
            bg: 'bg-zinc-900/40',
            border: 'border-zinc-800/50',
            iconBg: 'bg-violet-500/10',
            iconColor: 'text-violet-400',
            glow: 'shadow-violet-500/5',
            hoverBorder: 'group-hover:border-violet-500/50'
        },
        zinc: {
            bg: 'bg-zinc-900/40',
            border: 'border-zinc-800/50',
            iconBg: 'bg-zinc-800/50',
            iconColor: 'text-zinc-400',
            glow: 'shadow-black/20',
            hoverBorder: 'group-hover:border-zinc-600'
        },
        pink: {
            bg: 'bg-zinc-900/40',
            border: 'border-zinc-800/50',
            iconBg: 'bg-pink-500/10',
            iconColor: 'text-pink-400',
            glow: 'shadow-pink-500/5',
            hoverBorder: 'group-hover:border-pink-500/50'
        }
    };

    const style = colorStyles[accentColor] || colorStyles.zinc;

    return (
        <div className={`
            relative h-full flex flex-col
            rounded-[2rem] backdrop-blur-xl
            border transition-all duration-300
            ${style.bg} ${style.border} ${style.hoverBorder}
            ${style.glow}
            group overflow-hidden
            ${className}
        `}>
            {/* Background Glow Effect */}
            <div className={`
                absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none
                opacity-0 group-hover:opacity-10 transition-opacity duration-700
                bg-gradient-to-br from-white/20 to-transparent
                -mr-16 -mt-16
            `} />

            {/* Header Unificado */}
            <div className="flex items-center justify-between p-6 pb-4 relative z-10 shrink-0">
                <div className="flex items-center gap-4 min-w-0">
                    {Icon && (
                        <div className={`
                            w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                            ${style.iconBg} ${style.iconColor}
                            transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3
                            shadow-inner border border-white/5
                        `}>
                            <Icon size={18} strokeWidth={2} />
                        </div>
                    )}
                    <div className="min-w-0">
                        <h3 className="text-xs font-black uppercase tracking-[0.15em] text-zinc-400 truncate group-hover:text-zinc-200 transition-colors">
                            {title}
                        </h3>
                        {subtitle && (
                            <p className={`text-[10px] font-bold mt-0.5 truncate ${style.iconColor} opacity-80`}>
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {headerAction}

                    {/* Controles de Edição (Só aparecem se isEditing for true no pai, mas aqui podemos renderizar se passado) */}
                    {isEditing && (
                        <div className="flex items-center gap-1 bg-black/40 rounded-lg p-1 border border-white/10 backdrop-blur-md">
                            <button
                                onClick={(e) => { e.stopPropagation(); onExpand?.(); }}
                                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-all"
                            >
                                {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
                                className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-500/80 rounded-md transition-all"
                            >
                                <X size={14} />
                            </button>
                            <div className="w-px h-3 bg-white/20 mx-1" />
                            <div className="p-1.5 text-zinc-500 cursor-move">
                                <Move size={14} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 pt-2 relative z-10 overflow-hidden flex flex-col">
                {children}
            </div>
        </div>
    );
}
