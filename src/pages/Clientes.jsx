import React, { useEffect, useState, useDeferredValue } from 'react';
import { Users, Plus, Search, X, PackageSearch, Trash2, AlertTriangle } from 'lucide-react';
import MainSidebar from "../layouts/mainSidebar";
import { useClientStore } from '../features/clientes/logic/clients';
import TabelaClientes from '../features/clientes/components/TabelaClientes';
import ModalCliente from '../features/clientes/components/ModalCliente';
import ModalHistoricoCliente from '../features/clientes/components/ModalHistoricoCliente';
import { useProjectsStore } from '../features/projetos/logic/projects';
import Popup from "../components/Popup";

export default function ClientesPage() {
    const { clients, fetchClients, deleteClient } = useClientStore();
    const { projects, fetchHistory } = useProjectsStore();

    const [larguraSidebar, setLarguraSidebar] = useState(68);
    const [busca, setBusca] = useState("");
    const deferredBusca = useDeferredValue(busca);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [historicoCliente, setHistoricoCliente] = useState(null);
    const [confirmacaoExclusao, setConfirmacaoExclusao] = useState({ aberta: false, item: null });

    useEffect(() => {
        fetchClients();
        fetchHistory();
    }, [fetchClients, fetchHistory]);


    // Filtragem
    const clientesFiltrados = clients.filter(c =>
        (c.nome || "").toLowerCase().includes(deferredBusca.toLowerCase()) ||
        (c.empresa || "").toLowerCase().includes(deferredBusca.toLowerCase())
    );


    // Handlers
    const handleEdit = (client) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setEditingClient(null);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (client) => {
        setConfirmacaoExclusao({ aberta: true, item: client });
    };

    const confirmDelete = async () => {
        if (confirmacaoExclusao.item) {
            await deleteClient(confirmacaoExclusao.item.id);
            setConfirmacaoExclusao({ aberta: false, item: null });
        }
    };

    return (
        <div className="flex h-screen w-full bg-zinc-950 text-zinc-200 font-sans antialiased overflow-hidden">
            <MainSidebar onCollapseChange={(collapsed) => setLarguraSidebar(collapsed ? 68 : 256)} />

            <main
                className="flex-1 flex flex-col relative overflow-y-auto custom-scrollbar"
                style={{ marginLeft: `${larguraSidebar}px` }}
            >
                {/* FUNDO DECORATIVO (Igual Dashboard/Filamentos) */}
                <div className="absolute inset-x-0 top-0 h-[600px] z-0 pointer-events-none overflow-hidden select-none">
                    <div className="absolute inset-0 opacity-[0.08]" style={{
                        backgroundImage: `linear-gradient(to right, #52525b 1px, transparent 1px), linear-gradient(to bottom, #52525b 1px, transparent 1px)`,
                        backgroundSize: '50px 50px',
                        maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent)'
                    }} />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1600px] h-full">
                        <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-indigo-500/30 via-transparent to-transparent" />
                    </div>
                </div>

                {/* CONTEÚDO PRINCIPAL */}
                <div className="relative z-10 p-8 xl:p-12 max-w-[1600px] mx-auto w-full">

                    {/* Header Unificado */}
                    <div className="mb-12 animate-fade-in-up">
                        <div className="flex items-start justify-between flex-wrap gap-4">
                            <div>
                                <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                                    Meus Clientes
                                </h1>
                                <p className="text-sm text-zinc-500 capitalize">
                                    Gestão de Contatos e Histórico
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Barra de Busca */}
                                <div className="relative group hidden md:block">
                                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${busca ? 'text-indigo-400' : 'text-zinc-600'}`}>
                                        <Search size={14} strokeWidth={3} />
                                    </div>
                                    <input
                                        className="
                                            w-64 bg-zinc-950/40/40 border border-zinc-800/50 rounded-xl py-2.5 pl-11 pr-10 
                                            text-[11px] text-zinc-200 outline-none transition-all font-bold uppercase tracking-widest 
                                            focus:border-indigo-500/50 focus:bg-zinc-950/40/80 focus:ring-4 focus:ring-indigo-500/10 
                                            placeholder:text-zinc-700 placeholder:text-[9px]
                                        "
                                        placeholder="BUSCAR CLIENTE..."
                                        value={busca}
                                        onChange={(e) => setBusca(e.target.value)}
                                    />
                                    {busca && (
                                        <button
                                            onClick={() => setBusca("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-indigo-500 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                {/* Botão Novo Cliente */}
                                <button
                                    onClick={handleNew}
                                    className="
                                        group relative h-11 px-6 overflow-hidden bg-indigo-600 hover:bg-indigo-500 
                                        rounded-xl transition-all duration-300 active:scale-95 shadow-lg shadow-indigo-900/40
                                        flex items-center gap-3 text-white
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
                            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${busca ? 'text-indigo-400' : 'text-zinc-600'}`}>
                                <Search size={14} strokeWidth={3} />
                            </div>
                            <input
                                className="
                                    w-full bg-zinc-950/40/40 border border-zinc-800/50 rounded-xl py-2.5 pl-11 pr-10 
                                    text-[11px] text-zinc-200 outline-none transition-all font-bold uppercase tracking-widest 
                                    focus:border-indigo-500/50 focus:bg-zinc-950/40/80 focus:ring-4 focus:ring-indigo-500/10 
                                    placeholder:text-zinc-700 placeholder:text-[9px]
                                "
                                placeholder="BUSCAR CLIENTE..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Conteúdo Principal */}
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {clientesFiltrados.length > 0 ? (
                            <TabelaClientes
                                clientes={clientesFiltrados}
                                onEdit={handleEdit}
                                onDelete={handleDeleteClick}
                                onViewHistory={setHistoricoCliente}
                            />
                        ) : (
                            !busca ? (
                                <div className="py-24 flex flex-col items-center justify-center border border-dashed border-zinc-800/60 rounded-[3rem] bg-zinc-950/40/5 backdrop-blur-sm">
                                    <Users size={48} strokeWidth={1} className="mb-4 text-zinc-700" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Nenhum cliente cadastrado</p>
                                </div>
                            ) : (
                                <div className="py-24 flex flex-col items-center justify-center border border-dashed border-zinc-800/60 rounded-[3rem] bg-zinc-950/40/5 backdrop-blur-sm">
                                    <PackageSearch size={48} strokeWidth={1} className="mb-4 text-zinc-700" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Nenhum resultado encontrado</p>
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* Modais */}
                <ModalCliente
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    clienteParaEditar={editingClient}
                />

                <ModalHistoricoCliente
                    isOpen={!!historicoCliente}
                    onClose={() => setHistoricoCliente(null)}
                    cliente={historicoCliente}
                    projetos={projects}
                />

                {/* Popup Exclusão */}
                <Popup
                    isOpen={confirmacaoExclusao.aberta}
                    onClose={() => setConfirmacaoExclusao({ aberta: false, item: null })}
                    title="Excluir Cliente?"
                    subtitle="Gestão de Contatos"
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
                            Você está prestes a remover o cliente <br />
                            <span className="text-zinc-100 font-bold uppercase tracking-tight">
                                "{confirmacaoExclusao.item?.nome}"
                            </span>
                        </p>
                        <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                            <p className="text-[10px] text-rose-500/80 font-black uppercase tracking-widest">
                                Atenção: O histórico de projetos deste cliente será desvinculado.
                            </p>
                        </div>
                    </div>
                </Popup>

            </main>
        </div>
    );
}
