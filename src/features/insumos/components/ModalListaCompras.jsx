import React, { useMemo } from 'react';
import { ShoppingCart, Download, PackageCheck, Truck, Sparkles } from 'lucide-react';
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

            // Pass through all properties including calculated stats from store
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

    // Sidebar: Resumo Minimalista
    const sidebarContent = (
        <div className="flex flex-col h-full justify-between">
            <div className="flex flex-col items-center pt-8 text-center space-y-6">

                <div className="p-4 rounded-full bg-zinc-900/50 border border-zinc-800 mb-2">
                    <ShoppingCart size={32} className="text-zinc-400" />
                </div>

                <div className="space-y-1">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Custo Estimado</h3>
                    <div className="text-3xl font-black text-zinc-100 tracking-tight">
                        {formatCurrency(totalCost)}
                    </div>
                </div>

                <div className="w-full px-8">
                    <div className="h-px bg-zinc-800 w-full" />
                </div>

                <div className="space-y-4 w-full px-4">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500 font-medium">Itens para repor</span>
                        <span className="text-zinc-200 font-bold">{totalItems}</span>
                    </div>
                    {/* Add more summary lines if needed, e.g. distinct suppliers */}
                </div>
            </div>

            <div className="pb-4 px-4">
                <button
                    onClick={() => window.print()}
                    className="w-full py-3 rounded-xl border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                >
                    <Download size={14} />
                    Exportar Lista
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
                subtitle: "Reposição de estoque"
            }}
            maxWidth="max-w-5xl"
        >
            <div className="relative min-h-[400px]">
                {itemsToBuy.length > 0 ? (
                    <div className="space-y-1">
                        {/* Header da Tabela (Visual) */}
                        <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[10px] font-bold text-zinc-600 uppercase tracking-wider border-b border-zinc-900/50">
                            <div className="col-span-4">Item / Fornecedor</div>
                            <div className="col-span-2 text-right">Estoque</div>
                            <div className="col-span-2 text-right">Falta (Mín)</div>
                            <div className="col-span-2 text-right text-emerald-500">Sugestão (30d)</div>
                            <div className="col-span-2 text-right">Custo Est.</div>
                        </div>

                        <div className="divide-y divide-zinc-800/30">
                            {itemsToBuy.map((item) => {
                                // Smart Logic
                                const current = Number(item.currentStock || 0);
                                const min = Number(item.minStock || 0);
                                const avgDaily = Number(item.avgDailyConsumption || 0);

                                const missingMin = Math.max(0, min - current);
                                const missingSmart = Math.max(0, Math.ceil((avgDaily * 30) - current));

                                const isSmart = missingSmart > missingMin;
                                const quantityToBuy = Math.max(missingMin, missingSmart);
                                const estimatedCost = quantityToBuy * (Number(item.price) || 0);

                                return (
                                    <div key={item.id} className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-zinc-900/20 transition-colors items-center group">

                                        {/* Nome + Fornecedor */}
                                        <div className="col-span-4 flex flex-col justify-center min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-zinc-200 truncate">{item.name}</span>
                                                {item.purchaseLink && (
                                                    <a href={item.purchaseLink} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-zinc-300 transition-colors">
                                                        <Truck size={12} />
                                                    </a>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-zinc-500 font-medium truncate">
                                                {item.supplier}
                                            </span>
                                        </div>

                                        {/* Estoque Atual / Min */}
                                        <div className="col-span-2 flex flex-col items-end justify-center">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-zinc-300 font-mono font-bold text-xs">{item.currentStock}</span>
                                                <span className="text-zinc-600 text-[10px]">/ {item.minStock}</span>
                                            </div>
                                            <span className="text-[9px] text-zinc-600">{item.unit}</span>
                                        </div>

                                        {/* Falta (Mínimo) */}
                                        <div className="col-span-2 flex items-center justify-end">
                                            <span className="text-xs font-mono font-bold text-zinc-500">
                                                +{missingMin}
                                            </span>
                                        </div>

                                        {/* Sugestão Inteligente (Tooltip) */}
                                        <div className="col-span-2 flex items-center justify-end">
                                            <div
                                                className={`flex items-center gap-1.5 px-2 py-0.5 rounded cursor-help transition-colors ${isSmart ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-transparent text-zinc-500'}`}
                                                title={isSmart ? `Sugestão baseada no consumo de ${avgDaily.toFixed(2)}/dia (30 dias).` : "Sugestão baseada apenas no estoque mínimo."}
                                            >
                                                {isSmart && <Sparkles size={10} />}
                                                <span className={`text-xs font-mono font-bold ${isSmart ? '' : 'opacity-50'}`}>
                                                    +{quantityToBuy}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Custo */}
                                        <div className="col-span-2 flex items-center justify-end">
                                            <span className="text-xs font-mono font-bold text-zinc-400 group-hover:text-zinc-200 transition-colors">
                                                {formatCurrency(estimatedCost)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 space-y-4">
                        <div className="p-4 rounded-full bg-zinc-900/50">
                            <PackageCheck size={32} className="text-emerald-500/50" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-sm font-bold text-zinc-400">Tudo em ordem</h3>
                            <p className="text-xs text-zinc-600 mt-1">Nenhum item atingiu o estoque mínimo.</p>
                        </div>
                    </div>
                )}
            </div>
        </SideBySideModal>
    );
}
