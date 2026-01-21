import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSidebarStore = create(
    persist(
        (set) => ({
            width: 72, // Largura inicial (collapsed) - Corrigido para match visual (era 68, mas o CSS usa 72)
            collapsed: true,

            // Mobile State
            isMobile: typeof window !== 'undefined' ? window.innerWidth < 1024 : false,
            mobileOpen: false,

            setCollapsed: (isCollapsed) => set(state => ({
                collapsed: isCollapsed,
                width: state.isMobile ? 0 : (isCollapsed ? 72 : 260)
            })),

            setMobileOpen: (isOpen) => set({ mobileOpen: isOpen }),
            toggleMobile: () => set(state => ({ mobileOpen: !state.mobileOpen })),
            setIsMobile: (isMobile) => set(state => ({
                isMobile,
                width: isMobile ? 0 : (state.collapsed ? 72 : 260)
            })),

            setWidth: (w) => set({ width: w }) // Manual override if needed
        }),
        {
            name: 'sidebar-storage',
            partialize: (state) => ({ collapsed: state.collapsed }),
        }
    )
);
