import React, { useState, useEffect, memo } from "react";
import { Link, useLocation } from "wouter";
import { useUser, useClerk } from "@clerk/clerk-react"; // Importes do Clerk
import { 
    LayoutGrid, Calculator, Package, History, Settings, 
    Printer, HelpCircle, LogOut, ChevronLeft, ChevronRight 
} from "lucide-react";

import logo from "../assets/logo.png";
import logoBranca from "../assets/logo-branca.png";
import { getFilaments } from "../features/filamentos/logic/filaments";
import { getPrinters } from "../features/impressoras/logic/printers";

// ... (MENU_ITEMS e SidebarSection permanecem iguais)
const MENU_ITEMS = [
    { href: "/dashboard", icon: LayoutGrid, label: "Dashboard" },
    { href: "/calculadora", icon: Calculator, label: "Calculadora" },
    { href: "/historico", icon: History, label: "Histórico" },
    { type: 'section', label: 'Fábrica' },
    { href: "/filamentos", icon: Package, label: "Filamentos", alertKey: 'lowStock' },
    { href: "/impressoras", icon: Printer, label: "Impressoras", alertKey: 'maint' },
    { type: 'section', label: 'Sistema' },
    { href: "/configuracoes", icon: Settings, label: "Configurações" },
    { href: "/ajuda", icon: HelpCircle, label: "Ajuda / Wiki" },
];

const SidebarItem = memo(({ href, icon: Icon, label, collapsed, badge }) => {
    const [location] = useLocation();
    const isActive = location === href || (href !== "/" && location.startsWith(href));

    return (
        <Link href={href}>
            <div className={`relative group cursor-pointer my-1 transition-all duration-300 ${collapsed ? "px-0 flex justify-center" : "px-3"}`}>
                {collapsed && (
                    <div className="fixed left-[70px] mt-2 px-3 py-2 bg-[#050505] border border-zinc-800 border-l-sky-500 border-l-2 text-zinc-100 text-[10px] font-black uppercase tracking-[0.2em] rounded-md shadow-2xl opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-[9999] flex items-center gap-3">
                        {label}
                        {badge && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                    </div>
                )}
                <div className={`absolute inset-y-0 transition-all duration-500 border rounded-lg ${collapsed ? "left-2 right-2 rounded-xl" : "left-3 right-2"} ${isActive ? "bg-zinc-800/20 border-white/5" : "bg-transparent border-transparent group-hover:bg-zinc-800/40"}`} />
                {!collapsed && isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-7 rounded-r-full bg-gradient-to-b from-sky-400 to-emerald-400 shadow-[0_0_15px_rgba(56,189,248,0.5)] z-10" />
                )}
                <div className={`relative flex items-center h-10 transition-all duration-200 ${collapsed ? "justify-center w-10" : "px-3 w-full"}`}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} className={`transition-colors duration-300 ${isActive ? "text-sky-400" : "text-zinc-500 group-hover:text-zinc-300"}`} />
                    {badge && (
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 ring-2 ring-[#050505]"></span>
                        </span>
                    )}
                    {!collapsed && (
                        <div className="ml-3 overflow-hidden whitespace-nowrap">
                            <span className={`text-[13px] ${isActive ? "font-black text-zinc-100" : "font-medium text-zinc-400 group-hover:text-zinc-200"}`}>{label}</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
});

const SidebarSection = ({ title, collapsed }) => (
    <div className={`px-6 mt-6 mb-2 transition-all duration-300 flex items-center ${collapsed ? "hidden" : "opacity-100"}`}>
        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-mono whitespace-nowrap">{title}</span>
        <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent ml-3 opacity-30" />
    </div>
);

export default function MainSidebar({ onCollapseChange }) {
    const [, setLocation] = useLocation();
    const { user } = useUser(); // Dados do usuário logado
    const { signOut } = useClerk(); // Função de deslogar
    
    const [collapsed, setCollapsed] = useState(() => {
        const saved = localStorage.getItem("printlog_sidebar_collapsed");
        return saved !== null ? JSON.parse(saved) : false;
    });

    const [alerts, setAlerts] = useState({ lowStock: false, maint: false });

    useEffect(() => {
        localStorage.setItem("printlog_sidebar_collapsed", JSON.stringify(collapsed));
        if (onCollapseChange) onCollapseChange(collapsed);
    }, [collapsed, onCollapseChange]);

    useEffect(() => {
        const check = () => {
            try {
                const f = getFilaments();
                const p = getPrinters();
                setAlerts({
                    lowStock: f.some(x => (x.weightCurrent / x.weightTotal) < 0.2),
                    maint: p.some(x => (x.totalHours - x.lastMaintenanceHour) / x.maintenanceInterval >= 0.9)
                });
            } catch (e) { }
        };
        check();
        const i = setInterval(check, 30000);
        return () => clearInterval(i);
    }, []);

    // Função de Logout amigável
    const handleLogout = async (e) => {
        if (e) e.stopPropagation();
        await signOut();
        setLocation("/login");
    };

    return (
        <aside className={`fixed left-0 top-0 h-screen bg-[#050505] border-r border-zinc-900 z-[1000] flex flex-col transition-all duration-300 ${collapsed ? "w-[72px]" : "w-64"}`}>
            
            <div className={`h-20 flex items-center shrink-0 relative ${collapsed ? "justify-center" : "px-6"}`}>
                {!collapsed ? (
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
                        <div>
                            <h1 className="text-sm font-black text-white tracking-tight uppercase">PrintLog</h1>
                            <div className="w-12 h-0.5 bg-sky-500 rounded-full mt-0.5" />
                        </div>
                    </div>
                ) : (
                    <img src={logoBranca} alt="PL" className="w-8 h-8 object-contain opacity-50" />
                )}

                <button onClick={() => setCollapsed(!collapsed)} className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#050505] border border-zinc-800 rounded-full flex items-center justify-center text-zinc-500 hover:text-white transition-all shadow-xl">
                    {collapsed ? <ChevronRight size={10} /> : <ChevronLeft size={10} />}
                </button>
            </div>

            <nav className="flex-1 py-4 overflow-y-auto overflow-x-visible space-y-0.5 custom-scrollbar">
                {MENU_ITEMS.map((item, index) => (
                    item.type === 'section' ? (
                        <SidebarSection key={`sec-${index}`} title={item.label} collapsed={collapsed} />
                    ) : (
                        <SidebarItem key={item.href} {...item} collapsed={collapsed} badge={alerts[item.alertKey]} />
                    )
                ))}
            </nav>

            {/* FOOTER ADAPTADO PARA O CLERK */}
            <div className="p-3 mt-auto">
                <div 
                    onClick={collapsed ? handleLogout : undefined}
                    className={`
                        relative flex items-center gap-3 p-2 rounded-xl transition-all duration-300 group/footer
                        ${collapsed 
                            ? "justify-center cursor-pointer hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20" 
                            : "bg-zinc-900/40 border border-zinc-800/50"}
                    `}
                >
                    <div className="relative shrink-0">
                        <div className={`
                            w-9 h-9 rounded-lg overflow-hidden border transition-colors
                            ${collapsed ? "border-zinc-700 group-hover/footer:border-rose-500/50" : "border-zinc-700 group-hover/footer:border-sky-500/50"}
                        `}>
                            {/* Imagem dinâmica do Clerk */}
                            <img 
                                src={user?.imageUrl} 
                                className={`w-full h-full object-cover transition-all duration-500 ${collapsed ? "grayscale group-hover/footer:grayscale-0" : "grayscale hover:grayscale-0"}`} 
                                alt="Avatar" 
                            />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#050505] rounded-full" />
                    </div>

                    {!collapsed && (
                        <>
                            <div className="flex-1 min-w-0">
                                {/* Nome dinâmico do Clerk */}
                                <p className="text-[11px] font-black text-zinc-200 truncate uppercase tracking-wider">
                                    {user?.fullName || "Comandante"}
                                </p>
                                <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-tight">Administrador</p>
                            </div>
                            <button 
                                onClick={handleLogout} 
                                title="Sair do sistema" 
                                className="p-2 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-400/10 transition-all"
                            >
                                <LogOut size={16} strokeWidth={2.5} />
                            </button>
                        </>
                    )}

                    {collapsed && (
                        <div className="absolute left-full ml-4 px-3 py-2 bg-rose-600 text-white text-[10px] font-bold uppercase rounded opacity-0 pointer-events-none group-hover/footer:opacity-100 group-hover/footer:translate-x-1 transition-all z-[9999] shadow-[10px_0_30px_rgba(225,29,72,0.3)]">
                            Sair do Sistema
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}