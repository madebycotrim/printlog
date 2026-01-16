import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSidebarStore = create(
    persist(
        (set) => ({
            width: 68, // Largura inicial (collapsed)
            collapsed: true,

            setCollapsed: (isCollapsed) => set({
                collapsed: isCollapsed,
                width: isCollapsed ? 68 : 256
            }),

            setWidth: (w) => set({ width: w }) // Manual override if needed
        }),
        {
            name: 'sidebar-storage',
        }
    )
);
