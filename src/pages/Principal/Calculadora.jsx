import React, { useEffect, useMemo, useState, useRef } from "react";
import {
    CheckCircle2, AlertTriangle, AlertCircle,
    Settings2, BarChart3,
    Cloud, CloudOff, Loader2
} from "lucide-react";

// Layout e Componentes Universais
import ManagementLayout from "../../layouts/ManagementLayout.jsx";
import Modal from "../../components/ui/Modal";
import WrapperCard from "../../components/ui/WrapperCard"; // Importado

// Componentes de Feature
import HeaderCalculadora from "../../features/calculadora/components/HeaderCalculadora.jsx";
import Summary from "../../features/calculadora/components/Resumo.jsx";
import HistoryDrawer from "../../features/calculadora/components/Historico.jsx";
import PainelConfiguracoesCalculo from "../../features/calculadora/components/ConfigCalculo.jsx";
import ModalRegistrarFalha from "../../features/filamentos/components/ModalRegistrarFalha.jsx";
import OverlayArrastarSoltar from "../../features/calculadora/components/OverlayArrastarSoltar.jsx";
import ModalTaxas from "../../features/calculadora/components/ModalTaxas.jsx"; // Importado

// Cards de Entrada
import CardMaterial from "../../features/calculadora/components/cards/materiaPrima.jsx";
import CardTempo from "../../features/calculadora/components/cards/tempo.jsx";
import CardCanal from "../../features/calculadora/components/cards/taxasVenda.jsx";
import CardEmbalagem from "../../features/calculadora/components/cards/custos.jsx";
import CardPreco from "../../features/calculadora/components/cards/lucroDescontos.jsx";

// L�gica e Armazenamento
import { calcularTudo } from "../../features/calculadora/logic/calculadora";
import { useSettings } from "../../features/sistema/logic/settingsQueries";
import { usePrinters } from "../../features/impressoras/logic/consultasImpressora";
import { useProjectsStore } from "../../features/projetos/logic/projetos.js";
import { useClientStore } from "../../features/clientes/logic/clientes.js";

import { useToastStore } from "../../stores/toastStore";
import { useCalculatorStore } from "../../stores/calculatorStore"; // Novo Store
// import { analisarArquivoProjeto } from "../../utils/projectParser"; // Removed
import { useProcessadorArquivo } from "../../features/calculadora/hooks/useProcessadorArquivo"; // Imported
import { useDragDrop } from "../../hooks/useDragDrop";
import { useTransferStore } from "../../stores/transferStore";
import { formatCurrency } from "../../utils/numbers";
import { useAutoSave } from "../../hooks/useAutoSave";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";

/* ---------- COMPONENTE PRINCIPAL DA P�GINA ---------- */
export default function CalculadoraPage() {
    const { addToast } = useToastStore();
    const [abaAtiva, setAbaAtiva] = useState("resumo");

    // React Query Hooks
    const { data: settings, isLoading: isLoadingSettings, refetch } = useSettings();
    const { data: printers = [] } = usePrinters();
    const { clients, fetchClients } = useClientStore();
    const { saveProject } = useProjectsStore();

    // Store do Calculator
    const { dadosFormulario, setDadosFormulario, atualizarCampo } = useCalculatorStore();

    // Auto-save
    const { isSaving, lastSaved, isEnabled, toggleAutoSave } = useAutoSave();

    // Estados Locais de UI
    const [historicoAberto, setHistoricoAberto] = useState(false);
    const [modalFalhaAberto, setModalFalhaAberto] = useState(false);
    const [isTaxasModalOpen, setIsTaxasModalOpen] = useState(false); // Novo Estado
    const [modalConfig, setModalConfig] = useState({ open: false, title: "", message: "", icon: null, customAction: null });
    const fileInputRef = useRef(null);
    const [hardwareSelecionado, setHardwareSelecionado] = useState(null);

    const { isProcessing, checkPendingFiles, processarArquivo } = useProcessadorArquivo();

    // Carregamento Inicial
    useEffect(() => {
        const init = async () => {
            checkPendingFiles();
            await fetchClients();
        };
        init();
    }, [fetchClients, checkPendingFiles]);

    // Sincroniza Config (Merge com dados do backend se store estiver vazia ou para garantir defaults)
    useEffect(() => {
        if (settings && !isLoadingSettings) {
            // Atualiza apenas a config, mantendo o resto do formul�rio que pode ter sido editado
            const currentConfig = dadosFormulario.config;
            const newConfig = {
                custoKwh: settings.custoKwh || currentConfig.custoKwh,
                valorHoraHumana: settings.valorHoraHumana || currentConfig.valorHoraHumana,
                custoHoraMaquina: settings.custoHoraMaquina || currentConfig.custoHoraMaquina,
                taxaSetup: settings.taxaSetup || currentConfig.taxaSetup,
                consumoKw: settings.consumoKw || currentConfig.consumoKw,
                margemLucro: settings.margemLucro || currentConfig.margemLucro,
                imposto: settings.imposto || currentConfig.imposto,
                taxaFalha: settings.taxaFalha || currentConfig.taxaFalha
            };

            // S� atualiza se houver diferen�a REAL nos valores para evitar loops infinitos
            // Compara��o simples via stringify resolve o problema de refer�ncia de objeto
            if (JSON.stringify(currentConfig) !== JSON.stringify(newConfig)) {
                atualizarCampo('config', null, newConfig);
            }
        }
    }, [settings, isLoadingSettings, atualizarCampo, dadosFormulario.config]);

    // Sele��o autom�tica de impressora
    useEffect(() => {
        if (printers.length > 0 && !hardwareSelecionado) {
            setHardwareSelecionado(printers[0]);
        }
    }, [printers, hardwareSelecionado]);


    const buscarConfiguracoes = async () => {
        await refetch();
    };

    // L�gica de Hardware/Impressora
    const lidarSelecaoHardware = (printer) => {
        if (!printer) return;
        setHardwareSelecionado(printer);

        // Atualiza consumo se dispon�vel
        if (printer?.consumo_w) {
            const consumoKw = (printer.consumo_w / 1000).toFixed(3);
            atualizarCampo('config', 'consumoKw', consumoKw);
            addToast(`Usando: ${printer.nome} (${printer.consumo_w}W)`, 'info');
        }
    };

    const lidarCicloHardware = () => {
        if (printers.length === 0) return;
        const currentIndex = printers.findIndex(p => p.id === hardwareSelecionado?.id);
        const nextIndex = (currentIndex + 1) % printers.length;
        lidarSelecaoHardware(printers[nextIndex]);
    };






    const { isDragging, dragHandlers } = useDragDrop(processarArquivo);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelected = async (e) => {
        const file = e.target.files?.[0];
        if (file) await processarArquivo(file);
    };

    // C�lculos (Agora calculando aqui APENAS para o Resumo e Hist�rico, os componentes filhos calculam o que precisam)
    const resultados = useMemo(() => {
        return calcularTudo(dadosFormulario);
    }, [dadosFormulario]);

    // Atalhos de Teclado
    useKeyboardShortcuts([
        { key: 's', ctrl: true, handler: () => lidarSalvarNoHistorico() },
        { key: 'h', ctrl: true, handler: () => setHistoricoAberto(prev => !prev) },
        {
            key: 'Escape', handler: () => {
                if (modalFalhaAberto) setModalFalhaAberto(false);
                if (historicoAberto) setHistoricoAberto(false);
                if (modalConfig.open) setModalConfig({ ...modalConfig, open: false });
            }
        }
    ]);

    // Hist�rico
    // Hist�rico
    const lidarSalvarNoHistorico = async () => {
        if (!dadosFormulario.nomeProjeto) {
            addToast("D� um nome pro seu projeto", "warning");
            return;
        }

        const projeto = {
            id: dadosFormulario.id || null, // Passa ID se existir para atualizar
            nome: dadosFormulario.nomeProjeto,
            cliente_id: dadosFormulario.clienteId,
            status: "rascunho",
            dados_entrada: JSON.stringify(dadosFormulario),
            dados_saida: JSON.stringify(resultados),
            custo_total: resultados.custoUnitario,
            preco_final: resultados.precoComDesconto,
            lucro_estimado: resultados.lucroBrutoUnitario
        };

        const resultado = await saveProject(projeto);

        // Se salvou/criou com sucesso, atualiza o ID local para permitir updates futuros
        if (resultado && resultado.id) {
            atualizarCampo('id', null, String(resultado.id));
            addToast("Projeto salvo com sucesso!", "success");
        } else if (resultado) {
            addToast("Projeto salvo!", "success");
        }
    };

    const lidarRestauracao = (projetoHistorico) => {
        if (projetoHistorico?.dados_entrada) {
            try {
                const dados = typeof projetoHistorico.dados_entrada === 'string'
                    ? JSON.parse(projetoHistorico.dados_entrada)
                    : projetoHistorico.dados_entrada;
                setDadosFormulario(dados);
                setHistoricoAberto(false);
                addToast("Projeto carregado!", "success");
            } catch {
                addToast("Erro ao carregar o projeto.", "error");
            }
        }
    };

    const precisaConfigurar = !settings?.custoKwh;
    const elementoHud = (
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                {hardwareSelecionado?.nome || "Sem impressora"}
            </span>
            <div className={`w-2 h-2 rounded-full ${hardwareSelecionado ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
        </div>
    );

    const listaClientes = clients.map(c => ({ id: c.id, label: c.nome }));

    return (
        <div
            {...dragHandlers}
            className="flex h-screen bg-zinc-950 text-zinc-200 font-sans antialiased overflow-hidden relative"
        >
            <OverlayArrastarSoltar isDragging={isDragging} />

            <ManagementLayout>
                <div className="flex-1 flex flex-col lg:flex-row h-full relative">
                    {/* --- �REA DE INPUTS (ESQUERDA) --- */}
                    <div className="flex-1 flex flex-col min-w-0">
                        <HeaderCalculadora
                            nomeProjeto={dadosFormulario.nomeProjeto}
                            setNomeProjeto={(v) => atualizarCampo('nomeProjeto', null, v)}
                            clients={listaClientes}
                            selectedClientId={dadosFormulario.clienteId}
                            onSelectClient={(v) => atualizarCampo('clienteId', null, v)}
                            printers={printers}
                            idImpressoraSelecionada={hardwareSelecionado?.id}
                            onCyclePrinter={lidarCicloHardware}
                            onSelectPrinter={lidarSelecaoHardware}
                            onOpenHistory={() => setHistoricoAberto(true)}
                            onOpenSettings={() => {
                                setAbaAtiva('config');
                                if (window.innerWidth < 1024) {
                                    setTimeout(() => {
                                        document.getElementById('painel-resultados')?.scrollIntoView({ behavior: 'smooth' });
                                    }, 100);
                                }
                            }}
                            onOpenTaxas={() => setIsTaxasModalOpen(true)} // Nova prop
                            onOpenWaste={() => setModalFalhaAberto(true)}
                            onUploadGCode={handleUploadClick}
                            needsConfig={precisaConfigurar}
                            hud={elementoHud}
                            isSaving={isSaving}
                            lastSaved={lastSaved}
                            isAutoSaveEnabled={isEnabled}
                            onToggleAutoSave={toggleAutoSave}
                            onReset={() => {
                                // 1. Reseta o Store
                                useCalculatorStore.getState().resetForm();
                                // 2. Limpa o LocalStorage
                                localStorage.removeItem('calculator_autosave');
                                // 3. Feedback
                                addToast("Calculadora reiniciada!", "info");
                            }}
                        />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".gcode,.gco,.3mf,.stl,.obj"
                            onChange={handleFileSelected}
                            className="hidden"
                        />

                        <div className="flex-1 lg:overflow-y-auto p-4 xl:p-8 custom-scrollbar">
                            <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

                                <div className="flex flex-col gap-6">
                                    <div data-tour="calc-material">
                                        <WrapperCard
                                            title="Mat�ria-Prima"
                                            step="01"
                                            zPriority="z-20"
                                            hasNext={true}
                                            subtotal={resultados?.custoMaterial > 0 ? formatCurrency(resultados.custoMaterial) : null}
                                        >
                                            <CardMaterial />
                                        </WrapperCard>
                                    </div>
                                    <div data-tour="calc-print-time">
                                        <WrapperCard
                                            title="Tempo de Produ��o"
                                            step="02"
                                            zPriority="z-10"
                                            subtotal={(resultados?.custoEnergia + resultados?.custoMaquina + resultados?.custoMaoDeObra) > 0
                                                ? formatCurrency(resultados.custoEnergia + resultados.custoMaquina + resultados.custoMaoDeObra)
                                                : null}
                                        >
                                            <CardTempo />
                                        </WrapperCard>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-6">
                                    <div data-tour="calc-channels">
                                        <WrapperCard
                                            title="Onde vai Vender"
                                            step="03"
                                            zPriority="z-20"
                                            hasNext={true}
                                            subtotal={(resultados?.valorMarketplace + resultados?.valorImpostos) > 0
                                                ? formatCurrency(resultados.valorMarketplace + resultados.valorImpostos)
                                                : null}
                                        >
                                            <CardCanal onOpenTaxas={() => setIsTaxasModalOpen(true)} />
                                        </WrapperCard>
                                    </div>
                                    <div data-tour="calc-extra">
                                        <WrapperCard
                                            title="Outros Custos"
                                            step="04"
                                            zPriority="z-10"
                                            subtotal={(resultados?.custoEmbalagem + resultados?.custoFrete + resultados?.custosExtras) > 0
                                                ? formatCurrency(resultados.custoEmbalagem + resultados.custoFrete + resultados.custosExtras)
                                                : null}
                                        >
                                            <CardEmbalagem />
                                        </WrapperCard>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-6">
                                    <div data-tour="calc-profit">
                                        <WrapperCard title="Pre�o e Lucro" step="05">
                                            <CardPreco />
                                        </WrapperCard>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FOOTER: STATUS DE SALVAMENTO */}
                        <div className="shrink-0 h-8 border-t border-zinc-800/50 bg-zinc-950/30 backdrop-blur-sm flex items-center justify-end px-4 lg:px-8">
                            <button
                                onClick={toggleAutoSave}
                                className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider transition-colors hover:text-zinc-300"
                                title={isEnabled ? "Clique para pausar o salvamento" : "Clique para ativar o salvamento autom�tico"}
                            >
                                {!isEnabled ? (
                                    <>
                                        <CloudOff size={12} strokeWidth={2.5} className="text-zinc-600" />
                                        <span className="text-zinc-600">Sincronia Pausada</span>
                                    </>
                                ) : isSaving ? (
                                    <>
                                        <Loader2 size={12} strokeWidth={2.5} className="animate-spin text-emerald-500" />
                                        <span className="text-emerald-500">Salvando...</span>
                                    </>
                                ) : lastSaved ? (
                                    <>
                                        <Cloud size={12} strokeWidth={2.5} className="text-zinc-600" />
                                        <span className="text-zinc-500">Salvo �s {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </>
                                ) : (
                                    <>
                                        <Cloud size={12} strokeWidth={2.5} className="text-zinc-600" />
                                        <span className="text-zinc-500">Tudo Salvo</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Sidebar Direita: Resumo/Config */}
                    <aside id="painel-resultados" data-tour="calc-results" className={`
                    w-full lg:w-[400px] h-auto lg:h-full 
                    bg-zinc-950/40 backdrop-blur-2xl flex flex-col z-20 
                    border-t lg:border-t-0 lg:border-l border-zinc-800/50
                `}>
                        <div className="h-[80px] border-b border-zinc-800/50 flex items-center px-4">
                            <div className="relative flex w-full h-12 bg-zinc-950/50 rounded-xl border border-zinc-800/50 p-1">
                                <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-zinc-900/50 rounded-lg shadow-sm transition-all duration-300 ${abaAtiva === 'resumo' ? 'left-1' : 'left-[calc(50%+4px)]'}`} />

                                <button type="button" onClick={() => setAbaAtiva('resumo')}
                                    className={`relative flex-1 z-10 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${abaAtiva === 'resumo' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                                    <BarChart3 size={16} strokeWidth={2.5} className={abaAtiva === 'resumo' ? 'text-sky-400' : 'text-zinc-600'} />
                                    Resultado
                                </button>
                                <button type="button" onClick={() => setAbaAtiva('config')}
                                    className={`relative flex-1 z-10 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${abaAtiva === 'config' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                                    <Settings2 size={16} strokeWidth={2.5} className={abaAtiva === 'config' ? 'text-emerald-400' : 'text-zinc-600'} />
                                    Minha Mesa
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 lg:overflow-y-auto custom-scrollbar p-4">
                            {abaAtiva === 'resumo' ? (
                                <Summary resultados={resultados} entradas={dadosFormulario} salvar={lidarSalvarNoHistorico} />
                            ) : (
                                <PainelConfiguracoesCalculo onSaved={buscarConfiguracoes} onOpenTaxas={() => setIsTaxasModalOpen(true)} />
                            )}
                        </div>
                    </aside>


                    <HistoryDrawer open={historicoAberto} onClose={() => setHistoricoAberto(false)} onRestore={lidarRestauracao} />

                    <ModalTaxas
                        isOpen={isTaxasModalOpen}
                        onClose={() => setIsTaxasModalOpen(false)}
                        onApply={(data) => {
                            atualizarCampo('vendas', 'taxaMarketplace', String(data.taxa));
                            atualizarCampo('vendas', 'taxaMarketplaceFixa', String(data.fixa));
                        }}
                    />

                    <ModalRegistrarFalha
                        aberto={modalFalhaAberto}
                        aoFechar={() => setModalFalhaAberto(false)}
                        aoSalvar={(falha) => {
                            if (falha?.costWasted) {
                                setModalConfig({
                                    open: true,
                                    title: "Recuperar o Preju�zo?",
                                    message: `Voc� teve um preju�zo de R$ ${falha.costWasted}. Quer adicionar esse valor no projeto pra recuperar o dinheiro?`,
                                    icon: AlertTriangle,
                                    color: "text-amber-500",
                                    customAction: () => {
                                        const novoExtra = {
                                            nome: `FALHA RECUPERADA (${falha.reason})`,
                                            valor: String(falha.costWasted),
                                            qtd: 1,
                                            supplyId: "custom"
                                        };
                                        atualizarCampo('custosExtras', 'lista', [...dadosFormulario.custosExtras.lista, novoExtra]);
                                        setModalConfig({ ...modalConfig, open: false });
                                    }
                                });
                            }
                        }}
                    />

                    <Modal
                        isOpen={modalConfig.open}
                        onClose={() => setModalConfig({ ...modalConfig, open: false })}
                        title={modalConfig.title}
                        subtitle="Notifica��o de Sistema"
                        icon={modalConfig.icon}
                        footer={
                            <div className="flex gap-2 w-full">
                                {modalConfig.customAction && (
                                    <button
                                        onClick={modalConfig.customAction}
                                        className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase transition-all shadow-lg active:scale-95"
                                    >
                                        Sim, Adicionar
                                    </button>
                                )}
                                <button
                                    onClick={() => setModalConfig({ ...modalConfig, open: false })}
                                    className={`flex-1 h-12 rounded-xl text-[10px] font-black uppercase transition-all shadow-lg active:scale-95 text-white ${modalConfig.customAction ? 'bg-zinc-900/50 hover:bg-zinc-700' :
                                        modalConfig.icon === CheckCircle2 ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20' :
                                            modalConfig.icon === AlertTriangle ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/20' :
                                                'bg-sky-600 hover:bg-sky-500 shadow-sky-900/20'
                                        }`}
                                >
                                    {modalConfig.customAction ? 'N�o, Deixa pra L�' : 'Entendi'}
                                </button>
                            </div>
                        }
                    >
                        <div className="p-8 flex flex-col items-center text-center gap-4">
                            <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                                {modalConfig.message}
                            </p>
                        </div>
                    </Modal>
                </div>
            </ManagementLayout>
        </div>
    );
}
