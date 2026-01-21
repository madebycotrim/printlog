import React, { useState, useRef, useEffect } from 'react';
import { Zap, Plus, Package, Printer, Box, Calculator } from 'lucide-react';

export default function QuickActionsMenu({ onNewProject, onNewFilament, onNewPrinter, onNewSupply }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const actions = [
        { label: 'Novo Projeto', icon: Calculator, onClick: onNewProject, color: 'sky' },
        { label: 'Adicionar Material', icon: Package, onClick: onNewFilament, color: 'rose' },
        { label: 'Registrar Impressora', icon: Printer, onClick: onNewPrinter, color: 'emerald' },
        { label: 'Cadastrar Insumo', icon: Box, onClick: onNewSupply, color: 'amber' }
    ];

    const getColorClasses = (color) => {
        const colors = {
            sky: 'text-sky-500 bg-sky-500/10 hover:bg-sky-500/20',
            rose: 'text-rose-500 bg-rose-500/10 hover:bg-rose-500/20',
            emerald: 'text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20',
            amber: 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'
        };
        return colors[color] || colors.sky;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="h-10 px-4 rounded-xl flex items-center gap-2 bg-gradient-to-br from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-lg shadow-sky-500/20 transition-all hover:scale-105 active:scale-95"
            >
                <Zap size={14} strokeWidth={2.5} />
                <span className="text-[10px] font-bold uppercase tracking-wider hidden md:inline">
                    Ações Rápidas
                </span>
                <Plus size={12} className={`transition-transform ${isOpen ? 'rotate-45' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 border-b border-zinc-800/50">
                        <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider px-2 py-1">Criar Novo</p>
                    </div>
                    {actions.map((action, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                action.onClick();
                                setIsOpen(false);
                            }}
                            className={`w-full px-3 py-2.5 flex items-center gap-3 transition-all ${getColorClasses(action.color)}`}
                        >
                            <div className="p-1.5 rounded-lg bg-zinc-900">
                                <action.icon size={14} />
                            </div>
                            <span className="text-xs font-medium text-white">{action.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
