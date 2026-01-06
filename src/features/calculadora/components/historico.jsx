import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
    X, History, Package, RotateCcw, Trash2, Search,
    Database, Loader2, Calendar, TrendingUp, Clock, Check, AlertTriangle, CheckCircle2
} from "lucide-react";
import { useProjectsStore } from "../../orcamentos/logic/projects";
import { formatCurrency } from "../../../utils/numbers";
import Popup from "../../../components/Popup"; // Certifique-se do caminho correto

export default function GavetaHistorico({ open, onClose, onRestore }) {
    const {
        projects: projetos,
        fetchHistory: buscarHistorico,
        removeHistoryEntry: removerEntrada,
        clearHistory: limparHistorico,
        approveBudget: aprovarOrcamento,
        isLoading: estaCarregando
    } = useProjectsStore();

    const [busca, setBusca] = useState("");

    // Estado para gerenciar o Popup de Confirmação
    const [confirmacao, setConfirmacao] = useState({
        open: false,
        title: "",
        message: "",
        onConfirm: null,
        icon: AlertTriangle,
        color: "text-sky-500"
    });

    const fecharConfirmacao = () => setConfirmacao(prev => ({ ...prev, open: false }));

    // Handlers para abrir a confirmação
    const perguntarAprovacao = (projeto) => {
        setConfirmacao({
            open: true,
            title: "Aprovar Projeto",
            message: "Quer aprovar esse orçamento? O estoque será atualizado e o projeto irá para a produção.",
            icon: Check,
            color: "text-emerald-500",
            onConfirm: () => {
                aprovarOrcamento(projeto);
                fecharConfirmacao();
            }
        });
    };

    const perguntarExclusao = (id) => {
        setConfirmacao({
            open: true,
            title: "Excluir Registro",
            message: "Tem certeza que deseja apagar esse registro para sempre? Esta ação não pode ser desfeita.",
            icon: Trash2,
            color: "text-rose-500",
            onConfirm: () => {
                removerEntrada(id);
                fecharConfirmacao();
            }
        });
    };

    const perguntarLimparTudo = () => {
        setConfirmacao({
            open: true,
            title: "Limpar Histórico",
            message: "Atenção: isso vai apagar TODOS os orçamentos salvos. Quer continuar?",
            icon: AlertTriangle,
            color: "text-rose-500",
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
        const listaSegura = Array.isArray(projetos) ? projetos : [];
        return listaSegura.filter((item) =>
            (item.label || "").toLowerCase().includes(busca.toLowerCase())
        );
    }, [projetos, busca]);

    const formatarDataLocal = (stringData) => {
        if (!stringData) return "Data indisponível";
        try {
            const data = new Date(stringData);
            return new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            }).format(data);
        } catch { return stringData; }
    };

    return (
        <>
            <div
                className={`fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            <aside className={`fixed top-0 right-0 z-[101] h-screen w-full sm:w-[450px] bg-zinc-950 border-l border-white/5 shadow-[20px_0_50px_rgba(0,0,0,0.5)] transition-transform duration-500 flex flex-col ${open ? "translate-x-0" : "translate-x-full"}`}>

                <div className="h-24 px-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sky-500 shadow-inner">
                            {estaCarregando ? <Loader2 size={24} className="animate-spin" /> : <History size={24} />}
                        </div>
                        <div>
                            <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-1">MakersLog Cloud</h2>
                            <p className="text-xs font-bold text-white uppercase tracking-wider">Histórico de orçamentos</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                        <input
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl pl-12 pr-4 h-12 text-sm font-medium text-zinc-300 outline-none focus:border-sky-500/50 transition-all"
                            placeholder="Pesquisar projeto no histórico..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4 custom-scrollbar">
                    {projetosFiltrados.length > 0 ? (
                        projetosFiltrados.map((projeto) => {
                            const dados = projeto.data || projeto.payload || {};
                            const entradas = dados.entradas || {};
                            const resultados = dados.resultados || {};
                            const status = dados.status || "rascunho";
                            const quantidade = Number(entradas.qtdPecas || 1);
                            const margemEfetiva = Number(resultados.margemEfetivaPct || 0);
                            const valorVendaFinal = resultados.precoComDesconto || resultados.precoSugerido || 0;

                            const slotsMaterial = entradas.material?.slots || [];
                            const pesoUnitario = slotsMaterial.length > 0
                                ? slotsMaterial.reduce((acc, s) => acc + (Number(s.weight) || 0), 0)
                                : (Number(entradas.material?.pesoModelo) || 0);

                            const pesoTotalPedido = (pesoUnitario * quantidade).toFixed(0);
                            const horas = entradas.tempo?.impressaoHoras || 0;
                            const minutos = entradas.tempo?.impressaoMinutos || 0;

                            const isAprovado = status === 'aprovado';

                            return (
                                <div
                                    key={projeto.id}
                                    className="group relative bg-zinc-900/40 border border-white/5 rounded-[2rem] p-5 transition-all duration-300 hover:bg-zinc-900/60 hover:border-white/10"
                                >
                                    {/* Indicador Lateral Refinado */}
                                    <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full transition-all duration-500 ${isAprovado ? 'bg-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.4)]' :
                                        margemEfetiva > 20 ? 'bg-emerald-500' : 'bg-amber-500'
                                        }`} />

                                    <div className="flex justify-between items-start mb-6">
                                        <div className="min-w-0 pl-2">
                                            <h3 className="text-sm font-bold text-white uppercase tracking-tight truncate mb-1">
                                                {projeto.label || "Sem nome"}
                                            </h3>
                                            <div className="flex items-center gap-2 text-zinc-500">
                                                <Calendar size={12} />
                                                <span className="text-[10px] font-medium tracking-wider">
                                                    {formatarDataLocal(projeto.timestamp || projeto.created_at)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className={`text-[10px] font-black font-mono flex items-center justify-end gap-1 mb-1 ${margemEfetiva > 0 ? 'text-emerald-500' : 'text-rose-500'
                                                }`}>
                                                <TrendingUp size={12} /> {Math.round(margemEfetiva)}%
                                            </div>
                                            <div className="text-lg font-black text-white font-mono leading-none">
                                                {formatCurrency(valorVendaFinal)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Grid de Specs Técnicas */}
                                    <div className="grid grid-cols-2 gap-4 mb-6 px-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-center text-zinc-500">
                                                <Package size={14} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-zinc-300 font-mono leading-tight">{pesoTotalPedido}g</span>
                                                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Insumo Total</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-center text-zinc-500">
                                                <Clock size={14} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-zinc-300 font-mono leading-tight">{horas}h{minutos > 0 ? `${minutos}m` : '00'}</span>
                                                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Tempo Peça</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ações do Card */}
                                    <div className="flex gap-2">
                                        {!isAprovado ? (
                                            <button
                                                type="button"
                                                onClick={() => perguntarAprovacao(projeto)}
                                                className={`flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest 
        flex items-center justify-center gap-2 transition-all active:scale-95
        ${margemEfetiva > 20
                                                        ? 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-600 hover:text-white'
                                                        : 'bg-amber-600/10 border border-amber-500/20 text-amber-500 hover:bg-amber-600 hover:text-white'
                                                    }`}
                                            >
                                                <Check size={14} strokeWidth={3} /> Aprovar Orçamento
                                            </button>
                                        ) : (
                                            <div className="flex-1 h-10 rounded-xl bg-zinc-950/50 border border-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                                <CheckCircle2 size={14} className="text-sky-500" /> Sincronizado
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => { onRestore(projeto); onClose(); }}
                                            title="Restaurar"
                                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-900 border border-white/5 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all active:scale-90"
                                        >
                                            <RotateCcw size={16} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => perguntarExclusao(projeto.id)}
                                            title="Excluir"
                                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-900 border border-white/5 text-zinc-600 hover:text-rose-500 hover:border-rose-500/20 transition-all active:scale-90"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-zinc-800 gap-4 opacity-40">
                            <Database size={48} strokeWidth={1} />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Histórico Vazio</p>
                        </div>
                    )}
                </div>

                {projetosFiltrados.length > 3 && (
                    <div className="p-6 border-t border-white/5 bg-zinc-900/10">
                        <button type="button" onClick={perguntarLimparTudo} className="w-full h-12 rounded-2xl border border-rose-500/20 text-rose-500/50 hover:text-rose-500 hover:bg-rose-500/5 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                            <Trash2 size={14} /> Limpar banco de dados
                        </button>
                    </div>
                )}
            </aside>

            {/* POPUP DE CONFIRMAÇÃO UNIFICADO */}
            <Popup
                isOpen={confirmacao.open}
                onClose={fecharConfirmacao}
                title={confirmacao.title}
                subtitle="Confirmação Requerida"
                icon={confirmacao.icon}
                footer={
                    <div className="flex gap-2 w-full">
                        <button
                            onClick={fecharConfirmacao}
                            className="flex-1 h-12 rounded-xl bg-zinc-900 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={confirmacao.onConfirm}
                            className={`flex-[2] h-12 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${confirmacao.color.includes('rose') ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                        >
                            Confirmar Ação
                        </button>
                    </div>
                }
            >
                <div className="p-8 text-center">
                    <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                        {confirmacao.message}
                    </p>
                </div>
            </Popup>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
            `}} />
        </>
    );
}
