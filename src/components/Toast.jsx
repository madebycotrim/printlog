import React, { useEffect } from "react";
import { Check, AlertTriangle, X } from "lucide-react";

export default function Toast({ message, type, onClose }) {
    // Fecha automaticamente após 4 segundos
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const isSuccess = type === 'success';

    return (
        <div className={`
            fixed top-6 right-6 z-[250] 
            flex items-center gap-4 p-4 
            rounded-2xl border backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]
            animate-in slide-in-from-right duration-500
            ${isSuccess 
                ? 'bg-emerald-500/5 border-emerald-500/20' 
                : 'bg-rose-500/5 border-rose-500/20'
            }
        `}>
            {/* ÍCONE COM GLOW */}
            <div className={`
                p-2 rounded-xl border
                ${isSuccess 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                }
            `}>
                {isSuccess ? <Check size={20} strokeWidth={3} /> : <AlertTriangle size={20} strokeWidth={3} />}
            </div>

            {/* TEXTO HUD */}
            <div className="flex flex-col min-w-[180px]">
                <span className={`
                    text-[10px] font-black uppercase tracking-[0.2em] italic
                    ${isSuccess ? 'text-emerald-500' : 'text-rose-500'}
                `}>
                    {isSuccess ? 'SISTEMA_CONFIRMADO' : 'ALERTA_DE_SISTEMA'}
                </span>
                <p className="text-[12px] font-bold text-zinc-300 leading-tight mt-0.5">
                    {message}
                </p>
            </div>

            {/* BOTÃO FECHAR */}
            <button 
                onClick={onClose} 
                className="p-1.5 hover:bg-white/5 rounded-lg text-zinc-600 hover:text-white transition-all"
            >
                <X size={16} />
            </button>

            {/* BARRA DE TEMPO (Opcional, visual) */}
            <div className="absolute bottom-0 left-0 h-[2px] bg-current opacity-20 animate-toast-timeout" 
                 style={{ width: '100%', color: isSuccess ? '#10b981' : '#f43f5e' }} 
            />
        </div>
    );
}