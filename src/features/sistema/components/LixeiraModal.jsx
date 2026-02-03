import React, { useState, useEffect, useMemo } from 'react';
import { Trash2, RefreshCw, AlertCircle, Search, CheckSquare, Square, CalendarClock, Package, Archive } from 'lucide-react';
import api from '../../../utils/api';
import { useToastStore } from '../../../stores/toastStore';
import { useQueryClient } from '@tanstack/react-query';
import SideBySideModal from '../../../components/ui/SideBySideModal';
import { UnifiedInput } from '../../../components/UnifiedInput';

export default function LixeiraModal({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('filamentos'); // filamentos, projetos
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [itemsRestaurando, setItemsRestaurando] = useState(new Set());

    // New States for "Rich" Features
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItems, setSelectedItems] = useState(new Set());

    const { addToast } = useToastStore();
    const queryClient = useQueryClient();

    // Reset selection when tab changes
    useEffect(() => {
        setSelectedItems(new Set());
        setSearchQuery('');
    }, [activeTab, isOpen]);

    useEffect(() => {
        if (isOpen) {
            fetchDeletedItems();
        }
    }, [isOpen, activeTab]);

    const fetchDeletedItems = async () => {
        setLoading(true);
        try {
            let endpoint = '';
            // Future-proofing for other types
            switch (activeTab) {
                case 'filamentos': endpoint = '/filaments?deleted=true'; break;
                case 'projetos': endpoint = '/projects?deleted=true'; break;
                // case 'insumos': endpoint = '/supplies?deleted=true'; break;
                default: endpoint = '/filaments?deleted=true';
            }

            if (endpoint) {
                const res = await api.get(endpoint);
                const data = Array.isArray(res.data) ? res.data : [];
                // Mock deletedAt if missing for demo (optional, can be removed if backend supports it)
                const enhancedData = data.map(item => ({
                    ...item,
                    deleted_at: item.deleted_at || new Date().toISOString() // Fallback current date
                }));
                setItems(enhancedData);
            }
        } catch (error) {
            console.error("Erro ao buscar lixeira:", error);
            addToast("Erro ao carregar itens deletados", "error");
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (id) => {
        if (!id) return;
        setItemsRestaurando(prev => new Set(prev).add(id));
        try {
            let endpoint = '';
            switch (activeTab) {
                case 'filamentos': endpoint = `/filaments/${id}/restore`; break;
                default: endpoint = `/filaments/${id}/restore`;
            }

            if (endpoint) {
                await api.post(endpoint);
                addToast("Item restaurado com sucesso!", "success");
                setItems(prev => prev.filter(i => i.id !== id));
                setSelectedItems(prev => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
                // Invalidate
                if (activeTab === 'filamentos') queryClient.invalidateQueries(['filamentos']);
            }
        } catch (error) {
            addToast("Erro ao restaurar item.", "error");
        } finally {
            setItemsRestaurando(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    const handleBatchRestore = async () => {
        const ids = Array.from(selectedItems);
        if (ids.length === 0) return;

        // Start animation/loading for all
        setItemsRestaurando(prev => {
            const next = new Set(prev);
            ids.forEach(id => next.add(id));
            return next;
        });

        // Parallel requests (simplified for now)
        try {
            await Promise.all(ids.map(id => {
                const endpoint = activeTab === 'filamentos' ? `/filaments/${id}/restore` : '';
                return endpoint ? api.post(endpoint) : Promise.resolve();
            }));

            addToast(`${ids.length} itens restaurados!`, "success");
            setItems(prev => prev.filter(i => !selectedItems.has(i.id)));
            setSelectedItems(new Set());
            if (activeTab === 'filamentos') queryClient.invalidateQueries(['filamentos']);
        } catch (error) {
            addToast("Erro na restauração em massa.", "error");
        } finally {
            // Clear restoring state
            setItemsRestaurando(new Set());
        }
    }

    // Filter Logic
    const filteredItems = useMemo(() => {
        if (!searchQuery) return items;
        const lower = searchQuery.toLowerCase();
        return items.filter(i =>
            i.nome?.toLowerCase().includes(lower) ||
            i.marca?.toLowerCase().includes(lower) ||
            i.material?.toLowerCase().includes(lower)
        );
    }, [items, searchQuery]);

    // Selection Logic
    const toggleSelect = (id) => {
        setSelectedItems(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedItems.size === filteredItems.length && filteredItems.length > 0) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(filteredItems.map(i => i.id)));
        }
    };

    return (
        <SideBySideModal
            isOpen={isOpen}
            onClose={onClose}
            header={{
                title: "Lixeira e Recuperação",
                subtitle: "Gerencie itens excluídos do sistema."
            }}
            sidebar={
                <div className="flex flex-col h-full w-full relative z-10 py-8 px-6">
                    {/* Info Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto bg-rose-500/10 rounded-2xl border border-rose-500/20 flex items-center justify-center mb-4 shadow-[0_0_20px_-5px_rgba(244,63,94,0.3)]">
                            <Trash2 className="text-rose-500" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Status da Lixeira</h3>
                        <p className="text-xs text-zinc-500">Política de Retenção: 30 Dias</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-3 w-full mb-8">
                        <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-500 uppercase">Total na Lixeira</span>
                            <span className="text-sm font-bold text-white">{items.length}</span>
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-500 uppercase">Selecionados</span>
                            <span className={`text-sm font-bold ${selectedItems.size > 0 ? 'text-emerald-500' : 'text-zinc-600'}`}>{selectedItems.size}</span>
                        </div>
                    </div>

                    {/* Action Button - Only shows when items selected */}
                    <div className="mt-auto w-full space-y-3">
                        <button
                            disabled={selectedItems.size === 0}
                            onClick={handleBatchRestore}
                            className={`
                                w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300
                                ${selectedItems.size > 0
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'
                                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}
                            `}
                        >
                            <RefreshCw size={14} className={itemsRestaurando.size > 0 ? "animate-spin" : ""} />
                            {itemsRestaurando.size > 0 ? "Restaurando..." : `Restaurar (${selectedItems.size})`}
                        </button>

                        <div className="p-3 bg-zinc-900/30 rounded-lg border border-zinc-800/50">
                            <p className="text-[10px] text-zinc-500 font-medium leading-relaxed text-center">
                                <AlertCircle size={10} className="inline mr-1 -mt-0.5" />
                                Itens são removidos permanentemente após o período de retenção.
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="flex flex-col h-full space-y-4">
                {/* Top Selection Tabs */}
                <div className="flex gap-4 border-b border-zinc-800/50 pb-4">
                    <button
                        onClick={() => setActiveTab('filamentos')}
                        className={`text-xs font-bold uppercase tracking-wider px-2 py-1 transition-colors ${activeTab === 'filamentos' ? 'text-white border-b-2 border-emerald-500' : 'text-zinc-600 hover:text-zinc-400'}`}
                    >
                        Filamentos
                    </button>
                    <button
                        onClick={() => setActiveTab('projetos')}
                        className={`text-xs font-bold uppercase tracking-wider px-2 py-1 transition-colors ${activeTab === 'projetos' ? 'text-white border-b-2 border-emerald-500' : 'text-zinc-600 hover:text-zinc-400'}`}
                    >
                        Projetos
                    </button>
                </div>

                {/* Toolbar: Search & Select All */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                        <input
                            type="text"
                            placeholder="Buscar itens deletados..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-2 pl-9 pr-4 text-xs font-medium text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                    </div>

                    {filteredItems.length > 0 && (
                        <button
                            onClick={toggleSelectAll}
                            className="flex items-center gap-2 px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-colors"
                        >
                            <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${selectedItems.size === filteredItems.length ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600'}`}>
                                {selectedItems.size === filteredItems.length && <CheckSquare size={10} className="text-white" />}
                            </div>
                            <span className="text-[10px] font-bold uppercase text-zinc-500">Todos</span>
                        </button>
                    )}
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-3 text-zinc-500 opacity-50">
                            <RefreshCw className="animate-spin" />
                            <span className="text-xs uppercase font-bold">Buscando Lixeira...</span>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-3 text-zinc-600 bg-zinc-900/20 rounded-xl border border-dashed border-zinc-800/50">
                            <Archive size={32} className="opacity-30" />
                            <p className="text-xs font-medium">Nenhum item encontrado.</p>
                        </div>
                    ) : (
                        filteredItems.map(item => (
                            <div
                                key={item.id}
                                className={`
                                    flex items-center justify-between p-3 rounded-xl border transition-all group
                                    ${selectedItems.has(item.id)
                                        ? 'bg-emerald-500/5 border-emerald-500/30'
                                        : 'bg-zinc-900/30 border-zinc-800/50 hover:bg-zinc-900/50 hover:border-zinc-700'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Checkbox */}
                                    <button
                                        onClick={() => toggleSelect(item.id)}
                                        className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${selectedItems.has(item.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-700 hover:border-zinc-500'}`}
                                    >
                                        {selectedItems.has(item.id) && <CheckSquare size={12} />}
                                    </button>

                                    {/* Icon */}
                                    <div
                                        className="w-9 h-9 rounded-lg flex items-center justify-center border shadow-sm font-bold text-[10px]"
                                        style={{
                                            backgroundColor: (item.cor_hex || '#71717a') + '20',
                                            borderColor: (item.cor_hex || '#71717a') + '40',
                                            color: item.cor_hex || '#71717a'
                                        }}
                                    >
                                        {activeTab === 'filamentos' ? 'FIL' : 'PRJ'}
                                    </div>

                                    {/* Info */}
                                    <div>
                                        <h4 className={`font-bold text-xs ${selectedItems.has(item.id) ? 'text-emerald-100' : 'text-zinc-300'}`}>{item.nome}</h4>
                                        <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-medium uppercase tracking-wide">
                                            <span>{item.marca}</span>
                                            <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                            <span>{item.material}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Date & Action */}
                                <div className="flex items-center gap-4">
                                    <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-900 border border-zinc-800">
                                        <CalendarClock size={10} className="text-zinc-500" />
                                        <span className="text-[9px] font-bold text-zinc-500 uppercase">-30d</span>
                                    </div>

                                    <button
                                        onClick={() => handleRestore(item.id)}
                                        disabled={itemsRestaurando.has(item.id)}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center border border-zinc-800 bg-zinc-900 hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:text-emerald-500 text-zinc-500 transition-all"
                                        title="Restaurar individualmente"
                                    >
                                        {itemsRestaurando.has(item.id) ? <RefreshCw className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </SideBySideModal>
    );
}
