import React, { memo, useMemo } from "react";
import { Edit2, Trash2, ArrowDownFromLine } from "lucide-react";
import SpoolSideView from "./Carretel";
import { SegmentedProgress } from "../../../components/ui/SegmentedProgress";


/**
 * MODO GRADE: FilamentCard
 */
export const FilamentCard = memo(({ item, onEdit, onDelete, onConsume }) => {
    // Lógica de Negócio (Preservada conforme original)
    const stats = useMemo(() => {
        const capacidade = Math.max(1, Number(item?.peso_total) || 1000);
        const atual = Math.max(0, Number(item?.peso_atual) || 0);
        const precoRolo = Number(item?.preco || 0);
        const pct = Math.min(100, Math.max(0, Math.round((atual / capacidade) * 100)));

        return {
            atual,
            pct,
            ehCritico: pct <= 20,
            valorNoRolo: ((precoRolo / capacidade) * atual).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            })
        };
    }, [item?.peso_atual, item?.peso_total, item?.preco]);

    const corHex = item?.cor_hex || "#3b82f6";

    return (
        <div className={`
            group relative bg-zinc-950/40/40 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-500
            border ${stats.ehCritico
                ? 'border-rose-500/40 bg-rose-500/[0.03] shadow-[0_0_20px_rgba(244,63,94,0.05)]'
                : 'border-zinc-800/60 hover:border-zinc-800/50/80 shadow-sm'}
        `}>
            <div className="flex h-[195px]">

                {/* BARRA LATERAL (75px) */}
                <div className="w-[75px] bg-zinc-950/40 border-r border-zinc-800/50 flex flex-col items-center py-6 justify-between shrink-0">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 bg-zinc-900/50 border border-zinc-800/50 shadow-inner">
                        <SpoolSideView color={corHex} percent={stats.pct} size={50} />
                    </div>

                    <div className="rotate-180 [writing-mode:vertical-lr] flex items-center opacity-40 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] whitespace-nowrap text-zinc-500">
                            {item?.marca || 'MARCA GENÉRICA'}
                        </span>
                    </div>
                </div>

                {/* PAINEL CENTRAL */}
                <div className="flex-1 p-6 flex flex-col justify-between min-w-0">
                    {/* CABEÇALHO */}
                    <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-black uppercase tracking-tight truncate leading-none text-zinc-100 group-hover:text-rose-400 transition-colors">
                                {item?.nome || "Sem Nome"}
                            </h3>
                            <p className="text-[10px] font-mono font-bold text-zinc-600 mt-2.5 uppercase tracking-widest">
                                ID: <span className="text-zinc-500">{String(item?.id || '0000').slice(-4).toUpperCase()}</span>
                            </p>
                        </div>
                        <div className={`shrink-0 px-2 py-1 rounded-md border text-[8px] font-black uppercase tracking-widest ${stats.ehCritico ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse' : 'bg-zinc-950/40 border-zinc-800 text-zinc-600'
                            }`}>
                            {stats.ehCritico ? 'CRÍTICO' : 'ESTÁVEL'}
                        </div>
                    </div>

                    {/* MÉTRICA PRINCIPAL (GRAMAS) */}
                    <div className="space-y-3">
                        <div className="flex items-baseline justify-between">
                            <div className="flex items-baseline gap-1.5">
                                <span className={`text-4xl font-black tracking-tighter transition-colors ${stats.ehCritico ? 'text-rose-500' : 'text-zinc-100'}`}>
                                    {Math.round(stats.atual)}
                                </span>
                                <span className="text-[10px] font-black text-zinc-500 uppercase">Gramas</span>
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-tighter ${stats.ehCritico ? 'text-rose-400' : 'text-zinc-500'}`}>
                                {stats.pct}%
                            </span>
                        </div>
                        <SegmentedProgress pct={stats.pct} color={corHex} pulse={stats.ehCritico} />
                    </div>

                    {/* RODAPÉ DE INFO (FILAMENTO) */}
                    <div className="flex justify-between items-end pt-3 mt-1 border-t border-zinc-800/40">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1">Material</span>
                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider truncate">
                                {item?.material || "PLA"}
                            </span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1">Custo no Carretel</span>
                            <span className="text-[12px] font-bold text-emerald-500/80 font-mono">
                                {stats.valorNoRolo}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* AÇÕES DE RODAPÉ */}
            <div className="grid grid-cols-[1fr_50px_50px] h-11 bg-zinc-950/60 border-t border-zinc-800/50">
                <button
                    onClick={() => onConsume(item)}
                    className="flex items-center justify-center gap-2.5 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-rose-400 hover:bg-rose-500/[0.03] transition-all group/btn"
                >
                    <ArrowDownFromLine size={14} className="group-hover/btn:scale-110 transition-transform" />
                    Baixa de Estoque
                </button>
                <button
                    onClick={() => onEdit(item)}
                    className="flex items-center justify-center border-l border-zinc-800/50 text-zinc-600 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all"
                >
                    <Edit2 size={14} />
                </button>
                <button
                    onClick={() => onDelete(item?.id)}
                    className="flex items-center justify-center border-l border-zinc-800/50 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
});

/**
 * MODO LISTA: FilamentRow
 */
export const FilamentRow = memo(({ item, onEdit, onDelete, onConsume }) => {
    const stats = useMemo(() => {
        const capacidade = Math.max(1, Number(item?.peso_total) || 1000);
        const atual = Math.max(0, Number(item?.peso_atual) || 0);
        return {
            atual,
            pct: Math.min(100, Math.max(0, Math.round((atual / capacidade) * 100)))
        };
    }, [item?.peso_atual, item?.peso_total]);

    const ehCritico = stats.pct <= 20;
    const corHex = item?.cor_hex || "#3b82f6";

    return (
        <div className={`
            grid grid-cols-[60px_1fr_repeat(3,50px)] h-12 bg-zinc-950/40/40 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300
            border ${ehCritico ? 'border-rose-500/30 bg-rose-500/[0.02]' : 'border-zinc-800/60 hover:border-zinc-800/50/80'} items-center group
        `}>
            {/* ÍCONE LATERAL ROW */}
            <div className="flex items-center justify-center bg-zinc-950/40 h-full border-r border-zinc-800/50">
                <SpoolSideView color={corHex} percent={stats.pct} size={24} />
            </div>

            {/* INFO CENTRAL ROW */}
            <div className="flex items-center px-6 justify-between min-w-0 h-full">
                <div className="flex items-center gap-4 min-w-0">
                    <h3 className="text-[11px] font-black uppercase tracking-wider truncate text-zinc-200 group-hover:text-rose-400 transition-colors">
                        {item?.nome || "Sem identificação"}
                    </h3>
                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-zinc-900/50 text-zinc-500 uppercase tracking-tighter">
                        {item?.material}
                    </span>
                </div>

                <div className="flex items-center gap-8 shrink-0">
                    <span className={`text-[12px] font-bold font-mono min-w-[55px] text-right ${ehCritico ? 'text-rose-400' : 'text-zinc-400'}`}>
                        {Math.round(stats.atual)}g
                    </span>
                    <div className="w-32 hidden lg:block">
                        <SegmentedProgress pct={stats.pct} color={corHex} pulse={ehCritico} />
                    </div>
                </div>
            </div>

            {/* AÇÕES ROW */}
            <button
                onClick={() => onConsume(item)}
                title="Baixa Rápida"
                className="flex items-center justify-center gap-2.5 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900/50/30 transition-all group/btn"
            >
                <ArrowDownFromLine size={15} className={`transition-transform group-hover/btn:scale-110 ${ehCritico ? 'text-rose-500 animate-pulse' : 'text-zinc-600'}`} />
            </button>
            <button
                onClick={() => onEdit(item)}
                title="Editar"
                className="flex items-center justify-center h-full border-l border-zinc-800/50 text-zinc-600 hover:text-zinc-100 hover:bg-zinc-900/50/40 transition-all"
            >
                <Edit2 size={14} />
            </button>
            <button
                onClick={() => onDelete(item?.id)}
                title="Excluir"
                className="flex items-center justify-center h-full border-l border-zinc-800/50 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
            >
                <Trash2 size={14} />
            </button>
        </div>
    );
});
