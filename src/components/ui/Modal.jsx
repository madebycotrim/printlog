import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Cpu, Fingerprint } from "lucide-react";

// Theme Configuration
const MODAL_THEMES = {
    sky: {
        pill: "text-sky-500",
        gradient: "via-sky-500",
        shadow: "shadow-[0_0_15px_rgba(14,165,233,0.5)]",
        scrollbar: "rgba(14,165,233,0.2)"
    },
    emerald: {
        pill: "text-emerald-500",
        gradient: "via-emerald-500",
        shadow: "shadow-[0_0_15px_rgba(16,185,129,0.5)]",
        scrollbar: "rgba(16,185,129,0.2)"
    },
    amber: {
        pill: "text-amber-500",
        gradient: "via-amber-500",
        shadow: "shadow-[0_0_15px_rgba(245,158,11,0.5)]",
        scrollbar: "rgba(245,158,11,0.2)"
    },
    rose: {
        pill: "text-rose-500",
        gradient: "via-rose-500",
        shadow: "shadow-[0_0_15px_rgba(244,63,94,0.5)]",
        scrollbar: "rgba(244,63,94,0.2)"
    },
    purple: {
        pill: "text-purple-500",
        gradient: "via-purple-500",
        shadow: "shadow-[0_0_15px_rgba(168,85,247,0.5)]",
        scrollbar: "rgba(168,85,247,0.2)"
    },
    orange: {
        pill: "text-orange-500",
        gradient: "via-orange-500",
        shadow: "shadow-[0_0_15px_rgba(249,115,22,0.5)]",
        scrollbar: "rgba(249,115,22,0.2)"
    }
};

export default function Modal({
    isOpen,
    onClose,
    title,
    subtitle = "Protocolo de Sistema",
    icon: Icon,
    children,
    footer,
    isLoading = false,
    maxWidth = "max-w-lg",
    padding = "px-8 py-4 mb-2",
    color = "sky"
}) {
    const theme = MODAL_THEMES[color] || MODAL_THEMES.sky;

    // Bloqueio de scroll e Esc Key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && !isLoading) onClose();
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEsc);
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, isLoading, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">

            {/* OVERLAY */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => !isLoading && onClose()}
            />

            {/* JANELA PRINCIPAL - Arredondamento ajustado para 2.5rem */}
            <div className={`
                relative z-[1000] w-full ${maxWidth} max-h-[90vh] 
                bg-[#050506] border border-white/10 rounded-[2.5rem] 
                shadow-[0_0_80px_rgba(0,0,0,1)] flex flex-col overflow-hidden
            `}>

                {/* GRADE DE FUNDO */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]" />

                {/* LINHA DE BRILHO SUPERIOR */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent ${theme.gradient} to-transparent ${theme.shadow}`} />

                {/* HEADER */}
                {/* HEADER */}
                <div className="pr-6 pl-8 py-6 flex items-center justify-between shrink-0 relative z-10 bg-[#050506]">
                    <div className="flex items-center gap-4">
                        {/* Accent Pill (Matches PageHeader) */}
                        <div className={`${theme.pill} self-stretch flex items-center`}>
                            <div className="w-1.5 h-10 rounded-full bg-current shadow-[0_0_15px_currentColor] opacity-80" />
                        </div>

                        <div className="flex flex-col">
                            <h3 className="text-2xl font-black text-white tracking-tight leading-none mb-1">
                                {title}
                            </h3>
                            <span className="text-xs font-medium text-zinc-500 tracking-wide leading-none">
                                {subtitle}
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="p-2 rounded-xl text-zinc-600 hover:text-white hover:bg-white/5 group disabled:opacity-20"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ÁREA DE CONTEÚDO */}
                <div className={`flex-1 overflow-y-auto custom-scrollbar relative z-10 ${padding}`}>
                    <div className="relative">
                        {children}
                    </div>
                </div>

                {/* RODAPÉ */}
                {footer ? (
                    <div className="p-8 bg-[#080809] border-t border-white/5 shrink-0 relative z-10">
                        {footer}
                    </div>
                ) : (
                    <div className="h-8 border-t border-white/5 bg-[#080809] flex items-center px-8 justify-between shrink-0">
                        <div className="flex gap-2">
                            <div className="w-1 h-1 rounded-full bg-zinc-800" />
                            <div className="w-1 h-1 rounded-full bg-zinc-800" />
                        </div>
                        <Fingerprint size={12} className="text-zinc-800" />
                    </div>
                )}
            </div>

            {/* ESTILIZAÇÃO DA SCROLLBAR */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background: rgba(255,255,255,0.05); 
                    border-radius: 10px; 
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
                    background: ${theme.scrollbar}; 
                }
            `}} />
        </div>,
        document.body
    );
}