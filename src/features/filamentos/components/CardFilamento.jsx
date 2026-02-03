import React, { memo, useMemo } from "react";
import { Edit2, Trash2, ArrowDownFromLine, Copy, History, Droplet } from "lucide-react";
import VisualizacaoCarretel from "./VisualizacaoCarretel";
import { StatusFilamento } from "./StatusFilamento";
import { formatCurrency } from "../../../utils/numbers";
import { Tooltip } from "../../../components/ui/Tooltip";

export const CartaoFilamento = memo(({ item, umidadeAtual, temperaturaAtual, aoEditar, aoExcluir, aoConsumir, aoDuplicar, aoVerHistorico }) => {
    // Lógica de Estatísticas
    const estatisticas = useMemo(() => {
        const capacidade = Math.max(1, Number(item?.peso_total) || 1000);
        const atual = Math.max(0, Number(item?.peso_atual) || 0);
        const porcentagem = Math.min(100, Math.max(0, Math.round((atual / capacidade) * 100)));
        const valorRestante = (Number(item?.preco || 0) / capacidade) * atual;
        return { atual, porcentagem, ehCritico: porcentagem <= 20, valorRestante };
    }, [item?.peso_atual, item?.peso_total, item?.preco]);

    const corHex = item?.cor_hex || "#3b82f6";

    return (
        <div className="group relative w-full aspect-[3/4] rounded-3xl transition-all duration-300">

            {/* 1. CAMADA VISUAL (Base) */}
            <div className={`
                absolute inset-0 flex flex-col items-center justify-center 
                bg-[#09090b]/40 backdrop-blur-sm border border-white/5 rounded-3xl 
                transition-all duration-500 
                group-hover:border-white/10 group-hover:bg-[#09090b]/80 group-hover:scale-[1.02] group-hover:shadow-2xl
                ${estatisticas.ehCritico ? 'border-rose-500/20 bg-rose-500/5' : ''}
            `}>
                {/* Carretel Centralizado */}
                <div className="relative transform transition-all duration-500 -translate-y-6 group-hover:scale-[0.6] group-hover:-translate-y-[90px]">
                    {/* Brilho Ambiente */}
                    <div
                        className="absolute inset-0 rounded-full blur-[50px] transition-all duration-500 opacity-20 group-hover:opacity-30"
                        style={{ backgroundColor: corHex }}
                    />
                    <VisualizacaoCarretel cor={corHex} porcentagem={estatisticas.porcentagem} tamanho={140} />
                </div>

                {/* Nome/Marca (Sempre Visível, Oculto no Hover) */}
                <div className="absolute bottom-14 flex flex-col items-center text-center transition-all duration-300 group-hover:opacity-0 transform translate-y-0 group-hover:translate-y-2 px-4">
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight leading-none drop-shadow-lg line-clamp-2">
                        {item?.nome || "Sem Nome"}
                    </h3>
                </div>

                {/* Ícone de Risco de Umidade (Topo Direito) */}
                {(() => {
                    const ehHigroscopico = ['PLA', 'PETG', 'TPU', 'NYLON', 'ABS', 'ASA'].includes(item?.material?.toUpperCase());
                    const riscoUmidade = ehHigroscopico && (umidadeAtual > 50);
                    if (!riscoUmidade) return null;

                    return (
                        <div className="absolute top-4 right-4 p-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(56,189,248,0.2)]">
                            <Droplet size={14} className="fill-current animate-pulse" />
                        </div>
                    );
                })()}

                {/* Badge Mínima (Sempre Visível) */}
                <div className={`
                    absolute bottom-4 px-3 py-1 rounded-full border backdrop-blur-md flex items-center gap-2
                    transition-all duration-300 group-hover:opacity-0
                    ${estatisticas.ehCritico
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : 'bg-zinc-950/50 border-white/10 text-zinc-400'}
                `}>
                    <span className="text-[10px] font-black uppercase tracking-widest">{item?.material || "PLA"}</span>
                    <div className="w-px h-3 bg-white/10" />
                    <span className="text-[10px] font-mono font-bold">{Math.round(estatisticas.atual)}g</span>
                </div>

            </div>

            {/* 2. SOBREPOSIÇÃO DE INFO (Apenas no Hover) */}
            <div className="absolute inset-x-0 bottom-0 p-5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10 flex flex-col justify-end">

                {/* Informações do Cabeçalho */}
                <div className="text-center mb-4">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em] mb-1 block drop-shadow-sm">{item?.marca || "Genérica"}</span>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none truncate w-full mb-3 drop-shadow-md">
                        {item?.nome || "Sem Nome"}
                    </h3>

                    {/* Linha de Estatísticas Modernas */}
                    <div className="flex items-center justify-center gap-2">
                        <div className="flex items-center justify-center gap-3 text-[10px] font-medium opacity-90">
                            {/* Preço */}
                            <span className="text-emerald-400 font-bold tracking-wide">
                                {Number(item?.preco) > 0 ? formatCurrency(estatisticas.valorRestante) : 'R$ --'}
                            </span>

                            {/* Divisor */}
                            <div className="w-px h-3 bg-white/20" />

                            {/* Peso */}
                            <div className="flex items-baseline gap-1">
                                <span className={`font-bold ${estatisticas.ehCritico ? 'text-rose-400' : 'text-white'}`}>
                                    {Math.round(estatisticas.atual)}g
                                </span>
                                <span className="text-zinc-500 text-[9px]">
                                    / {Number(item?.peso_total) || 1000}g
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grade de Ações */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                    <button onClick={() => aoConsumir(item)} className="w-full h-8 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/30 text-emerald-500 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.1em] transition-all group/btn shadow-lg shadow-emerald-900/10 hover:shadow-emerald-900/20 active:scale-[0.98]">
                        <ArrowDownFromLine size={14} className="opacity-70 group-hover/btn:opacity-100 transition-opacity" /> <span>Registrar Uso</span>
                    </button>

                    <div className="flex items-center justify-between px-2 text-zinc-500">
                        <Tooltip text="Histórico">
                            <button onClick={() => aoVerHistorico(item)} className="p-1.5 hover:text-zinc-200 hover:bg-white/5 rounded-md transition-colors">
                                <History size={14} strokeWidth={1.5} />
                            </button>
                        </Tooltip>
                        <Tooltip text="Duplicar">
                            <button onClick={() => aoDuplicar(item)} className="p-1.5 hover:text-zinc-200 hover:bg-white/5 rounded-md transition-colors">
                                <Copy size={14} strokeWidth={1.5} />
                            </button>
                        </Tooltip>
                        <Tooltip text="Editar">
                            <button onClick={() => aoEditar(item)} className="p-1.5 hover:text-zinc-200 hover:bg-white/5 rounded-md transition-colors">
                                <Edit2 size={14} strokeWidth={1.5} />
                            </button>
                        </Tooltip>
                        <Tooltip text="Excluir">
                            <button onClick={() => aoExcluir(item?.id)} className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors">
                                <Trash2 size={14} strokeWidth={1.5} />
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </div>
    );
});
