import React, { useState, useEffect, useCallback } from 'react';
import { Activity, LayoutGrid, RotateCcw, EyeOff, Eye, Plus, Check, Box, Printer, Package, Calculator, Layers, Search, Command, PenTool, FileDown } from 'lucide-react';
import ManagementLayout from '../../layouts/ManagementLayout';
import SeletorIntervaloData from '../../components/SeletorIntervaloData';
import { exportDashboardToPDF, exportToExcel } from '../../utils/exportDashboard';
import { useFilteredByDate } from '../../stores/dateRangeStore';
import { useDashboardData } from '../../features/dashboard/hooks/useDashboardData';
import FinancialSummaryWidget from '../../features/dashboard/components/FinancialSummaryWidget';
import FleetSummaryWidget from '../../features/dashboard/components/FleetSummaryWidget';
import AlertsWidget from '../../features/dashboard/components/AlertsWidget';
import RecentProjectsWidget from '../../features/dashboard/components/RecentProjectsWidget';
import TodoWidget from '../../features/dashboard/components/TodoWidget';
import HighlightsWidget from '../../features/dashboard/components/HighlightsWidget';
import ActivityFeedWidget from '../../features/dashboard/components/ActivityFeedWidget';
import PerformanceMetricsWidget from '../../features/dashboard/components/PerformanceMetricsWidget';
import MaterialStatsWidget from '../../features/dashboard/components/MaterialStatsWidget';
import LivePrinterStatusWidget from '../../features/dashboard/components/LivePrinterStatusWidget';
import RevenueChartWidget from '../../features/dashboard/components/RevenueChartWidget';
import CostDistributionWidget from '../../features/dashboard/components/CostDistributionWidget';
import SmartSuggestionsWidget from '../../features/dashboard/components/SmartSuggestionsWidget';

import { useToastStore } from '../../stores/toastStore';
import { useSidebarStore } from '../../stores/sidebarStore';

import EstadoVazio from '../../components/ui/EstadoVazio';

// Error handling
import LimiteErro from '../../components/LimiteErro';

// Importar modais para aes rpidas
import { useFilamentos, useMutacoesFilamento } from '../../features/filamentos/logic/consultasFilamento';
import { usePrinters, usePrinterMutations } from '../../features/impressoras/logic/consultasImpressora';
import { useProjectsStore } from '../../features/projetos/logic/projetos';
import { useLocation } from 'wouter';
import { useDashboardLayoutStore } from '../../features/dashboard/logic/layout';
import ModalFilamento from '../../features/filamentos/components/ModalFilamento';
import ModalImpressora from '../../features/impressoras/components/ModalImpressora';

import ModalInsumo from '../../features/insumos/components/ModalInsumo';
import { useDragDrop } from '../../hooks/useDragDrop';
import { useTransferStore } from '../../stores/transferStore';

const widgetNames = {
    financial: 'Resumo Financeiro',
    fleet_summary: 'Resumo da Frota',
    alerts: 'Alertas',
    todo: 'Lista de Tarefas',
    highlights: 'Destaques',
    recent_projects: 'Projetos Recentes',
    activity_feed: 'Atividades',
    performance: 'Performance',
    material_stats: 'Estoque de Materiais',
    live_printers: 'Status ao Vivo',
    revenue_chart: 'Evolu��o Financeira',
    cost_distribution: 'Distribui��o de Custos',
    smart_suggestions: 'O que Fazer Agora'
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
        addToast('Layout restaurado para o padr�o.', 'success');
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

    // Estados para modais de a��es r�pidas

    // Sidebar width for positioning
    const { width: larguraSidebar } = useSidebarStore(); // Added this line

    const [, setLocation] = useLocation();

    // Dados do dashboard
    const {
        criticalAlertsCount
    } = useDashboardData();

    const { data: filamentos = [] } = useFilamentos();
    const { data: printers = [] } = usePrinters();
    const { projects, fetchHistory, updateProjectStatus } = useProjectsStore();

    // Filter projects by selected date range
    const filteredProjects = useFilteredByDate(projects, 'created_at');

    // Export handler using Filtered Data
    const handleExport = (format) => {
        const stats = {
            receitaTotal: filteredProjects.reduce((sum, p) => sum + Number(p.resultados?.precoFinal || 0), 0),
            custoTotal: filteredProjects.reduce((sum, p) => sum + Number(p.data?.custo_total || 0), 0),
            lucroTotal: filteredProjects.reduce((sum, p) => sum + (Number(p.resultados?.precoFinal || 0) - Number(p.data?.custo_total || 0)), 0)
        };

        if (format === 'pdf') {
            exportDashboardToPDF({ projects: filteredProjects, printers, filamentos, stats });
            addToast('Exportando Dashboard em PDF...', 'success');
        } else if (format === 'excel') {
            exportToExcel({ projects: filteredProjects });
            addToast('Exportando dados para Excel...', 'success');
        }
    };

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
        setLocation(`/calculadora?load=${proj.id}`);
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
                content = <FinancialSummaryWidget projects={filteredProjects} />;
                break;
            case 'fleet_summary':
                content = <FleetSummaryWidget printers={printers} />;
                break;
            case 'alerts':
                content = <AlertsWidget filamentos={filamentos} printers={printers} projects={filteredProjects} />;
                break;
            case 'recent_projects':
                content = <RecentProjectsWidget projects={filteredProjects?.filter(p => p.data?.status !== 'finalizado') || []} onDuplicate={handleDuplicateProject} onConclude={handleConcludeProject} />;
                break;
            case 'todo':
                content = <TodoWidget />;
                break;
            case 'highlights':
                content = <HighlightsWidget projects={filteredProjects} printers={printers} />;
                break;
            case 'activity_feed':
                content = <ActivityFeedWidget />;
                break;
            case 'performance':
                content = <PerformanceMetricsWidget projects={filteredProjects} />;
                break;
            case 'material_stats':
                content = <MaterialStatsWidget filamentos={filamentos} />;
                break;
            case 'live_printers':
                content = <LivePrinterStatusWidget printers={printers} />;
                break;
            case 'revenue_chart':
                content = <RevenueChartWidget projects={filteredProjects} />;
                break;
            case 'cost_distribution':
                content = <CostDistributionWidget projects={filteredProjects} />;
                break;
            case 'smart_suggestions':
                content = <SmartSuggestionsWidget filamentos={filamentos} printers={printers} projects={filteredProjects} />;
                break;
            default:
                content = null;
        }
        return (
            <LimiteErro
                key={id}
                title={`Erro: ${widgetNames[id] || 'Widget'}`}
                message="Falha ao renderizar este componente."
            >
                {content}
            </LimiteErro>
        );
    };

    const [isFilamentModalOpen, setFilamentModalOpen] = useState(false);
    const [isPrinterModalOpen, setPrinterModalOpen] = useState(false);
    const [isSupplyModalOpen, setSupplyModalOpen] = useState(false);

    const { salvarFilamento } = useMutacoesFilamento();
    const { upsertPrinter } = usePrinterMutations();

    // Handlers para salvar
    const handlesalvarFilamento = async (data) => {
        return await salvarFilamento(data);
        // Modal fecha automaticamente pelo sucesso ou manualmente
        // mas aqui vamos garantir o estado
        if (!data.id) setFilamentModalOpen(false);
    };

    const handleSavePrinter = async (data) => {
        await upsertPrinter(data);
        if (!data.id) setPrinterModalOpen(false);
    };

    // --- DRAG & DROP PARA REDIRECIOMENTO ---


    const { isDragging, dragHandlers } = useDragDrop((file) => {
        addToast("Redirecionando para Calculadora...", "success");
        // Salva o arquivo no store para ser recuperado na calculadora
        useTransferStore.getState().setPendingFile(file);
        setLocation("/calculadora");
    });

    return (
        <div
            {...dragHandlers}
            className="flex h-screen bg-zinc-950 text-zinc-200 font-sans antialiased overflow-hidden relative"
        >
            {/* OVERLAY DE DRAG & DROP DASHBOARD */}
            <div className={`
                absolute inset-0 z-[9999] bg-zinc-950/80 backdrop-blur-md flex items-center justify-center 
                transition-all duration-300 pointer-events-none
                ${isDragging ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
            `}>
                <div className={`
                     flex flex-col items-center gap-6 p-12 
                     border-4 border-dashed border-sky-500/50 bg-sky-500/5 
                     rounded-[3rem] shadow-2xl shadow-sky-500/10 
                     transition-all duration-500
                     ${isDragging ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
                `}>
                    <div className="relative">
                        <div className="absolute inset-0 bg-sky-500 blur-2xl opacity-20 animate-pulse" />
                        <Calculator size={80} className="text-sky-400 relative z-10 animate-bounce" />
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Analisar Arquivo</h2>
                        <p className="text-sm font-bold text-sky-400 uppercase tracking-[0.2em]">Solte para ir � Calculadora</p>
                    </div>
                </div>
            </div>

            <ManagementLayout>


                {/* HEADER */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 shrink-0" data-tour="dashboard-overview">
                    <div className="flex items-center gap-4">
                        {/* Section Accent Line */}
                        <div className="text-sky-500 self-stretch flex items-center">
                            <div className="w-1.5 h-12 rounded-full bg-current shadow-[0_0_15px_currentColor] opacity-80" />
                        </div>

                        <div className="flex flex-col gap-1">
                            <h1 className="text-3xl font-black text-zinc-100 tracking-tight">
                                Dashboard
                            </h1>
                            <p className="text-sm text-zinc-500 font-medium tracking-wide">
                                Visão geral da sua operação
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* DATE RANGE SELECTOR */}
                        <SeletorIntervaloData />

                        {/* EXPORT BUTTON */}
                        <div className="relative group">
                            <button className="h-10 px-4 rounded-xl flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-all">
                                <FileDown size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-wider hidden md:inline">Exportar</span>
                            </button>
                            <div className="absolute top-full right-0 mt-2 w-40 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                <button onClick={() => handleExport('pdf')} className="w-full px-4 py-2.5 text-left text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">Exportar PDF</button>
                                <button onClick={() => handleExport('excel')} className="w-full px-4 py-2.5 text-left text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">Exportar Excel</button>
                            </div>
                        </div>

                        {/* BOT�O GLOBAL SEARCH - NOVA ADI��O */}
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
                        {/* BOT�O TOGGLE EDIT */}
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
                            {editMode ? "Concluir Edi��o" : "Editar Layout"}
                        </button>

                        {/* MENU DE WIDGETS (Vis�vel apenas em modo de edi��o) */}
                        <div className={`
                            overflow-hidden transition-all duration-300 flex items-center gap-2
                            ${editMode ? 'w-auto opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-4 pointer-events-none'}
                        `}>
                            <button
                                onClick={resetLayout}
                                className="h-10 px-4 bg-zinc-900/50 border border-zinc-800 hover:border-rose-500/50 text-zinc-400 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap"
                                title="Resetar Layout para o padr�o"
                            >
                                <RotateCcw size={14} />
                                Resetar Padr�o
                            </button>
                        </div>
                    </div>
                </header>

                {/* MODAIS A��ES R�PIDAS */}
                <ModalFilamento aberto={isFilamentModalOpen} aoFechar={() => setFilamentModalOpen(false)} aoSalvar={handlesalvarFilamento} />
                <ModalImpressora aberto={isPrinterModalOpen} aoFechar={() => setPrinterModalOpen(false)} aoSalvar={handleSavePrinter} />
                <ModalInsumo isOpen={isSupplyModalOpen} onClose={() => setSupplyModalOpen(false)} />

                {/* Empty State when all hidden */}
                {layout.length === 0 && (
                    <EstadoVazio
                        icon={LayoutGrid}
                        title="Seu Dashboard está vazio"
                        description="Todos os widgets foram ocultados. Use a barra abaixo para adicionar widgets ao seu painel."
                        action={!editMode && (
                            <button
                                onClick={toggleEditMode}
                                className="flex items-center gap-2 px-6 py-3 bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 border border-sky-500/20 hover:border-sky-500/30 rounded-xl font-bold uppercase tracking-wider text-xs transition-all"
                            >
                                <LayoutGrid size={16} />
                                Personalizar Dashboard
                            </button>
                        )}
                    />
                )}

                {/* GRID DASHBOARD */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-32 auto-rows-[minmax(200px,auto)]" style={{ gridAutoFlow: 'dense' }} data-tour="dashboard-widgets">
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
                                        <LimiteErro title="Erro no Renderizador">
                                            {renderWidgetContent(widgetId)}
                                        </LimiteErro>
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
                                Todos os widgets est�o ativos
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

            </ManagementLayout>
        </div>
    );
}




