import React, { memo } from "react";

/**
 * COMPONENTE UI: BARRA SEGMENTADA
 * Exibe progresso/saúde em segmentos discretos com suporte a animação de pulso.
 */
export const SegmentedProgress = memo(({ pct, color, pulse, titlePrefix = "Nível" }) => {
    const segments = 24;
    const safePct = Math.max(0, Math.min(100, Number(pct) || 0));

    return (
        <div
            className={`h-3 w-full bg-zinc-950 border border-zinc-800/50 rounded-full px-1 flex items-center gap-[2px] relative overflow-hidden ${pulse ? 'ring-1 ring-rose-500/20' : ''}`}
            title={`${titlePrefix}: ${safePct}%`}
        >
            {[...Array(segments)].map((_, i) => {
                const isActive = i < (safePct / (100 / segments));
                return (
                    <div
                        key={i}
                        className={`h-[4px] flex-1 rounded-full transition-all duration-700 ${pulse && isActive ? 'animate-pulse' : ''}`}
                        style={{
                            backgroundColor: isActive ? color : '#27272a',
                            boxShadow: isActive ? `0 0 8px ${color}40` : 'none',
                            opacity: isActive ? 1 : 0.2
                        }}
                    />
                );
            })}
        </div>
    );
});
