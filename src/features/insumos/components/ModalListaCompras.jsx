import React, { useMemo } from 'react';
import { ShoppingCart, Download, PackageCheck, Truck } from 'lucide-react';
import SideBySideModal from '../../../components/ui/SideBySideModal';
import { formatCurrency } from '../../../utils/numbers';

export default function ModalListaCompras({ isOpen, onClose, supplies = [] }) {

    // Filtra e calcula itens para compra
    const { itemsToBuy, totalCost, totalItems } = useMemo(() => {
        const items = supplies.filter(item => {
            const current = Number(item.currentStock || item.estoque_atual || 0);
            const min = Number(item.minStock || item.estoque_minimo || 0);
            return current < min;
        }).map(item => {
            const current = Number(item.currentStock || item.estoque_atual || 0);
            const min = Number(item.minStock || item.estoque_minimo || 0);
            const price = Number(item.price || item.preco || 0);
            const missing = min - current;
            const cost = missing * price;

            return {
                ...item,
                missing,
                cost,
                supplier: item.supplier || item.fornecedor || 'Desconhecido'
            };
        });

        // Ordenar por fornecedor e nome
        items.sort((a, b) => (a.supplier || '').localeCompare(b.supplier || '') || a.name.localeCompare(b.name));

        const totalCost = items.reduce((acc, item) => acc + item.cost, 0);

        return { itemsToBuy: items, totalCost, totalItems: items.length };
    }, [supplies]);

    // Sidebar: Resumo de Custos
    const sidebarContent = (
        <div className="flex flex-col items-center w-full space-y-10 relative z-10 h-full justify-between">
            <div className="w-full flex flex-col items-center">
                <div className="flex items-center gap-3 justify-center text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-10">
                    <div className="h-px w-4 bg-zinc-900/50" />
                    <span>Resumo</span>
                    <div className="h-px w-4 bg-zinc-900/50" />
                </div>

                <div className="relative group p-8 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/20 shadow-inner flex items-center justify-center backdrop-blur-sm mb-6 animate-in zoom-in duration-500">
                    <ShoppingCart size={64} className="text-emerald-500/50" />
                </div>

                <div className="text-center">
                    <h3 className="text-lg font-bold text-zinc-100">Custo Total Estimado</h3>
                    <p className="text-[10px] text-zinc-500 px-6 mt-2 mb-4 leading-relaxed">
                        Valor aproximado para repor todos os itens abaixo do mínimo.
                    </p>
                    <div className="inline-block px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800">
                        <span className="text-2xl font-black text-emerald-400 tracking-tight">
                            {formatCurrency(totalCost)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="w-full space-y-3">
                <div className="bg-zinc-950/40 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Itens em Falta</span>
                    <span className="text-sm font-bold text-zinc-200">{totalItems}</span>
                </div>

                <button
                    onClick={() => window.print()}
                    className="w-full py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                >
                    <Download size={14} />
                    Exportar / Imprimir
                </button>
            </div>
        </div>
    );

    return (
        <SideBySideModal
            isOpen={isOpen}
            onClose={onClose}
            sidebar={sidebarContent}
            header={{
                title: "Lista de Compras",
                subtitle: "Itens que precisam de reposição urgente."
            }}
            maxWidth="max-w-5xl"
        >
            <div className="relative min-h-[400px]">
                {itemsToBuy.length > 0 ? (
                    <div className="space-y-6">
                        {/* Agrupar por Fornecedor (Simulado visualmente na lista) */}
                        <div className="divide-y divide-zinc-800/50 border border-zinc-800/50 rounded-xl overflow-hidden bg-zinc-900/20">
                            {itemsToBuy.map((item, idx) => (
                                <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 hover:bg-white/5 transition-colors group">
                                    {/* Info Item */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
                                                {item.supplier}
                                            </span>
                                            {item.purchaseLink && (
                                                <a href={item.purchaseLink} target="_blank" rel="noreferrer" className="text-emerald-500 hover:text-emerald-400">
                                                    <Truck size={12} />
                                                </a>
                                            )}
                                        </div>
                                        <h4 className="text-sm font-bold text-zinc-100 truncate">{item.name}</h4>
                                        <p className="text-[10px] text-zinc-500 mt-0.5">
                                            Estoque: <span className="text-rose-400 font-bold">{item.currentStock}</span> / Mín: {item.minStock} {item.unit}
                                        </p>
                                    </div>

                                    {/* Cálculo Reposição */}
                                    <div className="flex items-center gap-4 sm:gap-8 w-full sm:w-auto mt-2 sm:mt-0 bg-black/20 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                                        <div className="flex flex-col items-end">
                                            <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">Repor</span>
                                            <span className="text-sm font-mono font-bold text-zinc-300">+{item.missing} <span className="text-[10px] text-zinc-600">{item.unit}</span></span>
                                        </div>

                                        <div className="flex flex-col items-end min-w-[80px]">
                                            <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">Custo Est.</span>
                                            <span className="text-sm font-mono font-bold text-emerald-500">{formatCurrency(item.cost)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600">
                        <PackageCheck size={48} className="mb-4 text-emerald-500/20" />
                        <h3 className="text-lg font-bold text-zinc-300">Estoque Saudável!</h3>
                        <p className="text-sm">Nenhum item precisa de reposição no momento.</p>
                    </div>
                )}
            </div>
        </SideBySideModal>
    );
}
