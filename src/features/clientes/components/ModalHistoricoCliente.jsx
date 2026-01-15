import React, { useMemo } from 'react';
import { X, Calendar, Package, Clock } from 'lucide-react';
import { formatarMoeda } from '../../../utils/numbers';

export default function ModalHistoricoCliente({ isOpen, onClose, cliente, projetos }) {
    // Filtra projetos deste cliente
    const historico = useMemo(() => {
        if (!cliente || !projetos) return [];
        // Filtra projetos que têm o ID do cliente dentro de 'entradas' ou no root (dependendo de como foi salvo)
        return projetos.filter(p => {
            const ent = p.data?.entradas || {};
            const root = p.data || {};
            const cId = ent.clienteId || root.clienteId;
            return String(cId) === String(cliente.id);
        }).sort((a, b) => new Date(b.data?.ultimaAtualizacao) - new Date(a.data?.ultimaAtualizacao));
    }, [cliente, projetos]);

    const stats = useMemo(() => {
        const totalProjetos = historico.length;
        const totalGasto = historico.reduce((acc, p) => acc + (p.data?.resultados?.precoComDesconto || 0), 0);
        const totalLucro = historico.reduce((acc, p) => acc + (p.data?.resultados?.lucroBrutoUnitario || 0), 0);
        return { totalProjetos, totalGasto, totalLucro };
    }, [historico]);

    if (!isOpen || !cliente) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-md h-full bg-zinc-950 border-l border-zinc-800 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-white">{cliente.nome}</h2>
                            {cliente.empresa && <p className="text-sm text-zinc-500">{cliente.empresa}</p>}
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-zinc-900 rounded-lg transition-colors">
                            <X size={20} className="text-zinc-500" />
                        </button>
                    </div>

                    {/* Mini Stats */}
                    <div className="grid grid-cols-3 gap-2 mt-6">
                        <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800/50">
                            <span className="text-[10px] uppercase text-zinc-500 font-bold block mb-1">Pedidos</span>
                            <span className="text-lg font-mono font-bold text-zinc-200">{stats.totalProjetos}</span>
                        </div>
                        <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800/50">
                            <span className="text-[10px] uppercase text-zinc-500 font-bold block mb-1">Total (R$)</span>
                            <span className="text-sm font-mono font-bold text-emerald-400">{formatarMoeda(stats.totalGasto)}</span>
                        </div>
                        <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800/50">
                            <span className="text-[10px] uppercase text-zinc-500 font-bold block mb-1">LTV (Lucro)</span>
                            <span className="text-sm font-mono font-bold text-sky-400">{formatarMoeda(stats.totalLucro)}</span>
                        </div>
                    </div>
                </div>

                {/* Lista */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {historico.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-500 opacity-50">
                            <Package size={48} className="mb-4" />
                            <p>Nenhum pedido encontrado.</p>
                        </div>
                    ) : (
                        historico.map(proj => {
                            const data = proj.data || {};
                            const date = new Date(data.ultimaAtualizacao);
                            return (
                                <div key={proj.id} className="bg-zinc-900/30 border border-zinc-800/50 p-4 rounded-xl hover:bg-zinc-900/50 transition-colors group">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold text-zinc-200 text-sm">{data.label || "Sem Nome"}</h3>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${data.status === 'finalizado' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                data.status === 'aprovado' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                    'bg-zinc-800 text-zinc-500 border-zinc-700'
                                            }`}>
                                            {(data.status || 'rascunho').toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-zinc-500 mb-3">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            {date.toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] uppercase font-bold text-zinc-600">Valor Final</span>
                                            <span className="font-mono font-bold text-zinc-300">
                                                {formatarMoeda(data.resultados?.precoComDesconto || 0)}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[9px] uppercase font-bold text-zinc-600">Lucro</span>
                                            <span className="font-mono font-bold text-emerald-500/80">
                                                +{formatarMoeda(data.resultados?.lucroBrutoUnitario || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
