import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Search, Check, Users, User, CheckCircle2, Building2, Phone, Mail } from "lucide-react";
import { useClientStore } from "../logic/clients";

export default function ModalSelecaoCliente({ isOpen, onClose, onConfirm, onCreateNew }) {
    const { clients = [], fetchClients } = useClientStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedId, setSelectedId] = useState(null);

    // Garante que a lista esteja atualizada ao abrir
    useEffect(() => {
        if (isOpen) fetchClients();
    }, [isOpen, fetchClients]);

    // Filtra clientes
    const filteredClients = useMemo(() => {
        if (!searchTerm) return clients;
        const lower = searchTerm.toLowerCase();
        return clients.filter(c =>
            c.nome.toLowerCase().includes(lower) ||
            (c.empresa && c.empresa.toLowerCase().includes(lower)) ||
            (c.email && c.email.toLowerCase().includes(lower))
        );
    }, [clients, searchTerm]);

    const handleConfirm = () => {
        if (selectedId) {
            onConfirm(selectedId);
            onClose();
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[85vh] animate-in zoom-in-95 duration-200">

                {/* HEADER */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-800 bg-zinc-900/50">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-xl font-black text-zinc-100 uppercase tracking-tight flex items-center gap-3">
                            <Users className="text-sky-500" size={24} />
                            Seleção de Cliente
                        </h2>
                        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">
                            Para quem é este projeto?
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
                            placeholder="Buscar por nome, empresa ou email..."
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
                        {filteredClients.map(client => {
                            const isSelected = selectedId === client.id;

                            return (
                                <button
                                    key={client.id}
                                    onClick={() => setSelectedId(client.id)}
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
                                        {client.empresa ? <Building2 size={20} /> : <User size={20} />}
                                    </div>

                                    {/* INFO */}
                                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded w-fit
                                            ${isSelected ? "bg-sky-500/20 text-sky-300" : "bg-zinc-800/50 text-zinc-500"}`}>
                                            {client.empresa ? "PJ / Empresa" : "Pessoa Física"}
                                        </span>
                                        <div>
                                            <h4 className={`text-[13px] font-black uppercase truncate leading-tight 
                                                ${isSelected ? "text-zinc-100" : "text-zinc-400 group-hover:text-zinc-200"}`}>
                                                {client.nome}
                                            </h4>
                                            {client.empresa && (
                                                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block truncate">
                                                    {client.empresa}
                                                </span>
                                            )}
                                        </div>

                                        {(client.telefone || client.email) && (
                                            <div className="mt-2 flex flex-col gap-0.5 text-[9px] font-medium text-zinc-500">
                                                {client.telefone && (
                                                    <div className="flex items-center gap-1.5 truncate">
                                                        <Phone size={10} /> {client.telefone}
                                                    </div>
                                                )}
                                                {client.email && (
                                                    <div className="flex items-center gap-1.5 truncate">
                                                        <Mail size={10} /> {client.email}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {filteredClients.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-4 opacity-50">
                            <Users size={48} strokeWidth={1} />
                            <p className="text-xs font-bold uppercase tracking-widest">Nenhum cliente encontrado</p>
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="shrink-0 p-6 border-t border-zinc-800 bg-zinc-900/80 backdrop-blur-xl flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                            Selecionado:
                        </span>
                        <span className="px-3 py-1 rounded-full bg-zinc-800 text-[11px] font-mono font-bold text-zinc-200">
                            {selectedId ? "1 Cliente" : "Nenhum"}
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
                            onClick={onCreateNew}
                            className="px-6 h-12 rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-500 text-[11px] font-black uppercase tracking-wider hover:bg-sky-500/20 transition-all flex items-center gap-2"
                        >
                            <User size={16} />
                            Novo
                        </button>

                        <button
                            onClick={handleConfirm}
                            disabled={!selectedId}
                            className="px-8 h-12 rounded-xl bg-sky-500 text-white text-[11px] font-black uppercase tracking-wider shadow-lg shadow-sky-500/20 hover:bg-sky-400 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                        >
                            <CheckCircle2 size={16} />
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
