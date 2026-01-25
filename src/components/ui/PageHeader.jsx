import React from 'react';
import { Plus, Search, ChevronDown } from 'lucide-react';

/**
 * @param {Object} props
 * @param {string} props.title - Main title (e.g. "Filamentos")
 * @param {string} props.subtitle - Subtitle (e.g. "Gestão de Materiais")
 * @param {string} [props.stats] - Optional stats text (e.g. "Total: 15kg")
 * @param {string} [props.searchQuery] - Controlled search input value
 * @param {Function} [props.onSearchChange] - Search input onChange handler
 * @param {string} [props.placeholder] - Search placeholder
 * @param {React.ReactNode} [props.actionButton] - Custom action button (or standard "Novo" if actionProps provided)
 * @param {Object} [props.actionProps] - if using standard button: { label, onClick, icon }
 * @param {React.ReactNode} [props.extraControls] - Additional controls (filters, view toggles)
 */
export default function PageHeader({
    title,
    subtitle,
    stats,
    accentColor, // "text-rose-500" implies the color for line/glow
    searchQuery,
    onSearchChange,
    placeholder = "Buscar...",
    actionButton,
    actionProps,
    extraControls
}) {
    return (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 shrink-0">
            <div className="flex items-center gap-4 pl-20 md:pl-0">
                {/* Section Accent Line (Glows with currentColor) */}
                {accentColor && (
                    <div className={`${accentColor} self-stretch flex items-center`}>
                        <div className="w-1.5 h-12 rounded-full bg-current shadow-[0_0_15px_currentColor] opacity-80" />
                    </div>
                )}

                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black text-zinc-100 tracking-tight flex items-center gap-3">
                        {title}
                        {stats && (
                            <span className="text-sm font-bold text-zinc-600 bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-800/50">
                                {stats}
                            </span>
                        )}
                    </h1>
                    <p className="text-sm text-zinc-500 font-medium tracking-wide">
                        {subtitle}
                    </p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                {/* BARRA DE PESQUISA */}
                {(onSearchChange !== undefined) && (
                    <div className="relative group min-w-[320px]">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary text-zinc-600">
                            <Search size={18} strokeWidth={2.5} />
                        </div>
                        <input
                            type="text"
                            placeholder={placeholder}
                            value={searchQuery || ''}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-surface-base border border-white/5 text-zinc-200 text-xs font-bold uppercase tracking-wide rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all placeholder:text-zinc-700 hover:border-white/10 shadow-lg"
                        />
                    </div>
                )}

                {/* CONTROLES EXTRAS (Filtros, View Toggles) */}
                {extraControls}

                {/* BOTÃO DE AÇÃO PRINCIPAL */}
                {actionButton ? actionButton : (actionProps && (
                    <button
                        onClick={actionProps.onClick}
                        className="h-11 px-6 bg-primary hover:bg-primary-hover text-white text-[11px] font-black uppercase tracking-wider rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] active:scale-95 transition-all duration-300 flex items-center gap-2 group border border-white/10"
                    >
                        {actionProps.icon || <Plus size={18} strokeWidth={3} className="transition-transform duration-300 group-hover:rotate-90" />}
                        {actionProps.label}
                    </button>
                ))}


            </div>
        </header>
    );
}
