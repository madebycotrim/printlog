import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Carregamento } from "@/compartilhado/componentes/Carregamento";
import { 
  Settings, Check, X, Plus, 
  ChevronDown, Box, Package, History, Crown
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { usarAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { usarArmazemConfiguracoes } from "@/funcionalidades/sistema/configuracoes/estado/armazemConfiguracoes";
import { usarArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { usarArmazemInsumos } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";
import { usarGerenciadorImpressoras } from "@/funcionalidades/producao/impressoras/hooks/usarGerenciadorImpressoras";
import { usarGerenciadorMateriais } from "@/funcionalidades/producao/materiais/hooks/usarGerenciadorMateriais";
import { usarGerenciadorInsumos } from "@/funcionalidades/producao/insumos/hooks/usarGerenciadorInsumos";
import { usarPedidos } from "@/funcionalidades/producao/projetos/hooks/usarPedidos";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { ModalListagemPremium } from "@/compartilhado/componentes/ModalListagemPremium";
import { FormularioMaterial } from "@/funcionalidades/producao/materiais/componentes/FormularioMaterial";
import { FormularioInsumo } from "@/funcionalidades/producao/insumos/componentes/FormularioInsumo";
import { Carretel, GarrafaResina } from "@/compartilhado/componentes/Icones3D";
import { formatarMoedaFinancas, formatarPorcentagem, centavosParaReais } from "@/compartilhado/utilitarios/formatadores";

// Hook e Componentes Refatorados
import { usarCalculadora } from "./hooks/usarCalculadora";
import { CardMateriais } from "./componentes/CardMateriais";
import { CardProducao } from "./componentes/CardProducao";
import { CardOperacional } from "./componentes/CardOperacional";
import { CardInsumos } from "./componentes/CardInsumos";
import { CardLogisticaFiscal } from "./componentes/CardLogisticaFiscal";
import { PainelResultados } from "./componentes/PainelResultados";
import { ModalHistorico } from "./componentes/ModalHistorico";

export function PaginaCalculadora() {
  const navigate = useNavigate();
  const { usuario } = usarAutenticacao();
  const config = usarArmazemConfiguracoes();
  const { criarPedido } = usarPedidos();
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
  const [modalConfigAberto, setModalConfigAberto] = useState(false);
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
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

  const alternarMaterial = (id: string) => {
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
          quantidade: 0,
          precoKgCentavos: Math.round((matOriginal.precoCentavos / matOriginal.pesoGramas) * 1000)
        }]);
      }
    }
  };

  const salvarComoProjeto = async () => {
    try {
      const novoPedido = await criarPedido({
        idCliente: "ORCAMENTO_DIRETO",
        descricao: hook.materiaisSelecionados.length > 0 ? `Impressão: ${hook.materiaisSelecionados.map(m => m.nome).join(", ")}` : "Orçamento via Calculadora",
        valorCentavos: hook.calculo.precoSugerido,
        material: hook.materiaisSelecionados.map(m => m.nome).join(", "),
        pesoGramas: hook.materiaisSelecionados.reduce((acc, m) => acc + m.quantidade, 0),
        tempoMinutos: hook.tempo,
        idImpressora: hook.impressoraSelecionadaId || undefined,
        prazoEntrega: hook.estimativaPrazo.data,
        observacoes: `Gerado via calculadora em ${new Date().toLocaleDateString('pt-BR')}.`
      });

      if (novoPedido) {
        toast.success("Orçamento salvo como projeto!");
        navigate("/producao/projetos");
      }
    } catch (erro) {
      console.error(erro);
    }
  };

  // Sincronizar potência ao carregar ou mudar impressora
  useEffect(() => {
    if (impressoraSelecionada?.potenciaWatts) {
      hook.setPotencia(impressoraSelecionada.potenciaWatts);
    }
  }, [impressoraSelecionada?.potenciaWatts, hook.setPotencia]);

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
      <button onClick={() => setModalHistoricoAberto(true)} className="flex items-center justify-center w-11 h-11 rounded-xl hover:bg-white dark:hover:bg-white/10 text-zinc-400 hover:text-sky-500 transition-all"><History size={18} /></button>
      <button onClick={() => setModalConfigAberto(true)} className="flex items-center justify-center w-11 h-11 rounded-xl hover:bg-white dark:hover:bg-white/10 text-zinc-400 hover:text-amber-500 transition-all"><Settings size={18} /></button>
    </div>
  ), [abertoSeletor, hook.impressoraSelecionadaId, impressoraSelecionada?.nome, impressoras]);

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
        
        <CardMateriais 
          materiais={materiais.filter(m => m.nome.toLowerCase().includes(buscaMaterial.toLowerCase()))}
          selecionados={hook.materiaisSelecionados}
          alertas={hook.alertasEstoque}
          busca={buscaMaterial}
          setBusca={setBuscaMaterial}
          alternar={alternarMaterial}
          atualizarQtd={(id, qtd) => hook.setMateriaisSelecionados(prev => prev.map(m => m.id === id ? { ...m, quantidade: qtd } : m))}
          atualizarPreco={(id, p) => hook.setMateriaisSelecionados(prev => prev.map(m => m.id === id ? { ...m, precoKgCentavos: Math.round(p * 100) } : m))}
          remover={(id) => hook.setMateriaisSelecionados(prev => prev.filter(m => m.id !== id))}
          abrirArmazem={() => setModalArmazemAberto(true)}
          abrirCriar={() => acoesMateriais.abrirEditar(null as any)}
        />

        <CardProducao 
          tempo={hook.tempo} setTempo={hook.setTempo}
          potencia={hook.potencia} setPotencia={hook.setPotencia}
          precoKwh={hook.precoKwh} setPrecoKwh={hook.setPrecoKwh}
          custoEnergia={hook.calculo.custoEnergia / 100}
          posProcesso={hook.itensPosProcesso} setPosProcesso={hook.setItensPosProcesso}
          impressoras={impressoras}
          idImpressoraSelecionada={hook.impressoraSelecionadaId}
          aoSelecionarImpressora={(id) => {
            hook.setImpressoraSelecionadaId(id);
            const imp = impressoras.find(i => i.id === id);
            if (imp?.potenciaWatts) hook.setPotencia(imp.potenciaWatts);
            // Sincroniza também a depreciação se houver
            if (imp?.taxaHoraCentavos) hook.setDepreciacaoHora(imp.taxaHoraCentavos / 100);
          }}
        />

        <CardOperacional 
          maoDeObra={hook.maoDeObra} setMaoDeObra={hook.setMaoDeObra}
          margem={hook.margem} setMargem={hook.setMargem}
          depreciacao={hook.depreciacaoHora} setDepreciacao={hook.setDepreciacaoHora}
          tempo={hook.tempo}
        />

        <CardInsumos 
          insumos={insumosEstoque.filter(i => i.nome.toLowerCase().includes(buscaInsumo.toLowerCase()))}
          selecionados={hook.insumosSelecionados}
          alertas={hook.alertasInsumos}
          busca={buscaInsumo} setBusca={setBuscaInsumo}
          alternar={(insumo) => {
            const existe = hook.insumosSelecionados.find(i => i.id === insumo.id);
            if (existe) hook.setInsumosSelecionados(prev => prev.filter(i => i.id !== insumo.id));
            else hook.setInsumosSelecionados(prev => [...prev, { id: insumo.id, nome: insumo.nome, quantidade: 1, custoCentavos: insumo.custoMedioUnidade }]);
          }}
          atualizarQtd={(id, qtd) => {
            hook.setInsumosSelecionados(prev => prev.map(i => i.id === id ? { ...i, quantidade: qtd } : i));
          }}
          remover={(id) => {
            hook.setInsumosSelecionados(prev => prev.filter(i => i.id !== id));
          }}
          insumosFixos={hook.insumosFixos} setInsumosFixos={hook.setInsumosFixos}
          abrirGerenciar={() => setModalArmazemInsumosAberto(true)}
          abrirNovo={() => abrirCriarInsumo()}
        />

        <CardLogisticaFiscal 
          perfis={hook.perfisMarketplace} perfilAtivo={hook.perfilAtivo} setPerfilAtivo={hook.setPerfilAtivo}
          taxaEcommerce={hook.perfisMarketplace.find(p => p.nome === hook.perfilAtivo)?.taxa || 0} setTaxaEcommerce={() => {}}
          taxaFixa={hook.perfisMarketplace.find(p => p.nome === hook.perfilAtivo)?.fixa || 0} setTaxaFixa={() => {}}
          frete={hook.frete} setFrete={hook.setFrete}
          tipoOperacao={hook.perfilAtivo === 'Direto' ? 'servico' : 'produto'} setTipoOperacao={() => {}}
          impostos={hook.impostos} setImpostos={hook.setImpostos}
          icms={hook.icms} setIcms={hook.setIcms}
          iss={hook.iss} setIss={hook.setIss}
          abrirPerfis={() => setModalCanaisAberto(true)}
        />
      </div>

      <div className="xl:col-span-4 h-full xl:sticky xl:top-0 flex flex-col justify-center py-8">
        <PainelResultados 
          calculo={hook.calculo}
          dadosPizza={hook.dadosGraficoPizza}
          aba={abaResultado} setAba={setAbaResultado}
          salvarProjeto={salvarComoProjeto}
          gerarPdf={hook.gerarPdf}
          carregandoPdf={false}
          temImpressora={!!hook.impressoraSelecionadaId}
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
                className={`px-6 h-full min-w-[100px] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filtroTipoMaterial === f.id 
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
                className={`p-3 rounded-2xl border-2 transition-all text-left flex items-center gap-4 relative overflow-hidden h-24 bg-white dark:bg-zinc-900/50 ${
                  selecionado ? "shadow-md" : "hover:shadow-lg"
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

      <Dialogo aberto={modalConfigAberto} aoFechar={() => setModalConfigAberto(false)} larguraMax="max-w-xl" esconderCabecalho={true}>
        <div className="p-10 space-y-10 bg-white dark:bg-zinc-900 rounded-[2.5rem] relative">
          <button onClick={() => setModalConfigAberto(false)} className="absolute top-8 right-8 p-2 rounded-xl text-gray-400 hover:text-zinc-900 dark:hover:text-white"><X size={20} /></button>
          <div className="flex flex-col items-center text-center gap-2">
            <h3 className="text-xl font-black uppercase tracking-[0.2em]">CONFIGURAÇÕES</h3>
          </div>

          <div className="space-y-6">
            {/* Seção Operacional (Aberta para todos) */}
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">OPERACIONAL</span>
              <button 
                onClick={async () => { 
                    config.definirCustoEnergia(formatarMoedaFinancas(hook.precoKwh, 2));
                    config.definirHoraOperador(formatarMoedaFinancas(hook.maoDeObra, 2));
                    config.definirHoraMaquina(formatarMoedaFinancas(hook.depreciacaoHora, 3));
                    config.definirMargemLucro(formatarPorcentagem(String(hook.margem * 100)));
                  if (usuario?.uid) await config.salvarNoD1(usuario.uid);
                  setModalConfigAberto(false); 
                  toast.success("Sincronizado!"); 
                }} 
                className="w-full h-16 bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-zinc-200 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-3 border border-zinc-200 dark:border-white/10"
              >
                Sincronizar Indices Atuais
              </button>
            </div>

            {/* Seção Branding (Exclusiva PRO) */}
            <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-white/5 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">IDENTIDADE DO ESTÚDIO</span>
                  {usuario?.plano !== 'PRO' && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-500 text-[8px] font-black uppercase tracking-widest border border-sky-500/20">
                      PRO
                    </span>
                  )}
                </div>
              </div>

              <div className={`space-y-3 transition-all ${usuario?.plano !== 'PRO' ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Nome do Estúdio</label>
                  <input 
                    type="text" 
                    placeholder="Ex: PrintPro Lab"
                    value={config.nomeEstudio}
                    onChange={(e) => config.definirIdentidadeEstudio(e.target.value, config.sloganEstudio)}
                    className="w-full h-12 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-xl px-4 text-xs font-bold focus:ring-1 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Slogan / Frase do PDF</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Impressão 3D de alta precisão"
                    value={config.sloganEstudio}
                    onChange={(e) => config.definirIdentidadeEstudio(config.nomeEstudio, e.target.value)}
                    className="w-full h-12 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-xl px-4 text-xs font-bold focus:ring-1 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              {usuario?.plano !== 'PRO' && (
                <div className="absolute inset-0 z-10 flex items-center justify-center pt-8">
                  <div className="bg-white dark:bg-zinc-900 border border-sky-500/20 px-4 py-2 rounded-xl shadow-xl shadow-sky-500/10 flex items-center gap-3">
                    <Crown size={14} className="text-sky-500" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-500">Libere seu Branding no PRO</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={async () => { 
              if (usuario?.uid) {
                await config.salvarNoD1(usuario.uid);
                setModalConfigAberto(false); 
                toast.success("Configurações salvas!");
              }
            }} 
            className="w-full h-16 bg-zinc-900 dark:bg-white text-white dark:text-black font-black uppercase text-[11px] tracking-[0.3em] rounded-[1.5rem] hover:scale-[1.02] transition-all"
          >
            Salvar Alterações
          </button>
        </div>
      </Dialogo>

      <FormularioMaterial aberto={estadoMateriais.modalAberto} aoSalvar={acoesMateriais.salvarMaterial} aoCancelar={acoesMateriais.fecharEditar} materialEditando={estadoMateriais.materialSendoEditado} />
      
      {/* Modal Canais de Venda */}
      <ModalListagemPremium 
        aberto={modalCanaisAberto} 
        aoFechar={() => setModalCanaisAberto(false)} 
        titulo="Canais de Venda" 
        iconeTitulo={ChevronDown} 
        corDestaque="amber" 
        termoBusca="" 
        aoMudarBusca={() => {}} 
        temResultados={true} 
        totalResultados={hook.perfisMarketplace.length}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hook.perfisMarketplace.map(p => {
            const selecionado = hook.perfilAtivo === p.nome;
            return (
              <button 
                key={p.nome} 
                onClick={() => {
                  hook.setPerfilAtivo(p.nome);
                  setModalCanaisAberto(false);
                }} 
                className={`p-5 rounded-2xl border-2 transition-all text-left flex items-center gap-4 relative overflow-hidden group ${
                  selecionado ? "border-amber-500 bg-amber-500/5 shadow-md" : "border-gray-50 dark:border-white/5 hover:border-amber-500/30 bg-white dark:bg-zinc-900/50"
                }`}
              >
                <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${selecionado ? "bg-amber-500 text-white" : "bg-gray-100 dark:bg-white/5 text-zinc-400 group-hover:text-amber-500"}`}>
                  <Settings size={20} />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-900 dark:text-white truncate">
                    {p.nome}
                  </h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">Taxa: {p.taxa}%</span>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">Fixa: {centavosParaReais(p.fixa * 100)}</span>
                  </div>
                </div>

                {selecionado && (
                  <div className="shrink-0 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white shadow-lg">
                    <Check size={14} />
                  </div>
                )}
              </button>
            );
          })}
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
                className={`p-3 rounded-2xl border-2 transition-all text-left flex items-center gap-4 relative overflow-hidden h-24 bg-white dark:bg-zinc-900/50 ${
                  selecionado ? "border-indigo-500 shadow-md bg-indigo-500/5" : "border-gray-50 dark:border-white/5 hover:border-indigo-500/30"
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
