import React from "react";
import { AlertTriangle, BadgeDollarSign, Box, PackageCheck, AlertOctagon } from "lucide-react";
import StatsWidget from "../../../components/ui/StatsWidget";
import { formatCurrency } from "../../../utils/numbers";


export default function StatusInsumos({
    totalItems = 0,
    lowStockCount = 0,
    valorTotal = 0,
    itemsWithoutStock = 0,
    restockCost = 0,
    onLowStockClick,
    onCriticalClick,
    onTotalClick
}) {
    const total = Math.max(0, parseInt(totalItems, 10) || 0);
    const low = Math.max(0, parseInt(lowStockCount, 10) || 0);
    const zero = Math.max(0, parseInt(itemsWithoutStock, 10) || 0);

    // Health logic
    const healthPercentage = total > 0 ? ((total - low) / total) * 100 : 100;
    const isAlert = low > 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Visão Geral (Saúde) */}
            <div onClick={onTotalClick} className={onTotalClick ? "cursor-pointer transition-transform hover:scale-[1.02]" : ""}>
                <StatsWidget
                    title="Status do Estoque"
                    value={isAlert ? "Reposição" : "Saudável"}
                    icon={isAlert ? AlertTriangle : Box}
                    isAlert={isAlert}
                    colorTheme={isAlert ? 'rose' : 'zinc'}
                    secondaryLabel={isAlert ? "Itens em Falta" : "Total de Itens"}
                    secondaryValue={isAlert ? `${low} itens` : `${total} itens`}
                    progress={{
                        value: healthPercentage,
                        color: isAlert ? 'bg-rose-500' : 'bg-emerald-500'
                    }}
                    valueSize="text-xl"
                />
            </div>

            {/* 2. Financeiro */}
            <StatsWidget
                title="Financeiro"
                value={formatCurrency(valorTotal)}
                icon={BadgeDollarSign}
                colorTheme="emerald"
                secondaryLabel="Valor Total"
                secondaryValue="Em estoque"
                valueSize="text-xl"
            />

            {/* 3. Custo de Reposição */}
            <StatsWidget
                title="Reposição"
                value={formatCurrency(restockCost)}
                icon={PackageCheck}
                colorTheme="sky"
                secondaryLabel="Custo Estimado"
                secondaryValue="Para repor estoque"
                valueSize="text-xl"
            />

            {/* 4. Esgotados */}
            <div onClick={onCriticalClick} className={onCriticalClick ? "cursor-pointer transition-transform hover:scale-[1.02]" : ""}>
                <StatsWidget
                    title="Críticos"
                    value={zero > 0 ? `${zero}` : "Zero"}
                    icon={AlertOctagon}
                    isAlert={zero > 0}
                    colorTheme={zero > 0 ? 'amber' : 'zinc'}
                    secondaryLabel="Estoque Zerado"
                    secondaryValue={zero > 0 ? "Repor Urgente" : "Nenhum Item"}
                    valueSize="text-xl"
                />
            </div>
        </div>
    );
}
