import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
    Settings2, BarChart3, HelpCircle, ChevronRight,
    CheckCircle2, AlertCircle, AlertTriangle, History as HistoryIcon,
    Layout
} from "lucide-react";

// Layout e Componentes Universais
import MainSidebar from "../layouts/mainSidebar.jsx";
import Popup from "../components/Popup.jsx"; // Componente Unificado

// Componentes de Feature
import Header from "../features/calculadora/components/header.jsx";
import Summary from "../features/calculadora/components/resumo.jsx";
import HistoryDrawer from "../features/calculadora/components/historico.jsx";
import PainelConfiguracoesCalculo from "../features/calculadora/components/configCalculo.jsx";

// Cards de Entrada
import CardMaterial from "../features/calculadora/components/cards/materiaPrima.jsx";
import CardTempo from "../features/calculadora/components/cards/tempo.jsx";
import CardCanal from "../features/calculadora/components/cards/taxasVenda.jsx";
import CardEmbalagem from "../features/calculadora/components/cards/custos.jsx";
import CardPreco from "../features/calculadora/components/cards/lucroDescontos.jsx";

// Lógica e Armazenamento
import { formatCurrency } from "../utils/numbers";
import useDebounce from "../hooks/useDebounce";
import { calcularTudo, useSettingsStore } from "../features/calculadora/logic/calculator";
import { usePrinterStore } from "../features/impressoras/logic/printer.js";
import { useProjectsStore } from "../features/orcamentos/logic/projects.js";

const CONFIG_SIDEBAR = { COLAPSADO: 68, EXPANDIDO: 256 };

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
        <div className={`relative ${zPriority} ${className}`}>
            <div className={`relative bg-zinc-900/20 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4 flex flex-col gap-3 transition-all duration-300 group focus-within:z-50 focus-within:border-sky-500/30 hover:border-zinc-700/50`}>
                <div className="flex items-center justify-between border-b border-zinc-800/50 pb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-[10px] font-black text-sky-500 shadow-sm">
                            {step}
                        </div>
                        <h3 className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">{title}</h3>
                    </div>
                    <div className="group/info relative">
                        <HelpCircle size={12} className="text-zinc-700 hover:text-sky-500 cursor-help transition-colors" />
                        <div className="absolute right-0 top-6 w-48 p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl invisible opacity-0 group-hover/info:visible group-hover/info:opacity-100 z-[110] transition-all pointer-events-none transform translate-y-1 group-hover/info:translate-y-0">
                            <p className="text-[8px] text-zinc-400 uppercase font-bold leading-tight">{textosAjuda[step]}</p>
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-visible">{children}</div>
            </div>
        </div>
    );
});

/* ---------- COMPONENTE PRINCIPAL DA PÁGINA ---------- */
export default function CalculadoraPage() {
    const [larguraSidebar, setLarguraSidebar] = useState(CONFIG_SIDEBAR.COLAPSADO);
    const [abaAtiva, setAbaAtiva] = useState("resumo");
    const [historicoAberto, setHistoricoAberto] = useState(false);
    const [precisaConfigurar, setPrecisaConfigurar] = useState(false);
    const [idProjetoAtual, setIdProjetoAtual] = useState(null);

    // Estado para Popups (Centralizado)
    const [modalConfig, setModalConfig] = useState({
        open: false, title: "", message: "", icon: AlertCircle, color: "text-sky-500"
    });

    const { printers: impressoras, fetchPrinters: buscarImpressoras } = usePrinterStore();
    const { settings: configuracoesGerais, fetchSettings: buscarConfiguracoes } = useSettingsStore();
    const { fetchHistory: buscarHistorico, addHistoryEntry: salvarNoBanco } = useProjectsStore();

    const [dadosFormulario, setDadosFormulario] = useState({
        nomeProjeto: "",
        qtdPecas: "1",
        material: { custoRolo: "", pesoModelo: "", selectedFilamentId: "manual", slots: [] },
        tempo: { impressaoHoras: "", impressaoMinutos: "", trabalhoHoras: "", trabalhoMinutos: "" },
        vendas: { canal: "loja", taxaMarketplace: "", taxaMarketplaceFixa: "", desconto: "" },
        custosExtras: { embalagem: "", frete: "", lista: [] },
        config: {
            margemLucro: "", imposto: "", taxaFalha: "", custoKwh: "",
            valorHoraHumana: "", custoHoraMaquina: "", taxaSetup: "", consumoKw: ""
        }
    });

    const [hardwareSelecionado, setHardwareSelecionado] = useState(null);
    const [resultados, setResultados] = useState({});

    const atualizarCampo = useCallback((categoria, campo, valor) => {
        setDadosFormulario(prev => {
            if (campo === null) return { ...prev, [categoria]: valor };
            return { ...prev, [categoria]: { ...prev[categoria], [campo]: valor } };
        });
    }, []);

    useEffect(() => {
        const inicializar = async () => {
            const [, , temConfig] = await Promise.all([
                buscarImpressoras(),
                buscarHistorico(),
                buscarConfiguracoes()
            ]);
            if (!temConfig) setPrecisaConfigurar(true);
        };
        inicializar();
    }, [buscarImpressoras, buscarHistorico, buscarConfiguracoes]);

    useEffect(() => {
        if (configuracoesGerais && (configuracoesGerais.custoKwh || configuracoesGerais.valorHoraHumana)) {
            setDadosFormulario(prev => ({
                ...prev,
                config: {
                    ...prev.config,
                    valorHoraHumana: prev.config.valorHoraHumana || configuracoesGerais.valorHoraHumana,
                    custoKwh: prev.config.custoKwh || configuracoesGerais.custoKwh,
                    custoHoraMaquina: prev.config.custoHoraMaquina || configuracoesGerais.custoHoraMaquina,
                    taxaSetup: prev.config.taxaSetup || configuracoesGerais.taxaSetup,
                    consumoKw: prev.config.consumoKw || configuracoesGerais.consumoKw,
                    margemLucro: prev.config.margemLucro || configuracoesGerais.margemLucro,
                    imposto: prev.config.imposto || configuracoesGerais.imposto,
                    taxaFalha: prev.config.taxaFalha || configuracoesGerais.taxaFalha
                }
            }));
            setPrecisaConfigurar(false);
        }
    }, [configuracoesGerais]);

    useEffect(() => {
        if (impressoras?.length > 0 && !hardwareSelecionado) {
            const ultimoId = localStorage.getItem("last_printer_id");
            const hardwareParaDefinir = impressoras.find(p => String(p.id) === ultimoId) || impressoras[0];
            setHardwareSelecionado(hardwareParaDefinir);
            const potencia = Number(hardwareParaDefinir.potencia || hardwareParaDefinir.power || 0);
            atualizarCampo('config', 'consumoKw', String(potencia >= 2 ? potencia / 1000 : potencia));
        }
    }, [impressoras, hardwareSelecionado, atualizarCampo]);

    const lidarCicloHardware = useCallback(() => {
        if (!impressoras || impressoras.length === 0) return;
        const indiceAtual = impressoras.findIndex(p => p.id === hardwareSelecionado?.id);
        const proximoHardware = impressoras[(indiceAtual + 1) % impressoras.length];
        setHardwareSelecionado(proximoHardware);
        localStorage.setItem("last_printer_id", proximoHardware.id);
        const potencia = Number(proximoHardware.potencia || proximoHardware.power || 0);
        atualizarCampo('config', 'consumoKw', String(potencia >= 2 ? potencia / 1000 : potencia));
    }, [impressoras, hardwareSelecionado, atualizarCampo]);

    const entradasParaCalculo = useDebounce(dadosFormulario, 250);
    useEffect(() => {
        try {
            const res = calcularTudo(entradasParaCalculo);
            setResultados(res || {});
        } catch (erro) {
            console.error("Erro no motor de cálculo:", erro);
            setResultados({});
        }
    }, [entradasParaCalculo]);

    const lidarSalvarNoHistorico = useCallback(async () => {
        if (!dadosFormulario.nomeProjeto.trim()) {
            setModalConfig({
                open: true,
                title: "Atenção",
                message: "Dê um nome para o seu projeto no topo da página antes de salvar.",
                icon: AlertCircle,
                color: "text-amber-500"
            });
            return;
        }

        const resposta = await salvarNoBanco({
            id: idProjetoAtual,
            label: dadosFormulario.nomeProjeto,
            entradas: { ...dadosFormulario, selectedPrinterId: hardwareSelecionado?.id },
            resultados
        });

        if (resposta) {
            setIdProjetoAtual(resposta.id);
            setModalConfig({
                open: true,
                title: "Sucesso",
                message: "Orçamento salvo e atualizado com sucesso no seu histórico cloud.",
                icon: CheckCircle2,
                color: "text-emerald-500"
            });
        }
    }, [dadosFormulario, resultados, hardwareSelecionado, salvarNoBanco, idProjetoAtual]);

    const lidarRestauracao = useCallback((registro) => {
        const payload = registro.data || registro.payload;
        if (payload?.entradas) {
            const dadosRestaurados = JSON.parse(JSON.stringify(payload.entradas));
            if (dadosRestaurados.material?.slots?.length > 0) dadosRestaurados.material.selectedFilamentId = 'multi';
            setIdProjetoAtual(registro.id);
            setDadosFormulario(dadosRestaurados);
            if (dadosRestaurados.selectedPrinterId) {
                const printer = impressoras.find(p => String(p.id) === String(dadosRestaurados.selectedPrinterId));
                if (printer) setHardwareSelecionado(printer);
            }
        }
        setHistoricoAberto(false);
    }, [impressoras]);

    const ehNeutro = !resultados.precoSugerido || resultados.precoSugerido <= 0;
    const corSaude = resultados.margemEfetivaPct <= 0 ? 'text-rose-500' : resultados.margemEfetivaPct < 15 ? 'text-amber-500' : 'text-emerald-500';

    const elementoHud = useMemo(() => {
        if (abaAtiva === 'resumo' || ehNeutro) return null;
        return (
            <div className="hidden lg:flex items-center gap-6 px-5 h-11 bg-zinc-900/50 border border-white/5 rounded-full animate-in fade-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center">
                    <span className="text-[6px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Preço Sugerido</span>
                    <span className="text-[12px] font-mono font-bold text-white leading-none">{formatCurrency(resultados.precoComDesconto)}</span>
                </div>
                <div className="w-px h-5 bg-white/10" />
                <div className="flex flex-col items-center">
                    <span className="text-[6px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Lucro Real</span>
                    <span className={`text-[12px] font-mono font-bold leading-none ${corSaude}`}>{formatCurrency(resultados.lucroBrutoUnitario)}</span>
                </div>
                <button type="button" onClick={() => setAbaAtiva('resumo')} className="group/hud flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 hover:bg-sky-500 transition-all ml-1 shadow-lg">
                    <ChevronRight size={14} className="text-zinc-400 group-hover/hud:text-white transition-colors" />
                </button>
            </div>
        );
    }, [abaAtiva, ehNeutro, resultados, corSaude]);

    return (
        <div className="flex h-screen bg-zinc-950 text-zinc-200 font-sans antialiased overflow-hidden">
            <MainSidebar onCollapseChange={(colapsado) => setLarguraSidebar(colapsado ? 68 : 256)} />

            <main className="flex-1 flex flex-row relative h-full overflow-hidden transition-all duration-300" style={{ marginLeft: `${larguraSidebar}px` }}>

                {/* Grid Background */}
                <div className="absolute inset-x-0 top-0 h-[500px] z-0 opacity-[0.05] pointer-events-none"
                    style={{ backgroundImage: `linear-gradient(to right, #52525b 1px, transparent 1px), linear-gradient(to bottom, #52525b 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

                {/* Coluna de Inputs */}
                <div className="flex-1 flex flex-col h-full min-w-0 relative z-10 border-r border-white/5">
                    <Header
                        nomeProjeto={dadosFormulario.nomeProjeto}
                        setNomeProjeto={(v) => atualizarCampo('nomeProjeto', null, v)}
                        printers={impressoras}
                        selectedPrinterId={hardwareSelecionado?.id}
                        onCyclePrinter={lidarCicloHardware}
                        onOpenHistory={() => setHistoricoAberto(true)}
                        onOpenSettings={() => setAbaAtiva('config')}
                        needsConfig={precisaConfigurar}
                        hud={elementoHud}
                    />

                    <div className="flex-1 overflow-y-auto p-4 xl:p-6 custom-scrollbar">
                        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 pb-10">

                            <div className="flex flex-col gap-4">
                                <WrapperCard title="Matéria-Prima" step="01" zPriority="z-20">
                                    <CardMaterial
                                        custoRolo={dadosFormulario.material.custoRolo} setCustoRolo={(v) => atualizarCampo('material', 'custoRolo', v)}
                                        pesoModelo={dadosFormulario.material.pesoModelo} setPesoModelo={(v) => atualizarCampo('material', 'pesoModelo', v)}
                                        selectedFilamentId={dadosFormulario.material.selectedFilamentId} setSelectedFilamentId={(v) => atualizarCampo('material', 'selectedFilamentId', v)}
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

                            <div className="flex flex-col gap-4">
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

                            <div className="flex flex-col gap-4">
                                <WrapperCard title="Lucro e Estratégia" step="05">
                                    <CardPreco
                                        margemLucro={dadosFormulario.config.margemLucro} setMargemLucro={(v) => atualizarCampo('config', 'margemLucro', v)}
                                        imposto={dadosFormulario.config.imposto} setImposto={(v) => atualizarCampo('config', 'imposto', v)}
                                        desconto={dadosFormulario.vendas.desconto} setDesconto={(v) => atualizarCampo('vendas', 'desconto', v)}
                                        taxaFalha={dadosFormulario.config.taxaFalha} setTaxaFalha={(v) => atualizarCampo('config', 'taxaFalha', v)}
                                        taxaMarketplace={dadosFormulario.vendas.taxaMarketplace} lucroRealItem={resultados.lucroBrutoUnitario} tempoTotalHoras={resultados.tempoTotalHoras}
                                    />
                                </WrapperCard>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Direita: Resumo/Config */}
                <aside className="w-[400px] h-full bg-zinc-950/40 backdrop-blur-2xl flex flex-col z-20 border-l border-white/5">
                    <div className="h-[80px] border-b border-white/5 flex items-center px-4">
                        <div className="flex w-full h-12 bg-zinc-950 rounded-lg border border-zinc-800 p-1 shadow-inner">
                            <button type="button" onClick={() => setAbaAtiva('resumo')}
                                className={`flex-1 rounded text-[11px] font-black uppercase transition-all flex items-center justify-center gap-2 ${abaAtiva === 'resumo' ? 'bg-sky-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>
                                <BarChart3 size={14} /> Resultado
                            </button>
                            <button type="button" onClick={() => setAbaAtiva('config')}
                                className={`flex-1 rounded text-[11px] font-black uppercase transition-all flex items-center justify-center gap-2 ${abaAtiva === 'config' ? 'bg-sky-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>
                                <Settings2 size={14} /> Minha Oficina
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
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
            </main>

            <HistoryDrawer open={historicoAberto} onClose={() => setHistoricoAberto(false)} onRestore={lidarRestauracao} />

            {/* POPUP GLOBAL DE MENSAGENS (Unificado) */}
            {/* POPUP GLOBAL DE MENSAGENS (Estilo HUD Sincronizado com o Resumo) */}
            <Popup
                isOpen={modalConfig.open}
                onClose={() => setModalConfig({ ...modalConfig, open: false })}
                title={modalConfig.title}
                subtitle="MakersLog Cloud"
                icon={modalConfig.icon}
                footer={
                    <button
                        onClick={() => setModalConfig({ ...modalConfig, open: false })}
                        className={`w-full h-12 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 text-white ${modalConfig.icon === CheckCircle2
                                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/20'
                                : 'bg-sky-600 hover:bg-sky-500 shadow-lg shadow-sky-900/20'
                            }`}
                    >
                        Confirmar e Fechar
                    </button>
                }
            >
                <div className="p-6">
                    {/* Container Estilo "Card do Resumo" */}
                    <div className="bg-[#0c0c0e] border border-white/[0.05] rounded-[2rem] p-8 flex flex-col items-center text-center relative overflow-hidden">

                        {/* Efeito de luz de fundo (igual ao resumo) */}
                        <div className={`absolute -top-10 -right-10 w-32 h-32 blur-[50px] opacity-10 rounded-full ${modalConfig.icon === CheckCircle2 ? 'bg-emerald-500' : 'bg-sky-500'}`} />

                        {/* Badge de Status Superior */}
                        <div className="flex items-center gap-2 mb-6">
                            <div className={`w-2 h-2 rounded-full ${modalConfig.icon === CheckCircle2 ? 'bg-emerald-500' : 'bg-sky-500'} animate-pulse shadow-[0_0_8px_currentColor]`} />
                            <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${modalConfig.icon === CheckCircle2 ? 'text-emerald-500' : 'text-sky-500'}`}>
                                Sincronização Ativa
                            </span>
                        </div>

                        {/* Ícone Central */}
                        <div className={`mb-4 ${modalConfig.icon === CheckCircle2 ? 'text-emerald-500' : 'text-sky-500'} opacity-80`}>
                            {modalConfig.icon === CheckCircle2 ? (
                                <CheckCircle2 size={48} strokeWidth={1.5} />
                            ) : (
                                <AlertCircle size={48} strokeWidth={1.5} />
                            )}
                        </div>

                        {/* Texto Principal */}
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">
                            {modalConfig.title}
                        </h3>

                        <p className="text-sm font-medium text-zinc-400 leading-relaxed max-w-[240px]">
                            {modalConfig.message}
                        </p>

                        {/* Rodapé Interno do Card (Visual) */}
                        <div className="mt-8 pt-6 border-t border-white/[0.03] w-full flex justify-between items-center">
                            <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Protocolo D1-Cloud</span>
                            <span className="text-[10px] font-mono font-bold text-zinc-500">#{Math.floor(Math.random() * 90000) + 10000}</span>
                        </div>
                    </div>
                </div>
            </Popup>
        </div>
    );
}
