import { useMemo, useId, memo } from "react";

// --- UTILITÁRIOS DE COR (COMPARTILHADO) ---
const gerarCores = (hex: string) => {
  let hexLimpo = String(hex || "#3b82f6").replace(/^#/, "");
  if (hexLimpo.length === 3)
    hexLimpo = hexLimpo
      .split("")
      .map((c) => c + c)
      .join("");
  if (!/^[0-9A-Fa-f]{6}$/.test(hexLimpo)) hexLimpo = "3b82f6";

  const num = parseInt(hexLimpo, 16);
  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;

  // Cores cartoon/vibrantes e limpas
  return {
    base: `rgb(${r}, ${g}, ${b})`,
    claro: `rgb(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)})`,
    escuro: `rgb(${Math.max(0, r - 50)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 50)})`,
  };
};

// --- COMPONENTE CARRETEL (FDM) ---
export const Carretel = memo(
  ({
    cor = "#3b82f6",
    porcentagem = 100,
    tamanho = 128,
    id = "",
    className = "",
  }: {
    cor?: string;
    porcentagem?: number;
    tamanho?: number;
    id?: string;
    className?: string;
  }) => {
    const idUnico = (id || useId()).replace(/:/g, "");
    const { base, claro, escuro } = useMemo(() => gerarCores(cor), [cor]);

    const porcentagemSegura = Math.max(0, Math.min(100, Number(porcentagem) || 0));
    const mostrarFilamento = porcentagemSegura > 0;

    const centroY = 50;
    const zTraseiro = 26;
    const zFrontal = 74;
    const espessuraAro = 6;

    const raioAroY = 46;
    const raioAroX = 22;

    const raioLeitoY = 16;
    const raioLeitoX = 8;

    const raioFuroY = 6;
    const raioFuroX = 3;

    const maxFilamentoY = 43;
    const maxFilamentoX = 20;

    const taxaPreenchimento = Math.pow(porcentagemSegura / 100, 0.75);
    const raioAtualY = raioLeitoY + (maxFilamentoY - raioLeitoY) * taxaPreenchimento;
    const raioAtualX = raioLeitoX + (maxFilamentoX - raioLeitoX) * taxaPreenchimento;

    // Paleta de Plástico Flat
    const corPlasticoFrontal = "#3f3f46"; // zinc-700
    const corPlasticoLateral = "#27272a"; // zinc-800
    const corPlasticoFundo = "#18181b"; // zinc-900

    return (
      <div
        className={`relative flex items-center justify-center shrink-0 select-none ${className}`}
        style={{ width: tamanho, height: tamanho }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg" preserveAspectRatio="xMidYMid meet">
          <defs>
            {/* GEOMETRIA DOS VAZADOS (MÁSCARAS) */}
            <g id={`furosBase-${idUnico}`}>
              <ellipse cx="0" cy="0" rx={raioFuroX} ry={raioFuroY} />
              {[0, 60, 120, 180, 240, 300].map((angulo) => (
                <path
                  key={angulo}
                  d={`
                                    M ${Math.cos(((angulo + 10) * Math.PI) / 180) * 12} ${Math.sin(((angulo + 10) * Math.PI) / 180) * 24}
                                    L ${Math.cos(((angulo + 14) * Math.PI) / 180) * 18} ${Math.sin(((angulo + 14) * Math.PI) / 180) * 38}
                                    A 18 38 0 0 1 ${Math.cos(((angulo + 46) * Math.PI) / 180) * 18} ${Math.sin(((angulo + 46) * Math.PI) / 180) * 38}
                                    L ${Math.cos(((angulo + 50) * Math.PI) / 180) * 12} ${Math.sin(((angulo + 50) * Math.PI) / 180) * 24}
                                    A 12 24 0 0 0 ${Math.cos(((angulo + 10) * Math.PI) / 180) * 12} ${Math.sin(((angulo + 10) * Math.PI) / 180) * 24}
                                    Z
                                `}
                />
              ))}
            </g>
            {[0, 1, 2, 3, 4, 5, 6].map((offset) => (
              <mask key={`mask-${offset}`} id={`mask-${offset}-${idUnico}`}>
                <rect x="0" y="0" width="100" height="100" fill="white" />
                <use href={`#furosBase-${idUnico}`} x={zFrontal - offset} y={centroY} fill="black" />
              </mask>
            ))}
          </defs>

          <g>
            {/* 1. FLANGE TRASEIRO */}
            <path
              d={`
                            M ${zTraseiro} ${centroY - raioAroY}
                            L ${zTraseiro + espessuraAro} ${centroY - raioAroY}
                            A ${raioAroX} ${raioAroY} 0 1 1 ${zTraseiro + espessuraAro} ${centroY + raioAroY}
                            L ${zTraseiro} ${centroY + raioAroY}
                            A ${raioAroX} ${raioAroY} 0 1 0 ${zTraseiro} ${centroY - raioAroY}
                        `}
              fill={corPlasticoLateral}
            />
            <ellipse cx={zTraseiro} cy={centroY} rx={raioAroX} ry={raioAroY} fill={corPlasticoFundo} />
            <ellipse cx={zTraseiro + espessuraAro} cy={centroY} rx={raioAroX} ry={raioAroY} fill={corPlasticoFrontal} />

            {/* 2. NÚCLEO CENTRAL */}
            <g>
              {/* Corpo do cilindro central */}
              <path
                d={`
                                M ${zTraseiro + espessuraAro} ${centroY - raioLeitoY}
                                L ${zFrontal - espessuraAro} ${centroY - raioLeitoY}
                                A ${raioLeitoX} ${raioLeitoY} 0 0 1 ${zFrontal - espessuraAro} ${centroY + raioLeitoY}
                                L ${zTraseiro + espessuraAro} ${centroY + raioLeitoY}
                                A ${raioLeitoX} ${raioLeitoY} 0 0 1 ${zTraseiro + espessuraAro} ${centroY - raioLeitoY}
                            `}
                fill={corPlasticoFundo}
              />
              {/* Rosto do cilindro central */}
              <ellipse
                cx={zFrontal - espessuraAro}
                cy={centroY}
                rx={raioLeitoX}
                ry={raioLeitoY}
                fill={corPlasticoLateral}
              />
            </g>

            {/* 3. MASSA DE FILAMENTO */}
            {mostrarFilamento && (
              <g>
                {/* Cilindro do Filamento (Lateral Extrudada Escura) */}
                <path
                  d={`
                                    M ${zTraseiro + espessuraAro} ${centroY - raioAtualY}
                                    L ${zFrontal - espessuraAro} ${centroY - raioAtualY}
                                    A ${raioAtualX} ${raioAtualY} 0 0 1 ${zFrontal - espessuraAro} ${centroY + raioAtualY}
                                    L ${zTraseiro + espessuraAro} ${centroY + raioAtualY}
                                    A ${raioAtualX} ${raioAtualY} 0 0 1 ${zTraseiro + espessuraAro} ${centroY - raioAtualY}
                                `}
                  fill={escuro}
                />
                {/* Linha Cartunesca na base da extrusão para separar fatias */}
                <path
                  d={`
                                    M ${zTraseiro + espessuraAro} ${centroY + raioAtualY}
                                    A ${raioAtualX} ${raioAtualY} 0 0 0 ${zTraseiro + espessuraAro + raioAtualX} ${centroY}
                                `}
                  fill="none"
                  stroke="black"
                  strokeOpacity="0.1"
                  strokeWidth="1"
                />
                {/* Face Frontal do Filamento (Clara/Base) */}
                <ellipse cx={zFrontal - espessuraAro} cy={centroY} rx={raioAtualX} ry={raioAtualY} fill={base} />
                {/* Pequeno highlight cartoon na borda direita */}
                <path
                  d={`
                                    M ${zFrontal - espessuraAro} ${centroY - raioAtualY}
                                    A ${raioAtualX} ${raioAtualY} 0 0 1 ${zFrontal - espessuraAro + raioAtualX} ${centroY}
                                `}
                  fill="none"
                  stroke={claro}
                  strokeWidth="2"
                  strokeOpacity="0.5"
                />
              </g>
            )}

            {/* 4. FLANGE FRONTAL */}
            <path
              d={`
                            M ${zFrontal - espessuraAro} ${centroY - raioAroY}
                            L ${zFrontal} ${centroY - raioAroY}
                            A ${raioAroX} ${raioAroY} 0 1 1 ${zFrontal} ${centroY + raioAroY}
                            L ${zFrontal - espessuraAro} ${centroY + raioAroY}
                            A ${raioAroX} ${raioAroY} 0 1 0 ${zFrontal - espessuraAro} ${centroY - raioAroY}
                        `}
              fill={corPlasticoLateral}
            />
            {[6, 5, 4, 3, 2, 1].map((offset) => (
              <ellipse
                key={offset}
                cx={zFrontal - offset}
                cy={centroY}
                rx={raioAroX}
                ry={raioAroY}
                fill={offset === 6 ? corPlasticoFundo : corPlasticoLateral}
                mask={`url(#mask-${offset}-${idUnico})`}
              />
            ))}
            <ellipse
              cx={zFrontal}
              cy={centroY}
              rx={raioAroX}
              ry={raioAroY}
              fill={corPlasticoFrontal}
              mask={`url(#mask-0-${idUnico})`}
            />

            {/* Cartoon edge para o aro frontal */}
            <path
              d={`
                            M ${zFrontal} ${centroY - raioAroY}
                            A ${raioAroX} ${raioAroY} 0 0 1 ${zFrontal + raioAroX} ${centroY}
                        `}
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1.5"
              mask={`url(#mask-0-${idUnico})`}
            />
          </g>
        </svg>
      </div>
    );
  },
);

// --- COMPONENTE GARRAFA RESINA (SLA) ---
export const GarrafaResina = memo(
  ({
    cor = "#3b82f6",
    porcentagem = 100,
    tamanho = 128,
    id = "",
    className = "",
  }: {
    cor?: string;
    porcentagem?: number;
    tamanho?: number;
    id?: string;
    className?: string;
  }) => {
    const idUnico = (id || useId()).replace(/:/g, "");
    const { base, claro, escuro } = useMemo(() => gerarCores(cor || "#3b82f6"), [cor]);

    const porcentagemSegura = Math.max(0, Math.min(100, Number(porcentagem) || 0));
    const mostrarLiquido = porcentagemSegura > 0;

    const bottleHeight = 80;
    const bottleWidth = 46;
    const bottleRx = 4;
    const bottleX = (100 - bottleWidth) / 2;
    const bottleY = 15;

    const liquidHeight = bottleHeight * 0.9 * (porcentagemSegura / 100);
    const liquidY = bottleY + bottleHeight - liquidHeight;

    const corPlasticoGarrafa = "#27272a"; // zinc-800
    const corPlasticoBorda = "#3f3f46"; // zinc-700
    const corTampa = "#18181b"; // zinc-900

    return (
      <div
        className={`relative flex items-center justify-center shrink-0 select-none ${className}`}
        style={{ width: tamanho, height: tamanho }}
      >
        <svg viewBox="0 0 100 100" className="relative w-full h-full overflow-visible drop-shadow-lg">
          {/* Tampa Cartoon */}
          <rect x="36" y="5" width="28" height="12" rx="2" fill={corTampa} />
          <rect x="36" y="5" width="28" height="2" fill="rgba(255,255,255,0.1)" />
          <line x1="40" y1="5" x2="40" y2="17" stroke={corPlasticoBorda} strokeWidth="1" />
          <line x1="60" y1="5" x2="60" y2="17" stroke="#000" strokeWidth="1" />
          <defs>
            <clipPath id={`clipBottle-${idUnico}`}>
              <path
                d={`
                                M ${bottleX} ${bottleY} 
                                h ${bottleWidth} 
                                v ${bottleHeight - bottleRx} 
                                a ${bottleRx} ${bottleRx} 0 0 1 -${bottleRx} ${bottleRx} 
                                h -${bottleWidth - bottleRx * 2} 
                                a ${bottleRx} ${bottleRx} 0 0 1 -${bottleRx} -${bottleRx} 
                                z
                            `}
              />
            </clipPath>
            <path
              id={`bottlePath-${idUnico}`}
              d={`
                            M ${bottleX} ${bottleY} 
                            h ${bottleWidth} 
                            v ${bottleHeight - bottleRx} 
                            a ${bottleRx} ${bottleRx} 0 0 1 -${bottleRx} ${bottleRx} 
                            h -${bottleWidth - bottleRx * 2} 
                            a ${bottleRx} ${bottleRx} 0 0 1 -${bottleRx} -${bottleRx} 
                            z
                        `}
            />
          </defs>
          {/* Garrafa Fundo Translucente */}
          <use href={`#bottlePath-${idUnico}`} fill={corPlasticoGarrafa} opacity={0.6} />{" "}
          {/* opacity para a cor de background clara misturar */}
          {/* Líquido (Dentro da garrafa) */}
          {mostrarLiquido && (
            <g clipPath={`url(#clipBottle-${idUnico})`}>
              <rect x={bottleX} y={liquidY} width={bottleWidth} height={liquidHeight} fill={base} />
              {/* Linha da superfície (Estilo cartoon/vetor) */}
              <ellipse cx={50} cy={liquidY} rx={bottleWidth / 2} ry={4} fill={claro} />
              {/* Sombra 2D abaixo da superfície */}
              <rect x={bottleX} y={liquidY + 2} width={bottleWidth} height={4} fill={escuro} opacity={0.3} />
            </g>
          )}
          {/* Bordas da Garrafa (Estilo Outline / Highlight) */}
          <use href={`#bottlePath-${idUnico}`} fill="none" stroke={corPlasticoBorda} strokeWidth="2" />
          {/* Reflexo Cartoon (Highlights brancos flat) */}
          <path
            d={`M ${bottleX + 4} ${bottleY + 6} L ${bottleX + 4} ${bottleY + bottleHeight - 6}`}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx={bottleX + 4} cy={bottleY + 4} r="1" fill="rgba(255,255,255,0.2)" />
          {/* Rótulo Flat Moderno */}
          <rect
            x={bottleX + 10}
            y={bottleY + 20}
            width={bottleWidth - 20}
            height={30}
            rx="2"
            fill="white"
            opacity="0.1"
          />
          <rect
            x={bottleX + 14}
            y={bottleY + 24}
            width={bottleWidth - 28}
            height={4}
            rx="1"
            fill="white"
            opacity="0.3"
          />
          <rect
            x={bottleX + 14}
            y={bottleY + 32}
            width={bottleWidth - 36}
            height={3}
            rx="1"
            fill="white"
            opacity="0.2"
          />
          <circle cx={bottleX + 28} cy={bottleY + 42} r="3" fill="white" opacity="0.2" />
        </svg>
      </div>
    );
  },
);
