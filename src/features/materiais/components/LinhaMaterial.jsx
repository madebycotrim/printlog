import React, { memo, useMemo } from "react";
import { Edit2, Trash2, ArrowDownFromLine, Copy, History, Droplet, QrCode } from "lucide-react";
import VisualizacaoMaterial from "./VisualizacaoMaterial";
import { StatusMaterial } from "./StatusMaterial";
import { Tooltip } from "../../../components/ui/Tooltip";
import { formatCurrency } from "../../../utils/numbers";
import { MATERIAIS_RESINA_FLAT } from "../logic/constantes";

/**
 * MODO LISTA: LinhaFilamento
 */
export const LinhaMaterial = memo(({ item, umidadeAtual, temperaturaAtual, aoEditar, aoExcluir, aoConsumir, aoDuplicar, aoVerHistorico, aoImprimirEtiqueta, highlightedItemId }) => {
    const estatisticas = useMemo(() => {
        const capacidade = Math.max(1, Number(item?.peso_total) || 1000);
        const atual = Math.max(0, Number(item?.peso_atual) || 0);
        return {
            atual,
            capacidade,
            porcentagem: Math.min(100, Math.max(0, Math.round((atual / capacidade) * 100)))
        };
    }, [item?.peso_atual, item?.peso_total]);

    const ehCritico = estatisticas.porcentagem <= 20;
    const corHex = item?.cor_hex || "#3b82f6";
    const ehHigroscopico = ['PLA', 'PETG', 'TPU', 'NYLON', 'ABS', 'ASA'].includes(item?.material?.toUpperCase());
    const riscoUmidade = ehHigroscopico && (umidadeAtual > 50);
    const realTipo = item?.tipo === 'SLA' || MATERIAIS_RESINA_FLAT.some(m => m.toLowerCase() === (item?.material || "").toLowerCase()) ? 'SLA' : 'FDM';
    const unidade = realTipo === 'SLA' ? 'ml' : 'g';
    const isHighlighted = highlightedItemId === item.id;

    return (
        <div className={`
            group relative flex items-center gap-4 p-4 min-h-[72px]
            bg-[#09090b]/80 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300
            border ${ehCritico ? 'border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.05)]' : 'border-white/5 hover:border-white/10 hover:bg-zinc-900/40'}
            ${isHighlighted ? 'animate-pulse ring-2 ring-orange-500 bg-orange-500/10' : ''}
        `}>
            {/* 1. ÍCONE (Flutuante) */}
            <div className="relative shrink-0">
                <div className={`absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} style={{ backgroundColor: corHex }} />
                <VisualizacaoMaterial cor={corHex} porcentagem={estatisticas.porcentagem} tamanho={42} tipo={realTipo} />
            </div>

            {/* 2. INFORMAÇÕES PRINCIPAIS */}
            <div className="flex flex-col justify-center min-w-0 flex-1 gap-1">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-zinc-200 truncate group-hover:text-white transition-colors tracking-tight">
                        {item?.nome || "Material Sem Nome"}
                    </h3>

                    {/* Tags Inline */}
                    <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider border border-zinc-800 rounded px-1.5 py-px">{item?.marca}</span>
                        <span className="text-[10px] font-bold text-zinc-400 bg-zinc-800/50 px-1.5 py-px rounded">{item?.material}</span>
                    </div>
                </div>

                {/* Indicadores de Status (Compacto) */}
                <StatusMaterial item={item} umidadeAtual={umidadeAtual} />
            </div>

            {/* 3. ESTATÍSTICAS TÉCNICAS (Condensado) */}
            <div className="hidden md:flex flex-col items-end gap-1 px-4 min-w-[140px]">
                <div className="flex items-baseline gap-1.5 align-baseline">
                    <span className={`text-xl font-bold font-mono tracking-tighter ${ehCritico ? 'text-rose-400' : 'text-zinc-200'}`}>
                        {Math.round(estatisticas.atual)}
                    </span>
                    <span className="text-zinc-500 text-sm font-mono font-bold">
                        / {estatisticas.capacidade}
                    </span>
                    <span className="text-[9px] text-zinc-600 font-bold uppercase ml-1">{unidade}</span>
                </div>
            </div>

            {/* 4. AÇÕES (Revelar no Hover) */}
            <div className="flex items-center gap-1 pl-4 border-l border-white/5 opacity-40 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                <Tooltip text="Baixa Rápida">
                    <button
                        onClick={() => aoConsumir(item)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-zinc-800/50 hover:bg-emerald-500/10 text-zinc-400 hover:text-emerald-400 transition-colors"
                    >
                        <ArrowDownFromLine size={14} />
                    </button>
                </Tooltip>

                <Tooltip text="Duplicar">
                    <button onClick={() => aoDuplicar(item)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-zinc-500 hover:text-blue-400 transition-colors">
                        <Copy size={14} />
                    </button>
                </Tooltip>

                <Tooltip text="Histórico">
                    <button onClick={() => aoVerHistorico(item)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-zinc-500 hover:text-amber-400 transition-colors">
                        <History size={14} />
                    </button>
                </Tooltip>

                <Tooltip text="Etiqueta QR">
                    <button onClick={() => aoImprimirEtiqueta && aoImprimirEtiqueta(item)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-zinc-500 hover:text-purple-400 transition-colors">
                        <QrCode size={14} />
                    </button>
                </Tooltip>

                <Tooltip text="Editar">
                    <button onClick={() => aoEditar(item)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-zinc-500 hover:text-zinc-200 transition-colors">
                        <Edit2 size={14} />
                    </button>
                </Tooltip>

                <Tooltip text="Excluir">
                    <button onClick={() => aoExcluir(item?.id)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-rose-500/10 text-zinc-500 hover:text-rose-500 transition-colors">
                        <Trash2 size={14} />
                    </button>
                </Tooltip>
            </div>
        </div>
    );
});
