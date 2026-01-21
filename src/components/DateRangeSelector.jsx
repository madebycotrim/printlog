import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { useDateRangeStore, presets } from '../stores/dateRangeStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DateRangeSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const { preset, setPreset } = useDateRangeStore();
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

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="h-10 px-4 rounded-xl flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-all"
            >
                <Calendar size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider hidden md:inline">
                    {presets[preset]?.label || 'Período'}
                </span>
                <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {Object.entries(presets).map(([key, value]) => (
                        <button
                            key={key}
                            onClick={() => {
                                setPreset(key);
                                setIsOpen(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left text-xs font-medium transition-colors ${preset === key
                                ? 'bg-sky-500/10 text-sky-400 border-l-2 border-sky-500'
                                : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                                }`}
                        >
                            {value.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
