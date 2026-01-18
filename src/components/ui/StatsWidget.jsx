import React, { memo } from "react";
import { Activity } from "lucide-react";

/**
 * StatsWidget - Card Estatístico Universal
 * 
 * Unifica a exibição de cards de status em:
 * - StatusFilamentos (Estoque, Financeiro, Clima)
 * - StatusOrcamentos (Comercial, Manufatura)
 * - StatusImpressoras (Futuro uso)
 * 
 * @param {Object} props
 * @param {string} props.title - Título pequeno (label superior)
 * @param {string|number|ReactNode} props.value - Valor principal grande
 * @param {LucideIcon} props.icon - Ícone principal
 * @param {string} [props.iconColor] - Classe de cor do ícone (ex: 'text-amber-500')
 * @param {string} [props.iconBg] - Classe de fundo/borda do ícone (ex: 'border-amber-500/20')
 * @param {string} [props.glowColor] - Cor do efeito de brilho (ex: 'bg-amber-500/20')
 * @param {string} [props.secondaryLabel] - Label da informação secundária
 * @param {string|ReactNode} [props.secondaryValue] - Valor da informação secundária
 * @param {boolean} [props.isLoading] - Estado de carregamento
 * @param {string} [props.className] - Classes extras
 */
const StatsWidget = memo(({
    title,
    value,
    icon: Icon,
    iconColor = "text-zinc-500",
    iconBg = "border-zinc-800/80 bg-zinc-950",
    glowColor = "",
    secondaryLabel,
    secondaryValue,
    isLoading = false,
    className = ""
}) => {
    return (
        <div className={`
            relative h-[130px] p-6 rounded-2xl overflow-hidden flex items-center justify-between 
            bg-zinc-950/40/40 border border-zinc-800/50 backdrop-blur-sm 
            group transition-all duration-300 hover:border-zinc-800/50/50 hover:bg-zinc-950/40/60 shadow-sm
            ${className}
        `}>
            {/* Background Glow sutil no hover */}
            {glowColor && (
                <div className={`absolute -right-2 -bottom-2 w-12 h-12 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${glowColor}`} />
            )}

            <div className="flex items-center gap-5 relative z-10">
                <div className={`p-3.5 rounded-xl border shadow-inner group-hover:scale-105 transition-transform duration-500 flex items-center justify-center ${iconBg} ${iconColor}`}>
                    {Icon && <Icon size={24} strokeWidth={2} />}
                </div>

                <div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.15em] mb-1.5">
                        {title}
                    </p>
                    {(secondaryLabel || secondaryValue) && (
                        <div className="flex flex-col">
                            {secondaryLabel && (
                                <span className="text-[13px] text-zinc-200 font-bold uppercase tracking-tight leading-tight">
                                    {secondaryLabel}
                                </span>
                            )}
                            {secondaryValue && (
                                <span className="text-[11px] text-zinc-500 font-medium mt-0.5">
                                    {isLoading ? "Sincronizando..." : secondaryValue}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="text-right flex flex-col justify-between h-full py-1 relative z-10">
                <h3 className={`text-2xl font-black font-sans tracking-tighter leading-none ${isLoading ? 'text-zinc-600' : 'text-zinc-100'}`}>
                    {isLoading ? "---" : value}
                </h3>
                <div className="flex items-center gap-2 justify-end opacity-20">
                    <Activity size={14} className={isLoading ? "animate-spin" : "text-zinc-500"} />
                </div>
            </div>
        </div>
    );
});

StatsWidget.displayName = "StatsWidget";

export default StatsWidget;
