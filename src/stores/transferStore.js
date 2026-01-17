import { create } from 'zustand';

export const useTransferStore = create((set) => ({
    pendingFile: null,
    setPendingFile: (file) => set({ pendingFile: file }),
    clearPendingFile: () => set({ pendingFile: null }),
}));
