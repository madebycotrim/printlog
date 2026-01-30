import React, { useEffect, useMemo, useState } from "react";
import { Inbox, Loader2, SearchX, Plus, Search, FolderOpen, Layers, Clock, Hammer, CheckCircle2, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";

// Layout & Store
import ManagementLayout from "../../layouts/ManagementLayout";
import PageHeader from "../../components/ui/PageHeader";
import { useProjectsStore } from "../../features/projetos/logic/projetos";
import { useClientStore } from "../../features/clientes/logic/clientes";
import EstadoVazio from "../../components/ui/EstadoVazio";
import { formatCurrency } from "../../utils/numbers";

// Sub-componentes
import StatusOrcamentos from "../../features/projetos/components/StatusOrcamentos";
import BotaoGerarPDF from "../../features/orcamentos/components/BotaoGerarPDF";
import ModalDetalhes from "../../features/projetos/components/ModalDetalhes";
import DataCard from "../../components/ui/DataCard";
import Button from "../../components/ui/Button";
import ConfirmModal from "../../components/ui/ConfirmModal";

// 1. CONFIGURAÇÃO DE STATUS
import { CONFIG_STATUS } from "../../utils/constants";

// 2. HOOK DE LÓGICA
function useOrcamentosLogic(projetos, filtroStatus, termoBusca) {
    const [buscaDebounced, setBuscaDebounced] = useState(termoBusca);

    useEffect(() => {
        const timer = setTimeout(() => setBuscaDebounced(termoBusca), 300);
        return () => clearTimeout(timer);
    }, [termoBusca]);

    const filtrados = useMemo(() => {
        const lista = Array.isArray(projetos) ? projetos : [];
        const termo = buscaDebounced.toLowerCase().trim();

        return lista.filter(p => {
            const d = p.data || {};
            const status = d.status || "rascunho";
            if (status === "rascunho") return false;

            const condicaoStatus = filtroStatus === "todos" || status === filtroStatus;
            const nomeProjeto = (p.label || d.entradas?.nomeProjeto || "").toLowerCase();
            const cliente = (d.entradas?.clienteNome || "").toLowerCase();
            const condicaoBusca = nomeProjeto.includes(termo) || cliente.includes(termo);

            return condicaoStatus && condicaoBusca;
        });
    }, [projetos, filtroStatus, buscaDebounced]);

    const stats = useMemo(() => {
        return filtrados.reduce((acc, p) => {
            const r = p.data?.resultados || {};
            acc.bruto += Number(r.precoComDesconto || r.precoSugerido || 0);
            acc.lucro += Number(r.lucroReal || 0);
            acc.horas += Number(r.tempoTotalHoras || 0);
            if (p.data?.status === 'producao') acc.ativos++;
            return acc;
        }, { bruto: 0, lucro: 0, ativos: 0, horas: 0 });
    }, [filtrados]);

    return { filtrados, stats };
}

export default function OrcamentosPage() {
    const { projects, fetchHistory, removeHistoryEntry } = useProjectsStore();
    const { clients, fetchClients } = useClientStore();
    const [, setLocation] = useLocation();

    const [filtroStatus, setFiltroStatus] = useState("todos");
    const [termoBusca, setTermoBusca] = useState("");
    const [projetoSelecionado, setProjetoSelecionado] = useState(null);
    const [loading, setLoading] = useState(true);

    const { filtrados, stats } = useOrcamentosLogic(projects, filtroStatus, termoBusca);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await fetchHistory();
            await fetchClients();
            setLoading(false);
        };
        load();
    }, [fetchHistory, fetchClients]);

    const novoOrcamentoButton = (
        <Button
            onClick={() => setLocation("/calculadora")}
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
                title="Meus Orçamentos"
                subtitle="Gestão de Propostas Comerciais"
                accentColor="text-amber-500"
                searchQuery={termoBusca}
                onSearchChange={setTermoBusca}
                placeholder="BUSCAR ORÇAMENTO..."
                actionButton={novoOrcamentoButton}
            />

            <div className="space-y-8">
                {/* 1. DASHBOARD STATS */}
                <div>
                    <StatusOrcamentos
                        totalBruto={stats.bruto}
                        totalLucro={stats.lucro}
                        projetosAtivos={stats.ativos}
                        horasEstimadas={stats.horas}
                    />
                </div>

                {/* 2. FILTROS (Novo Estilo Tabs) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 mb-6">
                    {[
                        { id: "todos", label: "Geral", icon: Layers },
                        { id: "aprovado", label: "Aguardando", icon: Clock },
                        { id: "producao", label: "Produção", icon: Hammer },
                        { id: "finalizado", label: "Concluído", icon: CheckCircle2 }
                    ].map((tab) => {
                        const isActive = filtroStatus === tab.id;
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setFiltroStatus(tab.id)}
                                className={`
                                        flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all duration-300 shrink-0
                                        ${isActive
                                        ? 'bg-zinc-800 border-zinc-700 text-white shadow-lg shadow-black/20'
                                        : 'bg-zinc-950/40 border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                                    }
                                    `}
                            >
                                <Icon size={14} className={isActive ? "text-amber-500" : "opacity-70"} />
                                <span className="text-[11px] font-bold uppercase tracking-wider">
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* 3. CONTEÚDO PRINCIPAL (GRID) */}
                {loading ? (
                    <div className="w-full h-96 flex flex-col items-center justify-center gap-6 border border-white/5 bg-white/[0.02] rounded-[3rem]">
                        <div className="relative">
                            <Loader2 className="text-amber-500" size={40} strokeWidth={1} />
                            <div className="absolute inset-0 bg-amber-500/10 blur-3xl opacity-20" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">
                            Sincronizando registros...
                        </span>
                    </div>
                ) : filtrados.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        {filtrados.map(item => {
                            const d = item.data || {};
                            const res = d.resultados || {};
                            const ent = d.entradas || {};
                            const statusKey = d.status || 'rascunho';
                            const config = CONFIG_STATUS[statusKey] || CONFIG_STATUS['rascunho'];
                            const precoVenda = Number(res.precoComDesconto || res.precoSugerido || 0);
                            const client = clients.find(c => String(c.id) === String(ent.clienteId || d.clienteId));

                            return (
                                <DataCard
                                    key={item.id}
                                    title={item.label || ent.nomeProjeto || "Sem Título"}
                                    subtitle={ent.clienteNome || "Cliente não informado"}
                                    status={{
                                        label: config.label,
                                        color: config.color,
                                        bg: config.bg,
                                        border: config.border,
                                        dotColor: config.color.replace('text', 'bg')
                                    }}
                                    badge={`#${String(item.id || '000').slice(-4)}`}
                                    onClick={() => setProjetoSelecionado(item)}
                                    className="h-[200px]"
                                    footer={
                                        <div className="flex items-end justify-between w-full">
                                            <div>
                                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Valor Final</p>
                                                <p className="text-2xl font-mono font-black text-zinc-200">{formatCurrency(precoVenda)}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <BotaoGerarPDF projeto={item} cliente={client} />
                                                <div className="w-8 h-8 rounded-xl bg-zinc-950/40 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:bg-amber-500 group-hover:border-amber-500 group-hover:text-zinc-950 transition-all">
                                                    <ChevronRight size={16} strokeWidth={3} />
                                                </div>
                                            </div>
                                        </div>
                                    }
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="w-full">
                        {termoBusca ? (
                            <EstadoVazio
                                title="Nenhum registro localizado"
                                description={`Critério: "${termoBusca}"`}
                                icon={SearchX}
                                action={
                                    <Button
                                        onClick={() => setTermoBusca("")}
                                        variant="secondary"
                                        size="sm"
                                        className="px-8 bg-zinc-800/50 hover:bg-zinc-900/50 border-white/5 text-amber-500 hover:text-amber-400"
                                    >
                                        Limpar Busca
                                    </Button>
                                }
                            />
                        ) : (
                            <EstadoVazio
                                title="Nenhum orçamento ainda"
                                description="Seus projetos salvos aparecerão aqui."
                                icon={FolderOpen}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* MODAL DETALHES */}
            {projetoSelecionado && (
                <ModalDetalhes
                    item={projetoSelecionado}
                    onClose={() => setProjetoSelecionado(null)}
                    onExcluir={async (id) => {
                        const sucesso = await removeHistoryEntry(id);
                        if (sucesso) setProjetoSelecionado(null);
                    }}
                />
            )}

        </ManagementLayout>
    );
}

