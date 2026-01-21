import { useCallback, useState } from 'react';
import { useCalculatorStore } from '../../../stores/calculatorStore';
import { useToastStore } from '../../../stores/toastStore';
import { useTransferStore } from '../../../stores/transferStore';
import { analisarArquivoProjeto } from '../../../utils/projectParser';

export function useFileProcessor() {
    const { addToast } = useToastStore();
    const { dadosFormulario, atualizarCampo } = useCalculatorStore();
    const [isProcessing, setIsProcessing] = useState(false);

    const processarArquivo = useCallback(async (file) => {
        if (!file) return;

        setIsProcessing(true);
        addToast("Lendo arquivo...", "loading");

        try {
            const resultado = await analisarArquivoProjeto(file);

            if (resultado.success) {
                // Atualiza Tempo
                if (resultado.timeSeconds > 0) {
                    const totalMinutos = Math.ceil(resultado.timeSeconds / 60);
                    const horas = Math.floor(totalMinutos / 60);
                    const minutos = totalMinutos % 60;

                    atualizarCampo('tempo', 'impressaoHoras', String(horas));
                    atualizarCampo('tempo', 'impressaoMinutos', String(minutos));
                }

                // Atualiza Peso
                if (resultado.weightGrams > 0) {
                    atualizarCampo('material', 'pesoModelo', String(resultado.weightGrams));
                }

                // Nome do projeto (se vazio)
                if (!dadosFormulario.nomeProjeto) {
                    const nomeLimpo = file.name.replace(/\.(gcode|gco|3mf|stl|obj)$/i, "").replace(/[-_]/g, " ");
                    atualizarCampo('nomeProjeto', null, nomeLimpo);
                }

                addToast(`Arquivo lido: ${resultado.message}`, "success");
            } else {
                addToast(resultado.message, "warning");
            }
        } catch (error) {
            console.error(error);
            addToast("Erro ao ler o arquivo.", "error");
        } finally {
            setIsProcessing(false);
        }
    }, [addToast, atualizarCampo, dadosFormulario.nomeProjeto]);

    const checkPendingFiles = useCallback(() => {
        const pendingFile = useTransferStore.getState().pendingFile;
        if (pendingFile) {
            setTimeout(() => {
                processarArquivo(pendingFile);
                useTransferStore.getState().clearPendingFile();
            }, 500);
        }
    }, [processarArquivo]);

    return {
        processarArquivo,
        checkPendingFiles,
        isProcessing
    };
}
