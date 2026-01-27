import React, { useEffect, useState, useDeferredValue } from 'react';
import { Users, Plus, PackageSearch, Trash2, AlertTriangle } from 'lucide-react';
import ManagementLayout from "../../layouts/ManagementLayout";
import PageHeader from "../../components/ui/PageHeader";
import { useClientStore } from '../../features/clientes/logic/clients';
import TabelaClientes from '../../features/clientes/components/TabelaClientes';
import ModalCliente from '../../features/clientes/components/ModalCliente';
import ModalHistoricoCliente from '../../features/clientes/components/ModalHistoricoCliente';
import StatusClientes from '../../features/clientes/components/StatusClientes';
import { useProjectsStore } from '../../features/projetos/logic/projects';
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { useToastStore } from "../../stores/toastStore";

export default function ClientesPage() {
    const { clients, fetchClients, deleteClient } = useClientStore();
    const { projects, fetchHistory } = useProjectsStore();

    // Toast
    const { addToast } = useToastStore();
    const showToast = (message, type) => addToast(message, type);

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
            try {
                await deleteClient(confirmacaoExclusao.item.id);
                showToast("Cliente removido com sucesso!", 'success');
            } catch {
                showToast("Erro ao remover cliente.", 'error');
            } finally {
                setConfirmacaoExclusao({ aberta: false, item: null });
            }
        }
    };

    const novoClienteButton = (
        <Button
            onClick={handleNew}
            variant="secondary"
            className="bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 border border-white/10 shadow-lg hover:shadow-xl hover:shadow-zinc-900/50 hover:border-white/20"
            icon={Plus}
        >
            Novo
        </Button>
    );

    return (
        <ManagementLayout>

            <PageHeader
                title="Meus Clientes"
                subtitle="Gestão de Contatos e Histórico"
                accentColor="text-indigo-500"
                searchQuery={busca}
                onSearchChange={setBusca}
                placeholder="BUSCAR CLIENTE..."
                actionButton={novoClienteButton}
            />

            {/* Stats Bar */}
            <StatusClientes clients={clients} />

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
            <Modal
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
            </Modal>

        </ManagementLayout>
    );
}

