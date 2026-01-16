import React, { useState, useEffect, useCallback } from 'react';
import { Activity, LayoutGrid, RotateCcw, EyeOff, Eye, Plus, Check, Box, Printer, Package, Calculator, Layers, Search, Command, PenTool } from 'lucide-react';
import ManagementLayout from '../../layouts/ManagementLayout';
import { useDashboardData } from '../../features/dashboard/hooks/useDashboardData';
import FinancialSummaryWidget from '../../features/dashboard/components/FinancialSummaryWidget';
import FleetSummaryWidget from '../../features/dashboard/components/FleetSummaryWidget';
import AlertsWidget from '../../features/dashboard/components/AlertsWidget';
import RecentProjectsWidget from '../../features/dashboard/components/RecentProjectsWidget';
import TodoWidget from '../../features/dashboard/components/TodoWidget';
import HighlightsWidget from '../../features/dashboard/components/HighlightsWidget';
import ActivityFeedWidget from '../../features/dashboard/components/ActivityFeedWidget';
import PerformanceMetricsWidget from '../../features/dashboard/components/PerformanceMetricsWidget';

import { useToastStore } from '../../stores/toastStore';
import { useSidebarStore } from '../../stores/sidebarStore';

// Error handling
import ErrorBoundary from '../../components/ErrorBoundary';

// Importar modais para ações rápidas
import { useFilamentStore } from '../../features/filamentos/logic/filaments';
import { usePrinterStore } from '../../features/impressoras/logic/printer';
import { useProjectsStore } from '../../features/projetos/logic/projects';
import { useLocation } from 'wouter';
import { useDashboardLayoutStore } from '../../features/dashboard/logic/layout';
import ModalFilamento from '../../features/filamentos/components/ModalFilamento';
import ModalImpressora from '../../features/impressoras/components/ModalImpressora';
import ModalInsumo from '../../features/insumos/components/ModalInsumo';

const widgetNames = {
    financial: 'Resumo Financeiro',
    fleet_summary: 'Resumo da Frota',
    alerts: 'Alertas',
    todo: 'Lista de Tarefas',
    highlights: 'Destaques',
    recent_projects: 'Projetos Recentes',
    activity_feed: 'Atividades',
    performance: 'Performance'
};

export default function Dashboard() {



    // Toast notifications
    const { addToast } = useToastStore();

    // Layout Store
    const {
        layout,
        hidden,
        colSpans,
        rowSpans,
        editMode,
        // expandedWidgets,
        toggleEditMode: originalToggleEditMode,
        // moveWidget: originalMoveWidget,
        reorderWidget: originalReorderWidget,
        hideWidget: originalHideWidget,
        showWidget: originalShowWidget,
        resetLayout: originalResetLayout,
        showAll: originalShowAll,
        hideAll: originalHideAll,
        // toggleExpand,
        setWidgetSize
    } = useDashboardLayoutStore();

    // Wrapped functions for toast notifications
    const toggleEditMode = useCallback(() => {
        originalToggleEditMode();
        // Removed toast notification for cleaner UX
    }, [originalToggleEditMode]);

    const resetLayout = useCallback(() => {
        originalResetLayout();
        addToast('Layout restaurado para o padrão.', 'success');
    }, [originalResetLayout, addToast]);



    const hideWidget = useCallback((id) => {
        originalHideWidget(id);
        addToast(`Widget "${widgetNames[id] || id}" ocultado.`, 'info');
    }, [originalHideWidget, addToast]);

    const showWidget = useCallback((id) => {
        originalShowWidget(id);
        addToast(`Widget "${widgetNames[id] || id}" exibido.`, 'success');
    }, [originalShowWidget, addToast]);

    // const moveWidget = useCallback((id, direction) => {
    //    originalMoveWidget(id, direction);
    // }, [originalMoveWidget]);

    const reorderWidget = useCallback((sourceId, targetId) => {
        originalReorderWidget(sourceId, targetId);
    }, [originalReorderWidget]);

    const showAll = useCallback(() => {
        originalShowAll();
        addToast('Todos os widgets exibidos.', 'success');
    }, [originalShowAll, addToast]);

    const hideAll = useCallback(() => {
        originalHideAll();
        addToast('Todos os widgets ocultados.', 'warning');
    }, [originalHideAll, addToast]);

    const [draggedId, setDraggedId] = useState(null);

    // Estados para modais de ações rápidas

    // Sidebar width for positioning
    const { width: larguraSidebar } = useSidebarStore(); // Added this line

    const [, setLocation] = useLocation();

    // Dados do dashboard
    const {
        alerts,
        criticalAlertsCount
    } = useDashboardData();

    const { filaments } = useFilamentStore();
    const { printers } = usePrinterStore();
    const { projects, fetchHistory, updateProjectStatus } = useProjectsStore();



    console.log('[Dashboard Debug] State:', { layout, hidden, editMode, projects, filaments, printers });

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyboard = (e) => {
            // Ctrl+E: Toggle edit mode
            if (e.ctrlKey && e.key === 'e') {
                e.preventDefault();
                toggleEditMode();
            }
            // Ctrl+R: Reset layout
            else if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                resetLayout();
            }

            // Esc: Exit edit mode
            else if (e.key === 'Escape' && editMode) {
                e.preventDefault();
                toggleEditMode();
            }
        };

        window.addEventListener('keydown', handleKeyboard);
        return () => window.removeEventListener('keydown', handleKeyboard);
    }, [editMode, toggleEditMode, resetLayout, projects, criticalAlertsCount, printers]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);






    // Handlers de Ações Inteligentes
    const handleDuplicateProject = (proj) => {
        setLocation(`/ calculadora ? load = ${proj.id} `);
    };

    const handleConcludeProject = async (id) => {
        if (!id) return;
        try {
            await updateProjectStatus(id, 'finalizado');

        } catch (error) {
            console.error("Erro ao concluir projeto:", error);
        }
    };

    // --- WIDGET RENDERER (with Error Boundaries) ---
    const renderWidgetContent = (id) => {
        let content = null;
        switch (id) {
            case 'financial':
                content = <FinancialSummaryWidget projects={projects} />;
                break;

            case 'fleet_summary':
                content = <FleetSummaryWidget printers={printers} />;
                break;
            case 'alerts':
                content = <AlertsWidget alerts={alerts} criticalAlerts={criticalAlertsCount} />;
                break;
            case 'recent_projects':
                content = <RecentProjectsWidget projects={projects?.filter(p => p.data?.status !== 'finalizado') || []} onDuplicate={handleDuplicateProject} onConclude={handleConcludeProject} />;
                break;
            case 'todo':
                content = <TodoWidget />;
                break;
            case 'highlights':
                content = <HighlightsWidget projects={projects} printers={printers} />;
                break;
            case 'activity_feed':
                content = <ActivityFeedWidget />;
                break;
            case 'performance':
                content = <PerformanceMetricsWidget projects={projects} />;
                break;
            default:
                content = null;
        }
        return <ErrorBoundary key={id}>{content}</ErrorBoundary>;
    };

    const [isFilamentModalOpen, setFilamentModalOpen] = useState(false);
    const [isPrinterModalOpen, setPrinterModalOpen] = useState(false);
    const [isSupplyModalOpen, setSupplyModalOpen] = useState(false);

    const { saveFilament } = useFilamentStore();
    const { upsertPrinter } = usePrinterStore();

    // Handlers para salvar
    const handleSaveFilament = async (data) => {
        await saveFilament(data);
        // Modal fecha automaticamente pelo sucesso ou manualmente
        // mas aqui vamos garantir o estado
        if (!data.id) setFilamentModalOpen(false);
    };

    const handleSavePrinter = async (data) => {
        await upsertPrinter(data);
        if (!data.id) setPrinterModalOpen(false);
    };

    return (
        <ManagementLayout>
            <div className={`p-8 xl:p-12 max-w-[1600px] mx-auto w-full space-y-8 animate-in fade-in duration-500`}>

                {/* HEADER */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 shrink-0">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-black text-zinc-100 tracking-tight flex items-center gap-3">
                            <LayoutGrid className="text-sky-500" size={28} />
                            Dashboard
                        </h1>
                        <p className="text-sm text-zinc-500 font-medium tracking-wide">
                            Visão geral da sua operação
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* BOTÃO GLOBAL SEARCH - NOVA ADIÇÃO */}
                        <button
                            onClick={() => window.dispatchEvent(new Event('open-global-search'))}
                            className="h-10 w-10 md:w-auto px-0 md:px-4 rounded-xl flex items-center justify-center gap-3 bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 hover:bg-zinc-800/80 transition-all group"
                        >
                            <Search size={16} />
                            <div className="hidden md:flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider">Buscar</span>
                                <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-zinc-700 bg-zinc-800 px-1.5 font-mono text-[10px] font-medium text-zinc-400 opacity-50">
                                    <span className="text-xs">Ctrl</span>K
                                </kbd>
                            </div>
                        </button>
                        {/* BOTÃO TOGGLE EDIT */}
                        <button
                            onClick={toggleEditMode}
                            className={`
                                h-10 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-300
                                ${editMode
                                    ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                                    : "bg-zinc-900/50 text-zinc-400 border border-zinc-800 hover:text-zinc-200 hover:border-zinc-700"}
                            `}
                        >
                            {editMode ? <Check size={14} strokeWidth={3} /> : <PenTool size={14} />}
                            {editMode ? "Concluir Edição" : "Editar Layout"}
                        </button>

                        {/* MENU DE WIDGETS (Visível apenas em modo de edição) */}
                        <div className={`
                            overflow-hidden transition-all duration-300 flex items-center gap-2
                            ${editMode ? 'w-auto opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-4 pointer-events-none'}
                        `}>
                            <button
                                onClick={resetLayout}
                                className="h-10 px-4 bg-zinc-900/50 border border-zinc-800 hover:border-rose-500/50 text-zinc-400 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap"
                                title="Resetar Layout para o padrão"
                            >
                                <RotateCcw size={14} />
                                Resetar Padrão
                            </button>
                        </div>
                    </div>
                </header>

                {/* MODAIS AÇÕES RÁPIDAS */}
                <ModalFilamento aberto={isFilamentModalOpen} aoFechar={() => setFilamentModalOpen(false)} aoSalvar={handleSaveFilament} />
                <ModalImpressora aberto={isPrinterModalOpen} aoFechar={() => setPrinterModalOpen(false)} aoSalvar={handleSavePrinter} />
                <ModalInsumo isOpen={isSupplyModalOpen} onClose={() => setSupplyModalOpen(false)} />

                {/* Empty State when all hidden */}
                {layout.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border-2 border-dashed border-zinc-800 bg-zinc-900/30 min-h-[400px]">
                        <div className="p-4 rounded-full bg-zinc-800 mb-4">
                            <LayoutGrid className="w-8 h-8 text-zinc-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Seu Dashboard está vazio</h3>
                        <p className="text-zinc-400 max-w-md mx-auto mb-6">
                            Todos os widgets foram ocultados. Use a barra abaixo para adicionar widgets ao seu painel.
                        </p>
                        {!editMode && (
                            <button
                                onClick={toggleEditMode}
                                className="flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold transition-all"
                            >
                                <LayoutGrid size={20} />
                                Personalizar Dashboard
                            </button>
                        )}
                    </div>
                )}

                {/* GRID DASHBOARD */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-32 auto-rows-[minmax(200px,auto)]" style={{ gridAutoFlow: 'dense' }}>
                    {Array.isArray(layout) && layout.map((widgetId, index) => {
                        const colSpan = (colSpans && colSpans[widgetId]) || 'lg:col-span-1';
                        const rowSpan = (rowSpans && rowSpans[widgetId]) || '';

                        return (
                            <div
                                key={widgetId}
                                draggable={editMode}
                                onDragStart={(e) => {
                                    if (!editMode) {
                                        e.preventDefault();
                                        return;
                                    }
                                    setDraggedId(widgetId);
                                    e.dataTransfer.effectAllowed = 'move';
                                }}
                                onDragEnter={(e) => {
                                    e.preventDefault();
                                    if (draggedId && draggedId !== widgetId) {
                                        reorderWidget(draggedId, widgetId);
                                    }
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.dataTransfer.dropEffect = 'move';
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setDraggedId(null);
                                }}
                                onDragEnd={() => setDraggedId(null)}
                                className={`
                                    relative group/widget
                                    ${colSpan} ${rowSpan}
                                    ${editMode ? 'cursor-move ring-2 ring-dashed ring-zinc-700 rounded-2xl hover:ring-sky-500/60 transition-all duration-300' : ''}
                                    ${editMode && draggedId === widgetId ? 'opacity-40 scale-95 ring-2 ring-dashed ring-sky-500 bg-sky-500/10 z-10' : 'z-0'}
                                    transition-all duration-500 ease-in-out
                                    animate-fade-in-up
                                `}
                                style={{
                                    animationDelay: `${index * 50}ms`,
                                    animationFillMode: 'backwards'
                                }}
                            >
                                <div className={`h-full ${editMode ? 'pointer-events-none opacity-70' : ''} transition-opacity duration-300`}>
                                    <div className="relative h-full flex flex-col">
                                        {/* Edit Overlay */}
                                        {editMode && (
                                            <div className="absolute top-4 right-4 z-50 flex items-center gap-1 bg-zinc-900/90 backdrop-blur-md rounded-lg p-1 border border-zinc-800 shadow-xl scale-100 animate-in fade-in zoom-in duration-200 pointer-events-auto">
                                                {/* Size Controls */}
                                                <div className="flex items-center gap-1 pr-2 border-r border-white/10 mr-1">
                                                    <button onClick={() => setWidgetSize(widgetId, 1, 1)} className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white" title="1x1 (Pequeno)"><div className="w-3 h-3 border border-current rounded-sm" /></button>
                                                    <button onClick={() => setWidgetSize(widgetId, 2, 1)} className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white" title="2x1 (Largo)"><div className="w-5 h-3 border border-current rounded-sm" /></button>
                                                    <button onClick={() => setWidgetSize(widgetId, 1, 2)} className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white" title="1x2 (Alto)"><div className="w-3 h-5 border border-current rounded-sm" /></button>
                                                    <button onClick={() => setWidgetSize(widgetId, 2, 2)} className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white" title="2x2 (Grande)"><div className="w-5 h-5 border border-current rounded-sm" /></button>
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); hideWidget(widgetId); }} className="p-1.5 rounded-md hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-all" title="Ocultar Widget"><EyeOff size={14} /></button>
                                            </div>
                                        )}
                                        <ErrorBoundary>
                                            {renderWidgetContent(widgetId)}
                                        </ErrorBoundary>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Widget Library (Bottom Dock - Shown when editing) */}
                <div
                    className={`fixed bottom-4 z-[9997] transition-transform duration-500 ${editMode ? 'translate-y-0' : 'translate-y-[200%]'}`}
                    style={{
                        left: `${larguraSidebar + 20}px`,
                        right: '20px'
                    }}
                >
                    <div className="bg-zinc-950/90 backdrop-blur-xl border border-zinc-800/60 rounded-2xl px-6 py-4 shadow-2xl shadow-black/50 min-w-[600px] max-w-[90vw] mx-auto">
                        <div className="flex items-center gap-4 mb-4">
                            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
                                Galeria de Widgets
                            </h3>

                            {/* Bulk Operations */}
                            <div className="flex items-center gap-2 ml-auto">
                                <button
                                    onClick={showAll}
                                    disabled={hidden.length === 0}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Mostrar todos os widgets"
                                >
                                    <Eye size={14} />
                                    Mostrar Todos
                                </button>
                                <button
                                    onClick={hideAll}
                                    disabled={layout.length === 0}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Ocultar todos os widgets"
                                >
                                    <EyeOff size={14} />
                                    Ocultar Todos
                                </button>
                            </div>
                        </div>

                        {hidden.length === 0 ? (
                            <div className="flex-1 text-center py-2 text-zinc-600 text-sm font-medium italic">
                                Todos os widgets estão ativos
                            </div>
                        ) : (
                            <div className={`flex items-center gap-3 py-2 ${hidden.length > 3 ? 'overflow-x-auto custom-scrollbar' : ''}`}>
                                {hidden.map(id => (
                                    <button
                                        key={id}
                                        onClick={() => showWidget(id)}
                                        className="group relative flex items-center gap-3 pl-3 pr-4 py-2 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 rounded-xl border border-zinc-700/50 hover:border-zinc-600 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                                        <span className="font-medium">{widgetNames[id] || id}</span>
                                        <Plus size={16} className="text-zinc-500 group-hover:text-emerald-500 transition-colors ml-1" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ManagementLayout>
    );
}

