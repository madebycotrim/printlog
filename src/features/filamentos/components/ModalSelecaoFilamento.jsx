import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Search, Check, Layers, Package, CheckCircle2 } from "lucide-react";
import { useFilaments } from "../logic/filamentQueries";
import SpoolSideView from "./Carretel";

export default function ModalSelecaoFilamento({ isOpen, onClose, onConfirm }) {
    const { data: filamentos = [], isLoading } = useFilaments();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);

    // Filtra filamentos
    const filteredFilaments = useMemo(() => {
        if (!searchTerm) return filamentos;
        const lower = searchTerm.toLowerCase();
        return filamentos.filter(f =>
            f.nome.toLowerCase().includes(lower) ||
            f.marca?.toLowerCase().includes(lower) ||
            f.material?.toLowerCase().includes(lower)
        );
    }, [filamentos, searchTerm]);

    // Toggle seleção
    const toggleSelection = (id) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const handleConfirm = () => {
        const selectedItems = filamentos.filter(f => selectedIds.includes(f.id));
        onConfirm(selectedItems);
        onClose();
        setSelectedIds([]); // Limpa após confirmar
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[85vh] animate-in zoom-in-95 duration-200">

                {/* HEADER */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-800 bg-zinc-900/50">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-xl font-black text-zinc-100 uppercase tracking-tight flex items-center gap-3">
                            <Layers className="text-sky-500" size={24} />
                            Seleção de Materiais
                        </h2>
                        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">
                            Escolha as cores que farão parte desta impressão
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* SEARCH BAR */}
                <div className="px-8 py-4 border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-20">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nome, material ou marca..."
                            className="w-full h-12 pl-12 pr-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-[13px] font-bold text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all uppercase"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                {/* CONTENT GRID */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-zinc-950/30">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredFilaments.map(item => {
                            const isSelected = selectedIds.includes(item.id);
                            const capacidade = Math.max(1, Number(item.peso_total) || 1000);
                            const atual = Math.max(0, Number(item.peso_atual) || 0);
                            const percent = Math.round((atual / capacidade) * 100);

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => toggleSelection(item.id)}
                                    className={`relative group flex items-start gap-4 p-4 rounded-2xl border text-left transition-all duration-200
                                        ${isSelected
                                            ? "bg-sky-500/10 border-sky-500/50 shadow-[0_0_20px_-5px_rgba(14,165,233,0.3)]"
                                            : "bg-zinc-900/20 border-zinc-800/50 hover:bg-zinc-900/40 hover:border-zinc-700"}`}
                                >
                                    {/* SELECTION INDICATOR */}
                                    <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border flex items-center justify-center transition-all
                                        ${isSelected ? "bg-sky-500 border-sky-500 scale-100" : "border-zinc-700 bg-transparent scale-90 opacity-50 group-hover:opacity-100"}`}>
                                        {isSelected && <Check size={12} className="text-white" strokeWidth={4} />}
                                    </div>

                                    {/* SPOOL MINI */}
                                    <div className="shrink-0">
                                        <SpoolSideView color={item.cor_hex || "#333"} percent={percent} size={48} />
                                    </div>

                                    {/* INFO */}
                                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded w-fit
                                            ${isSelected ? "bg-sky-500/20 text-sky-300" : "bg-zinc-800/50 text-zinc-500"}`}>
                                            {item.material}
                                        </span>
                                        <div>
                                            <h4 className={`text-[13px] font-black uppercase truncate leading-tight 
                                                ${isSelected ? "text-zinc-100" : "text-zinc-400 group-hover:text-zinc-200"}`}>
                                                {item.nome}
                                            </h4>
                                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
                                                {item.marca}
                                            </span>
                                        </div>

                                        <div className="mt-2 flex items-baseline gap-1">
                                            <span className="text-[11px] font-mono font-bold text-zinc-300">
                                                {Math.round(atual)}g
                                            </span>
                                            <span className="text-[9px] font-bold text-zinc-600 uppercase">
                                                Disponíveis
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {filteredFilaments.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-4 opacity-50">
                            <Package size={48} strokeWidth={1} />
                            <p className="text-xs font-bold uppercase tracking-widest">Nenhum material encontrado</p>
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="shrink-0 p-6 border-t border-zinc-800 bg-zinc-900/80 backdrop-blur-xl flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                            Selecionados:
                        </span>
                        <span className="px-3 py-1 rounded-full bg-zinc-800 text-[11px] font-mono font-bold text-zinc-200">
                            {selectedIds.length}
                        </span>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 h-12 rounded-xl border border-zinc-800 text-[11px] font-black uppercase tracking-wider text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => {
                                onConfirm([{ id: 'manual', nome: 'Manual', material: 'PLA', marca: 'Genérico', cor_hex: '#ffffff' }]);
                                onClose();
                            }}
                            className="px-6 h-12 rounded-xl border border-zinc-700 bg-zinc-800/50 text-[11px] font-black uppercase tracking-wider text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 transition-all flex items-center gap-2"
                        >
                            <span className="w-2 h-2 rounded-full bg-zinc-500" />
                            Manual
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={selectedIds.length === 0}
                            className="px-8 h-12 rounded-xl bg-sky-500 text-white text-[11px] font-black uppercase tracking-wider shadow-lg shadow-sky-500/20 hover:bg-sky-400 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                        >
                            <CheckCircle2 size={16} />
                            Confirmar Seleção
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
