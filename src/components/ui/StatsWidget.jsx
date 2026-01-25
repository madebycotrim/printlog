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
    className = "",
    FooterIcon = Activity // Icone de rodapé padrão
}) => {
    return (
        <div className={`
            relative h-[130px] p-6 rounded-3xl overflow-hidden flex items-center justify-between 
            bg-[#09090b] border border-white/5 shadow-2xl group transition-all duration-300
            hover:border-white/10 hover:bg-[#0c0c0e] hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]
            ${className}
        `}>
            {/* Trama de Fundo (Grid) */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]" />

            {/* Linha de Brilho Superior */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent shadow-[0_0_10px_rgba(255,255,255,0.2)]" />

            {/* Background Glow sutil no hover */}
            {glowColor && (
                <div className={`absolute -right-10 -bottom-10 w-32 h-32 blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity duration-500 rounded-full bg-current ${glowColor}`} />
            )}

            <div className="flex items-center gap-5 relative z-10">
                <div className={`p-4 rounded-2xl border shadow-inner group-hover:scale-105 transition-transform duration-500 flex items-center justify-center backdrop-blur-md ${iconBg} ${iconColor}`}>
                    {Icon && <Icon size={24} strokeWidth={2} />}
                </div>

                <div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.15em] mb-1.5 whitespace-nowrap">
                        {title}
                    </p>
                    {(secondaryLabel || secondaryValue) && (
                        <div className="flex flex-col">
                            {secondaryLabel && (
                                <span className="text-[13px] text-zinc-200 font-bold uppercase tracking-tight leading-tight whitespace-nowrap truncate max-w-[120px]">
                                    {secondaryLabel}
                                </span>
                            )}
                            {secondaryValue && (
                                <span className="text-[11px] text-zinc-500 font-medium mt-0.5 whitespace-nowrap truncate max-w-[120px]">
                                    {isLoading ? "Sincronizando..." : secondaryValue}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="text-right flex flex-col justify-between h-full py-1 relative z-10">
                <h3 className={`text-2xl font-bold font-sans ${isLoading ? 'text-zinc-600' : 'text-zinc-100'}`}>
                    {isLoading ? "---" : value}
                </h3>
                <div className="flex items-center gap-2 justify-end opacity-20">
                    <FooterIcon size={14} className={isLoading ? "animate-spin" : "text-zinc-500"} />
                </div>
            </div>
        </div>
    );
});

StatsWidget.displayName = "StatsWidget";

export default StatsWidget;
