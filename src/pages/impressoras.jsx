import React, { useState, useEffect, useMemo, useDeferredValue } from "react";
import { Printer, ChevronDown, X, PackageSearch, Database, Plus, Search, LayoutGrid, List, AlertTriangle, Trash2, Scan } from "lucide-react";
import { formatDecimal } from "../utils/numbers";

// --- LAYOUT E INTERFACE GLOBAL ---
import MainSidebar from "../layouts/mainSidebar";
import Toast from "../components/Toast";
import Popup from "../components/Popup"; // Componente Unificado

// --- COMPONENTES DA FUNCIONALIDADE ---
import PrinterCard from "../features/impressoras/components/cardsImpressoras";
import PrinterModal from "../features/impressoras/components/modalImpressora";
import DiagnosticsModal from "../features/impressoras/components/modalDiagnostico";
import StatusImpressoras from "../features/impressoras/components/statusImpressoras";

// --- LÓGICA E STORE (ARMAZENAMENTO) ---
import { usePrinterStore } from "../features/impressoras/logic/printer";

const CONFIG_SIDEBAR = { RECOLHIDA: 68, EXPANDIDA: 256 };

const SessaoImpressoras = ({ titulo, items, acoes }) => {
    const [estaAberto, setEstaAberto] = useState(true);

    const totalHorasGrupo = useMemo(() =>
        items.reduce((acumulador, imp) => acumulador + Number(imp.horas_totais || 0), 0),
        [items]);

    return (
        <section className="space-y-8">
            <div className="flex items-center gap-6 group">
                <button onClick={() => setEstaAberto(!estaAberto)} className="flex items-center gap-5 hover:opacity-90 transition-all duration-200 focus:outline-none">
                    <div className={`p-2.5 rounded-xl border transition-all duration-300 ${estaAberto ? 'bg-zinc-900 border-zinc-800 text-emerald-400 shadow-inner' : 'bg-zinc-950 border-zinc-900 text-zinc-600'}`}>
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

                <div className="h-px flex-1 bg-zinc-800/40 mx-2" />

                <div className="flex items-center gap-6 px-5 py-2 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md">
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase mb-1 tracking-widest">Horas Acumuladas</span>
                        <span className="text-sm font-bold font-mono text-emerald-400 leading-none">
                            {formatDecimal(totalHorasGrupo, 0)}<span className="text-[10px] ml-1 font-sans text-emerald-600/70">h</span>
                        </span>
                    </div>
                    <div className="w-px h-6 bg-zinc-800/60" />
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
    const [larguraSidebar, setLarguraSidebar] = useState(68);
    const [busca, setBusca] = useState("");
    const buscaDiferida = useDeferredValue(busca);

    // Estados de Modais e Popups
    const [modalAberto, setModalAberto] = useState(false);
    const [itemParaEdicao, setItemParaEdicao] = useState(null);
    const [impressoraEmDiagnostico, setImpressoraEmDiagnostico] = useState(null);
    const [confirmacaoExclusao, setConfirmacaoExclusao] = useState({ aberta: false, item: null });

    const [checklists, setChecklists] = useState({});
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

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
            setToast({ visible: true, message: "Hardware sincronizado com sucesso!", type: 'success' });
        } catch (_erro) {
            setToast({ visible: true, message: "Erro ao salvar hardware.", type: 'error' });
        }
    };

    const aoConfirmarExclusao = async () => {
        const { item } = confirmacaoExclusao;
        if (!item) return;
        try {
            await removePrinter(item.id);
            setToast({ visible: true, message: "Impressora removida da frota.", type: 'success' });
        } catch (_erro) {
            setToast({ visible: true, message: "Erro ao excluir impressora.", type: 'error' });
        } finally {
            setConfirmacaoExclusao({ aberta: false, item: null });
        }
    };

    const finalizarReparo = async (id) => {
        const impressora = printers.find(p => p.id === id);
        if (impressora) {
            try {
                await upsertPrinter({
                    ...impressora,
                    ultima_manutencao_hora: Number(impressora.totalHours || impressora.horas_totais || 0),
                    status: 'idle'
                });
                setChecklists(prev => {
                    const novo = { ...prev };
                    delete novo[id];
                    return novo;
                });
                setToast({ visible: true, message: "Manutenção finalizada!", type: 'success' });
            } catch (_erro) {
                setToast({ visible: true, message: "Erro ao finalizar manutenção.", type: 'error' });
            }
        }
        setImpressoraEmDiagnostico(null);
    };

    return (
        <div className="flex h-screen w-full bg-zinc-950 text-zinc-200 font-sans antialiased overflow-hidden">
            <MainSidebar onCollapseChange={(recolhida) => setLarguraSidebar(recolhida ? 68 : 256)} />

            {toast.visible && (
                <Toast {...toast} onClose={() => setToast(prev => ({ ...prev, visible: false }))} />
            )}

            <main className="flex-1 flex flex-col relative overflow-y-auto custom-scrollbar transition-all duration-300 ease-in-out" style={{ marginLeft: `${larguraSidebar}px` }}>

                {/* FUNDO DECORATIVO */}
                <div className="absolute inset-x-0 top-0 h-[600px] z-0 pointer-events-none overflow-hidden select-none">
                    <div className="absolute inset-0 opacity-[0.08]" style={{
                        backgroundImage: `linear-gradient(to right, #52525b 1px, transparent 1px), linear-gradient(to bottom, #52525b 1px, transparent 1px)`,
                        backgroundSize: '50px 50px',
                        maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent)'
                    }} />

                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1600px] h-full">
                        <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-emerald-500/30 via-transparent to-transparent" />
                    </div>
                </div>

                {/* CONTEÚDO PRINCIPAL */}
                <div className="relative z-10 p-8 xl:p-12 max-w-[1600px] mx-auto w-full">

                    {/* Header unificado (Estilo Dashboard) */}
                    <div className="mb-12 animate-fade-in-up">
                        <div className="flex items-start justify-between flex-wrap gap-4">
                            <div>
                                <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                                    Minhas Impressoras
                                </h1>
                                <p className="text-sm text-zinc-500 capitalize">
                                    Gestão de Máquinas
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Barra de Busca */}
                                <div className="relative group hidden md:block">
                                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${busca ? 'text-emerald-400' : 'text-zinc-600'}`}>
                                        <Search size={14} strokeWidth={3} />
                                    </div>
                                    <input
                                        className="
                                            w-64 bg-zinc-900/40 border border-zinc-800/50 rounded-xl py-2.5 pl-11 pr-10 
                                            text-[11px] text-zinc-200 outline-none transition-all font-bold uppercase tracking-widest 
                                            focus:border-emerald-500/50 focus:bg-zinc-900/80 focus:ring-4 focus:ring-emerald-500/10 
                                            placeholder:text-zinc-700 placeholder:text-[9px]
                                        "
                                        placeholder="BUSCAR IMPRESSORA..."
                                        value={busca}
                                        onChange={(e) => setBusca(e.target.value)}
                                    />
                                    {busca && (
                                        <button
                                            onClick={() => setBusca("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-rose-500 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                {/* Botão Nova Impressora */}
                                <button
                                    onClick={() => { setItemParaEdicao(null); setModalAberto(true); }}
                                    className="
                                        group relative h-11 px-6 overflow-hidden bg-emerald-500 hover:bg-emerald-400 
                                        rounded-xl transition-all duration-300 active:scale-95 shadow-lg shadow-emerald-900/40
                                        flex items-center gap-3 text-zinc-950
                                    "
                                >
                                    <Plus size={16} strokeWidth={3} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                                        Nova
                                    </span>
                                    {/* Brilho */}
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                </button>
                            </div>
                        </div>

                        {/* Busca Mobile */}
                        <div className="mt-4 md:hidden relative group">
                            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${busca ? 'text-emerald-400' : 'text-zinc-600'}`}>
                                <Search size={14} strokeWidth={3} />
                            </div>
                            <input
                                className="
                                    w-full bg-zinc-900/40 border border-zinc-800/50 rounded-xl py-2.5 pl-11 pr-10 
                                    text-[11px] text-zinc-200 outline-none transition-all font-bold uppercase tracking-widest 
                                    focus:border-emerald-500/50 focus:bg-zinc-900/80 focus:ring-4 focus:ring-emerald-500/10 
                                    placeholder:text-zinc-700 placeholder:text-[9px]
                                "
                                placeholder="BUSCAR IMPRESSORA..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                            />
                        </div>
                    </div>


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
                                <div className="py-24 flex flex-col items-center justify-center border border-dashed border-zinc-800/60 rounded-[3rem] bg-zinc-900/5 backdrop-blur-sm">
                                    <Scan size={48} strokeWidth={1} className="mb-4 text-zinc-700" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Nenhuma impressora na frota</p>
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* MODAIS DE NEGÓCIO */}
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
                <Popup
                    isOpen={confirmacaoExclusao.aberta}
                    onClose={() => setConfirmacaoExclusao({ aberta: false, item: null })}
                    title="Remover Hardware?"
                    subtitle="Gestão de Frota"
                    icon={AlertTriangle}
                    footer={
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => setConfirmacaoExclusao({ aberta: false, item: null })}
                                className="flex-1 h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={aoConfirmarExclusao}
                                className="flex-1 h-12 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-900/20 flex items-center justify-center gap-2"
                            >
                                <Trash2 size={16} /> Confirmar Remoção
                            </button>
                        </div>
                    }
                >
                    <div className="p-8 text-center space-y-4">
                        <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                            Você está prestes a remover a impressora <br />
                            <span className="text-zinc-100 font-bold uppercase tracking-tight">
                                "{confirmacaoExclusao.item?.nome || "Hardware"}"
                            </span>
                        </p>
                        <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                            <p className="text-[10px] text-rose-500/80 font-black uppercase tracking-widest leading-tight">
                                Atenção: Os dados de horas trabalhadas e o histórico de impressões deste hardware serão desconectados da sua conta.
                            </p>
                        </div>
                    </div>
                </Popup>

            </main>
        </div>
    );
}