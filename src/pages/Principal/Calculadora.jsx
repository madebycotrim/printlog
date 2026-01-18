import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
    CheckCircle2, AlertTriangle, Upload, AlertCircle,
    Settings2, BarChart3, HelpCircle, ChevronRight, Menu, X
} from "lucide-react";

// Layout e Componentes Universais
import ManagementLayout from "../../layouts/ManagementLayout.jsx";
import Modal from "../../components/ui/Modal";

// Componentes de Feature
import HeaderCalculadora from "../../features/calculadora/components/HeaderCalculadora.jsx";
import Summary from "../../features/calculadora/components/Resumo.jsx";
import HistoryDrawer from "../../features/calculadora/components/Historico.jsx";
import PainelConfiguracoesCalculo from "../../features/calculadora/components/ConfigCalculo.jsx";
import ModalRegistrarFalha from "../../features/filamentos/components/ModalRegistrarFalha.jsx";

// Cards de Entrada
import CardMaterial from "../../features/calculadora/components/cards/materiaPrima.jsx";
import CardTempo from "../../features/calculadora/components/cards/tempo.jsx";
import CardCanal from "../../features/calculadora/components/cards/taxasVenda.jsx";
import CardEmbalagem from "../../features/calculadora/components/cards/custos.jsx";
import CardPreco from "../../features/calculadora/components/cards/lucroDescontos.jsx";

// Lógica e Armazenamento
import { formatarMoeda } from "../../utils/numbers";
import useDebounce from "../../hooks/useDebounce";
import { calcularTudo, useSettingsStore } from "../../features/calculadora/logic/calculator";
import { usePrinterStore } from "../../features/impressoras/logic/printer.js";
import { useProjectsStore } from "../../features/projetos/logic/projects.js";
import { useFilamentStore } from "../../features/filamentos/logic/filaments.js";
import { useSupplyStore } from "../../features/insumos/logic/supplies.js";
import { useClientStore } from "../../features/clientes/logic/clients.js";
import { useSidebarStore } from "../../stores/sidebarStore";
import { useToastStore } from "../../stores/toastStore";
import { analisarArquivoProjeto } from "../../utils/projectParser";
import { useDragDrop } from "../../hooks/useDragDrop";
import { useTransferStore } from "../../stores/transferStore";

/* ---------- WRAPPER CARD: ESTRUTURA VISUAL ---------- */
const WrapperCard = React.memo(({ children, title, step, className = "", zPriority = "z-10" }) => {
    const textosAjuda = {
        "01": "Defina o preço do seu filamento e o peso da peça (em gramas) que aparece no seu fatiador.",
        "02": "O tempo de impressão afeta o custo de energia e o desgaste da máquina. O tempo manual é o seu trabalho direto.",
        "03": "As taxas de venda diminuem o seu lucro bruto. Veja aqui como elas afetam o preço final.",
        "04": "Lixas, tintas, parafusos e embalagens devem ser somados para você não sair no prejuízo.",
        "05": "A margem de lucro desejada é calculada sobre o preço final de venda (Método do Divisor)."
    };

    return (
        <div className={`relative ${zPriority} ${className} mx-2`}>
            <div className={`relative bg-zinc-950/40 border border-zinc-800/50 rounded-2xl p-5 flex flex-col gap-4 transition-all duration-300 group focus-within:z-50 focus-within:border-sky-500/30 hover:border-zinc-800/50/50 hover-lift`}>
                <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-[10px] font-black text-sky-500 shadow-sm group-hover:scale-110 transition-transform">
                            {step}
                        </div>
                        <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] group-hover:text-zinc-300 transition-colors">{title}</h3>
                    </div>
                    <div className="group/info relative">
                        <HelpCircle size={14} className="text-zinc-700 hover:text-sky-500 cursor-help transition-colors" />
                        <div className="absolute right-0 top-6 w-48 p-3 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl invisible opacity-0 group-hover/info:visible group-hover/info:opacity-100 z-[110] transition-all pointer-events-none transform translate-y-1 group-hover/info:translate-y-0">
                            <p className="text-[9px] text-zinc-400 uppercase font-bold leading-relaxed">{textosAjuda[step]}</p>
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-visible pt-2">{children}</div>
            </div>
        </div>

    );
});

/* ---------- COMPONENTE PRINCIPAL DA PÁGINA ---------- */
export default function CalculadoraPage() {
    const { width: larguraSidebar, isMobile, setMobileOpen } = useSidebarStore();
    const { addToast } = useToastStore();
    const [abaAtiva, setAbaAtiva] = useState("resumo");

    // Stores
    const { settings, fetchSettings, isLoading: isLoadingSettings } = useSettingsStore();
    const { printers, fetchPrinters } = usePrinterStore();
    const { clients, fetchClients } = useClientStore();
    const { filaments, fetchFilaments } = useFilamentStore();
    const { saveProject } = useProjectsStore();

    // Estados Locais

    const [historicoAberto, setHistoricoAberto] = useState(false);
    const [modalFalhaAberto, setModalFalhaAberto] = useState(false);
    const [modalConfig, setModalConfig] = useState({ open: false, title: "", message: "", icon: null, customAction: null });
    const fileInputRef = useRef(null);

    // Estado do Formulário
    const [dadosFormulario, setDadosFormulario] = useState({
        nomeProjeto: "",
        clienteId: "",
        qtdPecas: 1,
        material: {
            custoRolo: "",
            pesoModelo: "",
            idFilamentoSelecionado: "",
            slots: []
        },
        tempo: {
            impressaoHoras: "",
            impressaoMinutos: "",
            trabalhoHoras: "",
            trabalhoMinutos: ""
        },
        vendas: {
            canal: "direta",
            taxaMarketplace: "",
            taxaMarketplaceFixa: "",
            desconto: ""
        },
        custosExtras: {
            embalagem: "",
            frete: "",
            lista: []
        },
        config: {
            custoKwh: "",
            valorHoraHumana: "",
            custoHoraMaquina: "",
            taxaSetup: "",
            consumoKw: "",
            margemLucro: "",
            imposto: "",
            taxaFalha: ""
        }
    });

    const [hardwareSelecionado, setHardwareSelecionado] = useState(null);

    // Carregamento Inicial
    useEffect(() => {
        const init = async () => {
            // Verificar se há arquivo pendente vindo do Dashboard ou outra tela
            const pendingFile = useTransferStore.getState().pendingFile;
            if (pendingFile) {
                // Pequeno delay para garantir que a UI montou
                setTimeout(() => {
                    processarArquivo(pendingFile);
                    useTransferStore.getState().clearPendingFile();
                }, 500);
            }

            await Promise.all([
                fetchSettings(),
                fetchPrinters(),
                fetchClients(),
                fetchFilaments()
            ]);
        };
        init();
    }, []);

    // Atualiza Configuração quando carregada
    useEffect(() => {
        if (settings && !isLoadingSettings) {
            setDadosFormulario(prev => ({
                ...prev,
                config: {
                    ...prev.config,
                    custoKwh: settings.custoKwh || prev.config.custoKwh,
                    valorHoraHumana: settings.valorHoraHumana || prev.config.valorHoraHumana,
                    custoHoraMaquina: settings.custoHoraMaquina || prev.config.custoHoraMaquina,
                    taxaSetup: settings.taxaSetup || prev.config.taxaSetup,
                    consumoKw: settings.consumoKw || prev.config.consumoKw,
                    margemLucro: settings.margemLucro || prev.config.margemLucro,
                    imposto: settings.imposto || prev.config.imposto,
                    taxaFalha: settings.taxaFalha || prev.config.taxaFalha
                }
            }));
        }
    }, [settings, isLoadingSettings]);

    // Seleção automática de impressora
    useEffect(() => {
        if (printers.length > 0 && !hardwareSelecionado) {
            setHardwareSelecionado(printers[0]);
        }
    }, [printers, hardwareSelecionado]);

    // Atualiza campo genérico
    const atualizarCampo = useCallback((secao, campo, valor) => {
        setDadosFormulario(prev => {
            if (secao && campo) {
                return {
                    ...prev,
                    [secao]: {
                        ...prev[secao],
                        [campo]: valor
                    }
                };
            } else if (secao && !campo) {
                // Atualização direta na raiz ou objeto inteiro
                return { ...prev, [secao]: valor };
            }
            return prev;
        });
    }, []);

    const buscarConfiguracoes = async () => {
        await fetchSettings();
    };

    // Lógica de Hardware/Impressora
    const lidarCicloHardware = () => {
        if (printers.length === 0) return;
        const currentIndex = printers.findIndex(p => p.id === hardwareSelecionado?.id);
        const nextIndex = (currentIndex + 1) % printers.length;
        const nextPrinter = printers[nextIndex];
        setHardwareSelecionado(nextPrinter);

        // Atualiza consumo se disponível
        if (nextPrinter?.consumo_w) {
            const consumoKw = (nextPrinter.consumo_w / 1000).toFixed(3);
            atualizarCampo('config', 'consumoKw', consumoKw);
            addToast(`Impressora: ${nextPrinter.nome} (${nextPrinter.consumo_w}W)`, 'info');
        }
    };

    // Drag & Drop com Hook Otimizado
    const { isDragging, dragHandlers } = useDragDrop((file) => processarArquivo(file));

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelected = async (e) => {
        const file = e.target.files?.[0];
        if (file) await processarArquivo(file);
    };

    const processarArquivo = async (file) => {
        addToast("Analisando arquivo...", "loading");
        try {
            const resultado = await analisarArquivoProjeto(file);

            if (resultado.success) {
                // Atualiza Tempo
                if (resultado.timeSeconds > 0) {
                    const totalMinutos = Math.ceil(resultado.timeSeconds / 60);
                    const horas = Math.floor(totalMinutos / 60);
                    const minutos = totalMinutos % 60;

                    setDadosFormulario(prev => ({
                        ...prev,
                        tempo: {
                            ...prev.tempo,
                            impressaoHoras: String(horas),
                            impressaoMinutos: String(minutos)
                        }
                    }));
                }

                // Atualiza Peso
                if (resultado.weightGrams > 0) {
                    setDadosFormulario(prev => ({
                        ...prev,
                        material: {
                            ...prev.material,
                            pesoModelo: String(resultado.weightGrams)
                        }
                    }));
                }

                // Nome do projeto (se vazio)
                if (!dadosFormulario.nomeProjeto) {
                    const nomeLimpo = file.name.replace(/\.(gcode|gco|3mf|stl|obj)$/i, "").replace(/[-_]/g, " ");
                    atualizarCampo('nomeProjeto', null, nomeLimpo);
                }

                addToast(`Arquivo processado: ${resultado.message}`, "success");
            } else {
                addToast(resultado.message, "warning");
            }
        } catch (error) {
            console.error(error);
            addToast("Erro ao processar arquivo.", "error");
        }
    };

    // Cálculos
    const resultados = useMemo(() => {
        return calcularTudo(dadosFormulario);
    }, [dadosFormulario]);

    // Histórico
    const lidarSalvarNoHistorico = async () => {
        if (!dadosFormulario.nomeProjeto) {
            addToast("Digite um nome para o projeto", "warning");
            return;
        }

        const projeto = {
            nome: dadosFormulario.nomeProjeto,
            cliente_id: dadosFormulario.clienteId,
            status: "rascunho",
            dados_entrada: JSON.stringify(dadosFormulario),
            dados_saida: JSON.stringify(resultados),
            custo_total: resultados.custoUnitario,
            preco_final: resultados.precoComDesconto,
            lucro_estimado: resultados.lucroBrutoUnitario
        };

        const sucesso = await saveProject(projeto);
        if (sucesso) addToast("Projeto salvo no histórico!", "success");
    };

    const lidarRestauracao = (projetoHistorico) => {
        if (projetoHistorico?.dados_entrada) {
            try {
                const dados = typeof projetoHistorico.dados_entrada === 'string'
                    ? JSON.parse(projetoHistorico.dados_entrada)
                    : projetoHistorico.dados_entrada;
                setDadosFormulario(dados);
                setHistoricoAberto(false);
                addToast("Projeto restaurado.", "success");
            } catch (e) {
                addToast("Erro ao restaurar dados.", "error");
            }
        }
    };

    const precisaConfigurar = !settings?.custoKwh;
    const elementoHud = (
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                {hardwareSelecionado?.nome || "Impressora Padrão"}
            </span>
            <div className={`w-2 h-2 rounded-full ${hardwareSelecionado ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
        </div>
    );

    // Lista de clientes formatada para o select
    const listaClientes = clients.map(c => ({ id: c.id, label: c.nome }));

    return (
        <div
            {...dragHandlers}
            className="flex h-screen bg-zinc-950 text-zinc-200 font-sans antialiased overflow-hidden relative"
        >
            {/* OVERLAY DE DRAG & DROP OTIMIZADO */}
            <div className={`
                absolute inset-0 z-[200] bg-zinc-950/80 backdrop-blur-md flex items-center justify-center 
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
                        <Upload size={80} className="text-sky-400 relative z-10 animate-bounce" />
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Solte o arquivo</h2>
                        <p className="text-sm font-bold text-sky-400 uppercase tracking-[0.2em]">Extração Automática de Dados</p>
                    </div>
                </div>
            </div>

            <ManagementLayout>
                <div className="flex-1 flex flex-col lg:flex-row h-full relative">
                    {/* --- ÁREA DE INPUTS (ESQUERDA) --- */}
                    <div className="flex-1 flex flex-col min-w-0">
                        <HeaderCalculadora
                            nomeProjeto={dadosFormulario.nomeProjeto}
                            setNomeProjeto={(v) => atualizarCampo('nomeProjeto', null, v)}
                            clients={listaClientes}
                            selectedClientId={dadosFormulario.clienteId}
                            onSelectClient={(v) => atualizarCampo('clienteId', null, v)}
                            printers={printers} // Pass full list
                            idImpressoraSelecionada={hardwareSelecionado?.id}
                            onCyclePrinter={lidarCicloHardware}
                            onOpenHistory={() => setHistoricoAberto(true)}
                            onOpenSettings={() => {
                                setAbaAtiva('config');
                                if (window.innerWidth < 1024) {
                                    setTimeout(() => {
                                        document.getElementById('painel-resultados')?.scrollIntoView({ behavior: 'smooth' });
                                    }, 100);
                                }
                            }}
                            onOpenWaste={() => setModalFalhaAberto(true)}
                            onUploadGCode={handleUploadClick}
                            needsConfig={precisaConfigurar}
                            hud={elementoHud}
                        />
                        {/* Input file escondido */}
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
                                    <WrapperCard title="Matéria-Prima" step="01" zPriority="z-20">
                                        <CardMaterial
                                            custoRolo={dadosFormulario.material.custoRolo} setCustoRolo={(v) => atualizarCampo('material', 'custoRolo', v)}
                                            pesoModelo={dadosFormulario.material.pesoModelo} setPesoModelo={(v) => atualizarCampo('material', 'pesoModelo', v)}
                                            idFilamentoSelecionado={dadosFormulario.material.idFilamentoSelecionado} setIdFilamentoSelecionado={(v) => atualizarCampo('material', 'idFilamentoSelecionado', v)}
                                            materialSlots={dadosFormulario.material.slots} setMaterialSlots={(v) => atualizarCampo('material', 'slots', v)}
                                        />
                                    </WrapperCard>
                                    <WrapperCard title="Tempo de Produção" step="02" zPriority="z-10">
                                        <CardTempo
                                            tempoImpressaoHoras={dadosFormulario.tempo.impressaoHoras} setTempoImpressaoHoras={(v) => atualizarCampo('tempo', 'impressaoHoras', v)}
                                            tempoImpressaoMinutos={dadosFormulario.tempo.impressaoMinutos} setTempoImpressaoMinutos={(v) => atualizarCampo('tempo', 'impressaoMinutos', v)}
                                            tempoTrabalhoHoras={dadosFormulario.tempo.trabalhoHoras} setTempoTrabalhoHoras={(v) => atualizarCampo('tempo', 'trabalhoHoras', v)}
                                            tempoTrabalhoMinutos={dadosFormulario.tempo.trabalhoMinutos} setTempoTrabalhoMinutos={(v) => atualizarCampo('tempo', 'trabalhoMinutos', v)}
                                        />
                                    </WrapperCard>
                                </div>

                                <div className="flex flex-col gap-6">
                                    <WrapperCard title="Canais de Venda" step="03" zPriority="z-20">
                                        <CardCanal
                                            canalVenda={dadosFormulario.vendas.canal} setCanalVenda={(v) => atualizarCampo('vendas', 'canal', v)}
                                            taxaMarketplace={dadosFormulario.vendas.taxaMarketplace} setTaxaMarketplace={(v) => atualizarCampo('vendas', 'taxaMarketplace', v)}
                                            taxaMarketplaceFixa={dadosFormulario.vendas.taxaMarketplaceFixa} setTaxaMarketplaceFixa={(v) => atualizarCampo('vendas', 'taxaMarketplaceFixa', v)}
                                        />
                                    </WrapperCard>
                                    <WrapperCard title="Gastos Extras" step="04" zPriority="z-10">
                                        <CardEmbalagem
                                            custoEmbalagem={dadosFormulario.custosExtras.embalagem} setCustoEmbalagem={(v) => atualizarCampo('custosExtras', 'embalagem', v)}
                                            custoFrete={dadosFormulario.custosExtras.frete} setCustoFrete={(v) => atualizarCampo('custosExtras', 'frete', v)}
                                            custosExtras={dadosFormulario.custosExtras.lista} setCustosExtras={(v) => atualizarCampo('custosExtras', 'lista', v)}
                                        />
                                    </WrapperCard>
                                </div>

                                <div className="flex flex-col gap-6">
                                    <WrapperCard title="Lucro e Estratégia" step="05">
                                        <CardPreco
                                            margemLucro={dadosFormulario.config.margemLucro} setMargemLucro={(v) => atualizarCampo('config', 'margemLucro', v)}
                                            imposto={dadosFormulario.config.imposto} setImposto={(v) => atualizarCampo('config', 'imposto', v)}
                                            desconto={dadosFormulario.vendas.desconto} setDesconto={(v) => atualizarCampo('vendas', 'desconto', v)}
                                            taxaFalha={dadosFormulario.config.taxaFalha} setTaxaFalha={(v) => atualizarCampo('config', 'taxaFalha', v)}
                                            taxaMarketplace={dadosFormulario.vendas.taxaMarketplace}
                                            lucroRealItem={resultados?.lucroBrutoUnitario || 0}
                                            tempoTotalHoras={resultados?.tempoTotalHoras || 0}
                                        />
                                    </WrapperCard>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Direita: Resumo/Config */}
                    <aside id="painel-resultados" className={`
                    w-full lg:w-[400px] h-auto lg:h-full 
                    bg-zinc-950/40 backdrop-blur-2xl flex flex-col z-20 
                    border-t lg:border-t-0 lg:border-l border-zinc-800/50
                `}>
                        <div className="h-[80px] border-b border-zinc-800/50 flex items-center px-4">
                            <div className="relative flex w-full h-12 bg-zinc-950/50 rounded-xl border border-zinc-800/50 p-1">
                                {/* Animated Background Pill */}
                                <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-zinc-900/50 rounded-lg shadow-sm transition-all duration-300 ${abaAtiva === 'resumo' ? 'left-1' : 'left-[calc(50%+4px)]'}`} />

                                <button type="button" onClick={() => setAbaAtiva('resumo')}
                                    className={`relative flex-1 z-10 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${abaAtiva === 'resumo' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                                    <BarChart3 size={14} className={abaAtiva === 'resumo' ? 'text-sky-400' : 'text-zinc-600'} />
                                    Resultado
                                </button>
                                <button type="button" onClick={() => setAbaAtiva('config')}
                                    className={`relative flex-1 z-10 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${abaAtiva === 'config' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                                    <Settings2 size={14} className={abaAtiva === 'config' ? 'text-emerald-400' : 'text-zinc-600'} />
                                    Minha Oficina
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 lg:overflow-y-auto custom-scrollbar p-4">
                            {abaAtiva === 'resumo' ? (
                                <Summary resultados={resultados} entradas={dadosFormulario} salvar={lidarSalvarNoHistorico} />
                            ) : (
                                <PainelConfiguracoesCalculo
                                    valorHoraHumana={dadosFormulario.config.valorHoraHumana} setValorHoraHumana={(v) => atualizarCampo('config', 'valorHoraHumana', v)}
                                    custoKwh={dadosFormulario.config.custoKwh} setCustoKwh={(v) => atualizarCampo('config', 'custoKwh', v)}
                                    consumoImpressoraKw={dadosFormulario.config.consumoKw} setConsumoImpressoraKw={(v) => atualizarCampo('config', 'consumoKw', v)}
                                    custoHoraMaquina={dadosFormulario.config.custoHoraMaquina} setCustoHoraMaquina={(v) => atualizarCampo('config', 'custoHoraMaquina', v)}
                                    taxaSetup={dadosFormulario.config.taxaSetup} setTaxaSetup={(v) => atualizarCampo('config', 'taxaSetup', v)}
                                    onSaved={buscarConfiguracoes}
                                />
                            )}
                        </div>
                    </aside>


                    <HistoryDrawer open={historicoAberto} onClose={() => setHistoricoAberto(false)} onRestore={lidarRestauracao} />

                    <ModalRegistrarFalha
                        aberto={modalFalhaAberto}
                        aoFechar={() => setModalFalhaAberto(false)}
                        aoSalvar={(falha) => {
                            // LÓGICA DE COMPENSAÇÃO INTELIGENTE
                            if (falha?.costWasted) {
                                setModalConfig({
                                    open: true,
                                    title: "Compensar Prejuízo?",
                                    message: `Você registrou um prejuízo de R$ ${falha.costWasted}. Deseja adicionar esse valor aos custos extras deste projeto para recuperar o dinheiro?`,
                                    icon: AlertTriangle,
                                    color: "text-amber-500",
                                    customAction: () => {
                                        const novoExtra = {
                                            nome: `FALHA RECUPERADA (${falha.reason})`,
                                            valor: String(falha.costWasted)
                                        };
                                        atualizarCampo('custosExtras', 'lista', [...dadosFormulario.custosExtras.lista, novoExtra]);
                                        setModalConfig({ ...modalConfig, open: false });
                                    }
                                });
                            }
                        }}
                    />

                    {/* POPUP GLOBAL DE MENSAGENS */}
                    <Modal
                        isOpen={modalConfig.open}
                        onClose={() => setModalConfig({ ...modalConfig, open: false })}
                        title={modalConfig.title}
                        subtitle="Notificação de Sistema"
                        icon={modalConfig.icon}
                        footer={
                            <div className="flex gap-2 w-full">
                                {modalConfig.customAction && (
                                    <button
                                        onClick={modalConfig.customAction}
                                        className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase transition-all shadow-lg active:scale-95"
                                    >
                                        Sim, Compensar
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
                                    {modalConfig.customAction ? 'Não, Ignorar' : 'Entendi, fechar aviso'}
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
