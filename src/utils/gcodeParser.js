/**
 * PARSER UNIVERSAL DE G-CODE
 * Compatível com os principais slicers do mercado de impressão 3D
 * 
 * SLICERS SUPORTADOS:
 * - Cura (Ultimaker)
 * - Prusa Slicer
 * - Orca Slicer
 * - Bambu Studio
 * - Simplify3D
 * - IdeaMaker
 * - KISSlicer
 * - Slic3r
 * - SuperSlicer
 * - Creality Slicer
 */

export const analisarGCode = (content) => {
    let timeSeconds = 0;
    let weightGrams = 0;
    let foundTime = false;
    let foundWeight = false;
    let detectedSlicer = "Desconhecido";

    // Detectar o slicer usado
    if (content.includes("Cura_SteamEngine") || content.includes("FLAVOR:Marlin")) {
        detectedSlicer = "Cura";
    } else if (content.includes("PrusaSlicer") || content.includes("Slic3r")) {
        detectedSlicer = "Prusa Slicer";
    } else if (content.includes("OrcaSlicer")) {
        detectedSlicer = "Orca Slicer";
    } else if (content.includes("BambuStudio")) {
        detectedSlicer = "Bambu Studio";
    } else if (content.includes("Simplify3D")) {
        detectedSlicer = "Simplify3D";
    } else if (content.includes("IdeaMaker")) {
        detectedSlicer = "IdeaMaker";
    } else if (content.includes("KISSlicer")) {
        detectedSlicer = "KISSlicer";
    } else if (content.includes("SuperSlicer")) {
        detectedSlicer = "SuperSlicer";
    }

    // ========================================
    // ANÁLISE DE TEMPO DE IMPRESSÃO
    // ========================================

    // PADRÃO 1: Cura - ;TIME:660 (segundos)
    if (!foundTime) {
        const curaTime = content.match(/;TIME:(\d+)/);
        if (curaTime) {
            timeSeconds = parseInt(curaTime[1], 10);
            foundTime = true;
        }
    }

    // PADRÃO 2: Prusa/Orca/Bambu/SuperSlicer - ; estimated printing time = 1h 30m 15s
    if (!foundTime) {
        const prusaTime = content.match(/; estimated printing time[^=]*= ([^\n]+)/i);
        if (prusaTime) {
            const timeStr = prusaTime[1];
            const d = timeStr.match(/(\d+)d/);
            const h = timeStr.match(/(\d+)h/);
            const m = timeStr.match(/(\d+)m/);
            const s = timeStr.match(/(\d+)s/);

            if (d) timeSeconds += parseInt(d[1]) * 86400;
            if (h) timeSeconds += parseInt(h[1]) * 3600;
            if (m) timeSeconds += parseInt(m[1]) * 60;
            if (s) timeSeconds += parseInt(s[1]);

            if (d || h || m || s) foundTime = true;
        }
    }

    // PADRÃO 3: Simplify3D - ; Build time: 1 hours 23 minutes
    if (!foundTime) {
        const s3dTime = content.match(/; Build time: (\d+) hours? (\d+) minutes?/i);
        if (s3dTime) {
            timeSeconds = parseInt(s3dTime[1]) * 3600 + parseInt(s3dTime[2]) * 60;
            foundTime = true;
        }
    }

    // PADRÃO 4: IdeaMaker - ;TIME:1:23:45
    if (!foundTime) {
        const ideaMakerTime = content.match(/;TIME:(\d+):(\d+):(\d+)/);
        if (ideaMakerTime) {
            timeSeconds = parseInt(ideaMakerTime[1]) * 3600 + parseInt(ideaMakerTime[2]) * 60 + parseInt(ideaMakerTime[3]);
            foundTime = true;
        }
    }

    // PADRÃO 5: KISSlicer - ; Estimated Build Time: 83.4 minutes
    if (!foundTime) {
        const kissTime = content.match(/; Estimated Build Time:\s*([\d.]+)\s*minutes?/i);
        if (kissTime) {
            timeSeconds = Math.round(parseFloat(kissTime[1]) * 60);
            foundTime = true;
        }
    }

    // PADRÃO 6: Genérico - M73 P0 R90 (tempo restante em minutos no início)
    if (!foundTime) {
        const m73Pattern = content.match(/M73 P0 R(\d+)/);
        if (m73Pattern) {
            timeSeconds = parseInt(m73Pattern[1]) * 60;
            foundTime = true;
        }
    }

    // PADRÃO 7: Tempo em formato decimal - ; Print time: 1.5
    if (!foundTime) {
        const decimalTime = content.match(/; Print time:\s*([\d.]+)/i);
        if (decimalTime) {
            timeSeconds = Math.round(parseFloat(decimalTime[1]) * 3600);
            foundTime = true;
        }
    }

    // ========================================
    // ANÁLISE DE PESO DO FILAMENTO
    // ========================================

    // PADRÃO 1: Cura - ;Filament weight: 3.76g
    if (!foundWeight) {
        const curaWeight = content.match(/;Filament weight[^:]*:\s*([\d.]+)\s*g/i);
        if (curaWeight) {
            weightGrams = parseFloat(curaWeight[1]);
            foundWeight = true;
        }
    }

    // PADRÃO 2: Prusa/Slic3r - ; filament used [g] = 3.5
    if (!foundWeight) {
        const prusaWeight = content.match(/; filament used \[g\]\s*=\s*([\d.]+)/i);
        if (prusaWeight) {
            weightGrams = parseFloat(prusaWeight[1]);
            foundWeight = true;
        }
    }

    // PADRÃO 3: Bambu/Orca - ; total filament used [g] = 12.34
    if (!foundWeight) {
        const bambuWeight = content.match(/; total filament used \[g\]\s*=\s*([\d.]+)/i);
        if (bambuWeight) {
            weightGrams = parseFloat(bambuWeight[1]);
            foundWeight = true;
        }
    }

    // PADRÃO 4: Simplify3D - ; Filament length: 1234mm -> converter para gramas (estimativa)
    if (!foundWeight) {
        const s3dLength = content.match(/; Filament length:\s*([\d.]+)\s*mm/i);
        if (s3dLength) {
            // Estimativa: 1.75mm filamento, densidade PLA 1.24g/cm³
            const lengthMm = parseFloat(s3dLength[1]);
            const volumeCm3 = (Math.PI * Math.pow(0.175 / 2, 2) * lengthMm) / 10;
            weightGrams = Math.round(volumeCm3 * 1.24 * 100) / 100;
            foundWeight = true;
        }
    }

    // PADRÃO 5: IdeaMaker - ;MATERIAL_WEIGHT:12.34
    if (!foundWeight) {
        const ideaMakerWeight = content.match(/;MATERIAL_WEIGHT:\s*([\d.]+)/i);
        if (ideaMakerWeight) {
            weightGrams = parseFloat(ideaMakerWeight[1]);
            foundWeight = true;
        }
    }

    // PADRÃO 6: KISSlicer - ; Estimated Build Volume: X.XX cm^3 -> estimar peso
    if (!foundWeight) {
        const kissVolume = content.match(/; Estimated Build Volume:\s*([\d.]+)\s*cm/i);
        if (kissVolume) {
            weightGrams = Math.round(parseFloat(kissVolume[1]) * 1.24 * 100) / 100; // PLA padrão
            foundWeight = true;
        }
    }

    // PADRÃO 7: SuperSlicer - ; filament_weight = 12.34
    if (!foundWeight) {
        const superSlicerWeight = content.match(/; filament_weight\s*=\s*([\d.]+)/i);
        if (superSlicerWeight) {
            weightGrams = parseFloat(superSlicerWeight[1]);
            foundWeight = true;
        }
    }

    // PADRÃO 8: Genérico múltiplas linhas de material
    if (!foundWeight) {
        const multiMaterial = content.match(/; filament used \[g\]\s*=\s*([\d.,\s]+)/i);
        if (multiMaterial) {
            // Somar todos os valores se houver múltiplos materiais
            const weights = multiMaterial[1].match(/[\d.]+/g);
            if (weights) {
                weightGrams = weights.reduce((sum, w) => sum + parseFloat(w), 0);
                foundWeight = true;
            }
        }
    }

    // ========================================
    // FALLBACKS ADICIONAIS
    // ========================================

    // Buscar em comentários gerais no início do arquivo (primeiras 100 linhas)
    if (!foundTime || !foundWeight) {
        const lines = content.split('\n').slice(0, 100);

        for (const line of lines) {
            // Tempo em formato livre
            if (!foundTime && line.includes('time')) {
                const timeMatch = line.match(/(\d+)h\s*(\d+)m/i) || line.match(/(\d+):(\d+)/);
                if (timeMatch) {
                    timeSeconds = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60;
                    foundTime = true;
                }
            }

            // Peso em formato livre
            if (!foundWeight && /\d+\.?\d*\s*g/i.test(line) && !line.includes('kg')) {
                const weightMatch = line.match(/([\d.]+)\s*g/i);
                if (weightMatch) {
                    const possibleWeight = parseFloat(weightMatch[1]);
                    // Validar se é um peso razoável (entre 0.1g e 10kg)
                    if (possibleWeight > 0.1 && possibleWeight < 10000) {
                        weightGrams = possibleWeight;
                        foundWeight = true;
                    }
                }
            }
        }
    }

    return {
        timeSeconds: Math.round(timeSeconds),
        weightGrams: Math.round(weightGrams * 100) / 100, // 2 casas decimais
        success: foundTime || foundWeight,
        detectedSlicer,
        details: {
            foundTime,
            foundWeight,
            timeFormatted: foundTime ? `${Math.floor(timeSeconds / 3600)}h ${Math.floor((timeSeconds % 3600) / 60)}m` : 'N/A',
            weightFormatted: foundWeight ? `${weightGrams}g` : 'N/A'
        }
    };
};

// Alias de compatibilidade (deprecated)
export const parseGCode = analisarGCode;
