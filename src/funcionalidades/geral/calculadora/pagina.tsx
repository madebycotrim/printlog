import {
  Zap,
  Timer,
  DollarSign,
  TrendingUp,
  RefreshCcw,
  Cpu,
  Layers,
  ChevronDown,
  Check,
  Plus,
  Trash2,
  Droplets,
  Box,
  Search,
  Warehouse,
  Settings,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { useState, useMemo, useEffect } from "react";
import { calcularCustoImpressao } from "@/compartilhado/utilitarios/calculosFinanceiros";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { usarAnalisadorGCode } from "@/compartilhado/hooks/usarAnalisadorGCode";
import { motion, AnimatePresence } from "framer-motion";
import { usarArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { useShallow } from "zustand/react/shallow";
import { usarGerenciadorImpressoras } from "@/funcionalidades/producao/impressoras/hooks/usarGerenciadorImpressoras";
import { usarGerenciadorMateriais } from "@/funcionalidades/producao/materiais/hooks/usarGerenciadorMateriais";
import { ModalListagemPremium } from "@/compartilhado/componentes/ModalListagemPremium";
import { Carretel, GarrafaResina } from "@/compartilhado/componentes/Icones3D";
import { FormularioMaterial } from "@/funcionalidades/producao/materiais/componentes/FormularioMaterial";
import { Material } from "@/funcionalidades/producao/materiais/tipos";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";

interface MaterialSelecionado {
  id: string;
  nome: string;
  cor: string;
  tipo: "FDM" | "SLA";
  quantidade: number;
  precoKgCentavos: number;
}

export function PaginaCalculadora() {
  // Estados do Formulário
  const [materiaisSelecionados, setMateriaisSelecionados] = useState<MaterialSelecionado[]>([]);
  const [tempo, setTempo] = useState<number>(0);
  const [potencia, setPotencia] = useState<number>(150); // 150W média
  const [precoKwh, setPrecoKwh] = useState<number>(0.85); // R$ 0.85/kWh média
  const [maoDeObra, setMaoDeObra] = useState<number>(25); // R$ 25/hora
  const [margem, setMargem] = useState<number>(100); // 100% de lucro padrão
  
  // Estados Comerciais
  const [taxaEcommerce, setTaxaEcommerce] = useState<number>(18); // 18% padrão
  const [taxaFixa, setTaxaFixa] = useState<number>(3); // R$ 3,00 padrão
  const [frete, setFrete] = useState<number>(0);
  const [insumos, setInsumos] = useState<number>(5.50); // Caixa + Plástico bolha
  
  // 💾 MEMÓRIA DO EQUIPAMENTO
  const [impressoraSelecionadaId, setImpressoraSelecionadaId] = useState<string>(() => {
    return localStorage.getItem("printlog_ultima_impressora") || "";
  });
  
  const [abertoSeletor, setAbertoSeletor] = useState(false);
  const [modalArmazemAberto, setModalArmazemAberto] = useState(false);
  const [modalConfigAberto, setModalConfigAberto] = useState(false);
  const [buscaModalArmazem, setBuscaModalArmazem] = useState("");

  const { materiais } = usarArmazemMateriais(useShallow(s => ({ materiais: s.materiais })));
  const { estado: { impressoras = [] } = {} } = usarGerenciadorImpressoras();
  
  // 🔥 SINCRONIZAÇÃO AUTOMÁTICA E MODAIS
  const { estado: estadoMateriais, acoes: acoesMateriais } = usarGerenciadorMateriais(); 

  const { resultado, analisarArquivo } = usarAnalisadorGCode();

  // Alterna a seleção de um material
  const alternarMaterial = (id: string) => {
    const jaSelecionado = materiaisSelecionados.find(m => m.id === id);
    if (jaSelecionado) {
      setMateriaisSelecionados(prev => prev.filter(m => m.id !== id));
    } else {
      const matOriginal = materiais.find(m => m.id === id);
      if (matOriginal) {
        setMateriaisSelecionados(prev => [...prev, {
          id: matOriginal.id,
          nome: matOriginal.nome,
          cor: matOriginal.cor,
          tipo: matOriginal.tipo,
          quantidade: 0,
          precoKgCentavos: Math.round((matOriginal.precoCentavos / matOriginal.pesoGramas) * 1000)
        }]);
      } else if (id === "personalizado") {
        setMateriaisSelecionados(prev => [...prev, {
          id: "personalizado-" + crypto.randomUUID(),
          nome: "Personalizado",
          cor: "#94a3b8",
          tipo: "FDM",
          quantidade: 0,
          precoKgCentavos: 12000 // R$ 120/kg padrão
        }]);
      }
    }
  };

  const atualizarQuantidade = (id: string, qtd: number) => {
    setMateriaisSelecionados(prev => prev.map(m => m.id === id ? { ...m, quantidade: qtd } : m));
  };

  const atualizarPrecoPersonalizado = (id: string, precoKg: number) => {
    setMateriaisSelecionados(prev => prev.map(m => m.id === id ? { ...m, precoKgCentavos: Math.round(precoKg * 100) } : m));
  };

  const removerMaterial = (id: string) => {
    setMateriaisSelecionados(prev => prev.filter(m => m.id !== id));
  };

  const elementoAcaoCalculadora = useMemo(() => (
    <div className="flex items-center gap-1 bg-gray-50 dark:bg-white/5 p-1 rounded-2xl border border-gray-100 dark:border-white/5 shadow-inner">
      <div className="relative">
        <button
          onClick={() => setAbertoSeletor(!abertoSeletor)}
          className={`flex items-center gap-3 px-4 h-11 rounded-xl transition-all duration-300 group
            ${abertoSeletor 
              ? "bg-white dark:bg-white/10 shadow-md" 
              : "hover:bg-white/40 dark:hover:bg-white/5"}
          `}
        >
          <div className={`p-1.5 rounded-lg transition-colors ${abertoSeletor ? "bg-sky-500 text-white" : "bg-sky-500/10 text-sky-500"}`}>
            <Cpu size={14} />
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-sky-500 transition-colors">Equipamento</span>
            <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[120px]">
              {impressoras.find(i => i.id === impressoraSelecionadaId)?.nome || "Selecionar..."}
            </span>
          </div>
          <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${abertoSeletor ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {abertoSeletor && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 15, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-[#121214]/95 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden z-[100]"
            >
              <div className="p-2 space-y-1">
                <div className="px-3 py-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">Suas Impressoras</span>
                </div>
                {impressoras.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase">Nenhuma máquina encontrada</p>
                  </div>
                ) : (
                  impressoras.map(imp => (
                    <button
                      key={imp.id}
                      onClick={() => {
                        setImpressoraSelecionadaId(imp.id);
                        localStorage.setItem("printlog_ultima_impressora", imp.id);
                        setAbertoSeletor(false);
                        
                        // Atualizar parâmetros técnicos da máquina se existirem
                        if (imp.potenciaWatts) setPotencia(imp.potenciaWatts);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group
                        ${impressoraSelecionadaId === imp.id 
                          ? "bg-sky-500/10 text-sky-500" 
                          : "hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-zinc-400"}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${imp.status === 'manutencao' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{imp.nome}</span>
                      </div>
                      {impressoraSelecionadaId === imp.id && (
                        <Check size={14} className="animate-in zoom-in duration-300" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-1" />

      <div className="flex items-center gap-1">
        <label className="flex items-center justify-center w-11 h-11 rounded-xl hover:bg-white/40 dark:hover:bg-white/5 text-zinc-400 hover:text-sky-500 transition-all cursor-pointer group" title="Analisar G-Code">
          <Layers size={18} />
          <input
            type="file"
            accept=".gcode"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) analisarArquivo(file);
            }}
          />
        </label>

        <button 
          onClick={() => setModalConfigAberto(true)}
          className="flex items-center justify-center w-11 h-11 rounded-xl hover:bg-white/40 dark:hover:bg-white/5 text-zinc-400 hover:text-amber-500 transition-all group"
          title="Configurações Globais"
        >
          <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </div>
    </div>
  ), [abertoSeletor, impressoraSelecionadaId, impressoras, analisarArquivo]);

  usarDefinirCabecalho({
    titulo: "Calculadora Pro",
    subtitulo: "Engenharia de custos para estúdios 3D",
    ocultarBusca: true,
    ocultarNotificacoes: true,
    elementoAcao: elementoAcaoCalculadora
  });

  // Feedback visual e auto-preenchimento do G-Code
  useEffect(() => {
    if (resultado) {
      // Se tiver G-Code, adiciona um material genérico ou preenche o primeiro selecionado
      if (materiaisSelecionados.length === 0) {
        setMateriaisSelecionados([{
          id: "gcode-auto",
          nome: "Detectado via G-Code",
          cor: "#0ea5e9",
          tipo: "FDM",
          quantidade: resultado.pesoEstimadoGramas,
          precoKgCentavos: 12000
        }]);
      } else {
        atualizarQuantidade(materiaisSelecionados[0].id, resultado.pesoEstimadoGramas);
      }
      setTempo(resultado.tempoEstimadoMinutos);
      toast.success(`Parâmetros importados: ${resultado.fatiadorDetectado}`, {
        icon: '🚀',
        style: { borderRadius: '12px', background: '#121214', color: '#fff', fontSize: '10px', fontWeight: 'bold' }
      });
    }
  }, [resultado]);

  // Bloqueia o scroll do layout principal apenas em Desktop para usar o scroll interno
  useEffect(() => {
    const tratarLayout = () => {
      const elementoMain = document.querySelector('main');
      const containerInterno = document.querySelector('main > div');
      
      if (elementoMain && containerInterno) {
        if (window.innerWidth >= 1280) { // breakpoint xl do tailwind
          elementoMain.style.overflow = 'hidden';
          elementoMain.style.height = 'calc(100vh - 96px)'; // h-24 do header
          elementoMain.style.marginTop = '0px'; // Garante que comece APÓS o header
          (containerInterno as HTMLElement).style.height = '100%';
          (containerInterno as HTMLElement).style.padding = '0';
        } else {
          elementoMain.style.overflow = 'auto';
          elementoMain.style.height = '';
          elementoMain.style.marginTop = '0px';
          (containerInterno as HTMLElement).style.height = '';
          (containerInterno as HTMLElement).style.padding = '';
        }
      }
    };

    tratarLayout();
    window.addEventListener('resize', tratarLayout);
    
    return () => {
      window.removeEventListener('resize', tratarLayout);
      const elementoMain = document.querySelector('main');
      const containerInterno = document.querySelector('main > div');
      if (elementoMain) {
        elementoMain.style.overflow = 'auto';
        elementoMain.style.height = '';
        elementoMain.style.marginTop = '0px';
      }
      if (containerInterno) {
        (containerInterno as HTMLElement).style.height = '';
        (containerInterno as HTMLElement).style.padding = '';
      }
    };
  }, []);

  const calculo = useMemo(() => {
    const pesoTotal = materiaisSelecionados.reduce((acc, m) => acc + m.quantidade, 0);
    const custoMaterialTotalCentavos = materiaisSelecionados.reduce((acc, m) => acc + (m.quantidade / 1000) * m.precoKgCentavos, 0);
    
    // Virtualizamos o preço KG para bater com o total
    const precoKgVirtualCentavos = pesoTotal > 0 ? (custoMaterialTotalCentavos / (pesoTotal / 1000)) : 0;

    return calcularCustoImpressao({
      pesoGramas: pesoTotal,
      tempoMinutos: tempo,
      precoFilamentoKgCentavos: Math.round(precoKgVirtualCentavos),
      potenciaW: potencia,
      precoKwhCentavos: Math.round(precoKwh * 100),
      taxaLucro: margem / 100,
      maoDeObraHoraCentavos: Math.round(maoDeObra * 100),
      custoInsumosCentavos: Math.round(insumos * 100),
      custoFreteCentavos: Math.round(frete * 100),
      taxaEcommercePercentual: taxaEcommerce / 100,
      taxaFixaVendaCentavos: Math.round(taxaFixa * 100),
    });
  }, [materiaisSelecionados, tempo, potencia, precoKwh, margem, maoDeObra, insumos, frete, taxaEcommerce, taxaFixa]);

  useEffect(() => {
    if (impressoraSelecionadaId) {
      const imp = impressoras.find(i => i.id === impressoraSelecionadaId);
      if (imp) setPotencia((imp.consumoKw ?? 0.1) * 1000);
    }
  }, [impressoraSelecionadaId, impressoras]);

  const [buscaMaterial, setBuscaMaterial] = useState("");

  const materiaisFiltrados = useMemo(() => {
    return materiais.filter(m => 
      m.nome.toLowerCase().includes(buscaMaterial.toLowerCase()) ||
      m.cor.toLowerCase().includes(buscaMaterial.toLowerCase()) ||
      m.tipoMaterial.toLowerCase().includes(buscaMaterial.toLowerCase())
    );
  }, [materiais, buscaMaterial]);

  const materiaisModalFiltrados = useMemo(() => {
    return materiais.filter(m => 
      m.nome.toLowerCase().includes(buscaModalArmazem.toLowerCase()) ||
      m.cor.toLowerCase().includes(buscaModalArmazem.toLowerCase()) ||
      m.tipoMaterial.toLowerCase().includes(buscaModalArmazem.toLowerCase())
    );
  }, [materiais, buscaModalArmazem]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full xl:overflow-hidden relative px-6 md:px-12">
      {/* COLUNA DE INPUTS */}
      <div className="xl:col-span-8 space-y-6 xl:h-full xl:overflow-y-auto pt-6 xl:pt-8 pb-32 scrollbar-hide animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* ══════ SEÇÃO INTELIGENTE DE MATERIAIS ══════ */}
        <div className="p-8 rounded-3xl bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-50 dark:border-white/5">
            <div className="flex items-center gap-3">
              <Layers size={18} className="text-sky-500" />
              <h3 className="text-xs font-black uppercase tracking-widest">Materiais e Consumo</h3>
            </div>
            
            {/* Busca de Materiais para lidar com grandes listas */}
            <div className="relative group">
              <input 
                type="text"
                placeholder="Buscar material..."
                value={buscaMaterial}
                onChange={(e) => setBuscaMaterial(e.target.value)}
                className="w-full md:w-64 h-9 pl-9 pr-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-sky-500/30 outline-none text-[10px] font-bold uppercase tracking-widest transition-all"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sky-500 transition-colors" />
            </div>
          </div>

          {/* CARROSSEL DE SELEÇÃO */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Box className="w-3 h-3 text-sky-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Seu Inventário</span>
              </div>
              <button 
                onClick={() => setModalArmazemAberto(true)}
                className="text-[9px] font-black uppercase text-sky-500 hover:text-sky-400 transition-colors flex items-center gap-1 group"
              >
                Gerenciar Armazém <RefreshCcw className="w-2 h-2 group-hover:rotate-180 transition-transform duration-500" />
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2 min-h-[110px] items-stretch">
              {materiaisFiltrados.length > 0 ? (
                <>
                  {materiaisFiltrados.map((m) => {
                    const selecionado = materiaisSelecionados.some(s => s.id === m.id);
                    return (
                      <button
                        key={m.id}
                        onClick={() => alternarMaterial(m.id)}
                        className={`flex-shrink-0 min-w-[180px] p-3 rounded-2xl border-2 transition-all text-left relative group flex items-center gap-3
                          ${selecionado 
                            ? "border-sky-500 bg-sky-500/10 shadow-[0_0_20px_rgba(14,165,233,0.15)]" 
                            : "border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 hover:border-sky-500/30"}
                        `}
                      >
                        <div className="shrink-0">
                          {m.tipo === "FDM" ? (
                            <Carretel cor={m.cor} tamanho={36} className="-ml-1" />
                          ) : (
                            <GarrafaResina cor={m.cor} tamanho={36} className="-ml-1" />
                          )}
                        </div>
                        
                        <div className="flex-1 overflow-hidden">
                          <h4 className="text-[10px] font-black uppercase truncate leading-tight">{m.nome}</h4>
                          <p className="text-[8px] font-bold text-gray-400 uppercase mt-0.5 whitespace-nowrap">
                            {m.tipoMaterial} • {centavosParaReais(Math.round((m.precoCentavos / m.pesoGramas) * 1000))}/kg
                          </p>
                        </div>

                        {selecionado && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center text-white animate-in zoom-in duration-300 shadow-lg">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                  
                  {/* BOTÃO NOVO NO FINAL */}
                  <button 
                    onClick={() => acoesMateriais.abrirEditar(null as unknown as Material)}
                    className="flex-shrink-0 w-20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-sky-500/50 hover:bg-sky-500/5 transition-all flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-all">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-black uppercase opacity-50 group-hover:opacity-100">Novo</span>
                  </button>
                </>
              ) : (
                /* EXEMPLOS DE DEMONSTRAÇÃO SE ESTIVER VAZIO */
                [
                  { id: 'ex1', nome: 'PLA Silk', tipo: 'FDM', cor: '#3b82f6', preco: 12000 },
                  { id: 'ex2', nome: 'Resina 4K', tipo: 'SLA', cor: '#a855f7', preco: 28000 },
                  { id: 'ex3', nome: 'PETG Carbon', tipo: 'FDM', cor: '#10b981', preco: 16500 }
                ].map(ex => (
                  <div key={ex.id} className="flex-shrink-0 w-36 p-3 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/5 opacity-40 grayscale flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div className="w-7 h-7 rounded-lg" style={{ backgroundColor: ex.cor }} />
                      <span className="text-[7px] font-black bg-gray-200 dark:bg-white/10 px-1.5 py-0.5 rounded uppercase">Exemplo</span>
                    </div>
                    <div className="mt-3">
                      <h4 className="text-[10px] font-black uppercase truncate leading-tight">{ex.nome}</h4>
                      <p className="text-[8px] font-bold uppercase mt-0.5">{ex.tipo} • Sugerido</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Lista de Consumo Detalhada */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {materiaisSelecionados.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="py-12 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-2xl flex flex-col items-center gap-3 text-gray-400"
                >
                  <Box size={24} className="opacity-20" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Selecione os materiais acima para calcular</p>
                </motion.div>
              ) : (
                materiaisSelecionados.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-5 rounded-2xl bg-gray-50/50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 flex flex-wrap md:flex-nowrap items-center gap-6 group"
                  >
                    <div className="flex items-center gap-4 min-w-[180px]">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: item.cor }}>
                        {item.tipo === "FDM" ? <Box size={18} className="text-white/80" /> : <Droplets size={18} className="text-white/80" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-tight">{item.nome}</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase">{item.tipo === "FDM" ? "Filamento" : "Resina"}</span>
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Quantidade ({item.tipo === "FDM" ? "g" : "ml"})</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={item.quantidade || ""}
                            onChange={(e) => atualizarQuantidade(item.id, Number(e.target.value))}
                            placeholder="0"
                            className="w-full h-10 px-3 rounded-lg bg-white dark:bg-black/40 border border-transparent focus:border-sky-500/30 outline-none font-black text-xs"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Preço por {item.tipo === "FDM" ? "Kg" : "Litro"}</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={item.precoKgCentavos / 100}
                            onChange={(e) => atualizarPrecoPersonalizado(item.id, Number(e.target.value))}
                            className="w-full h-10 px-3 rounded-lg bg-white dark:bg-black/40 border border-transparent focus:border-sky-500/30 outline-none font-black text-xs"
                          />
                          <DollarSign size={10} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => removerMaterial(item.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* OUTROS PARÂMETROS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-white/5">
              <Timer size={18} className="text-sky-500" />
              <h3 className="text-xs font-black uppercase tracking-widest">Produção</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Tempo de Impressão</label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="number" 
                      placeholder="HH"
                      value={Math.floor(tempo / 60) || ""} 
                      onChange={(e) => {
                        const h = Math.max(0, Number(e.target.value));
                        const m = tempo % 60;
                        setTempo(h * 60 + m);
                      }}
                      className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-sky-500/50 outline-none font-black text-sm pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-400 uppercase">hrs</span>
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      placeholder="MM"
                      max="59"
                      value={tempo % 60 || ""} 
                      onChange={(e) => {
                        const m = Math.max(0, Math.min(59, Number(e.target.value)));
                        const h = Math.floor(tempo / 60);
                        setTempo(h * 60 + m);
                      }}
                      className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-sky-500/50 outline-none font-black text-sm pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-400 uppercase">min</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Consumo (W)</label>
                  <input type="number" value={potencia} onChange={(e) => setPotencia(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">kWh (R$)</label>
                  <input type="number" value={precoKwh} onChange={(e) => setPrecoKwh(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-white/5">
              <DollarSign size={18} className="text-amber-500" />
              <h3 className="text-xs font-black uppercase tracking-widest">Mão de Obra e Lucro</h3>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">R$ por Hora</label>
                <div className="relative">
                  <input type="number" value={maoDeObra} onChange={(e) => setMaoDeObra(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
                  <DollarSign size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Margem de Lucro</label>
                  <span className="text-sm font-black text-sky-500">{margem}%</span>
                </div>
                <input type="range" min="0" max="500" step="10" value={margem} onChange={(e) => setMargem(Number(e.target.value))} className="w-full accent-sky-500 h-2 bg-gray-100 dark:bg-white/5 rounded-lg appearance-none cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

        {/* LOGÍSTICA */}
        <div className="p-8 rounded-3xl bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-white/5">
            <TrendingUp size={18} className="text-emerald-500" />
            <h3 className="text-xs font-black uppercase tracking-widest">E-commerce & Logística</h3>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { nome: "Direto", taxa: 0, fixa: 0, ins: 0 },
              { nome: "M. Livre", taxa: 18, fixa: 6, ins: 2 },
              { nome: "Shopee", taxa: 20, fixa: 3, ins: 1.5 },
              { nome: "Site", taxa: 5, fixa: 0, ins: 5 },
            ].map((p) => (
              <button
                key={p.nome}
                onClick={() => {
                  setTaxaEcommerce(p.taxa);
                  setTaxaFixa(p.fixa);
                  setInsumos(p.ins);
                }}
                className="px-3 py-1.5 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-sky-500/50 hover:bg-sky-500/5 transition-all text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-sky-500"
              >
                {p.nome}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Marketplace (%)</label>
              <input type="number" value={taxaEcommerce} onChange={(e) => setTaxaEcommerce(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Taxa Fixa (R$)</label>
              <input type="number" value={taxaFixa} onChange={(e) => setTaxaFixa(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Insumos (R$)</label>
              <input type="number" value={insumos} onChange={(e) => setInsumos(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Frete (R$)</label>
              <input type="number" value={frete} onChange={(e) => setFrete(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* COLUNA DE RESULTADOS */}
      <div className="xl:col-span-4 h-full flex items-center justify-center pt-8 pb-8 scrollbar-hide animate-in fade-in duration-1000 overflow-y-auto">
        <div className="p-10 rounded-[2.5rem] bg-zinc-900 border border-white/5 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] flex flex-col items-center text-center overflow-hidden relative h-fit w-full mx-auto">
          <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-sky-500/20 to-transparent blur-3xl" />
          <div className="relative z-10 w-full">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-400 opacity-60">Preço Sugerido</span>
            <div className="mt-6 mb-10">
              <h2 className="text-6xl font-black text-white tracking-tighter leading-none mb-2">{centavosParaReais(calculo.precoSugerido)}</h2>
              <div className="px-3 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full inline-block">
                <span className="text-[9px] font-black text-sky-400 uppercase tracking-widest">Margem de {margem}%</span>
              </div>
            </div>
            <div className="space-y-4 w-full pt-10 border-t border-white/5">
              <div className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400"><Box size={14} /></div>
                  <span className="text-[10px] font-black uppercase text-gray-500">Materiais</span>
                </div>
                <span className="text-sm font-black text-white">{centavosParaReais(calculo.custoMaterial)}</span>
              </div>
              <div className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400"><Zap size={14} /></div>
                  <span className="text-[10px] font-black uppercase text-gray-500">Energia</span>
                </div>
                <span className="text-sm font-black text-white">{centavosParaReais(calculo.custoEnergia)}</span>
              </div>
              <div className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400"><TrendingUp size={14} /></div>
                  <span className="text-[10px] font-black uppercase text-gray-500">Produção</span>
                </div>
                <span className="text-sm font-black text-white">{centavosParaReais(calculo.custoMaoDeObra)}</span>
              </div>
              <div className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400"><DollarSign size={14} /></div>
                  <span className="text-[10px] font-black uppercase text-gray-500">Taxas e Logística</span>
                </div>
                <span className="text-sm font-black text-rose-400">{centavosParaReais(calculo.taxaMarketplace + (Math.round(frete * 100)))}</span>
              </div>
              <div className="pt-6 mt-6 border-t border-white/5 flex justify-between items-center bg-emerald-500/5 -mx-10 px-10 py-4">
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-black uppercase text-emerald-500/60">Lucro Líquido</span>
                  <span className="text-[7px] text-zinc-500 uppercase">Estimado pós taxas</span>
                </div>
                <span className="text-xl font-black text-emerald-400">
                  {centavosParaReais(calculo.precoSugerido - calculo.taxaMarketplace - (Math.round(frete * 100)) - calculo.custoOperacional - calculo.custoInsumos)}
                </span>
              </div>
            </div>
            <button 
              onClick={() => {
                if (!impressoraSelecionadaId) {
                  toast.error("Selecione um equipamento antes de salvar!", {
                    icon: "⚠️",
                    style: { borderRadius: '12px', background: '#333', color: '#fff', fontSize: '12px', fontWeight: 'bold' }
                  });
                  setAbertoSeletor(true);
                  return;
                }
                toast.success("Orçamento salvo com sucesso!");
              }}
              className={`mt-8 w-full h-14 font-black uppercase tracking-widest text-xs rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl
                ${!impressoraSelecionadaId 
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5" 
                  : "bg-white hover:bg-sky-400 text-black"}
              `}
            >
              <RefreshCcw size={16} strokeWidth={3} className={!impressoraSelecionadaId ? "opacity-20" : ""} />
              Salvar Orçamento
            </button>
          </div>
        </div>
      </div>
      {/* 🏛️ MODAL DE GERENCIAMENTO DE ARMAZÉM */}
      <ModalListagemPremium
        aberto={modalArmazemAberto}
        aoFechar={() => setModalArmazemAberto(false)}
        titulo="Armazém de Materiais"
        iconeTitulo={Warehouse}
        corDestaque="sky"
        termoBusca={buscaModalArmazem}
        aoMudarBusca={setBuscaModalArmazem}
        placeholderBusca="BUSCAR NO ESTOQUE..."
        temResultados={materiaisModalFiltrados.length > 0}
        totalResultados={materiaisModalFiltrados.length}
        mensagemVazio="Nenhum material encontrado no seu armazém."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materiaisModalFiltrados.map((m) => {
            const selecionado = materiaisSelecionados.some(s => s.id === m.id);
            return (
              <button
                key={m.id}
                onClick={() => alternarMaterial(m.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left relative group
                  ${selecionado 
                    ? "border-sky-500 bg-sky-500/5 shadow-[0_4px_12px_rgba(14,165,233,0.1)]" 
                    : "border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] hover:border-sky-500/30"}
                `}
              >
                {m.tipo === "FDM" ? (
                  <Carretel cor={m.cor} tamanho={48} />
                ) : (
                  <GarrafaResina cor={m.cor} tamanho={48} />
                )}
                
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-[11px] font-black uppercase truncate leading-tight">{m.nome}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] font-bold text-gray-400 uppercase">{m.tipoMaterial}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-white/10" />
                    <span className="text-[8px] font-black text-sky-500">
                      {centavosParaReais(Math.round((m.precoCentavos / m.pesoGramas) * 1000))}/kg
                    </span>
                  </div>
                </div>

                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${selecionado ? "bg-sky-500 text-white" : "bg-gray-100 dark:bg-white/5 text-transparent"}`}>
                  <Check className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </ModalListagemPremium>

      {/* 📝 FORMULÁRIO DE NOVO MATERIAL */}
      <FormularioMaterial
        aberto={estadoMateriais.modalAberto}
        aoSalvar={acoesMateriais.salvarMaterial}
        aoCancelar={acoesMateriais.fecharEditar}
        materialEditando={estadoMateriais.materialSendoEditado}
      />
      {/* ⚙️ MODAL DE CONFIGURAÇÕES GLOBAIS */}
      <Dialogo
        aberto={modalConfigAberto}
        aoFechar={() => setModalConfigAberto(false)}
        titulo="Configurações da Calculadora"
        larguraMax="max-w-md"
      >
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500"><DollarSign size={16} /></div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Financeiro Padrão</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Mão de Obra (R$/h)</label>
                  <input 
                    type="number" 
                    value={maoDeObra} 
                    onChange={(e) => setMaoDeObra(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-amber-500/30 outline-none font-black text-xs" 
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Energia (R$/kWh)</label>
                  <input 
                    type="number" 
                    value={precoKwh} 
                    onChange={(e) => setPrecoKwh(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-amber-500/30 outline-none font-black text-xs" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500"><TrendingUp size={16} /></div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Comercial & Vendas</h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Margem Padrão (%)</label>
                  <input 
                    type="number" 
                    value={margem} 
                    onChange={(e) => setMargem(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-emerald-500/30 outline-none font-black text-xs" 
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Insumos Fixos (R$)</label>
                  <input 
                    type="number" 
                    value={insumos} 
                    onChange={(e) => setInsumos(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-emerald-500/30 outline-none font-black text-xs" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
            <p className="text-[9px] font-medium text-amber-500/80 leading-relaxed italic">
              * Valores salvos localmente e aplicados em tempo real.
            </p>
          </div>

          <button 
            onClick={() => {
              localStorage.setItem("printlog_config_maodeobra", String(maoDeObra));
              localStorage.setItem("printlog_config_kwh", String(precoKwh));
              localStorage.setItem("printlog_config_margem", String(margem));
              localStorage.setItem("printlog_config_insumos", String(insumos));
              setModalConfigAberto(false);
              toast.success("Configurações salvas!");
            }}
            className="w-full h-12 bg-zinc-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-[10px] rounded-xl transition-all shadow-lg active:scale-95"
          >
            Salvar Preferências
          </button>
        </div>
      </Dialogo>
    </div>
  );
}
