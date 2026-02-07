import React from 'react';
import { History, Calendar, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import SideBySideModal from '../../../components/ui/SideBySideModal';
import { useSupplyHistory } from '../logic/supplies';

export default function ModalHistoricoInsumo({ isOpen, onClose, item }) {
    const { data } = useSupplyHistory(item?.id);
    const history = data?.history || [];

    return (
        <SideBySideModal
            isOpen={isOpen}
            onClose={onClose}
            header={{
                title: "Histórico de Movimentação",
                subtitle: "Rastreabilidade do insumo",
                icon: History
            }}
            maxWidth="max-w-2xl"
        >
            <div className="space-y-10 relative px-2 pb-8">

                {/* Header Info Card - "WOW" Effect (Static) */}
                <div className="w-full relative z-20">
                    <div className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/60 rounded-[2rem] p-8 flex justify-between items-center relative overflow-hidden shadow-2xl">

                        {/* Static Background Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-purple-500/5 opacity-50" />

                        <div className="flex flex-col gap-2 relative z-10">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                                <span className="text-[10px] font-bold text-sky-500/80 uppercase tracking-[0.2em]">Rastreabilidade</span>
                            </div>
                            <h3 className="text-3xl font-black text-white tracking-tighter leading-none drop-shadow-sm">{item?.name}</h3>
                        </div>

                        <div className="flex flex-col items-end gap-1 relative z-10">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Estoque Disponível</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500 tracking-tighter filter drop-shadow-lg">
                                    {item?.currentStock}
                                </span>
                                <div className="flex flex-col items-start -space-y-1">
                                    <span className="text-[10px] font-black text-zinc-700 uppercase">UN</span>
                                    <span className="text-sm font-bold text-zinc-400 uppercase">{item?.unit}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative pl-4">
                    {/* Linha do tempo Neon */}
                    <div className="absolute left-[35px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-sky-500/20 via-zinc-800 to-transparent shadow-[0_0_10px_rgba(14,165,233,0.1)] rounded-full" />

                    <div className="space-y-6">
                        {history.length > 0 ? history.map((log, idx) => (
                            <div key={idx} className="relative pl-16 group">
                                {/* Ícone Conector com Glow Estático */}
                                <div className={`absolute left-0 top-1 w-12 h-12 rounded-2xl border border-white/5 z-10 flex items-center justify-center shadow-lg shadow-black/50 backdrop-blur-md
                                    ${log.type === 'manual' || log.type === 'ajuste' ? 'bg-orange-500/10 text-orange-400' :
                                        log.type === 'abertura' || log.type === 'consumo' ? 'bg-emerald-500/10 text-emerald-400' :
                                            'bg-zinc-900/80 text-zinc-500'}`}>
                                    {log.quantity_change < 0 ? <ArrowDownCircle size={20} className="drop-shadow-md" /> :
                                        log.quantity_change > 0 ? <ArrowUpCircle size={20} className="drop-shadow-md" /> :
                                            <Calendar size={20} className="drop-shadow-md" />}
                                </div>

                                {/* Card do Item (Static) */}
                                <div className="flex flex-col gap-2 p-5 rounded-3xl border border-transparent">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[10px] font-black uppercase tracking-[0.15em] px-2 py-1 rounded-md border
                                                ${log.type === 'manual' ? 'bg-orange-500/5 border-orange-500/10 text-orange-400' :
                                                    log.type === 'abertura' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' :
                                                        'bg-zinc-800/30 border-zinc-700 text-zinc-500'}`}>
                                                {log.type === 'manual' ? 'AJUSTE' : log.type}
                                            </span>
                                            <span className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                                                {new Date(log.created_at).toLocaleDateString('pt-BR')}
                                                <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                                                {new Date(log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end gap-4">
                                        <div className="flex flex-col gap-1 max-w-[70%]">
                                            <h4 className="text-base font-bold text-zinc-300 leading-snug">
                                                {log.notes || "Registro automático de sistema"}
                                            </h4>

                                            {/* Professional Snapshot: Previous -> New */}
                                            {log.quantity_change !== 0 && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">Estoque:</span>
                                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-900/50 border border-zinc-800/50">
                                                        <span className="text-[10px] font-mono font-bold text-zinc-500">{log.previousStock}</span>
                                                        <ArrowDownCircle size={8} className="-rotate-90 text-zinc-600" />
                                                        <span className={`text-[10px] font-mono font-bold ${log.quantity_change > 0 ? 'text-emerald-500' : 'text-zinc-300'}`}>
                                                            {log.newStock}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {log.quantity_change !== 0 && (
                                            <div className={`flex flex-col items-end gap-0.5
                                                ${log.quantity_change > 0
                                                    ? 'text-emerald-400'
                                                    : 'text-rose-400'}`}>
                                                <div className="flex items-baseline gap-0.5">
                                                    <span className="text-xl font-black tracking-tighter">
                                                        {log.quantity_change > 0 ? '+' : ''}{log.quantity_change}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-zinc-600 uppercase">{item?.unit}</span>
                                                </div>

                                                {log.cost > 0 && (
                                                    <span className="text-[9px] font-bold text-zinc-600 font-mono">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(log.cost)}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-24 text-zinc-600 space-y-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-sky-500/20 blur-xl rounded-full" />
                                    <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 relative shadow-xl">
                                        <History size={32} strokeWidth={1.5} className="text-sky-500/50" />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Sem Histórico</p>
                                    <p className="text-[10px] text-zinc-600 max-w-[200px] mt-1 line-clamp-2">As movimentações deste item aparecerão aqui.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SideBySideModal>
    );
}
