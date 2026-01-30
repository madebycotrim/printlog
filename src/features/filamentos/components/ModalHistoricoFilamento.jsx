import React, { useMemo } from 'react';
import { History, Calendar, ArrowDownCircle, TrendingDown, Clock, AlertCircle } from 'lucide-react';
import SideBySideModal from '../../../components/ui/SideBySideModal';
import VisualizacaoCarretel from './VisualizacaoCarretel';

import { useHistoricoFilamento } from '../logic/consultasFilamento';

export default function ModalHistoricoFilamento({ aberto, aoFechar, item }) {
    const { data } = useHistoricoFilamento(item?.id);
    const historico = data?.history || [];
    const estatisticasApi = data?.stats || {};

    const estatisticas = useMemo(() => {
        if (!item) return { mediaDiaria: 0, diasRestantes: 0 };

        const media = Number(estatisticasApi.dailyAvg || 0);
        // Previsão: Se média > 0, calcula dias. Se não, infinito (ou texto amig ável)
        const dias = media > 0 ? (item.peso_atual || 0) / media : 0;

        return {
            mediaDiaria: media.toFixed(1),
            diasRestantes: dias > 0 ? Math.round(dias) : "---"
        };
    }, [item, estatisticasApi]);

    const conteudoLateral = (
        <div className="flex flex-col items-center w-full h-full relative z-10 justify-between py-6">
            {/* Cabeçalho Contextual */}
            <div className="w-full text-center space-y-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] border border-zinc-800 rounded-full px-3 py-1 bg-zinc-900/50">
                        {item?.marca || "MARCA"}
                        <span className="mx-1 text-zinc-700">|</span>
                        {item?.material || "MATERIAL"}
                    </span>
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight leading-none break-words line-clamp-2 drop-shadow-lg">
                    {item?.nome}
                </h2>
            </div>

            {/* Visualização do Carretel */}
            <div className="relative w-full flex-1 flex items-center justify-center select-none">
                {/* Brilho Dinâmico */}
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full opacity-20 blur-3xl transition-all duration-700 pointer-events-none"
                    style={{ backgroundColor: item?.cor_hex }}
                />

                {/* Carretel */}
                <div className="relative z-10 pointer-events-none drop-shadow-2xl">
                    <VisualizacaoCarretel
                        cor={item?.cor_hex}
                        tamanho={180}
                        porcentagem={(item?.peso_atual / item?.peso_total) * 100}
                    />
                </div>
            </div>

            {/* Cartão de Estatísticas Compacto */}
            <div className="w-full flex justify-center pb-2">
                <div className="flex items-center gap-3 bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-xl px-4 py-2 hover:bg-zinc-800/80 transition-colors shadow-lg">
                    <div className="flex items-center gap-2">
                        <TrendingDown size={12} className="text-emerald-500" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Média</span>
                        <span className="text-xs font-mono font-bold text-zinc-300">{estatisticas.mediaDiaria}g</span>
                    </div>
                    <div className="w-px h-3 bg-zinc-700" />
                    <div className="flex items-center gap-2">
                        <Clock size={12} className="text-sky-500" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Prev.</span>
                        <span className="text-xs font-mono font-bold text-zinc-300">~{estatisticas.diasRestantes}d</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <SideBySideModal
            isOpen={aberto}
            onClose={aoFechar}
            sidebar={conteudoLateral}
            header={{ title: "Histórico de Uso", subtitle: "Rastreabilidade completa do carretel" }}
            maxWidth="max-w-5xl"
            className="min-h-[600px]"
        >
            <div className="relative pt-4 pb-12">
                {/* Linha do tempo com gradiente */}
                <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-zinc-800 via-zinc-800/50 to-transparent" />

                <div className="space-y-8">
                    {historico.map((registro, idx) => (
                        <div key={idx} className="relative pl-14 group">
                            {/* Ícone Conector */}
                            <div className={`absolute left-0 top-1 w-10 h-10 rounded-full border-4 border-[#09090b] z-10 flex items-center justify-center shadow-lg transition-transform group-hover:scale-105
                                ${registro.type === 'falha' ? 'bg-zinc-900 text-rose-500 shadow-rose-900/10' :
                                    registro.type === 'abertura' ? 'bg-zinc-900 text-emerald-500 shadow-emerald-900/10' : 'bg-zinc-900 text-zinc-600 shadow-black/40'}`}>
                                {registro.type === 'falha' ? <AlertCircle size={18} strokeWidth={2} /> :
                                    registro.type === 'abertura' ? <Calendar size={18} strokeWidth={2} /> : <ArrowDownCircle size={18} strokeWidth={2} />}
                            </div>

                            {/* Conteúdo Limpo */}
                            <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest
                                        ${registro.type === 'falha' ? 'text-rose-600' :
                                            registro.type === 'abertura' ? 'text-emerald-600' : 'text-zinc-600'}`}>
                                        {registro.type}
                                    </span>
                                    <span className="text-[10px] text-zinc-700">•</span>
                                    <span className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest">
                                        {new Date(registro.date).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>

                                <div className="flex justify-between items-baseline pr-4">
                                    <h4 className="text-lg font-bold text-zinc-100 leading-snug">
                                        {registro.obs}
                                    </h4>
                                    {registro.qtd > 0 && (
                                        <span className="text-sm font-bold text-zinc-400 font-mono tracking-tight">
                                            -{registro.qtd}g
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </SideBySideModal>
    );
}
