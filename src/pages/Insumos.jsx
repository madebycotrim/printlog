import React, { useState, useEffect, useMemo, useDeferredValue } from "react";
import { Plus, Search, X, Trash2, AlertTriangle, PackageSearch, Loader2 } from "lucide-react";

// LAYOUT E COMPONENTES GLOBAIS
import MainSidebar from "../layouts/mainSidebar";
import Toast from "../components/Toast";
import Popup from "../components/Popup";

// COMPONENTES DA FUNCIONALIDADE
import CardInsumo from "../features/insumos/components/cardInsumo";
import ModalInsumo from "../features/insumos/components/modalInsumo";
import StatusInsumos from "../features/insumos/components/statusInsumos";

// LÓGICA
import { useSupplyStore } from "../features/insumos/logic/supplies";

export default function InsumosPage() {
    const [larguraSidebar, _setLarguraSidebar] = useState(68);
    const [busca, setBusca] = useState("");
    const deferredBusca = useDeferredValue(busca);

    const { supplies, fetchSupplies, loading, deleteSupply } = useSupplyStore();

    // Estados de Modais
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [confirmacaoExclusao, setConfirmacaoExclusao] = useState({ aberta: false, item: null });
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

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
        const filtrados = lista.filter(item =>
            (item.name || "").toLowerCase().includes(termo) ||
            (item.description || "").toLowerCase().includes(termo)
        );

        return {
            itemsFiltrados: filtrados,
            stats: {
                totalValor,
                baixoEstoque,
                zerados,
                totalItems: lista.length
            }
        };
    }, [supplies, deferredBusca]);

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
            setToast({ visible: true, message: "Insumo removido com sucesso!", type: 'success' });
        } catch (_error) {
            setToast({ visible: true, message: "Erro ao remover insumo.", type: 'error' });
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

    return (
        <div className="flex h-screen w-full bg-zinc-950 text-zinc-200 font-sans antialiased overflow-hidden">
            <MainSidebar onCollapseChange={(collapsed) => _setLarguraSidebar(collapsed ? 68 : 256)} />

            {toast.visible && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(prev => ({ ...prev, visible: false }))}
                />
            )}

            <main
                className="flex-1 flex flex-col relative overflow-y-auto custom-scrollbar"
                style={{ marginLeft: `${larguraSidebar}px` }}
            >
                {/* FUNDO DECORATIVO */}
                <div className="absolute inset-x-0 top-0 h-[600px] z-0 pointer-events-none overflow-hidden select-none">
                    <div className="absolute inset-0 opacity-[0.08]" style={{
                        backgroundImage: `linear-gradient(to right, #52525b 1px, transparent 1px), linear-gradient(to bottom, #52525b 1px, transparent 1px)`,
                        backgroundSize: '50px 50px',
                        maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent)'
                    }} />

                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1600px] h-full">
                        <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-orange-500/30 via-transparent to-transparent" />
                    </div>
                </div>

                {/* CONTEÚDO PRINCIPAL */}
                <div className="relative z-10 p-8 xl:p-12 max-w-[1600px] mx-auto w-full">

                    {/* Header unificado */}
                    <div className="mb-12 animate-fade-in-up">
                        <div className="flex items-start justify-between flex-wrap gap-4">
                            <div>
                                <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                                    Meus Insumos
                                </h1>
                                <p className="text-sm text-zinc-500 capitalize">
                                    Gestão de Materiais Extras
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Barra de Busca */}
                                <div className="relative group hidden md:block">
                                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${busca ? 'text-orange-400' : 'text-zinc-600'}`}>
                                        <Search size={14} strokeWidth={3} />
                                    </div>
                                    <input
                                        className="
                                            w-64 bg-zinc-950/40/40 border border-zinc-800/50 rounded-xl py-2.5 pl-11 pr-10 
                                            text-[11px] text-zinc-200 outline-none transition-all font-bold uppercase tracking-widest 
                                            focus:border-orange-500/50 focus:bg-zinc-950/40/80 focus:ring-4 focus:ring-orange-500/10 
                                            placeholder:text-zinc-700 placeholder:text-[9px]
                                        "
                                        placeholder="BUSCAR INSUMO..."
                                        value={busca}
                                        onChange={(e) => setBusca(e.target.value)}
                                    />
                                    {busca && (
                                        <button
                                            onClick={() => setBusca("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-rose-500 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                {/* Botão Novo Insumo */}
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
                            </div>
                        </div>

                        {/* Busca Mobile */}
                        <div className="mt-4 md:hidden relative group">
                            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${busca ? 'text-orange-400' : 'text-zinc-600'}`}>
                                <Search size={14} strokeWidth={3} />
                            </div>
                            <input
                                className="
                                    w-full bg-zinc-950/40/40 border border-zinc-800/50 rounded-xl py-2.5 pl-11 pr-10 
                                    text-[11px] text-zinc-200 outline-none transition-all font-bold uppercase tracking-widest 
                                    focus:border-orange-500/50 focus:bg-zinc-950/40/80 focus:ring-4 focus:ring-orange-500/10 
                                    placeholder:text-zinc-700 placeholder:text-[9px]
                                "
                                placeholder="BUSCAR INSUMO..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                            <StatusInsumos
                                totalItems={stats.totalItems}
                                valorTotal={stats.totalValor}
                                lowStockCount={stats.baixoEstoque}
                                itemsWithoutStock={stats.zerados}
                            />
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
                                    <div className="py-24 flex flex-col items-center justify-center border border-dashed border-zinc-800/60 rounded-[3rem] bg-zinc-950/40/5 backdrop-blur-sm animate-in fade-in zoom-in-95">
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
                            <button
                                onClick={() => setConfirmacaoExclusao({ aberta: false, item: null })}
                                className="flex-1 h-12 rounded-xl bg-zinc-950/40 border border-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:text-white"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 h-12 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-900/20 flex items-center justify-center gap-2"
                            >
                                <Trash2 size={16} /> Confirmar Exclusão
                            </button>
                        </div>
                    }
                >
                    <div className="p-8 text-center space-y-4">
                        <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                            Você está prestes a remover permanentemente o insumo <br />
                            <span className="text-zinc-100 font-bold uppercase tracking-tight">
                                "{confirmacaoExclusao.item?.name}"
                            </span>
                        </p>
                        <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                            <p className="text-[10px] text-rose-500/80 font-black uppercase tracking-widest">
                                Atenção: Esta ação não pode ser desfeita.
                            </p>
                        </div>
                    </div>
                </Popup>

            </main>
        </div>
    );
}
