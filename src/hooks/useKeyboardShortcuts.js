import { useEffect } from 'react';

export const useKeyboardShortcuts = (shortcuts = []) => {
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Ignora se estiver digitando em um input ou textarea (exceto ESC e combos com Ctrl/Cmd)
            const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName);

            // Atalhos que devem funcionar mesmo em inputs (ex: Ctrl+S, Esc)
            const forceExecution = (event.ctrlKey || event.metaKey) || event.key === 'Escape';

            if (isInput && !forceExecution) {
                return;
            }

            shortcuts.forEach(({ key, ctrl = false, handler }) => {
                const keyMatches = event.key.toLowerCase() === key.toLowerCase();
                const ctrlMatches = ctrl ? (event.ctrlKey || event.metaKey) : true;

                // Se ctrl é exigido, verifica. Se não for exigido, verifica se NÃO foi apertado (para evitar conflitos)
                // Ajuste: Se ctrl=false, permitimos execução simples. Se ctrl=true, exigimos ctrl.
                // Mas queremos evitar que 's' dispare 'ctrl+s'.
                const ctrlPressed = event.ctrlKey || event.metaKey;
                const matches = keyMatches && (ctrl ? ctrlPressed : !ctrlPressed);

                if (matches) {
                    event.preventDefault();
                    handler(event);
                }
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
};
