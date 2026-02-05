import React, { useState, useEffect, useMemo, useDeferredValue } from "react";
import {
    Plus, PackageSearch, Loader2, Layers, Box, Zap, Hammer,
    ScanBarcode, Trash2, Link,
    Wrench, Cpu, FlaskConical, Package, Disc,
    Magnet, Droplets, Paintbrush, ShieldCheck, Ruler, Anchor, PenTool
} from "lucide-react";

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
import ModalEtiquetaInsumo from "../../features/insumos/components/ModalEtiquetaInsumo";
import StatusInsumos from "../../features/insumos/components/statusInsumos";
import InsumoFilters from "../../features/insumos/components/InsumoFilters";
import SupplyTable from "../../features/insumos/components/SupplyTable";

import ModalScanner from "../../features/scanner/components/ModalScanner";


// LÓGICA
import { useSupplyStore } from "../../features/insumos/logic/supplies";
import { normalizeString } from "../../utils/stringUtils";
import { useInsumoFilter } from "../../features/insumos/hooks/useInsumoFilter";

export default function InsumosPage() {
    const [busca, setBusca] = useState("");
    const deferredBusca = useDeferredValue(busca);


    // Filtros
    // const [viewMode, setViewMode] = useState('shelves'); // REMOVIDO
    const [filters, setFilters] = useState({
        categories: [],
        lowStock: false,
        sortOption: 'name' // 'name', 'price_asc', 'price_desc', 'stock_asc', 'stock_desc'
    });



    // -- REMOVIDO: CATEGORIAS HARDCODED --
    // Agora geramos dinamicamente baseados nos itens.

    const { supplies, fetchSupplies, loading, deleteSupply } = useSupplyStore();

    // Helper to pick category icon (Matches SupplyTable / ModalInsumo logic)
    const getCategoryIcon = (category) => {
        if (!category) return Layers; // Default Geral = Layers
        const norm = category.toLowerCase();

        // Exact matches from ModalInsumo
        if (norm.includes("geral")) return Layers;
        if (norm.includes("embalagem")) return Box;
        if (norm.includes("fixacao") || norm.includes("fixação") || norm.includes("parafu")) return Link; // Was Anchor, now Link
        if (norm.includes("eletronica") || norm.includes("eletrônica")) return Zap;
        if (norm.includes("acabamento")) return Hammer; // Was Paintbrush, now Hammer
        if (norm.includes("outros")) return PackageSearch;

        // Extra mappings for things not in strict list but common
        if (norm.includes("quim") || norm.includes("cola") || norm.includes("resina")) return FlaskConical;
        if (norm.includes("ferramenta")) return Wrench;
        if (norm.includes("cla") || norm.includes("imã") || norm.includes("magnet")) return Magnet;

        return PackageSearch; // Fallback
    };

    // Derivar Categorias dos cards existentes
    const derivedCategories = useMemo(() => {
        const uniqueCats = new Map();
        supplies.forEach(item => {
            const raw = item.category || item.categoria || 'Outros';
            const normalized = normalizeString(raw);
            // Capitalize first letter, lowercase rest for display
            const label = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();

            if (!uniqueCats.has(normalized)) {
                uniqueCats.set(normalized, label);
            }
        });

        // Ensure defined categories maintain their sort order if possible, or just alpha
        // For now alpha sort is fine
        return Array.from(uniqueCats.entries()).sort((a, b) => a[1].localeCompare(b[1])).map(([id, label]) => ({
            id: id,
            label: label,
            icon: getCategoryIcon(label)
        }));
    }, [supplies]);

    // Estados de Modais
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);

    const [consumptionItem, setConsumptionItem] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [labelItem, setLabelItem] = useState(null);

    const [confirmacaoExclusao, setConfirmacaoExclusao] = useState({ aberta: false, item: null });

    // Bulk Selection
    const [selectedItems, setSelectedItems] = useState(new Set());

    // Toast
    const { addToast } = useToastStore();

    // Prevent double-fetch/looping
    const fetchAttempted = React.useRef(false);

    useEffect(() => {
        if (!fetchAttempted.current) {
            fetchSupplies();
            fetchAttempted.current = true;
        }
    }, [fetchSupplies]); // eslint-disable-line react-hooks/exhaustive-deps



    // LÓGICA DE ESTATÍSTICAS E FILTRAGEM
    const { stats, filteredList } = useInsumoFilter(supplies, deferredBusca, filters);

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

    const handleLabelClick = (item) => {
        setLabelItem(item);
        setIsLabelModalOpen(true);
    };

    const handleDeleteClick = (item) => {
        setConfirmacaoExclusao({ aberta: true, item });
    };

    const confirmDelete = async () => {
        if (!confirmacaoExclusao.item) return;
        try {
            await deleteSupply(confirmacaoExclusao.item.id);
            addToast('Insumo removido com sucesso.', 'success');
        } catch (_error) {
            addToast('Erro ao remover insumo.', 'error');
        } finally {
            setConfirmacaoExclusao({ aberta: false, item: null });
        }
    };

    const handleBulkDelete = async () => {
        if (selectedItems.size === 0) return;

        if (!window.confirm(`Tem certeza que deseja excluir ${selectedItems.size} itens? ESTA AÇÃO NÃO PODE SER DESFEITA.`)) return;

        let successCount = 0;
        let failCount = 0;
        const itemsToDelete = Array.from(selectedItems);

        // TODO: Implement bulk delete endpoint if performance becomes an issue
        for (const id of itemsToDelete) {
            try {
                await deleteSupply(id);
                successCount++;
            } catch (e) {
                console.error("Failed to delete", id);
                failCount++;
            }
        }

        if (successCount > 0) {
            addToast(`${successCount} itens removidos.`, 'success');
            setSelectedItems(new Set());
        }
        if (failCount > 0) {
            addToast(`Falha ao remover ${failCount} itens.`, 'error');
        }
    };

    const handleScan = (codigo) => {
        const item = supplies.find(s => s.id === codigo);
        if (item) {
            setIsScannerOpen(false);
            setEditingItem(item);
            setIsModalOpen(true);
            addToast(`${item.name} localizado com sucesso.`, 'success');
        } else {
            addToast('Nenhum insumo encontrado com este código.', 'error');
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setIsHistoryOpen(false);
        setIsShoppingListOpen(false);
        setConsumptionItem(null);
        setEditingItem(null);
        setIsScannerOpen(false);
        setIsLabelModalOpen(false);
        setLabelItem(null);
    };

    if (loading && supplies.length === 0) return (
        <div className="flex h-screen items-center justify-center bg-zinc-950">
            <Loader2 className="animate-spin text-sky-500" size={40} />
        </div>
    );

    // Header Controls
    const headerActions = (
        <div className="flex items-center gap-2">

            {/* Bulk Delete Action */}
            {selectedItems.size > 0 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 mr-2">
                    <button
                        onClick={handleBulkDelete}
                        className="flex items-center gap-2 px-3 py-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 transition-all font-bold uppercase text-[10px] shadow-sm hover:shadow-rose-900/10"
                    >
                        <Trash2 size={14} strokeWidth={2.5} />
                        <span className="hidden sm:inline">Excluir ({selectedItems.size})</span>
                    </button>
                </div>
            )}

            <Button
                onClick={() => setIsScannerOpen(true)}
                className="bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 border border-white/10 shadow-lg hover:shadow-xl hover:shadow-zinc-900/50 w-11 h-11"
                variant="secondary"
                size="icon"
                icon={ScanBarcode}
            />
            <Button
                onClick={() => setIsShoppingListOpen(true)}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 shadow-lg"
                variant="secondary"
                icon={PackageSearch}
            >
                Lista
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
                        onLowStockClick={() => setFilters(prev => ({ ...prev, lowStock: !prev.lowStock }))}
                        onCriticalClick={() => setFilters(prev => ({ ...prev, lowStock: true }))} // Critical is subset of low stock
                        onTotalClick={() => setFilters(prev => ({ ...prev, lowStock: false, categories: [] }))}
                    />


                </div>

                {/* BARRA DE FILTROS E VIEW MODE */}
                {/* BARRA DE FILTROS */}
                <InsumoFilters
                    filters={filters}
                    setFilters={setFilters}
                    categories={derivedCategories}
                />

                {/* VISUALIZAÇÃO (TABELA APENAS) */}
                <div className="pb-12">
                    {/* VISUALIZAÇÃO (TABELA APENAS) */}
                    <div className="pb-12">
                        {filteredList.length > 0 ? (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <SupplyTable
                                    items={filteredList}
                                    onEdit={handleEdit}
                                    onDelete={handleDeleteClick}
                                    onHistory={handleHistory}
                                    onQuickConsume={handleQuickConsumption}
                                    onLabel={handleLabelClick}
                                    sortOption={filters.sortOption}
                                    onSortChange={(sort) => setFilters(prev => ({ ...prev, sortOption: sort }))}
                                    selectedItems={selectedItems}
                                    onSelectionChange={setSelectedItems}
                                />
                            </div>
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

            <ModalScanner
                isOpen={isScannerOpen}
                onClose={handleModalClose}
                onScan={handleScan}
            />

            <ModalEtiquetaInsumo
                isOpen={isLabelModalOpen}
                onClose={handleModalClose}
                item={labelItem}
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
