import React, { useEffect, useState } from 'react';
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

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="absolute inset-0" onClick={onClose} />

            <div className={`
                relative bg-zinc-950 border border-zinc-800/80 rounded-[2rem] 
                w-full ${maxWidth} shadow-2xl overflow-hidden flex flex-col md:flex-row 
                max-h-[96vh] transition-all duration-300
                ${isSaving ? 'opacity-90 grayscale-[0.3]' : 'opacity-100'}
            `}>

                {/* Lateral de Visualização (Prévia) */}
                <div className="w-full md:w-[320px] bg-zinc-950/40/30 border-b md:border-b-0 md:border-r border-zinc-800/50 p-10 flex flex-col justify-between shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 z-0 pointer-events-none opacity-30 select-none">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `linear-gradient(to right, #27272a 1px, transparent 1px), linear-gradient(to bottom, #27272a 1px, transparent 1px)`,
                            backgroundSize: '40px 40px',
                            maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
                        }} />
                    </div>
                    {sidebar}
                </div>

                {/* Conteúdo Principal */}
                <div className="flex-1 flex flex-col bg-zinc-950">

                    {/* Header Padrão */}
                    {header && (
                        <header className="px-10 py-6 border-b border-zinc-800/50 bg-zinc-950/40/10 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                {header.icon && (
                                    <div className="p-2.5 rounded-xl bg-zinc-950/40 border border-zinc-800">
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
                            <button disabled={isSaving} onClick={onClose} className="p-2 rounded-full hover:bg-zinc-950/40 text-zinc-500 transition-all disabled:opacity-30">
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
                        <footer className="p-8 border-t border-zinc-800/50 bg-zinc-950/40/10 flex flex-col gap-4">
                            {footer}
                        </footer>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
