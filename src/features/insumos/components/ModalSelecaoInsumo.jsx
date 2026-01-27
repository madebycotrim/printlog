import React, { useState, useMemo } from "react";
import { Search, Check, Box, CheckCircle2, Wrench, Package } from "lucide-react";
import { useSupplyStore } from "../logic/supplies";
import Modal from "../../../components/ui/Modal";

export default function ModalSelecaoInsumo({ isOpen, onClose, onConfirm }) {
    const { supplies = [] } = useSupplyStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);

    // Filtra insumos
    const filteredSupplies = useMemo(() => {
        if (!searchTerm) return supplies;
        const lower = searchTerm.toLowerCase();
        return supplies.filter(s =>
            s.name.toLowerCase().includes(lower) ||
            s.category?.toLowerCase().includes(lower) ||
            s.brand?.toLowerCase().includes(lower)
        );
    }, [supplies, searchTerm]);

    // Toggle seleção
    const toggleSelection = (id) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const handleConfirm = () => {
        const selectedItems = supplies.filter(s => selectedIds.includes(s.id));
        onConfirm(selectedItems);
        onClose();
        setSelectedIds([]); // Limpa após confirmar
    };

    // FOOTER
    const footerContent = (
        <div className="flex justify-between items-center w-full">
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
                        onConfirm([{ id: 'manual', name: 'Item Manual', category: 'Geral', brand: '', price: 0 }]);
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
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Seleção de Insumos"
            subtitle="Escolha os itens adicionais para este projeto"
            icon={Box}
            footer={footerContent}
            maxWidth="max-w-4xl"
            padding="p-0"
            color="sky"
        >
            <div className="flex flex-col h-full">
                {/* SEARCH BAR - STICKY */}
                <div className="px-8 py-4 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nome, categoria ou marca..."
                            className="w-full h-12 pl-12 pr-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-[13px] font-bold text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all uppercase"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                {/* CONTENT GRID */}
                <div className="p-8 pb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredSupplies.map(item => {
                            const isSelected = selectedIds.includes(item.id);

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

                                    {/* ICON MINI */}
                                    <div className="shrink-0 w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                                        <Wrench size={20} />
                                    </div>

                                    {/* INFO */}
                                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded w-fit
                                            ${isSelected ? "bg-sky-500/20 text-sky-300" : "bg-zinc-800/50 text-zinc-500"}`}>
                                            {item.category || "Geral"}
                                        </span>
                                        <div>
                                            <h4 className={`text-[13px] font-black uppercase truncate leading-tight 
                                                ${isSelected ? "text-zinc-100" : "text-zinc-400 group-hover:text-zinc-200"}`}>
                                                {item.name}
                                            </h4>
                                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
                                                {item.brand || "---"}
                                            </span>
                                        </div>

                                        <div className="mt-2 flex items-baseline gap-1">
                                            <span className="text-[11px] font-mono font-bold text-zinc-300">
                                                R$ {Number(item.price).toFixed(2)}
                                            </span>
                                            <span className="text-[9px] font-bold text-zinc-600 uppercase">
                                                / UN
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {filteredSupplies.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 text-zinc-500 gap-4 opacity-50">
                            <Package size={48} strokeWidth={1} />
                            <p className="text-xs font-bold uppercase tracking-widest">Nenhum insumo encontrado</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
