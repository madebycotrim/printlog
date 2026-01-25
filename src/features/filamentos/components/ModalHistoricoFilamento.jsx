import React, { useMemo } from 'react';
import { History, Calendar, ArrowDownCircle, TrendingDown, Clock, AlertCircle } from 'lucide-react';
import SideBySideModal from '../../../components/ui/SideBySideModal';
import SpoolSideView from './Carretel';

import { useFilamentHistory } from '../logic/filamentQueries';

export default function ModalHistoricoFilamento({ aberto, aoFechar, item }) {
    const { data } = useFilamentHistory(item?.id);
    const history = data?.history || [];
    const apiStats = data?.stats || {};

    const stats = useMemo(() => {
        if (!item) return { mediaDiaria: 0, diasRestantes: 0 };

        const media = Number(apiStats.dailyAvg || 0);
        // Previsão: Se média > 0, calcula dias. Se não, infinito (ou texto amigável)
        const dias = media > 0 ? (item.peso_atual || 0) / media : 0;

        return {
            mediaDiaria: media.toFixed(1),
            diasRestantes: dias > 0 ? Math.round(dias) : "---"
        };
    }, [item, apiStats]);

    const sidebarContent = (
        <div className="flex flex-col items-center w-full space-y-10 relative z-10 h-full justify-between">
            <div className="w-full flex flex-col items-center">
                <div className="flex items-center gap-3 justify-center text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-10">
                    <div className="h-px w-4 bg-zinc-900/50" />
                    <span>Timeline</span>
                    <div className="h-px w-4 bg-zinc-900/50" />
                </div>

                <div className="relative group p-8 rounded-[2.5rem] bg-zinc-950/50 border border-zinc-800 shadow-inner flex items-center justify-center backdrop-blur-sm mb-6">
                    <SpoolSideView color={item?.cor_hex} percent={(item?.peso_atual / item?.peso_total) * 100} size={80} />
                </div>

                <div className="text-center">
                    <h3 className="text-lg font-bold text-zinc-100">{item?.nome}</h3>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">ID: {String(item?.id || '').slice(-4)}</p>
                </div>
            </div>

            <div className="w-full space-y-3">
                <div className="bg-zinc-950/40 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-900 rounded-lg text-zinc-400">
                            <TrendingDown size={16} />
                        </div>
                        <div>
                            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Média Diária</p>
                            <p className="text-sm font-bold text-zinc-200">{stats.mediaDiaria}g / dia</p>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-950/40 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-900 rounded-lg text-emerald-500">
                            <Clock size={16} />
                        </div>
                        <div>
                            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Previsão</p>
                            <p className="text-sm font-bold text-emerald-400">Acaba em ~{stats.diasRestantes} dias</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <SideBySideModal
            isOpen={aberto}
            onClose={aoFechar}
            sidebar={sidebarContent}
            title="Histórico de Uso"
            subtitle="Rastreabilidade completa do carretel"
            maxWidth="max-w-4xl"
        >
            <div className="relative">
                {/* Linha do tempo vertical */}
                <div className="absolute left-4 top-4 bottom-4 w-px bg-zinc-800/50" />

                <div className="space-y-6 pl-4">
                    {history.map((log, idx) => (
                        <div key={idx} className="relative pl-8 group">
                            {/* Bolinha da timeline */}
                            <div className={`absolute left-0 top-1.5 w-8 h-8 -ml-4 rounded-full border-4 border-zinc-950 z-10 flex items-center justify-center
                                ${log.type === 'falha' ? 'bg-rose-500 text-rose-100' :
                                    log.type === 'abertura' ? 'bg-emerald-500 text-emerald-100' : 'bg-zinc-800 text-zinc-400'}`}>
                                {log.type === 'falha' ? <AlertCircle size={12} /> :
                                    log.type === 'abertura' ? <Calendar size={12} /> : <ArrowDownCircle size={12} />}
                            </div>

                            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-4 hover:border-zinc-700 transition-colors">
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border
                                        ${log.type === 'falha' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                                            log.type === 'abertura' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-zinc-800/50 border-zinc-700 text-zinc-400'}`}>
                                        {log.type}
                                    </span>
                                    <span className="text-[10px] font-mono text-zinc-600">
                                        {new Date(log.date).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-zinc-200">{log.obs}</h4>
                                {log.qtd > 0 && (
                                    <p className="text-xs text-zinc-500 mt-1 font-mono">
                                        -{log.qtd}g
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </SideBySideModal>
    );
}
