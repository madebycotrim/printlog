import React, { useEffect } from "react";
import { X, Loader2, Cpu, Fingerprint } from "lucide-react";

export default function Popup({
    isOpen,
    onClose,
    title,
    subtitle = "Protocolo de Sistema",
    icon: Icon,
    children,
    footer,
    isLoading = false,
    maxWidth = "max-w-lg"
}) {

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

    return (
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
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-sky-500 to-transparent shadow-[0_0_15px_rgba(14,165,233,0.5)]" />

                {/* HEADER */}
                <div className="p-8 pb-4 flex items-start justify-between shrink-0 relative z-10">
                    <div className="flex items-start gap-4">
                        <div className={`
                            w-12 h-12 rounded-2xl border border-white/5 bg-white/[0.02]
                            flex items-center justify-center shrink-0
                            ${isLoading ? 'text-sky-500' : 'text-zinc-500'}
                        `}>
                            {isLoading ? (
                                <Loader2 size={20} />
                            ) : (
                                Icon ? <Icon size={20} strokeWidth={2.5} /> : <Cpu size={20} strokeWidth={2.5} />
                            )}
                        </div>

                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-sky-500 uppercase tracking-[0.3em] mb-1">
                                {subtitle}
                            </span>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">
                                {title}
                            </h3>
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
                <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 px-8 py-4 mb-2">
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
                    background: rgba(14,165,233,0.2); 
                }
            `}} />
        </div>
    );
}