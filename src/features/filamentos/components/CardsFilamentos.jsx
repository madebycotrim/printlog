import React, { memo, useMemo } from "react";
import { Edit2, Trash2, ArrowDownFromLine, Copy, History, Droplet } from "lucide-react"; // Droplet added
import SpoolVectorView from "./Carretel";
import { SegmentedProgress } from "../../../components/ui/SegmentedProgress";
import { Tooltip } from "../../../components/ui/Tooltip";


/**
 * MODO GRADE: FilamentCard (Premium Theme)
 */
export const FilamentCard = memo(({ item, currentHumidity, currentTemperature, onEdit, onDelete, onConsume, onDuplicate, onHistory }) => {
    // Lógica de Negócio
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
    const isHygroscopic = ['PLA', 'PETG', 'TPU', 'NYLON', 'ABS', 'ASA'].includes(item?.material?.toUpperCase());
    const moistureRisk = isHygroscopic && (currentHumidity > 50);

    return (
        <div
            className={`
                group relative flex flex-col justify-between
                bg-[#09090b] backdrop-blur-md rounded-3xl overflow-hidden 
                transition-all duration-500 border
                ${stats.ehCritico
                    ? 'border-rose-500/30 hover:border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.1)]'
                    : 'border-white/5 hover:border-white/10 hover:shadow-2xl hover:shadow-black/50'}
            `}
        >
            {/* Trama de Fundo */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]" />

            {/* Brilho Superior */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-500 ${stats.ehCritico ? 'w-full via-rose-500/30' : ''}`} />

            <div className="flex flex-1 p-6 relative z-10">
                {/* BARRA LATERAL (Vector Spool) */}
                <div className="mr-5 flex flex-col items-center gap-3">
                    <div className="w-16 h-16 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                        <SpoolVectorView color={corHex} percent={stats.pct} size={64} />
                    </div>

                    <div className="h-full w-px bg-gradient-to-b from-white/10 to-transparent mx-auto" />
                </div>

                {/* PAINEL CENTRAL */}
                <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                        <div className="flex flex-col min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{item?.marca || 'GENÉRICA'}</span>
                                {stats.ehCritico && (
                                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-500 animate-pulse">
                                        <ArrowDownFromLine size={10} />
                                        <span className="text-[8px] font-black uppercase tracking-wider">Acabando</span>
                                    </div>
                                )}
                                {/* Moisture Risk Indicator */}
                                {moistureRisk && (
                                    <Tooltip content="Alta Umidade: Risco de absorção">
                                        <div className="flex items-center gap-1 text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded-md border border-sky-500/20 cursor-help">
                                            <Droplet size={10} className="fill-current" />
                                            <span className="text-[8px] font-black uppercase tracking-wider">Úmido</span>
                                        </div>
                                    </Tooltip>
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-zinc-100 uppercase tracking-tight truncate leading-none group-hover:text-white transition-colors">
                                {item?.nome || "Sem Nome"}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-zinc-600 font-mono font-bold uppercase">{item?.material || 'PLA'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto space-y-4">
                        {/* WEIGHT BAR */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-end">
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-2xl font-bold font-mono tracking-tighter ${stats.ehCritico ? 'text-rose-500' : 'text-zinc-100'}`}>
                                        {Math.round(stats.atual)}
                                    </span>
                                    <span className="text-[9px] font-bold text-zinc-600 uppercase">gramas</span>
                                </div>
                                <span className={`text-[10px] font-bold font-mono ${stats.ehCritico ? 'text-rose-400' : 'text-zinc-500'}`}>
                                    {stats.pct}%
                                </span>
                            </div>
                            <SegmentedProgress pct={stats.pct} color={corHex} pulse={stats.ehCritico} height={4} segments={20} />
                        </div>

                        {/* STATS GRID */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                            <div>
                                <span className="text-[9px] font-bold text-zinc-600 block mb-0.5 uppercase tracking-wider">Custo Real</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-[11px] font-bold text-zinc-300 font-mono">
                                        {(Number(item?.preco || 0) / Math.max(1, Number(item?.peso_total || 1000))).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 3 })}
                                    </span>
                                    <span className="text-[8px] text-zinc-600">/g</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[9px] font-bold text-zinc-600 block mb-0.5 uppercase tracking-wider">Último Uso</span>
                                <span className="text-[10px] font-bold text-zinc-400 font-mono">
                                    {(() => {
                                        if (!item?.updated_at) return "Nunca";
                                        const diffTime = Math.abs(new Date() - new Date(item.updated_at));
                                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                        return diffDays <= 1 ? "Hoje" : `${diffDays}d atrás`;
                                    })()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="grid grid-cols-[1fr_repeat(3,45px)] h-11 bg-zinc-950/30 border-t border-white/5 divide-x divide-white/5">
                <button
                    onClick={() => onConsume(item)}
                    className="flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-wider text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/5 transition-colors group/btn"
                >
                    <ArrowDownFromLine size={14} className="group-hover/btn:scale-110 transition-transform" />
                    Registrar Uso
                </button>

                <button
                    onClick={() => onHistory(item)}
                    className="flex items-center justify-center hover:bg-white/5 text-zinc-600 hover:text-sky-400 transition-colors"
                    title="Histórico"
                >
                    <History size={14} />
                </button>
                <button
                    onClick={() => onEdit(item)}
                    className="flex items-center justify-center hover:bg-white/5 text-zinc-600 hover:text-zinc-100 transition-colors"
                    title="Editar"
                >
                    <Edit2 size={14} />
                </button>
                <button
                    onClick={() => onDelete(item?.id)}
                    className="flex items-center justify-center hover:bg-rose-500/10 text-zinc-600 hover:text-rose-500 transition-colors"
                    title="Excluir"
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
export const FilamentRow = memo(({ item, currentHumidity, currentTemperature, onEdit, onDelete, onConsume, onDuplicate, onHistory }) => {
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
    const isHygroscopic = ['PLA', 'PETG', 'TPU', 'NYLON', 'ABS', 'ASA'].includes(item?.material?.toUpperCase());
    const moistureRisk = isHygroscopic && (currentHumidity > 50);

    return (
        <div className={`
            grid grid-cols-[50px_1fr_auto_auto] md:grid-cols-[60px_1fr_200px_240px] lg:grid-cols-[60px_1fr_260px_280px] h-14 
            bg-[#09090b] rounded-2xl overflow-hidden transition-all duration-300
            border ${ehCritico ? 'border-rose-500/30' : 'border-white/5 hover:border-white/10'} items-center group shadow-sm hover:shadow-md
        `}>
            {/* 1. ICON (Fixed Left) */}
            <div className="flex items-center justify-center h-full border-r border-white/5 bg-zinc-900/20">
                <SpoolVectorView color={corHex} percent={stats.pct} size={28} />
            </div>

            {/* 2. MAIN INFO (Name + Badges) */}
            <div className="flex items-center gap-4 px-5 min-w-0">
                <div className="flex flex-col justify-center min-w-0">
                    <div className="flex items-center gap-3 mb-0.5">
                        <h3 className="text-sm font-bold text-zinc-200 truncate group-hover:text-white transition-colors">
                            {item?.nome || "Material Sem Nome"}
                        </h3>
                        {/* Status Badges */}
                        <div className="flex items-center gap-2">
                            {stats.ehCritico && (
                                <Tooltip content="Estoque Baixo">
                                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 animate-pulse">
                                        <ArrowDownFromLine size={10} />
                                    </div>
                                </Tooltip>
                            )}
                            {moistureRisk && (
                                <Tooltip content="Risco de Umidade">
                                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400">
                                        <Droplet size={10} className="fill-current" />
                                    </div>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{item?.marca}</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-800" />
                        <span className="text-[10px] font-bold text-zinc-500 bg-zinc-900/50 px-1.5 rounded">{item?.material}</span>
                    </div>
                </div>
            </div>

            {/* 3. TECH STATS (Weight & Progress) */}
            <div className="hidden md:flex items-center justify-between px-6 border-l border-white/5 h-full bg-zinc-900/10">
                {/* Last Used */}
                <div className="flex flex-col items-start mr-4">
                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider mb-0.5">Último Uso</span>
                    <span className="text-[10px] font-mono font-bold text-zinc-400">
                        {(() => {
                            if (!item?.updated_at) return "-";
                            const diffTime = Math.abs(new Date() - new Date(item.updated_at));
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            return diffDays <= 1 ? "Hoje" : `${diffDays}d atrás`;
                        })()}
                    </span>
                </div>

                {/* Weight & Bar */}
                <div className="flex flex-col items-end w-32">
                    <div className="flex items-baseline gap-1 mb-1">
                        <span className={`text-xs font-bold font-mono ${ehCritico ? 'text-rose-400' : 'text-zinc-300'}`}>
                            {Math.round(stats.atual)}
                        </span>
                        <span className="text-[9px] text-zinc-600 font-bold uppercase">g</span>
                    </div>
                    <SegmentedProgress pct={stats.pct} color={corHex} pulse={ehCritico} height={4} segments={10} />
                </div>
            </div>

            {/* 4. ACTIONS (Fixed Right) */}
            <div className="flex items-center justify-end h-full pr-2 pl-4 border-l border-white/5 gap-1 bg-zinc-900/20">
                <button
                    onClick={() => onConsume(item)}
                    className="h-8 px-4 rounded-lg flex items-center gap-2 bg-zinc-800/50 hover:bg-emerald-500/10 text-zinc-400 hover:text-emerald-400 border border-transparent hover:border-emerald-500/20 transition-all group/btn mr-2"
                    title="Registrar Uso"
                >
                    <ArrowDownFromLine size={14} className="transition-transform group-hover/btn:-translate-y-0.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider hidden lg:inline">Baixa</span>
                </button>

                <div className="flex items-center gap-1">
                    <button onClick={() => onDuplicate(item)} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:text-zinc-200 hover:bg-white/5 transition-all" title="Duplicar">
                        <Copy size={14} />
                    </button>
                    <button onClick={() => onHistory(item)} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:text-sky-400 hover:bg-sky-500/10 transition-all" title="Histórico">
                        <History size={14} />
                    </button>
                    <button onClick={() => onEdit(item)} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:text-zinc-100 hover:bg-white/5 transition-all" title="Editar">
                        <Edit2 size={14} />
                    </button>
                    <button onClick={() => onDelete(item?.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all" title="Excluir">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
});
