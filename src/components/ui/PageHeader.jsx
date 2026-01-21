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
    searchQuery,
    onSearchChange,
    placeholder = "Buscar...",
    actionButton,
    actionProps,
    extraControls
}) {
    return (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
            <div className="flex flex-col gap-1 pl-20 md:pl-0">
                <h1 className="text-3xl font-black text-zinc-100 tracking-tight flex items-center gap-3">
                    {title}
                    {stats && (
                        <span className="text-sm font-bold text-zinc-600 bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-800/50"> //
                            {stats}
                        </span>
                    )}
                </h1>
                <p className="text-sm text-zinc-500 font-medium tracking-wide">
                    {subtitle}
                </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                {/* BARRA DE PESQUISA */}
                {(onSearchChange !== undefined) && (
                    <div className="relative group min-w-[280px]">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-sky-500 text-zinc-500">
                            <Search size={16} strokeWidth={2.5} />
                        </div>
                        <input
                            type="text"
                            placeholder={placeholder}
                            value={searchQuery || ''}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/50 border border-zinc-800 text-zinc-200 text-xs font-bold uppercase tracking-wide rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all placeholder:text-zinc-700 hover:border-zinc-700"
                        />
                    </div>
                )}

                {/* CONTROLES EXTRAS (Filtros, View Toggles) */}
                {extraControls}

                {/* BOTÃO DE AÇÃO PRINCIPAL */}
                {actionButton ? actionButton : (actionProps && (
                    <button
                        onClick={actionProps.onClick}
                        className="h-10 px-5 bg-zinc-100 hover:bg-white text-zinc-950 text-[11px] font-black uppercase tracking-wider rounded-xl hover:shadow-lg hover:shadow-zinc-500/20 active:scale-95 transition-all duration-300 flex items-center gap-2 group"
                    >
                        {actionProps.icon || <Plus size={16} strokeWidth={3} className="transition-transform duration-300 group-hover:rotate-90" />}
                        {actionProps.label}
                    </button>
                ))}

                {/* BOTÃO DE AJUDA / TOUR (Novo) */}
                <button
                    onClick={() => {
                        const path = window.location.pathname;
                        localStorage.removeItem(`hasSeenTour-${path}`);
                        window.location.reload();
                    }}
                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-500 hover:text-sky-400 hover:border-sky-500/30 transition-all active:scale-95"
                    title="Reiniciar Tour desta página"
                >
                    <span className="text-lg font-bold">?</span>
                </button>
            </div>
        </header>
    );
}
