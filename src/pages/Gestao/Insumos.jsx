import React, { useState, useEffect, useMemo, useDeferredValue } from "react";
import { Plus, Search, X, Trash2, AlertTriangle, PackageSearch, Loader2, Layers, Box, Zap, Hammer, Link } from "lucide-react";

// LAYOUT E COMPONENTES GLOBAIS
import ManagementLayout from "../../layouts/ManagementLayout";
import PageHeader from "../../components/ui/PageHeader";
import Popup from "../../components/Popup";
import { useToastStore } from "../../stores/toastStore";

// COMPONENTES DA FUNCIONALIDADE
import CardInsumo from "../../features/insumos/components/cardInsumo";
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
        <button
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="
                group relative h-11 px-6 overflow-hidden bg-orange-500 hover:bg-orange-400 
                rounded-xl transition-all duration-300 active:scale-95 shadow-lg shadow-orange-900/40
                flex items-center gap-3 text-zinc-950
            "
        >
            <Plus size={16} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                Novo
            </span>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </button>
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
                                    <CardInsumo
                                        key={item.id}
                                        item={item}
                                        onEdit={handleEdit}
                                        onDelete={handleDeleteClick}
                                    />
                                ))}
                            </div>
                        ) : (
                            !loading && (
                                <div className="py-24 flex flex-col items-center justify-center border border-dashed border-zinc-800/60 rounded-[3rem] bg-zinc-950/40/5 backdrop-blur-sm">
                                    <PackageSearch size={48} strokeWidth={1} className="mb-4 text-zinc-700" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Nenhum insumo encontrado</p>
                                </div>
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
            <Popup
                isOpen={confirmacaoExclusao.aberta}
                onClose={() => setConfirmacaoExclusao({ aberta: false, item: null })}
                title="Excluir Insumo?"
                subtitle="Gestão de Insumos"
                icon={AlertTriangle}
                footer={
                    <div className="flex gap-3 w-full">
                        <button onClick={() => setConfirmacaoExclusao({ aberta: false, item: null })} className="flex-1 h-12 rounded-xl bg-zinc-950/40 border border-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:text-white">
                            Cancelar
                        </button>
                        <button onClick={confirmDelete} className="flex-1 h-12 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-900/20 flex items-center justify-center gap-2">
                            <Trash2 size={16} /> Confirmar Exclusão
                        </button>
                    </div>
                }
            >
                <div className="p-8 text-center space-y-4">
                    <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                        Você está prestes a remover permanentemente o insumo <br />
                        <span className="text-zinc-100 font-bold uppercase tracking-tight">"{confirmacaoExclusao.item?.name}"</span>
                    </p>
                    <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                        <p className="text-[10px] text-rose-500/80 font-black uppercase tracking-widest">
                            Atenção: Esta ação não pode ser desfeita.
                        </p>
                    </div>
                </div>
            </Popup>
        </ManagementLayout>
    );
}

