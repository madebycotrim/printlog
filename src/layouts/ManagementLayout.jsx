import React, { useEffect } from 'react';
import MainSidebar from './mainSidebar';
import { useSidebarStore } from '../stores/sidebarStore';
import { Menu } from 'lucide-react';
import { InstallPwa } from '../components/InstallPwa';
import FloatingQuickActions from '../components/FloatingQuickActions';
import ModalMaterial from '../features/materiais/components/ModalMaterial';
import ModalImpressora from '../features/impressoras/components/ModalImpressora';
import ModalInsumo from '../features/insumos/components/ModalInsumo';

import ModalScanner from '../features/scanner/components/ModalScanner';
import { useLocation } from 'wouter';
import { useState } from 'react';
import { useScannerStore } from '../stores/scannerStore';
import { useToastStore } from '../stores/toastStore';
import { useMateriais, useMutacoesMaterial } from '../features/materiais/logic/consultasMateriais';
import { usePrinters, usePrinterMutations } from '../features/impressoras/logic/consultasImpressora';
import { useSupplyStore } from '../features/insumos/logic/supplies';
import { identifyItem } from '../features/scanner/logic/scannerService';
import { useScanDetection } from '../hooks/useScanDetection';

export default function ManagementLayout({ children }) {
    const { width: larguraSidebar, isMobile, setIsMobile, setMobileOpen } = useSidebarStore();
    const [location, setLocation] = useLocation(); // Need setLocation for redirect
    const { addToast } = useToastStore();

    // Global Scanner Store
    const { isScannerOpen, openScanner, closeScanner, setHighlightedItem } = useScannerStore();

    // Data for Scanner
    const { data: filaments = [] } = useMateriais();
    const { data: printers = [] } = usePrinters();
    const supplies = useSupplyStore(state => state.supplies);
    const fetchSupplies = useSupplyStore(state => state.fetchSupplies);

    // Ensure supplies are loaded for Global Scanner
    useEffect(() => {
        if (supplies.length === 0) {
            fetchSupplies();
        }
    }, [supplies.length, fetchSupplies]);

    // Modal states (Local for Edit)
    const [isFilamentModalOpen, setFilamentModalOpen] = useState(false);
    const [isPrinterModalOpen, setPrinterModalOpen] = useState(false);
    const [isSupplyModalOpen, setSupplyModalOpen] = useState(false);

    // We remove local 'isScannerOpen' and use the store one

    // Edit States
    const [editingFilament, setEditingFilament] = useState(null);
    const [editingPrinter, setEditingPrinter] = useState(null);
    const [editingSupply, setEditingSupply] = useState(null);

    const { salvarMaterial } = useMutacoesMaterial();
    const { upsertPrinter } = usePrinterMutations();

    // Global Key Listener for Hardware Scanners
    useScanDetection((code) => {
        // Only trigger if scanner modal is NOT already open (to avoid double handling)
        if (!isScannerOpen) {
            handleScan(code);
        }
    });

    const handleScan = (code) => {
        const result = identifyItem(code, { filaments, printers, supplies });

        if (result) {
            // Close scanner immediately
            closeScanner();

            // Logic:
            // 1. If we are on the correct page, just Blink.
            // 2. If not, Redirect then Blink.

            const targetPathMap = {
                filament: '/filamentos',
                printer: '/impressoras',
                supply: '/insumos'
            };

            const targetPath = targetPathMap[result.type];
            const currentPath = location; // wouter location string

            // Set Global Blink State
            setHighlightedItem(result.item.id, result.type);
            addToast(`Item ${result.item.nome || result.item.name} localizado!`, 'success');

            // Redirect if needed
            if (!currentPath.includes(targetPath)) {
                setLocation(targetPath);
            }

        } else {
            addToast("Item não encontrado.", "error");
        }
    };

    // View Details Handler (from Scanner Modal "Visualizar" button)
    const handleVisualize = (item) => {
        // Logic is same as Scan success basically
        // We need to type check 'item' to retrieve type
        // But ModalScanner usually returns the item. 
        // Assuming item has ID. We can re-identify or pass type from ModalScanner if updated.
        // Simpler: ModalScanner's identifyItem returning the Wrapper {type, item} ?
        // Actually current ModalScanner returns just the item object on 'onViewDetails'.
        // Let's rely on handleScan to do the heavy lifting FIRST.

        // Wait, 'ModalScanner' calls 'onScan' when code is found.
        // Then it shows the card.
        // Then user clicks "Visualizar".
        // The 'onViewDetails' is called with the ITEM.

        // We need to know the TYPE again.
        // Re-identify for safety or pass it down.
        const result = identifyItem(item.id, { filaments, printers, supplies });
        if (result) {
            closeScanner();
            const targetPathMap = { filament: '/filamentos', printer: '/impressoras', supply: '/insumos' };
            const targetPath = targetPathMap[result.type];

            setHighlightedItem(result.item.id, result.type);

            if (!location.includes(targetPath)) {
                setLocation(targetPath);
            }
        }
    };

    // ... (Resize Handler and Theme Logic remain same)

    const getThemeColorClass = () => {
        if (location.includes('filamentos')) return 'from-rose-500/30';
        if (location.includes('insumos')) return 'from-orange-500/30';
        if (location.includes('impressoras')) return 'from-emerald-500/30';
        if (location.includes('projetos')) return 'from-amber-500/30';
        if (location.includes('financeiro')) return 'from-emerald-500/30';
        if (location.includes('central-maker')) return 'from-purple-500/30';
        return 'from-sky-500/30';
    };

    const themeGradient = getThemeColorClass();

    return (
        <div className="flex h-screen w-full bg-[#0c0c0e] text-zinc-200 font-sans antialiased overflow-hidden">
            <FloatingQuickActions
                onNewFilament={() => { setEditingFilament(null); setFilamentModalOpen(true); }}
                onNewPrinter={() => { setEditingPrinter(null); setPrinterModalOpen(true); }}
                onNewSupply={() => { setEditingSupply(null); setSupplyModalOpen(true); }}
                onScan={openScanner}
            />
            <InstallPwa />

            {/* Modals */}
            <ModalScanner
                isOpen={isScannerOpen}
                onClose={closeScanner}
                onScan={handleScan}
                onViewDetails={handleVisualize}
                items={[...filaments, ...printers, ...supplies]} // Pass ALL items for search
            />

            <ModalMaterial
                aberto={isFilamentModalOpen}
                aoFechar={() => { setFilamentModalOpen(false); setEditingFilament(null); }}
                dadosIniciais={editingFilament}
                aoSalvar={async (data) => {
                    await salvarMaterial(data);
                    if (!data.id) setFilamentModalOpen(false);
                }}
            />
            <ModalImpressora
                aberto={isPrinterModalOpen}
                aoFechar={() => { setPrinterModalOpen(false); setEditingPrinter(null); }}
                dadosIniciais={editingPrinter}
                aoSalvar={async (data) => {
                    await upsertPrinter(data);
                    if (!data.id) setPrinterModalOpen(false);
                }}
            />
            <ModalInsumo
                isOpen={isSupplyModalOpen}
                onClose={() => { setSupplyModalOpen(false); setEditingSupply(null); }}
                dadosIniciais={editingSupply}
            />
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

                    {/* Linha Vertical Temática (Centralizada no container de 1600px) - Oculta na Calculadora */}
                    {!location.includes('calculadora') && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1600px] h-full">
                            <div className={`absolute top-0 left-0 h-full w-px bg-gradient-to-b ${themeGradient} via-transparent to-transparent`} />
                        </div>
                    )}
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

                {/* UNIVERSAL PAGE CONTAINER */}
                <div className="p-8 xl:p-12 max-w-[1600px] mx-auto w-full space-y-8 animate-in fade-in duration-500 min-h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
