// src/features/calculadora/components/historico.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
    X, History, Package, RotateCcw, Trash2, Search,
    Database, Loader2, Calendar, TrendingUp, Clock, Check
} from "lucide-react";
import { useProjectsStore } from "../../orcamentos/logic/projects";
import { formatCurrency } from "../../../utils/numbers";

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

    // Sincroniza com o banco de dados sempre que a gaveta é aberta
    useEffect(() => {
        if (open) buscarHistorico();
    }, [open, buscarHistorico]);

    // Filtra a lista de projetos com base no termo de busca
    const projetosFiltrados = useMemo(() => {
        const listaSegura = Array.isArray(projetos) ? projetos : [];
        return listaSegura.filter((item) =>
            (item.label || "").toLowerCase().includes(busca.toLowerCase())
        );
    }, [projetos, busca]);

    /**
     * Formata datas vindas do Banco de Dados (ISO ou Timestamp)
     * para o padrão brasileiro amigável.
     */
    const formatarDataLocal = (stringData) => {
        if (!stringData) return "Data Indisponível";
        try {
            const data = new Date(stringData);
            return new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(data);
        } catch {
            return stringData;
        }
    };

    return (
        <>
            {/* Overlay (Fundo escurecido) */}
            <div
                className={`fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            {/* Gaveta Lateral */}
            <aside className={`fixed top-0 right-0 z-[101] h-screen w-full sm:w-[450px] bg-zinc-950 border-l border-white/5 shadow-[20px_0_50px_rgba(0,0,0,0.5)] transition-transform duration-500 flex flex-col ${open ? "translate-x-0" : "translate-x-full"}`}>

                {/* Cabeçalho da Gaveta */}
                <div className="h-24 px-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sky-500 shadow-inner">
                            {estaCarregando ? <Loader2 size={24} className="animate-spin" /> : <History size={24} />}
                        </div>
                        <div>
                            <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-1">MakersLog Cloud</h2>
                            <p className="text-xs font-bold text-white uppercase tracking-wider">Histórico de Orçamentos</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Campo de Pesquisa */}
                <div className="p-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                        <input
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl pl-12 pr-4 h-12 text-sm font-medium text-zinc-300 outline-none focus:border-sky-500/50 transition-all"
                            placeholder="Buscar projeto no histórico..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                    </div>
                </div>

                {/* Lista de Projetos */}
                <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4 custom-scrollbar">
                    {projetosFiltrados.length > 0 ? (
                        projetosFiltrados.map((projeto) => {
                            // Extração segura de dados baseado no contrato do projects.js
                            const dados = projeto.data || {};
                            const entradas = dados.entradas || {};
                            const resultados = dados.resultados || {};
                            const status = dados.status || "rascunho";
                            const quantidade = Number(entradas.qtdPecas || 1);

                            const margemEfetiva = Number(resultados.margemEfetivaPct || 0);
                            const valorVendaFinal = resultados.precoComDesconto || resultados.precoSugerido || 0;

                            // Cálculo de Peso considerando Múltiplas Cores e Quantidade total
                            const slotsMaterial = entradas.material?.slots || [];
                            const pesoUnitario = slotsMaterial.length > 0
                                ? slotsMaterial.reduce((acc, s) => acc + (Number(s.weight) || 0), 0)
                                : (Number(entradas.material?.pesoModelo) || 0);

                            const pesoTotalPedido = pesoUnitario * quantidade;

                            // Tempo de impressão formatado
                            const horas = entradas.tempo?.impressaoHoras || 0;
                            const minutos = entradas.tempo?.impressaoMinutos || 0;

                            return (
                                <div
                                    key={projeto.id}
                                    className="bg-zinc-900/30 border border-white/5 rounded-3xl p-5 hover:bg-zinc-900/60 hover:border-zinc-700/50 transition-all cursor-default group relative overflow-hidden space-y-4"
                                >
                                    {/* Indicador Lateral de Status/Saúde */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${status === 'aprovado' ? 'bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]' : margemEfetiva > 15 ? 'bg-emerald-500' : margemEfetiva > 0 ? 'bg-amber-500' : 'bg-rose-500'}`} />

                                    <div className="flex justify-between items-start">
                                        <div className="min-w-0">
                                            <h3 className="font-black text-white text-lg tracking-tighter uppercase truncate pr-4">
                                                {projeto.label || "Projeto sem nome"}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Calendar size={12} className="text-zinc-600" />
                                                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                                                    {formatarDataLocal(projeto.timestamp || projeto.created_at || dados.ultimaAtualizacao)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className={`text-[10px] font-black font-mono flex items-center justify-end gap-1 mb-1 ${margemEfetiva > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                <TrendingUp size={12} />
                                                {Math.round(margemEfetiva)}%
                                            </div>
                                            <div className="text-xl font-black text-white font-mono leading-none">
                                                {formatCurrency(valorVendaFinal)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detalhes Técnicos Rápidos */}
                                    <div className="flex gap-6">
                                        <div className="flex items-center gap-2">
                                            <Package size={12} className={slotsMaterial.length > 0 ? "text-sky-500" : "text-zinc-700"} />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-zinc-400 font-mono leading-none">{pesoTotalPedido}g</span>
                                                <span className="text-[6px] font-black text-zinc-600 uppercase tracking-widest">Insumo Total</span>
                                            </div>
                                        </div>
                                        <div className="items-center flex gap-2">
                                            <Clock size={12} className="text-zinc-700" />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-zinc-400 font-mono leading-none">
                                                    {horas}h{minutos > 0 ? `${minutos}m` : ''}
                                                </span>
                                                <span className="text-[6px] font-black text-zinc-600 uppercase tracking-widest">Tempo Peça</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ações de Controle */}
                                    <div className="flex gap-2 pt-2 border-t border-white/5">

                                        {/* Aprovação e Baixa de Estoque */}
                                        {status === 'rascunho' ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (confirm("Deseja aprovar este orçamento? O estoque será baixado e o projeto irá para Produção.")) aprovarOrcamento(projeto);
                                                }}
                                                className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-black uppercase flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                                            >
                                                <Check size={14} strokeWidth={3} /> Aprovar Projeto
                                            </button>
                                        ) : (
                                            <div className="flex-1 h-10 rounded-xl bg-zinc-800/30 border border-white/5 text-zinc-600 text-[9px] font-black uppercase flex items-center justify-center gap-2">
                                                <Check size={14} className="text-sky-500" /> Orçamento Aprovado
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => { onRestore(projeto); onClose(); }}
                                            title="Restaurar na Calculadora"
                                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-sky-600/10 border border-sky-500/20 text-sky-500 hover:bg-sky-600 hover:text-white transition-all"
                                        >
                                            <RotateCcw size={16} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => { if (confirm("Remover este registro permanentemente?")) removerEntrada(projeto.id); }}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-600 hover:text-rose-500 hover:border-rose-500/30 transition-all"
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
                            <div className="text-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Histórico Vazio</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Rodapé de Gerenciamento de Dados */}
                {projetosFiltrados.length > 3 && (
                    <div className="p-6 border-t border-white/5 bg-zinc-900/10">
                        <button
                            type="button"
                            onClick={() => { if (confirm("Atenção: Isso apagará TODOS os orçamentos salvos. Continuar?")) limparHistorico(); }}
                            className="w-full h-12 rounded-2xl border border-rose-500/20 text-rose-500/50 hover:text-rose-500 hover:bg-rose-500/5 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                        >
                            <Trash2 size={14} /> Limpar Base de Dados
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
}