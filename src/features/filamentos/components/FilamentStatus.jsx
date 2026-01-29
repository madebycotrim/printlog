import React, { useMemo } from "react";
import { ArrowDownFromLine, Droplet } from "lucide-react";

export const FilamentStatus = ({ item, currentHumidity, className = "" }) => {
    const stats = useMemo(() => {
        const capacidade = Math.max(1, Number(item?.peso_total) || 1000);
        const atual = Math.max(0, Number(item?.peso_atual) || 0);
        const pct = Math.min(100, Math.max(0, Math.round((atual / capacidade) * 100)));
        return { ehCritico: pct <= 20 };
    }, [item?.peso_atual, item?.peso_total]);

    const isHygroscopic = ['PLA', 'PETG', 'TPU', 'NYLON', 'ABS', 'ASA'].includes(item?.material?.toUpperCase());
    const moistureRisk = isHygroscopic && (currentHumidity > 50);

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {stats.ehCritico && (
                <div className="flex items-center gap-1 text-rose-500">
                    <ArrowDownFromLine size={10} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Estoque Crítico</span>
                </div>
            )}

            {!stats.ehCritico && !moistureRisk && (
                <span className="text-[10px] text-zinc-600 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                    Em condições ideais
                </span>
            )}
        </div>
    );
};
