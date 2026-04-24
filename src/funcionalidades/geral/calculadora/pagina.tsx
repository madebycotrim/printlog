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
import { usarArmazemInsumos } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";
import { FormularioInsumo } from "@/funcionalidades/producao/insumos/componentes/FormularioInsumo";
import { usarGerenciadorInsumos } from "@/funcionalidades/producao/insumos/hooks/usarGerenciadorInsumos";

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
  const [tipoOperacao, setTipoOperacao] = useState<'produto' | 'servico' | 'industrializacao' | 'mei'>('produto');
  const [icms, setIcms] = useState(0);
  const [iss, setIss] = useState(0);
  const [ipi, setIpi] = useState(0);
  const [impostos, setImpostos] = useState<number>(() => {
    const salvo = localStorage.getItem("printlog_config_impostos");
    return salvo ? Number(salvo) : 6; // 6% padrão Simples Nacional
  });
  
  // 💾 MEMÓRIA DO EQUIPAMENTO
  const [impressoraSelecionadaId, setImpressoraSelecionadaId] = useState<string>(() => {
    return localStorage.getItem("printlog_ultima_impressora") || "";
  });
  
  const [abertoSeletor, setAbertoSeletor] = useState(false);
  const [modalArmazemAberto, setModalArmazemAberto] = useState(false);
  const [modalConfigAberto, setModalConfigAberto] = useState(false);
  const [modalPerfisAberto, setModalPerfisAberto] = useState(false);
  const [insumosSelecionados, setInsumosSelecionados] = useState<any[]>([]);
  const [buscaModalArmazem, setBuscaModalArmazem] = useState("");
  const [buscaMaterial, setBuscaMaterial] = useState("");

  // 🏪 PERFIS DE MARKETPLACE DINÂMICOS
  const [perfisMarketplace, setPerfisMarketplace] = useState(() => {
    const salvo = localStorage.getItem("printlog_perfis_marketplace");
    if (salvo) return JSON.parse(salvo);
    return [
      { nome: "Direto", taxa: 0, fixa: 0, ins: 0, imp: 6 },
      { nome: "M. Livre", taxa: 18, fixa: 6, ins: 2, imp: 6 },
      { nome: "Shopee", taxa: 20, fixa: 3, ins: 1.5, imp: 6 },
      { nome: "Site", taxa: 5, fixa: 0, ins: 5, imp: 6 },
    ];
  });

  const { materiais } = usarArmazemMateriais(useShallow(s => ({ materiais: s.materiais })));
  const { insumos: insumosEstoque, abrirEditar: abrirCriarInsumo, modalCricaoAberto: modalInsumoAberto, fecharEditar: fecharInsumoAberto, insumoEditando, adicionarOuAtualizarInsumo } = usarArmazemInsumos(useShallow(s => ({ 
    insumos: s.insumos, 
    abrirEditar: s.abrirEditar,
    modalCricaoAberto: s.modalCricaoAberto,
    fecharEditar: s.fecharEditar,
    insumoEditando: s.insumoEditando,
    adicionarOuAtualizarInsumo: s.adicionarOuAtualizarInsumo
  })));
  const { estado: { impressoras = [] } = {} } = usarGerenciadorImpressoras();
  usarGerenciadorInsumos(); // Garante carga inicial
  
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

  const alternarInsumo = (insumo: any) => {
    const existe = insumosSelecionados.find(i => i.id === insumo.id);
    if (existe) {
      setInsumosSelecionados(prev => prev.filter(i => i.id !== insumo.id));
    } else {
      setInsumosSelecionados(prev => [...prev, {
        id: insumo.id,
        nome: insumo.nome,
        custoCentavos: insumo.custoMedioUnidade // Já em centavos (padrão do sistema)
      }]);
    }
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
              className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-zinc-900/95 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden z-[100]"
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
    titulo: "Precificação Inteligente",
    subtitulo: "Engenharia de custos e rentabilidade para estúdios 3D",
    ocultarBusca: true,
    ocultarNotificacoes: true,
    elementoAcao: elementoAcaoCalculadora
  });

  useEffect(() => {
    if (resultado) {
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

  useEffect(() => {
    const tratarLayout = () => {
      const elementoMain = document.querySelector('main');
      const containerInterno = document.querySelector('main > div');
      
      if (elementoMain && containerInterno) {
        if (window.innerWidth >= 1280) {
          elementoMain.style.overflow = 'hidden';
          elementoMain.style.height = 'calc(100vh - 96px)';
          elementoMain.style.marginTop = '0px';
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
    const custoInsumosDinamicosCentavos = insumosSelecionados.reduce((acc, i) => acc + i.custoCentavos, 0);
    
    const precoKgVirtualCentavos = pesoTotal > 0 ? (custoMaterialTotalCentavos / (pesoTotal / 1000)) : 0;

    return calcularCustoImpressao({
      pesoGramas: pesoTotal,
      tempoMinutos: tempo,
      precoFilamentoKgCentavos: Math.round(precoKgVirtualCentavos),
      potenciaW: potencia,
      precoKwhCentavos: Math.round(precoKwh * 100),
      taxaLucro: margem / 100,
      maoDeObraHoraCentavos: Math.round(maoDeObra * 100),
      custoInsumosCentavos: Math.round(insumos * 100) + custoInsumosDinamicosCentavos,
      custoFreteCentavos: Math.round(frete * 100),
      taxaEcommercePercentual: taxaEcommerce / 100,
      taxaFixaVendaCentavos: Math.round(taxaFixa * 100),
      taxaImpostoPercentual: (impostos + icms + iss + ipi) / 100,
    });
  }, [materiaisSelecionados, insumosSelecionados, tempo, potencia, precoKwh, margem, maoDeObra, insumos, frete, taxaEcommerce, taxaFixa, impostos, icms, iss, ipi]);

  useEffect(() => {
    if (impressoraSelecionadaId) {
      const imp = impressoras.find(i => i.id === impressoraSelecionadaId);
      if (imp) setPotencia((imp.consumoKw ?? 0.1) * 1000);
    }
  }, [impressoraSelecionadaId, impressoras]);

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
      <div className="xl:col-span-8 space-y-6 xl:h-full xl:overflow-y-auto pt-6 xl:pt-8 pb-32 scrollbar-hide animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* 1. MATERIAIS */}
        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-50 dark:border-white/5">
            <div className="flex items-center gap-3">
              <Layers size={18} className="text-sky-500" />
              <h3 className="text-xs font-black uppercase tracking-widest">Materiais e Consumo</h3>
            </div>
            
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

        {/* 2. PRODUÇÃO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
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

          <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-white/5">
              <DollarSign size={18} className="text-amber-500" />
              <h3 className="text-xs font-black uppercase tracking-widest">Valorização e Lucro</h3>
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

        {/* 3. INSUMOS */}
        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-50 dark:border-white/5">
            <div className="flex items-center gap-3">
              <Box size={18} className="text-indigo-500" />
              <h3 className="text-xs font-black uppercase tracking-widest">Insumos e Embalagens</h3>
            </div>
            {insumosSelecionados.length > 0 && (
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded-lg">
                {insumosSelecionados.length} selecionados
              </span>
            )}
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {insumosEstoque.filter(i => i.categoria === "Embalagem" || i.categoria === "Geral").map((insumo) => {
              const selecionado = insumosSelecionados.find(i => i.id === insumo.id);
              return (
                <button
                  key={insumo.id}
                  onClick={() => alternarInsumo(insumo)}
                  className={`flex-shrink-0 w-32 p-4 rounded-2xl border transition-all relative overflow-hidden group
                    ${selecionado 
                      ? "bg-indigo-500/10 border-indigo-500 shadow-lg shadow-indigo-500/10" 
                      : "bg-gray-50 dark:bg-white/[0.02] border-transparent hover:border-gray-200 dark:hover:border-white/10"}
                  `}
                >
                  <div className={`p-2 rounded-lg mb-3 inline-block transition-colors ${selecionado ? "bg-indigo-500 text-white" : "bg-white dark:bg-white/5 text-zinc-400"}`}>
                    <Box size={16} />
                  </div>
                  <div className="text-left">
                    <p className={`text-[10px] font-black uppercase truncate mb-1 ${selecionado ? "text-indigo-500" : "text-zinc-500"}`}>{insumo.nome}</p>
                    <p className="text-[11px] font-black">{centavosParaReais(insumo.custoMedioUnidade)}</p>
                  </div>
                  {selecionado && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                      <Check size={10} className="text-white" />
                    </div>
                  )}
                </button>
              );
            })}
            
            <button 
              onClick={() => abrirCriarInsumo()}
              className="flex-shrink-0 w-32 p-4 rounded-2xl border-2 border-dashed border-gray-100 dark:border-white/5 flex flex-col items-center justify-center gap-2 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-indigo-500 transition-colors">
                <Plus size={20} />
              </div>
              <span className="text-[9px] font-black uppercase text-zinc-400 group-hover:text-indigo-500 transition-colors">Novo</span>
            </button>
          </div>

          <div className="pt-4 border-t border-gray-50 dark:border-white/5">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Outros Custos Fixos (R$)</label>
            <input 
              type="number" 
              value={insumos} 
              onChange={(e) => setInsumos(Number(e.target.value))} 
              className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" 
            />
          </div>
        </div>

        {/* 4. LOGÍSTICA */}
        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-white/5">
            <Warehouse size={18} className="text-sky-500" />
            <h3 className="text-xs font-black uppercase tracking-widest">Canal e Logística</h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {perfisMarketplace.map((p: any) => (
              <button
                key={p.nome}
                onClick={() => {
                  setTaxaEcommerce(p.taxa);
                  setTaxaFixa(p.fixa);
                  if (p.imp !== undefined) setImpostos(p.imp);
                }}
                className="px-3 py-1.5 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-sky-500/50 hover:bg-sky-500/5 transition-all text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-sky-500"
              >
                {p.nome}
              </button>
            ))}
            <button 
              onClick={() => setModalPerfisAberto(true)}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-amber-500 transition-all group"
            >
              <Settings size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Marketplace (%)</label>
              <input type="number" value={taxaEcommerce} onChange={(e) => setTaxaEcommerce(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Taxa Fixa (R$)</label>
              <input type="number" value={taxaFixa} onChange={(e) => setTaxaFixa(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Frete (R$)</label>
              <input type="number" value={frete} onChange={(e) => setFrete(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
            </div>
          </div>
        </div>

        {/* 5. FISCAL */}
        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-50 dark:border-white/5">
            <div className="flex items-center gap-3">
              <TrendingUp size={18} className="text-rose-500" />
              <h3 className="text-xs font-black uppercase tracking-widest">Estrutura Fiscal</h3>
            </div>
            
            <select 
              value={tipoOperacao} 
              onChange={(e) => {
                const tipo = e.target.value as any;
                setTipoOperacao(tipo);
                if (tipo === 'mei') { setIcms(0); setIss(0); setIpi(0); setImpostos(0); }
                else if (tipo === 'servico') { setIcms(0); setIpi(0); setIss(5); }
                else if (tipo === 'produto') { setIss(0); setIpi(0); setIcms(18); }
                else if (tipo === 'industrializacao') { setIss(0); setIcms(18); setIpi(5); }
              }}
              className="bg-gray-50 dark:bg-white/5 border-none outline-none text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg text-rose-500 cursor-pointer"
            >
              <option value="produto">Produto (ICMS)</option>
              <option value="servico">Serviço (ISS)</option>
              <option value="industrializacao">Indústria (IPI+ICMS)</option>
              <option value="mei">MEI (DAS)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tipoOperacao !== 'mei' && (
              <>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Simples/Base (%)</label>
                  <input type="number" value={impostos} onChange={(e) => setImpostos(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
                </div>
                {(tipoOperacao === 'produto' || tipoOperacao === 'industrializacao') && (
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">ICMS (%)</label>
                    <input type="number" value={icms} onChange={(e) => setIcms(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
                  </div>
                )}
                {tipoOperacao === 'servico' && (
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">ISS (%)</label>
                    <input type="number" value={iss} onChange={(e) => setIss(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
                  </div>
                )}
                {tipoOperacao === 'industrializacao' && (
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">IPI (%)</label>
                    <input type="number" value={ipi} onChange={(e) => setIpi(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
                  </div>
                )}
              </>
            )}
            {tipoOperacao === 'mei' && (
              <div className="col-span-4 p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                <p className="text-[10px] font-bold text-rose-500 uppercase leading-relaxed">MEI: DAS fixo mensal. Imposto por venda = 0.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* COLUNA RESULTADOS */}
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
                if (!impressoraSelecionadaId) { toast.error("Selecione um equipamento!"); setAbertoSeletor(true); return; }
                toast.success("Orçamento salvo!");
              }}
              className={`mt-8 w-full h-14 font-black uppercase tracking-widest text-xs rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl
                ${!impressoraSelecionadaId ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5" : "bg-white hover:bg-sky-400 text-black"}
              `}
            >
              <RefreshCcw size={16} strokeWidth={3} className={!impressoraSelecionadaId ? "opacity-20" : ""} />
              Salvar Orçamento
            </button>
          </div>
        </div>
      </div>

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
        mensagemVazio="Nenhum material encontrado."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materiaisModalFiltrados.map((m) => {
            const selecionado = materiaisSelecionados.some(s => s.id === m.id);
            return (
              <button
                key={m.id}
                onClick={() => alternarMaterial(m.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left relative group
                  ${selecionado ? "border-sky-500 bg-sky-500/5" : "border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] hover:border-sky-500/30"}
                `}
              >
                {m.tipo === "FDM" ? <Carretel cor={m.cor} tamanho={48} /> : <GarrafaResina cor={m.cor} tamanho={48} />}
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-[11px] font-black uppercase truncate">{m.nome}</h4>
                  <div className="flex items-center gap-2 mt-1 text-[8px] font-bold text-gray-400 uppercase">
                    <span>{m.tipoMaterial}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="text-sky-500">{centavosParaReais(Math.round((m.precoCentavos / m.pesoGramas) * 1000))}/kg</span>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${selecionado ? "bg-sky-500 text-white" : "bg-gray-100 dark:bg-white/5 text-transparent"}`}>
                  <Check className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </ModalListagemPremium>

      <FormularioMaterial
        aberto={estadoMateriais.modalAberto}
        aoSalvar={acoesMateriais.salvarMaterial}
        aoCancelar={acoesMateriais.fecharEditar}
        materialEditando={estadoMateriais.materialSendoEditado}
      />

      <Dialogo aberto={modalConfigAberto} aoFechar={() => setModalConfigAberto(false)} titulo="Configurações" larguraMax="max-w-md">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-black uppercase text-zinc-500 mb-1.5">Mão de Obra (R$/h)</label>
              <input type="number" value={maoDeObra} onChange={(e) => setMaoDeObra(Number(e.target.value))} className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-amber-500/30 outline-none font-black text-xs" />
            </div>
            <div>
              <label className="block text-[9px] font-black uppercase text-zinc-500 mb-1.5">Energia (R$/kWh)</label>
              <input type="number" value={precoKwh} onChange={(e) => setPrecoKwh(Number(e.target.value))} className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-amber-500/30 outline-none font-black text-xs" />
            </div>
          </div>
          <button onClick={() => {
            localStorage.setItem("printlog_config_maodeobra", String(maoDeObra));
            localStorage.setItem("printlog_config_kwh", String(precoKwh));
            setModalConfigAberto(false);
            toast.success("Salvo!");
          }} className="w-full h-12 bg-zinc-900 dark:bg-white text-white dark:text-black font-black uppercase text-[10px] rounded-xl shadow-lg">Salvar</button>
        </div>
      </Dialogo>

      <Dialogo aberto={modalPerfisAberto} aoFechar={() => setModalPerfisAberto(false)} titulo="Perfis de Venda" larguraMax="max-w-xl">
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            {perfisMarketplace.map((p: any, idx: number) => (
              <div key={idx} className="grid grid-cols-[1fr_70px_70px_70px_70px_40px] gap-2 items-center">
                <input type="text" value={p.nome} onChange={(e) => { const n = [...perfisMarketplace]; n[idx].nome = e.target.value; setPerfisMarketplace(n); }} className="w-full h-9 px-3 rounded-xl bg-white dark:bg-white/5 border-transparent focus:border-sky-500/30 outline-none font-black text-[10px] uppercase" />
                <input type="number" value={p.taxa} onChange={(e) => { const n = [...perfisMarketplace]; n[idx].taxa = Number(e.target.value); setPerfisMarketplace(n); }} className="w-full h-9 rounded-xl bg-white dark:bg-white/5 border-transparent focus:border-sky-500/30 outline-none font-bold text-center text-xs" />
                <input type="number" value={p.fixa} onChange={(e) => { const n = [...perfisMarketplace]; n[idx].fixa = Number(e.target.value); setPerfisMarketplace(n); }} className="w-full h-9 rounded-xl bg-white dark:bg-white/5 border-transparent focus:border-sky-500/30 outline-none font-bold text-center text-xs" />
                <input type="number" value={p.ins} onChange={(e) => { const n = [...perfisMarketplace]; n[idx].ins = Number(e.target.value); setPerfisMarketplace(n); }} className="w-full h-9 rounded-xl bg-white dark:bg-white/5 border-transparent focus:border-sky-500/30 outline-none font-bold text-center text-xs" />
                <input type="number" value={p.imp || 0} onChange={(e) => { const n = [...perfisMarketplace]; n[idx].imp = Number(e.target.value); setPerfisMarketplace(n); }} className="w-full h-9 rounded-xl bg-white dark:bg-white/5 border-transparent focus:border-sky-500/30 outline-none font-bold text-center text-xs" />
                <button onClick={() => setPerfisMarketplace(perfisMarketplace.filter((_:any, i:number) => i !== idx))} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-rose-500/10 text-zinc-500 hover:text-rose-500"><Trash2 size={14} /></button>
              </div>
            ))}
            <button onClick={() => setPerfisMarketplace([...perfisMarketplace, { nome: "NOVO", taxa: 0, fixa: 0, ins: 0, imp: 6 }])} className="w-full py-3 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-xl text-[9px] font-black uppercase text-zinc-500 hover:text-sky-500 transition-all flex items-center justify-center gap-2">
              <Plus size={14} /> Novo Perfil
            </button>
          </div>
          <button onClick={() => {
            localStorage.setItem("printlog_perfis_marketplace", JSON.stringify(perfisMarketplace));
            setModalPerfisAberto(false);
            toast.success("Salvo!");
          }} className="w-full h-12 bg-sky-500 hover:bg-sky-400 text-black font-black uppercase text-[10px] rounded-xl shadow-lg">Salvar Perfis</button>
        </div>
      </Dialogo>

      <FormularioInsumo 
        aberto={modalInsumoAberto}
        aoCancelar={fecharInsumoAberto}
        insumoEditando={insumoEditando}
        aoSalvar={(dados) => {
          adicionarOuAtualizarInsumo({
            ...dados,
            id: dados.id || crypto.randomUUID(),
            dataCriacao: dados.dataCriacao || new Date(),
            dataAtualizacao: new Date(),
            historico: dados.historico || [],
          } as any);
        }}
      />
    </div>
  );
}
