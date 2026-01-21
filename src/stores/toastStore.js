import { create } from 'zustand';

export const useToastStore = create((set) => ({
    toasts: [],

    addToast: (message, type = 'success') => {
        const id = Date.now() + Math.random();
        set((state) => ({
            toasts: [...state.toasts, { id, message, type }]
        }));
    },

    removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id)
    })),

    clearAll: () => set({ toasts: [] })
}));
