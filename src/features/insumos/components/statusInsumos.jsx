import React from "react";
import { AlertTriangle, BadgeDollarSign, Activity, Box, PackageCheck } from "lucide-react";
import StatsWidget from "../../../components/ui/StatsWidget";
import { formatCurrency } from "../../../utils/numbers";



/**
 * Card de Visão Geral (Estoque)
 */
const StockOverviewCard = ({ totalItems = 0, lowStockCount = 0 }) => {
    const count = Math.max(0, parseInt(lowStockCount, 10) || 0);
    const total = Math.max(0, parseInt(totalItems, 10) || 0);
    const isAlert = count > 0;

    // Cálculo de progresso visual (Inverso: quanto menos items em alerta, maior a barra)
    // Se 10 itens total, e 2 em alerta (20%), saúde é 80%.
    const healthPercentage = total > 0 ? ((total - count) / total) * 100 : 100;
    const progressWidth = `${healthPercentage}%`;

    return (
        <div
            role="status"
            aria-live="polite"
            className={`relative h-[130px] p-6 rounded-2xl overflow-hidden flex items-center justify-between transition-all duration-500 group border
        ${isAlert
                    ? 'bg-rose-950/10 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.05)]'
                    : 'bg-zinc-950/40/40 border-orange-500/30 backdrop-blur-sm shadow-[0_0_15px_rgba(249,115,22,0.05)]'}`}
        >

            <div className={`absolute -right-4 -top-4 w-24 h-24 blur-[60px] transition-all duration-700
          ${isAlert ? 'bg-rose-500/10' : 'bg-orange-500/10'}`}
            />

            <div className="flex items-center gap-5 relative z-10">
                <div className={`p-3.5 rounded-xl bg-zinc-950 border transition-all duration-500
            ${isAlert ? 'border-rose-500/40 text-rose-500' : 'border-orange-500/20 text-orange-400'}`}>
                    {isAlert ? (
                        <AlertTriangle size={24} strokeWidth={2.5} className="animate-pulse" />
                    ) : (
                        <Box size={24} strokeWidth={2.5} />
                    )}
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${isAlert ? 'bg-rose-500 animate-pulse' : 'bg-orange-500'}`} />
                        <p className={`text-[10px] font-bold uppercase tracking-[0.15em] ${isAlert ? 'text-rose-500/80' : 'text-zinc-500'}`}>
                            Monitoramento do Estoque
                        </p>
                    </div>
                    <h3 className={`text-xl font-bold tracking-tight leading-none transition-colors uppercase
              ${isAlert ? 'text-rose-500' : 'text-zinc-100'}`}>
                        {isAlert ? 'Reposição Necessária' : 'Estoque em Dia'}
                    </h3>
                    <p className={`text-[11px] font-medium mt-2 uppercase tracking-wide
              ${isAlert ? 'text-rose-400/70' : 'text-zinc-500'}`}>
                        {isAlert
                            ? `${count} ${count === 1 ? 'item abaixo do limite' : 'itens abaixo do limite'}`
                            : `Total de ${totalItems} itens cadastrados`
                        }
                    </p>
                </div>
            </div>

            <div className="flex flex-col items-end relative z-10">
                <div className="text-[9px] text-zinc-600 font-bold uppercase mb-2 tracking-widest">Status_Geral</div>
                <div className="h-1.5 w-16 bg-zinc-950 rounded-full overflow-hidden border border-white/5" title={isAlert ? "Atenção necessária" : "Estoque saudável"}>
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${isAlert ? 'bg-rose-500' : 'bg-orange-500'}`}
                        style={{ width: progressWidth }}
                    />
                </div>
            </div>
        </div>
    );
};

// StockOverviewCard mantido por ser específico
/* StatCard e formatCurrency removidos em favor de componentes unificados */

export default function StatusInsumos({
    totalItems = 0,
    lowStockCount = 0,
    valorTotal = 0,
    itemsWithoutStock = 0
}) {
    const percentageAvailable = totalItems > 0 ? ((totalItems - itemsWithoutStock) / totalItems) * 100 : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* 1. Visão Geral + Alertas */}
            <StockOverviewCard
                totalItems={totalItems}
                lowStockCount={lowStockCount}
            />

            {/* 2. Valor em Estoque */}
            {/* 2. Valor em Estoque */}
            <StatsWidget
                title="Financeiro"
                value={formatCurrency(valorTotal)}
                icon={BadgeDollarSign}
                iconColor="text-orange-500"
                iconBg="border-orange-500/20 bg-zinc-950"
                secondaryLabel="Valor em Estoque"
                secondaryValue="Custo total dos insumos"
            />

            {/* 3. Itens Zerados */}
            <StatsWidget
                title="Disponibilidade"
                value={percentageAvailable.toFixed(1) + '%'}
                icon={PackageCheck}
                iconColor="text-orange-500"
                iconBg="border-orange-500/20 bg-zinc-950"
                secondaryLabel="Itens em Estoque"
                secondaryValue={`${totalItems - itemsWithoutStock} de ${totalItems} itens`}
            />

        </div>
    );
}
