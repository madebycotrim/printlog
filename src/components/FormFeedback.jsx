import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';

/**
 * Componente de Feedback para Formulários
 * Exibe mensagens de sucesso, erro, warning ou info com animações suaves
 */
export default function FormFeedback({
    type = 'info',
    message,
    show = false,
    className = '',
    onClose
}) {
    if (!show || !message) return null;

    const configs = {
        success: {
            icon: CheckCircle2,
            bgColor: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/30',
            textColor: 'text-emerald-400',
            iconClass: 'icon-success'
        },
        error: {
            icon: XCircle,
            bgColor: 'bg-rose-500/10',
            borderColor: 'border-rose-500/30',
            textColor: 'text-rose-400',
            iconClass: 'icon-error'
        },
        warning: {
            icon: AlertCircle,
            bgColor: 'bg-amber-500/10',
            borderColor: 'border-amber-500/30',
            textColor: 'text-amber-400',
            iconClass: 'animate-scale-in'
        },
        info: {
            icon: Info,
            bgColor: 'bg-sky-500/10',
            borderColor: 'border-sky-500/30',
            textColor: 'text-sky-400',
            iconClass: 'animate-scale-in'
        }
    };

    const config = configs[type] || configs.info;
    const Icon = config.icon;

    return (
        <div
            className={`
        flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm
        ${config.bgColor} ${config.borderColor}
        animate-slide-down
        ${className}
      `}
        >
            <Icon
                size={20}
                className={`shrink-0 mt-0.5 ${config.textColor} ${config.iconClass}`}
            />
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium leading-relaxed ${config.textColor}`}>
                    {message}
                </p>
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    className={`shrink-0 ${config.textColor} hover:opacity-70 transition-opacity`}
                    aria-label="Fechar"
                >
                    <XCircle size={16} />
                </button>
            )}
        </div>
    );
}



