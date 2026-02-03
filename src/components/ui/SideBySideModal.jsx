import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle, Trash2 } from 'lucide-react';

/**
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {React.ReactNode} props.sidebar - The content for the left sidebar (Preview)
 * @param {React.ReactNode} props.children - The main form content
 * @param {React.ReactNode} [props.footer] - Optional footer content (Actions)
 * @param {Object} [props.header] - { title, subtitle, icon: Icon }
 * @param {boolean} [props.isSaving] - Loading state for styles
 * @param {boolean} [props.isDirty] - If true, intercepts closure to ask for confirmation
 */
export default function SideBySideModal({
    isOpen,
    onClose,
    sidebar,
    children,
    footer,
    header,
    isSaving,
    isDirty = false,
    maxWidth = "max-w-5xl",
    className = "",
    contentClassName = "p-10"
}) {
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    // Reset confirm state when modal opens/closes
    useEffect(() => {
        if (isOpen) setShowExitConfirm(false);
    }, [isOpen]);

    const handleCloseAttempt = () => {
        if (isSaving) return;
        if (isDirty && !showExitConfirm) {
            setShowExitConfirm(true);
        } else {
            onClose();
        }
    };

    // Handle Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                handleCloseAttempt();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isDirty, showExitConfirm, isSaving, handleCloseAttempt]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="absolute inset-0" onClick={handleCloseAttempt} />

            <div className={`
                relative bg-[#050506] border border-white/10 rounded-[2.5rem] 
                w-full ${maxWidth} ${className} shadow-[0_0_80px_rgba(0,0,0,1)] overflow-hidden flex flex-col md:flex-row 
                max-h-[96vh] transition-all duration-300 group
                ${isSaving ? 'opacity-90 grayscale-[0.3]' : 'opacity-100'}
            `}>

                {/* GRADE DE FUNDO (GLOBAL) */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]" />

                {/* LINHA DE BRILHO SUPERIOR */}
                {/* LINHA DE BRILHO SUPERIOR */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent ${header?.color ? `via-${header.color}-500 shadow-[0_0_15px_rgba(var(--${header.color}-500-rgb),0.5)]` : 'via-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.5)]'} to-transparent z-20`} />

                {/* Botão de Fechar Absoluto (Sempre presente) */}
                <button
                    onClick={handleCloseAttempt}
                    disabled={isSaving}
                    className="absolute top-6 right-6 z-50 p-2.5 rounded-full bg-black/40 hover:bg-white/10 border border-white/5 text-zinc-500 hover:text-white transition-all backdrop-blur-md shadow-lg disabled:opacity-0"
                    title="Fechar"
                >
                    <X size={20} />
                </button>

                {/* Lateral de Visualização (Prévia) - Renderiza APENAS se houver sidebar */}
                {sidebar && (
                    <div className="w-full md:w-[320px] bg-[#080809] border-b md:border-b-0 md:border-r border-white/5 p-10 flex flex-col justify-between shrink-0 relative overflow-hidden transition-all duration-300">
                        {/* Background Grid Local */}
                        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 select-none">
                            <div className="absolute inset-0" style={{
                                backgroundImage: `linear-gradient(to right, #27272a 1px, transparent 1px), linear-gradient(to bottom, #27272a 1px, transparent 1px)`,
                                backgroundSize: '40px 40px',
                                maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
                            }} />
                        </div>
                        <div className="relative z-10 w-full h-full flex flex-col">
                            {sidebar}
                        </div>
                    </div>
                )}

                {/* Conteúdo Principal */}
                <div className="flex-1 flex flex-col bg-transparent relative z-10">

                    {/* Corpo Rolável */}
                    <div className={`${contentClassName} overflow-y-auto custom-scrollbar flex-1 space-y-8 ${isSaving ? 'pointer-events-none' : ''}`}>

                        {/* Header Padrão (Universal Branding Style) - Injetado no topo do conteúdo */}
                        {/* Header Padrão (Universal Branding Style) - Injetado no topo do conteúdo */}
                        {header && (
                            <div className={`flex flex-col gap-2 border-l-4 pl-6 mb-8 animate-in slide-in-from-left-2 fade-in duration-500 ${header.color ? `border-${header.color}-500` : 'border-sky-500'}`}>
                                <h2 className="text-2xl font-bold text-white tracking-tight leading-none">
                                    {header.title}
                                </h2>
                                {header.subtitle && (
                                    <p className="text-sm font-medium text-zinc-500">
                                        {header.subtitle}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Conteúdo Dinâmico */}
                        {children}
                    </div>

                    {/* Footer Universal: Alterna entre Footer normal e Confirmação de Descarte */}
                    {(showExitConfirm || footer) && (
                        <footer className="p-8 border-t border-white/5 bg-[#080809] flex flex-col gap-4 relative z-20 min-h-[100px] justify-center">
                            {showExitConfirm ? (
                                <div className="flex flex-col gap-3 w-full animate-in fade-in duration-200">
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setShowExitConfirm(false)}
                                            className="flex-1 py-3 px-4 rounded-xl border border-zinc-800 text-[11px] font-bold uppercase text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all font-mono"
                                        >
                                            Continuar Editando
                                        </button>
                                        <button
                                            onClick={onClose}
                                            className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold uppercase shadow-lg shadow-rose-900/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Trash2 size={14} /> Sim, Descartar
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-rose-500 uppercase tracking-widest opacity-80">
                                        <AlertCircle size={12} /> Tem certeza que deseja descartar alterações?
                                    </div>
                                </div>
                            ) : (
                                typeof footer === 'function' ? footer({ onClose: handleCloseAttempt }) : footer
                            )}
                        </footer>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
