import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, FolderOpen, Users, Printer, ChevronRight, X, Command } from 'lucide-react';
import { useLocation } from 'wouter';
import { useProjectsStore } from '../features/projetos/logic/projects';
import { useClientStore } from '../features/clientes/logic/clients';
import { usePrinters } from '../features/impressoras/logic/printerQueries';

export default function GlobalSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [, setLocation] = useLocation();
    const inputRef = useRef(null);
    const listRef = useRef(null);

    const { projects = [] } = useProjectsStore();
    const { clients = [] } = useClientStore();
    const { data: printers = [] } = usePrinters();

    // Filtragem
    const results = useMemo(() => {
        if (!query.trim()) return [];
        const termo = query.toLowerCase();

        const pResults = (projects || []).filter(p => p?.label?.toLowerCase().includes(termo)).map(p => ({
            type: 'project',
            id: p.id,
            label: p.label,
            sub: p.data?.status,
            icon: FolderOpen,
            path: '/projetos' // Idealmente abriria o modal direto
        })).slice(0, 5);

        const cResults = (clients || []).filter(c => c?.nome?.toLowerCase().includes(termo)).map(c => ({
            type: 'client',
            id: c.id,
            label: c.nome,
            sub: c.empresa,
            icon: Users,
            path: '/clientes'
        })).slice(0, 5);

        const hResults = (printers || []).filter(h => h?.nome?.toLowerCase().includes(termo)).map(h => ({
            type: 'printer',
            id: h.id,
            label: h.nome,
            sub: h.marca,
            icon: Printer,
            path: '/impressoras' // Ou modal
        })).slice(0, 5);

        return [...pResults, ...cResults, ...hResults];

    }, [query, projects, clients, printers]);

    // Toggle Modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') setIsOpen(false);
        };

        const handleOpenSearch = () => setIsOpen(true);

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('open-global-search', handleOpenSearch);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('open-global-search', handleOpenSearch);
        };
    }, []);

    // Focus Input & Reset
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
        } else {
            setQuery("");
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Reset selection when query changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    // Scroll selected into view
    useEffect(() => {
        if (listRef.current && isOpen && results.length > 0) {
            // +1 because the first child is the "Resultados" span
            const selectedElement = listRef.current.children[selectedIndex + 1];
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [selectedIndex, isOpen, results.length]);

    const handleKeyDown = (e) => {
        if (results.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const item = results[selectedIndex];
            if (item) handleSelect(item);
        }
    };



    const handleSelect = (item) => {
        if (!item?.path) return;
        // Navegação simples por enquanto
        // Futuramente poderia abrir o modal específico passando state no location
        setLocation(item.path);
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] bg-zinc-950/80 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
        >
            <div
                className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-top-4 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Input Area */}
                <div className="flex items-center px-4 py-4 border-b border-zinc-800 bg-zinc-900/50">
                    <Search className="text-zinc-500 mr-3" size={20} />
                    <input
                        ref={inputRef}
                        onKeyDown={handleKeyDown}
                        type="text"
                        placeholder="Busque por projetos, clientes ou impressoras..."
                        className="flex-1 bg-transparent border-none outline-none text-zinc-100 placeholder-zinc-500 text-lg h-8"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                        <span className="hidden md:flex items-center gap-1 px-2 py-1 rounded bg-zinc-800 text-[10px] text-zinc-400 font-bold border border-zinc-700">
                            ESC
                        </span>
                        <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Results Area */}
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                    {results.length > 0 ? (
                        <div className="space-y-1" ref={listRef}>
                            <span className="px-3 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
                                Resultados
                            </span>
                            {results.map((item, index) => {
                                const Icon = item.icon;
                                const isSelected = index === selectedIndex;
                                return (
                                    <button
                                        key={`${item.type}-${item.id}`}
                                        onClick={() => handleSelect(item)}
                                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group text-left group ${isSelected ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 hover:text-white'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-lg bg-zinc-800 border border-zinc-700 group-hover:bg-zinc-700/50 group-hover:border-zinc-600 transition-colors ${item.type === 'project' ? 'text-amber-500' : item.type === 'client' ? 'text-sky-500' : 'text-emerald-500'}`}>
                                            {Icon && <Icon size={18} />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-zinc-200 group-hover:text-white">{item.label}</h4>
                                            {item.sub && <span className="text-xs text-zinc-500 uppercase tracking-wide group-hover:text-zinc-400">{item.sub}</span>}
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ChevronRight size={16} className="text-zinc-500 group-hover:text-white" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-zinc-600">
                            {query ? (
                                <>
                                    <FolderOpen size={48} strokeWidth={1} className="mb-4 opacity-20" />
                                    <p className="text-sm">Nenhum resultado para "{query}"</p>
                                </>
                            ) : (
                                <>
                                    <Command size={48} strokeWidth={1} className="mb-4 opacity-20" />
                                    <p className="text-sm">Digite para pesquisar...</p>
                                    <div className="flex gap-2 mt-4 text-[10px] uppercase font-bold text-zinc-700">
                                        <span className="bg-zinc-800/50 px-2 py-1 rounded">Projetos</span>
                                        <span className="bg-zinc-800/50 px-2 py-1 rounded">Clientes</span>
                                        <span className="bg-zinc-800/50 px-2 py-1 rounded">Impressoras</span>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex justify-between items-center text-[10px] text-zinc-500 font-medium">
                    <span>
                        Navegue com <kbd className="font-sans bg-zinc-800 px-1 rounded mx-1">↑</kbd> <kbd className="font-sans bg-zinc-800 px-1 rounded mx-1">↓</kbd>
                    </span>
                    <span>
                        Selecionar <kbd className="font-sans bg-zinc-800 px-1 rounded mx-1">Enter</kbd>
                    </span>
                </div>
            </div>
        </div>
    );
}
