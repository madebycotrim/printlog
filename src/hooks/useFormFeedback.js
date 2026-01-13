import { useState } from 'react';

/**
 * Hook para gerenciar feedback de formulário
 */
export function useFormFeedback() {
    const [feedback, setFeedback] = useState({
        show: false,
        type: 'info',
        message: ''
    });

    const showSuccess = (message) => {
        setFeedback({ show: true, type: 'success', message });
    };

    const showError = (message) => {
        setFeedback({ show: true, type: 'error', message });
    };

    const showWarning = (message) => {
        setFeedback({ show: true, type: 'warning', message });
    };

    const showInfo = (message) => {
        setFeedback({ show: true, type: 'info', message });
    };

    const hide = () => {
        setFeedback({ show: false, type: 'info', message: '' });
    };

    return {
        feedback,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        hide
    };
}
