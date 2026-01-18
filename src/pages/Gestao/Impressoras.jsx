import React, { useState, useEffect, useMemo, useDeferredValue } from "react";
import { Printer, ChevronDown, X, PackageSearch, Database, Plus, Search, LayoutGrid, List, AlertTriangle, Trash2, Scan } from "lucide-react";
import { formatDecimal } from "../../utils/numbers";


// --- LAYOUT E INTERFACE GLOBAL ---
import ManagementLayout from "../../layouts/ManagementLayout";
import PageHeader from "../../components/ui/PageHeader";
import Modal from "../../components/ui/Modal"; // Componente Unificado
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import ConfirmModal from "../../components/ui/ConfirmModal";

// --- COMPONENTES DA FUNCIONALIDADE ---
import PrinterCard from "../../features/impressoras/components/CardsImpressoras";
import PrinterModal from "../../features/impressoras/components/ModalImpressora";
import DiagnosticsModal from "../../features/impressoras/components/ModalDiagnostico";
import StatusImpressoras from "../../features/impressoras/components/StatusImpressoras";
import { useToastStore } from "../../stores/toastStore";

// --- LÓGICA E STORE (ARMAZENAMENTO) ---
import { usePrinterStore } from "../../features/impressoras/logic/printer";

const CONFIG_SIDEBAR = { RECOLHIDA: 68, EXPANDIDA: 256 };

const SessaoImpressoras = ({ titulo, items, acoes }) => {
    const [estaAberto, setEstaAberto] = useState(true);

    const totalHorasGrupo = useMemo(() =>
        items.reduce((acumulador, imp) => acumulador + Number(imp.horas_totais || 0), 0),
        [items]);

    return (
        <section className="space-y-8">
            <div className="flex flex-wrap items-center gap-6 group">
                <button onClick={() => setEstaAberto(!estaAberto)} className="flex items-center gap-5 hover:opacity-90 transition-all duration-200 focus:outline-none">
                    <div className={`p-2.5 rounded-xl border transition-all duration-300 ${estaAberto ? 'bg-zinc-950/40 border-zinc-800 text-emerald-400 shadow-inner' : 'bg-zinc-950 border-zinc-900 text-zinc-600'}`}>
                        <Printer size={18} strokeWidth={2} />
                    </div>

                    <div className="flex flex-col items-start text-left">
                        <div className="flex items-center gap-3">
                            <h2 className="text-zinc-50 text-base font-bold uppercase tracking-widest leading-none">
                                {titulo}
                            </h2>
                            <ChevronDown
                                size={16}
                                className={`text-zinc-600 transition-transform duration-300 ease-out ${!estaAberto ? "-rotate-90" : ""}`}
                            />
                        </div>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase mt-1.5 tracking-widest">
                            Linha de Produção Ativa
                        </span>
                    </div>
                </button>

                <div className="h-px flex-1 bg-zinc-900/50/40 mx-2" />

                <div className="flex items-center gap-6 px-5 py-2 rounded-2xl bg-zinc-950/40/40 border border-zinc-800/50 backdrop-blur-md">
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase mb-1 tracking-widest">Horas Acumuladas</span>
                        <span className="text-sm font-bold font-mono text-emerald-400 leading-none">
                            {formatDecimal(totalHorasGrupo, 0)}<span className="text-[10px] ml-1 font-sans text-emerald-600/70">h</span>
                        </span>
                    </div>
                    <div className="w-px h-6 bg-zinc-900/50/60" />
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase mb-1 tracking-widest">Hardware</span>
                        <span className="text-sm font-bold font-mono text-zinc-200 leading-none">
                            {String(items.length).padStart(2, '0')}
                        </span>
                    </div>
                </div>
            </div>

            {estaAberto && (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,380px),1fr))] gap-6 animate-in fade-in slide-in-from-top-2 duration-500">
                    {items.map((imp) => (
                        <PrinterCard
                            key={imp.id}
                            printer={imp}
                            onEdit={acoes.onEdit}
                            onDelete={acoes.onDelete}
                            onResetMaint={() => acoes.onResetMaint(imp)}
                            onToggleStatus={acoes.onToggleStatus}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default function ImpressorasPage() {
    const { printers, fetchPrinters, upsertPrinter, removePrinter, updatePrinterStatus, loading } = usePrinterStore();
    const [busca, setBusca] = useState("");
    const buscaDiferida = useDeferredValue(busca);

    // Estados de Modais e Popups
    const [modalAberto, setModalAberto] = useState(false);
    const [itemParaEdicao, setItemParaEdicao] = useState(null);
    const [impressoraEmDiagnostico, setImpressoraEmDiagnostico] = useState(null);
    const [confirmacaoExclusao, setConfirmacaoExclusao] = useState({ aberta: false, item: null });

    const [checklists, setChecklists] = useState({});

    // Toast
    const { addToast } = useToastStore();


    // Wrapper para compatibilidade com cÃ³digo existente que usa setToast
    const showToast = (message, type) => {
        addToast(message, type);
    };

    useEffect(() => {
        fetchPrinters();
    }, [fetchPrinters]);

    const { gruposMapeados, estatisticas, contagemCritica } = useMemo(() => {
        const termo = buscaDiferida.toLowerCase();
        let totalPecas = 0;
        let totalFilamentoGrama = 0;
        let maquinasCriticas = 0;
        const listaOriginal = Array.isArray(printers) ? printers : [];

        const frotaFiltrada = listaOriginal.filter(p =>
            (p.nome || "").toLowerCase().includes(termo) ||
            (p.modelo || "").toLowerCase().includes(termo) ||
            (p.marca || "").toLowerCase().includes(termo)
        );

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

        return {
            gruposMapeados: agrupamento,
            contagemCritica: maquinasCriticas,
            estatisticas: { totalPrints: totalPecas, filamento: formatDecimal(totalFilamentoGrama / 1000, 2) }
        };
    }, [printers, buscaDiferida]);

    const aoSalvar = async (dados) => {
        try {
            await upsertPrinter(dados);
            setModalAberto(false);
            showToast("Hardware sincronizado com sucesso!", 'success');
        } catch (_erro) {
            showToast("Erro ao salvar hardware.", 'error');
        }
    };

    const aoConfirmarExclusao = async () => {
        const { item } = confirmacaoExclusao;
        if (!item) return;
        try {
            await removePrinter(item.id);
            showToast("Impressora removida da frota.", 'success');
        } catch (_erro) {
            showToast("Erro ao excluir impressora.", 'error');
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
            variant="primary"
            icon={Plus}
        >
            Nova
        </Button>
    );

    return (
        <ManagementLayout>
            <div className="p-8 xl:p-12 max-w-[1600px] mx-auto w-full space-y-8 animate-in fade-in duration-500">
                <PageHeader
                    title="Minhas Impressoras"
                    subtitle="Gestão de Máquinas"
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

                    {Object.entries(gruposMapeados).length > 0 ? (
                        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                            {Object.entries(gruposMapeados).map(([fabricante, lista]) => (
                                <SessaoImpressoras
                                    key={fabricante}
                                    titulo={fabricante}
                                    items={lista}
                                    acoes={{
                                        onEdit: (p) => { setItemParaEdicao(p); setModalAberto(true); },
                                        onDelete: (id) => setConfirmacaoExclusao({ aberta: true, item: printers.find(p => p.id === id) }),
                                        onResetMaint: (p) => setImpressoraEmDiagnostico(p),
                                        onToggleStatus: updatePrinterStatus
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        !loading && (
                            <EmptyState
                                title="Nenhuma impressora na frota"
                                description="Adicione sua primeira máquina para começar o monitoramento."
                                icon={Scan}
                            />
                        )
                    )}
                </div>

                {/* MODAIS DE NEGOCIO */}
                <PrinterModal aberto={modalAberto} aoFechar={() => { setModalAberto(false); setItemParaEdicao(null); }} aoSalvar={aoSalvar} dadosIniciais={itemParaEdicao} />

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
            </div>
        </ManagementLayout>
    );
}

