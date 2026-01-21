import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter"; // Hook de navegação do wouter
import {
    X, History, Package, RotateCcw, Trash2, Search,
    Database, Loader2, Calendar, TrendingUp, Clock, Check,
    AlertTriangle, CheckCircle2, ExternalLink
} from "lucide-react";
import { useProjectsStore } from "../../projetos/logic/projects";
import { formatCurrency, formatDecimal } from "../../../utils/numbers";
import Modal from "../../../components/ui/Modal";
export default function Historico({ open, onClose, onRestore }) {
    // No wouter, useLocation retorna [location, setLocation]
    const [, setLocation] = useLocation();

    const {
        projects: projetos,
        fetchHistory: buscarHistorico,
        removeHistoryEntry: removerEntrada,
        clearHistory: limparHistorico,
        approveBudget: aprovarOrcamento,
        isLoading: estaCarregando
    } = useProjectsStore();

    const [busca, setBusca] = useState("");

    // --- CONFIGURAÇÕES DO SISTEMA INTELIGENTE ---
    const MARGEM_MINIMA_IDEAL = 20;

    const [confirmacao, setConfirmacao] = useState({
        open: false,
        title: "",
        message: "",
        onConfirm: null,
        icon: AlertTriangle,
        variant: "primary"
    });

    const fecharConfirmacao = () => setConfirmacao(prev => ({ ...prev, open: false }));

    const formatarDataLocal = (stringData) => {
        if (!stringData) return "Sem data";
        try {
            const data = new Date(stringData);
            if (isNaN(data.getTime())) return "Data inválida";
            return new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: 'America/Sao_Paulo'
            }).format(data).replace(',', ' às');
        } catch { return "Erro na data"; }
    };

    // --- LÓGICA DE APROVAÇÃO COM REDIRECIONAMENTO (WOUTER) ---
    const perguntarAprovacao = (projeto, margem) => {
        const margemRiscada = margem < MARGEM_MINIMA_IDEAL;
        setConfirmacao({
            open: true,
            title: margemRiscada ? "Atenção: Margem Crítica" : "Confirmar Aprovação",
            message: margemRiscada
                ? `Este projeto possui apenas ${Math.round(margem)}% de margem. Tem certeza que deseja aprovar este orçamento com rentabilidade abaixo do ideal?`
                : "Deseja aprovar este orçamento? Os insumos serão debitados do estoque e o status será atualizado.",
            icon: margemRiscada ? AlertTriangle : CheckCircle2,
            variant: margemRiscada ? "danger" : "success",
            onConfirm: () => {
                aprovarOrcamento(projeto); // Aprova no banco
                onRestore(projeto);      // Restaura no simulador
                fecharConfirmacao();
                onClose();               // Fecha a gaveta
                setLocation("/orcamentos"); // Navega usando wouter
            }
        });
    };

    const perguntarExclusao = (id) => {
        setConfirmacao({
            open: true,
            title: "Excluir Registro",
            message: "Tem certeza que deseja remover este orçamento permanentemente do histórico?",
            icon: Trash2,
            variant: "danger",
            onConfirm: () => {
                removerEntrada(id);
                fecharConfirmacao();
            }
        });
    };

    const perguntarLimparTudo = () => {
        setConfirmacao({
            open: true,
            title: "Purgar Histórico",
            message: "Atenção: Isso apagará TODOS os registros salvos na nuvem. Esta ação é irreversível.",
            icon: AlertTriangle,
            variant: "danger",
            onConfirm: () => {
                limparHistorico();
                fecharConfirmacao();
            }
        });
    };

    useEffect(() => {
        if (open) buscarHistorico();
    }, [open, buscarHistorico]);

    const projetosFiltrados = useMemo(() => {
        const lista = Array.isArray(projetos) ? projetos : [];
        const termo = busca.toLowerCase();
        return lista.filter(item => (item.label || "").toLowerCase().includes(termo));
    }, [projetos, busca]);

    return (
        <>
            <div
                className={`fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            <aside className={`fixed top-0 right-0 z-[101] h-screen w-full sm:w-[500px] bg-zinc-950 border-l border-zinc-800 shadow-2xl transition-transform duration-500 ease-in-out flex flex-col ${open ? "translate-x-0" : "translate-x-full"}`}>

                <div className="h-24 px-8 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-950 relative overflow-hidden">
                    {/* Pattern de Fundo Header */}
                    <div className="absolute inset-0 opacity-[0.05]" style={{
                        backgroundImage: `linear-gradient(to right, #52525b 1px, transparent 1px), linear-gradient(to bottom, #52525b 1px, transparent 1px)`,
                        backgroundSize: '24px 24px'
                    }} />

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-center text-sky-500 shadow-lg">
                            {estaCarregando ? <Loader2 size={24} className="animate-spin" /> : <History size={24} />}
                        </div>
                        <div>
                            <h2 className="text-[10px] font-black text-sky-500 uppercase tracking-[0.3em] leading-none mb-1.5">MakersLog</h2>
                            <p className="text-sm font-black text-white uppercase tracking-tight">Histórico de Orçamentos</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-900/50 transition-all relatice z-10">
                        <X size={20} />
                    </button>
                </div>

                {/* --- GRÁFICO DE TENDÊNCIA (MINI DASHBOARD) --- */}
                {projetos.length >= 2 && (
                    <div className="px-6 py-4 bg-zinc-950/40/40 border-b border-zinc-800/50">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Tendência Recent (Lucro)</span>
                            <span className="text-[9px] font-mono font-bold text-sky-500">Últimos {Math.min(projetos.length, 7)}</span>
                        </div>
                        <div className="h-16 flex items-end justify-between gap-1">
                            {projetos.slice(0, 7).reverse().map((p, i) => {
                                const res = p.data?.resultados || {};
                                const lucro = Number(res.lucroLiquidoReal || res.lucroLiquido || res.lucro || 0);
                                const margem = Number(res.margemEfetivaPct || 0);
                                // Normalização Simples para altura da barra (Max 100%, Min 10%)
                                // Assumindo teto de R$ 100.00 de lucro para escala visual
                                const heightPct = Math.min(100, Math.max(10, (lucro / 50) * 100));
                                const cor = lucro < 0 ? 'bg-rose-500' : margem < 20 ? 'bg-amber-500' : 'bg-emerald-500';

                                return (
                                    <div key={i} className="flex-1 flex flex-col justify-end group/bar relative h-full">
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 p-2 bg-zinc-900/50 rounded-lg shadow-xl opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap border border-zinc-800/50">
                                            <p className="text-[9px] text-zinc-400 font-bold uppercase">{p.label}</p>
                                            <p className={`text-xs font-mono font-black ${lucro < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                                {formatCurrency(lucro)}
                                            </p>
                                        </div>
                                        <div
                                            style={{ height: `${lucro < 0 ? 10 : heightPct}%` }}
                                            className={`w-full rounded-t-sm opacity-60 group-hover/bar:opacity-100 transition-all duration-300 ${cor} ${lucro < 0 ? 'opacity-30' : ''}`}
                                        />
                                        <div className="h-[2px] w-full bg-zinc-900/50 mt-[1px] rounded-full" />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                <div className="p-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-500 transition-colors" size={16} />
                        <input
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 h-11 text-xs font-medium text-zinc-200 outline-none focus:border-sky-500/40 transition-all"
                            placeholder="Buscar orçamentos..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 custom-scrollbar">
                    {projetosFiltrados.length > 0 ? (
                        projetosFiltrados.map((projeto) => {
                            const dados = projeto.data || projeto.payload || {};
                            const resultados = dados.resultados || {};
                            const status = projeto.status || dados.status || "rascunho";
                            const isAprovado = status === 'aprovado';

                            // --- CÁLCULO DE LUCRO E MARGEM ---
                            const precoVenda = Number(resultados.precoComDesconto || resultados.precoSugerido || 0);
                            const margemPct = Number(resultados.margemEfetivaPct || resultados.margem || 0);

                            // Cálculo matemático garantido: Venda * (Margem / 100)
                            const lucro = Number(resultados.lucroLiquido || resultados.lucro || (precoVenda * (margemPct / 100)));

                            return (
                                <div key={projeto.id} className="group relative bg-zinc-950/40 border border-zinc-800/50 rounded-2xl p-5 transition-all duration-300 hover:border-zinc-800/50 hover:bg-zinc-950/40/40 hover-lift">

                                    <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full transition-all duration-500 ${isAprovado ? 'bg-sky-500 shadow-[2px_0_12px_rgba(14,165,233,0.4)]' :
                                        margemPct >= MARGEM_MINIMA_IDEAL ? 'bg-emerald-500' : 'bg-red-500 animate-pulse shadow-[2px_0_12px_rgba(239,68,68,0.4)]'
                                        }`} />

                                    <div className="flex justify-between items-start mb-4 pl-3">
                                        <div className="min-w-0">
                                            <h3 className="text-sm font-black text-white truncate pr-2 tracking-tight">
                                                {projeto.label || "Projeto sem nome"}
                                            </h3>
                                            <div className="flex items-center gap-2 text-zinc-500 mt-1">
                                                <Calendar size={12} />
                                                <span className="text-[10px] font-bold tracking-tight uppercase">
                                                    {formatarDataLocal(projeto.timestamp || projeto.created_at)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <div className={`text-[10px] font-black flex items-center justify-end gap-1 mb-0.5 ${margemPct >= MARGEM_MINIMA_IDEAL ? 'text-emerald-400' : 'text-red-400'
                                                }`}>
                                                <TrendingUp size={12} /> {formatDecimal(margemPct, 0)}%
                                            </div>
                                            <div className="text-lg font-black text-white font-mono leading-none tracking-tight">
                                                {formatCurrency(precoVenda)}
                                            </div>

                                            <div className="text-[10px] font-bold mt-1.5 flex items-center justify-end gap-1">
                                                <span className="text-zinc-600 text-[9px] tracking-widest uppercase">Lucro</span>
                                                <span className={lucro > 0 ? "text-emerald-500" : "text-red-500"}>
                                                    {formatCurrency(lucro)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mb-4 pl-3 text-zinc-500">
                                        <div className="flex items-center gap-2 p-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                                            <Package size={12} className="text-zinc-400" />
                                            <span className="text-[10px] font-bold">
                                                {formatDecimal((Number(dados.entradas?.material?.pesoModelo || 0) * Number(dados.entradas?.qtdPecas || 1)), 0)}g
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 p-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                                            <Clock size={12} className="text-zinc-400" />
                                            <span className="text-[10px] font-bold">
                                                {dados.entradas?.tempo?.impressaoHoras || 0}h {dados.entradas?.tempo?.impressaoMinutos || 0}m
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pl-3">
                                        {!isAprovado ? (
                                            <button
                                                type="button"
                                                onClick={() => perguntarAprovacao(projeto, margemPct)}
                                                className={`flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 ${margemPct < MARGEM_MINIMA_IDEAL
                                                    ? 'bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white'
                                                    : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                                                    }`}
                                            >
                                                <Check size={14} strokeWidth={3} /> {margemPct < MARGEM_MINIMA_IDEAL ? 'Risco' : 'Aprovar'}
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    onRestore(projeto);
                                                    onClose();
                                                    setLocation("/orcamentos"); // Navegação wouter
                                                }}
                                                className="flex-1 h-10 rounded-xl bg-sky-600 border border-sky-400/20 text-white text-[10px] font-black uppercase tracking-wider hover:bg-sky-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-900/20 active:scale-95"
                                            >
                                                <ExternalLink size={14} /> Ver Orçamento
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => { onRestore(projeto); onClose(); }}
                                            title="Restaurar dados no simulador"
                                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-950/40 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-800/50 transition-all active:scale-90"
                                        >
                                            <RotateCcw size={16} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => perguntarExclusao(projeto.id)}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-950/40 border border-zinc-800 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all active:scale-90"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="h-60 flex flex-col items-center justify-center text-zinc-800 opacity-20 gap-3">
                            <Database size={40} strokeWidth={1.5} />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Histórico Vazio</p>
                        </div>
                    )}
                </div>

                {projetos.length > 0 && (
                    <div className="p-4 border-t border-zinc-800/50 bg-zinc-950/40/10">
                        <button
                            type="button"
                            onClick={perguntarLimparTudo}
                            className="w-full h-10 rounded-xl border border-rose-500/10 text-rose-500/40 hover:text-rose-400 hover:border-rose-500/30 text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all"
                        >
                            <Trash2 size={14} /> Apagar Todo o Histórico
                        </button>
                    </div>
                )}
            </aside>

            <Modal
                isOpen={confirmacao.open}
                onClose={fecharConfirmacao}
                title={confirmacao.title}
                subtitle="Validação de Sistema"
                icon={confirmacao.icon}
                footer={
                    <div className="flex gap-2 w-full">
                        <button onClick={fecharConfirmacao} className="flex-1 h-12 rounded-xl bg-zinc-950/40 text-zinc-500 text-[10px] font-black uppercase hover:text-white transition-all">Cancelar</button>
                        <button
                            onClick={confirmacao.onConfirm}
                            className={`flex-[2] h-12 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 ${confirmacao.variant === 'danger' ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20' : 'bg-sky-600 hover:bg-sky-500 shadow-sky-900/20'}`}
                        >Confirmar Ação</button>
                    </div>
                }
            >
                <div className="p-6 text-center text-zinc-400 text-sm font-medium leading-relaxed">{confirmacao.message}</div>
            </Modal>

            <style dangerouslySetInnerHTML={{
                __html: `
                    .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(14,165,233,0.2); }
                `}} />
        </>
    );
}
