import React, { useState, useRef, useEffect } from 'react';
import { Calculator, Package, Printer, Box, HelpCircle, Zap, X, ScanBarcode } from 'lucide-react';
import { useLocation } from 'wouter';

export default function QuickActionsDock({
    onNewFilament,
    onNewPrinter,
    onNewSupply,
    onScan
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [location, setLocation] = useLocation();

    // Focus management refs
    const triggerRef = useRef(null);
    const menuRef = useRef(null);
    const firstActionRef = useRef(null);

    // Renderiza apenas no Dashboard
    if (location !== '/' && location !== '/dashboard') return null;

    const actions = [
        {
            label: 'Novo Projeto',
            icon: Calculator,
            onClick: () => { setLocation('/calculadora'); setIsOpen(false); },
            color: 'text-sky-400'
        },
        {
            label: 'Material',
            icon: Package,
            onClick: () => { onNewFilament(); setIsOpen(false); },
            color: 'text-rose-400'
        },
        {
            label: 'Impressora',
            icon: Printer,
            onClick: () => { onNewPrinter(); setIsOpen(false); },
            color: 'text-emerald-400'
        },
        {
            label: 'Insumo',
            icon: Box,
            onClick: () => { onNewSupply(); setIsOpen(false); },
            color: 'text-amber-400'
        },
        {
            label: 'Escanear',
            icon: ScanBarcode,
            onClick: () => { onScan(); setIsOpen(false); },
            color: 'text-white'
        }
    ];

    // Handle Escape key to close menu
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isOpen && e.key === 'Escape') {
                setIsOpen(false);
                triggerRef.current?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // Focus management effect
    useEffect(() => {
        if (isOpen) {
            // Focus first item when opened
            requestAnimationFrame(() => {
                firstActionRef.current?.focus();
            });
        }
    }, [isOpen]);

    // Handle inert property via effect to ensure it updates correctly
    useEffect(() => {
        if (menuRef.current) {
            // inert property works in modern browsers and React 19 handles attributes,
            // but setting property directly is safer for dynamic updates in some envs
            menuRef.current.inert = !isOpen;
        }
    }, [isOpen]);

    // Handle closing and returning focus
    const handleClose = () => {
        setIsOpen(false);
        triggerRef.current?.focus();
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9997] animate-in fade-in duration-200"
                    onClick={handleClose}
                    aria-hidden="true" // Decorative overlay
                />
            )}

            {/* Menu */}
            <div
                ref={menuRef}
                role="dialog"
                aria-modal="true"
                aria-label="Ações Rápidas"
                className={`fixed bottom-24 right-6 z-[9998] transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
                }`}
            >
                <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl p-2 min-w-[200px]">
                    <div className="px-3 py-2 border-b border-zinc-800/50 flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider" id="quick-actions-title">Ações Rápidas</span>
                        <button
                            onClick={handleClose}
                            className="p-1 hover:bg-zinc-800 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
                            aria-label="Fechar menu"
                        >
                            <X size={14} className="text-zinc-500" aria-hidden="true" />
                        </button>
                    </div>
                    <div className="py-1" role="menu" aria-labelledby="quick-actions-title">
                        {actions.map((action, index) => (
                            <button
                                key={index}
                                ref={index === 0 ? firstActionRef : null}
                                onClick={action.onClick}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-800/50 transition-colors group focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
                                role="menuitem"
                            >
                                <action.icon size={18} className={`${action.color} group-hover:scale-110 transition-transform`} strokeWidth={2} aria-hidden="true" />
                                <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Trigger Button */}
            <button
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup="dialog"
                aria-controls="quick-actions-menu"
                aria-label={isOpen ? "Fechar ações rápidas" : "Abrir ações rápidas"}
                className={`fixed bottom-6 right-6 z-[9998] w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none ${isOpen
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30 scale-110'
                    : 'bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white hover:border-zinc-700'
                    }`}
            >
                {isOpen ? <X size={20} strokeWidth={2.5} aria-hidden="true" /> : <Zap size={20} strokeWidth={2.5} aria-hidden="true" />}
            </button>
        </>
    );
}
