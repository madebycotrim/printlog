import React from 'react';
import { History, Calendar, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import SideBySideModal from '../../../components/ui/SideBySideModal';
import { useSupplyHistory } from '../logic/supplies';

export default function ModalHistoricoInsumo({ isOpen, onClose, item }) {
    const { data } = useSupplyHistory(item?.id);
    const history = data?.history || [];

    // Sidebar Content (Simplified vs Filament as we don't have moisture/spool)
    const sidebarContent = (
        <div className="flex flex-col items-center w-full space-y-10 relative z-10 h-full justify-between">
            <div className="w-full flex flex-col items-center">
                <div className="flex items-center gap-3 justify-center text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-10">
                    <div className="h-px w-4 bg-zinc-900/50" />
                    <span>Timeline</span>
                    <div className="h-px w-4 bg-zinc-900/50" />
                </div>

                <div className="relative group p-8 rounded-[2.5rem] bg-zinc-950/50 border border-zinc-800 shadow-inner flex items-center justify-center backdrop-blur-sm mb-6">
                    <History size={64} className="text-orange-500/50" />
                </div>

                <div className="text-center">
                    <h3 className="text-lg font-bold text-zinc-100">{item?.name}</h3>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
                        Estoque Atual: <span className="text-orange-400 font-bold">{item?.currentStock} {item?.unit}</span>
                    </p>
                </div>
            </div>

            <div className="w-full">
                <div className="bg-zinc-950/40 border border-zinc-800 rounded-xl p-4 flex items-center justify-center text-center">
                    <p className="text-xs text-zinc-500">Histórico de movimentações manuais e abertura.</p>
                </div>
            </div>
        </div>
    );

    return (
        <SideBySideModal
            isOpen={isOpen}
            onClose={onClose}
            sidebar={sidebarContent}
            header={{
                title: "Histórico de Movimentação",
                subtitle: "Rastreabilidade do insumo"
            }}
            maxWidth="max-w-4xl"
        >
            <div className="relative">
                {/* Linha do tempo com gradiente */}
                <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-zinc-800 via-zinc-800/50 to-transparent" />

                <div className="space-y-8">
                    {history.length > 0 ? history.map((log, idx) => (
                        <div key={idx} className="relative pl-14 group">
                            {/* Ícone Conector */}
                            <div className={`absolute left-0 top-1 w-10 h-10 rounded-full border-4 border-[#09090b] z-10 flex items-center justify-center shadow-lg transition-transform group-hover:scale-105
                                ${log.type === 'manual' || log.type === 'ajuste' ? 'bg-zinc-900 text-orange-500 shadow-orange-900/10' :
                                    log.type === 'abertura' || log.type === 'consumo' ? 'bg-zinc-900 text-emerald-500 shadow-emerald-900/10' :
                                        'bg-zinc-900 text-zinc-600 shadow-black/40'}`}>
                                {log.quantity_change < 0 ? <ArrowDownCircle size={18} strokeWidth={2} /> :
                                    log.quantity_change > 0 ? <ArrowUpCircle size={18} strokeWidth={2} /> :
                                        <Calendar size={18} strokeWidth={2} />}
                            </div>

                            {/* Conteúdo Limpo */}
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest
                                        ${log.type === 'manual' ? 'text-orange-500' :
                                            log.type === 'abertura' ? 'text-emerald-500' : 'text-zinc-500'}`}>
                                        {log.type === 'manual' ? 'Ajuste Manual' : log.type}
                                    </span>
                                    <span className="text-[10px] text-zinc-700 font-bold">•</span>
                                    <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                                        {new Date(log.created_at).toLocaleDateString('pt-BR')}
                                        <span className="mx-1 opacity-50">|</span>
                                        {new Date(log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                <div className="flex justify-between items-start pr-4 gap-4">
                                    <h4 className="text-sm font-bold text-zinc-200 leading-snug">
                                        {log.notes || "Sem observações"}
                                    </h4>

                                    {log.quantity_change !== 0 && (
                                        <div className={`whitespace-nowrap px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold uppercase tracking-wider
                                            ${log.quantity_change > 0
                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                                            {log.quantity_change > 0 ? '+' : ''}{log.quantity_change} {item?.unit}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="flex flex-col items-center justify-center py-20 text-zinc-700">
                            <div className="p-4 rounded-full bg-zinc-900/50 mb-4 border border-zinc-800">
                                <History size={24} className="opacity-50" />
                            </div>
                            <p className="text-sm font-medium uppercase tracking-widest">Nenhum registro encontrado</p>
                        </div>
                    )}
                </div>
            </div>
        </SideBySideModal>
    );
}
