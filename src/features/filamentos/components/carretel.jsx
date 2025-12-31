import React, { useMemo, useId } from "react";

const generateColors = (hex) => {
    // Tratamento rigoroso para garantir que o hex seja válido
    let cleanHex = String(hex || "#3b82f6").replace(/^\#/, '');
    
    if (cleanHex.length === 3) {
        cleanHex = cleanHex.split('').map(c => c + c).join('');
    }
    
    // Fallback para azul se o hex for inválido
    if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
        cleanHex = "3b82f6";
    }

    const num = parseInt(cleanHex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;

    // Função de mixagem para gerar variações de sombra
    const mix = (c, t, p) => Math.round(c + (t - c) * p);
    
    return {
        base: "#" + cleanHex,
        // Sombra mais profunda para dar volume ao carretel
        shadow: `rgb(${mix(r, 0, 0.5)}, ${mix(g, 0, 0.5)}, ${mix(b, 0, 0.5)})`,
        // Cor de brilho para a parte central do filamento
        light: `rgb(${mix(r, 255, 0.2)}, ${mix(g, 255, 0.2)}, ${mix(b, 255, 0.2)})`
    };
};

export default function SpoolSideView({
    color = "#3b82f6",
    percent = 100,
    size = 128,
    className = ""
}) {
    // useId gera IDs únicos para os gradientes SVG, evitando conflitos se houver múltiplos carretéis na tela
    const uniqueId = useId().replace(/:/g, ""); 
    const { base, shadow, light } = useMemo(() => generateColors(color), [color]);
    
    // Garantia de que o percentual seja um número entre 0 e 100
    const safePercent = Math.max(0, Math.min(100, Number(percent) || 0));

    // Geometria fixa do SVG (100x100)
    const cxLeft = 18;
    const cxRight = 82;
    const cy = 50;
    const coreRadius = 12; // Raio do eixo central (vazio)
    const maxRadius = 38;  // Raio máximo do filamento (cheio)
    
    // Cálculo do raio atual baseado no preenchimento (interpolação linear)
    const currentRadius = coreRadius + ((maxRadius - coreRadius) * (safePercent / 100));

    // Largura útil da massa de filamento
    const filamentWidth = Math.max(0, cxRight - cxLeft - 4);

    return (
        <div
            className={`relative flex items-center justify-center shrink-0 select-none ${className}`}
            style={{ width: size, height: size }}
        >
            <svg
                viewBox="0 0 100 100"
                className="relative z-10 w-full h-full overflow-visible"
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    {/* Gradiente do Corpo do Carretel (Plástico/Preto) */}
                    <linearGradient id={`spoolBody-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#27272a" />
                        <stop offset="50%" stopColor="#09090b" />
                        <stop offset="100%" stopColor="#000000" />
                    </linearGradient>

                    {/* Gradiente do Filamento (Volume e Brilho) */}
                    <linearGradient id={`filamentGrad-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={shadow} />
                        <stop offset="30%" stopColor={base} />
                        <stop offset="50%" stopColor={light} />
                        <stop offset="70%" stopColor={base} />
                        <stop offset="100%" stopColor={shadow} />
                    </linearGradient>

                    {/* Textura de Fios (Simula as voltas do filamento) */}
                    <pattern id={`wires-${uniqueId}`} width="100%" height="2" patternUnits="userSpaceOnUse">
                        <line x1="0" y1="1" x2="100" y2="1" stroke="black" strokeWidth="0.5" opacity="0.2" />
                    </pattern>
                </defs>

                {/* --- EIXO CENTRAL (Onde o filamento enrola) --- */}
                <rect 
                    x={cxLeft} 
                    y={cy - coreRadius} 
                    width={cxRight - cxLeft} 
                    height={coreRadius * 2} 
                    fill="#050505" 
                />

                {/* --- MASSA DE FILAMENTO --- */}
                {safePercent > 0 && (
                    <g className="transition-all duration-700 ease-in-out">
                        <rect
                            x={cxLeft + 2} 
                            y={cy - currentRadius}
                            width={filamentWidth} 
                            height={currentRadius * 2}
                            fill={`url(#filamentGrad-${uniqueId})`}
                        />
                        <rect
                            x={cxLeft + 2} 
                            y={cy - currentRadius}
                            width={filamentWidth} 
                            height={currentRadius * 2}
                            fill={`url(#wires-${uniqueId})`}
                        />
                    </g>
                )}

                {/* --- LATERAIS DO CARRETEL (FLANGES) --- */}
                {/* Lateral Esquerda */}
                <g>
                    <ellipse cx={cxLeft} cy={cy} rx="7" ry="42" fill={`url(#spoolBody-${uniqueId})`} stroke="#3f3f46" strokeWidth="0.5" />
                    <circle cx={cxLeft} cy={cy} r="3" fill="#000" />
                    <circle cx={cxLeft} cy={cy} r="1" fill="#18181b" />
                </g>

                {/* Lateral Direita */}
                <g>
                    <ellipse cx={cxRight} cy={cy} rx="7" ry="42" fill={`url(#spoolBody-${uniqueId})`} stroke="#3f3f46" strokeWidth="0.5" />
                    <circle cx={cxRight} cy={cy} r="3" fill="#000" />
                    <circle cx={cxRight} cy={cy} r="1" fill="#18181b" />
                </g>
            </svg>
        </div>
    );
}