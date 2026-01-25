import React from 'react';
import { PackageSearch, Ghost } from 'lucide-react';

/**
 * EmptyState - Componente padrão para exibir quando não há itens.
 */
export default function EmptyState({
    title = "Nada por aqui...",
    description = "Não encontramos nenhum registro.",
    icon: Icon = Ghost,
    action,
    className = ""
}) {
    return (
        <div className={`
            py-20 flex flex-col items-center justify-center 
            animate-in fade-in zoom-in duration-500 
            ${className}
        `}>
            {/* Ícone Minimalista */}
            <div className="relative mb-6 group">
                <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/5 relative z-10 transition-transform duration-500 group-hover:scale-110">
                    <Icon size={32} strokeWidth={1} className="text-zinc-600 group-hover:text-zinc-400 transition-colors duration-500" />
                </div>
            </div>

            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-300 text-center px-4 mb-2">
                {title}
            </h3>

            {description && (
                <p className="text-zinc-600 text-[11px] text-center font-medium max-w-sm leading-relaxed px-8">
                    {description}
                </p>
            )}

            {action && (
                <div className="mt-8 transform hover:scale-105 transition-transform duration-300">
                    {action}
                </div>
            )}
        </div>
    );
}
