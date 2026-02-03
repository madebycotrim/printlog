import React, { useMemo, memo } from "react";
import { Link, useLocation } from "wouter";
import { useUser, useAuth } from "../contexts/AuthContext";
import {
    LayoutGrid, Calculator, Package, Settings,
    Printer, HelpCircle, LogOut, ChevronLeft, ChevronRight,
    Layers, FolderOpen, Users, Wallet, X, Trash2
} from "lucide-react";

import logo from "../assets/logo-colorida.png";
import logoBranca from "../assets/logo-branca.png";

import { useFilamentos } from "../features/filamentos/logic/consultasFilamento";
import { usePrinters } from "../features/impressoras/logic/consultasImpressora";
import { analisarSaudeImpressora } from "../features/impressoras/logic/diagnostics";

// --- THEME ---
const THEME = {
    sky: "text-sky-400 border-sky-500 shadow-sky-900/20",
    emerald: "text-emerald-400 border-emerald-500 shadow-emerald-900/20",
    amber: "text-amber-400 border-amber-500 shadow-amber-900/20",
    rose: "text-rose-400 border-rose-500 shadow-rose-900/20",
    purple: "text-purple-400 border-purple-500 shadow-purple-900/20",
    orange: "text-orange-400 border-orange-500 shadow-orange-900/20",
};

/**
 * COMPONENT: TECH NAV ITEM
 * Featuring a glassmorphic active state with a precise colored border.
 */
const SidebarItem = memo(({ href, icon: Icon, label, collapsed, badge, color = "sky", onHover, onClick, isButton = false }) => {
    const [location] = useLocation();
    const isActive = !isButton && href && (location === href || (href !== "/" && location.startsWith(href)));
    const activeClass = THEME[color] || THEME.sky;

    const content = (
        <div
            className={`relative group px-3 py-1`}
            onMouseEnter={onHover}
            onClick={onClick}
        >
            {collapsed && (
                <div className="
                    fixed left-[72px] z-[9999] px-3 py-2 
                    bg-[#0c0c0e] border border-white/10 rounded-lg 
                    text-zinc-200 text-[12px] font-medium
                    opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 
                    transition-all duration-300 pointer-events-none shadow-2xl
                    flex items-center gap-3
                ">
                    <span>{label}</span>
                    {badge && <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />}
                </div>
            )}

            <div className={`
            relative flex items-center h-10 rounded-lg cursor-pointer overflow-hidden transition-all duration-300
            ${isActive
                    ? "bg-white/[0.03] border border-white/[0.05] shadow-lg backdrop-blur-sm"
                    : "border border-transparent hover:bg-white/[0.02] text-zinc-500 hover:text-zinc-300"
                }
            ${collapsed ? "justify-center px-0 w-10 mx-auto" : "pl-3 w-full"}
`}>
                {/* ACTIVE ACCENT BAR */}
                {isActive && !collapsed && (
                    <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${activeClass.split(' ')[1].replace('border-', 'bg-')} `} />
                )}

                {/* ICON WITH GLOW */}
                <Icon
                    size={16}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`
                    relative z-10 transition-all duration-300
                    ${isActive ? `${activeClass.split(' ')[0]} drop-shadow-md` : "opacity-70 group-hover:opacity-100"}
`}
                />

                {!collapsed && (
                    <div className="flex-1 ml-3 flex items-center justify-between">
                        <span className={`
text-[13px] font-medium transition-all duration-300
                        ${isActive ? "text-zinc-100" : ""}
`}>
                            {label}
                        </span>
                    </div>
                )}

                {/* BADGE */}
                {badge && (
                    <div className={`absolute ${collapsed ? "top-2 right-2" : "right-3"} flex h-1.5 w-1.5`}>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500" />
                    </div>
                )}
            </div>
        </div>
    );

    if (isButton) return content;
    return <Link href={href} onClick={onClick}>{content}</Link>;
});

const SidebarSection = ({ title, collapsed }) => (
    <div className={`
px-6 mt-6 mb-2 transition-all duration-500 ease-in-out
        ${collapsed ? "opacity-0 h-0 overflow-hidden mt-0" : "opacity-100"}
`}>
        <div className="flex items-center gap-2 opacity-40">
            <span className="text-[11px] font-semibold text-white">{title}</span>
            <div className="h-px bg-white flex-1 opacity-20" />
        </div>
    </div>
);

// --- ROUTE PREFETCH MAP ---
// Copied from route.jsx to allow preloading chunks on hover
const ROUTES_MAP = {
    '/dashboard': () => import('../pages/Principal/Dashboard'),
    '/calculadora': () => import('../pages/Principal/Calculadora'),
    '/clientes': () => import('../pages/Principal/Clientes'),
    '/filamentos': () => import('../pages/Gestao/Filamentos'),
    '/insumos': () => import('../pages/Gestao/Insumos'),
    '/impressoras': () => import('../pages/Gestao/Impressoras'),
    '/projetos': () => import('../pages/Gestao/Projetos'),
    '/financeiro': () => import('../pages/Gestao/Financeiro'),
    '/configuracoes': () => import('../pages/Sistema/Configuracoes.jsx'),
    '/central-maker': () => import('../pages/Sistema/CentralMaker'),
};

const prefetchRoute = (path) => {
    const importer = ROUTES_MAP[path];
    if (importer) {
        // console.log(`Prefetching ${ path }...`);
        importer();
    }
};

import { useSidebarStore } from "../stores/sidebarStore";

export default function MainSidebar() {
    const [, setLocation] = useLocation();
    const { user } = useUser();
    const [workshopName, setWorkshopName] = React.useState(localStorage.getItem('printlog_workshop_name') || "");
    const { signOut } = useAuth();

    // Global State
    const { collapsed, setCollapsed, isMobile, mobileOpen, setMobileOpen } = useSidebarStore();

    const { data: filaments = [] } = useFilamentos();
    const { data: printers = [] } = usePrinters();



    const alerts = useMemo(() => {
        const lowStock = (filaments || []).some(f => (Number(f.peso_atual) || 0) < 150);
        const criticalPrinter = (printers || []).some(p => {
            const temErroStatus = p.status === 'error' || p.status === 'offline';
            const temManutencaoCritica = analisarSaudeImpressora(p).some(m => m.severidade === 'critical');
            return temErroStatus || temManutencaoCritica;
        });
        return { lowStock, criticalPrinter };
    }, [filaments, printers]);

    // Listen for workshop name updates
    React.useEffect(() => {
        const handleUpdate = () => {
            setWorkshopName(localStorage.getItem('printlog_workshop_name') || "");
        };
        window.addEventListener('workshopNameUpdated', handleUpdate);
        return () => window.removeEventListener('workshopNameUpdated', handleUpdate);
    }, []);

    const handleLogout = async () => {
        await signOut();
        setLocation("/login");
    };

    // Mobile Overlay Close
    const handleCloseMobile = () => setMobileOpen(false);

    // Dynamic props for rendering
    // If mobile, force "not collapsed" for the drawer content
    const renderCollapsed = isMobile ? false : collapsed;
    const sidebarWidthClass = isMobile ? "w-[280px]" : (collapsed ? "w-[72px]" : "w-[260px]");

    // Transform logic for mobile
    const mobileTransformClass = isMobile
        ? (mobileOpen ? "translate-x-0" : "-translate-x-full")
        : "";

    return (
        <>
            {/* MOBILE BACKDROP */}
            {isMobile && mobileOpen && (
                <div
                    className="fixed inset-0 z-[9998] bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={handleCloseMobile}
                />
            )}

            <aside className={`
            fixed left-0 top-0 h-screen z-[9999] flex flex-col
bg-[#09090b] border-r border-white/5 shadow-2xl
transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]
            ${sidebarWidthClass}
            ${mobileTransformClass}
`}>
                {/* GRID TEXTURE BACKGROUND */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                    backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                    backgroundSize: '24px 24px',
                    maskImage: 'linear-gradient(to bottom, black, transparent)'
                }} />

                {/* HEADER */}
                <header className={`
h-[88px] flex items-center shrink-0 relative
                ${renderCollapsed ? "justify-center px-0" : "px-6 justify-between"}
`}>
                    {!renderCollapsed ? (
                        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-500">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 border border-white/5 flex items-center justify-center shadow-lg relative group overflow-hidden">
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <img src={logo} alt="PL" className="w-6 h-6 object-contain relative z-10" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <div className="flex items-center gap-0.5">
                                    <h1 className="text-xl font-black bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent tracking-[0.15em] uppercase leading-none">PrintLog</h1>
                                    <span className="relative -top-2.5 px-1.5 py-px rounded-md text-[8px] font-black bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-widest shadow-sm shadow-sky-900/10">
                                        Beta
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-xl bg-zinc-900/50 border border-white/5 flex items-center justify-center">
                            <img src={logoBranca} alt="PL" className="w-5 h-5 object-contain opacity-50" />
                        </div>
                    )}

                    {/* Mobile Close Button */}
                    {isMobile && (
                        <button
                            onClick={handleCloseMobile}
                            className="text-zinc-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    )}
                </header>

                {/* NAV LIST */}
                <nav className="flex-1 py-2 overflow-y-auto custom-scrollbar relative z-10 space-y-1">
                    <SidebarSection title="Principal" collapsed={renderCollapsed} />
                    <SidebarItem href="/dashboard" icon={LayoutGrid} label="Dashboard" collapsed={renderCollapsed} color="sky" onHover={() => prefetchRoute('/dashboard')} onClick={isMobile ? handleCloseMobile : undefined} />
                    <SidebarItem href="/calculadora" icon={Calculator} label="Calculadora" collapsed={renderCollapsed} color="sky" onHover={() => prefetchRoute('/calculadora')} onClick={isMobile ? handleCloseMobile : undefined} />
                    <SidebarItem href="/clientes" icon={Users} label="Clientes" collapsed={renderCollapsed} color="sky" onHover={() => prefetchRoute('/clientes')} onClick={isMobile ? handleCloseMobile : undefined} />

                    <SidebarSection title="Gestão" collapsed={renderCollapsed} />
                    <SidebarItem href="/filamentos" icon={Package} label="Filamentos" collapsed={renderCollapsed} badge={alerts.lowStock} color="rose" onHover={() => prefetchRoute('/filamentos')} onClick={isMobile ? handleCloseMobile : undefined} />
                    <SidebarItem href="/insumos" icon={Layers} label="Insumos" collapsed={renderCollapsed} color="orange" onHover={() => prefetchRoute('/insumos')} onClick={isMobile ? handleCloseMobile : undefined} />
                    <SidebarItem href="/impressoras" icon={Printer} label="Impressoras" collapsed={renderCollapsed} badge={alerts.criticalPrinter} color="emerald" onHover={() => prefetchRoute('/impressoras')} onClick={isMobile ? handleCloseMobile : undefined} />
                    <SidebarItem href="/projetos" icon={FolderOpen} label="Projetos" collapsed={renderCollapsed} color="amber" onHover={() => prefetchRoute('/projetos')} onClick={isMobile ? handleCloseMobile : undefined} />
                    <SidebarItem href="/financeiro" icon={Wallet} label="Financeiro" collapsed={renderCollapsed} color="emerald" onHover={() => prefetchRoute('/financeiro')} onClick={isMobile ? handleCloseMobile : undefined} />

                    <SidebarSection title="Sistema" collapsed={renderCollapsed} />
                    <SidebarItem href="/configuracoes" icon={Settings} label="Configurações" collapsed={renderCollapsed} color="sky" onHover={() => prefetchRoute('/configuracoes')} onClick={isMobile ? handleCloseMobile : undefined} />

                    <SidebarItem href="/central-maker" icon={HelpCircle} label="Central Maker" collapsed={renderCollapsed} color="purple" onHover={() => prefetchRoute('/central-maker')} onClick={isMobile ? handleCloseMobile : undefined} />
                </nav>

                {/* EXPANDER (Floating) - Only Desktop */}
                {!isMobile && (
                    <div className="absolute top-10 right-0 translate-x-1/2 z-50">
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="w-5 h-5 bg-zinc-950 border border-zinc-700 rounded-full flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-500 transition-all shadow-xl hover:scale-110"
                        >
                            {collapsed ? <ChevronRight size={10} /> : <ChevronLeft size={10} />}
                        </button>
                    </div>
                )}

                <div className="p-4 border-t border-white/5 bg-zinc-950/30">
                    <div
                        onClick={renderCollapsed ? handleLogout : undefined}
                        className={`
                        flex items-center gap-3 w-full 
                        ${renderCollapsed ? 'justify-center cursor-pointer group/logout' : ''}
`}
                        title={renderCollapsed ? "Sair" : undefined}
                    >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <img
                                src={user?.imageUrl}
                                className={`
w-9 h-9 rounded-full object-cover bg-zinc-800 ring-2 ring-zinc-950 transition-all
                                ${renderCollapsed ? 'group-hover/logout:ring-rose-500/50 group-hover/logout:opacity-80' : ''}
`}
                                alt="Profile"
                            />
                            {renderCollapsed && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover/logout:opacity-100 transition-opacity">
                                    <LogOut size={14} className="text-white" />
                                </div>
                            )}
                            {!renderCollapsed && (
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-zinc-950" />
                            )}
                        </div>

                        {!renderCollapsed && (
                            <>
                                {/* Info */}
                                <div className="flex-1 flex flex-col min-w-0">
                                    <span className="text-sm font-medium text-zinc-200 truncate">
                                        {user?.firstName || "Maker"}
                                    </span>
                                    <span className="text-[10px] text-zinc-500 truncate leading-none">
                                        {workshopName || "Oficina Maker"}
                                    </span>
                                </div>

                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                                    title="Sair"
                                >
                                    <LogOut size={16} strokeWidth={2} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
