import JSZip from 'jszip';

/**
 * PARSER UNIVERSAL DE G-CODE
 * Compatível com os principais slicers do mercado de impressão 3D
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

/**
 * CÁLCULO DE VOLUME PARA ARQUIVOS STL (Binary & ASCII)
 */
const calcularVolumeSTL = (buffer) => {
    const data = new DataView(buffer);
    let volume = 0;

    // Tentar ler como Binário (Cabeçalho de 80 bytes + 4 bytes contagem)
    if (buffer.byteLength > 84) {
        const triangleCount = data.getUint32(80, true);
        const expectedSize = 84 + (triangleCount * 50);

        // Verifica se o tamanho bate com um STL Binário
        if (buffer.byteLength === expectedSize) {
            let offset = 84;
            for (let i = 0; i < triangleCount; i++) {
                // Pular normal (12 bytes)
                const p1x = data.getFloat32(offset + 12, true);
                const p1y = data.getFloat32(offset + 16, true);
                const p1z = data.getFloat32(offset + 20, true);

                const p2x = data.getFloat32(offset + 24, true);
                const p2y = data.getFloat32(offset + 28, true);
                const p2z = data.getFloat32(offset + 32, true);

                const p3x = data.getFloat32(offset + 36, true);
                const p3y = data.getFloat32(offset + 40, true);
                const p3z = data.getFloat32(offset + 44, true);

                // Produto misto (Signed Volume)
                // v3 . (v1 x v2) / 6
                const v321 = p3x * p2y * p1z;
                const v231 = p2x * p3y * p1z;
                const v312 = p3x * p1y * p2z;
                const v132 = p1x * p3y * p2z;
                const v213 = p2x * p1y * p3z;
                const v123 = p1x * p2y * p3z;

                volume += (1.0 / 6.0) * (-v321 + v231 + v312 - v132 - v213 + v123);

                offset += 50;
            }
            return Math.abs(volume) / 1000; // Converter mm³ para cm³
        }
    }

    // Se não for binário, tentar ASCII
    const decoder = new TextDecoder("utf-8");
    const text = decoder.decode(buffer);

    // Regex simples para capturar vértices
    const vertexRegex = /vertex\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)/g;
    let match;
    const vertices = [];

    while ((match = vertexRegex.exec(text)) !== null) {
        vertices.push({
            x: parseFloat(match[1]),
            y: parseFloat(match[2]),
            z: parseFloat(match[3])
        });
    }

    volume = 0;
    for (let i = 0; i < vertices.length; i += 3) {
        if (i + 2 >= vertices.length) break;

        const p1 = vertices[i];
        const p2 = vertices[i + 1];
        const p3 = vertices[i + 2];

        const v321 = p3.x * p2.y * p1.z;
        const v231 = p2.x * p3.y * p1.z;
        const v312 = p3.x * p1.y * p2.z;
        const v132 = p1.x * p3.y * p2.z;
        const v213 = p2.x * p1.y * p3.z;
        const v123 = p1.x * p2.y * p3.z;

        volume += (1.0 / 6.0) * (-v321 + v231 + v312 - v132 - v213 + v123);
    }

    return Math.abs(volume) / 1000; // Converter mm³ para cm³
};

export const analisarArquivoProjeto = async (file) => {
    const fileName = file.name.toLowerCase();

    // 1. G-CODE / GCO
    if (fileName.endsWith('.gcode') || fileName.endsWith('.gco')) {
        const text = await file.text();
        return analisarGCode(text);
    }

    // 2. STL (Stereolithography)
    if (fileName.endsWith('.stl')) {
        try {
            const buffer = await file.arrayBuffer();
            const volumeCm3 = calcularVolumeSTL(buffer);
            // Densidade PLA Aproximada: 1.24 g/cm3
            const weightGrams = volumeCm3 * 1.24;

            return {
                timeSeconds: 0, // Impossível saber sem fatiar
                weightGrams: Math.round(weightGrams * 100) / 100,
                success: true,
                fileType: "modelo_3d",
                detectedSlicer: "Modelo 3D (STL)",
                message: "Arquivo STL processado. Peso estimado baseado em volume (100% preenchimento, PLA). O tempo deve ser inserido manualmente.",
                details: {
                    foundTime: false,
                    foundWeight: true,
                    timeFormatted: 'N/A',
                    weightFormatted: `${weightGrams.toFixed(2)}g (Est.)`
                }
            };
        } catch (_error) {
            return {
                timeSeconds: 0,
                weightGrams: 0,
                success: false,
                fileType: "erro",
                message: "Erro ao ler geometria STL.",
                details: { foundTime: false, foundWeight: false, timeFormatted: 'N/A', weightFormatted: 'N/A' }
            };
        }
    }

    // 3. 3MF (Arquivo ZIP com modelos 3D e/ou G-Code)
    if (fileName.endsWith('.3mf')) {
        try {
            const zip = await JSZip.loadAsync(file);
            let timeSeconds = 0;
            let weightGrams = 0;
            let found = false;
            let fileType = "modelo_3d"; // "modelo_3d", "fatiado", "gcode_embutido"
            let detectedSlicer = "Desconhecido";

            // ========================================
            // ESTRATÉGIA 1: Procurar G-Code Embutido
            // ========================================
            // Alguns 3MF (especialmente de Bambu/Orca) podem conter o G-Code completo
            const gcodeFiles = Object.keys(zip.files).filter(path =>
                path.toLowerCase().endsWith('.gcode') ||
                path.toLowerCase().endsWith('.gco') ||
                path.includes('Metadata/plate_') && path.endsWith('.gcode')
            );

            if (gcodeFiles.length > 0) {
                // Encontrou G-Code embutido! Analisar o primeiro
                const gcodeContent = await zip.files[gcodeFiles[0]].async('string');
                const result = analisarGCode(gcodeContent);

                if (result.success) {
                    fileType = "gcode_embutido";
                    return {
                        ...result,
                        fileType,
                        message: `3MF com G-Code embutido detectado (${result.detectedSlicer})`
                    };
                }
            }

            // ========================================
            // ESTRATÉGIA 2: Procurar Metadados de Fatiamento
            // ========================================

            // Tentar encontrar XMLs e configs na pasta Metadata
            const metadataFiles = Object.keys(zip.files).filter(path =>
                path.startsWith('Metadata/') && (path.endsWith('.xml') || path.endsWith('.config'))
            );

            for (const path of metadataFiles) {
                const content = await zip.files[path].async('string');

                // Detectar slicer pelos metadados
                if (content.includes('BambuStudio')) {
                    detectedSlicer = "Bambu Studio";
                } else if (content.includes('OrcaSlicer')) {
                    detectedSlicer = "Orca Slicer";
                } else if (content.includes('PrusaSlicer')) {
                    detectedSlicer = "Prusa Slicer";
                }

                // PADRÃO 1: Bambu/Orca - Tags XML padrão
                const weightMatch = content.match(/<filament_weight[^>]*>([\d.]+)<\/filament_weight>/i);
                if (weightMatch) {
                    weightGrams = parseFloat(weightMatch[1]);
                    found = true;
                    fileType = "fatiado";
                }

                const timeMatch = content.match(/<print_time[^>]*>(\d+)<\/print_time>/i);
                if (timeMatch) {
                    timeSeconds = parseInt(timeMatch[1], 10);
                    found = true;
                    fileType = "fatiado";
                }

                // PADRÃO 2: Tags alternativas
                const weightMatch2 = content.match(/consumeds_grams="([\d.]+)"/i);
                if (weightMatch2 && !weightGrams) {
                    weightGrams = parseFloat(weightMatch2[1]);
                    found = true;
                    fileType = "fatiado";
                }

                // PADRÃO 3: Tempo em outros formatos
                const timeMatch2 = content.match(/<time[^>]*>(\d+)<\/time>/i);
                if (timeMatch2 && !timeSeconds) {
                    timeSeconds = parseInt(timeMatch2[1], 10);
                    found = true;
                    fileType = "fatiado";
                }

                // PADRÃO 4: Peso em kg convertido para gramas
                const weightKgMatch = content.match(/<filament_weight[^>]*>([\d.]+)\s*kg<\/filament_weight>/i);
                if (weightKgMatch) {
                    weightGrams = parseFloat(weightKgMatch[1]) * 1000;
                    found = true;
                    fileType = "fatiado";
                }
            }

            // ========================================
            // ESTRATÉGIA 3: Verificar se é apenas um modelo 3D
            // ========================================
            if (!found) {
                // Verificar se tem arquivos .model (modelos 3D não fatiados)
                const modelFiles = Object.keys(zip.files).filter(path =>
                    path.endsWith('.model') || path.includes('3dmodel')
                );

                if (modelFiles.length > 0 && metadataFiles.length === 0) {
                    // É um modelo 3D puro (não fatiado)
                    return {
                        timeSeconds: 0,
                        weightGrams: 0,
                        success: false,
                        fileType: "modelo_3d",
                        detectedSlicer: "Não fatiado",
                        message: "Este é um modelo 3D não fatiado. Para obter tempo e peso, você precisa fatiá-lo em um slicer (Cura, Prusa, Orca, Bambu, etc.) antes de importar.",
                        details: {
                            foundTime: false,
                            foundWeight: false,
                            timeFormatted: 'N/A',
                            weightFormatted: 'N/A'
                        }
                    };
                }
            }

            // Retorno para arquivos fatiados
            if (found) {
                return {
                    timeSeconds: Math.round(timeSeconds),
                    weightGrams: Math.round(weightGrams * 100) / 100,
                    success: true,
                    fileType,
                    detectedSlicer,
                    message: `3MF fatiado detectado (${detectedSlicer})`,
                    details: {
                        foundTime: timeSeconds > 0,
                        foundWeight: weightGrams > 0,
                        timeFormatted: timeSeconds > 0 ? `${Math.floor(timeSeconds / 3600)}h ${Math.floor((timeSeconds % 3600) / 60)}m` : 'N/A',
                        weightFormatted: weightGrams > 0 ? `${weightGrams}g` : 'N/A'
                    }
                };
            }

            // Fallback: arquivo não reconhecido
            return {
                timeSeconds: 0,
                weightGrams: 0,
                success: false,
                fileType: "desconhecido",
                detectedSlicer: "Desconhecido",
                message: "Não foi possível ler os dados do arquivo. Certifique-se que ele foi fatiado e contém metadados.",
                details: {
                    foundTime: false,
                    foundWeight: false,
                    timeFormatted: 'N/A',
                    weightFormatted: 'N/A'
                }
            };

        } catch (error) {
            console.error("Erro ao analisar 3MF:", error);
            return {
                timeSeconds: 0,
                weightGrams: 0,
                success: false,
                fileType: "erro",
                detectedSlicer: "Erro",
                message: `Erro ao processar arquivo: ${error.message}`,
                details: {
                    foundTime: false,
                    foundWeight: false,
                    timeFormatted: 'N/A',
                    weightFormatted: 'N/A'
                }
            };
        }
    }

    // Formato não suportado
    return {
        timeSeconds: 0,
        weightGrams: 0,
        success: false,
        fileType: "nao_suportado",
        detectedSlicer: "N/A",
        message: "Formato de arquivo não suportado. Use .gcode, .gco ou .3mf",
        details: {
            foundTime: false,
            foundWeight: false,
            timeFormatted: 'N/A',
            weightFormatted: 'N/A'
        }
    };
};

// Alias de compatibilidade (deprecated)
export const parseProjectFile = analisarArquivoProjeto;
