import React, { useState, useMemo, useDeferredValue } from "react";
import { Printer, ChevronDown, X, PackageSearch, Database, Plus, Search, LayoutGrid, List, AlertTriangle, Trash2, Scan } from "lucide-react";
import { formatDecimal } from "../../utils/numbers";


// --- LAYOUT E INTERFACE GLOBAL ---
import ManagementLayout from "../../layouts/ManagementLayout";
import PageHeader from "../../components/ui/PageHeader";
import Modal from "../../components/ui/Modal"; // Componente Unificado
import EstadoVazio from "../../components/ui/EstadoVazio";
import Button from "../../components/ui/Button";
import ConfirmModal from "../../components/ui/ConfirmModal";

// --- COMPONENTES DA FUNCIONALIDADE ---
import PrinterCard from "../../features/impressoras/components/CardsImpressora";
import PrinterModal from "../../features/impressoras/components/ModalImpressora";
import DiagnosticsModal from "../../features/impressoras/components/ModalDiagnostico";
import StatusImpressoras from "../../features/impressoras/components/StatusImpressoras";
import { useToastStore } from "../../stores/toastStore";
import FiltrosImpressora from "../../features/impressoras/components/FiltrosImpressora";
import { usePrinters, usePrinterMutations } from "../../features/impressoras/logic/consultasImpressora";

// ... (keep Layout/Header/Modal imports)

// ... (keep SessaoImpressoras definition for now, will replace later)

export default function ImpressorasPage() {
    // React Query
    const { data: printers = [], isLoading: loading } = usePrinters();
    const { upsertPrinter, removePrinter, updateStatus: updatePrinterStatus, isSaving } = usePrinterMutations();

    const [busca, setBusca] = useState("");
    const buscaDiferida = useDeferredValue(busca);

    // FILTROS E VIEW MODE
    const [viewMode, setViewMode] = useState("grid");
    const [filters, setFilters] = useState({
        status: [],
        brands: []
    });

    // Estados de Modais e Popups
    const [modalAberto, setModalAberto] = useState(false);
    const [itemParaEdicao, setItemParaEdicao] = useState(null);
    const [impressoraEmDiagnostico, setImpressoraEmDiagnostico] = useState(null);
    const [confirmacaoExclusao, setConfirmacaoExclusao] = useState({ aberta: false, item: null });

    const [checklists, setChecklists] = useState({});

    // Toast
    const { addToast } = useToastStore();
    const showToast = (message, type) => {
        addToast(message, type);
    };

    const { gruposMapeados, estatisticas, contagemCritica, availableBrands } = useMemo(() => {
        const termo = buscaDiferida.toLowerCase();
        let totalPecas = 0;
        let totalFilamentoGrama = 0;
        let maquinasCriticas = 0;
        const listaOriginal = Array.isArray(printers) ? printers : [];

        // Extract Brands
        const allBrands = [...new Set(listaOriginal.map(p => p.marca || "Geral").filter(Boolean))];

        const frotaFiltrada = listaOriginal.filter(p => {
            // Search
            const matchesSearch = (p.nome || "").toLowerCase().includes(termo) ||
                (p.modelo || "").toLowerCase().includes(termo) ||
                (p.marca || "").toLowerCase().includes(termo);

            if (!matchesSearch) return false;

            // Status Filter
            if (filters.status.length > 0 && !filters.status.includes(p.status)) return false;

            // Brand Filter
            if (filters.brands.length > 0 && !filters.brands.includes(p.marca)) return false;

            return true;
        });

        const agrupamento = frotaFiltrada.reduce((acc, p) => {
            const horas = Number(p.horas_totais || 0);
            const historico = Array.isArray(p.historico) ? p.historico : [];
            totalPecas += historico.length;
            totalFilamentoGrama += historico.reduce((soma, h) => soma + (Number(h.peso_usado || 0)), 0);

            const ultimaMaint = Number(p.ultima_manutencao_hora || 0);
            const intervalo = Math.max(1, Number(p.intervalo_manutencao || 300));
            const porcentagemSaude = ((intervalo - (horas - ultimaMaint)) / intervalo) * 100;

            if (p.status === 'maintenance' || p.status === 'error' || porcentagemSaude < 15) maquinasCriticas++;

            const categoria = (p.marca || "Impressora Geral").toUpperCase();
            if (!acc[categoria]) acc[categoria] = [];
            acc[categoria].push(p);
            return acc;
        }, {});

        // Sort groups by name
        const sortedGroups = Object.keys(agrupamento).sort().reduce((obj, key) => {
            obj[key] = agrupamento[key];
            return obj;
        }, {});

        return {
            gruposMapeados: sortedGroups,
            contagemCritica: maquinasCriticas,
            estatisticas: { totalPrints: totalPecas, filamento: formatDecimal(totalFilamentoGrama / 1000, 2) },
            availableBrands: allBrands
        };
    }, [printers, buscaDiferida, filters]);

    const aoSalvar = async (dados) => {
        try {
            await upsertPrinter(dados);
            setModalAberto(false);
        } catch (_erro) {
            // Erro tratado no hook
        }
    };

    const aoConfirmarExclusao = async () => {
        const { item } = confirmacaoExclusao;
        if (!item) return;
        try {
            await removePrinter(item.id);
        } catch (_erro) {
            // Erro tratado no hook
        } finally {
            setConfirmacaoExclusao({ aberta: false, item: null });
        }
    };

    const finalizarReparo = async (id, acoesRealizadas = []) => {
        const impressora = printers.find(p => p.id === id);
        if (impressora) {
            try {
                // Cria o registro histÃ³rico do diagnÃ³stico
                const novoHistorico = {
                    data: new Date().toISOString(),
                    descricao: acoesRealizadas.length > 0
                        ? `Diagnóstico: ${acoesRealizadas.join(', ')}`
                        : "Manutenção Preventiva de Rotina",
                    custo: 0,
                    horas_maquina: impressora.horas_totais
                };

                const historicoAtual = Array.isArray(impressora.historico) ? impressora.historico : [];

                await upsertPrinter({
                    ...impressora,
                    ultima_manutencao_hora: Number(impressora.totalHours || impressora.horas_totais || 0),
                    status: 'idle',
                    historico: [...historicoAtual, novoHistorico]
                });
                setChecklists(prev => {
                    const novo = { ...prev };
                    delete novo[id];
                    return novo;
                });
                showToast("Manutenção finalizada!", 'success');
            } catch (_erro) {
                showToast("Erro ao finalizar manutenção.", 'error');
            }
        }
        setImpressoraEmDiagnostico(null);
    };

    const novaImpressoraButton = (
        <Button
            onClick={() => { setItemParaEdicao(null); setModalAberto(true); }}
            variant="secondary"
            className="bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 border border-white/10 shadow-lg hover:shadow-xl hover:shadow-zinc-900/50 hover:border-white/20"
            icon={Plus}
            data-tour="printer-add-btn"
        >
            Nova
        </Button>
    );

    return (
        <ManagementLayout>

            <PageHeader
                title="Minhas Impressoras"
                subtitle="Gestão de Máquinas"
                accentColor="text-emerald-500"
                searchQuery={busca}
                onSearchChange={setBusca}
                placeholder="BUSCAR IMPRESSORA..."
                actionButton={novaImpressoraButton}
            />

            <div className="space-y-8">

                <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                    <StatusImpressoras
                        totalCount={printers.length}
                        criticalCount={contagemCritica}
                        stats={estatisticas}
                    />
                </div>

                {/* FILTROS */}
                <div>
                    <FiltrosImpressora
                        filters={filters}
                        setFilters={setFilters}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        availableBrands={availableBrands}
                    />
                </div>

                {Object.entries(gruposMapeados).length > 0 ? (
                    <div className="space-y-12 pb-12 animate-in fade-in slide-in-from-bottom-6 duration-1000" data-tour="printer-list">
                        {Object.entries(gruposMapeados).map(([fabricante, lista]) => (
                            <div key={fabricante} className="relative group/shelf">
                                {/* Header (Estilo VirtualRack) */}
                                <div className="flex items-baseline gap-4 mb-6 ml-2">
                                    <h2 className="text-4xl font-black text-zinc-800/50 uppercase tracking-tighter select-none absolute -top-6 -left-4 -z-10 group-hover/shelf:text-zinc-800 transition-colors duration-500">
                                        {fabricante}
                                    </h2>
                                    <div className="flex items-center gap-4 relative z-10">
                                        <span className="text-2xl font-bold text-zinc-100 tracking-tight">{fabricante}</span>
                                        <span className="px-2 py-0.5 rounded-md bg-zinc-800/50 border border-white/5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                            {lista.length} {lista.length === 1 ? 'Máquina' : 'Máquinas'}
                                        </span>
                                        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent min-w-[100px]" />
                                    </div>
                                </div>

                                {/* Lista de Cards */}
                                <div className={`grid gap-6 ${viewMode === 'list'
                                    ? 'grid-cols-1'
                                    : 'grid-cols-[repeat(auto-fill,minmax(min(100%,380px),1fr))]'
                                    }`}>
                                    {lista.map((imp) => (
                                        <PrinterCard
                                            key={imp.id}
                                            printer={imp}
                                            onEdit={(p) => { setItemParaEdicao(p); setModalAberto(true); }}
                                            onDelete={(id) => setConfirmacaoExclusao({ aberta: true, item: printers.find(p => p.id === id) })}
                                            onResetMaint={(p) => setImpressoraEmDiagnostico(p)}
                                            onToggleStatus={(id, currentStatus) => updatePrinterStatus({
                                                id,
                                                status: currentStatus === 'printing' ? 'idle' : 'printing'
                                            })}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    !loading && (
                        <EstadoVazio
                            title="Nenhuma impressora na frota"
                            description="Adicione sua primeira máquina para começar o monitoramento."
                            icon={Scan}
                        />
                    )
                )}
            </div>

            {/* MODAIS DE NEGOCIO */}
            <PrinterModal
                aberto={modalAberto}
                aoFechar={() => { setModalAberto(false); setItemParaEdicao(null); }}
                aoSalvar={aoSalvar}
                dadosIniciais={itemParaEdicao}
                isSaving={isSaving}
            />

            {impressoraEmDiagnostico && (
                <DiagnosticsModal
                    printer={impressoraEmDiagnostico}
                    completedTasks={new Set(checklists[impressoraEmDiagnostico.id] || [])}
                    onToggleTask={(label) => {
                        setChecklists(prev => {
                            const atual = new Set(prev[impressoraEmDiagnostico.id] || []);
                            if (atual.has(label)) atual.delete(label); else atual.add(label);
                            return { ...prev, [impressoraEmDiagnostico.id]: Array.from(atual) };
                        });
                    }}
                    onClose={() => setImpressoraEmDiagnostico(null)}
                    onResolve={finalizarReparo}
                />
            )}

            {/* POPUP DE CONFIRMAÇÃO DE EXCLUSÃO (UNIFICADO) */}
            <ConfirmModal
                isOpen={confirmacaoExclusao.aberta}
                onClose={() => setConfirmacaoExclusao({ aberta: false, item: null })}
                onConfirm={aoConfirmarExclusao}
                title="Remover Hardware?"
                message={
                    <span>
                        Você está prestes a remover a impressora <br />
                        <span className="text-zinc-100 font-bold uppercase tracking-tight">
                            "{confirmacaoExclusao.item?.nome || "Hardware"}"
                        </span>
                    </span>
                }
                description="Atenção: Os dados de horas trabalhadas e o histórico de impressões deste hardware serão desconectados da sua conta."
                confirmText="Confirmar Remoção"
                isDestructive
            />

        </ManagementLayout>
    );
}


