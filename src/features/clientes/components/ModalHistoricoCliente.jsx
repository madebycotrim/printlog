import React, { useMemo } from 'react';
import { Calendar, Package, Clock, History } from 'lucide-react';
import { formatarMoeda } from '../../../utils/numbers';
import SideBySideModal from '../../../components/ui/SideBySideModal';

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

    // Sidebar Content
    const sidebarContent = (
        <div className="flex flex-col h-full w-full justify-between">
            <div className="space-y-8 w-full">
                <div className="space-y-2">
                    <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                        Resumo do Cliente
                    </h3>
                    <div className="space-y-4">
                        <div className="bg-zinc-950/40 p-4 rounded-2xl border border-zinc-800/50">
                            <span className="text-[7px] font-black text-zinc-500 uppercase block mb-1">Pedidos Totais</span>
                            <span className="text-3xl font-bold text-zinc-200 tracking-tighter">{stats.totalProjetos}</span>
                        </div>
                        <div className="bg-zinc-950/40 p-4 rounded-2xl border border-zinc-800/50">
                            <span className="text-[7px] font-black text-zinc-500 uppercase block mb-1">Total Gasto</span>
                            <span className="text-xl font-mono font-black text-emerald-400 italic">{formatarMoeda(stats.totalGasto)}</span>
                        </div>
                        <div className="bg-zinc-950/40 p-4 rounded-2xl border border-zinc-800/50">
                            <span className="text-[7px] font-black text-zinc-500 uppercase block mb-1">Lucro Gerado (LTV)</span>
                            <span className="text-xl font-mono font-black text-sky-400 italic">{formatarMoeda(stats.totalLucro)}</span>
                        </div>
                    </div>
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
                title: cliente.nome,
                subtitle: cliente.empresa || "Cliente Particular",
                icon: History
            }}
        >
            <div className="space-y-4">
                {historico.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-zinc-500 opacity-50 border border-dashed border-zinc-800 rounded-3xl">
                        <Package size={48} className="mb-4" />
                        <p className="text-xs font-bold uppercase tracking-widest">Nenhum pedido encontrado</p>
                    </div>
                ) : (
                    historico.map(proj => {
                        const data = proj.data || {};
                        const date = new Date(data.ultimaAtualizacao);
                        return (
                            <div key={proj.id} className="bg-zinc-950/30 border border-zinc-800/50 p-5 rounded-2xl hover:bg-zinc-950/50 transition-colors group cursor-default">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-bold text-zinc-200 text-sm">{data.label || "Sem Nome"}</h3>
                                    <span className={`text-[9px] font-bold px-2 py-1 rounded-lg border uppercase tracking-wider ${data.status === 'finalizado' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                        data.status === 'aprovado' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                            'bg-zinc-800/50 text-zinc-500 border-zinc-700/50'
                                        }`}>
                                        {(data.status || 'rascunho')}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 text-[10px] font-medium uppercase tracking-wide text-zinc-500 mb-4">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar size={12} />
                                        {date.toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock size={12} />
                                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] uppercase font-bold text-zinc-600 tracking-widest mb-0.5">Valor Final</span>
                                        <span className="font-mono font-bold text-zinc-300">
                                            {formatarMoeda(data.resultados?.precoComDesconto || 0)}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[8px] uppercase font-bold text-zinc-600 tracking-widest mb-0.5">Lucro</span>
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
        </SideBySideModal>
    );
}
