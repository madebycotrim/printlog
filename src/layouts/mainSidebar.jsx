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

// Mapeamento de Cores para facilitar a manutenção
const COLOR_MAP = {
    sky: {
        text: "text-sky-400",
        bar: "bg-sky-500",
        shadow: "shadow-[0_0_10px_rgba(14,165,233,0.4)]",
    },
    amber: {
        text: "text-amber-400",
        bar: "bg-amber-500",
        shadow: "shadow-[0_0_10px_rgba(251,191,36,0.4)]",
    },
    emerald: {
        text: "text-emerald-400",
        bar: "bg-emerald-500",
        shadow: "shadow-[0_0_10px_rgba(16,185,129,0.4)]",
    }
};

const SidebarItem = memo(({ href, icon: Icon, label, collapsed, badge, color = "sky" }) => {
    const [location] = useLocation();
    const isActive = location === href || (href !== "/" && location.startsWith(href));
    
    // Seleciona as classes baseado na prop color
    const theme = COLOR_MAP[color] || COLOR_MAP.sky;

    return (
        <Link href={href}>
            <div className={`relative group cursor-pointer my-0.5 transition-all duration-300 ${collapsed ? "px-0 flex justify-center" : "px-3"}`}>

                {collapsed && (
                    <div className="fixed left-[70px] px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-2xl opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-[9999] flex items-center gap-3">
                        {label}
                        {badge && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                    </div>
                )}

                <div className={`absolute inset-y-0 transition-all duration-300 ${collapsed ? "left-0 right-0 rounded-none" : "left-2 right-2 rounded-xl"} ${isActive ? "bg-zinc-900/80 border-y border-zinc-800/50" : "bg-transparent border-transparent group-hover:bg-zinc-900/40"}`} />

                {!collapsed && isActive && (
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full ${theme.bar} ${theme.shadow} z-10`} />
                )}

                <div className={`relative flex items-center h-12 transition-all duration-200 ${collapsed ? "justify-center w-full" : "px-3 w-full"}`}>
                    <div className="relative flex items-center justify-center">
                        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={`transition-colors duration-300 ${isActive ? theme.text : "text-zinc-500 group-hover:text-zinc-300"}`} />
                        {badge && (
                            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2.5 bg-rose-500 ring-2 ring-zinc-950"></span>
                            </span>
                        )}
                    </div>
                    {!collapsed && (
                        <div className="ml-3 overflow-hidden whitespace-nowrap">
                            <span className={`text-sm tracking-wide ${isActive ? `font-bold text-zinc-100` : "font-medium text-zinc-400 group-hover:text-zinc-200"}`}>{label}</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
});

const SidebarSection = ({ title, collapsed }) => (
    <div className={`px-6 mt-6 mb-2 transition-all duration-300 flex items-center ${collapsed ? "opacity-0 invisible h-0" : "opacity-100"}`}>
        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] whitespace-nowrap">{title}</span>
        <div className="h-px flex-1 bg-zinc-800/30 ml-4" />
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
        <aside className={`fixed left-0 top-0 h-screen bg-zinc-950 border-r border-zinc-900 z-[1000] flex flex-col transition-all duration-300 ${collapsed ? "w-[68px]" : "w-64"}`}>

            <div className={`h-24 flex items-center shrink-0 relative ${collapsed ? "justify-center px-0" : "px-6"}`}>
                {!collapsed ? (
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="PrintLog" className="w-9 h-9 object-contain" />
                        <div className="flex flex-col">
                            <h1 className="text-sm font-black text-white tracking-widest uppercase leading-none">PrintLog</h1>
                            <div className="flex items-center gap-2">
                                <div className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-30"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                                </div>
                                <div className="flex gap-[3px]">
                                    <div className="w-10 h-[2px] rounded-full bg-gradient-to-r from-emerald-500/60 via-emerald-500/20 to-transparent" />
                                    <div className="w-[3px] h-[2px] rounded-full bg-zinc-800 animate-pulse" />
                                    <div className="w-[8px] h-[2px] rounded-full bg-zinc-800" />
                                </div>
                                <span className="text-[7px] font-black text-zinc-500 uppercase tracking-[0.2em] font-mono ml-1 opacity-70">SYS_OK</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="relative flex items-center justify-center">
                        <img src={logoBranca} alt="PL" className="w-8 h-8 object-contain opacity-40" />
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" />
                    </div>
                )}

                <button onClick={() => setCollapsed(!collapsed)} className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-500 hover:text-white shadow-xl z-50">
                    {collapsed ? <ChevronRight size={10} /> : <ChevronLeft size={10} />}
                </button>
            </div>

            <nav className="flex-1 py-4 overflow-hidden space-y-1">
                <SidebarItem href="/dashboard" icon={LayoutGrid} label="Painel Geral" collapsed={collapsed} />
                <SidebarItem href="/calculadora" icon={Calculator} label="Calculadora" collapsed={collapsed} />
                <SidebarItem href="/orcamentos" icon={History} label="Orçamentos" collapsed={collapsed} color="amber" />

                <SidebarSection title="Oficina" collapsed={collapsed} />
                <SidebarItem href="/filamentos" icon={Package} label="Filamentos" collapsed={collapsed} badge={alerts.lowStock} color="sky" />
                <SidebarItem href="/impressoras" icon={Printer} label="Impressoras" collapsed={collapsed} badge={alerts.criticalPrinter} color="emerald" />

                <SidebarSection title="Sistema" collapsed={collapsed} />
                <SidebarItem href="/configuracoes" icon={Settings} label="Configurações" collapsed={collapsed} />
                <SidebarItem href="/central-maker" icon={HelpCircle} label="Central Maker" collapsed={collapsed} />
            </nav>

            <div className={`p-4 border-t border-zinc-900/50 ${collapsed ? "px-0 flex justify-center" : ""}`}>
                <div className={`relative flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 ${collapsed ? "justify-center w-12 h-12 cursor-pointer hover:bg-rose-500/10" : "bg-zinc-900/30 border border-zinc-800/50"}`} onClick={collapsed ? handleLogout : undefined}>
                    <div className="relative shrink-0">
                        <img src={user?.imageUrl} className="w-8 h-8 rounded-lg border border-zinc-800 object-cover" alt="Perfil" />
                        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border-2 border-zinc-950 rounded-full" />
                    </div>
                    {!collapsed && (
                        <>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-zinc-200 truncate uppercase tracking-tight">{user?.firstName || "Maker"}</p>
                                <p className="text-[8px] font-medium text-zinc-500 uppercase">Farm Manager</p>
                            </div>
                            <button onClick={handleLogout} className="p-2 rounded-lg text-zinc-500 hover:text-rose-400"><LogOut size={16} /></button>
                        </>
                    )}
                </div>
            </div>
        </aside>
    );
}