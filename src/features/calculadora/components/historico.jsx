import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom"; // Importação necessária para navegação
import {
    X, History, Package, RotateCcw, Trash2, Search,
    Database, Loader2, Calendar, TrendingUp, Clock, Check,
    AlertTriangle, CheckCircle2, ExternalLink
} from "lucide-react";
import { useProjectsStore } from "../../orcamentos/logic/projects";
import { formatCurrency } from "../../../utils/numbers";
import Popup from "../../../components/Popup";

export default function GavetaHistorico({ open, onClose, onRestore }) {
    const navigate = useNavigate(); // Inicializa o hook de navegação
    
    const {
        projects: projetos,
        fetchHistory: buscarHistorico,
        removeHistoryEntry: removerEntrada,
        clearHistory: limparHistorico,
        approveBudget: aprovarOrcamento,
        isLoading: estaCarregando
    } = useProjectsStore();

    const [busca, setBusca] = useState("");

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

    // --- LÓGICA DE APROVAÇÃO COM REDIRECIONAMENTO ---
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
                onRestore(projeto);      // Carrega os dados no estado global/simulador
                fecharConfirmacao();
                onClose();               // Fecha a gaveta
                navigate("/orcamentos"); // Vai para a página de orçamentos
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

            <aside className={`fixed top-0 right-0 z-[101] h-screen w-full sm:w-[420px] bg-zinc-950 border-l border-white/10 shadow-2xl transition-transform duration-500 ease-in-out flex flex-col ${open ? "translate-x-0" : "translate-x-full"}`}>

                <div className="h-20 px-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sky-500 shadow-inner">
                            {estaCarregando ? <Loader2 size={20} className="animate-spin" /> : <History size={20} />}
                        </div>
                        <div>
                            <h2 className="text-[9px] font-black text-sky-500 uppercase tracking-[0.3em] leading-none mb-1">Printlog</h2>
                            <p className="text-xs font-bold text-white uppercase tracking-tight">Histórico de projetos</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-500 hover:text-white hover:bg-white/5 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-500 transition-colors" size={16} />
                        <input
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 h-11 text-xs font-medium text-zinc-200 outline-none focus:border-sky-500/40 transition-all"
                            placeholder="Localizar orçamento no histórico..."
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
                            const lucro = Number(resultados.lucroLiquido || resultados.lucro || (precoVenda * (margemPct / 100)));

                            return (
                                <div key={projeto.id} className="group relative bg-zinc-900/40 border border-white/5 rounded-2xl p-4 transition-all duration-300 hover:bg-zinc-900/60 hover:border-white/10">

                                    <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full transition-all duration-500 ${isAprovado ? 'bg-sky-500 shadow-[2px_0_10px_rgba(14,165,233,0.4)]' :
                                        margemPct >= MARGEM_MINIMA_IDEAL ? 'bg-emerald-500' : 'bg-red-500 animate-pulse shadow-[2px_0_10px_rgba(239,68,68,0.4)]'
                                        }`} />

                                    <div className="flex justify-between items-start mb-3 pl-2">
                                        <div className="min-w-0">
                                            <h3 className="text-xs font-bold text-white truncate pr-2">
                                                {projeto.label || "Projeto sem nome"}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-zinc-500 mt-0.5">
                                                <Calendar size={10} />
                                                <span className="text-[10px] font-medium tracking-tight">
                                                    {formatarDataLocal(projeto.timestamp || projeto.created_at)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <div className={`text-[9px] font-black flex items-center justify-end gap-1 mb-0.5 ${margemPct >= MARGEM_MINIMA_IDEAL ? 'text-emerald-400' : 'text-red-400'
                                                }`}>
                                                <TrendingUp size={10} /> {Math.round(margemPct)}%
                                            </div>
                                            <div className="text-sm font-black text-white font-mono leading-none">
                                                {formatCurrency(precoVenda)}
                                            </div>
                                            
                                            <div className="text-[10px] font-bold mt-1.5 flex items-center justify-end gap-1">
                                                <span className="text-zinc-600 text-[8px] tracking-widest uppercase">Lucro</span>
                                                <span className={lucro > 0 ? "text-emerald-500" : "text-red-500"}>
                                                    {formatCurrency(lucro)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mb-4 pl-2 text-zinc-500">
                                        <div className="flex items-center gap-1.5">
                                            <Package size={12} className="opacity-50" />
                                            <span className="text-[10px] font-bold">
                                                {(Number(dados.entradas?.material?.pesoModelo || 0) * Number(dados.entradas?.qtdPecas || 1)).toFixed(0)}g
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={12} className="opacity-50" />
                                            <span className="text-[10px] font-bold">
                                                {dados.entradas?.tempo?.impressaoHoras || 0}h{dados.entradas?.tempo?.impressaoMinutos || 0}m
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-1.5">
                                        {!isAprovado ? (
                                            <button
                                                type="button"
                                                onClick={() => perguntarAprovacao(projeto, margemPct)}
                                                className={`flex-1 h-9 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-95 ${margemPct < MARGEM_MINIMA_IDEAL
                                                    ? 'bg-red-600/10 border border-red-500/20 text-red-500 hover:bg-red-600 hover:text-white'
                                                    : 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-600 hover:text-white'
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
                                                    navigate("/orcamentos"); // Também navega ao clicar em Ver Orçamento
                                                }}
                                                className="flex-1 h-9 rounded-lg bg-sky-600 border border-sky-400/20 text-white text-[10px] font-black uppercase tracking-wider hover:bg-sky-500 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-sky-900/20 active:scale-95"
                                            >
                                                <ExternalLink size={14} /> Ver Orçamento
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => { onRestore(projeto); onClose(); }}
                                            title="Restaurar dados no simulador"
                                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-800/40 text-zinc-400 hover:text-white transition-all active:scale-90"
                                        >
                                            <RotateCcw size={14} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => perguntarExclusao(projeto.id)}
                                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-800/40 text-zinc-600 hover:text-rose-500 transition-all active:scale-90"
                                        >
                                            <Trash2 size={14} />
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
                    <div className="p-4 border-t border-white/5 bg-zinc-900/10">
                        <button
                            type="button"
                            onClick={perguntarLimparTudo}
                            className="w-full h-10 rounded-xl border border-rose-500/10 text-rose-500/40 hover:text-rose-400 hover:border-rose-500/30 text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all group"
                        >
                            <Trash2 size={14} className="group-hover:animate-pulse" /> Purgar Histórico Completo
                        </button>
                    </div>
                )}
            </aside>

            <Popup
                isOpen={confirmacao.open}
                onClose={fecharConfirmacao}
                title={confirmacao.title}
                subtitle="Validação de Sistema"
                icon={confirmacao.icon}
                footer={
                    <div className="flex gap-2 w-full">
                        <button
                            onClick={fecharConfirmacao}
                            className="flex-1 h-12 rounded-xl bg-zinc-900 text-zinc-500 text-[10px] font-black uppercase hover:text-white transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={confirmacao.onConfirm}
                            className={`flex-[2] h-12 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 ${confirmacao.variant === 'danger' ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20' : 'bg-sky-600 hover:bg-sky-500 shadow-sky-900/20'}`}
                        >
                            Confirmar Ação
                        </button>
                    </div>
                }
            >
                <div className="p-6 text-center text-zinc-400 text-sm font-medium leading-relaxed">{confirmacao.message}</div>
            </Popup>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(14,165,233,0.2); }
            `}} />
        </>
    );
}
