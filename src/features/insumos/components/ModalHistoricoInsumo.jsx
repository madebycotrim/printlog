import React from 'react';
import { History, Calendar, ArrowDownCircle, ArrowUpCircle, AlertCircle } from 'lucide-react';
import SideBySideModal from '../../../components/ui/SideBySideModal';
import { useSupplyStore, useSupplyHistory } from '../logic/supplies';

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
                {/* Linha do tempo vertical */}
                <div className="absolute left-4 top-4 bottom-4 w-px bg-zinc-800/50" />

                <div className="space-y-6 pl-4">
                    {history.length > 0 ? history.map((log, idx) => (
                        <div key={idx} className="relative pl-8 group">
                            {/* Bolinha da timeline */}
                            <div className={`absolute left-0 top-1.5 w-8 h-8 -ml-4 rounded-full border-4 border-zinc-950 z-10 flex items-center justify-center
                                ${log.type === 'manual' ? 'bg-orange-500 text-orange-100' :
                                    log.type === 'abertura' ? 'bg-emerald-500 text-emerald-100' : 'bg-zinc-800 text-zinc-400'}`}>
                                {log.quantity_change < 0 ? <ArrowDownCircle size={12} /> :
                                    log.quantity_change > 0 ? <ArrowUpCircle size={12} /> :
                                        <Calendar size={12} />}
                            </div>

                            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-4 hover:border-zinc-700 transition-colors">
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border
                                        ${log.type === 'manual' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' :
                                            log.type === 'abertura' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-zinc-800/50 border-zinc-700 text-zinc-400'}`}>
                                        {log.type === 'manual' ? 'Ajuste Manual' : log.type}
                                    </span>
                                    <span className="text-[10px] font-mono text-zinc-600">
                                        {new Date(log.created_at).toLocaleDateString('pt-BR')} {new Date(log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-zinc-200">{log.notes}</h4>
                                {log.quantity_change !== 0 && (
                                    <p className={`text-xs mt-1 font-mono ${log.quantity_change < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                        {log.quantity_change > 0 ? '+' : ''}{log.quantity_change} {item?.unit}
                                    </p>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="flex flex-col items-center justify-center py-12 text-zinc-600">
                            <History size={32} className="mb-2 opacity-50" />
                            <p className="text-sm">Nenhum registro encontrado.</p>
                        </div>
                    )}
                </div>
            </div>
        </SideBySideModal>
    );
}
