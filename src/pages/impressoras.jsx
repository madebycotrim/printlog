// src/pages/impressoras.jsx
import React, { useState, useEffect, useMemo, useDeferredValue, useCallback } from "react";
import {
    Printer, ChevronDown, Loader2, Scan, Plus, Search
} from "lucide-react";

// --- LAYOUT E UI GLOBAL ---
import MainSidebar from "../layouts/mainSidebar";
import Toast from "../components/Toast";

// --- COMPONENTES DA FEATURE ---
import PrinterCard from "../features/impressoras/components/cardsImpressoras";
import PrinterModal from "../features/impressoras/components/modalImpressora";
import DiagnosticsModal from "../features/impressoras/components/modalDiagnostico";
import StatusImpressoras from "../features/impressoras/components/statusImpressoras";
import HeaderImpressoras from "../features/impressoras/components/header";

// --- LÓGICA E STORE ---
import { usePrinterStore } from "../features/impressoras/logic/printer";

const CONFIG_SIDEBAR = { RECOLHIDA: 68, EXPANDIDA: 256 };

/**
 * SUB-COMPONENTE: SESSÃO DE IMPRESSORAS (Agrupamento)
 * Gerencia a exibição de grupos de impressoras por fabricante.
 */
const SessaoImpressoras = ({ titulo, items, acoes }) => {
    const [estaAberto, setEstaAberto] = useState(true);

    // Calcula o total de horas acumuladas pelas máquinas deste grupo
    const totalHorasGrupo = useMemo(() =>
        items.reduce((acumulador, imp) => acumulador + Number(imp.horas_totais || imp.totalHours || 0), 0)
        , [items]);

    return (
        <section className="space-y-8">
            {/* HEADER DA SESSÃO */}
            <div className="flex items-center gap-6 group">
                <button
                    onClick={() => setEstaAberto(!estaAberto)}
                    className="flex items-center gap-5 hover:opacity-90 transition-all duration-200 focus:outline-none"
                >
                    <div className={`p-2.5 rounded-xl border transition-all duration-300 ${estaAberto ? 'bg-zinc-900 border-zinc-800 text-emerald-400 shadow-inner' : 'bg-zinc-950 border-zinc-900 text-zinc-600'
                        }`}>
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
                            Hardware de Impressão Ativo
                        </span>
                    </div>
                </button>

                <div className="h-px flex-1 bg-zinc-800/40 mx-2" />

                <div className="flex items-center gap-6 px-5 py-2 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md">
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase mb-1 tracking-widest">Horas do Grupo</span>
                        <span className="text-sm font-bold font-mono text-emerald-400 leading-none">
                            {totalHorasGrupo.toLocaleString('pt-BR')}<span className="text-[10px] ml-1 font-sans text-emerald-600/70">h</span>
                        </span>
                    </div>
                    <div className="w-px h-6 bg-zinc-800/60" />
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase mb-1 tracking-widest">Equipamentos</span>
                        <span className="text-sm font-bold font-mono text-zinc-200 leading-none">
                            {String(items.length).padStart(2, '0')}
                        </span>
                    </div>
                </div>
            </div>

            {/* GRID DE CARDS */}
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
    // 1. ESTADOS E STORE
    const { printers, fetchPrinters, upsertPrinter, removePrinter, updatePrinterStatus, loading } = usePrinterStore();
    const [larguraSidebar, setLarguraSidebar] = useState(CONFIG_SIDEBAR.RECOLHIDA);
    const [busca, setBusca] = useState("");
    const buscaDiferida = useDeferredValue(busca);

    const [modalAberto, setModalAberto] = useState(false);
    const [itemParaEdicao, setItemParaEdicao] = useState(null);
    const [impressoraEmDiagnostico, setImpressoraEmDiagnostico] = useState(null);
    const [checklists, setChecklists] = useState({});
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

    // 2. CARREGAMENTO INICIAL
    useEffect(() => { 
        fetchPrinters(); 
    }, [fetchPrinters]);

    // 3. PROCESSAMENTO DE DADOS (Agrupamento e Estatísticas)
    const { gruposMapeados, estatisticas, contagemCritica } = useMemo(() => {
        const termo = buscaDiferida.toLowerCase();
        let totalPecas = 0;
        let totalFilamentoGrama = 0;
        let maquinasCriticas = 0;
        const listaOriginal = Array.isArray(printers) ? printers : [];

        // Filtra a frota com base no termo de busca
        const frotaFiltrada = listaOriginal.filter(p =>
            (p.name || p.nome || "").toLowerCase().includes(termo) ||
            (p.model || p.modelo || "").toLowerCase().includes(termo) ||
            (p.brand || p.marca || "").toLowerCase().includes(termo)
        );

        // Agrupa por Fabricante e consolida métricas de uso
        const agrupamento = frotaFiltrada.reduce((acc, p) => {
            const horas = Number(p.totalHours || p.horas_totais || 0);
            const historico = Array.isArray(p.history) ? p.history : [];
            
            totalPecas += historico.length;
            totalFilamentoGrama += historico.reduce((soma, h) => soma + (Number(h.filamentUsed || h.peso_usado || 0)), 0);

            // Lógica de monitoramento de saúde
            const ultimaMaint = Number(p.lastMaintenanceHour || p.ultima_manutencao_hora || 0);
            const intervalo = Math.max(1, Number(p.maintenanceInterval || p.intervalo_manutencao || 300));
            const porcentagemSaude = ((intervalo - (horas - ultimaMaint)) / intervalo) * 100;

            if (p.status === 'maintenance' || p.status === 'error' || porcentagemSaude < 15) {
                maquinasCriticas++;
            }

            const categoria = (p.brand || p.marca || "Hardware Geral").toUpperCase();
            if (!acc[categoria]) acc[categoria] = [];
            acc[categoria].push(p);
            return acc;
        }, {});

        return {
            gruposMapeados: agrupamento,
            contagemCritica: maquinasCriticas,
            estatisticas: { 
                totalPrints: totalPecas, 
                filamento: (totalFilamentoGrama / 1000).toFixed(2) 
            }
        };
    }, [printers, buscaDiferida]);

    // 4. HANDLERS DE AÇÃO
    const aoSalvar = async (dados) => {
        try {
            await upsertPrinter(dados);
            setModalAberto(false);
            setToast({ visible: true, message: "Frota atualizada com sucesso.", type: 'success' });
        } catch (erro) {
            console.error(erro);
            setToast({ visible: true, message: "Erro ao salvar hardware.", type: 'error' });
        }
    };

    const finalizarReparo = async (id) => {
        const impressora = printers.find(p => p.id === id);
        if (impressora) {
            try {
                // Sincroniza o horímetro de manutenção com o tempo atual de voo da máquina
                await upsertPrinter({
                    ...impressora,
                    ultima_manutencao_hora: Number(impressora.totalHours || impressora.horas_totais || 0),
                    status: 'idle'
                });
                // Limpa o checklist local desta impressora
                setChecklists(prev => {
                    const novo = { ...prev };
                    delete novo[id];
                    return novo;
                });
                setToast({ visible: true, message: "Manutenção concluída e horímetro resetado.", type: 'success' });
            } catch (erro) {
                setToast({ visible: true, message: "Erro ao finalizar manutenção.", type: 'error' });
            }
        }
        setImpressoraEmDiagnostico(null);
    };

    return (
        <div className="flex h-screen w-full bg-zinc-950 text-zinc-200 font-sans antialiased overflow-hidden">
            <MainSidebar onCollapseChange={(recolhida) => setLarguraSidebar(recolhida ? CONFIG_SIDEBAR.RECOLHIDA : CONFIG_SIDEBAR.EXPANDIDA)} />

            {toast.visible && (
                <Toast {...toast} onClose={() => setToast(prev => ({ ...prev, visible: false }))} />
            )}

            <main className="flex-1 flex flex-col relative transition-all duration-300 ease-in-out" style={{ marginLeft: `${larguraSidebar}px` }}>
                {/* BACKGROUND DECORATIVO */}
                <div className="absolute inset-x-0 top-0 h-[600px] z-0 pointer-events-none overflow-hidden select-none">
                    <div className="absolute inset-0 opacity-[0.1]" style={{
                        backgroundImage: `linear-gradient(to right, #52525b 1px, transparent 1px), linear-gradient(to bottom, #52525b 1px, transparent 1px)`,
                        backgroundSize: '50px 50px',
                        maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent)'
                    }} />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1600px] h-full">
                        <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-emerald-500/30 via-transparent to-transparent" />
                    </div>
                </div>

                <HeaderImpressoras
                    busca={busca}
                    setBusca={setBusca}
                    onAddClick={() => { setItemParaEdicao(null); setModalAberto(true); }}
                />

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 xl:p-12 relative z-10 scroll-smooth">
                    <div className="max-w-[1600px] mx-auto space-y-16">

                        {/* 1. STATUS GERAL */}
                        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                            <StatusImpressoras
                                totalCount={printers.length}
                                criticalCount={contagemCritica}
                                stats={estatisticas}
                            />
                        </div>

                        {/* 2. LISTAGEM OU ESTADO VAZIO */}
                        {Object.entries(gruposMapeados).length > 0 ? (
                            <div className="space-y-24 pb-40 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                                {Object.entries(gruposMapeados).map(([fabricante, lista]) => (
                                    <SessaoImpressoras
                                        key={fabricante}
                                        titulo={fabricante}
                                        items={lista}
                                        acoes={{
                                            onEdit: (p) => { setItemParaEdicao(p); setModalAberto(true); },
                                            onDelete: (id) => removePrinter(id),
                                            onResetMaint: (p) => setImpressoraEmDiagnostico(p),
                                            onToggleStatus: updatePrinterStatus
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            !loading && (
                                <div className="py-24 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-[2rem] bg-zinc-900/10 transition-all hover:bg-zinc-900/20 animate-in fade-in slide-in-from-top-4 duration-700">
                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 bg-emerald-500/10 blur-2xl rounded-full" />
                                        <Scan size={48} strokeWidth={1.2} className="text-emerald-500/40 relative z-10" />
                                    </div>

                                    <div className="text-center">
                                        <h3 className="text-zinc-300 text-xs font-bold uppercase tracking-[0.2em]">
                                            Frota não localizada
                                        </h3>
                                        <p className="text-zinc-600 text-[10px] uppercase mt-2 tracking-widest">
                                            Cadastre um hardware para iniciar o monitoramento
                                        </p>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* MODAIS */}
                <PrinterModal
                    aberto={modalAberto}
                    aoFechar={() => { setModalAberto(false); setItemParaEdicao(null); }}
                    aoSalvar={aoSalvar}
                    dadosIniciais={itemParaEdicao}
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
            </main>
        </div>
    );
}