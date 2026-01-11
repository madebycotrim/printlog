import React, { useState, useEffect, useMemo, memo } from "react";
import { Link, useLocation } from "wouter";
import { useUser, useClerk } from "@clerk/clerk-react";
import {
    LayoutGrid, Calculator, Package, History, Settings,
    Printer, HelpCircle, LogOut, ChevronLeft, ChevronRight
} from "lucide-react";

import logo from "../assets/logo-colorida.png";
import logoBranca from "../assets/logo-branca.png";

// Stores & Logic
import { useFilamentStore } from "../features/filamentos/logic/filaments";
import { usePrinterStore } from "../features/impressoras/logic/printer";
import { analisarSaudeImpressora } from "../features/impressoras/logic/diagnostics";

// Mapeamento de Cores NEON
const COLOR_MAP = {
    sky: {
        text: "text-sky-400",
        glow: "drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]",
        border: "border-sky-500",
    },
    amber: {
        text: "text-amber-400",
        glow: "drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]",
        border: "border-amber-500",
    },
    emerald: {
        text: "text-emerald-400",
        glow: "drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]",
        border: "border-emerald-500",
    },
};

const SidebarItem = memo(({ href, icon: Icon, label, collapsed, badge, color = "sky" }) => {
    const [location] = useLocation();
    const isActive = location === href || (href !== "/" && location.startsWith(href));

    // Seleciona as classes baseado na prop color
    const theme = COLOR_MAP[color] || COLOR_MAP.sky;

    return (
        <Link href={href}>
            <div className={`relative group cursor-pointer my-0.5 transition-all duration-200 ${collapsed ? "px-0 flex justify-center" : "px-0"}`}>

                {collapsed && (
                    <div className="fixed left-[70px] px-3 py-2 bg-zinc-950 border border-zinc-800 text-zinc-100 text-[10px] font-bold uppercase tracking-widest rounded shadow-xl opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-[9999] flex items-center gap-3">
                        {label}
                        {badge && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                    </div>
                )}

                {/* Barra Lateral Fininha de Ativo */}
                {!collapsed && isActive && (
                    <div className={`absolute left-0 top-0 bottom-0 w-[2px] ${theme.text.replace('text-', 'bg-')} shadow-[0_0_8px_currentColor] z-10`} />
                )}

                {/* Conteúdo */}
                <div className={`
                    relative flex items-center h-12 transition-all duration-200 
                    ${collapsed ? "justify-center w-full" : "px-5 w-full"}
                    ${isActive ? "bg-white/[0.02]" : "hover:bg-zinc-900/50"}
                `}>
                    <div className="relative flex items-center justify-center">
                        <Icon
                            size={18}
                            strokeWidth={isActive ? 2.5 : 2}
                            className={`transition-all duration-300 ${isActive ? `${theme.text} ${theme.glow}` : "text-zinc-600 group-hover:text-zinc-300"}`}
                        />
                        {badge && (
                            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                            </span>
                        )}
                    </div>
                    {!collapsed && (
                        <div className="ml-4 overflow-hidden whitespace-nowrap">
                            <span className={`text-xs tracking-[0.05em] uppercase transition-colors ${isActive ? `font-bold ${theme.text}` : "font-medium text-zinc-500 group-hover:text-zinc-300"}`}>
                                {label}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
});

const SidebarSection = ({ title, collapsed }) => (
    <div className={`px-5 mt-6 mb-3 transition-opacity duration-300 ${collapsed ? "opacity-0 invisible h-0" : "opacity-100"}`}>
        <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em]">{title}</span>
    </div>
);

export default function MainSidebar({ onCollapseChange }) {
    const [, setLocation] = useLocation();
    const { user } = useUser();
    const { signOut } = useClerk();
    const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sidebar_collapsed") === "true");

    const { filaments, fetchFilaments } = useFilamentStore();
    const { printers, fetchPrinters } = usePrinterStore();

    useEffect(() => {
        fetchFilaments();
        fetchPrinters();
    }, [fetchFilaments, fetchPrinters]);

    const alerts = useMemo(() => {
        const lowStock = filaments.some(f => (Number(f.peso_atual) || 0) < 150);
        const criticalPrinter = printers.some(p => {
            const temErroStatus = p.status === 'error' || p.status === 'offline';
            const temManutencaoCritica = analisarSaudeImpressora(p).some(m => m.severidade === 'critical');
            return temErroStatus || temManutencaoCritica;
        });
        return { lowStock, criticalPrinter };
    }, [filaments, printers]);

    useEffect(() => {
        localStorage.setItem("sidebar_collapsed", collapsed);
        if (onCollapseChange) onCollapseChange(collapsed);
    }, [collapsed, onCollapseChange]);

    const handleLogout = async () => {
        await signOut();
        setLocation("/login");
    };

    return (
        <aside className={`
            fixed left-0 top-0 h-screen z-[1000] flex flex-col transition-all duration-300 ease-out
            bg-zinc-950 border-r border-zinc-900 shadow-xl
            ${collapsed ? "w-[68px]" : "w-64"}
        `}>

            {/* HEADER / LOGO */}
            <div className={`h-20 flex items-center shrink-0 relative border-b border-zinc-900/50 ${collapsed ? "justify-center px-0" : "px-6"}`}>
                {!collapsed ? (
                    <div className="flex items-center gap-3 animate-in fade-in duration-300">
                        <img src={logo} alt="PrintLog" className="w-8 h-8 object-contain opacity-90 grayscale-[0.2]" />
                        <div className="flex flex-col">
                            <h1 className="text-sm font-black text-zinc-100 tracking-[0.2em] uppercase leading-none">PrintLog</h1>
                            <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest mt-1">System v2.0</span>
                        </div>
                    </div>
                ) : (
                    <div className="relative flex items-center justify-center">
                        <img src={logoBranca} alt="PL" className="w-7 h-7 object-contain opacity-30" />
                        <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" />
                    </div>
                )}

                <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-50">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-5 h-5 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-center text-zinc-600 hover:text-white hover:border-zinc-700 transition-all shadow-lg"
                    >
                        {collapsed ? <ChevronRight size={10} /> : <ChevronLeft size={10} />}
                    </button>
                </div>
            </div>

            {/* NAVIGATIONS */}
            <nav className="flex-1 pt-2 pb-6 overflow-hidden overflow-y-auto custom-scrollbar space-y-px">
                <SidebarSection title="Principal" collapsed={collapsed} />
                <SidebarItem href="/dashboard" icon={LayoutGrid} label="Dashboard" collapsed={collapsed} color="sky" />
                <SidebarItem href="/calculadora" icon={Calculator} label="Calculadora" collapsed={collapsed} color="sky" />
                <SidebarItem href="/projetos" icon={History} label="Projetos" collapsed={collapsed} color="amber" />

                <SidebarSection title="Recursos" collapsed={collapsed} />
                <SidebarItem href="/filamentos" icon={Package} label="Filamentos" collapsed={collapsed} badge={alerts.lowStock} color="sky" />
                <SidebarItem href="/impressoras" icon={Printer} label="Impressoras" collapsed={collapsed} badge={alerts.criticalPrinter} color="emerald" />

                <SidebarSection title="Sistema" collapsed={collapsed} />
                <SidebarItem href="/configuracoes" icon={Settings} label="Configurações" collapsed={collapsed} color="sky" />
                <SidebarItem href="/central-maker" icon={HelpCircle} label="Central Maker" collapsed={collapsed} color="purple" />
            </nav>

            {/* USER FOOTER (Integrated) */}
            <div className={`border-t border-zinc-900 bg-zinc-950 px-5 py-4`}>
                <div className={`flex items-center gap-3 transition-all duration-300 ${collapsed ? "justify-center" : ""}`}>
                    <div className="relative shrink-0">
                        <img
                            src={user?.imageUrl}
                            className="w-8 h-8 rounded border border-zinc-800 object-cover grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all"
                            alt="Perfil"
                        />
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-zinc-950 rounded-full flex items-center justify-center">
                            <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                        </div>
                    </div>

                    {!collapsed && (
                        <>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-zinc-400 truncate uppercase tracking-wider">
                                    {user?.firstName || "Maker"}
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-7 h-7 rounded flex items-center justify-center text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                            >
                                <LogOut size={14} />
                            </button>
                        </>
                    )}
                </div>
            </div>

        </aside>
    );
}