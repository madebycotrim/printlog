import { create } from 'zustand';

export const useScannerStore = create((set) => ({
    // Scanner Visibility
    isScannerOpen: false,
    openScanner: () => set({ isScannerOpen: true }),
    closeScanner: () => set({ isScannerOpen: false }),

    // Blink/Highlight State
    highlightedItem: null, // { id: string, type: 'filament' | 'printer' | 'supply', timestamp: number }
    setHighlightedItem: (id, type) => set({
        highlightedItem: { id, type, timestamp: Date.now() }
    }),
    clearHighlight: () => set({ highlightedItem: null }),
}));
