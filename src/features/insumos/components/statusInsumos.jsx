import React from "react";
import { AlertTriangle, BadgeDollarSign, Box, PackageCheck } from "lucide-react";
import StatsWidget from "../../../components/ui/StatsWidget";
import { formatCurrency } from "../../../utils/numbers";

/**
 * Card de Visão Geral (Estoque) - Semantic Colors
 */
const StockOverviewCard = ({ totalItems = 0, lowStockCount = 0 }) => {
    const count = Math.max(0, parseInt(lowStockCount, 10) || 0);
    const total = Math.max(0, parseInt(totalItems, 10) || 0);
    const isAlert = count > 0;

    const healthPercentage = total > 0 ? ((total - count) / total) * 100 : 100;
    const progressWidth = `${healthPercentage}%`;

    // Colors styled to match components/StatusFilamentos.jsx
    // Alert: Rose (Red)
    // Healthy: Neutral/Zinc with subtle Emerald hints

    return (
        <div
            role="status"
            className={`relative h-[130px] p-6 rounded-3xl overflow-hidden flex items-center justify-between transition-all duration-500 group border
        bg-[#09090b] shadow-2xl 
        ${isAlert
                    ? 'border-rose-500/30'
                    : 'border-white/5 hover:border-white/10'}`}
        >
            {/* Trama de Fundo */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]" />

            {/* Linha de Brilho Superior */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent to-transparent shadow-[0_0_15px_rgba(255,255,255,0.1)] 
          ${isAlert ? 'via-rose-500 shadow-rose-500/50' : 'via-white/20'}`}
            />

            <div className={`absolute -right-4 -top-4 w-32 h-32 blur-[80px] transition-all duration-700 
          ${isAlert ? 'bg-rose-500/20' : 'bg-emerald-500/5'}`}
            />

            <div className="flex items-center gap-5 relative z-10 w-full">
                {/* ICON BOX */}
                <div className={`p-4 rounded-2xl bg-zinc-950/50 border backdrop-blur-md transition-all duration-500 shrink-0
            ${isAlert
                        ? 'border-rose-500/40 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                        : 'border-white/5 text-zinc-400 group-hover:text-white'}`}>
                    {isAlert ? (
                        <AlertTriangle size={24} strokeWidth={2.5} className="animate-pulse" />
                    ) : (
                        <Box size={24} strokeWidth={2.5} />
                    )}
                </div>

                {/* CONTENT */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${isAlert ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                            <p className={`text-[10px] font-bold uppercase tracking-[0.15em] ${isAlert ? 'text-rose-500/80' : 'text-zinc-500'}`}>
                                STATUS DO ESTOQUE
                            </p>
                        </div>
                        <div className="h-1.5 w-16 bg-zinc-950 rounded-full overflow-hidden border border-white/5" title={isAlert ? "Atenção necessária" : "Estoque saudável"}>
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${isAlert ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                style={{ width: progressWidth }}
                            />
                        </div>
                    </div>

                    <h3 className={`text-xl font-bold tracking-tight leading-none transition-colors uppercase whitespace-nowrap overflow-hidden text-ellipsis
                        ${isAlert ? 'text-rose-500' : 'text-zinc-100'}`}>
                        {isAlert ? 'Reposição Necessária' : 'Estoque Saudável'}
                    </h3>

                    <p className={`text-[11px] font-medium mt-1.5 uppercase tracking-wide truncate
                ${isAlert ? 'text-rose-400/70' : 'text-zinc-600'}`}>
                        {isAlert
                            ? `${count} itens em falta`
                            : `Total: ${total} itens`
                        }
                    </p>
                </div>
            </div>
        </div>
    );
};

export default function StatusInsumos({
    totalItems = 0,
    lowStockCount = 0,
    valorTotal = 0,
    itemsWithoutStock = 0,
    restockCost = 0
}) {
    const hasZeroStock = itemsWithoutStock > 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Visão Geral (Saúde) */}
            <StockOverviewCard
                totalItems={totalItems}
                lowStockCount={lowStockCount}
            />

            {/* 2. Financeiro -> VERDE (Emerald) */}
            <StatsWidget
                title="Financeiro"
                value={formatCurrency(valorTotal)}
                icon={BadgeDollarSign}
                iconColor="text-emerald-400"
                iconBg="border-emerald-500/20 bg-emerald-500/5"
                glowColor="bg-emerald-500/20"
                secondaryLabel="Valor Total"
                secondaryValue="Em estoque"
            />

            {/* 3. Custo de Reposição -> AZUL (Sky) - Mostra quanto precisa investir para repor estoques baixos */}
            <StatsWidget
                title="Reposição"
                value={formatCurrency(restockCost)}
                icon={PackageCheck}
                iconColor="text-sky-400"
                iconBg="border-sky-500/20 bg-sky-500/5"
                glowColor="bg-sky-500/20"
                secondaryLabel="Custo Estimado"
                secondaryValue="Para repor estoque"
            />

            {/* 4. Esgotados -> AMARELO/LARANJA (Warning) se houver, ou NEUTRO */}
            <StatsWidget
                title="Esgotados"
                value={itemsWithoutStock.toString()}
                icon={AlertTriangle}
                iconColor={hasZeroStock ? "text-orange-400" : "text-zinc-400"}
                iconBg={hasZeroStock ? "border-orange-500/20 bg-orange-500/5" : "border-white/5 bg-zinc-900/50"}
                glowColor={hasZeroStock ? "bg-orange-500/20" : "bg-white/5"}
                secondaryLabel="Estoque Zero"
                secondaryValue={hasZeroStock ? "Repor Urgente" : "Nenhum Item"}
            />
        </div>
    );
}
