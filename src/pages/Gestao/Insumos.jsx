import React, { useState, useEffect, useMemo, useDeferredValue } from "react";
import { Plus, Search, X, Trash2, AlertTriangle, PackageSearch, Loader2, Layers, Box, Zap, Hammer, Link, Edit2 } from "lucide-react";

// LAYOUT E COMPONENTES GLOBAIS
import ManagementLayout from "../../layouts/ManagementLayout";
import PageHeader from "../../components/ui/PageHeader";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { useToastStore } from "../../stores/toastStore";

// COMPONENTES DA FUNCIONALIDADE
import DataCard from "../../components/ui/DataCard";
import Button from "../../components/ui/Button";
import ConfirmModal from "../../components/ui/ConfirmModal";
import ModalInsumo from "../../features/insumos/components/ModalInsumo";
import StatusInsumos from "../../features/insumos/components/statusInsumos";

// LÓGICA
import { useSupplyStore } from "../../features/insumos/logic/supplies";

export default function InsumosPage() {
    const [busca, setBusca] = useState("");
    const deferredBusca = useDeferredValue(busca);
    const [activeCategory, setActiveCategory] = useState("Todos");

    // Definição das Categorias com Ícones
    const CATEGORIES = [
        { id: 'Todos', label: 'Geral', icon: Layers },
        { id: 'Embalagem', label: 'Embalagens', icon: Box },
        { id: 'Fixação', label: 'Fixação', icon: Link },
        { id: 'Eletrônica', label: 'Eletrônica', icon: Zap },
        { id: 'Acabamento', label: 'Acabamento', icon: Hammer },
        { id: 'Outros', label: 'Outros', icon: PackageSearch },
    ];

    const { supplies, fetchSupplies, loading, deleteSupply } = useSupplyStore();

    // Estados de Modais
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [confirmacaoExclusao, setConfirmacaoExclusao] = useState({ aberta: false, item: null });

    // Toast
    const { addToast } = useToastStore();

    const showToast = (message, type) => {
        addToast(message, type);
    };

    useEffect(() => {
        fetchSupplies();
    }, [fetchSupplies]);

    // LÓGICA DE ESTATÍSTICAS E FILTRAGEM
    const { itemsFiltrados, stats } = useMemo(() => {
        const termo = deferredBusca.toLowerCase().trim();
        const lista = Array.isArray(supplies) ? supplies : [];

        // Estatísticas
        let totalValor = 0;
        let baixoEstoque = 0;
        let zerados = 0;

        lista.forEach(item => {
            const preco = Number(item.price) || 0;
            const estoque = Number(item.currentStock) || 0;
            const min = Number(item.minStock) || 0;

            totalValor += preco * estoque;
            if (estoque < min) baixoEstoque++;
            if (estoque === 0) zerados++;
        });

        // Filtragem
        const filtrados = lista.filter(item => {
            const matchesSearch = (item.name || "").toLowerCase().includes(termo) ||
                (item.description || "").toLowerCase().includes(termo);

            const itemCategory = item.category || 'Outros';
            const matchesCategory = activeCategory === 'Todos' || itemCategory === activeCategory;

            return matchesSearch && matchesCategory;
        });

        return {
            itemsFiltrados: filtrados,
            stats: {
                totalValor,
                baixoEstoque,
                zerados,
                totalItems: lista.length
            }
        };
    }, [supplies, deferredBusca, activeCategory]);

    // HANDLERS
    const handleEdit = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (item) => {
        setConfirmacaoExclusao({ aberta: true, item });
    };

    const confirmDelete = async () => {
        if (!confirmacaoExclusao.item) return;
        try {
            await deleteSupply(confirmacaoExclusao.item.id);
            showToast("Insumo removido com sucesso!", 'success');
        } catch (_error) {
            showToast("Erro ao remover insumo.", 'error');
        } finally {
            setConfirmacaoExclusao({ aberta: false, item: null });
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    if (loading && supplies.length === 0) return (
        <div className="flex h-screen items-center justify-center bg-zinc-950">
            <Loader2 className="animate-spin text-sky-500" size={40} />
        </div>
    );

    const novoInsumoButton = (
        <Button
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="bg-orange-500 hover:bg-orange-400 text-zinc-950 shadow-lg shadow-orange-900/40"
            variant="custom"
            icon={Plus}
        >
            Novo
        </Button>
    );

    return (
        <ManagementLayout>
            <div className="p-8 xl:p-12 max-w-[1600px] mx-auto w-full space-y-8 animate-in fade-in duration-500">
                <PageHeader
                    title="Meus Insumos"
                    subtitle="Gestão de Materiais Extras"
                    searchQuery={busca}
                    onSearchChange={setBusca}
                    placeholder="BUSCAR INSUMO..."
                    actionButton={novoInsumoButton}
                />

                <div className="space-y-8">
                    <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                        <StatusInsumos
                            totalItems={stats.totalItems}
                            valorTotal={stats.totalValor}
                            lowStockCount={stats.baixoEstoque}
                            itemsWithoutStock={stats.zerados}
                        />
                    </div>

                    {/* ABAS DE NAVEGAÇÃO POR CATEGORIA */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                        {CATEGORIES.map(cat => {
                            const isActive = activeCategory === cat.id;
                            const Icon = cat.icon;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`
                                        flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all duration-300 shrink-0
                                        ${isActive
                                            ? 'bg-zinc-800 border-zinc-700 text-white shadow-lg shadow-black/20'
                                            : 'bg-zinc-950/40 border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                                        }
                                    `}
                                >
                                    <Icon size={14} className={isActive ? "text-orange-500" : "opacity-70"} />
                                    <span className={`text-[11px] font-bold uppercase tracking-wider ${isActive ? '' : ''}`}>
                                        {cat.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* LISTA DE CARDS */}
                    <div className="pb-12">
                        {itemsFiltrados.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {itemsFiltrados.map(item => (
                                    <DataCard
                                        key={item.id}
                                        title={item.name}
                                        subtitle={`ID: ${item?.id?.slice?.(0, 8) || '...'}`}
                                        icon={CATEGORIES.find(c => c.id === item.category)?.icon || PackageSearch}
                                        badge={item.category || 'Geral'}
                                        color="orange"
                                        onClick={() => handleEdit(item)}
                                        headerActions={
                                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    onClick={() => handleEdit(item)}
                                                    variant="ghost"
                                                    size="xs"
                                                    className="w-8 h-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800"
                                                    icon={Edit2}
                                                />
                                                <Button
                                                    onClick={() => handleDeleteClick(item)}
                                                    variant="ghost"
                                                    size="xs"
                                                    className="w-8 h-8 p-0 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10"
                                                    icon={Trash2}
                                                />
                                            </div>
                                        }
                                    >
                                        <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                                            <div className="bg-zinc-950/50 p-2.5 rounded-lg border border-white/5">
                                                <span className="block text-[10px] text-zinc-500 uppercase font-black tracking-wider mb-0.5">Preço</span>
                                                <span className="text-emerald-400 font-mono font-bold">R$ {Number(item.price).toFixed(2)}</span>
                                            </div>
                                            <div className="bg-zinc-950/50 p-2.5 rounded-lg border border-white/5">
                                                <span className="block text-[10px] text-zinc-500 uppercase font-black tracking-wider mb-0.5">Estoque</span>
                                                <span className="text-zinc-200 font-mono font-bold">{item.currentStock} <span className="text-[10px] text-zinc-600">{item.unit}</span></span>
                                            </div>
                                        </div>
                                    </DataCard>
                                ))}
                            </div>
                        ) : (
                            !loading && (
                                <EmptyState
                                    title="Nenhum insumo encontrado"
                                    description="Adicione novos itens para controlar seu estoque."
                                    icon={PackageSearch}
                                />
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* --- MODAIS --- */}

            <ModalInsumo
                isOpen={isModalOpen}
                onClose={handleModalClose}
                editingItem={editingItem}
            />

            {/* POPUP DE CONFIRMAÇÃO DE EXCLUSÃO (UNIFICADO) */}
            <ConfirmModal
                isOpen={confirmacaoExclusao.aberta}
                onClose={() => setConfirmacaoExclusao({ aberta: false, item: null })}
                onConfirm={confirmDelete}
                title="Excluir Insumo?"
                message={
                    <span>
                        Você está prestes a remover permanentemente o insumo <br />
                        <span className="text-zinc-100 font-bold uppercase tracking-tight">"{confirmacaoExclusao.item?.name}"</span>
                    </span>
                }
                description="Atenção: Esta ação não pode ser desfeita."
                confirmText="Confirmar Exclusão"
                isDestructive
            />
        </ManagementLayout>
    );
}

