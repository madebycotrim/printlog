import React from "react";
import { ChevronRight } from "lucide-react";

/**
 * DataCard - Card Universal para exibição de dados em grid.
 * 
 * @param {Object} props
 * @param {string} props.title - Título principal
 * @param {string} [props.subtitle] - Subtítulo
 * @param {React.ElementType} [props.icon] - Ícone principal
 * @param {string} [props.color] - Cor do tema (sky, emerald, amber, rose, purple)
 * @param {React.ReactNode} [props.headerActions] - Botões de ação no topo direito
 * @param {React.ReactNode} [props.footer] - Conteúdo do rodapé
 * @param {Function} [props.onClick] - Função de clique no card
 * @param {React.ReactNode} props.children - Conteúdo principal do card
 * @param {string} [props.className] - Classes extras
 * @param {string} [props.badge] - Badge text (optional)
 * @param {Object} [props.status] - Status config { label, color, dotColor }
 */
export default function DataCard({
    title,
    subtitle,
    icon: Icon,
    color = "zinc",
    headerActions,
    footer,
    onClick,
    children,
    className = "",
    badge,
    status
}) {
    // Mapa de cores para temas
    const colors = {
        sky: "group-hover:border-sky-500/30 group-hover:shadow-[0_0_20px_rgba(14,165,233,0.1)]",
        emerald: "group-hover:border-emerald-500/30 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]",
        amber: "group-hover:border-amber-500/30 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]",
        rose: "group-hover:border-rose-500/30 group-hover:shadow-[0_0_20px_rgba(244,63,94,0.1)]",
        purple: "group-hover:border-purple-500/30 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.1)]",
        zinc: "group-hover:border-zinc-700",
        orange: "group-hover:border-orange-500/30 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.1)]",
        red: "group-hover:border-red-500/30 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]",
        indigo: "group-hover:border-indigo-500/30 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.1)]",
    };

    // Mapeamento de cor para o ícone
    const iconColors = {
        sky: "text-sky-400 bg-sky-500/10 border-sky-500/20",
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        zinc: "text-zinc-400 bg-zinc-800 border-zinc-700",
        orange: "text-orange-400 bg-orange-500/10 border-orange-500/20",
        red: "text-red-400 bg-red-500/10 border-red-500/20",
        indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    };

    const themeClass = colors[color] || colors.zinc;
    const iconClass = iconColors[color] || iconColors.zinc;

    return (
        <div
            onClick={onClick}
            className={`
                group relative flex flex-col justify-between 
                bg-zinc-950/40 border border-zinc-800/50 rounded-2xl p-6 
                transition-all duration-300 hover-lift overflow-hidden
                ${themeClass} ${onClick ? 'cursor-pointer' : ''} ${className}
            `}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4 relative z-10">
                {/* Lado Esquerdo: Status, Title, Subtitle */}
                <div className="flex flex-col items-start gap-1">
                    {status && (
                        <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-wider mb-1 ${status.bg || 'bg-zinc-900'} ${status.color || 'text-zinc-400'} ${status.border || 'border-zinc-800'}`}>
                            {status.dotColor && <div className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />}
                            {status.label}
                        </div>
                    )}

                    <h3 className={`text-lg font-bold text-white leading-tight line-clamp-2 ${onClick ? 'group-hover:text-emerald-400' : ''} transition-colors`}>
                        {title}
                    </h3>
                    {subtitle && (
                        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide line-clamp-1">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Lado Direito: Badge, Ações e Ícone */}
                <div className="flex items-center gap-3">
                    {badge && (
                        <span className="font-mono text-[10px] font-bold text-zinc-600 uppercase tracking-widest mr-1">
                            {badge}
                        </span>
                    )}
                    {headerActions && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {headerActions}
                        </div>
                    )}
                    {Icon && (
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${iconClass}`}>
                            <Icon size={20} strokeWidth={2.5} />
                        </div>
                    )}
                </div>
            </div>

            {/* Corpo Principal (Children Only) */}
            <div className="flex-1 relative z-10">
                {children && <div className="mt-2">{children}</div>}
            </div>

            {/* Rodapé */}
            {footer && (
                <div className="mt-6 pt-4 border-t border-zinc-800/50 relative z-10 flex items-end justify-between">
                    <div className="w-full">
                        {footer}
                    </div>
                </div>
            )}
        </div>
    );
}
