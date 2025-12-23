import React, { useEffect, useMemo, useState, useCallback } from "react";
import { 
  Package, Clock, ShoppingBag, Truck, 
  Tag, Settings2, BarChart3, Printer, Zap 
} from "lucide-react";

// --- LAYOUT & COMPONENTES ---
import MainSidebar from "../components/MainSidebar.jsx";
import Header from "../features/calculadora/components/Header.jsx";
import Summary from "../features/calculadora/components/Resumo.jsx";
import HistoryDrawer from "../features/calculadora/components/Historico.jsx";
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

// --- WRAPPER DE CARDS (CORRIGIDO PARA SELECTS) ---
const WrapperCard = ({ children, title, icon: Icon, step, className = "", zIndex = "" }) => (
  <div
    style={{ zIndex: zIndex }} // Controla a prioridade para selects não ficarem por baixo
    className={`
      relative bg-[#09090b]/40 backdrop-blur-md
      border border-white/5 rounded-2xl p-5
      flex flex-col gap-5 hover:border-sky-500/20 
      transition-all duration-500 group shadow-2xl
      overflow-visible 
      ${className}
    `}
  >
    <div className="flex items-center justify-between shrink-0 border-b border-white/5 pb-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-sky-400 group-hover:border-sky-500/20 transition-all duration-500">
          <Icon size={16} />
        </div>
        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] group-hover:text-white transition-colors">
          {title}
        </h3>
      </div>
      <span className="text-[9px] font-mono font-bold text-zinc-600 bg-zinc-950 px-2 py-1 rounded border border-zinc-900">
        STEP_{step}
      </span>
    </div>
    <div className="pt-1 overflow-visible">{children}</div>
  </div>
);

export default function CalculadoraPage() {
  const [sidebarWidth, setSidebarWidth] = useState(72);
  const [activeTab, setActiveTab] = useState("resumo");
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const [needsConfig, setNeedsConfig] = useState(false);

  // Estados dos Dados
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const [nomeProjeto, setNomeProjeto] = useState("");
  const [custoRolo, setCustoRolo] = useState("");
  const [pesoModelo, setPesoModelo] = useState("");
  const [qtdPecas, setQtdPecas] = useState("");
  const [selectedFilamentId, setSelectedFilamentId] = useState("manual");
  const [tempoImpressaoHoras, setTempoImpressaoHoras] = useState("");
  const [tempoImpressaoMinutos, setTempoImpressaoMinutos] = useState("");
  const [tempoTrabalhoHoras, setTempoTrabalhoHoras] = useState("");
  const [tempoTrabalhoMinutos, setTempoTrabalhoMinutos] = useState("");
  const [canalVenda, setCanalVenda] = useState("loja");
  const [taxaMarketplace, setTaxaMarketplace] = useState("0");
  const [custoFixo, setCustoFixo] = useState("");
  const [custoEmbalagem, setCustoEmbalagem] = useState("");
  const [custoFrete, setCustoFrete] = useState("");
  const [custosExtras, setCustosExtras] = useState("");
  const [margemLucro, setMargemLucro] = useState("");
  const [imposto, setImposto] = useState("");
  const [desconto, setDesconto] = useState("");
  const [taxaFalha, setTaxaFalha] = useState("");
  const [custoKwh, setCustoKwh] = useState("");
  const [valorHoraHumana, setValorHoraHumana] = useState("");
  const [custoHoraMaquina, setCustoHoraMaquina] = useState("");
  const [taxaSetup, setTaxaSetup] = useState("");
  const [consumoImpressoraKw, setConsumoImpressoraKw] = useState("");

  useEffect(() => {
    const list = getPrinters();
    setPrinters(list);
    if (list.length > 0) setSelectedPrinter(list[0]);
    const hasConfig = localStorage.getItem("layerforge_defaults");
    setNeedsConfig(!hasConfig);
  }, []);

  const handleCyclePrinter = useCallback(() => {
    if (printers.length <= 1) return;
    const currentIdx = printers.findIndex(p => p.id === selectedPrinter.id);
    const nextIdx = (currentIdx + 1) % printers.length;
    setSelectedPrinter(printers[nextIdx]);
  }, [printers, selectedPrinter]);

  const entradas = useMemo(() => ({
    custoRolo, pesoModelo, qtdPecas, custosExtras,
    tempoImpressaoHoras, tempoImpressaoMinutos,
    tempoTrabalhoHoras, tempoTrabalhoMinutos,
    canalVenda, taxaMarketplace, custoFixo,
    custoEmbalagem, custoFrete,
    margemLucro, imposto, desconto, taxaFalha,
    custoKwh, valorHoraHumana, custoHoraMaquina, taxaSetup, consumoImpressoraKw,
    impressoraId: selectedPrinter?.id || "custom",
    selectedFilamentId
  }), [custoRolo, pesoModelo, qtdPecas, custosExtras, tempoImpressaoHoras, tempoImpressaoMinutos, tempoTrabalhoHoras, tempoTrabalhoMinutos, canalVenda, taxaMarketplace, custoFixo, custoEmbalagem, custoFrete, margemLucro, imposto, desconto, taxaFalha, custoKwh, valorHoraHumana, custoHoraMaquina, taxaSetup, consumoImpressoraKw, selectedPrinter, selectedFilamentId]);

  const entradasDebounced = useDebounce(entradas, 200);
  const [resultados, setResultados] = useState({});

  useEffect(() => {
    try { setResultados(calcularTudo(entradasDebounced) || {}); }
    catch (err) { setResultados({}); }
  }, [entradasDebounced]);

  return (
    <div className="flex h-screen bg-[#050505] text-zinc-100 font-sans overflow-hidden">
      
      <MainSidebar onCollapseChange={(collapsed) => setSidebarWidth(collapsed ? 72 : 256)} />

      <main 
        className="flex-1 flex flex-row relative h-full min-w-0 z-10 transition-all duration-300" 
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        <div className="absolute inset-x-0 top-0 h-[500px] z-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />

        {/* COLUNA ESQUERDA: HEADER + INPUTS */}
        <div className="flex-1 flex flex-col h-full min-w-0 relative z-10">
          
          <Header
            title="Orçamento de Impressão"
            printers={printers}
            selectedPrinterId={selectedPrinter?.id}
            onCyclePrinter={handleCyclePrinter}
            onBack={() => window.history.back()}
            onOpenHistory={() => setHistoricoAberto(true)}
            onOpenSettings={() => setActiveTab('config')}
            needsConfig={needsConfig}
          />

          <div className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-10">
            <div className="max-w-7xl mx-auto">
              
              <div className="relative mb-10 mt-8 ">
                <h2 className="text-[10px] font-black text-sky-500/50 uppercase tracking-[0.4em] mb-2 ml-1">Project_Identity</h2>
                <input
                  id="nomeProjeto"
                  value={nomeProjeto}
                  onChange={(e) => setNomeProjeto(e.target.value)}
                  placeholder="QUERY_PROJECT_NAME..."
                  className="w-full bg-transparent py-2 text-4xl font-black text-white placeholder:text-zinc-900 outline-none font-mono tracking-tighter border-b border-zinc-900 focus:border-sky-500/30 transition-all uppercase"
                />
              </div>

              {/* GRID COM CONTROLE DE Z-INDEX PARA SELECTS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                
                {/* COLUNA 01 (z-30: Prioridade máxima para o select de filamento) */}
                <div className="flex flex-col gap-6 relative z-[30]">
                  <WrapperCard title="Material & Insumos" icon={Package} step="01" zIndex="50">
                    <CardMaterial custoRolo={custoRolo} setCustoRolo={setCustoRolo} pesoModelo={pesoModelo} setPesoModelo={setPesoModelo} qtdPecas={qtdPecas} setQtdPecas={setQtdPecas} selectedFilamentId={selectedFilamentId} setSelectedFilamentId={setSelectedFilamentId} />
                  </WrapperCard>
                  <WrapperCard title="Tempo de Produção" icon={Clock} step="02" zIndex="40">
                    <CardTempo tempoImpressaoHoras={tempoImpressaoHoras} setTempoImpressaoHoras={setTempoImpressaoHoras} tempoImpressaoMinutos={tempoImpressaoMinutos} setTempoImpressaoMinutos={setTempoImpressaoMinutos} tempoTrabalhoHoras={tempoTrabalhoHoras} setTempoTrabalhoHoras={setTempoTrabalhoHoras} tempoTrabalhoMinutos={tempoTrabalhoMinutos} setTempoTrabalhoMinutos={setTempoTrabalhoMinutos} />
                  </WrapperCard>
                </div>

                {/* COLUNA 02 (z-20) */}
                <div className="flex flex-col gap-6 relative z-[20]">
                  <WrapperCard title="Canais de Venda" icon={ShoppingBag} step="03" zIndex="30">
                    <CardCanal canalVenda={canalVenda} setCanalVenda={setCanalVenda} taxaMarketplace={taxaMarketplace} setTaxaMarketplace={setTaxaMarketplace} custoFixo={custoFixo} setCustoFixo={setCustoFixo} />
                  </WrapperCard>
                  <WrapperCard title="Logística" icon={Truck} step="04" zIndex="20">
                    <CardEmbalagem custoEmbalagem={custoEmbalagem} setCustoEmbalagem={setCustoEmbalagem} custoFrete={custoFrete} setCustoFrete={setCustoFrete} custosExtras={custosExtras} setCustosExtras={setCustosExtras} />
                  </WrapperCard>
                </div>

                {/* COLUNA 03 (z-10) */}
                <div className="flex flex-col gap-6 relative z-[10]">
                  <WrapperCard title="Financeiro" icon={Tag} step="05" zIndex="10">
                    <CardPreco margemLucro={margemLucro} setMargemLucro={setMargemLucro} imposto={imposto} setImposto={setImposto} desconto={desconto} setDesconto={setDesconto} taxaFalha={taxaFalha} setTaxaFalha={setTaxaFalha} />
                  </WrapperCard>
                  <MakersHubWidget resultados={resultados} entradas={entradas} nomeProjeto={nomeProjeto} />
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR DE RESULTADOS */}
        <aside className="w-[420px] h-full flex flex-col z-40 shrink-0">
          <div className="flex-1 flex flex-col bg-zinc-950/40 backdrop-blur-3xl border-l border-white/5 shadow-2xl overflow-hidden relative">
            
            <div className="p-5 pb-2 shrink-0 z-10 mt-2">
              <div className="relative p-1 bg-zinc-900/40 rounded-xl border border-white/5 flex items-center shadow-inner">
                <div 
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-zinc-800 rounded-lg border border-white/5 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${activeTab === 'resumo' ? 'left-1' : 'left-[50%]'}`} 
                />
                <button onClick={() => setActiveTab('resumo')} className={`relative flex-1 h-10 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all z-10 ${activeTab === 'resumo' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}>
                  <BarChart3 size={14} /> Dashboard
                </button>
                <button onClick={() => setActiveTab('config')} className={`relative flex-1 h-10 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all z-10 ${activeTab === 'config' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}>
                  <Settings2 size={14} /> Ajustes
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-2 relative">
              {activeTab === 'resumo' ? (
                <Summary resultados={resultados} entradas={entradas} salvar={() => setHistoricoAberto(true)} />
              ) : (
                <PainelConfiguracoesCalculo 
                  custoKwh={custoKwh} setCustoKwh={setCustoKwh}
                  valorHoraHumana={valorHoraHumana} setValorHoraHumana={setValorHoraHumana}
                  custoHoraMaquina={custoHoraMaquina} setCustoHoraMaquina={setCustoHoraMaquina}
                  taxaSetup={taxaSetup} setTaxaSetup={setTaxaSetup}
                  consumoImpressoraKw={consumoImpressoraKw} setConsumoImpressoraKw={setConsumoImpressoraKw}
                  onSaved={() => setNeedsConfig(false)}
                  impressoraSelecionada={selectedPrinter}
                />
              )}
            </div>
          </div>
        </aside>

      </main>

      <HistoryDrawer open={historicoAberto} onClose={() => setHistoricoAberto(false)} onRestore={() => {}} />

    </div>
  );
}