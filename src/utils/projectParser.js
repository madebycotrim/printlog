import JSZip from 'jszip';
import { analisarGCode } from './gcodeParser';

// Alias de compatibilidade (deprecated)
export const parseGCode = analisarGCode;

export const analisarArquivoProjeto = async (file) => {
    const fileName = file.name.toLowerCase();

    // 1. G-CODE / GCO
    if (fileName.endsWith('.gcode') || fileName.endsWith('.gco')) {
        const text = await file.text();
        return analisarGCode(text);
    }

    // 2. 3MF (Arquivo ZIP com modelos 3D e/ou G-Code)
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
