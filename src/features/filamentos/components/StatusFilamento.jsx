import React, { useMemo } from "react";
import { ArrowDownFromLine, Droplet } from "lucide-react";

export const StatusFilamento = ({ item, umidadeAtual, className = "" }) => {
    const estatisticas = useMemo(() => {
        const capacidade = Math.max(1, Number(item?.peso_total) || 1000);
        const atual = Math.max(0, Number(item?.peso_atual) || 0);
        const porcentagem = Math.min(100, Math.max(0, Math.round((atual / capacidade) * 100)));
        return { ehCritico: porcentagem <= 20 };
    }, [item?.peso_atual, item?.peso_total]);

    const ehHigroscopico = ['PLA', 'PETG', 'TPU', 'NYLON', 'ABS', 'ASA'].includes(item?.material?.toUpperCase());
    const riscoUmidade = ehHigroscopico && (umidadeAtual > 50);

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {estatisticas.ehCritico && (
                <div className="flex items-center gap-1 text-rose-500">
                    <ArrowDownFromLine size={10} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Estoque Crítico</span>
                </div>
            )}

            {!estatisticas.ehCritico && !riscoUmidade && (
                <span className="text-[10px] text-zinc-600 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                    Em condições ideais
                </span>
            )}
        </div>
    );
};
