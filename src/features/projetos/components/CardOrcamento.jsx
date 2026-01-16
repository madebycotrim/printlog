import React from "react";
import {
    ChevronRight
} from "lucide-react";
import { formatCurrency, parseNumber } from "../../../utils/numbers";
import { CONFIG_STATUS } from "../../../utils/constants";
import BotaoGerarPDF from "../../orcamentos/components/BotaoGerarPDF";

function CardOrcamento({ item, onClick, client }) {
    if (!item) return null;

    const d = item.data || {};
    const res = d.resultados || {};
    const ent = d.entradas || {};
    const statusKey = d.status || 'rascunho';
    const config = CONFIG_STATUS[statusKey] || CONFIG_STATUS['rascunho'];

    const precoVenda = parseNumber(res.precoComDesconto || res.precoSugerido);

    return (
        <div
            onClick={onClick}
            className="group relative flex flex-col justify-between w-full h-[200px] bg-zinc-950/40 border border-zinc-800/50 rounded-2xl p-6 hover-lift cursor-pointer overflow-hidden transition-all duration-300 hover:border-zinc-800/50"
        >
            {/* Header: Status e ID */}
            <div className="flex justify-between items-start mb-4">
                <div className={`
                    flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-wider
                    ${config.bg} ${config.color} ${config.border} bg-opacity-30
                `}>
                    <div className={`w-1.5 h-1.5 rounded-full ${config.color.replace('text', 'bg')}`} />
                    {config.label}
                </div>
                <span className="font-mono text-[10px] font-bold text-zinc-600 group-hover:text-zinc-400 transition-colors">
                    #{String(item.id || '000').slice(-4)}
                </span>
            </div>

            {/* Conteúdo Principal: Nome e Cliente */}
            <div className="flex-1">
                <h3 className="text-lg font-bold text-white leading-tight group-hover:text-amber-400 transition-colors line-clamp-2">
                    {item.label || ent.nomeProjeto || "Sem Título"}
                </h3>
                <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wide font-medium">
                    {ent.clienteNome || "Cliente não informado"}
                </p>
            </div>

            {/* Footer: Preço e Ícone */}
            <div className="flex items-end justify-between pt-4 border-t border-zinc-900/50">
                <div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">
                        Valor Final
                    </p>
                    <p className="text-2xl font-mono font-black text-zinc-200">
                        {formatCurrency(precoVenda)}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <BotaoGerarPDF projeto={item} cliente={client} />
                    <div className="
                        w-8 h-8 rounded-xl bg-zinc-950/40 border border-zinc-800 flex items-center justify-center 
                        text-zinc-500 transition-all duration-300
                        group-hover:bg-amber-500 group-hover:border-amber-500 group-hover:text-zinc-950 group-hover:scale-110
                    ">
                        <ChevronRight size={16} strokeWidth={3} />
                    </div>
                </div>
            </div>

            {/* Hover Gradient Sutil */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-transparent to-amber-500/0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none" />
        </div>
    );
}

// React.memo com função de comparação customizada para evitar re-renders desnecessários
export default React.memo(CardOrcamento, (prevProps, nextProps) => {
    // Só re-renderiza se ID, status ou data de criação mudarem
    return (
        prevProps.item?.id === nextProps.item?.id &&
        prevProps.item?.data?.status === nextProps.item?.data?.status &&
        prevProps.item?.created_at === nextProps.item?.created_at &&
        prevProps.item?.label === nextProps.item?.label
    );
});
