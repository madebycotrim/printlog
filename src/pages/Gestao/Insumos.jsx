import React, { useState, useEffect, useMemo, useDeferredValue } from "react";
import { Plus, Search, X, Trash2, AlertTriangle, PackageSearch, Loader2, Layers, Box, Zap, Hammer, Link, Edit2, History } from "lucide-react";

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
import ModalHistoricoInsumo from "../../features/insumos/components/ModalHistoricoInsumo";
import StatusInsumos from "../../features/insumos/components/statusInsumos";
import InsumoFilters from "../../features/insumos/components/InsumoFilters";
import { SupplyCard } from "../../features/insumos/components/SupplyCard";

// LÓGICA
import { useSupplyStore } from "../../features/insumos/logic/supplies";

export default function InsumosPage() {
    const [busca, setBusca] = useState("");
    const deferredBusca = useDeferredValue(busca);

    // Filtros e View Mode
    const [viewMode, setViewMode] = useState("grid");
    const [filters, setFilters] = useState({
        lowStock: false,
        categories: []
    });

    // Definição das Categorias com Ícones
    const CATEGORIES = [
        { id: 'Todos', label: 'Geral', icon: Layers },
        { id: 'embalagem', label: 'Embalagens', icon: Box },
        { id: 'fixacao', label: 'Fixação', icon: Link },
        { id: 'eletronica', label: 'Eletrônica', icon: Zap },
        { id: 'acabamento', label: 'Acabamento', icon: Hammer },
        { id: 'outros', label: 'Outros', icon: PackageSearch },
    ];

    const { supplies, fetchSupplies, loading, deleteSupply } = useSupplyStore();

    // Estados de Modais
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
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
        let custoReposicao = 0;

        lista.forEach(item => {
            const preco = Number(item.price) || 0;
            const estoque = Number(item.currentStock) || 0;
            const min = Number(item.minStock) || 0;

            totalValor += preco * estoque;

            if (estoque < min) {
                baixoEstoque++;
                const qtdFaltante = min - estoque;
                custoReposicao += qtdFaltante * preco;
            }

            if (estoque === 0) zerados++;
        });

        // Filtragem
        const filtrados = lista.filter(item => {
            const matchesSearch = (item.name || "").toLowerCase().includes(termo) ||
                (item.description || "").toLowerCase().includes(termo);

            // Filtro de Categoria (Multi-select)
            const rawCategory = item.category || item.categoria || 'outros';
            const itemCategory = rawCategory.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");

            // Check against lowercase IDs (filters.categories contains IDs like 'embalagem')
            const matchesCategory = filters.categories.length === 0 || filters.categories.includes(itemCategory);

            // Filtro de Baixo Estoque
            let matchesLowStock = true;
            if (filters.lowStock) {
                const stock = Number(item.currentStock || item.estoque_atual || 0);
                const min = Number(item.minStock || item.estoque_minimo || 0);
                matchesLowStock = stock < min;
            }

            return matchesSearch && matchesCategory && matchesLowStock;
        });

        return {
            itemsFiltrados: filtrados,
            stats: {
                totalValor,
                baixoEstoque,
                zerados,
                custoReposicao,
                totalItems: lista.length
            }
        };
    }, [supplies, deferredBusca, filters]);

    // HANDLERS
    const handleEdit = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleHistory = (item) => {
        setEditingItem(item);
        setIsHistoryOpen(true);
    };

    const handleDeleteClick = (item) => {
        setConfirmacaoExclusao({ aberta: true, item });
    };

    const confirmDelete = async () => {
        if (!confirmacaoExclusao.item) return;
        try {
            await deleteSupply(confirmacaoExclusao.item.id);
        } catch (_error) {
            // Handled by store
        } finally {
            setConfirmacaoExclusao({ aberta: false, item: null });
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setIsHistoryOpen(false);
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
            className="bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 border border-white/10 shadow-lg hover:shadow-xl hover:shadow-zinc-900/50 hover:border-white/20"
            variant="secondary"
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
                    accentColor="text-orange-500"
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
                            restockCost={stats.custoReposicao}
                        />
                    </div>

                    {/* BARRA DE FILTROS E VIEW MODE */}
                    <InsumoFilters
                        filters={filters}
                        setFilters={setFilters}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        categories={CATEGORIES.filter(cat =>
                            cat.id === 'Todos' || supplies.some(item => (item.category || item.categoria || 'Outros') === cat.id)
                        )}
                    />

                    {/* LISTA DE CARDS */}
                    <div className="pb-12">
                        {itemsFiltrados.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {itemsFiltrados.map(item => (
                                    <SupplyCard
                                        key={item.id}
                                        item={item}
                                        icon={CATEGORIES.find(c => c.id === item.category)?.icon}
                                        onEdit={() => handleEdit(item)}
                                        onDelete={() => handleDeleteClick(item)}
                                        onHistory={() => handleHistory(item)}
                                    />
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

            <ModalHistoricoInsumo
                isOpen={isHistoryOpen}
                onClose={handleModalClose}
                item={editingItem}
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

