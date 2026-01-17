import React, { useEffect } from 'react';
import MainSidebar from './mainSidebar';
import { useSidebarStore } from '../stores/sidebarStore';
import { Menu } from 'lucide-react';

import { useLocation } from 'wouter';

export default function ManagementLayout({ children }) {
    const { width: larguraSidebar, isMobile, setIsMobile, setMobileOpen, mobileOpen } = useSidebarStore();
    const [location] = useLocation();

    // Resize Handler
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024; // lg breakpoint
            setIsMobile(mobile);
            if (!mobile) setMobileOpen(false); // Reset on desktop
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [setIsMobile, setMobileOpen]);

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
                    marginLeft: isMobile ? '0px' : `${larguraSidebar}px`,
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
                {!isMobile && (
                    <div className="fixed left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-zinc-800/50 to-transparent pointer-events-none" style={{ left: `${larguraSidebar}px` }} />
                )}

                {/* MOBILE HAMBURGER BUTTON - PREMIUM FLOATING */}
                {isMobile && (
                    <div className="fixed top-6 left-6 z-[50]">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="p-3 bg-zinc-950/40 backdrop-blur-md border border-white/5 rounded-2xl text-zinc-400 hover:text-white shadow-2xl hover:bg-zinc-900/60 transition-all duration-300 group hover:scale-105 active:scale-95"
                        >
                            <Menu size={20} className="group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] transition-all" />
                        </button>
                    </div>
                )}

                {children}
            </main>
        </div>
    );
}
