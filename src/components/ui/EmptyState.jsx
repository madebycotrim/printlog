import React from 'react';
import { PackageSearch } from 'lucide-react';

/**
 * EmptyState - Componente padrão para exibir quando não há itens.
 * 
 * @param {Object} props
 * @param {string} [props.title] - Título principal (ex: "Nenhum item encontrado")
 * @param {string} [props.description] - Texto descritivo opcional
 * @param {React.ElementType} [props.icon] - Componente de ícone (Lucide)
 * @param {React.ReactNode} [props.action] - Botão ou ação opcional para exibir abaixo do texto
 * @param {string} [props.className] - Classes extras
 */
export default function EmptyState({
    title = "Nenhum registro encontrado",
    description,
    icon: Icon = PackageSearch,
    action,
    className = ""
}) {
    return (
        <div className={`py-24 flex flex-col items-center justify-center border border-dashed border-zinc-800/60 rounded-[3rem] bg-zinc-950/40/5 backdrop-blur-sm animate-in fade-in zoom-in duration-500 ${className}`}>
            <Icon size={48} strokeWidth={1} className="mb-4 text-zinc-700" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 text-center px-4">
                {title}
            </h3>
            {description && (
                <p className="text-zinc-500 text-xs mt-2 max-w-md text-center px-4 font-medium">
                    {description}
                </p>
            )}
            {action && (
                <div className="mt-6">
                    {action}
                </div>
            )}
        </div>
    );
}
