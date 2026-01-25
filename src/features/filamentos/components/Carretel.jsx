import React, { useMemo, useId } from "react";

const generateColors = (hex) => {
    let cleanHex = String(hex || "#3b82f6").replace(/^#/, '');
    if (cleanHex.length === 3) cleanHex = cleanHex.split('').map(c => c + c).join('');
    if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) cleanHex = "3b82f6";

    const num = parseInt(cleanHex, 16);
    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let b = num & 255;

    // DESATURATION / SOFTENING
    // Mix slightly with a neutral grey to reduce "neon" intensity
    const softness = 0.1;
    r = Math.round(r * (1 - softness) + 128 * softness);
    g = Math.round(g * (1 - softness) + 128 * softness);
    b = Math.round(b * (1 - softness) + 128 * softness);

    return {
        base: `rgb(${r}, ${g}, ${b})`,
        // Solid variants
        light: `rgb(${Math.min(255, Math.floor(r * 1.2))}, ${Math.min(255, Math.floor(g * 1.2))}, ${Math.min(255, Math.floor(b * 1.2))})`,
        dark: `rgb(${Math.floor(r * 0.7)}, ${Math.floor(g * 0.7)}, ${Math.floor(b * 0.7)})`,
    };
};

export default function Carretel({ color = "#3b82f6", percent = 100, size = 128, className = "" }) {
    const uniqueId = useId().replace(/:/g, "");
    const { base, light, dark } = useMemo(() => generateColors(color), [color]);
    const safePercent = Math.max(0, Math.min(100, Number(percent) || 0));

    // --- PROJECTION CONSTANTS ---
    const centerY = 50;
    const backZ = 32;
    const frontZ = 68;

    // Geometry
    const rimRadiusY = 48;
    const rimRadiusX = 24;
    const hubRadiusY = 12;
    const hubRadiusX = 6;
    const bedRadiusY = 12;
    const bedRadiusX = 6;

    // Fill to edges
    const maxFilamentY = 46; // Reduced from 48 to keep inside rim
    const maxFilamentX = 23; // Reduced from 24 to keep inside rim

    // Calculate current radius based on percentage
    const currentRadiusY = bedRadiusY + ((maxFilamentY - bedRadiusY) * (safePercent / 100));
    const currentRadiusX = bedRadiusX + ((maxFilamentX - bedRadiusX) * (safePercent / 100));

    const rimThickness = 5;

    return (
        <div className={`relative flex items-center justify-center shrink-0 select-none ${className}`} style={{ width: size, height: size }}>
            <svg viewBox="0 0 100 100" className="relative z-10 w-full h-full overflow-visible" preserveAspectRatio="xMidYMid meet">
                <defs>
                    {/* 1. SOFT VERTICAL LIGHTING (SOLID OPAQUE) */}
                    <linearGradient id={`filamentSoft-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={light} />
                        <stop offset="20%" stopColor={base} />
                        <stop offset="80%" stopColor={base} />
                        <stop offset="100%" stopColor={dark} />
                    </linearGradient>

                    {/* 2. PLASTIC MATERIAL (Satin Graphite) */}
                    <linearGradient id={`plasticBody-${uniqueId}`} x1="0" y1="0" x2="0.6" y2="1">
                        <stop offset="0%" stopColor="#52525b" />  {/* Lighter top-left */}
                        <stop offset="100%" stopColor="#18181b" /> {/* Darker bottom-right */}
                    </linearGradient>

                    <linearGradient id={`plasticRim-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#52525b" />
                        <stop offset="50%" stopColor="#27272a" />
                        <stop offset="100%" stopColor="#09090b" />
                    </linearGradient>
                </defs>

                {/* --- BACK FLANGE --- */}
                <ellipse cx={backZ} cy={centerY} rx={rimRadiusX} ry={rimRadiusY} fill="#18181b" />

                {/* --- FILAMENT MASS --- */}
                {safePercent > 0 && (
                    <g>
                        {/* Smooth Volume Form */}
                        <path
                            d={`
                                    M ${backZ} ${centerY - currentRadiusY}
                                    L ${frontZ - rimThickness} ${centerY - currentRadiusY}
                                    A ${currentRadiusX} ${currentRadiusY} 0 0 1 ${frontZ - rimThickness} ${centerY + currentRadiusY}
                                    L ${backZ} ${centerY + currentRadiusY}
                                    A ${currentRadiusX} ${currentRadiusY} 0 0 1 ${backZ} ${centerY - currentRadiusY}
                                `}
                            fill={`url(#filamentSoft-${uniqueId})`}
                        />
                        <ellipse
                            cx={frontZ - rimThickness} cy={centerY}
                            rx={currentRadiusX} ry={currentRadiusY}
                            fill={`url(#filamentSoft-${uniqueId})`}
                        />
                    </g>
                )}

                {/* --- INNER HUB --- */}
                <ellipse cx={frontZ} cy={centerY} rx={hubRadiusX} ry={hubRadiusY} fill={`url(#plasticBody-${uniqueId})`} />

                {/* --- FRONT FLANGE THICKNESS --- */}
                <path
                    d={`
                            M ${frontZ - rimThickness} ${centerY - rimRadiusY}
                            L ${frontZ} ${centerY - rimRadiusY}
                            A ${rimRadiusX} ${rimRadiusY} 0 1 1 ${frontZ} ${centerY + rimRadiusY}
                            L ${frontZ - rimThickness} ${centerY + rimRadiusY}
                            A ${rimRadiusX} ${rimRadiusY} 0 1 0 ${frontZ - rimThickness} ${centerY - rimRadiusY}
                        `}
                    fill={`url(#plasticRim-${uniqueId})`}
                />

                {/* --- FRONT FACE --- */}
                <defs>
                    <mask id={`vectorMask-${uniqueId}`}>
                        <rect x="0" y="0" width="100" height="100" fill="white" />
                        <g transform={`translate(${frontZ}, ${centerY})`}>
                            {[0, 60, 120, 180, 240, 300].map(angle => (
                                <path
                                    key={angle}
                                    d={`
                                            M ${Math.cos((angle + 18) * Math.PI / 180) * 8} ${Math.sin((angle + 18) * Math.PI / 180) * 16}
                                            L ${Math.cos((angle + 18) * Math.PI / 180) * 19} ${Math.sin((angle + 18) * Math.PI / 180) * 38}
                                            A 19 38 0 0 1 ${Math.cos((angle + 42) * Math.PI / 180) * 19} ${Math.sin((angle + 42) * Math.PI / 180) * 38}
                                            L ${Math.cos((angle + 42) * Math.PI / 180) * 8} ${Math.sin((angle + 42) * Math.PI / 180) * 16}
                                            Z
                                        `}
                                    fill="black"
                                />
                            ))}
                        </g>
                    </mask>
                </defs>

                <ellipse
                    cx={frontZ} cy={centerY} rx={rimRadiusX} ry={rimRadiusY}
                    fill={`url(#plasticBody-${uniqueId})`}
                    mask={`url(#vectorMask-${uniqueId})`}
                />

                {/* --- PREMIUM DETAILS (Subtle) --- */}
                <ellipse
                    cx={frontZ} cy={centerY} rx={rimRadiusX - 1} ry={rimRadiusY - 1}
                    fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8"
                    mask={`url(#vectorMask-${uniqueId})`}
                />
                <ellipse cx={frontZ} cy={centerY} rx={hubRadiusX} ry={hubRadiusY} fill={`url(#plasticBody-${uniqueId})`} />
                <ellipse cx={frontZ} cy={centerY} rx={hubRadiusX * 0.4} ry={hubRadiusY * 0.4} fill="#0c0c0e" />

            </svg>
        </div>
    );
}
