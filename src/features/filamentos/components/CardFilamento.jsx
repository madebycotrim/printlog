import React, { memo, useMemo } from "react";
import { Edit2, Trash2, ArrowDownFromLine, Copy, History, Droplet, ShoppingCart, QrCode, ExternalLink, Flame } from "lucide-react";
import { differenceInDays } from "date-fns";

import VisualizacaoCarretel from "./VisualizacaoCarretel";
import { formatCurrency } from "../../../utils/numbers";
import { Tooltip } from "../../../components/ui/Tooltip";
import { MATERIAIS_RESINA_FLAT } from "../logic/constantes";

export const CartaoFilamento = memo(({ item, umidadeAtual, temperaturaAtual, aoEditar, aoExcluir, aoConsumir, aoDuplicar, aoVerHistorico, aoImprimirEtiqueta, aoSecar }) => {
    // Lógica de Estatísticas
    const estatisticas = useMemo(() => {
        const capacidade = Math.max(1, Number(item?.peso_total) || 1000);
        const atual = Math.max(0, Number(item?.peso_atual) || 0);
        const porcentagem = Math.min(100, Math.max(0, Math.round((atual / capacidade) * 100)));
        const valorRestante = (Number(item?.preco || 0) / capacidade) * atual;
        return { atual, porcentagem, ehCritico: porcentagem <= 20, valorRestante };
    }, [item?.peso_atual, item?.peso_total, item?.preco]);

    const corHex = item?.cor_hex || "#3b82f6";
    const realTipo = item?.tipo === 'SLA' || MATERIAIS_RESINA_FLAT.some(m => m.toLowerCase() === (item?.material || "").toLowerCase()) ? 'SLA' : 'FDM';
    const unidade = realTipo === 'SLA' ? 'ml' : 'g';

    // Lógica de Secagem
    const dryingStatus = useMemo(() => {
        if (!item?.data_secagem) return null;

        const days = differenceInDays(new Date(), new Date(item.data_secagem));
        const isCritical = days > 3 && umidadeAtual > 60; // Simple logic: >3 days AND high humidity

        return {
            days,
            label: days === 0 ? "Seco hoje" : `Seco há ${days}d`,
            color: isCritical ? "text-rose-500 border-rose-500/30 bg-rose-500/10" : "text-emerald-500 border-emerald-500/30 bg-emerald-500/10",
            iconColor: isCritical ? "text-rose-500" : "text-emerald-500"
        };
    }, [item?.data_secagem, umidadeAtual]);

    return (
        // COMPACT ASPECT RATIO (Square-ish)
        <div className="group relative w-full aspect-[4/5] rounded-3xl transition-all duration-300">

            {/* 1. CAMADA VISUAL (Base) */}
            <div className={`
                absolute inset-0 flex flex-col justify-between
                bg-[#09090b]/40 backdrop-blur-sm border border-white/5 rounded-3xl 
                transition-all duration-500 
                group-hover:border-white/10 group-hover:bg-[#09090b]/80 group-hover:scale-[1.02] group-hover:shadow-2xl overflow-hidden
                ${estatisticas.ehCritico ? 'border-rose-500/20 bg-rose-500/5' : ''}
            `}>

                {/* Header (Top Fixed Info) - NO HOVER HIDE */}
                <div className="flex flex-col items-center pt-4 px-4 z-20">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">{item?.marca || "Genérica"}</span>
                    <h3 className="text-sm font-black text-white uppercase tracking-tight leading-tight text-center line-clamp-1 w-full">
                        {item?.nome || "Sem Nome"}
                    </h3>
                </div>

                {/* Carretel Centralizado */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center transform transition-all duration-500 scale-[1.1] group-hover:scale-[0.8] group-hover:-translate-y-[70%] z-10">
                    {/* Brilho Ambiente */}
                    <div
                        className="absolute inset-0 rounded-full blur-[40px] transition-all duration-500 opacity-10 group-hover:opacity-20"
                        style={{ backgroundColor: corHex }}
                    />
                    <VisualizacaoCarretel cor={corHex} porcentagem={estatisticas.porcentagem} tamanho={100} tipo={realTipo} />

                    {/* Info Overlay on Spool (Quantity) */}
                    <div className="absolute -bottom-6 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/40 border border-white/5 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-0">
                        <div className={`w-1.5 h-1.5 rounded-full ${estatisticas.ehCritico ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                        <span className="text-[10px] font-mono font-bold text-zinc-300">
                            {Math.round(estatisticas.atual)}{unidade}
                        </span>
                    </div>
                </div>


                {/* 2. AREA DE AÇÕES (Bottom) - Fades in/up on Hover */}
                {/* Repurchase Always Visible (Dimmed) or Active */}
                <div className="absolute top-4 right-4 z-30">
                    {item?.url_compra && (
                        <a
                            href={item.url_compra}
                            target="_blank"
                            rel="noreferrer"
                            className={`flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300 ${estatisticas.ehCritico
                                ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)] scale-110 animate-pulse'
                                : 'bg-transparent text-zinc-700 hover:text-blue-400 hover:bg-blue-500/10'
                                }`}
                            title="Recomprar"
                        >
                            <ShoppingCart size={12} strokeWidth={estatisticas.ehCritico ? 2.5 : 2} />
                        </a>
                    )}
                </div>

                {/* Action Bar (Slide Up) */}
                <div className="absolute inset-x-0 bottom-0 p-3 pt-6 bg-gradient-to-t from-black via-black/90 to-transparent translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300 z-20 flex flex-col gap-2">

                    {/* Quick Stats in Action Bar */}
                    <div className="flex items-center justify-between px-1 mb-1">
                        <span className="text-[10px] font-medium text-emerald-400">{Number(item?.preco) > 0 ? formatCurrency(estatisticas.valorRestante) : 'R$ --'}</span>
                        <span className="text-[10px] font-mono font-bold text-zinc-400">
                            {Math.round(estatisticas.atual)} / {Number(item?.peso_total) || 1000}{unidade}
                        </span>
                    </div>

                    {/* Primary Button */}
                    <button onClick={() => aoConsumir(item)} className="w-full h-8 bg-zinc-100 hover:bg-white text-black rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider transition-all active:scale-[0.98]">
                        <ArrowDownFromLine size={14} /> <span>Registrar Uso</span>
                    </button>

                    {/* Secondary Actions Row */}
                    <div className="flex items-center justify-between gap-1 text-zinc-500">
                        {/* Quick Dry - Only for FDM */}
                        {realTipo === 'FDM' && (
                            <Tooltip text="Seco Agora">
                                <button onClick={() => aoSecar && aoSecar(item)} className="p-1.5 hover:text-amber-400 hover:bg-amber-500/10 rounded-md transition-colors">
                                    <Flame size={14} />
                                </button>
                            </Tooltip>
                        )}
                        {realTipo === 'FDM' && <div className="w-px h-3 bg-white/10 mx-1" />}

                        <Tooltip text="Histórico">
                            <button onClick={() => aoVerHistorico(item)} className="p-1.5 hover:text-zinc-200 hover:bg-white/5 rounded-md transition-colors">
                                <History size={14} />
                            </button>
                        </Tooltip>

                        <Tooltip text="Editar">
                            <button onClick={() => aoEditar(item)} className="p-1.5 hover:text-zinc-200 hover:bg-white/5 rounded-md transition-colors">
                                <Edit2 size={14} />
                            </button>
                        </Tooltip>

                        <Tooltip text="Etiqueta">
                            <button onClick={() => aoImprimirEtiqueta && aoImprimirEtiqueta(item)} className="p-1.5 hover:text-zinc-200 hover:bg-white/5 rounded-md transition-colors">
                                <QrCode size={14} />
                            </button>
                        </Tooltip>
                    </div>
                </div>

                {/* Status Badges (Always Visible - Bottom Left) */}
                <div className="absolute bottom-3 left-4 z-10 flex gap-1 transition-all duration-300 group-hover:opacity-0 pointer-events-none">
                    {/* Drying Status Badge - Only FDM */}
                    {realTipo === 'FDM' && dryingStatus && (
                        <div className={`p-1 rounded-md border backdrop-blur-md ${dryingStatus.color}`}>
                            <Flame size={10} className={dryingStatus.iconColor} fill="currentColor" />
                        </div>
                    )}

                    {/* Humidity Warning */}
                    {(() => {
                        const ehHigroscopico = ['PLA', 'PETG', 'TPU', 'NYLON', 'ABS', 'ASA'].includes(item?.material?.toUpperCase());
                        const riscoUmidade = ehHigroscopico && (umidadeAtual > 50);
                        if (riscoUmidade) {
                            return (
                                <div className="p-1 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-400 animate-pulse">
                                    <Droplet size={10} fill="currentColor" />
                                </div>
                            );
                        }
                        return null;
                    })()}
                </div>

            </div>
        </div>
    );
});
