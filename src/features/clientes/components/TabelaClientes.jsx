import React, { useState } from 'react';
import { Edit2, Trash2, Phone, Mail, Building2, Search, User, Clock } from 'lucide-react';

export default function TabelaClientes({ clientes, onEdit, onDelete, onViewHistory }) {
    const [busca, setBusca] = useState("");

    const filtrados = clientes.filter(c =>
        c.nome?.toLowerCase().includes(busca.toLowerCase()) ||
        c.empresa?.toLowerCase().includes(busca.toLowerCase()) ||
        c.email?.toLowerCase().includes(busca.toLowerCase())
    );

    return (
        <div className="space-y-4">
            {/* Barra de Busca */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-sky-400 transition-colors" />
                <input
                    type="text"
                    placeholder="Buscar por nome, empresa ou email..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtrados.map(cliente => (
                    <div
                        key={cliente.id}
                        className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-5 hover:border-zinc-700/50 transition-all group hover-lift relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button
                                onClick={() => onEdit(cliente)}
                                className="p-2 hover:bg-sky-500/10 text-zinc-400 hover:text-sky-400 rounded-lg transition-colors"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button
                                onClick={() => onViewHistory && onViewHistory(cliente)}
                                title="Histórico"
                                className="p-2 hover:bg-emerald-500/10 text-zinc-400 hover:text-emerald-400 rounded-lg transition-colors"
                            >
                                <Clock size={16} />
                            </button>
                            <button
                                onClick={() => onDelete(cliente.id)}
                                className="p-2 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 rounded-lg transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0">
                                <span className="text-lg font-bold text-zinc-300">
                                    {cliente.nome?.charAt(0).toUpperCase() || "?"}
                                </span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-zinc-100 truncate pr-16">{cliente.nome}</h3>
                                {cliente.empresa && (
                                    <div className="flex items-center gap-1.5 text-zinc-400 text-sm mt-0.5">
                                        <Building2 size={12} />
                                        <span>{cliente.empresa}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-zinc-400">
                            {cliente.telefone && (
                                <div className="flex items-center gap-2">
                                    <Phone size={14} className="text-zinc-600" />
                                    <span>{cliente.telefone}</span>
                                </div>
                            )}
                            {cliente.email && (
                                <div className="flex items-center gap-2">
                                    <Mail size={14} className="text-zinc-600" />
                                    <span className="truncate">{cliente.email}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {filtrados.length === 0 && (
                    <div className="col-span-full py-12 text-center text-zinc-500">
                        Nenhum cliente encontrado.
                    </div>
                )}
            </div>
        </div>
    );
}
