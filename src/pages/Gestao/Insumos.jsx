import React, { useState, useEffect, useMemo, useDeferredValue } from "react";
import { Plus, PackageSearch, Loader2, Layers, Box, Zap, Hammer, Link } from "lucide-react";

// LAYOUT E COMPONENTES GLOBAIS
import ManagementLayout from "../../layouts/ManagementLayout";
import PageHeader from "../../components/ui/PageHeader";

import EstadoVazio from "../../components/ui/EstadoVazio";
import { useToastStore } from "../../stores/toastStore";

// COMPONENTES DA FUNCIONALIDADE

import Button from "../../components/ui/Button";
import ConfirmModal from "../../components/ui/ConfirmModal";
import ModalInsumo from "../../features/insumos/components/ModalInsumo";
import ModalHistoricoInsumo from "../../features/insumos/components/ModalHistoricoInsumo";
import ModalListaCompras from "../../features/insumos/components/ModalListaCompras";
import ModalConsumoRapido from "../../features/insumos/components/ModalConsumoRapido";
import StatusInsumos from "../../features/insumos/components/statusInsumos";
import InsumoFilters from "../../features/insumos/components/InsumoFilters";
import { SupplyRow } from "../../features/insumos/components/SupplyRow";

// LÓGICA
import { useSupplyStore } from "../../features/insumos/logic/supplies";

export default function InsumosPage() {
    const [busca, setBusca] = useState("");
    const deferredBusca = useDeferredValue(busca);


    // Filtros
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
    const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);
    const [consumptionItem, setConsumptionItem] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [confirmacaoExclusao, setConfirmacaoExclusao] = useState({ aberta: false, item: null });

    // Toast
    const { addToast } = useToastStore();

    useEffect(() => {
        fetchSupplies();
    }, [fetchSupplies]);

    // LÓGICA DE ESTATÍSTICAS E FILTRAGEM
    const { groupedItems, stats, filteredList } = useMemo(() => {
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

        // Agrupamento por Categoria
        const grupos = filtrados.reduce((acc, item) => {
            // Normaliza ID da categoria
            const rawCategory = item.category || item.categoria || 'outros';

            // Encontra a definição (Label)
            const catDef = CATEGORIES.find(c =>
                c.id.toLowerCase() === rawCategory.toLowerCase() ||
                c.label.toLowerCase() === rawCategory.toLowerCase()
            ) || CATEGORIES.find(c => c.id === 'outros');

            const label = catDef ? catDef.label : 'Geral';

            if (!acc[label]) acc[label] = [];
            acc[label].push(item);
            return acc;
        }, {});

        // Ordenar chaves das categorias
        const gruposOrdenados = Object.keys(grupos).sort().reduce((obj, key) => {
            obj[key] = grupos[key];
            return obj;
        }, {});

        return {
            groupedItems: gruposOrdenados,
            stats: {
                totalValor,
                baixoEstoque,
                zerados,
                custoReposicao,
                totalItems: lista.length
            },
            filteredList: filtrados
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

    const handleQuickConsumption = (item) => {
        setConsumptionItem(item);
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
        setIsShoppingListOpen(false);
        setConsumptionItem(null);
        setEditingItem(null);
    };

    if (loading && supplies.length === 0) return (
        <div className="flex h-screen items-center justify-center bg-zinc-950">
            <Loader2 className="animate-spin text-sky-500" size={40} />
        </div>
    );

    const headerActions = (
        <div className="flex items-center gap-2">
            <Button
                onClick={() => setIsShoppingListOpen(true)}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 shadow-lg"
                variant="secondary"
                icon={PackageSearch}
            >
                Lista de Compras
            </Button>
            <Button
                onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                className="bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 border border-white/10 shadow-lg hover:shadow-xl hover:shadow-zinc-900/50 hover:border-white/20"
                variant="secondary"
                icon={Plus}
            >
                Novo
            </Button>
        </div>
    );

    return (
        <ManagementLayout>

            <PageHeader
                title="Meus Insumos"
                subtitle="Gestão de Materiais Extras"
                accentColor="text-orange-500"
                searchQuery={busca}
                onSearchChange={setBusca}
                placeholder="BUSCAR INSUMO..."
                actionButton={headerActions}
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

                    categories={CATEGORIES.filter(cat =>
                        cat.id === 'Todos' || supplies.some(item => (item.category || item.categoria || 'Outros') === cat.id)
                    )}
                />

                {/* LISTA DE GRUPOS (VIRTUAL SHELVES) OU LISTA PLANA */}
                <div className="pb-12 space-y-12">
                    {Object.keys(groupedItems).length > 0 ? (
                        Object.entries(groupedItems).map(([categoryLabel, items]) => (
                            <div key={categoryLabel} className="relative group/shelf pt-4">

                                {/* Cabeçalho da Prateleira (Estilo RackVirtual) - Compacto para Lista */}
                                <div className="flex items-center gap-4 mb-4 ml-2">
                                    <h2 className="text-3xl font-black text-zinc-800/30 uppercase tracking-tighter select-none absolute -top-1 -left-4 -z-10 pointer-events-none">
                                        {categoryLabel}
                                    </h2>
                                    <div className="flex items-center gap-3 relative z-10">
                                        <span className="text-xl font-bold text-zinc-200 tracking-tight">{categoryLabel}</span>
                                        <span className="px-1.5 py-0.5 rounded-md bg-zinc-800/50 border border-white/5 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                                            {items.length} {items.length === 1 ? 'Item' : 'Itens'}
                                        </span>
                                        <div className="h-px flex-1 bg-white/5 min-w-[50px]" />
                                    </div>
                                </div>

                                {/* Lista de Itens */}
                                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700">

                                    {items.map(item => (
                                        <SupplyRow
                                            key={item.id}
                                            item={item}
                                            icon={CATEGORIES.find(c => c.id === item.category)?.icon}
                                            onEdit={() => handleEdit(item)}
                                            onDelete={() => handleDeleteClick(item)}
                                            onHistory={() => handleHistory(item)}
                                            onQuickConsume={() => handleQuickConsumption(item)}
                                        />
                                    ))}

                                    <button
                                        onClick={() => {
                                            const catId = CATEGORIES.find(c => c.label === categoryLabel)?.id;
                                            setEditingItem({ category: catId });
                                            setIsModalOpen(true);
                                        }}
                                        className="
                                            group/add relative w-full flex items-center justify-center p-3 gap-2
                                            bg-[#09090b]/20 backdrop-blur-sm border border-dashed border-zinc-800 rounded-xl
                                            hover:bg-[#09090b]/60 hover:border-zinc-700 hover:shadow-lg transition-all duration-300
                                        "
                                    >
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 group-hover/add:border-zinc-600 transition-colors">
                                            <Plus size={12} className="text-zinc-600 group-hover/add:text-zinc-300" />
                                        </div>
                                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest group-hover/add:text-zinc-400">
                                            Adicionar em {categoryLabel}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        !loading && (
                            <EstadoVazio
                                title="Nenhum insumo encontrado"
                                description="Tente ajustar os filtros ou adicione um novo material."
                                icon={PackageSearch}
                            />
                        )
                    )}
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

            <ModalListaCompras
                isOpen={isShoppingListOpen}
                onClose={handleModalClose}
                supplies={supplies}
            />

            <ModalConsumoRapido
                isOpen={!!consumptionItem}
                onClose={handleModalClose}
                item={consumptionItem}
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
