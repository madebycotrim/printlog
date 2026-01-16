import { useState, useCallback } from 'react';

/**
 * Hook para gerenciar feedback de formulário
 */
export function useFormFeedback() {
    const [feedback, setFeedback] = useState({
        show: false,
        type: 'info',
        message: ''
    });

    const showSuccess = useCallback((message) => {
        setFeedback({ show: true, type: 'success', message });
    }, []);

    const showError = useCallback((message) => {
        setFeedback({ show: true, type: 'error', message });
    }, []);

    const showWarning = useCallback((message) => {
        setFeedback({ show: true, type: 'warning', message });
    }, []);

    const showInfo = useCallback((message) => {
        setFeedback({ show: true, type: 'info', message });
    }, []);

    const hide = useCallback(() => {
        setFeedback({ show: false, type: 'info', message: '' });
    }, []);

    return {
        feedback,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        hide
    };
}
