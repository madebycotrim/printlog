import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { HelpCircle, RotateCcw, List, Trash2 } from 'lucide-react';
import { useTour } from '../contexts/TourContext';

export default function TourTrigger() {
    const [isOpen, setIsOpen] = useState(false);
    const [location] = useLocation();
    const { startTour, resetTour } = useTour();
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleRestartCurrent = () => {
        resetTour(location);
        setTimeout(() => {
            startTour(location);
        }, 100);
        setIsOpen(false);
    };

    const handleResetAll = () => {
        if (window.confirm('Tem certeza que deseja resetar o progresso de todos os tutoriais?')) {
            resetTour();
            setIsOpen(false);
        }
    };

    const tourPages = [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/calculadora', label: 'Calculadora' },
        { path: '/impressoras', label: 'Impressoras' },
        { path: '/filamentos', label: 'Filamentos' }
    ];

    const handleStartSpecific = (path) => {
        resetTour(path);
        if (location !== path) {
            window.location.href = path;
        } else {
            setTimeout(() => {
                startTour(path);
            }, 100);
        }
        setIsOpen(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50" ref={dropdownRef}>
            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="p-3 border-b border-zinc-800">
                        <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Tutoriais Interativos</h3>
                    </div>

                    <div className="p-2">
                        <button
                            onClick={handleRestartCurrent}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-xs font-bold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all group"
                        >
                            <RotateCcw size={14} className="text-sky-500 group-hover:rotate-180 transition-transform duration-300" />
                            <div className="flex flex-col">
                                <span>Reiniciar Tour Atual</span>
                                <span className="text-[10px] text-zinc-500 font-normal">Reveja o tutorial desta página</span>
                            </div>
                        </button>

                        <div className="h-px bg-zinc-800 my-2" />

                        <div className="space-y-1">
                            <p className="px-3 py-1 text-[9px] font-bold text-zinc-600 uppercase tracking-wider">Ver Tutorial de:</p>
                            {tourPages.map(page => (
                                <button
                                    key={page.path}
                                    onClick={() => handleStartSpecific(page.path)}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
                                >
                                    <List size={12} />
                                    {page.label}
                                </button>
                            ))}
                        </div>

                        <div className="h-px bg-zinc-800 my-2" />

                        <button
                            onClick={handleResetAll}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-all group"
                        >
                            <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
                            <div className="flex flex-col">
                                <span>Resetar Tudo</span>
                                <span className="text-[10px] text-zinc-500 font-normal">Limpar progresso completo</span>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group relative p-4 bg-sky-500 hover:bg-sky-400 rounded-full shadow-2xl shadow-sky-900/40 transition-all duration-300 hover:scale-110 active:scale-95"
                title="Ajuda e Tutoriais"
            >
                <HelpCircle size={24} className="text-white" strokeWidth={2.5} />

                {/* Pulse effect */}
                <div className="absolute inset-0 rounded-full bg-sky-400 animate-ping opacity-20" />
            </button>
        </div>
    );
}
