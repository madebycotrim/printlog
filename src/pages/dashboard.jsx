import React, { useState, useEffect, useCallback } from 'react';
import { formatCurrency, formatDecimal } from '../utils/numbers';
import { Calendar, Clock, Package, Printer, BadgeDollarSign, FolderOpen, ArrowRight } from 'lucide-react';
// ... imports


// import { useLocation } from 'wouter'; // Not needed here anymore
// Removing parseGCode and Upload import
import MainSidebar from '../layouts/mainSidebar';
import { useDashboardData } from '../features/dashboard/hooks/useDashboardData';
import FinancialSummaryWidget from '../features/dashboard/components/FinancialSummaryWidget';
import AlertsWidget from '../features/dashboard/components/AlertsWidget';
import FailureWidget from '../features/dashboard/components/FailureWidget'; // Import Widget
import GCodeImportWidget from '../features/dashboard/components/GCodeImportWidget'; // Import Widget
import QuickActionsButton from '../features/dashboard/components/QuickActionsButton';
import axios from 'axios'; // Import axios

// Importar modais para ações rápidas
import ModalFilamento from '../features/filamentos/components/modalFilamento';
import ModalImpressora from '../features/impressoras/components/modalImpressora';
import { useFilamentStore } from '../features/filamentos/logic/filaments';
import { usePrinterStore } from '../features/impressoras/logic/printer';
import { useProjectsStore } from '../features/projetos/logic/projects';

export default function Dashboard() {
    const [larguraSidebar, setLarguraSidebar] = useState(68);
    const [currentTime, setCurrentTime] = useState(new Date());
    // Removed isDragging, setLocation (is dragging logic moved to widget)

    // Estados para modais de ações rápidas
    const [modalFilamento, setModalFilamento] = useState(false);
    const [modalImpressora, setModalImpressora] = useState(false);

    // Dados do dashboard
    const {
        alerts,
        filamentFinancials,
        printerStats,
        criticalAlertsCount,
        loading,
        failureStats, // Get stats
        fetchFailures // Get refresh function
    } = useDashboardData();

    const { saveFilament } = useFilamentStore();
    const { savePrinter } = usePrinterStore();

    // Atualizar relógio
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Atualizar a cada minuto

        return () => clearInterval(timer);
    }, []);

    // Handler para ações rápidas
    const handleQuickAction = useCallback((action) => {
        switch (action) {
            case 'add-filament':
                setModalFilamento(true);
                break;
            case 'add-printer':
                setModalImpressora(true);
                break;
            case 'upload-gcode':
                document.getElementById('hidden-gcode-input')?.click();
                break;
            default:
                break;
        }
    }, []);

    // Salvar filamento
    const handleSaveFilament = async (data) => {
        try {
            await saveFilament(data);
            setModalFilamento(false);
        } catch (error) {
            console.error('Erro ao salvar filamento:', error);
        }
    };

    // Salvar impressora
    const handleSavePrinter = async (data) => {
        try {
            await savePrinter(data);
            setModalImpressora(false);
        } catch (error) {
            console.error('Erro ao salvar impressora:', error);
        }
    };

    // Formatar data
    const formatDate = (date) => {
        return new Intl.DateTimeFormat('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    };

    // Formatar hora
    const formatTime = (date) => {
        return new Intl.DateTimeFormat('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    // Registrar Falha
    const handleRegisterFailure = async (data) => {
        await axios.post('/api/failures', data);
        await fetchFailures(); // Refresh stats
        await fetchHistory(); // Refresh history if needed
    };

    // Dados de Projetos (Reais)

    // Dados de Projetos (Reais)
    const { projects, fetchHistory } = useProjectsStore();

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    // --- DRAG & DROP REMOVED (Moved to Widget) ---

    return (
        <div className="flex h-screen w-full bg-zinc-950 text-zinc-200 font-sans antialiased overflow-hidden">
            {/* Hidden inputs removed */}

            <MainSidebar onCollapseChange={(collapsed) => setLarguraSidebar(collapsed ? 68 : 256)} />

            <main
                className="flex-1 flex flex-col relative overflow-y-auto custom-scrollbar"
                style={{ marginLeft: `${larguraSidebar}px` }}
            >
                {/* Fundo Decorativo */}
                <div className="absolute inset-x-0 top-0 h-[600px] z-0 pointer-events-none overflow-hidden select-none">
                    <div className="absolute inset-0 opacity-[0.08]" style={{
                        backgroundImage: `linear-gradient(to right, #52525b 1px, transparent 1px), linear-gradient(to bottom, #52525b 1px, transparent 1px)`,
                        backgroundSize: '50px 50px',
                        maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent)'
                    }} />

                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1600px] h-full">
                        <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-sky-500/30 via-transparent to-transparent" />
                    </div>
                </div>

                {/* Conteúdo Principal */}
                <div className="relative z-10 p-8 xl:p-12 max-w-[1600px] mx-auto w-full">
                    {/* Header do Dashboard */}
                    <div className="mb-12 animate-fade-in-up">
                        <div className="flex items-start justify-between flex-wrap gap-4">
                            <div>
                                <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                                    Dashboard
                                </h1>
                                <p className="text-sm text-zinc-500 capitalize">
                                    {formatDate(currentTime)}
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Hora Atual */}
                                <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
                                    <Clock size={18} className="text-sky-500" />
                                    <span className="text-2xl font-mono font-bold text-zinc-100 tabular-nums">
                                        {formatTime(currentTime)}
                                    </span>
                                </div>

                                {/* Badge de Alertas Críticos */}
                                {criticalAlertsCount > 0 && (
                                    <div className="flex items-center gap-2 px-4 py-3 bg-rose-500/10 border border-rose-500/30 rounded-xl animate-pulse">
                                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                                        <span className="text-sm font-bold text-rose-400">
                                            {criticalAlertsCount} {criticalAlertsCount === 1 ? 'alerta crítico' : 'alertas críticos'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Grid de Widgets */}
                    <div className="space-y-8">
                        {/* Linha 1: Resumo Financeiro + Alertas */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                            <FinancialSummaryWidget
                                projects={projects}
                                className="lg:col-span-2"
                            />
                            <AlertsWidget
                                alerts={alerts}
                            />
                        </div>

                        {/* Linha 2: Stats Cards (4 Columns) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            {/* Card de Filamentos */}
                            <div className="bg-zinc-950/40 border border-zinc-800/50 rounded-2xl p-6 hover-lift group">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                                        Inventário
                                    </h3>
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Package size={20} className="text-emerald-400" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-zinc-600 mb-1">Materiais</p>
                                        <p className="text-2xl font-mono font-black text-zinc-100">
                                            {filamentFinancials.materialCount}
                                        </p>
                                    </div>
                                    <div className="pt-3 border-t border-zinc-800/50">
                                        <p className="text-xs text-zinc-600 mb-1">Peso Total</p>
                                        <p className="text-xl font-mono font-bold text-emerald-400">
                                            {formatDecimal(filamentFinancials.totalWeight, 2)} kg
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Card de Impressoras */}
                            <div className="bg-zinc-950/40 border border-zinc-800/50 rounded-2xl p-6 hover-lift group">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                                        Impressoras
                                    </h3>
                                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Printer size={20} className="text-sky-400" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-3xl font-mono font-black text-sky-400">
                                            {printerStats.active}
                                        </p>
                                        <p className="text-sm text-zinc-600">/ {printerStats.total} ativas</p>
                                    </div>
                                    {printerStats.error > 0 ? (
                                        <div className="px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                                            <p className="text-xs font-bold text-rose-400">
                                                {printerStats.error} com erro
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="pt-3 border-t border-zinc-800/50">
                                            <p className="text-xs text-zinc-500">Todas operacionais</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card de Valor do Inventário */}
                            <div className="bg-zinc-950/40 border border-zinc-800/50 rounded-2xl p-6 hover-lift group">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                                        Valor Estoque
                                    </h3>
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <BadgeDollarSign size={20} className="text-amber-400" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-2xl font-mono font-black text-amber-400">
                                        {formatCurrency(filamentFinancials.totalValue)}
                                    </p>
                                    <p className="text-xs text-zinc-600 mt-2">
                                        Valor total em materiais
                                    </p>
                                </div>
                            </div>

                            {/* Card de Projetos (Novo) */}
                            <div className="bg-zinc-950/40 border border-zinc-800/50 rounded-2xl p-6 hover-lift group">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                                        Projetos
                                    </h3>
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <FolderOpen size={20} className="text-purple-400" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-3xl font-mono font-black text-purple-400">
                                        {projects?.length || 0}
                                    </p>
                                    <p className="text-xs text-zinc-600 mt-2">
                                        Orçamentos criados
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Linha 3: Atividade Recente + G-Code Import */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                            {/* Lista de Projetos Recentes */}
                            <div className="lg:col-span-2 bg-zinc-950/40 border border-zinc-800/50 rounded-2xl p-6 flex flex-col">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                                        <FolderOpen size={14} /> Recentes
                                    </h3>
                                    <a href="/calculadora" className="text-[10px] font-bold text-sky-500 hover:text-sky-400 uppercase tracking-wider flex items-center gap-1">
                                        Ver Todos <ArrowRight size={12} />
                                    </a>
                                </div>

                                <div className="flex-1 space-y-3">
                                    {projects && projects.length > 0 ? (
                                        projects.slice(0, 4).map(proj => (
                                            <div key={proj.id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center font-black text-xs text-zinc-600 group-hover:text-zinc-400 group-hover:border-zinc-600 transition-colors">
                                                        #{String(proj.id).slice(0, 3)}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-zinc-200 group-hover:text-sky-400 transition-colors">{proj.label}</h4>
                                                        <p className="text-[10px] text-zinc-600 uppercase tracking-wider">{new Date(proj.created_at || Date.now()).toLocaleDateString('pt-BR')}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <span className="block text-xs font-mono font-bold text-emerald-500">
                                                            {formatCurrency(proj.resultados?.precoFinal || 0)}
                                                        </span>
                                                        <span className="block text-[9px] text-zinc-600 uppercase">Valor Final</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-50 py-10">
                                            <FolderOpen size={32} className="mb-2" />
                                            <p className="text-xs font-bold uppercase">Nenhum projeto recente</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Widget de Importação (Lateral) */}
                            <div className="lg:col-span-1 h-full">
                                <GCodeImportWidget />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botão de Ações Rápidas */}
                <QuickActionsButton onActionClick={handleQuickAction} />

                {/* Modais */}
                <ModalFilamento
                    aberto={modalFilamento}
                    aoFechar={() => setModalFilamento(false)}
                    aoSalvar={handleSaveFilament}
                    dadosIniciais={null}
                />

                <ModalImpressora
                    aberto={modalImpressora}
                    aoFechar={() => setModalImpressora(false)}
                    aoSalvar={handleSavePrinter}
                    dadosIniciais={null}
                />
            </main>
        </div>
    );
}
