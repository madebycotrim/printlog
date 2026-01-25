import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {React.ReactNode} props.sidebar - The content for the left sidebar (Preview)
 * @param {React.ReactNode} props.children - The main form content
 * @param {React.ReactNode} [props.footer] - Optional footer content (Actions)
 * @param {Object} [props.header] - { title, subtitle, icon: Icon }
 * @param {boolean} [props.isSaving] - Loading state for styles
 */
export default function SideBySideModal({
    isOpen,
    onClose,
    sidebar,
    children,
    footer,
    header,
    isSaving,
    maxWidth = "max-w-5xl"
}) {
    if (!isOpen) return null;

    // Mantemos o comportamento original: renderiza header APENAS se o objeto header for passado explicitamente
    // Mas adicionamos um botão de fechar flutuante se não houver header
    const showFloatingClose = !header && onClose;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="absolute inset-0" onClick={onClose} />

            <div className={`
                relative bg-[#050506] border border-white/10 rounded-[2.5rem] 
                w-full ${maxWidth} shadow-[0_0_80px_rgba(0,0,0,1)] overflow-hidden flex flex-col md:flex-row 
                max-h-[96vh] transition-all duration-300 group
                ${isSaving ? 'opacity-90 grayscale-[0.3]' : 'opacity-100'}
            `}>

                {/* GRADE DE FUNDO (GLOBAL) */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]" />

                {/* LINHA DE BRILHO SUPERIOR */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-sky-500 to-transparent shadow-[0_0_15px_rgba(14,165,233,0.5)] z-20" />

                {/* Botão de Fechar Flutuante (Minimalista) */}
                {showFloatingClose && (
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="absolute top-6 right-6 z-50 p-2.5 rounded-full bg-black/40 hover:bg-white/10 border border-white/5 text-zinc-500 hover:text-white transition-all backdrop-blur-md shadow-lg disabled:opacity-0"
                        title="Fechar"
                    >
                        <X size={20} />
                    </button>
                )}

                {/* Lateral de Visualização (Prévia) */}
                <div className="w-full md:w-[320px] bg-[#080809] border-b md:border-b-0 md:border-r border-white/5 p-10 flex flex-col justify-between shrink-0 relative overflow-hidden">
                    {/* Background Grid Local (Opcional, mas ajuda no contraste) */}
                    <div className="absolute inset-0 z-0 pointer-events-none opacity-20 select-none">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `linear-gradient(to right, #27272a 1px, transparent 1px), linear-gradient(to bottom, #27272a 1px, transparent 1px)`,
                            backgroundSize: '40px 40px',
                            maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
                        }} />
                    </div>
                    {sidebar}
                </div>

                {/* Conteúdo Principal */}
                <div className="flex-1 flex flex-col bg-transparent relative z-10">

                    {/* Header Padrão (Apenas se passado explicitamente) */}
                    {header && (
                        <header className="px-10 py-6 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                {header.icon && (
                                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                                        <header.icon size={18} className="text-zinc-400" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-widest">
                                        {header.title}
                                    </h3>
                                    <p className="text-[10px] text-zinc-500 font-medium mt-1">
                                        {header.subtitle}
                                    </p>
                                </div>
                            </div>
                            <button disabled={isSaving} onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-zinc-500 transition-all disabled:opacity-30">
                                <X size={20} />
                            </button>
                        </header>
                    )}

                    {/* Corpo */}
                    <div className={`p-10 overflow-y-auto custom-scrollbar flex-1 space-y-8 ${isSaving ? 'pointer-events-none' : ''}`}>
                        {children}
                    </div>

                    {/* Footer */}
                    {footer && (
                        <footer className="p-8 border-t border-white/5 bg-[#080809] flex flex-col gap-4">
                            {footer}
                        </footer>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
