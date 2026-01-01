import React, { useEffect, useMemo, useState } from "react";
import { Inbox, Loader2, SearchX } from "lucide-react";

// Layout & Store
import MainSidebar from "../layouts/mainSidebar";
import { useProjectsStore } from "../features/orcamentos/logic/projects";

// Sub-componentes
import Header from "../features/orcamentos/components/header";
import StatusOrcamentos from "../features/orcamentos/components/statusOrcamentos";
import CardOrcamento from "../features/orcamentos/components/cardOrcamento";
import ModalDetalhes from "../features/orcamentos/components/modalDetalhes";

// 1. CONFIGURAÇÃO DE STATUS (Mantendo a semântica, mas o foco visual da página será Amber)
export const CONFIG_STATUS = {
    rascunho: { label: "Rascunho", color: "text-zinc-500", bg: "bg-zinc-500/10", border: "border-zinc-500/20" },
    aprovado: {
        label: "Aguardando",
        color: "text-amber-400",
        bg: "bg-amber-400/10",
        border: "border-amber-400/20",
        glow: "shadow-[0_0_15px_rgba(251,191,36,0.15)]"
    },
    producao: {
        label: "Em Produção",
        color: "text-orange-400",
        bg: "bg-orange-400/10",
        border: "border-orange-400/20",
        glow: "shadow-[0_0_15px_rgba(251,146,60,0.15)]"
    },
    finalizado: {
        label: "Concluído",
        color: "text-emerald-400",
        bg: "bg-emerald-400/10",
        border: "border-emerald-400/20",
        glow: "shadow-[0_0_15px_rgba(52,211,153,0.15)]"
    }
};

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

    const [filtroStatus, setFiltroStatus] = useState("todos");
    const [termoBusca, setTermoBusca] = useState("");
    const [projetoSelecionado, setProjetoSelecionado] = useState(null);
    const [loading, setLoading] = useState(true);
    const [larguraSidebar, setLarguraSidebar] = useState(68);

    const { filtrados, stats } = useOrcamentosLogic(projects, filtroStatus, termoBusca);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await fetchHistory();
            setLoading(false);
        };
        load();
    }, [fetchHistory]);

    return (
        <div className="flex h-screen w-full bg-zinc-950 text-zinc-200 font-sans antialiased overflow-hidden"
            style={{ '--sidebar-w': `${larguraSidebar}px` }}>

            <MainSidebar onCollapseChange={(collapsed) => setLarguraSidebar(collapsed ? 68 : 256)} />

            <main className="flex-1 flex flex-col relative transition-[margin] duration-300 ease-in-out ml-[var(--sidebar-w)]">

                {/* BACKGROUND DECORATIVO */}
                <div className="absolute inset-x-0 top-0 h-[600px] z-0 pointer-events-none overflow-hidden select-none">
                    <div className="absolute inset-0 opacity-[0.1]" style={{
                        backgroundImage: `linear-gradient(to right, #52525b 1px, transparent 1px), linear-gradient(to bottom, #52525b 1px, transparent 1px)`,
                        backgroundSize: '50px 50px',
                        maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent)'
                    }} />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1600px] h-full">
                        <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-amber-500/30 via-transparent to-transparent" />
                    </div>
                </div>

                {/* Header (Sem as props de modoVisualizacao, focado apenas em busca) */}
                <Header termoBusca={termoBusca} setTermoBusca={setTermoBusca} />

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 xl:p-12 relative z-10">
                    <div className="max-w-[1600px] mx-auto space-y-12">

                        {/* 1. DASHBOARD STATS */}
                        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                            <StatusOrcamentos
                                totalBruto={stats.bruto}
                                totalLucro={stats.lucro}
                                projetosAtivos={stats.ativos}
                                horasEstimadas={stats.horas}
                            />
                        </div>

                        {/* 2. FILTROS COM INDICADOR AMBER */}
                        <div className="flex justify-between items-center border-b border-white/5 pb-6">
                            <div className="flex p-1 bg-zinc-900/40 rounded-xl border border-white/5 backdrop-blur-md">
                                {["todos", "aprovado", "producao", "finalizado"].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setFiltroStatus(s)}
                                        className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all relative ${filtroStatus === s ? "text-amber-500" : "text-zinc-500 hover:text-zinc-300"
                                            }`}
                                    >
                                        {s === "todos" ? "Geral" : CONFIG_STATUS[s]?.label || s}
                                        {filtroStatus === s && (
                                            <div className="absolute -bottom-1 left-2 right-2 h-[2px] bg-gradient-to-r from-amber-600 to-orange-500 animate-in fade-in duration-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. CONTEÚDO PRINCIPAL (GRID FIXO) */}
                        {loading ? (
                            <div className="w-full h-96 flex flex-col items-center justify-center gap-6 animate-in fade-in slide-in-from-top-10 duration-500 border border-white/5 bg-white/[0.02] rounded-[3rem]">
                                <div className="relative">
                                    <Loader2 className="animate-spin text-amber-500" size={40} strokeWidth={1} />
                                    <div className="absolute inset-0 bg-amber-500/10 blur-3xl opacity-20" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">
                                    Sincronizando registros comerciais...
                                </span>
                            </div>
                        ) : filtrados.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-6 duration-700">
                                {filtrados.map(item => (
                                    <CardOrcamento key={item.id} item={item} onClick={() => setProjetoSelecionado(item)} />
                                ))}
                            </div>
                        ) : (
                            <div className="w-full py-24 flex flex-col items-center justify-center border border-dashed border-zinc-800/60 rounded-[3rem] bg-zinc-900/5 backdrop-blur-sm animate-in fade-in slide-in-from-top-8 duration-700">
                                {termoBusca ? (
                                    <div className="flex flex-col items-center text-center">
                                        <div className="relative mb-6">
                                            <div className="absolute inset-0 bg-amber-500/10 blur-2xl rounded-full" />
                                            <SearchX size={48} strokeWidth={1} className="text-amber-600/50 relative z-10" />
                                        </div>
                                        <h3 className="text-zinc-300 text-[11px] font-black uppercase tracking-[0.3em]">Nenhum registro localizado</h3>
                                        <p className="text-zinc-600 text-[10px] uppercase mt-3 tracking-widest italic">Critério: "{termoBusca}"</p>
                                        <button
                                            onClick={() => setTermoBusca("")}
                                            className="mt-8 px-8 py-2.5 bg-zinc-800/50 hover:bg-zinc-800 border border-white/5 rounded-full text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] transition-all"
                                        >
                                            Limpar Busca
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="relative mb-6">
                                            <div className="absolute inset-0 bg-amber-500/10 blur-2xl rounded-full" />
                                            <Inbox size={48} strokeWidth={1} className="text-amber-500/30 relative z-10" />
                                        </div>
                                        <h3 className="text-zinc-300 text-[11px] font-black uppercase tracking-[0.3em]">Fila de Pedidos Vazia</h3>
                                        <p className="text-zinc-600 text-[10px] uppercase mt-3 tracking-widest leading-relaxed text-center">
                                            Aguardando novos Blueprints para <br /> processamento comercial.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
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
            </main>
        </div>
    );
}