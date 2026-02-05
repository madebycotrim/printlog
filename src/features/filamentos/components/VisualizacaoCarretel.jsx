import React, { useMemo, useId } from "react";

const gerarCores = (hex) => {
    let hexLimpo = String(hex || "#3b82f6").replace(/^#/, '');
    if (hexLimpo.length === 3) hexLimpo = hexLimpo.split('').map(c => c + c).join('');
    if (!/^[0-9A-Fa-f]{6}$/.test(hexLimpo)) hexLimpo = "3b82f6";

    const num = parseInt(hexLimpo, 16);
    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let b = num & 255;

    // DESSATURAÇÃO / SUAVIZAÇÃO
    // Mistura levemente com cinza neutro para reduzir intensidade "neon"
    const suavidade = 0.1;
    r = Math.round(r * (1 - suavidade) + 128 * suavidade);
    g = Math.round(g * (1 - suavidade) + 128 * suavidade);
    b = Math.round(b * (1 - suavidade) + 128 * suavidade);

    return {
        base: `rgb(${r}, ${g}, ${b})`,
        // Variantes sólidas
        claro: `rgb(${Math.min(255, Math.floor(r * 1.2))}, ${Math.min(255, Math.floor(g * 1.2))}, ${Math.min(255, Math.floor(b * 1.2))})`,
        escuro: `rgb(${Math.floor(r * 0.7)}, ${Math.floor(g * 0.7)}, ${Math.floor(b * 0.7)})`,
    };
};

export default function Carretel({ cor = "#3b82f6", porcentagem = 100, tamanho = 128, className = "", tipo = 'FDM' }) {
    const idUnico = useId().replace(/:/g, "");
    const { base, claro, escuro } = useMemo(() => gerarCores(cor), [cor]);
    // Força pelo menos 1% visual para parecer "1g" (não vazio/invisível)
    const porcentagemSegura = Math.max(1, Math.min(100, Number(porcentagem) || 0));

    // --- DETECÇÃO DE COR ---
    const ehEscuro = useMemo(() => {
        const rgb = parseInt(cor.replace('#', ''), 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const b = (rgb >> 0) & 0xff;
        const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        return luma < 40;
    }, [cor]);

    const estiloContorno = ehEscuro ? { stroke: "rgba(255,255,255,0.15)", strokeWidth: "0.5" } : {};

    // ============================================
    // VISUALIZAÇÃO: GARRAFA DE RESINA (SLA)
    // ============================================
    if (tipo === 'SLA') {
        // Dimensões da garrafa (ViewBox 0..100)
        const bottleHeight = 80;
        const bottleWidth = 46;
        const bottleRx = 4;
        const bottleX = (100 - bottleWidth) / 2;
        const bottleY = 15;

        // Nível do líquido
        const liquidHeight = (bottleHeight * 0.9) * (porcentagemSegura / 100);
        const liquidY = (bottleY + bottleHeight) - liquidHeight;

        return (
            <div className={`relative flex items-center justify-center shrink-0 select-none ${className}`} style={{ width: tamanho, height: tamanho }}>
                <svg viewBox="0 0 100 100" className="relative z-10 w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id={`resinaLiq-${idUnico}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={claro} stopOpacity="0.9" />
                            <stop offset="50%" stopColor={base} stopOpacity="0.9" />
                            <stop offset="100%" stopColor={escuro} stopOpacity="0.95" />
                        </linearGradient>
                        <linearGradient id={`garrafaPlastic-${idUnico}`} x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#27272a" />
                            <stop offset="20%" stopColor="#52525b" />
                            <stop offset="50%" stopColor="#18181b" />
                            <stop offset="80%" stopColor="#52525b" />
                            <stop offset="100%" stopColor="#09090b" />
                        </linearGradient>
                    </defs>

                    {/* Tampa (Mais larga - Estilo Resina) */}
                    <rect x="36" y="5" width="28" height="12" rx="2" fill="#18181b" stroke="#3f3f46" strokeWidth="0.5" />

                    {/* Corpo da Garrafa (Máscara/Contorno) */}
                    <mask id={`maskBottle-${idUnico}`}>
                        <path
                            d={`
                                M ${bottleX} ${bottleY} 
                                h ${bottleWidth} 
                                v ${bottleHeight - bottleRx} 
                                a ${bottleRx} ${bottleRx} 0 0 1 -${bottleRx} ${bottleRx} 
                                h -${bottleWidth - (bottleRx * 2)} 
                                a ${bottleRx} ${bottleRx} 0 0 1 -${bottleRx} -${bottleRx} 
                                z
                            `}
                            fill="white"
                        />
                    </mask>

                    {/* Fundo da Garrafa (Plástico Escuro Translucido) */}
                    <path
                        d={`
                            M ${bottleX} ${bottleY} 
                            h ${bottleWidth} 
                            v ${bottleHeight - bottleRx} 
                            a ${bottleRx} ${bottleRx} 0 0 1 -${bottleRx} ${bottleRx} 
                            h -${bottleWidth - (bottleRx * 2)} 
                            a ${bottleRx} ${bottleRx} 0 0 1 -${bottleRx} -${bottleRx} 
                            z
                        `}
                        fill="rgba(9, 9, 11, 0.5)"
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="1"
                    />

                    {/* Líquido (Mascarado) */}
                    <g mask={`url(#maskBottle-${idUnico})`}>
                        <rect
                            x={bottleX}
                            y={liquidY}
                            width={bottleWidth}
                            height={liquidHeight}
                            fill={`url(#resinaLiq-${idUnico})`}
                        />
                        {/* Superfície do líquido */}
                        <ellipse cx={50} cy={liquidY} rx={bottleWidth / 2} ry={4} fill={claro} opacity={0.5} />
                    </g>

                    {/* Rótulo / Detalhe frontal */}
                    <rect x={bottleX + 10} y={bottleY + 20} width={bottleWidth - 20} height={30} rx="2" fill="rgba(255,255,255,0.05)" />
                </svg>
            </div>
        );
    }

    // ============================================
    // VISUALIZAÇÃO: CARRETEL (FDM) - Default
    // ============================================

    // --- CONSTANTES DE PROJEÇÃO ---
    const centroY = 50;
    const zTraseiro = 32;
    const zFrontal = 68;

    // Geometria
    const raioAroY = 48;
    const raioAroX = 24;
    const raioNucleoY = 12;
    const raioNucleoX = 6;
    const raioLeito = 12;
    const raioLeitoX = 6;

    // Preencher até as bordas
    const maxFilamentoY = 46; // Reduzido de 48 para ficar dentro do aro
    const maxFilamentoX = 23; // Reduzido de 24 para ficar dentro do aro

    // Calcular raio atual baseado na porcentagem
    const raioAtualY = raioLeito + ((maxFilamentoY - raioLeito) * (porcentagemSegura / 100));
    const raioAtualX = raioLeitoX + ((maxFilamentoX - raioLeitoX) * (porcentagemSegura / 100));

    const espessuraAro = 5;

    return (
        <div className={`relative flex items-center justify-center shrink-0 select-none ${className}`} style={{ width: tamanho, height: tamanho }}>
            <svg viewBox="0 0 100 100" className="relative z-10 w-full h-full overflow-visible" preserveAspectRatio="xMidYMid meet">
                <defs>
                    {/* 1. ILUMINAÇÃO VERTICAL SUAVE (SÓLIDO OPACO) */}
                    <linearGradient id={`filamentoSuave-${idUnico}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={claro} />
                        <stop offset="20%" stopColor={base} />
                        <stop offset="80%" stopColor={base} />
                        <stop offset="100%" stopColor={escuro} />
                    </linearGradient>

                    {/* 2. MATERIAL PLÁSTICO (Grafite Acetinado) */}
                    <linearGradient id={`corpoPlastico-${idUnico}`} x1="0" y1="0" x2="0.6" y2="1">
                        <stop offset="0%" stopColor="#52525b" />  {/* Topo-esquerda mais claro */}
                        <stop offset="100%" stopColor="#18181b" /> {/* Fundo-direita mais escuro */}
                    </linearGradient>

                    <linearGradient id={`aroPlastico-${idUnico}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#52525b" />
                        <stop offset="50%" stopColor="#27272a" />
                        <stop offset="100%" stopColor="#09090b" />
                    </linearGradient>
                </defs>

                {/* --- FLANGE TRASEIRO --- */}
                <ellipse cx={zTraseiro} cy={centroY} rx={raioAroX} ry={raioAroY} fill="#18181b" {...estiloContorno} />

                {/* --- MASSA DE FILAMENTO --- */}
                <g>
                    {/* Forma de Volume Suave */}
                    <path
                        d={`
                            M ${zTraseiro} ${centroY - raioAtualY}
                            L ${zFrontal - espessuraAro} ${centroY - raioAtualY}
                            A ${raioAtualX} ${raioAtualY} 0 0 1 ${zFrontal - espessuraAro} ${centroY + raioAtualY}
                            L ${zTraseiro} ${centroY + raioAtualY}
                            A ${raioAtualX} ${raioAtualY} 0 0 1 ${zTraseiro} ${centroY - raioAtualY}
                        `}
                        fill={`url(#filamentoSuave-${idUnico})`}
                        {...estiloContorno}
                    />
                    <ellipse
                        cx={zFrontal - espessuraAro} cy={centroY}
                        rx={raioAtualX} ry={raioAtualY}
                        fill={`url(#filamentoSuave-${idUnico})`}
                        {...estiloContorno}
                    />
                </g>

                {/* --- NÚCLEO INTERNO --- */}
                <ellipse cx={zFrontal} cy={centroY} rx={raioNucleoX} ry={raioNucleoY} fill={`url(#corpoPlastico-${idUnico})`} />

                {/* --- ESPESSURA DO FLANGE FRONTAL --- */}
                <path
                    d={`
                        M ${zFrontal - espessuraAro} ${centroY - raioAroY}
                        L ${zFrontal} ${centroY - raioAroY}
                        A ${raioAroX} ${raioAroY} 0 1 1 ${zFrontal} ${centroY + raioAroY}
                        L ${zFrontal - espessuraAro} ${centroY + raioAroY}
                        A ${raioAroX} ${raioAroY} 0 1 0 ${zFrontal - espessuraAro} ${centroY - raioAroY}
                    `}
                    fill={`url(#aroPlastico-${idUnico})`}
                    {...estiloContorno}
                />

                {/* --- FACE FRONTAL --- */}
                <defs>
                    <mask id={`mascaraVetor-${idUnico}`}>
                        <rect x="0" y="0" width="100" height="100" fill="white" />
                        <g transform={`translate(${zFrontal}, ${centroY})`}>
                            {[0, 60, 120, 180, 240, 300].map(angulo => (
                                <path
                                    key={angulo}
                                    d={`
                                        M ${Math.cos((angulo + 18) * Math.PI / 180) * 8} ${Math.sin((angulo + 18) * Math.PI / 180) * 16}
                                        L ${Math.cos((angulo + 18) * Math.PI / 180) * 19} ${Math.sin((angulo + 18) * Math.PI / 180) * 38}
                                        A 19 38 0 0 1 ${Math.cos((angulo + 42) * Math.PI / 180) * 19} ${Math.sin((angulo + 42) * Math.PI / 180) * 38}
                                        L ${Math.cos((angulo + 42) * Math.PI / 180) * 8} ${Math.sin((angulo + 42) * Math.PI / 180) * 16}
                                        Z
                                    `}
                                    fill="black"
                                />
                            ))}
                        </g>
                    </mask>
                </defs>

                <ellipse
                    cx={zFrontal} cy={centroY} rx={raioAroX} ry={raioAroY}
                    fill={`url(#corpoPlastico-${idUnico})`}
                    mask={`url(#mascaraVetor-${idUnico})`}
                    {...estiloContorno}
                />

                {/* --- DETALHES PREMIUM (Sutil) --- */}
                <ellipse
                    cx={zFrontal} cy={centroY} rx={raioAroX - 1} ry={raioAroY - 1}
                    fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8"
                    mask={`url(#mascaraVetor-${idUnico})`}
                />
                <ellipse cx={zFrontal} cy={centroY} rx={raioNucleoX} ry={raioNucleoY} fill={`url(#corpoPlastico-${idUnico})`} />
                <ellipse cx={zFrontal} cy={centroY} rx={raioNucleoX * 0.4} ry={raioNucleoY * 0.4} fill="#0c0c0e" />

            </svg>
        </div>
    );
}
