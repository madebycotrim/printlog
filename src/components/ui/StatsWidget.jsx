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
    iconColor, // Optional override
    iconBg, // Optional override
    glowColor, // Optional override
    secondaryLabel,
    secondaryValue,
    isLoading = false,
    className = "",
    FooterIcon, // Optional
    progress, // { value: number (0-100), color: string (class) }
    isAlert = false, // If true, triggers error theme defaults
    colorTheme = null, // 'rose', 'emerald', 'sky', 'amber' (overrides isAlert)
    children // Custom content
}) => {
    // --- Universal Color Logic ---
    const themes = {
        rose: { icon: "text-rose-500", bg: "border-rose-500/20 bg-rose-500/5", glow: "bg-rose-500/20", border: 'border-white/5' },
        emerald: { icon: "text-emerald-500", bg: "border-emerald-500/20 bg-emerald-500/5", glow: "bg-emerald-500/20", border: 'border-white/5' },
        sky: { icon: "text-sky-500", bg: "border-sky-500/20 bg-sky-500/5", glow: "bg-sky-500/20", border: 'border-white/5' },
        amber: { icon: "text-amber-500", bg: "border-amber-500/20 bg-amber-500/5", glow: "bg-amber-500/20", border: 'border-white/5' },
        zinc: { icon: "text-zinc-500", bg: "border-zinc-800/80 bg-zinc-950", glow: "", border: 'border-white/5' },
        orange: { icon: "text-orange-500", bg: "border-orange-500/20 bg-orange-500/5", glow: "bg-orange-500/20", border: 'border-white/5' }
    };

    // Determine effective theme
    let activeTheme = themes.zinc;
    if (colorTheme && themes[colorTheme]) activeTheme = themes[colorTheme];
    else if (isAlert) activeTheme = themes.rose;

    // Props override defaults if provided, otherwise use theme
    const finalIconColor = iconColor || activeTheme.icon;
    const finalIconBg = iconBg || activeTheme.bg;
    const finalGlow = glowColor || activeTheme.glow;
    const finalBorder = isAlert || colorTheme ? activeTheme.border : themes.zinc.border;

    return (
        <div className={`
            relative h-[130px] p-6 rounded-3xl overflow-hidden flex items-center justify-between 
            bg-[#09090b] shadow-2xl group transition-all duration-300 border
            hover:border-white/10 hover:bg-[#0c0c0e] hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]
            ${finalBorder}
            ${className}
        `}>
            {/* Trama de Fundo (Grid) */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]" />

            {/* Linha de Brilho Superior */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent to-transparent shadow-[0_0_10px_rgba(255,255,255,0.2)] 
                ${isAlert || colorTheme ? 'via-white/40' : 'via-white/20'}`}
            />

            {/* Background Glow sutil no hover */}
            {finalGlow && (
                <div className={`absolute -right-10 -bottom-10 w-32 h-32 blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity duration-500 rounded-full bg-current ${finalGlow}`} />
            )}

            <div className="flex items-center gap-5 relative z-10">
                <div className={`p-4 rounded-2xl border shadow-inner group-hover:scale-105 transition-transform duration-500 flex items-center justify-center backdrop-blur-md ${finalIconBg} ${finalIconColor}`}>
                    {Icon && <Icon size={24} strokeWidth={2} className={isAlert ? "animate-pulse" : ""} />}
                </div>

                <div>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5 whitespace-nowrap ${isAlert ? 'text-rose-500/80' : 'text-zinc-500'}`}>
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

            <div className="text-right flex flex-col justify-between h-full py-1 relative z-10 min-w-[80px]">
                <h3 className={`text-2xl font-bold font-sans ${isLoading ? 'text-zinc-600' : (isAlert ? 'text-rose-500' : 'text-zinc-100')}`}>
                    {isLoading ? "---" : value}
                </h3>

                <div className="flex flex-col items-end gap-1">
                    {/* Progress Bar Support */}
                    {progress && (
                        <div className="w-16 h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${progress.color || 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(100, Math.max(0, progress.value))}%` }}
                            />
                        </div>
                    )}

                    {FooterIcon && (
                        <div className="flex items-center gap-2 justify-end opacity-20 mt-1">
                            <FooterIcon size={14} className={isLoading ? "animate-spin" : "text-zinc-500"} />
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Children (Charts, Extra Details) */}
            {children && (
                <div className="absolute inset-x-6 bottom-4 md:inset-x-auto md:w-1/3 md:right-6 md:bottom-3 z-0 opacity-50 contrast-125 pointer-events-none mix-blend-plus-lighter">
                    {children}
                </div>
            )}
        </div>
    );
});

StatsWidget.displayName = "StatsWidget";

export default StatsWidget;
