import React, { useState } from 'react';
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

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    aria-hidden="true"
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9997] animate-in fade-in duration-200"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Menu */}
            <div
                id="quick-actions-menu"
                role="dialog"
                aria-modal="true"
                aria-label="Ações Rápidas"
                className={`fixed bottom-6 right-6 z-[9998] transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
                }`}
            >
                <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl p-2 min-w-[200px]">
                    <div className="px-3 py-2 border-b border-zinc-800/50 flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Ações Rápidas</span>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-zinc-800 rounded-lg transition-colors"
                            aria-label="Fechar menu"
                        >
                            <X size={14} className="text-zinc-500" />
                        </button>
                    </div>
                    <div className="py-1">
                        {actions.map((action, index) => (
                            <button
                                key={index}
                                onClick={action.onClick}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-800/50 transition-colors group"
                            >
                                <action.icon size={18} className={`${action.color} group-hover:scale-110 transition-transform`} strokeWidth={2} />
                                <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Ações rápidas"
                aria-expanded={isOpen}
                aria-controls="quick-actions-menu"
                className={`fixed bottom-6 right-6 z-[9998] w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${isOpen
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30 scale-110'
                    : 'bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white hover:border-zinc-700'
                    }`}
            >
                {isOpen ? <X size={20} strokeWidth={2.5} /> : <Zap size={20} strokeWidth={2.5} />}
            </button>
        </>
    );
}
