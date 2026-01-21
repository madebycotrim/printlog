import { useState, useEffect } from 'react';
import { useCalculatorStore } from '../stores/calculatorStore';
import { useToastStore } from '../stores/toastStore';

export const useAutoSave = () => {
    const { dadosFormulario, setDadosFormulario } = useCalculatorStore();
    const { addToast } = useToastStore();
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    // Carregar dados salvos ao montar
    useEffect(() => {
        const isEnabledStored = localStorage.getItem('calculator_autosave_enabled');
        if (isEnabledStored !== null && JSON.parse(isEnabledStored) === false) {
            return;
        }

        const savedData = localStorage.getItem('calculator_autosave');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                // Validação básica para evitar carregar estado quebrado
                if (parsed && typeof parsed === 'object') {
                    // Mescla com o estado atual para garantir que campos novos não quebrem
                    // Idealmente, o store deveria ter uma função deepMerge, mas aqui faremos simples
                    setDadosFormulario({
                        ...dadosFormulario,
                        ...parsed
                    });
                    // Opcional: Avisar que carregou
                    // addToast("Rascunho recuperado", "info");
                }
            } catch (e) {
                console.error("Erro ao carregar auto-save", e);
            }
        }
    }, []); // Executa apenas uma vez no mount

    // Salvar dados quando mudarem
    useEffect(() => {
        const handler = setTimeout(() => {
            if (dadosFormulario && isEnabled) {
                setIsSaving(true);
                localStorage.setItem('calculator_autosave', JSON.stringify(dadosFormulario));
                setLastSaved(new Date());
                setTimeout(() => setIsSaving(false), 500);
            }
        }, 2000); // Debounce de 2 segundos

        return () => clearTimeout(handler);
    }, [dadosFormulario]);

    const [isEnabled, setIsEnabled] = useState(() => {
        const saved = localStorage.getItem('calculator_autosave_enabled');
        return saved !== null ? JSON.parse(saved) : false;
    });

    const toggleAutoSave = () => {
        setIsEnabled(prev => {
            const newValue = !prev;
            localStorage.setItem('calculator_autosave_enabled', JSON.stringify(newValue));
            return newValue;
        });
    };

    return { isSaving, lastSaved, isEnabled, toggleAutoSave };
};
