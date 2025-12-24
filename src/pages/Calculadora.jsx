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
import CardMaterial from "../features/calculadora/components/cards/materiaPrima.jsx";
import CardTempo from "../features/calculadora/components/cards/tempo";
import CardCanal from "../features/calculadora/components/cards/taxasVenda.jsx";
import CardEmbalagem from "../features/calculadora/components/cards/custos.jsx";
import CardPreco from "../features/calculadora/components/cards/lucrosDescontos.jsx";
import MakersHubWidget from "../features/calculadora/components/cards/makerHub.jsx";

// --- LÓGICA E HOOKS ---
import useDebounce from "../hooks/useDebounce";
import { calcularTudo } from "../features/calculadora/logic/calculator";
import { getPrinters } from "../features/impressoras/logic/printers";

// --- WRAPPER DE CARDS (Com controle de Stacking Context) ---
const WrapperCard = ({ children, title, icon: Icon, step, className = "", zIndex = "" }) => (
  <div
    style={{ zIndex: zIndex }}
    className={`
      relative bg-[#09090b]/40 backdrop-blur-md
      border border-white/5 rounded-2xl p-5
      flex flex-col gap-5 hover:border-sky-500/20 
      transition-all duration-500 group shadow-2xl
      overflow-visible animate-in fade-in zoom-in-95 duration-500
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
        PASSO_{step}
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

  // --- ESTADOS DOS INPUTS ---
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const [nomeProjeto, setNomeProjeto] = useState("");
  const [qtdPecas, setQtdPecas] = useState("1");
  
  // Material (Single & Multi)
  const [custoRolo, setCustoRolo] = useState("");
  const [pesoModelo, setPesoModelo] = useState("");
  const [selectedFilamentId, setSelectedFilamentId] = useState("manual");
  const [materialSlots, setMaterialSlots] = useState([
    { id: 'manual', weight: '', priceKg: '' }
  ]);

  // Outros Inputs
  const [tempoImpressaoHoras, setTempoImpressaoHoras] = useState("");
  const [tempoImpressaoMinutos, setTempoImpressaoMinutos] = useState("");
  const [tempoTrabalhoHoras, setTempoTrabalhoHoras] = useState("");
  const [tempoTrabalhoMinutos, setTempoTrabalhoMinutos] = useState("");
  const [canalVenda, setCanalVenda] = useState("loja");
  const [taxaMarketplace, setTaxaMarketplace] = useState("0");
  const [taxaMarketplaceFixa, setTaxaMarketplaceFixa] = useState(""); 
  const [custoEmbalagem, setCustoEmbalagem] = useState("");
  const [custoFrete, setCustoFrete] = useState("");
const [custosExtras, setCustosExtras] = useState([{ nome: "", valor: "" }]);
  const [margemLucro, setMargemLucro] = useState("");
  const [imposto, setImposto] = useState("");
  const [desconto, setDesconto] = useState("");
  const [taxaFalha, setTaxaFalha] = useState("");
  

  // Configurações Globais da Oficina
  const [custoKwh, setCustoKwh] = useState("");
  const [valorHoraHumana, setValorHoraHumana] = useState("");
  const [custoHoraMaquina, setCustoHoraMaquina] = useState("");
  const [taxaSetup, setTaxaSetup] = useState("");
  const [consumoImpressoraKw, setConsumoImpressoraKw] = useState("");

  // --- FUNÇÃO DE RESTAURAÇÃO ---
  const restaurarDoHistorico = useCallback((registro) => {
    if (!registro?.data?.entradas) return;
    const e = registro.data.entradas;

    setNomeProjeto(registro.label || "");
    setQtdPecas(e.qtdPecas || "1");
    setCustoRolo(e.custoRolo || "");
    setPesoModelo(e.pesoModelo || "");
    setSelectedFilamentId(e.selectedFilamentId || "manual");
    setMaterialSlots(e.materialSlots || [{ id: 'manual', weight: '', priceKg: '' }]);
    setTempoImpressaoHoras(e.tempoImpressaoHoras || "");
    setTempoImpressaoMinutos(e.tempoImpressaoMinutos || "");
    setTempoTrabalhoHoras(e.tempoTrabalhoHoras || "");
    setTempoTrabalhoMinutos(e.tempoTrabalhoMinutos || "");
    setCanalVenda(e.canalVenda || "loja");
    setTaxaMarketplace(e.taxaMarketplace || "0");
    setTaxaMarketplaceFixa(e.taxaMarketplaceFixa || "");
    setCustoEmbalagem(e.custoEmbalagem || "");
    setCustoFrete(e.custoFrete || "");
    setCustosExtras(e.custosExtras || "");
    setMargemLucro(e.margemLucro || "");
    setImposto(e.imposto || "");
    setDesconto(e.desconto || "");
    setTaxaFalha(e.taxaFalha || "");
    
    setHistoricoAberto(false);
  }, []);

  // --- INICIALIZAÇÃO ---
  useEffect(() => {
    const list = getPrinters();
    setPrinters(list);
    if (list.length > 0) setSelectedPrinter(list[0]);
    const hasConfig = localStorage.getItem("layerforge_defaults");
    setNeedsConfig(!hasConfig);
  }, []);

  useEffect(() => {
    if (selectedPrinter) {
      const powerWatts = Number(selectedPrinter.power) || Number(selectedPrinter.potencia) || 0;
      if (powerWatts > 0) setConsumoImpressoraKw(String(powerWatts / 1000));
    }
  }, [selectedPrinter]);

  const handleCyclePrinter = useCallback(() => {
    if (printers.length <= 1) return;
    const currentIdx = printers.findIndex(p => p.id === selectedPrinter.id);
    const nextIdx = (currentIdx + 1) % printers.length;
    setSelectedPrinter(printers[nextIdx]);
  }, [printers, selectedPrinter]);

  // --- MOTOR DE CÁLCULO ---
  const entradas = useMemo(() => ({
    custoRolo, pesoModelo, materialSlots, qtdPecas,
    tempoImpressaoHoras, tempoImpressaoMinutos,
    tempoTrabalhoHoras, tempoTrabalhoMinutos,
    canalVenda, taxaMarketplace, taxaMarketplaceFixa,
    custoEmbalagem, custoFrete, custosExtras,
    margemLucro, imposto, desconto, taxaFalha,
    custoKwh, valorHoraHumana, custoHoraMaquina, taxaSetup, consumoImpressoraKw,
    impressoraId: selectedPrinter?.id || "custom",
    selectedFilamentId
  }), [
    custoRolo, pesoModelo, materialSlots, qtdPecas, tempoImpressaoHoras, tempoImpressaoMinutos,
    tempoTrabalhoHoras, tempoTrabalhoMinutos, canalVenda, taxaMarketplace, taxaMarketplaceFixa,
    custoEmbalagem, custoFrete, custosExtras, margemLucro, imposto, desconto, taxaFalha,
    custoKwh, valorHoraHumana, custoHoraMaquina, taxaSetup, consumoImpressoraKw, selectedPrinter, selectedFilamentId
  ]);

  const entradasDebounced = useDebounce(entradas, 200);
  const [resultados, setResultados] = useState({});

  useEffect(() => {
    try { setResultados(calcularTudo(entradasDebounced) || {}); }
    catch (err) { setResultados({}); }
  }, [entradasDebounced]);

  return (
    <div className="flex h-screen bg-[#050505] text-zinc-100 font-sans overflow-hidden">
      
      <MainSidebar onCollapseChange={(collapsed) => setSidebarWidth(collapsed ? 72 : 256)} />

      <main className="flex-1 flex flex-row relative h-full min-w-0 z-10 transition-all duration-300" style={{ marginLeft: `${sidebarWidth}px` }}>
        
        {/* GRID DE FUNDO */}
        <div className="absolute inset-x-0 top-0 h-[500px] z-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />

        <div className="flex-1 flex flex-col h-full min-w-0 relative z-10">
          
          <Header
            nomeProjeto={nomeProjeto}
            setNomeProjeto={setNomeProjeto}
            qtdPecas={qtdPecas}
            setQtdPecas={setQtdPecas}
            printers={printers}
            selectedPrinterId={selectedPrinter?.id}
            onCyclePrinter={handleCyclePrinter}
            onBack={() => window.history.back()}
            onOpenHistory={() => setHistoricoAberto(true)}
            onOpenSettings={() => setActiveTab('config')}
            needsConfig={needsConfig}
          />

          <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-8">
            <div className="max-w-7xl mx-auto">
              
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                
                {/* COLUNA 01 - GASTOS DE MATERIAL E TEMPO */}
                <div className="flex flex-col gap-6 relative z-[30]">
                  <WrapperCard title="Quanto vai de Filamento?" icon={Package} step="01" zIndex="50">
                    <CardMaterial 
                      custoRolo={custoRolo} setCustoRolo={setCustoRolo}
                      pesoModelo={pesoModelo} setPesoModelo={setPesoModelo}
                      selectedFilamentId={selectedFilamentId} setSelectedFilamentId={setSelectedFilamentId}
                      materialSlots={materialSlots} setMaterialSlots={setMaterialSlots}
                    />
                  </WrapperCard>
                  
                  <WrapperCard title="Tempo de Máquina" icon={Clock} step="02" zIndex="40">
                    <CardTempo 
                      tempoImpressaoHoras={tempoImpressaoHoras} setTempoImpressaoHoras={setTempoImpressaoHoras}
                      tempoImpressaoMinutos={tempoImpressaoMinutos} setTempoImpressaoMinutos={setTempoImpressaoMinutos}
                      tempoTrabalhoHoras={tempoTrabalhoHoras} setTempoTrabalhoHoras={setTempoTrabalhoHoras}
                      tempoTrabalhoMinutos={tempoTrabalhoMinutos} setTempoTrabalhoMinutos={setTempoTrabalhoMinutos}
                    />
                  </WrapperCard>
                </div>

                {/* COLUNA 02 - TAXAS E ENVIO */}
                <div className="flex flex-col gap-6 relative z-[20]">
                  <WrapperCard title="Taxas de Venda" icon={ShoppingBag} step="03" zIndex="30">
                    <CardCanal 
                      canalVenda={canalVenda} setCanalVenda={setCanalVenda}
                      taxaMarketplace={taxaMarketplace} setTaxaMarketplace={setTaxaMarketplace}
                      taxaMarketplaceFixa={taxaMarketplaceFixa} setTaxaMarketplaceFixa={setTaxaMarketplaceFixa}
                    />
                  </WrapperCard>
                  
                  <WrapperCard title="Embalagem e Frete" icon={Truck} step="04" zIndex="20">
                    <CardEmbalagem 
                      custoEmbalagem={custoEmbalagem} setCustoEmbalagem={setCustoEmbalagem}
                      custoFrete={custoFrete} setCustoFrete={setCustoFrete}
                      custosExtras={custosExtras} setCustosExtras={setCustosExtras}
                    />
                  </WrapperCard>
                </div>

                {/* COLUNA 03 - LUCRO E RESULTADO */}
                <div className="flex flex-col gap-6 relative z-[10]">
                  <WrapperCard title="Lucro e Impostos" icon={Tag} step="05" zIndex="10">
                    <CardPreco 
                      margemLucro={margemLucro} setMargemLucro={setMargemLucro}
                      imposto={imposto} setImposto={setImposto}
                      desconto={desconto} setDesconto={setDesconto}
                      taxaFalha={taxaFalha} setTaxaFalha={setTaxaFalha}
                    />
                  </WrapperCard>
                  
                  <MakersHubWidget resultados={resultados} entradas={entradas} nomeProjeto={nomeProjeto} />
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* PAINEL LATERAL DE RESULTADOS */}
        <aside className="w-[420px] h-full flex flex-col z-40 shrink-0">
          <div className="flex-1 flex flex-col bg-zinc-950/40 backdrop-blur-3xl border-l border-white/5 shadow-2xl overflow-hidden relative">
            <div className="p-5 pb-2 shrink-0 z-10 mt-2">
              <div className="relative p-1 bg-zinc-900/40 rounded-xl border border-white/5 flex items-center shadow-inner">
                <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-zinc-800 rounded-lg border border-white/5 transition-all duration-500 ease-out ${activeTab === 'resumo' ? 'left-1' : 'left-[50%]'}`} />
                <button onClick={() => setActiveTab('resumo')} className={`relative flex-1 h-10 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all z-10 ${activeTab === 'resumo' ? 'text-white' : 'text-zinc-600'}`}><BarChart3 size={14} /> Custo da Peça</button>
                <button onClick={() => setActiveTab('config')} className={`relative flex-1 h-10 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all z-10 ${activeTab === 'config' ? 'text-white' : 'text-zinc-600'}`}><Settings2 size={14} /> Minha Oficina</button>
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

      <HistoryDrawer open={historicoAberto} onClose={() => setHistoricoAberto(false)} onRestore={restaurarDoHistorico} />
    </div>
  );
}