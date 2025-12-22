// --- FILE: src/pages/Calculadora.jsx ---

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Package, Clock, ShoppingBag, Truck, Tag, Settings2, BarChart3, Printer } from "lucide-react";

// --- LAYOUT & COMPONENTES ---
import MainSidebar from "../components/MainSidebar.jsx";
import Header from "../features/calculadora/components/Header.jsx";
import Summary from "../features/calculadora/components/Resumo.jsx";
import HistoryDrawer from "../features/calculadora/components/Historico.jsx";

// Novo Painel de Configurações da Oficina
import PainelConfiguracoesCalculo from "../features/calculadora/components/configCalculo.jsx";

// --- CARDS DE ENTRADA (INPUTS) ---
import CardMaterial from "../features/calculadora/components/cards/material";
import CardTempo from "../features/calculadora/components/cards/tempo";
import CardCanal from "../features/calculadora/components/cards/canalVendas";
import CardEmbalagem from "../features/calculadora/components/cards/logisticos.jsx";
import CardPreco from "../features/calculadora/components/cards/precificacao.jsx";
import MakersHubWidget from "../features/calculadora/components/cards/makerHub.jsx";

// --- LÓGICA E HOOKS ---
import useDebounce from "../hooks/useDebounce";
import { calcularTudo } from "../features/calculadora/logic/calculator";
import { getPrinters } from "../features/impressoras/logic/printers";
import { consumeFilament } from "../features/filamentos/logic/filaments.js";

// --- UI COMPONENTS REUTILIZÁVEIS ---

// Wrapper dos Cards (Estilo Glassmorphism Maker)
const WrapperCard = ({ children, title, icon: Icon, step, className = "" }) => (
  <div
    className={`
      relative
      bg-[#09090b]/80 backdrop-blur-sm
      border border-zinc-800 rounded-2xl p-5
      flex flex-col gap-5
      hover:border-zinc-700 transition-all
      duration-500 group shadow-sm
      hover:shadow-xl hover:-translate-y-1
      animate-in fade-in zoom-in-95 duration-500
      ${className}
    `}
  >
    <div className="flex items-center justify-between shrink-0 border-b border-zinc-800/50 pb-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-zinc-900/50 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-sky-500 group-hover:border-sky-500/20 transition-all duration-500 shadow-inner">
          <Icon size={16} />
        </div>
        <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest group-hover:text-white transition-colors duration-300">
          {title}
        </h3>
      </div>
      <span className="text-[9px] font-mono font-bold text-zinc-600 bg-zinc-900 px-2 py-1 rounded border border-zinc-800 group-hover:border-zinc-700 transition-colors duration-300">
        PASSO {step}
      </span>
    </div>
    <div className="pt-1">{children}</div>
  </div>
);

export default function CalculadoraPage() {
  // --- ESTADO DA UI ---
  const [sidebarWidth, setSidebarWidth] = useState(72);
  const [activeTab, setActiveTab] = useState("resumo");
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const [showProductionModal, setShowProductionModal] = useState(false);

  // Controle de configuração pendente
  const [needsConfig, setNeedsConfig] = useState(false);

  // --- ESTADO DOS DADOS ---
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const [nomeProjeto, setNomeProjeto] = useState("");

  // Material & Filamento
  const [custoRolo, setCustoRolo] = useState("");
  const [pesoModelo, setPesoModelo] = useState("");
  const [qtdPecas, setQtdPecas] = useState("");
  const [selectedFilamentId, setSelectedFilamentId] = useState("manual");

  // Tempo de Impressão e Trabalho
  const [tempoImpressaoHoras, setTempoImpressaoHoras] = useState("");
  const [tempoImpressaoMinutos, setTempoImpressaoMinutos] = useState("");
  const [tempoTrabalhoHoras, setTempoTrabalhoHoras] = useState("");
  const [tempoTrabalhoMinutos, setTempoTrabalhoMinutos] = useState("");

  // Venda, Marketplace & Logística
  const [canalVenda, setCanalVenda] = useState("loja");
  const [taxaMarketplace, setTaxaMarketplace] = useState("0");
  const [custoFixo, setCustoFixo] = useState("");

  const [custoEmbalagem, setCustoEmbalagem] = useState("");
  const [custoFrete, setCustoFrete] = useState("");
  const [custosExtras, setCustosExtras] = useState("");

  // Financeiro e Margens
  const [margemLucro, setMargemLucro] = useState("");
  const [imposto, setImposto] = useState("");
  const [desconto, setDesconto] = useState("");
  const [taxaFalha, setTaxaFalha] = useState("");

  // Configurações da Oficina (Custos Operacionais)
  const [custoKwh, setCustoKwh] = useState("");
  const [valorHoraHumana, setValorHoraHumana] = useState("");
  const [custoHoraMaquina, setCustoHoraMaquina] = useState("");
  const [taxaSetup, setTaxaSetup] = useState("");
  const [consumoImpressoraKw, setConsumoImpressoraKw] = useState("");

  // --- INICIALIZAÇÃO ---
  useEffect(() => {
    const list = getPrinters();
    setPrinters(list);

    if (list.length > 0) {
      setSelectedPrinter(list[0]);
    }

    const hasConfig = localStorage.getItem("layerforge_defaults");
    setNeedsConfig(!hasConfig);
  }, []);

  // Sincroniza potência ao trocar de impressora
  useEffect(() => {
    if (selectedPrinter) {
      const powerWatts = Number(selectedPrinter.power) || Number(selectedPrinter.potencia) || 0;
      if (powerWatts > 0) {
        setConsumoImpressoraKw(String(powerWatts / 1000));
      }
    }
  }, [selectedPrinter]);

  // Alternar entre impressoras cadastradas
  const handleCyclePrinter = useCallback(() => {
    if (!printers || printers.length === 0) return;
    if (!selectedPrinter) {
      setSelectedPrinter(printers[0]);
      return;
    }
    const currentIdx = printers.findIndex(p => p.id === selectedPrinter.id);
    const nextIdx = (currentIdx + 1) % printers.length;
    setSelectedPrinter(printers[nextIdx]);
  }, [printers, selectedPrinter]);

  // --- BAIXA DE ESTOQUE (PRODUÇÃO) ---
  const handleRegistrarProducao = () => {
    if (selectedFilamentId === "manual") {
      alert("Selecione um filamento do estoque para dar baixa. Materiais avulsos não possuem saldo para descontar.");
      return;
    }

    const pesoTotal = Number(pesoModelo) * (Number(qtdPecas) || 1);
    if (pesoTotal <= 0) {
      alert("Peso da peça inválido para registro.");
      return;
    }

    const resultado = consumeFilament(selectedFilamentId, pesoTotal);

    if (resultado) {
      alert(`Sucesso! Estoque atualizado.\nFilamento: ${resultado.name}\nSaldo Restante: ${resultado.weightCurrent}g`);
      setShowProductionModal(false);
    } else {
      alert("Erro ao atualizar estoque. Verifique se o filamento ainda está cadastrado.");
    }
  };

  // --- MOTOR DE CÁLCULO ---
  const entradas = useMemo(() => ({
    custoRolo, pesoModelo, qtdPecas, custosExtras,
    tempoImpressaoHoras, tempoImpressaoMinutos,
    tempoTrabalhoHoras, tempoTrabalhoMinutos,
    canalVenda, taxaMarketplace, custoFixo,
    custoEmbalagem, custoFrete,
    margemLucro, imposto, desconto, taxaFalha,
    custoKwh, valorHoraHumana, custoHoraMaquina, taxaSetup, consumoImpressoraKw,
    impressoraId: selectedPrinter?.id || "custom",
    impressoraNome: selectedPrinter?.name || "Manual/Personalizada",
    selectedFilamentId
  }), [
    custoRolo, pesoModelo, qtdPecas, custosExtras,
    tempoImpressaoHoras, tempoImpressaoMinutos,
    tempoTrabalhoHoras, tempoTrabalhoMinutos,
    canalVenda, taxaMarketplace, custoFixo,
    custoEmbalagem, custoFrete,
    margemLucro, imposto, desconto, taxaFalha,
    custoKwh, valorHoraHumana, custoHoraMaquina, taxaSetup, consumoImpressoraKw,
    selectedPrinter, selectedFilamentId
  ]);

  const entradasDebounced = useDebounce(entradas, 200);
  const [resultados, setResultados] = useState({});

  useEffect(() => {
    try { setResultados(calcularTudo(entradasDebounced) || {}); }
    catch (err) { setResultados({}); }
  }, [entradasDebounced]);

  // --- RESTAURAR PROJETO ---
  const restaurarDoHistorico = useCallback((registro) => {
    if (!registro?.data?.entradas) return;
    const e = registro.data.entradas;

    setNomeProjeto(registro.label || "");
    setCustoRolo(e.custoRolo); setPesoModelo(e.pesoModelo);
    setQtdPecas(e.qtdPecas || ""); setCustosExtras(e.custosExtras || "");
    setTempoImpressaoHoras(e.tempoImpressaoHoras); setTempoImpressaoMinutos(e.tempoImpressaoMinutos);
    setTempoTrabalhoHoras(e.tempoTrabalhoHoras); setTempoTrabalhoMinutos(e.tempoTrabalhoMinutos);
    setCanalVenda(e.canalVenda); setTaxaMarketplace(e.taxaMarketplace); setCustoFixo(e.custoFixo || "");
    setCustoEmbalagem(e.custoEmbalagem); setCustoFrete(e.custoFrete);
    setMargemLucro(e.margemLucro); setImposto(e.imposto); setDesconto(e.desconto); setTaxaFalha(e.taxaFalha);
    setCustoKwh(e.custoKwh); setValorHoraHumana(e.valorHoraHumana);
    setCustoHoraMaquina(e.custoHoraMaquina); setTaxaSetup(e.taxaSetup);
    setConsumoImpressoraKw(e.consumoImpressoraKw);

    if (e.selectedFilamentId) setSelectedFilamentId(e.selectedFilamentId);
    else setSelectedFilamentId("manual");

    const match = printers.find((p) => p.id === e.impressoraId);
    if (match) setSelectedPrinter(match);
    else setSelectedPrinter({ id: "custom", name: e.impressoraNome || "Personalizada", power: (Number(e.consumoImpressoraKw) * 1000) || 100 });

    setHistoricoAberto(false);
  }, [printers]);

  return (
    <div className="flex h-screen bg-[#050505] text-zinc-100 font-sans overflow-hidden selection:bg-sky-500/30 selection:text-sky-200 ">
      
      <MainSidebar onCollapseChange={(collapsed) => setSidebarWidth(collapsed ? 72 : 256)} />

      <main className="flex-1 flex flex-row relative h-full min-w-0 z-10 transition-all duration-300" style={{ marginLeft: `${sidebarWidth}px` }}>

        {/* GRID DE FUNDO */}
        <div className="absolute inset-x-0 top-0 h-[500px] z-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'linear-gradient(to bottom, black, transparent)'
          }}
        />

        {/* === COLUNA DE INPUTS (ESQUERDA) === */}
        <div className="flex-1 flex flex-col h-full min-w-0">

          <div className="h-16 px-8 flex items-center shrink-0 z-20 bg-[#050505]/80 backdrop-blur-md sticky top-0 border-b border-white/5">
            <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-top-4 duration-500">
              <Header
                title="Orçamento de Impressão 3D"
                printers={printers}
                selectedPrinterId={selectedPrinter?.id}
                onCyclePrinter={handleCyclePrinter}
                onBack={() => window.history.back()}
                onOpenHistory={() => setHistoricoAberto(true)}
                onOpenSettings={() => setActiveTab('config')}
                needsConfig={needsConfig}
              />
            </div>
          </div>

          <div className="flex-1 px-8 pb-4 overflow-y-auto custom-scrollbar">
            <div className="max-w-7xl mx-auto ">

              {/* Título do Projeto */}
              <div className="relative mb-6 mt-4 animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
                <input
                  id="nomeProjeto"
                  value={nomeProjeto}
                  onChange={(e) => setNomeProjeto(e.target.value)}
                  placeholder="Nome do Projeto (Ex: Action Figure Batman)"
                  className="w-full bg-transparent py-1 text-4xl font-bold text-white placeholder:text-zinc-700 outline-none font-mono tracking-tighter border-b border-zinc-800/40 focus:border-zinc-600 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

                {/* Coluna 1: O Material */}
                <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-0 fill-mode-forwards">
                  <WrapperCard title="Filamento & Insumos" icon={Package} step="01" className="relative z-50 overflow-visible">
                    <CardMaterial
                      custoRolo={custoRolo} setCustoRolo={setCustoRolo}
                      pesoModelo={pesoModelo} setPesoModelo={setPesoModelo}
                      qtdPecas={qtdPecas} setQtdPecas={setQtdPecas}
                      selectedFilamentId={selectedFilamentId}
                      setSelectedFilamentId={setSelectedFilamentId}
                    />
                  </WrapperCard>
                  <WrapperCard title="Tempo de Produção" icon={Clock} step="02" className="relative z-0">
                    <CardTempo
                      tempoImpressaoHoras={tempoImpressaoHoras} setTempoImpressaoHoras={setTempoImpressaoHoras}
                      tempoImpressaoMinutos={tempoImpressaoMinutos} setTempoImpressaoMinutos={setTempoImpressaoMinutos}
                      tempoTrabalhoHoras={tempoTrabalhoHoras} setTempoTrabalhoHoras={setTempoTrabalhoHoras}
                      tempoTrabalhoMinutos={tempoTrabalhoMinutos} setTempoTrabalhoMinutos={setTempoTrabalhoMinutos}
                    />
                  </WrapperCard>
                </div>

                {/* Coluna 2: Canais e Envios */}
                <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-100 fill-mode-forwards">
                  <WrapperCard title="Canal de Venda" icon={ShoppingBag} step="03" className="relative z-30">
                    <CardCanal
                      canalVenda={canalVenda} setCanalVenda={setCanalVenda}
                      taxaMarketplace={taxaMarketplace} setTaxaMarketplace={setTaxaMarketplace}
                      custoFixo={custoFixo} setCustoFixo={setCustoFixo}
                    />
                  </WrapperCard>

                  <WrapperCard title="Logística e Frete" icon={Truck} step="04" className="relative z-10">
                    <CardEmbalagem
                      custoEmbalagem={custoEmbalagem} setCustoEmbalagem={setCustoEmbalagem}
                      custoFrete={custoFrete} setCustoFrete={setCustoFrete}
                      custosExtras={custosExtras} setCustosExtras={setCustosExtras}
                    />
                  </WrapperCard>
                </div>

                {/* Coluna 3: Precificação Final */}
                <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-200 fill-mode-forwards">
                  <WrapperCard title="Margens & Impostos" icon={Tag} step="05" className="relative z-10">
                    <CardPreco
                      margemLucro={margemLucro} setMargemLucro={setMargemLucro}
                      imposto={imposto} setImposto={setImposto}
                      desconto={desconto} setDesconto={setDesconto}
                      taxaFalha={taxaFalha} setTaxaFalha={setTaxaFalha}
                    />
                  </WrapperCard>

                  <div className="flex-1 min-h-[220px] animate-in fade-in zoom-in-95 duration-500">
                    <MakersHubWidget
                      resultados={resultados}
                      entradas={entradas}
                      nomeProjeto={nomeProjeto}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === SIDEBAR DIREITA (RESULTADOS / PAINEL) === */}
        <aside className="w-[400px] xl:w-[450px] shrink-0 h-full py-6 pr-6 pl-0 flex flex-col z-30 pointer-events-none animate-in slide-in-from-right-10 fade-in duration-700 ease-out delay-150">

          <div className="flex-1 flex flex-col bg-zinc-950/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/5 pointer-events-auto relative">

            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* SELETOR DE ABAS */}
            <div className="p-5 pb-2 shrink-0 z-10">
              <div className="relative p-1 bg-zinc-900/50 rounded-xl border border-white/5 flex items-center shadow-inner">
                <div
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-zinc-800 rounded-lg shadow-sm border border-white/5 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]
                    ${activeTab === 'resumo' ? 'left-1 translate-x-0' : 'left-1 translate-x-[100%]'}`
                  }
                />

                <button
                  onClick={() => setActiveTab('resumo')}
                  className={`relative flex-1 h-9 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 z-10
                    ${activeTab === 'resumo' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <BarChart3 size={14} className={activeTab === 'resumo' ? 'text-sky-400' : 'text-zinc-500'} />
                  Dashboard
                </button>

                <button
                  onClick={() => setActiveTab('config')}
                  className={`relative flex-1 h-9 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 z-10
                    ${activeTab === 'config' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <Settings2 size={14} className={activeTab === 'config' ? 'text-sky-400' : 'text-zinc-500'} />
                  Ajustes Globais
                </button>
              </div>
            </div>

            {/* CONTEÚDO DAS ABAS */}
            <div className="flex-1 overflow-hidden relative">

              {/* ABA 1: RESUMO FINANCEIRO */}
              <div
                className={`absolute inset-0 p-6 pt-2 overflow-y-auto custom-scrollbar transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] 
                  ${activeTab === 'resumo' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12 pointer-events-none'}`}
              >
                <Summary
                  resultados={resultados}
                  entradas={entradas}
                  salvar={() => setShowProductionModal(false)}
                />
              </div>

              {/* ABA 2: CONFIGURAÇÕES DA OFICINA */}
              <div
                className={`absolute inset-0 p-6 pt-2 overflow-y-auto custom-scrollbar transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
                  ${activeTab === 'config' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12 pointer-events-none'}`}
              >

                <div className="mb-6 relative overflow-hidden rounded-xl border border-sky-500/10 bg-gradient-to-br from-sky-500/5 to-transparent p-5 group">
                  <div className="absolute right-0 top-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Settings2 size={48} className="text-sky-500 -rotate-12" />
                  </div>

                  <div className="relative z-10 flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                      <Settings2 size={18} className="text-sky-400" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-1">
                        Custos Fixos da Oficina
                      </h3>
                      <p className="text-[10px] text-zinc-400 leading-relaxed max-w-[200px]">
                        Defina o valor do seu KWh, hora técnica e manutenção. Estes valores servem de base para todos os orçamentos.
                      </p>
                    </div>
                  </div>
                </div>

                <PainelConfiguracoesCalculo
                  custoKwh={custoKwh} setCustoKwh={setCustoKwh}
                  valorHoraHumana={valorHoraHumana} setValorHoraHumana={setValorHoraHumana}
                  custoHoraMaquina={custoHoraMaquina} setCustoHoraMaquina={setCustoHoraMaquina}
                  taxaSetup={taxaSetup} setTaxaSetup={setTaxaSetup}
                  consumoImpressoraKw={consumoImpressoraKw} setConsumoImpressoraKw={setConsumoImpressoraKw}
                  canalVenda={canalVenda} setCanalVenda={setCanalVenda}
                  taxaMarketplace={taxaMarketplace} setTaxaMarketplace={setTaxaMarketplace}
                  impressoraSelecionada={selectedPrinter}
                  onSaved={() => setNeedsConfig(false)}
                />
              </div>
            </div>
          </div>
        </aside>
      </main>

      <HistoryDrawer open={historicoAberto} onClose={() => setHistoricoAberto(false)} onRestore={restaurarDoHistorico} />

      {/* --- MODAL REGISTRAR PRODUÇÃO --- */}
      {showProductionModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[#09090b] border border-zinc-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-pulse">
                <Printer size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Finalizar Impressão?</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Isso descontará <strong>{(Number(pesoModelo) * (Number(qtdPecas) || 1))}g</strong> do seu estoque de filamento.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowProductionModal(false)} className="py-3 rounded-xl border border-zinc-700 text-zinc-400 font-bold text-xs uppercase hover:bg-zinc-800 hover:text-white transition-colors">Cancelar</button>
              <button onClick={handleRegistrarProducao} className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase shadow-lg shadow-emerald-900/20 transition-colors">Confirmar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}