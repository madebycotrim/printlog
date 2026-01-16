import React from 'react';
import MainSidebar from './mainSidebar';
import { useSidebarStore } from '../stores/sidebarStore';

import { useLocation } from 'wouter';

export default function ManagementLayout({ children }) {
    const { width: larguraSidebar } = useSidebarStore();
    const [location] = useLocation();

    // Determine Theme Color based on route
    const getThemeColorClass = () => {
        if (location.includes('filamentos')) return 'from-rose-500/30';
        if (location.includes('impressoras')) return 'from-orange-500/30';
        if (location.includes('insumos')) return 'from-amber-500/30';
        if (location.includes('projetos')) return 'from-emerald-500/30';
        if (location.includes('clientes')) return 'from-blue-500/30';
        return 'from-sky-500/30'; // Default (Dashboard)
    };

    const themeGradient = getThemeColorClass();

    return (
        <div className="flex h-screen w-full bg-zinc-950 text-zinc-200 font-sans antialiased overflow-hidden">
            <MainSidebar />

            <main
                className="flex-1 flex flex-col relative overflow-y-auto custom-scrollbar"
                style={{
                    marginLeft: `${larguraSidebar}px`,
                    transition: 'margin-left 0.3s cubic-bezier(0.2, 0, 0, 1)'
                }}
            >
                {/* --- BACKGROUND DECORATIVO (GRID + LINHA TEMÁTICA) --- */}
                <div className="absolute inset-x-0 top-0 h-[600px] z-0 pointer-events-none overflow-hidden select-none">
                    {/* Grid Pattern */}
                    <div className="absolute inset-0 opacity-[0.08]" style={{
                        backgroundImage: `linear-gradient(to right, #52525b 1px, transparent 1px), linear-gradient(to bottom, #52525b 1px, transparent 1px)`,
                        backgroundSize: '50px 50px',
                        maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent)'
                    }} />

                    {/* Linha Vertical Temática (Centralizada no container de 1600px) */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1600px] h-full">
                        <div className={`absolute top-0 left-0 h-full w-px bg-gradient-to-b ${themeGradient} via-transparent to-transparent`} />
                    </div>
                </div>

                {/* LINHA DECORATIVA SUPERIOR (Global para todas as páginas de gestão) */}
                <div className="fixed top-0 left-0 w-full h-1 z-50 bg-gradient-to-r from-transparent via-zinc-800 to-transparent opacity-50 pointer-events-none" />



                {/* Linha vertical decorativa (Separador Sidebar) */}
                <div className="fixed left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-zinc-800/50 to-transparent pointer-events-none" style={{ left: `${larguraSidebar}px` }} />

                {children}
            </main>
        </div>
    );
}
