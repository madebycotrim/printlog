import React, { useEffect, useMemo, useState } from "react";
import {
    X, History, Package, RotateCcw, Trash2, Search,
    Database, Loader2, Calendar, TrendingUp, Clock, Check
} from "lucide-react";
import { useProjectsStore } from "../../orcamentos/logic/projects";
import { formatCurrency } from "../../../utils/numbers";

export default function PopupHistorico({ open, onClose, onRestore }) {
    const {
        projects: projetos,
        fetchHistory: buscarHistorico,
        removeHistoryEntry: removerEntrada,
        clearHistory: limparHistorico,
        approveBudget: aprovarOrcamento,
        isLoading: estaCarregando
    } = useProjectsStore();

    const [busca, setBusca] = useState("");

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

    if (!open && !estaCarregando && projetos.length === 0) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${open ? "visible" : "invisible"}`}>
            
            {/* Overlay (Fundo escurecido) */}
            <div
                className={`absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
                onClick={onClose}
            />

            {/* Contêiner do Popup */}
            <div className={`relative z-[101] w-full max-w-2xl max-h-[90vh] bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden transition-all duration-300 transform ${open ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>

                {/* Cabeçalho */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sky-500 shadow-inner">
                            {estaCarregando ? <Loader2 size={24} className="animate-spin" /> : <History size={24} />}
                        </div>
                        <div>
                            <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-1">MakersLog Cloud</h2>
                            <p className="text-sm font-bold text-white uppercase tracking-wider">Histórico de orçamentos</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-all hover:rotate-90"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Busca */}
                <div className="px-6 pt-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                        <input
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl pl-12 pr-4 h-12 text-sm font-medium text-zinc-300 outline-none focus:border-sky-500/50 transition-all"
                            placeholder="Pesquisar projeto..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                    </div>
                </div>

                {/* Conteúdo rolável */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
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

                            return (
                                <div
                                    key={projeto.id}
                                    className="bg-zinc-900/40 border border-white/5 rounded-3xl p-5 hover:bg-zinc-900/60 hover:border-zinc-700/50 transition-all group relative overflow-hidden"
                                >
                                    {/* Barra de Status */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${status === 'aprovado' ? 'bg-sky-500' : margemEfetiva > 15 ? 'bg-emerald-500' : 'bg-amber-500'}`} />

                                    <div className="flex justify-between items-start mb-4">
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-white text-lg tracking-tight truncate pr-4">
                                                {projeto.label || "Projeto sem nome"}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Calendar size={12} className="text-zinc-600" />
                                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                                    {formatarDataLocal(projeto.timestamp || projeto.created_at || projeto.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className={`text-[10px] font-black flex items-center justify-end gap-1 mb-1 ${margemEfetiva > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                <TrendingUp size={12} />
                                                {Math.round(margemEfetiva)}%
                                            </div>
                                            <div className="text-xl font-black text-white font-mono">
                                                {formatCurrency(valorVendaFinal)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-6 mb-5">
                                        <div className="flex items-center gap-2">
                                            <Package size={14} className="text-zinc-500" />
                                            <span className="text-xs font-bold text-zinc-300">{pesoTotalPedido}g total</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} className="text-zinc-500" />
                                            <span className="text-xs font-bold text-zinc-300">{horas}h{minutos}m / pc</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {status === 'rascunho' ? (
                                            <button
                                                type="button"
                                                onClick={() => { if (window.confirm("Aprovar orçamento e atualizar estoque?")) aprovarOrcamento(projeto); }}
                                                className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
                                            >
                                                <Check size={14} strokeWidth={3} /> Aprovar
                                            </button>
                                        ) : (
                                            <div className="flex-1 h-10 rounded-xl bg-zinc-800/50 border border-white/5 text-sky-500 text-[10px] font-black uppercase flex items-center justify-center gap-2">
                                                <Check size={14} /> Já Aprovado
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => { onRestore(projeto); onClose(); }}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-sky-600/10 border border-sky-500/20 text-sky-500 hover:bg-sky-600 hover:text-white transition-all"
                                        >
                                            <RotateCcw size={16} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => { if (window.confirm("Apagar registro permanentemente?")) removerEntrada(projeto.id); }}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-600 hover:text-rose-500 hover:border-rose-500/30 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="h-48 flex flex-col items-center justify-center text-zinc-800 gap-4 opacity-40">
                            <Database size={48} strokeWidth={1} />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Histórico Vazio</p>
                        </div>
                    )}
                </div>

                {/* Rodapé */}
                {projetosFiltrados.length > 3 && (
                    <div className="p-6 border-t border-white/5 bg-zinc-900/10 flex justify-between items-center">
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                            {projetosFiltrados.length} Registros encontrados
                        </p>
                        <button
                            type="button"
                            onClick={() => { if (window.confirm("Isso apagará TODO o histórico. Confirmar?")) limparHistorico(); }}
                            className="px-4 h-10 rounded-xl border border-rose-500/20 text-rose-500/50 hover:text-rose-500 hover:bg-rose-500/5 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
                        >
                            <Trash2 size={14} /> Limpar Base
                        </button>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
            `}} />
        </div>
    );
}
