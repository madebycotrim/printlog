import React, { memo, useMemo } from "react";
import { Edit2, Trash2, ArrowDownFromLine, Copy, History, Droplet, ShoppingCart, QrCode, ExternalLink, Flame } from "lucide-react";
import { differenceInDays } from "date-fns";

import VisualizacaoMaterial from "./VisualizacaoMaterial";
import { formatCurrency } from "../../../utils/numbers";
import { Tooltip } from "../../../components/ui/Tooltip";
import { MATERIAIS_RESINA_FLAT } from "../logic/constantes";

export const CartaoMaterial = memo(({ item, umidadeAtual, temperaturaAtual, aoEditar, aoExcluir, aoConsumir, aoDuplicar, aoVerHistorico, aoImprimirEtiqueta, highlightedItemId }) => {
    // Lógica de Estatísticas
    const estatisticas = useMemo(() => {
        const capacidade = Math.max(1, Number(item?.peso_total) || 1000);
        const atual = Math.max(0, Number(item?.peso_atual) || 0);
        const porcentagem = Math.min(100, Math.max(0, Math.round((atual / capacidade) * 100)));
        const preco = Number(item?.preco || 0);
        const valorRestante = (preco / capacidade) * atual;

        // Cost per unit (g or ml)
        const custoPorUnidade = capacidade > 0 ? preco / capacidade : 0;

        // Format weight as "Current / Total"
        const pesoFormatado = `${Math.round(atual)} / ${capacidade}`;

        return {
            atual,
            capacidade,
            pesoFormatado,
            porcentagem,
            porcentagemConsumida: 100 - porcentagem,
            ehCritico: porcentagem <= 20,
            valorRestante,
            custoPorUnidade,
            precoTotal: preco
        };
    }, [item?.peso_atual, item?.peso_total, item?.preco]);

    const corHex = item?.cor_hex || "#3b82f6";
    const realTipo = item?.tipo === 'SLA' || MATERIAIS_RESINA_FLAT.some(m => m.toLowerCase() === (item?.material || "").toLowerCase()) ? 'SLA' : 'FDM';
    const unidade = realTipo === 'SLA' ? 'ml' : 'g';

    const isHighlighted = highlightedItemId === item.id;

    return (
        <div className={`group/card relative w-full min-h-[18rem] rounded-3xl overflow-hidden bg-zinc-950 border transition-all duration-500 hover:shadow-2xl ${isHighlighted
            ? 'animate-pulse ring-4 ring-orange-500 shadow-[0_0_50px_rgba(249,115,22,0.5)] z-50 scale-105'
            : estatisticas.ehCritico
                ? 'border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.2)] animate-pulse hover:border-rose-500/60'
                : 'border-white/5 hover:border-white/10'
            }`}>

            {/* --- IMAGE BACKGROUND --- */}
            <div className="absolute inset-0 pb-20 flex items-center justify-center transition-all duration-500 ease-out group-hover/card:-translate-y-12 group-hover/card:scale-90 group-hover/card:opacity-50">
                <div className="relative w-full h-full flex items-center justify-center p-8 scale-125">
                    <div className="absolute inset-0 blur-[80px] opacity-10 rounded-full scale-75 transition-opacity duration-500 group-hover/card:opacity-20" style={{ backgroundColor: corHex }} />
                    <VisualizacaoMaterial cor={corHex} porcentagem={estatisticas.porcentagem} tamanho={110} tipo={realTipo} />

                    {/* Idle Badge (Quantity) - Fades out on hover */}
                    <div className="absolute -bottom-6 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-sm transition-opacity duration-300 group-hover/card:opacity-0 shadow-lg">
                        <div className={`w-1.5 h-1.5 rounded-full ${estatisticas.ehCritico ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                        <span className="text-[10px] font-mono font-bold text-zinc-300">
                            {estatisticas.pesoFormatado}{unidade}
                        </span>
                    </div>
                </div>
            </div>

            {/* --- BADGES (FLOATING) --- */}
            {/* Top Left: Material (Always Visible, matching Printer Card) */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <span className="px-2 py-0.5 rounded-md bg-zinc-900/40 backdrop-blur-md border border-white/5 text-[9px] font-bold uppercase tracking-widest text-zinc-500 transition-opacity duration-300 group-hover/card:opacity-0">
                    {item?.material || "PLA"}
                </span>

                {/* Print Count Badge - Shows how many times this material was used */}
                {item?.usage_count > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/20 backdrop-blur-md border border-blue-500/30 text-[9px] font-bold uppercase tracking-widest text-blue-300 transition-opacity duration-300 group-hover/card:opacity-0">
                        {item.usage_count} {item.usage_count === 1 ? 'impressão' : 'impressões'}
                    </span>
                )}
            </div>

            {/* Top Right: Cart */}
            <div className="absolute top-4 right-4 z-10 transition-opacity duration-300 group-hover/card:opacity-0">
                {item?.url_compra && (
                    <a href={item.url_compra} target="_blank" rel="noreferrer" className={`flex items-center justify-center w-7 h-7 rounded-full border backdrop-blur-md transition-all duration-300 ${estatisticas.ehCritico ? 'bg-blue-500/20 border-blue-500/30 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)] animate-pulse' : 'bg-zinc-900/40 border-white/5 text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10'}`}>
                        <ShoppingCart size={14} strokeWidth={estatisticas.ehCritico ? 2.5 : 2} />
                    </a>
                )}
            </div>

            {/* --- INFO PANEL (SLIDE UP) --- */}
            <div className="absolute inset-x-0 bottom-0 bg-zinc-950/90 backdrop-blur-md border-t border-white/10 transition-all duration-500 ease-out translate-y-[calc(100%-80px)] group-hover/card:translate-y-0 text-left overflow-hidden">

                {/* 1. Header (Always Visible portion) */}
                <div className="h-[90px] px-5 flex flex-col justify-center relative z-20">
                    {/* Decorative top line handle */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-zinc-800 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />

                    <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                            {item?.marca}
                        </span>
                    </div>

                    {/* Name & Status Row (Side by Side) */}
                    <div className="flex items-center justify-between gap-3 mb-2">
                        <h3 className="text-xl font-black leading-[1.1] tracking-tight text-white line-clamp-2 min-h-[1.1em] flex items-center grow shadow-black drop-shadow-md" title={item?.nome}>
                            {item?.nome || "Filamento Sem Nome"}
                        </h3>

                        {/* Status Stats (Idle Only) - Stacked Right */}
                        <div className="flex flex-col items-end shrink-0 mb-0.5 transition-all duration-300 group-hover/card:opacity-0 group-hover/card:translate-x-4">
                            <span className={`text-lg font-black tracking-tight leading-none ${estatisticas.ehCritico ? 'text-rose-500' : 'text-emerald-500'}`}>
                                {Math.round(estatisticas.atual)}{unidade}
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600/80 mt-0.5">
                                Restantes
                            </span>
                        </div>
                    </div>
                </div>
                {/* 2. Expanded Content (Revealed on Hover) */}
                <div className="px-6 pb-6 space-y-4 opacity-0 group-hover/card:opacity-100 transition-all duration-500 delay-75">

                    {/* Grid Stats */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-2">
                        {/* Preço Total (what you paid) */}
                        <div className="flex flex-col">
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5">Preço Total</span>
                            <span className="text-sm font-mono font-bold text-zinc-200">
                                {estatisticas.precoTotal > 0 ? formatCurrency(estatisticas.precoTotal) : 'R$ --'}
                            </span>
                            {estatisticas.custoPorUnidade > 0 && (
                                <span className="text-[9px] font-mono text-zinc-500 mt-0.5">
                                    {formatCurrency(estatisticas.custoPorUnidade)}/{unidade}
                                </span>
                            )}
                        </div>

                        {/* Quantidade Restante */}
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5 text-right">Restante</span>
                            <span className={`text-sm font-mono font-bold ${estatisticas.ehCritico ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {Math.round(estatisticas.atual)}{unidade}
                            </span>
                            <span className="text-[9px] font-mono text-zinc-500 mt-0.5">
                                {estatisticas.porcentagemConsumida}% consumido
                            </span>
                        </div>
                    </div>

                    {/* Actions (Icon Row) - Clean & Necessary Only */}
                    <div className="flex items-center justify-center pt-1 gap-2">
                        <Tooltip text="Registrar Uso">
                            <button onClick={() => aoConsumir(item)} className="w-9 h-9 flex items-center justify-center rounded-full text-zinc-300 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all border border-transparent hover:border-emerald-500/20">
                                <ArrowDownFromLine size={16} strokeWidth={2} />
                            </button>
                        </Tooltip>

                        <Tooltip text="Histórico">
                            <button onClick={() => aoVerHistorico(item)} className="w-9 h-9 flex items-center justify-center rounded-full text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all border border-transparent hover:border-blue-500/20">
                                <History size={16} />
                            </button>
                        </Tooltip>

                        <Tooltip text="Etiqueta">
                            <button onClick={() => aoImprimirEtiqueta && aoImprimirEtiqueta(item)} className="w-9 h-9 flex items-center justify-center rounded-full text-zinc-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all border border-transparent hover:border-purple-500/20">
                                <QrCode size={16} />
                            </button>
                        </Tooltip>

                        <Tooltip text="Editar">
                            <button onClick={() => aoEditar(item)} className="w-9 h-9 flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/20">
                                <Edit2 size={16} />
                            </button>
                        </Tooltip>

                        <Tooltip text="Excluir">
                            <button onClick={() => aoExcluir && aoExcluir(item.id)} className="w-9 h-9 flex items-center justify-center rounded-full text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20">
                                <Trash2 size={16} />
                            </button>
                        </Tooltip>
                    </div>

                </div>
            </div>
        </div>
    );
});

export default CartaoMaterial;
