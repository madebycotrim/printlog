import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFileProcessor } from './useFileProcessor';
import { useCalculatorStore } from '../../../stores/calculatorStore';
import { useToastStore } from '../../../stores/toastStore';
import { useTransferStore } from '../../../stores/transferStore';
import * as projectParser from '../../../utils/projectParser';

// Mock dependencies
vi.mock('../../../stores/calculatorStore');
vi.mock('../../../stores/toastStore');
vi.mock('../../../stores/transferStore');
vi.mock('../../../utils/projectParser');

describe('useFileProcessor', () => {
    const mockAtualizarCampo = vi.fn();
    const mockAddToast = vi.fn();
    const mockClearPendingFile = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup Store Mocks
        useCalculatorStore.mockReturnValue({
            dadosFormulario: { nomeProjeto: '' },
            atualizarCampo: mockAtualizarCampo
        });

        useToastStore.mockReturnValue({
            addToast: mockAddToast
        });

        useTransferStore.getState = vi.fn().mockReturnValue({
            pendingFile: null,
            clearPendingFile: mockClearPendingFile
        });
    });

    it('should initialize with default states', () => {
        const { result } = renderHook(() => useFileProcessor());
        expect(result.current.isProcessing).toBe(false);
    });

    it('should process a valid file correctly', async () => {
        const file = new File(['content'], 'test.gcode', { type: 'text/plain' });

        // Mock successful parse
        projectParser.analisarArquivoProjeto.mockResolvedValue({
            success: true,
            message: 'Success',
            timeSeconds: 3661, // 1h 1m 1s
            weightGrams: 100
        });

        const { result } = renderHook(() => useFileProcessor());

        await act(async () => {
            await result.current.processarArquivo(file);
        });

        // Verify toast calls
        expect(mockAddToast).toHaveBeenCalledWith('Lendo arquivo...', 'loading');
        expect(mockAddToast).toHaveBeenCalledWith('Arquivo lido: Success', 'success');

        // Verify updates
        expect(mockAtualizarCampo).toHaveBeenCalledWith('tempo', 'impressaoHoras', '1');
        expect(mockAtualizarCampo).toHaveBeenCalledWith('tempo', 'impressaoMinutos', '2'); // 61.01 mins -> ceil -> 62 mins total? 3661s / 60 = 61.016 
        // Logic in hook: ceil(3661/60) = 62. hours = floor(62/60)=1. mins = 62%60=2. Correct.

        expect(mockAtualizarCampo).toHaveBeenCalledWith('material', 'pesoModelo', '100');
        expect(mockAtualizarCampo).toHaveBeenCalledWith('nomeProjeto', null, 'test');
    });

    it('should handle parse errors gracefully', async () => {
        const file = new File(['content'], 'error.gcode');

        projectParser.analisarArquivoProjeto.mockResolvedValue({
            success: false,
            message: 'Parse Error'
        });

        const { result } = renderHook(() => useFileProcessor());

        await act(async () => {
            await result.current.processarArquivo(file);
        });

        expect(mockAddToast).toHaveBeenCalledWith('Parse Error', 'warning');
        expect(mockAtualizarCampo).not.toHaveBeenCalled();
    });

    it('should check pending files on mount/call', async () => {
        const pendingFile = new File(['content'], 'pending.gcode');

        useTransferStore.getState.mockReturnValue({
            pendingFile: pendingFile,
            clearPendingFile: mockClearPendingFile
        });

        // Mock processarArquivo behavior via the hook itself isn't easy without spying on the hook instance which is internal.
        // Instead we allow the integration to flow.
        projectParser.analisarArquivoProjeto.mockResolvedValue({ success: false, message: 'Ignored' });

        const { result } = renderHook(() => useFileProcessor());

        // Use fake timers because of setTimeout in checkPendingFiles
        vi.useFakeTimers();

        await act(async () => {
            result.current.checkPendingFiles();
            vi.runAllTimers();
        });

        expect(projectParser.analisarArquivoProjeto).toHaveBeenCalledWith(pendingFile);
        expect(mockClearPendingFile).toHaveBeenCalled();

        vi.useRealTimers();
    });
});
