import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Carregamento } from "@/compartilhado/componentes/Carregamento";
import {
  Settings, Check, X, Plus,
  ChevronDown, Box, Package, History, Crown, Trash, Pencil, TrendingUp, AlertTriangle, AlertCircle, Download, RotateCcw,
  FolderKanban
} from "lucide-react";
import { toast } from "react-hot-toast";
import { usarAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { usarArmazemConfiguracoes } from "@/funcionalidades/sistema/configuracoes/estado/armazemConfiguracoes";
import { usarArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { usarArmazemInsumos } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";
import { usarGerenciadorImpressoras } from "@/funcionalidades/producao/impressoras/hooks/usarGerenciadorImpressoras";
import { usarGerenciadorMateriais } from "@/funcionalidades/producao/materiais/hooks/usarGerenciadorMateriais";
import { usarGerenciadorInsumos } from "@/funcionalidades/producao/insumos/hooks/usarGerenciadorInsumos";
import { usarPedidos } from "@/funcionalidades/producao/projetos/hooks/usarPedidos";
import { usarGerenciadorClientes } from "@/funcionalidades/comercial/clientes/hooks/usarGerenciadorClientes";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { ModalListagemPremium } from "@/compartilhado/componentes/ModalListagemPremium";
import { FormularioMaterial } from "@/funcionalidades/producao/materiais/componentes/FormularioMaterial";
import { FormularioInsumo } from "@/funcionalidades/producao/insumos/componentes/FormularioInsumo";
import { Carretel, GarrafaResina } from "@/compartilhado/componentes/Icones3D";
import { formatarMoedaFinancas, formatarPorcentagem, centavosParaReais, extrairValorNumerico } from "@/compartilhado/utilitarios/formatadores";

// Hook e Componentes Refatorados
import { usarCalculadora } from "./hooks/usarCalculadora";
import { CardMateriais } from "./componentes/CardMateriais";
import { CardProducao } from "./componentes/CardProducao";
import { CardOperacional } from "./componentes/CardOperacional";
import { CardInsumos } from "./componentes/CardInsumos";
import { CardLogistica } from "./componentes/CardLogistica";
import { CardFiscal } from "./componentes/CardFiscal";
import { PainelResultados } from "./componentes/PainelResultados";
import { ModalHistorico } from "./componentes/ModalHistorico";
import { Zap, Clock, Wrench, Percent } from "lucide-react";

export function PaginaCalculadora() {
  const { usuario } = usarAutenticacao();
  const eProOuSuperior = useMemo(() => {
    const plano = ((usuario as any)?.plano || '').toUpperCase();
    const role = ((usuario as any)?.role || (usuario as any)?.cargo || '').toUpperCase();
    return ['PRO', 'FUNDADOR', 'MAKER_FUNDADOR', 'ADMIN'].includes(plano) ||
      ['PRO', 'FUNDADOR', 'MAKER_FUNDADOR', 'ADMIN'].includes(role) ||
      plano.includes('FUNDADOR') || role.includes('FUNDADOR');
  }, [usuario]);

  const config = usarArmazemConfiguracoes();
  const { criarPedido } = usarPedidos();
  const { estado: estadoClientes, acoes: acoesClientes } = usarGerenciadorClientes();
  const { estado } = usarGerenciadorImpressoras();
  const { impressoras = [] } = estado;
  const { materiais } = usarArmazemMateriais();
  const { insumos: insumosEstoque, adicionarOuAtualizarInsumo, abrirEditar: abrirCriarInsumo, modalCricaoAberto: modalInsumoAberto, fecharEditar: fecharInsumoAberto, insumoEditando } = usarArmazemInsumos();
  const { estado: estadoMateriais, acoes: acoesMateriais } = usarGerenciadorMateriais();
  usarGerenciadorInsumos();

  // Hook Central de Inteligência
  const hook = usarCalculadora();

  // Estados de UI locais
  const [abertoSeletor, setAbertoSeletor] = useState(false);
  const [modalArmazemAberto, setModalArmazemAberto] = useState(false);
  const [modalArmazemInsumosAberto, setModalArmazemInsumosAberto] = useState(false);
  const [modalCanaisAberto, setModalCanaisAberto] = useState(false);
  const [nomeProjeto, setNomeProjeto] = useState('');
  const [descricaoProjeto, setDescricaoProjeto] = useState('');
  const [clienteProjetoId, setClienteProjetoId] = useState('');
  const [buscaClienteSeletor, setBuscaClienteSeletor] = useState('');
  const [abertoSeletorCliente, setAbertoSeletorCliente] = useState(false);
  const [criandoNovoCliente, setCriandoNovoCliente] = useState(false);
  const [modalConfigFiscalAberto, setModalConfigFiscalAberto] = useState(false);
  const [anosVidaUtil, setAnosVidaUtil] = useState<5 | 3 | 2>(() => {
    const salvo = localStorage.getItem("printlog_anos_vida_util");
    return salvo ? Number(salvo) as 5 | 3 | 2 : 5;
  });

  useEffect(() => {
    localStorage.setItem("printlog_anos_vida_util", String(anosVidaUtil));
  }, [anosVidaUtil]);
  const [indiceCanalSendoEditado, setIndiceCanalSendoEditado] = useState<number | null>(null);
  const [nomeCanalTemporario, setNomeCanalTemporario] = useState('');
  const [indiceFiscalSendoEditado, setIndiceFiscalSendoEditado] = useState<number | null>(null);
  const [nomeFiscalTemporario, setNomeFiscalTemporario] = useState('');
  const [modalConfigAberto, setModalConfigAberto] = useState(false);
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const [modalPdfAberto, setModalPdfAberto] = useState(false);

  const [mostrarPerdas, setMostrarPerdas] = useState(false);
  const [abaResultado, setAbaResultado] = useState<'orcamento' | 'metricas'>('orcamento');
  const [buscaMaterial, setBuscaMaterial] = useState("");
  const [buscaMaterialArmazem, setBuscaMaterialArmazem] = useState("");
  const [filtroTipoMaterial, setFiltroTipoMaterial] = useState<'TODOS' | 'FDM' | 'SLA'>('TODOS');
  const [buscaInsumo, setBuscaInsumo] = useState("");

  const materiaisFiltrados = useMemo(() => {
    let lista = materiais.filter(m => !m.arquivado);

    // Filtro por Tipo
    if (filtroTipoMaterial !== 'TODOS') {
      lista = lista.filter(m => m.tipo === filtroTipoMaterial);
    }

    if (!buscaMaterialArmazem) return lista;
    const termo = buscaMaterialArmazem.toLowerCase();
    return lista.filter(m =>
      m.nome.toLowerCase().includes(termo) ||
      m.fabricante?.toLowerCase().includes(termo) ||
      m.tipoMaterial?.toLowerCase().includes(termo)
    );
  }, [materiais, buscaMaterialArmazem, filtroTipoMaterial]);

  const insumosFiltrados = useMemo(() => {
    if (!buscaInsumo) return insumosEstoque;
    const termo = buscaInsumo.toLowerCase();
    return insumosEstoque.filter(i =>
      i.nome.toLowerCase().includes(termo) ||
      i.categoria?.toLowerCase().includes(termo)
    );
  }, [insumosEstoque, buscaInsumo]);

  const impressoraSelecionada = useMemo(() =>
    impressoras.find(i => i.id === hook.impressoraSelecionadaId),
    [impressoras, hook.impressoraSelecionadaId]
  );

  const alternarMaterial = useCallback((id: string) => {
    const jaSelecionado = hook.materiaisSelecionados.find(m => m.id === id);
    if (jaSelecionado) {
      hook.setMateriaisSelecionados(prev => prev.filter(m => m.id !== id));
    } else {
      const matOriginal = materiais.find(m => m.id === id);
      if (matOriginal) {
        hook.setMateriaisSelecionados(prev => [...prev, {
          id: matOriginal.id,
          nome: matOriginal.nome,
          cor: matOriginal.cor,
          tipo: matOriginal.tipo,
          tipoMaterial: matOriginal.tipoMaterial || '',
          quantidade: 0,
          precoKgCentavos: Math.round((matOriginal.precoCentavos / matOriginal.pesoGramas) * 1000)
        }]);
      }
    }
  }, [hook.materiaisSelecionados, materiais, hook.setMateriaisSelecionados]);

  const atualizarQtdMaterial = useCallback((id: string, qtd: number) => {
    hook.setMateriaisSelecionados(prev => prev.map(m => m.id === id ? { ...m, quantidade: qtd } : m));
  }, [hook.setMateriaisSelecionados]);

  const atualizarPrecoMaterial = useCallback((id: string, precoKg: number) => {
    hook.setMateriaisSelecionados(prev => prev.map(m => m.id === id ? { ...m, precoKgCentavos: Math.round(precoKg * 100) } : m));
  }, [hook.setMateriaisSelecionados]);

  const removerMaterial = useCallback((id: string) => {
    hook.setMateriaisSelecionados(prev => prev.filter(m => m.id !== id));
  }, [hook.setMateriaisSelecionados]);

  const confirmarSalvarProjeto = async () => {
    if (!clienteProjetoId) {
      toast.error("Selecione um cliente para vincular ao projeto.");
      return;
    }

    try {
      const novoPedido = await criarPedido({
        idCliente: clienteProjetoId,
        descricao: nomeProjeto || "Orçamento sem nome",
        valorCentavos: hook.calculo.precoSugerido,
        material: hook.materiaisSelecionados.length > 0 ? hook.materiaisSelecionados.map(m => m.nome).join(", ") : "Material Padrão",
        pesoGramas: hook.materiaisSelecionados.reduce((acc, m) => acc + m.quantidade, 0),
        tempoMinutos: Math.round(hook.tempo * 60),
        idImpressora: hook.impressoraSelecionadaId || undefined,
        prazoEntrega: hook.estimativaPrazo.data,
        observacoes: descricaoProjeto ? `${descricaoProjeto}\n\nGerado via calculadora em ${new Date().toLocaleDateString('pt-BR')}.` : `Gerado via calculadora em ${new Date().toLocaleDateString('pt-BR')}.`
      });

      if (novoPedido) {
        toast.success("Orçamento salvo com sucesso!");
        // Resetar Formulário
        hook.limpar();
        setNomeProjeto("");
        setDescricaoProjeto("");
        setClienteProjetoId("");
        setBuscaClienteSeletor("");
        // O navigate opcional pode ser mantido ou removido conforme preferência, 
        // mas o reset garante que se ele voltar, estará limpo.
        // Removendo navigate para fluxo contínuo de trabalho.
      }
    } catch (erro) {
      console.warn("Erro ao salvar projeto:", erro);
      hook.salvarSnapshot(nomeProjeto || "Orçamento via Calculadora");
      // Mesmo com erro de rede, o snapshot salvou no offline, então resetamos
      hook.limpar();
      setNomeProjeto("");
      setDescricaoProjeto("");
      setClienteProjetoId("");
      setBuscaClienteSeletor("");
    }
  };

  // Sincronizar potência e depreciação ao carregar ou mudar impressora
  useEffect(() => {
    if (impressoraSelecionada?.potenciaWatts) {
      hook.setPotencia(impressoraSelecionada.potenciaWatts);
    }

    // Sincroniza a depreciação (desgaste)
    if (impressoraSelecionada?.valorCompraCentavos) {
      // Cálculo automático inteligente baseado nos anos de vida útil selecionados
      const depreciacaoAnual = (impressoraSelecionada.valorCompraCentavos / 100) / anosVidaUtil;
      const depreciacaoMensal = depreciacaoAnual / 12;
      const taxaHoraReal = depreciacaoMensal / 240;
      hook.setDepreciacaoHora(Number(taxaHoraReal.toFixed(2)));
    } else if (impressoraSelecionada?.taxaHoraCentavos) {
      hook.setDepreciacaoHora(impressoraSelecionada.taxaHoraCentavos / 100);
    } else if (config?.horaMaquina) {
      hook.setDepreciacaoHora(extrairValorNumerico(config.horaMaquina));
    } else {
      hook.setDepreciacaoHora(0);
    }
  }, [impressoraSelecionada, config?.horaMaquina, anosVidaUtil, hook.setPotencia, hook.setDepreciacaoHora]);

  const alternarInsumo = useCallback((insumo: any) => {
    const existe = hook.insumosSelecionados.find(i => i.id === insumo.id);
    if (existe) hook.setInsumosSelecionados(prev => prev.filter(i => i.id !== insumo.id));
    else hook.setInsumosSelecionados(prev => [...prev, { id: insumo.id, nome: insumo.nome, quantidade: 1, custoCentavos: Math.round(insumo.custoMedioUnidade * 100) }]);
  }, [hook.insumosSelecionados, hook.setInsumosSelecionados]);

  const atualizarQtdInsumo = useCallback((id: string, qtd: number) => {
    hook.setInsumosSelecionados(prev => prev.map(i => i.id === id ? { ...i, quantidade: qtd } : i));
  }, [hook.setInsumosSelecionados]);

  const removerInsumo = useCallback((id: string) => {
    hook.setInsumosSelecionados(prev => prev.filter(i => i.id !== id));
  }, [hook.setInsumosSelecionados]);

  const aoSelecionarImpressora = useCallback((id: string) => {
    hook.setImpressoraSelecionadaId(id);
    const imp = impressoras.find(i => i.id === id);
    if (imp?.potenciaWatts) hook.setPotencia(imp.potenciaWatts);
    if (imp?.taxaHoraCentavos) {
      const taxa = imp.taxaHoraCentavos / 100;
      hook.setDepreciacaoHora(taxa);
      config.definirHoraMaquina(formatarMoedaFinancas(taxa, 2));
    }
  }, [impressoras, hook.setImpressoraSelecionadaId, hook.setPotencia, hook.setDepreciacaoHora, config]);

  const abrirModalArmazem = useCallback(() => setModalArmazemAberto(true), []);
  const abrirCriarMaterial = useCallback(() => acoesMateriais.abrirEditar(null as any), [acoesMateriais]);
  const abrirModalInsumos = useCallback(() => setModalArmazemInsumosAberto(true), []);
  const abrirModalNovoInsumo = useCallback(() => abrirCriarInsumo(), [abrirCriarInsumo]);
  const abrirModalCanais = useCallback(() => setModalCanaisAberto(true), []);
  const abrirModalFiscal = useCallback(() => setModalConfigFiscalAberto(true), []);
  const elementoAcao = useMemo(() => (
    <div className="flex items-center gap-1 bg-gray-50 dark:bg-white/5 p-1 rounded-2xl border border-gray-100 dark:border-white/5 shadow-inner">
      <div className="relative">
        <button
          onClick={() => setAbertoSeletor(!abertoSeletor)}
          className={`flex items-center gap-3 px-4 h-11 rounded-xl transition-all duration-300 group ${abertoSeletor ? "bg-white dark:bg-white/10 shadow-md" : ""}`}
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <div className="flex flex-col items-start leading-none py-0.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white mb-0.5">
              {impressoraSelecionada?.nome || "Selecionar..."}
            </span>
            {impressoraSelecionada && (
              <div className="flex items-center gap-1.5">
                {(impressoraSelecionada.marca || impressoraSelecionada.modeloBase) && (
                  <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">
                    {impressoraSelecionada.marca} {impressoraSelecionada.modeloBase}
                  </span>
                )}
                <span className="text-[8px] font-black text-sky-500 uppercase tracking-tighter">• {impressoraSelecionada.potenciaWatts}W</span>
              </div>
            )}
          </div>
          <ChevronDown size={14} className={`text-zinc-400 group-hover:text-sky-500 transition-transform ${abertoSeletor ? "rotate-180" : ""}`} />
        </button>
        {abertoSeletor && (
          <div className="absolute top-full left-0 mt-2 p-2 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/10 shadow-2xl z-[100] w-max min-w-full">
            {impressoras.map((imp) => (
              <button
                key={imp.id}
                onClick={() => { hook.setImpressoraSelecionadaId(imp.id); localStorage.setItem("printlog_ultima_impressora", imp.id); setAbertoSeletor(false); if (imp.potenciaWatts) hook.setPotencia(imp.potenciaWatts); }}
                className={`w-full flex flex-col items-start px-4 py-3 rounded-xl transition-all ${hook.impressoraSelecionadaId === imp.id ? "bg-sky-500/10 text-sky-500" : "hover:bg-gray-50 dark:hover:bg-white/5"}`}
              >
                <div className="flex items-center gap-4 w-full">
                  <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{imp.nome}</span>
                  {hook.impressoraSelecionadaId === imp.id && <Check size={14} className="ml-auto" />}
                </div>
                {(imp.marca || imp.modeloBase) && (
                  <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter mt-0.5">
                    {imp.marca} {imp.modeloBase}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      <button onClick={() => hook.limpar()} className="flex items-center justify-center w-11 h-11 rounded-xl hover:bg-white dark:hover:bg-white/10 text-zinc-400 hover:text-rose-500 transition-all" title="Limpar formulário"><RotateCcw size={18} /></button>
      <button onClick={() => setModalHistoricoAberto(true)} className="flex items-center justify-center w-11 h-11 rounded-xl hover:bg-white dark:hover:bg-white/10 text-zinc-400 hover:text-sky-500 transition-all" title="Histórico"><History size={18} /></button>
      <button onClick={() => setModalConfigAberto(true)} className="flex items-center justify-center w-11 h-11 rounded-xl hover:bg-white dark:hover:bg-white/10 text-zinc-400 hover:text-amber-500 transition-all" title="Configurações"><Settings size={18} /></button>
    </div>
  ), [abertoSeletor, hook.impressoraSelecionadaId, impressoraSelecionada?.nome, impressoras, hook.limpar]);

  const carregandoDados = estadoMateriais.carregando || (estado && estado.carregando && impressoras.length === 0);

  usarDefinirCabecalho({
    titulo: "Precificação Inteligente",
    subtitulo: "Engenharia de custos e rentabilidade",
    ocultarBusca: true,
    elementoAcao
  });

  return (
    <AnimatePresence mode="wait">
      {carregandoDados ? (
        <motion.div
          key="carregando"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-[#0c0c0e]"
        >
          <Carregamento tipo="ponto" mensagem="Sincronizando inteligência de custos..." />
        </motion.div>
      ) : (
        <motion.div
          key="conteudo"
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="absolute inset-0 grid grid-cols-1 xl:grid-cols-12 gap-8 overflow-hidden px-6 md:px-12"
        >
          <div className="xl:col-span-8 space-y-6 h-full overflow-y-auto pt-8 pb-20 scrollbar-hide">

            {/* Card Unificado de Metadados do Projeto — DESIGN PREMIUM */}
            <div className={`p-6 rounded-3xl bg-[#121214] border border-white/5 relative flex flex-col gap-6 shadow-2xl backdrop-blur-3xl group transition-all duration-500 ${abertoSeletorCliente ? 'z-50' : 'z-10'}`}>
              {/* Efeito Glow Azul de Fundo */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none transition-all duration-700" />

              <div className="relative z-10 flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#00A3FF] border border-[#00A3FF]/30">
                    <FolderKanban size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-wider text-white">Identificação do Orçamento</span>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Vincule o cliente e os detalhes técnicos</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Lado Esquerdo: Dados do Cliente */}
                <div className="md:col-span-5 flex flex-col gap-2 relative">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">Cliente do Projeto</label>
                  
                  <div className="relative flex items-center bg-zinc-950/60 border border-white/5 focus-within:border-sky-500/40 rounded-xl shadow-inner h-12 transition-all">
                    <input
                      type="text"
                      placeholder="Buscar ou digitar cliente..."
                      value={buscaClienteSeletor}
                      onChange={(e) => {
                        setBuscaClienteSeletor(e.target.value);
                        setAbertoSeletorCliente(true);
                      }}
                      onFocus={() => setAbertoSeletorCliente(true)}
                      className="w-full h-full bg-transparent px-4 font-bold text-xs text-zinc-100 outline-none placeholder:text-zinc-600"
                    />
                    <button
                      type="button"
                      onClick={() => setAbertoSeletorCliente(!abertoSeletorCliente)}
                      className="absolute right-3 text-zinc-500 hover:text-white"
                    >
                      <ChevronDown size={16} className={`transition-transform duration-300 ${abertoSeletorCliente ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {abertoSeletorCliente && (
                    <>
                      <div className="fixed inset-0 z-[40]" onClick={() => setAbertoSeletorCliente(false)} />
                      <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-[#0c0c0e] border border-white/10 rounded-xl shadow-2xl p-2 z-[50] flex flex-col gap-1 max-h-60 overflow-y-auto backdrop-blur-2xl">
                        {(() => {
                          const filtrados = (estadoClientes.clientes || []).filter(c =>
                            c.nome.toLowerCase().includes(buscaClienteSeletor.toLowerCase())
                          );
                          const clienteExato = filtrados.some(c => c.nome.toLowerCase() === buscaClienteSeletor.trim().toLowerCase());

                          return (
                            <>
                              {filtrados.map((cli) => (
                                <button
                                  key={cli.id}
                                  type="button"
                                  onClick={() => {
                                    setClienteProjetoId(cli.id);
                                    setBuscaClienteSeletor(cli.nome);
                                    setAbertoSeletorCliente(false);
                                  }}
                                  className={`w-full text-left px-3 py-2.5 rounded-lg font-bold text-xs transition-colors flex items-center justify-between ${
                                    clienteProjetoId === cli.id
                                      ? 'bg-sky-500/10 text-sky-400'
                                      : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                                  }`}
                                >
                                  <span>{cli.nome}</span>
                                  {clienteProjetoId === cli.id && <Check size={14} />}
                                </button>
                              ))}

                              {buscaClienteSeletor.trim() !== '' && !clienteExato && (
                                <button
                                  type="button"
                                  disabled={criandoNovoCliente}
                                  onClick={async () => {
                                    setCriandoNovoCliente(true);
                                    try {
                                      const novo = await acoesClientes.salvarCliente({ nome: buscaClienteSeletor.trim() });
                                      if (novo && novo.id) {
                                        setClienteProjetoId(novo.id);
                                        setBuscaClienteSeletor(novo.nome);
                                      }
                                    } catch (e) {
                                      toast.error("Erro ao criar contato.");
                                    } finally {
                                      setCriandoNovoCliente(false);
                                      setAbertoSeletorCliente(false);
                                    }
                                  }}
                                  className="w-full text-left px-3 py-2.5 rounded-lg font-bold text-xs text-zinc-500 hover:text-zinc-400 hover:bg-zinc-500/10 transition-colors flex items-center gap-2 border border-dashed border-zinc-500/20"
                                >
                                  <Plus size={14} />
                                  {criandoNovoCliente ? 'Criando...' : `Criar "${buscaClienteSeletor}"`}
                                </button>
                              )}

                              {filtrados.length === 0 && buscaClienteSeletor.trim() === '' && (
                                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider text-center py-2">
                                  Nenhum cliente cadastrado
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </>
                  )}
                </div>

                {/* Lado Direito: Nome e Descrição */}
                <div className="md:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">Nome do Projeto</label>
                    <input
                      type="text"
                      placeholder="Ex: Action Figure Batman"
                      value={nomeProjeto}
                      onChange={(e) => setNomeProjeto(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl bg-zinc-950/60 border border-white/5 focus:border-sky-500/40 outline-none font-bold text-xs text-white transition-all shadow-inner placeholder:text-zinc-700"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">Descrição / Notas técnicas</label>
                    <textarea
                      rows={1}
                      placeholder="Ex: Altura de camada 0.12mm"
                      value={descricaoProjeto}
                      onChange={(e) => setDescricaoProjeto(e.target.value)}
                      className="w-full p-3 h-12 rounded-xl bg-zinc-950/60 border border-white/5 focus:border-sky-500/40 outline-none font-bold text-xs text-white transition-all shadow-inner placeholder:text-zinc-700 resize-none"
                    />
                  </div>
                </div>

              </div>
            </div>

            <CardMateriais
              materiais={materiais.filter(m => !m.arquivado && m.nome.toLowerCase().includes(buscaMaterial.toLowerCase()))}
              selecionados={hook.materiaisSelecionados}
              alertas={hook.alertasEstoque}
              busca={buscaMaterial}
              setBusca={setBuscaMaterial}
              alternar={alternarMaterial}
              atualizarQtd={atualizarQtdMaterial}
              atualizarPreco={atualizarPrecoMaterial}
              remover={removerMaterial}
              abrirArmazem={abrirModalArmazem}
              abrirCriar={abrirCriarMaterial}
            />

            {/* Pergunta e Mini Card de Perdas Reais (Design Premium Rose) */}
            <div className="flex flex-col my-6">
              <div className="p-4 rounded-xl bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/20 flex items-center justify-between shadow-[0_4px_20px_-10px_rgba(244,63,94,0.15)] transition-all z-10 relative">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 shadow-inner">
                    <AlertTriangle size={16} className={`${hook.materialPerdido > 0 || hook.tempoPerdido > 0 ? "animate-pulse" : ""}`} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">Ocorreu alguma perda ou falha nessa impressão?</span>
                    <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">O prejuízo será calculado e embutido no custo operacional</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMostrarPerdas(!mostrarPerdas)}
                  className={`px-3 py-1.5 rounded-lg font-black uppercase text-[9px] tracking-widest transition-all border ${mostrarPerdas
                      ? "bg-rose-500 text-white border-rose-600 shadow-sm shadow-rose-500/30 hover:bg-rose-600"
                      : "bg-white dark:bg-white/5 text-zinc-400 hover:text-rose-400 hover:border-rose-500/40 border-zinc-200 dark:border-white/10"
                    }`}
                >
                  {mostrarPerdas ? "Ocultar" : "Reportar"}
                </button>
              </div>

              <AnimatePresence>
                {mostrarPerdas && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="p-6 pt-8 rounded-b-xl bg-[linear-gradient(to_bottom,transparent_12px,#fafafa_12px)] dark:bg-[linear-gradient(to_bottom,transparent_12px,#18181b_12px)] shadow-sm space-y-4 -mt-3 z-0 relative overflow-hidden"
                  >

                    {/* Quininhas para preencher o gap dos cantos arredondados */}
                    <div className="absolute top-0 left-0 w-[12px] h-[12px] bg-[radial-gradient(circle_at_100%_0%,transparent_12px,#fafafa_12px)] dark:bg-[radial-gradient(circle_at_100%_0%,transparent_12px,#18181b_12px)] z-[-1]" />
                    <div className="absolute top-0 right-0 w-[12px] h-[12px] bg-[radial-gradient(circle_at_0%_0%,transparent_12px,#fafafa_12px)] dark:bg-[radial-gradient(circle_at_0%_0%,transparent_12px,#18181b_12px)] z-[-1]" />
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-white/5">
                      <AlertCircle size={16} className="text-rose-400" />
                      <h3 className="text-[10px] font-black uppercase tracking-wider text-rose-500">Registro de Desperdício</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider ml-1">Filamento Perdido</label>
                        <div className="relative flex items-center bg-white dark:bg-black/20 rounded-xl border border-zinc-200 dark:border-white/10 focus-within:border-rose-500/40 shadow-inner">
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={hook.materialPerdido || ""}
                            onChange={(e) => hook.setMaterialPerdido(Number(e.target.value))}
                            className="w-full h-11 bg-transparent px-4 font-black text-xs text-zinc-900 dark:text-white outline-none"
                          />
                          <span className="absolute right-4 text-[10px] font-black text-zinc-400">gramas</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider ml-1">Tempo Perdido</label>
                        <div className="relative flex items-center bg-white dark:bg-black/20 rounded-xl border border-zinc-200 dark:border-white/10 focus-within:border-rose-500/40 shadow-inner">
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={hook.tempoPerdido / 60 || ""}
                            onChange={(e) => hook.setTempoPerdido(Number(e.target.value) * 60)}
                            className="w-full h-11 bg-transparent px-4 font-black text-xs text-zinc-900 dark:text-white outline-none"
                          />
                          <span className="absolute right-4 text-[10px] font-black text-zinc-400">horas</span>
                        </div>
                      </div>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <CardInsumos
              insumos={insumosFiltrados}
              selecionados={hook.insumosSelecionados}
              alertas={hook.alertasInsumos}
              busca={buscaInsumo} setBusca={setBuscaInsumo}
              alternar={alternarInsumo}
              atualizarQtd={atualizarQtdInsumo}
              remover={removerInsumo}
              insumosFixos={hook.insumosFixos} setInsumosFixos={hook.setInsumosFixos}
              abrirGerenciar={abrirModalInsumos}
              abrirNovo={abrirModalNovoInsumo}
            />

            <CardProducao
              quantidade={hook.quantidade} setQuantidade={hook.setQuantidade}
              tempo={hook.tempo} setTempo={hook.setTempo}
              potencia={hook.potencia} setPotencia={hook.setPotencia}
              precoKwh={hook.precoKwh} setPrecoKwh={(v) => { hook.setPrecoKwh(v); config.definirCustoEnergia(formatarMoedaFinancas(v, 2)); }}
              custoEnergia={hook.calculo.custoEnergia / 100}
              cobrarEnergia={hook.cobrarEnergia} setCobrarEnergia={hook.setCobrarEnergia}
              posProcesso={hook.itensPosProcesso} setPosProcesso={hook.setItensPosProcesso}
              impressoras={impressoras}
              idImpressoraSelecionada={hook.impressoraSelecionadaId}
              aoSelecionarImpressora={aoSelecionarImpressora}
            />

            <CardOperacional
              maoDeObra={hook.maoDeObra} setMaoDeObra={(v) => { hook.setMaoDeObra(v); config.definirHoraOperador(formatarMoedaFinancas(v, 2)); }}
              margem={hook.margem} setMargem={(v) => { hook.setMargem(v); config.definirMargemLucro(formatarPorcentagem(String(v))); }}
              depreciacao={hook.depreciacaoHora}
              cobrarDesgaste={hook.cobrarDesgaste} setCobrarDesgaste={hook.setCobrarDesgaste}
              cobrarMaoDeObra={hook.cobrarMaoDeObra} setCobrarMaoDeObra={hook.setCobrarMaoDeObra}
              anosVidaUtil={anosVidaUtil} setAnosVidaUtil={setAnosVidaUtil}
              tempo={hook.tempo} // Mantendo pra depreciação
              tempoSetup={hook.tempoSetup} setTempoSetup={hook.setTempoSetup}
            />

            <CardLogistica
              perfis={hook.perfisMarketplace} perfilAtivo={hook.perfilAtivo} setPerfilAtivo={hook.setPerfilAtivo}
              taxaEcommerce={hook.taxaEcommerce} setTaxaEcommerce={hook.setTaxaEcommerce}
              taxaFixa={hook.taxaFixa} setTaxaFixa={hook.setTaxaFixa}
              frete={hook.frete} setFrete={hook.setFrete}
              abrirPerfis={abrirModalCanais}
            />

            <CardFiscal
              perfisFiscais={hook.perfisFiscais}
              tipoOperacao={hook.tipoOperacao} setTipoOperacao={hook.setTipoOperacao}
              impostos={hook.impostos} setImpostos={hook.setImpostos}
              icms={hook.icms} setIcms={hook.setIcms}
              iss={hook.iss} setIss={hook.setIss}
              cobrarImpostos={hook.cobrarImpostos} setCobrarImpostos={hook.setCobrarImpostos}
              abrirConfigFiscal={abrirModalFiscal}
            />
          </div>

          <div className="xl:col-span-4 h-full xl:sticky xl:top-0 flex flex-col justify-center items-center py-8 overflow-y-auto scrollbar-hide">
            <PainelResultados
              calculo={hook.calculo}
              dadosPizza={hook.dadosGraficoPizza}
              aba={abaResultado} setAba={setAbaResultado}
              salvarProjeto={confirmarSalvarProjeto}
              gerarPdf={() => {
                const clienteFinal = buscaClienteSeletor.trim() || "Consumidor Final";
                if (!eProOuSuperior) {
                  hook.gerarPdf("", "", clienteFinal, nomeProjeto);
                } else if (config.nomeEstudio.trim() !== "") {
                  hook.gerarPdf(config.nomeEstudio, config.sloganEstudio, clienteFinal, nomeProjeto);
                } else {
                  setModalPdfAberto(true);
                }
              }}
              carregandoPdf={false}
              materiais={hook.materiaisSelecionados}
              insumos={hook.insumosSelecionados}
              posProcesso={hook.itensPosProcesso}
              quantidade={hook.quantidade}
              insumosFixos={hook.insumosFixos}
            />
          </div>

          {/* Modais de Gerenciamento (Zustand) */}
          <ModalListagemPremium
            aberto={modalArmazemAberto}
            aoFechar={() => setModalArmazemAberto(false)}
            titulo="Armazém de Materiais"
            iconeTitulo={Settings}
            corDestaque="sky"
            termoBusca={buscaMaterialArmazem}
            aoMudarBusca={setBuscaMaterialArmazem}
            temResultados={true}
            totalResultados={materiaisFiltrados.length}
            elementoExtra={
              <div className="flex items-center gap-1 p-1 h-full">
                {[
                  { id: 'TODOS', label: 'Tudo' },
                  { id: 'FDM', label: 'Filamento' },
                  { id: 'SLA', label: 'Resina' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFiltroTipoMaterial(f.id as any)}
                    className={`px-6 h-full min-w-[100px] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filtroTipoMaterial === f.id
                        ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                        : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                      }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Botão Novo Material */}
              <button
                onClick={() => {
                  setModalArmazemAberto(false);
                  acoesMateriais.abrirEditar(null as any);
                }}
                className="p-3 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-sky-500/50 hover:bg-sky-500/5 transition-all flex items-center gap-4 h-24 group"
              >
                <div className="shrink-0 w-14 flex items-center justify-center">
                  <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-all">
                    <Plus size={22} />
                  </div>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">Novo Material</span>
                  <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">Adicionar ao catálogo</span>
                </div>
              </button>

              {materiaisFiltrados.map(m => {
                const selecionado = hook.materiaisSelecionados.some(s => s.id === m.id);
                const unidade = m.tipo === 'SLA' ? 'ml' : 'g';
                const totalKgOuL = m.pesoGramas / 1000;
                const precoPorUnidade = (m.precoCentavos / 100) / totalKgOuL;

                return (
                  <button
                    key={m.id}
                    onClick={() => alternarMaterial(m.id)}
                    className={`p-3 rounded-2xl border-2 transition-all text-left flex items-center gap-4 relative overflow-hidden h-24 bg-white dark:bg-zinc-900/50 ${selecionado ? "shadow-md" : "hover:shadow-lg"
                      }`}
                    style={{
                      borderColor: selecionado ? m.cor : `${m.cor}22`,
                      backgroundColor: selecionado ? `${m.cor}11` : undefined
                    }}
                  >
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 opacity-40"
                      style={{ backgroundColor: m.cor || '#888' }}
                    />

                    <div className="shrink-0 w-14 flex items-center justify-center">
                      <div className="group-hover:scale-110 transition-transform duration-500">
                        {m.tipo === 'SLA' ? (
                          <GarrafaResina cor={m.cor} tamanho={36} porcentagem={(m.pesoRestanteGramas / m.pesoGramas) * 100} />
                        ) : (
                          <Carretel cor={m.cor} tamanho={42} porcentagem={(m.pesoRestanteGramas / m.pesoGramas) * 100} />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-1">
                      <div className="flex justify-between items-start">
                        <div className="min-w-0">
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-900 dark:text-white truncate">
                            {m.nome}
                          </h4>
                          <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter truncate">
                            {m.fabricante} • {m.tipoMaterial}
                          </p>
                        </div>
                        {selecionado && (
                          <div className="shrink-0 w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center text-white shadow-lg z-10">
                            <Check size={12} />
                          </div>
                        )}
                      </div>

                      <div className="flex items-end justify-between gap-2 border-t border-gray-100 dark:border-white/5 pt-2 mt-1">
                        <div className="flex flex-col">
                          <span className="text-[7px] font-black text-zinc-400 uppercase tracking-widest">Saldo</span>
                          <span className={`text-[9px] font-black tabular-nums ${m.pesoRestanteGramas < 100 ? 'text-rose-500' : 'text-zinc-600 dark:text-zinc-300'}`}>
                            {m.pesoRestanteGramas}{unidade}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black text-emerald-500 tracking-tighter tabular-nums">
                            R$ {precoPorUnidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </ModalListagemPremium>

          <ModalHistorico aberto={modalHistoricoAberto} aoFechar={() => setModalHistoricoAberto(false)} historico={hook.historico} aoSalvar={hook.salvarSnapshot} aoCarregar={(v) => { hook.carregarSnapshot(v); setModalHistoricoAberto(false); }} aoRemover={hook.removerSnapshot} />

          <Dialogo aberto={modalConfigAberto} aoFechar={() => setModalConfigAberto(false)} larguraMax="max-w-4xl" esconderCabecalho={true}>
            <div className="flex flex-col md:flex-row bg-[#121214] rounded-2xl overflow-hidden shadow-2xl relative w-full border border-zinc-800">

              {/* PAINEL ESQUERDO: IDENTIDADE (PDF) */}
              <div className="w-full md:w-2/5 p-8 bg-[#18181b] relative flex flex-col border-b md:border-b-0 md:border-r border-zinc-800">
                <div className="relative z-10 flex-1 flex flex-col justify-between h-full">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <Crown size={16} className="text-zinc-400" />
                      <h3 className="text-xs font-black uppercase tracking-widest text-zinc-300">Personalizar Orçamento</h3>
                    </div>

                    <div className={`space-y-4 transition-all ${!eProOuSuperior ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                      <div className="flex flex-col gap-1.5 group">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">Nome do Estúdio</label>
                        <input
                          type="text"
                          placeholder="Ex: PrintPro Lab"
                          value={config.nomeEstudio}
                          onChange={(e) => config.definirIdentidadeEstudio(e.target.value, config.sloganEstudio)}
                          className="w-full h-11 bg-zinc-900 border border-zinc-800 rounded-lg px-3 text-xs font-bold text-white focus:border-zinc-700 focus:outline-none transition-all placeholder:text-zinc-600 shadow-sm"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 group">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">Slogan / Frase de Rodapé</label>
                        <input
                          type="text"
                          placeholder="Ex: Impressão 3D de alta precisão"
                          value={config.sloganEstudio}
                          onChange={(e) => config.definirIdentidadeEstudio(config.nomeEstudio, e.target.value)}
                          className="w-full h-11 bg-zinc-900 border border-zinc-800 rounded-lg px-3 text-xs font-bold text-white focus:border-zinc-700 focus:outline-none transition-all placeholder:text-zinc-600 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview Dinâmico do Rodapé PRO */}
                  {eProOuSuperior && (
                    <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col gap-1 mt-6">
                      <span className="text-[9px] font-black uppercase text-zinc-500 border-b border-zinc-800 pb-1.5 mb-1 tracking-wider">
                        Pré-Visualização
                      </span>
                      <span className="text-xs font-bold text-zinc-200 truncate">
                        {config.nomeEstudio || "Seu Estúdio"}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-500 italic truncate">
                        {config.sloganEstudio || "Seu slogan aqui"}
                      </span>
                    </div>
                  )}

                  {!eProOuSuperior && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-sm rounded-xl text-center gap-2">
                      <Crown size={24} className="text-zinc-500" />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-black uppercase tracking-wider text-zinc-300">Exclusivo PRO</span>
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                          Personalize seus orçamentos
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative z-10 mt-6 flex justify-between items-center text-[8px] font-bold text-zinc-600 uppercase tracking-widest pt-4 border-t border-zinc-800/40">
                  <span>PrintLog OS</span>
                  <span>2026</span>
                </div>
              </div>

              {/* PAINEL DIREITO: MOTORES OPERACIONAIS */}
              <div className="w-full md:w-3/5 p-8 bg-[#121214] relative flex flex-col justify-between">
                <button
                  onClick={() => setModalConfigAberto(false)}
                  className="absolute top-6 right-6 w-8 h-8 rounded-lg text-zinc-500 hover:text-zinc-200 transition-all bg-zinc-900 border border-zinc-800 flex items-center justify-center"
                >
                  <X size={14} />
                </button>

                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                    <Settings size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-zinc-200 leading-none">Operacional</h3>
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Motores base de custeio</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 items-center">
                  {/* Energia */}
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Zap size={14} className="text-zinc-500" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Energia</span>
                        <span className="text-[7px] font-bold text-zinc-500">Custo por kWh</span>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="R$ 0,00"
                      value={extrairValorNumerico(config.custoEnergia) === 0 ? "" : config.custoEnergia}
                      onChange={(e) => {
                        config.definirCustoEnergia(e.target.value);
                        hook.setPrecoKwh(extrairValorNumerico(e.target.value));
                      }}
                      className="w-full h-10 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 outline-none rounded-lg px-3 font-bold text-xs text-white text-center"
                    />
                  </div>

                  {/* Margem */}
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Percent size={14} className="text-zinc-500" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Margem Lucro</span>
                        <span className="text-[7px] font-bold text-zinc-500">Padrão do estúdio</span>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="0,00%"
                      value={extrairValorNumerico(config.margemLucro) === 0 ? "" : config.margemLucro}
                      onChange={(e) => {
                        config.definirMargemLucro(e.target.value);
                        hook.setMargem(extrairValorNumerico(e.target.value));
                      }}
                      className="w-full h-10 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 outline-none rounded-lg px-3 font-bold text-xs text-white text-center"
                    />
                  </div>

                  {/* Operador */}
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Wrench size={14} className="text-zinc-500" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Operador</span>
                        <span className="text-[7px] font-bold text-zinc-500">Mão de obra / h</span>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="R$ 0,00"
                      value={extrairValorNumerico(config.horaOperador) === 0 ? "" : config.horaOperador}
                      onChange={(e) => {
                        config.definirHoraOperador(e.target.value);
                        hook.setMaoDeObra(extrairValorNumerico(e.target.value));
                      }}
                      className="w-full h-10 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 outline-none rounded-lg px-3 font-bold text-xs text-white text-center"
                    />
                  </div>

                  {/* Máquina */}
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-zinc-500" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Máquina</span>
                        <span className="text-[7px] font-bold text-zinc-500">Uso do equipamento / h</span>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="R$ 0,00"
                      value={extrairValorNumerico(config.horaMaquina) === 0 ? "" : config.horaMaquina}
                      onChange={(e) => {
                        config.definirHoraMaquina(e.target.value);
                        hook.setDepreciacaoHora(extrairValorNumerico(e.target.value));
                      }}
                      className="w-full h-10 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 outline-none rounded-lg px-3 font-bold text-xs text-white text-center"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={async () => {
                      config.definirCustoEnergia(config.custoEnergia && config.custoEnergia.trim() !== "" ? formatarMoedaFinancas(hook.precoKwh, 2) : "R$ 0,00");
                      config.definirHoraOperador(config.horaOperador && config.horaOperador.trim() !== "" ? formatarMoedaFinancas(hook.maoDeObra, 2) : "R$ 0,00");
                      config.definirHoraMaquina(config.horaMaquina && config.horaMaquina.trim() !== "" ? formatarMoedaFinancas(hook.depreciacaoHora, 3) : "R$ 0,000");
                      config.definirMargemLucro(config.margemLucro && config.margemLucro.trim() !== "" ? formatarPorcentagem(String(hook.margem)) : "0,00%");
                      if (usuario?.uid) {
                        await config.salvarNoD1(usuario.uid);
                        setModalConfigAberto(false);
                        toast.success("Motores de custeio sincronizados!");
                      }
                    }}
                    className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-bold uppercase text-[10px] tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 shadow"
                  >
                    <Settings size={14} /> Salvar & Sincronizar
                  </button>
                </div>

              </div>
            </div>
          </Dialogo>

          <FormularioMaterial aberto={estadoMateriais.modalAberto} aoSalvar={acoesMateriais.salvarMaterial} aoCancelar={acoesMateriais.fecharEditar} materialEditando={estadoMateriais.materialSendoEditado} />

          {/* Modal Configurações Fiscais */}
          <ModalListagemPremium
            aberto={modalConfigFiscalAberto}
            aoFechar={() => setModalConfigFiscalAberto(false)}
            titulo="Estrutura Fiscal"
            iconeTitulo={TrendingUp}
            corDestaque="violet"
            termoBusca=""
            aoMudarBusca={() => { }}
            temResultados={true}
            totalResultados={hook.perfisFiscais?.length || 0}
            larguraMax="max-w-3xl"
            altura="h-[70vh]"
          >
            <div className="flex flex-col h-full justify-between">
              <div className="overflow-y-auto max-h-[42vh] pr-2 space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  {hook.perfisFiscais?.map((p, idx) => {
                    const selecionado = hook.tipoOperacao === p.nome.toLowerCase();
                    return (
                      <div
                        key={p.nome}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-4 transition-all ${selecionado ? "border-violet-500 bg-violet-500/5" : "border-gray-100 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-800/10"
                          }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                          onClick={() => {
                            hook.setTipoOperacao(p.nome.toLowerCase());
                            hook.setImpostos(p.base);
                            hook.setIcms(p.icms);
                            hook.setIss(p.iss);
                          }}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selecionado ? "bg-violet-500 text-white" : "bg-gray-100 dark:bg-zinc-800 text-zinc-400"}`}>
                            <TrendingUp size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            {indiceFiscalSendoEditado === idx ? (
                              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="text"
                                  value={nomeFiscalTemporario}
                                  onChange={(e) => setNomeFiscalTemporario(e.target.value)}
                                  className="flex-1 min-w-0 h-8 px-2 rounded-lg bg-white dark:bg-zinc-900 border border-violet-500 font-bold text-xs outline-none"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      if (!nomeFiscalTemporario.trim()) return;
                                      const novos = [...hook.perfisFiscais];
                                      const nomeAntigo = novos[idx].nome;
                                      novos[idx].nome = nomeFiscalTemporario.trim();
                                      hook.setPerfisFiscais(novos);
                                      if (hook.tipoOperacao === nomeAntigo.toLowerCase()) {
                                        hook.setTipoOperacao(nomeFiscalTemporario.trim().toLowerCase());
                                      }
                                      setIndiceFiscalSendoEditado(null);
                                    } else if (e.key === 'Escape') {
                                      setIndiceFiscalSendoEditado(null);
                                    }
                                  }}
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!nomeFiscalTemporario.trim()) return;
                                    const novos = [...hook.perfisFiscais];
                                    const nomeAntigo = novos[idx].nome;
                                    novos[idx].nome = nomeFiscalTemporario.trim();
                                    hook.setPerfisFiscais(novos);
                                    if (hook.tipoOperacao === nomeAntigo.toLowerCase()) {
                                      hook.setTipoOperacao(nomeFiscalTemporario.trim().toLowerCase());
                                    }
                                    setIndiceFiscalSendoEditado(null);
                                  }}
                                  className="w-7 h-7 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 flex items-center justify-center transition-colors shrink-0"
                                  title="Salvar"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIndiceFiscalSendoEditado(null);
                                  }}
                                  className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 flex items-center justify-center transition-colors shrink-0"
                                  title="Cancelar"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 group/nome">
                                <h4 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white truncate">
                                  {p.nome}
                                </h4>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIndiceFiscalSendoEditado(idx);
                                    setNomeFiscalTemporario(p.nome);
                                  }}
                                  className="opacity-0 group-hover/nome:opacity-100 hover:scale-110 active:scale-95 transition-all text-zinc-400 hover:text-violet-500 p-1 flex items-center justify-center rounded-md"
                                  title="Alterar Nome"
                                >
                                  <Pencil size={12} />
                                </button>
                              </div>
                            )}
                            {selecionado && <span className="text-[10px] font-black uppercase text-violet-500">Ativo</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter mb-1">Base (%)</span>
                            <input
                              type="number"
                              value={p.base ?? ""}
                              onChange={(e) => {
                                const novos = [...hook.perfisFiscais];
                                novos[idx].base = Number(e.target.value);
                                hook.setPerfisFiscais(novos);
                                if (selecionado) hook.setImpostos(Number(e.target.value));
                              }}
                              className="w-16 h-8 px-2 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 font-black text-xs outline-none text-right focus:border-violet-500"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter mb-1">ICMS (%)</span>
                            <input
                              type="number"
                              value={p.icms ?? ""}
                              onChange={(e) => {
                                const novos = [...hook.perfisFiscais];
                                novos[idx].icms = Number(e.target.value);
                                hook.setPerfisFiscais(novos);
                                if (selecionado) hook.setIcms(Number(e.target.value));
                              }}
                              className="w-16 h-8 px-2 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 font-black text-xs outline-none text-right focus:border-violet-500"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter mb-1">ISS (%)</span>
                            <input
                              type="number"
                              value={p.iss ?? ""}
                              onChange={(e) => {
                                const novos = [...hook.perfisFiscais];
                                novos[idx].iss = Number(e.target.value);
                                hook.setPerfisFiscais(novos);
                                if (selecionado) hook.setIss(Number(e.target.value));
                              }}
                              className="w-16 h-8 px-2 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 font-black text-xs outline-none text-right focus:border-violet-500"
                            />
                          </div>
                          {p.nome !== "Produto" && p.nome !== "Servico" && p.nome !== "Industrializacao" && p.nome !== "MEI" ? (
                            <button
                              onClick={() => {
                                const novos = hook.perfisFiscais.filter((_, i) => i !== idx);
                                hook.setPerfisFiscais(novos);
                                if (selecionado) {
                                  hook.setTipoOperacao("produto");
                                  hook.setImpostos(0);
                                  hook.setIcms(18);
                                  hook.setIss(0);
                                }
                              }}
                              className="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 flex items-center justify-center transition-colors self-end"
                            >
                              <Trash size={14} />
                            </button>
                          ) : (
                            <div className="w-8 h-8 self-end" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 bg-gray-50/30 dark:bg-zinc-800/5 rounded-xl border border-dashed border-gray-200 dark:border-white/5 mt-4 shrink-0">
                <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Adicionar Novo Regime</span>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    placeholder="Ex: Simples Nacional"
                    id="novoFiscalNome"
                    className="flex-1 min-w-[120px] h-9 px-3 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 font-bold text-xs outline-none focus:border-violet-500"
                  />
                  <input
                    type="number"
                    placeholder="Base %"
                    id="novoFiscalBase"
                    className="w-20 h-9 px-3 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 font-bold text-xs outline-none text-right focus:border-violet-500"
                  />
                  <input
                    type="number"
                    placeholder="ICMS %"
                    id="novoFiscalIcms"
                    className="w-20 h-9 px-3 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 font-bold text-xs outline-none text-right focus:border-violet-500"
                  />
                  <input
                    type="number"
                    placeholder="ISS %"
                    id="novoFiscalIss"
                    className="w-20 h-9 px-3 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 font-bold text-xs outline-none text-right focus:border-violet-500"
                  />
                  <button
                    onClick={() => {
                      const nomeEl = document.getElementById("novoFiscalNome") as HTMLInputElement;
                      const baseEl = document.getElementById("novoFiscalBase") as HTMLInputElement;
                      const icmsEl = document.getElementById("novoFiscalIcms") as HTMLInputElement;
                      const issEl = document.getElementById("novoFiscalIss") as HTMLInputElement;

                      if (!nomeEl || !nomeEl.value) {
                        toast.error("Informe o nome do regime!");
                        return;
                      }

                      const novo = {
                        nome: nomeEl.value,
                        base: Number(baseEl.value) || 0,
                        icms: Number(icmsEl.value) || 0,
                        iss: Number(issEl.value) || 0
                      };

                      hook.setPerfisFiscais([...hook.perfisFiscais, novo]);
                      nomeEl.value = "";
                      baseEl.value = "";
                      icmsEl.value = "";
                      issEl.value = "";
                      toast.success("Regime fiscal adicionado!");
                    }}
                    className="px-4 h-9 bg-zinc-900 dark:bg-white text-white dark:text-black font-black uppercase text-[10px] tracking-wider rounded-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={14} />
                    Salvar
                  </button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-6">
                <div className="space-y-3">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-violet-400">Guia: Venda (ICMS)</h5>
                  <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                    Use para produtos de <span className="text-zinc-200">pronta entrega</span> ou fabricação em série. 
                    Geralmente tributado pelo <span className="text-zinc-200">Anexo I do Simples Nacional (4%)</span>. 
                    CNAE comum: 4789-0/99.
                  </p>
                </div>
                <div className="space-y-3">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-violet-400">Guia: Serviço (ISS)</h5>
                  <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                    Use para <span className="text-zinc-200">encomendas personalizadas</span> onde o cliente fornece o arquivo. 
                    Geralmente tributado pelo <span className="text-zinc-200">Anexo III do Simples Nacional (6%)</span>. 
                    CNAE comum: 1813-0/99.
                  </p>
                </div>
              </div>
            </div>
          </ModalListagemPremium>

          {/* Modal Canais de Venda */}
          <ModalListagemPremium
            aberto={modalCanaisAberto}
            aoFechar={() => setModalCanaisAberto(false)}
            titulo="Canais de Venda" corDestaque="orange"
            termoBusca=""
            aoMudarBusca={() => { }}
            temResultados={true}
            totalResultados={hook.perfisMarketplace.length}
            larguraMax="max-w-2xl"
            altura="h-[70vh]"
          >
            <div className="flex flex-col h-full justify-between">
              <div className="overflow-y-auto max-h-[42vh] pr-2 space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  {hook.perfisMarketplace.map((p, idx) => {
                    const selecionado = hook.perfilAtivo === p.nome;
                    return (
                      <div
                        key={p.nome}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-4 transition-all ${selecionado ? "border-orange-500 bg-orange-500/5" : "border-gray-100 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-800/10"
                          }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => hook.setPerfilAtivo(p.nome)}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selecionado ? "bg-orange-500 text-white" : "bg-gray-100 dark:bg-zinc-800 text-zinc-400"}`}>
                            <Settings size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            {indiceCanalSendoEditado === idx ? (
                              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="text"
                                  value={nomeCanalTemporario}
                                  onChange={(e) => setNomeCanalTemporario(e.target.value)}
                                  className="flex-1 min-w-0 h-8 px-2 rounded-lg bg-white dark:bg-zinc-900 border border-orange-500 font-bold text-xs outline-none"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      if (!nomeCanalTemporario.trim()) return;
                                      const novos = [...hook.perfisMarketplace];
                                      const nomeAntigo = novos[idx].nome;
                                      novos[idx].nome = nomeCanalTemporario.trim();
                                      hook.setPerfisMarketplace(novos);
                                      if (hook.perfilAtivo === nomeAntigo) {
                                        hook.setPerfilAtivo(nomeCanalTemporario.trim());
                                      }
                                      setIndiceCanalSendoEditado(null);
                                    } else if (e.key === 'Escape') {
                                      setIndiceCanalSendoEditado(null);
                                    }
                                  }}
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!nomeCanalTemporario.trim()) return;
                                    const novos = [...hook.perfisMarketplace];
                                    const nomeAntigo = novos[idx].nome;
                                    novos[idx].nome = nomeCanalTemporario.trim();
                                    hook.setPerfisMarketplace(novos);
                                    if (hook.perfilAtivo === nomeAntigo) {
                                      hook.setPerfilAtivo(nomeCanalTemporario.trim());
                                    }
                                    setIndiceCanalSendoEditado(null);
                                  }}
                                  className="w-7 h-7 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 flex items-center justify-center transition-colors shrink-0"
                                  title="Salvar"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIndiceCanalSendoEditado(null);
                                  }}
                                  className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 flex items-center justify-center transition-colors shrink-0"
                                  title="Cancelar"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 group/nome">
                                <h4 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white truncate">
                                  {p.nome}
                                </h4>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIndiceCanalSendoEditado(idx);
                                    setNomeCanalTemporario(p.nome);
                                  }}
                                  className="opacity-0 group-hover/nome:opacity-100 hover:scale-110 active:scale-95 transition-all text-zinc-400 hover:text-orange-500 p-1 flex items-center justify-center rounded-md"
                                  title="Alterar Nome"
                                >
                                  <Pencil size={12} />
                                </button>
                              </div>
                            )}
                            {selecionado && <span className="text-[10px] font-black uppercase text-orange-500">Ativo</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter mb-1">Taxa (%)</span>
                            <input
                              type="number"
                              value={p.taxa ?? ""}
                              onChange={(e) => {
                                const novos = [...hook.perfisMarketplace];
                                novos[idx].taxa = Number(e.target.value);
                                hook.setPerfisMarketplace(novos);
                              }}
                              className="w-16 h-8 px-2 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 font-black text-xs outline-none text-right focus:border-orange-500"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter mb-1">Fixa (R$)</span>
                            <input
                              type="number"
                              value={p.fixa ?? ""}
                              onChange={(e) => {
                                const novos = [...hook.perfisMarketplace];
                                novos[idx].fixa = Number(e.target.value);
                                hook.setPerfisMarketplace(novos);
                              }}
                              className="w-16 h-8 px-2 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 font-black text-xs outline-none text-right focus:border-orange-500"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter mb-1">Frete (R$)</span>
                            <input
                              type="number"
                              value={p.frete ?? 0}
                              onChange={(e) => {
                                const novos = [...hook.perfisMarketplace];
                                novos[idx].frete = Number(e.target.value);
                                hook.setPerfisMarketplace(novos);
                                if (selecionado) hook.setFrete(Number(e.target.value));
                              }}
                              className="w-16 h-8 px-2 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 font-black text-xs outline-none text-right focus:border-orange-500"
                            />
                          </div>
                          {p.nome !== "Direto" ? (
                            <button
                              onClick={() => {
                                const novos = hook.perfisMarketplace.filter((_, i) => i !== idx);
                                hook.setPerfisMarketplace(novos);
                                if (selecionado) hook.setPerfilAtivo("Direto");
                              }}
                              className="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 flex items-center justify-center transition-colors self-end"
                            >
                              <Trash size={14} />
                            </button>
                          ) : (
                            <div className="w-8 h-8 self-end" /> /* Espaçador para manter alinhamento */
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 bg-gray-50/30 dark:bg-zinc-800/5 rounded-xl border border-dashed border-gray-200 dark:border-white/5 mt-4 shrink-0">
                <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Adicionar Novo Canal</span>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    placeholder="Ex: Mercado Livre"
                    id="novoCanalNome"
                    className="flex-1 min-w-[120px] h-9 px-3 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 font-bold text-xs outline-none focus:border-orange-500"
                  />
                  <input
                    type="number"
                    placeholder="Taxa %"
                    id="novoCanalTaxa"
                    className="w-20 h-9 px-3 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 font-bold text-xs outline-none text-right focus:border-orange-500"
                  />
                  <input
                    type="number"
                    placeholder="Fixa R$"
                    id="novoCanalFixa"
                    className="w-20 h-9 px-3 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 font-bold text-xs outline-none text-right focus:border-orange-500"
                  />
                  <input
                    type="number"
                    placeholder="Frete R$"
                    id="novoCanalFrete"
                    className="w-20 h-9 px-3 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 font-bold text-xs outline-none text-right focus:border-orange-500"
                  />
                  <button
                    onClick={() => {
                      const nomeEl = document.getElementById("novoCanalNome") as HTMLInputElement;
                      const taxaEl = document.getElementById("novoCanalTaxa") as HTMLInputElement;
                      const fixaEl = document.getElementById("novoCanalFixa") as HTMLInputElement;
                      const freteEl = document.getElementById("novoCanalFrete") as HTMLInputElement;

                      if (!nomeEl || !nomeEl.value) {
                        toast.error("Informe o nome do canal!");
                        return;
                      }

                      const novo = {
                        nome: nomeEl.value,
                        taxa: Number(taxaEl.value) || 0,
                        fixa: Number(fixaEl.value) || 0,
                        frete: Number(freteEl.value) || 0,
                        ins: 0,
                        imp: 6
                      };

                      hook.setPerfisMarketplace([...hook.perfisMarketplace, novo]);
                      nomeEl.value = "";
                      taxaEl.value = "";
                      fixaEl.value = "";
                      freteEl.value = "";
                      toast.success("Canal adicionado!");
                    }}
                    className="px-4 h-9 bg-zinc-900 dark:bg-white text-white dark:text-black font-black uppercase text-[10px] tracking-wider rounded-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={14} />
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </ModalListagemPremium>

          {/* Modal Armazém de Insumos */}
          <ModalListagemPremium
            aberto={modalArmazemInsumosAberto}
            aoFechar={() => setModalArmazemInsumosAberto(false)}
            titulo="Armazém de Insumos"
            iconeTitulo={Box}
            corDestaque="indigo"
            termoBusca={buscaInsumo}
            aoMudarBusca={setBuscaInsumo}
            temResultados={true}
            totalResultados={insumosFiltrados.length}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Botão Novo Insumo */}
              <button
                onClick={() => {
                  setModalArmazemInsumosAberto(false);
                  abrirCriarInsumo();
                }}
                className="p-3 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all flex items-center gap-4 h-24 group"
              >
                <div className="shrink-0 w-14 flex items-center justify-center">
                  <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    <Plus size={22} />
                  </div>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">Novo Insumo</span>
                  <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">Adicionar ao estoque</span>
                </div>
              </button>

              {insumosFiltrados.map(i => {
                const selecionado = hook.insumosSelecionados.some(s => s.id === i.id);
                return (
                  <button
                    key={i.id}
                    onClick={() => {
                      const existe = hook.insumosSelecionados.find(s => s.id === i.id);
                      if (existe) hook.setInsumosSelecionados(prev => prev.filter(p => p.id !== i.id));
                      else hook.setInsumosSelecionados(prev => [...prev, { id: i.id, nome: i.nome, quantidade: 1, custoCentavos: i.custoMedioUnidade }]);
                    }}
                    className={`p-3 rounded-2xl border-2 transition-all text-left flex items-center gap-4 relative overflow-hidden h-24 bg-white dark:bg-zinc-900/50 ${selecionado ? "border-indigo-500 shadow-md bg-indigo-500/5" : "border-gray-50 dark:border-white/5 hover:border-indigo-500/30"
                      }`}
                  >
                    <div className="shrink-0 w-14 flex items-center justify-center">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${selecionado ? "bg-indigo-500 text-white" : "bg-gray-100 dark:bg-white/5 text-zinc-400 group-hover:text-indigo-500"}`}>
                        <Package size={22} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-1">
                      <div className="flex justify-between items-start">
                        <div className="min-w-0">
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-900 dark:text-white truncate">
                            {i.nome}
                          </h4>
                          <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter truncate">
                            {i.categoria || 'Geral'}
                          </p>
                        </div>
                        {selecionado && (
                          <div className="shrink-0 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-lg">
                            <Check size={12} />
                          </div>
                        )}
                      </div>

                      <div className="flex items-end justify-between gap-2 border-t border-gray-100 dark:border-white/5 pt-2 mt-auto">
                        <div className="flex flex-col">
                          <span className="text-[7px] font-black text-zinc-400 uppercase tracking-widest">Saldo</span>
                          <span className={`text-[9px] font-black tabular-nums ${i.quantidadeAtual <= i.quantidadeMinima ? 'text-rose-500' : 'text-zinc-600 dark:text-zinc-300'}`}>
                            {i.quantidadeAtual} {i.unidadeMedida}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black text-indigo-500 tracking-tighter tabular-nums">
                            {centavosParaReais(i.custoMedioUnidade)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </ModalListagemPremium>

          <FormularioInsumo aberto={modalInsumoAberto} aoCancelar={fecharInsumoAberto} insumoEditando={insumoEditando} aoSalvar={(dados) => adicionarOuAtualizarInsumo({ ...dados, id: dados.id || crypto.randomUUID(), dataCriacao: dados.dataCriacao || new Date(), dataAtualizacao: new Date(), historico: dados.historico || [] } as any)} />



          <Dialogo
            aberto={modalPdfAberto}
            aoFechar={() => setModalPdfAberto(false)}
            larguraMax="max-w-md"
            esconderCabecalho={true}
          >
            <div className="p-8 flex flex-col gap-6 relative bg-[#0B0F19] border border-white/5 shadow-2xl rounded-2xl overflow-hidden">
              {/* Fundo com efeito Glow */}
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-sky-500/10 to-transparent blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center gap-2.5 text-sky-400 mb-2">
                  <Crown size={18} className="fill-sky-400/20" />
                  <span className="text-xs font-black uppercase tracking-[0.25em]">Personalizar Orçamento PDF</span>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-sky-400/80">Nome do Estúdio</label>
                  <input
                    type="text"
                    placeholder="Ex: PrintPro Lab"
                    value={config.nomeEstudio}
                    onChange={(e) => config.definirIdentidadeEstudio(e.target.value, config.sloganEstudio)}
                    className="w-full h-14 px-4 rounded-xl bg-zinc-900/50 border border-white/5 focus:border-sky-500/40 outline-none font-black text-xs text-white transition-all shadow-inner placeholder:text-zinc-700"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-sky-400/80">Slogan / Frase de Rodapé</label>
                  <input
                    type="text"
                    placeholder="Ex: Impressão 3D de alta precisão"
                    value={config.sloganEstudio}
                    onChange={(e) => config.definirIdentidadeEstudio(config.nomeEstudio, e.target.value)}
                    className="w-full h-14 px-4 rounded-xl bg-zinc-900/50 border border-white/5 focus:border-sky-500/40 outline-none font-black text-xs text-white transition-all shadow-inner placeholder:text-zinc-700"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/50 flex flex-col gap-1.5 mt-2">
                  <span className="text-[9px] font-black uppercase text-sky-400/60 border-b border-dashed border-zinc-800/50 pb-2 mb-1 tracking-wider">
                    Pré-Visualização do Documento
                  </span>
                  <span className="text-sm font-black text-white">
                    {config.nomeEstudio || "Seu Estúdio"}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400/80 italic">
                    {config.sloganEstudio || "Seu slogan aqui"}
                  </span>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <button
                    onClick={() => {
                      hook.gerarPdf(config.nomeEstudio, config.sloganEstudio, buscaClienteSeletor, nomeProjeto);
                      setModalPdfAberto(false);
                    }}
                    className="w-full h-14 font-black uppercase tracking-[0.15em] text-xs rounded-2xl flex items-center justify-center gap-2 bg-sky-500 text-white hover:bg-sky-600 transition-all active:scale-95 shadow-[0_10px_20px_-5px_rgba(14,165,233,0.3)]"
                  >
                    <Download size={14} />
                    <span>Gerar Orçamento</span>
                  </button>

                  <div className="flex justify-between items-center mt-3 border-t border-zinc-800/30 pt-3 text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em] select-none">
                    <span>PRINTLOG OS V2.0</span>
                    <span>© 2026</span>
                  </div>
                </div>
              </div>
            </div>
          </Dialogo>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
