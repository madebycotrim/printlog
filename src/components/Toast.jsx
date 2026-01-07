import React, { useEffect, useState } from "react";
import { Check, AlertOctagon, X, Info, TriangleAlert } from "lucide-react";

export default function Toast({ message, type = 'success', onClose }) {
    const [isPaused, setIsPaused] = useState(false);

    // Gerenciamento do Timer com pausa ao dar Hover
    useEffect(() => {
        if (isPaused) return;
        
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose, isPaused]);

    // Configuração de Estilos por Tipo
    const configs = {
        success: {
            color: 'text-emerald-500',
            border: 'border-emerald-500/30',
            bg: 'bg-emerald-500/5',
            glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
            icon: <Check size={18} strokeWidth={3} />,
            label: 'SISTEMA_NOMINAL'
        },
        error: {
            color: 'text-rose-500',
            border: 'border-rose-500/30',
            bg: 'bg-rose-500/5',
            glow: 'shadow-[0_0_20px_rgba(244,63,94,0.15)]',
            icon: <AlertOctagon size={18} strokeWidth={3} />,
            label: 'ERRO_DE_NÚCLEO'
        },
        info: {
            color: 'text-sky-500',
            border: 'border-sky-500/30',
            bg: 'bg-sky-500/5',
            glow: 'shadow-[0_0_20px_rgba(14,165,233,0.15)]',
            icon: <Info size={18} strokeWidth={3} />,
            label: 'INFO_LOG'
        },
        warning: {
            color: 'text-amber-500',
            border: 'border-amber-500/30',
            bg: 'bg-amber-500/5',
            glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
            icon: <TriangleAlert size={18} strokeWidth={3} />,
            label: 'AVISO_OPERACIONAL'
        }
    };

    const config = configs[type] || configs.success;

    return (
        <div 
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className={`
                fixed top-6 right-6 z-[300] 
                flex items-center gap-4 p-4 pr-5
                rounded-xl border backdrop-blur-2xl
                animate-in slide-in-from-right-10 fade-in duration-300
                ${config.bg} ${config.border} ${config.glow}
                min-w-[320px] max-w-[420px]
                overflow-hidden group
            `}
        >
            {/* EFEITO DE SCANLINE (Sutil) */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%]" />

            {/* ÍCONE COM PULSO */}
            <div className={`
                relative shrink-0 flex items-center justify-center
                w-10 h-10 rounded-lg border
                ${config.bg} ${config.border} ${config.color}
            `}>
                <div className="absolute inset-0 animate-ping opacity-20 bg-current rounded-lg" />
                {config.icon}
            </div>

            {/* CONTEÚDO */}
            <div className="flex-1 flex flex-col space-y-0.5">
                <div className="flex items-center gap-2">
                    <span className={`font-mono text-[9px] font-black tracking-[0.2em] ${config.color}`}>
                        {config.label}
                    </span>
                    <div className={`h-[1px] flex-1 bg-gradient-to-r ${config.color.replace('text', 'from')}/30 to-transparent`} />
                </div>
                <p className="text-[13px] font-bold text-zinc-200 tracking-tight leading-snug">
                    {message}
                </p>
            </div>

            {/* BOTÃO FECHAR CUSTOM */}
            <button 
                onClick={onClose} 
                className="ml-2 p-1 rounded-md hover:bg-white/10 text-zinc-500 hover:text-white transition-colors"
            >
                <X size={14} />
            </button>

            {/* BARRA DE PROGRESSO ANIMADA */}
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-zinc-800/50">
                <div 
                    className={`h-full transition-all linear ${config.color.replace('text', 'bg')}`}
                    style={{ 
                        width: isPaused ? '100%' : '0%',
                        transitionDuration: isPaused ? '0s' : '4000ms',
                        boxShadow: `0 0 10px ${config.color.split('-')[1]}`
                    }}
                />
            </div>

            {/* CANTOS TÉCNICOS (Decorativo) */}
            <div className={`absolute top-0 left-0 w-1 h-1 border-t border-l ${config.border}`} />
            <div className={`absolute bottom-0 right-0 w-1 h-1 border-b border-r ${config.border}`} />
        </div>
    );
}