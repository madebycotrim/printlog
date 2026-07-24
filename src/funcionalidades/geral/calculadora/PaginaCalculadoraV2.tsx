import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { useAtalhosTeclado } from "@/compartilhado/hooks/useAtalhosTeclado";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { format } from "date-fns";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { useDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { servicoIA } from "@/funcionalidades/geral/calculadora/servicos/servicoIA";
import { useArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { useArmazemInsumos } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";
import { useGerenciadorImpressoras } from "@/funcionalidades/producao/impressoras/hooks/useGerenciadorImpressoras";
import { useGerenciadorClientes } from "@/funcionalidades/comercial/clientes/hooks/useGerenciadorClientes";
import { BaseLegalLGPD } from "@/compartilhado/tipos/modelos";
import { useSearchParams } from "react-router-dom";
import { useStore } from "zustand";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { useArmazemConfiguracoes } from "@/funcionalidades/sistema/configuracoes/estado/armazemConfiguracoes";
import { ModalUpgradePaywall } from "@/compartilhado/componentes/ui";
import { Dialogo } from "@/compartilhado/componentes";
import { useShallow } from "zustand/react/shallow";
import { useArmazemImpressoras } from "@/funcionalidades/producao/impressoras/estado/armazemImpressoras";
import { apiMateriais } from "@/funcionalidades/producao/materiais/servicos/apiMateriais";
import { apiInsumos } from "@/funcionalidades/producao/insumos/servicos/apiInsumos";
import { apiImpressoras } from "@/funcionalidades/producao/impressoras/servicos/apiImpressoras";

// Zustand Store 
import { useArmazemCalculadora } from "./estado/armazemCalculadora";

// Modais V2
import { ModalConfiguracoesV2 } from "./componentes/ModalConfiguracoesV2";
import { ModalHistoricoV2 } from "./componentes/ModalHistoricoV2";
import { ModalCanaisVenda } from "./componentes/ModalCanaisVenda";
import { ModalArmazemMateriais } from "./componentes/ModalArmazemMateriais";
import { ModalArmazemInsumos } from "./componentes/ModalArmazemInsumos";

// Gerenciadores de Estoque
import { useGerenciadorMateriais } from "@/funcionalidades/producao/materiais/hooks/useGerenciadorMateriais";
import { FormularioMaterial } from "@/funcionalidades/producao/materiais/componentes/FormularioMaterial";
import { useGerenciadorInsumos } from "@/funcionalidades/producao/insumos/hooks/useGerenciadorInsumos";
import { FormularioInsumo } from "@/funcionalidades/producao/insumos/componentes/FormularioInsumo";

// Componentes da Calculadora
import { CardIdentificacaoProjeto } from "./componentes/CardIdentificacaoProjeto";
import { CardEquipamento } from "./componentes/CardEquipamento";
import { CardMateriais } from "./componentes/CardMateriais";
import { CardPerdas } from "./componentes/CardPerdas";
import { CardInsumos } from "./componentes/CardInsumos";
import { CardCustosFixos } from "./componentes/CardCustosFixos";
import { CardCustosAdicionais } from "./componentes/CardCustosAdicionais";
import { CardDepreciacao } from "./componentes/CardDepreciacao";
import { CardLucro } from "./componentes/CardLucro";
import { CardProducao } from "./componentes/CardProducao";
import { CardPosProcesso } from "./componentes/CardPosProcesso";
import { CardModelagem } from "./componentes/CardModelagem";
import { useSincronizacaoCalculadora } from "./hooks/useSincronizacaoCalculadora";
import { CardLogistica } from "./componentes/CardLogistica";
import { PainelResultados } from "./componentes/PainelResultados";
import { ModalDetectarTarifa } from "./componentes/ModalDetectarTarifa";

export function PaginaCalculadoraV2() {
  const armazem = useArmazemCalculadora();
  const { usuario } = useAutenticacao();
  const config = useArmazemConfiguracoes();

  const { estado: estadoMateriais, acoes: acoesMateriais } = useGerenciadorMateriais();
  const { estado: estadoInsumos, acoes: acoesInsumos } = useGerenciadorInsumos();

  const [modalArmazemMateriaisAberto, setModalArmazemMateriaisAberto] = useState(false);
  const [modalArmazemInsumosAberto, setModalArmazemInsumosAberto] = useState(false);

  const eProOuSuperior = useMemo(() => {
    if (!usuario) return false;
    const userRecord = usuario as typeof usuario & { role?: string; cargo?: string };
    const plano = (userRecord.plano || '').toUpperCase();
    const role = (userRecord.role || userRecord.cargo || '').toUpperCase();
    return ['PRO', 'FUNDADOR', 'MAKER_FUNDADOR', 'ADMIN'].includes(plano) ||
      ['PRO', 'FUNDADOR', 'MAKER_FUNDADOR', 'ADMIN'].includes(role) ||
      plano.includes('FUNDADOR') || role.includes('FUNDADOR');
  }, [usuario]);

  const [searchParams] = useSearchParams();
  const idEdicao = searchParams.get("id") || searchParams.get("edicao");
  const [modalTarifaAberto, setModalTarifaAberto] = useState(false);
  
  const { estado: estadoClientes, acoes: acoesClientes } = useGerenciadorClientes();
  const { estado: estadoImpressoras } = useGerenciadorImpressoras();
  const { materiais, definirMateriais: setMateriais, definirJaCarregou: setJaCarregouMateriais, jaCarregou: jaCarregouMateriais } = useArmazemMateriais(
    useShallow(s => ({ materiais: s.materiais, definirMateriais: s.definirMateriais, definirJaCarregou: s.definirJaCarregou, jaCarregou: s.jaCarregou }))
  );
  const { insumos: insumosEstoque, definirInsumos: setInsumos } = useArmazemInsumos(
    useShallow(s => ({ insumos: s.insumos, definirInsumos: s.definirInsumos }))
  );
  const { definirImpressoras: setImpressoras, definirJaCarregou: setJaCarregouImpressoras, jaCarregou: jaCarregouImpressoras } = useArmazemImpressoras(
    useShallow(s => ({ definirImpressoras: s.definirImpressoras, definirJaCarregou: s.definirJaCarregou, jaCarregou: s.jaCarregou }))
  );

  // 🔄 Sincronização inicial — carrega dados se o usuário entrou direto na calculadora
  useEffect(() => {
    if (!usuario?.uid) return;

    const carregarTudo = async () => {
      try {
        const promises: Promise<any>[] = [];
        if (!jaCarregouMateriais) promises.push(
          apiMateriais.listar(usuario.uid).then(mats => { setMateriais(mats); setJaCarregouMateriais(true); })
        );
        if (insumosEstoque.length === 0) promises.push(
          apiInsumos.listar(usuario.uid).then(ins => setInsumos(ins))
        );
        if (!jaCarregouImpressoras) promises.push(
          apiImpressoras.buscarTodas(usuario.uid).then(imps => { setImpressoras(imps); setJaCarregouImpressoras(true); })
        );
        if (promises.length > 0) await Promise.all(promises);
      } catch (erro) {
        console.error("Erro ao carregar dados na calculadora:", erro);
      }
    };

    carregarTudo();
  }, [usuario?.uid]);


  // Estados locais da UI
  const [modalConfigAberto, setModalConfigAberto] = useState(false);
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const [modalPaywallAberto, setModalPaywallAberto] = useState(false);
  const [modalConfirmarReset, setModalConfirmarReset] = useState(false);
  const [recursoPaywall, setRecursoPaywall] = useState("Recurso VIP");
  const [modoAvancado, setModoAvancado] = useState(false);

  // Canais de Venda / Perfis Marketplace
  const perfisPadrao = [
    { nome: "Direto", taxaPontosBase: 0, fixaCentavos: 0, freteCentavos: 0 },
    { nome: "M. Livre", taxaPontosBase: 1800, fixaCentavos: 600, freteCentavos: 0 },
    { nome: "Shopee", taxaPontosBase: 2000, fixaCentavos: 300, freteCentavos: 0 },
  ];

  const perfisMarketplace = useMemo(() => {
    if (config.calculadoraMeta?.canais_venda) {
      return config.calculadoraMeta.canais_venda;
    }
    return perfisPadrao;
  }, [config.calculadoraMeta]);

  const setPerfisMarketplace = async (novosPerfis: any[]) => {
    const novaMeta = { ...config.calculadoraMeta, canais_venda: novosPerfis };
    config.definirCalculadoraMeta(novaMeta);
    if (usuario?.uid) {
      await config.salvarNoD1(usuario.uid);
    }
  };

  const [perfilAtivo, setPerfilAtivo] = useState("");
  const [modalCanaisAberto, setModalCanaisAberto] = useState(false);
  const [indiceSendoEditado, setIndiceSendoEditado] = useState<number | null>(null);
  const [nomeTemporario, setNomeTemporario] = useState("");

  const [nomeProjeto, setNomeProjeto] = useState("");
  const [descricaoProjeto, setDescricaoProjeto] = useState("");
  const [clienteProjetoId, setClienteProjetoId] = useState(() => searchParams.get("clienteId") || "");
  const [buscaClienteSeletor, setBuscaClienteSeletor] = useState("");
  const [abertoSeletorCliente, setAbertoSeletorCliente] = useState(false);
  const [criandoNovoCliente, setCriandoNovoCliente] = useState(false);
  const [impressoraSelecionadaId, setImpressoraSelecionadaId] = useState("");
  const [abertoSeletorImpressora, setAbertoSeletorImpressora] = useState(false);

  // Se o clienteId vir via URL e a lista carregar, aplica o nome do cliente e a taxa
  useEffect(() => {
    if (clienteProjetoId && estadoClientes.clientes && estadoClientes.clientes.length > 0) {
      const cli = estadoClientes.clientes.find(c => c.id === clienteProjetoId);
      if (cli) {
        setBuscaClienteSeletor(cli.nome);
        if (cli.canalReferencia) {
          const canal = perfisMarketplace.find((c: any) => c.nome === cli.canalReferencia);
          if (canal && perfilAtivo !== canal.nome) {
            setPerfilAtivo(canal.nome);
            armazem.setParametro('taxaEcommercePercentual', canal.taxaVariavel || canal.taxaPontosBase || 0);
            armazem.setParametro('taxaFixaVendaCentavos', canal.taxaFixaCentavos || 0);
            toast.success(`Taxas do canal ${canal.nome} aplicadas automaticamente!`, { id: "canal-venda-url" });
          }
        }
      }
    }
  }, [clienteProjetoId, estadoClientes.clientes, perfisMarketplace, perfilAtivo]);

  const [anosVidaUtil, setAnosVidaUtil] = useState<5 | 3 | 2>(() => {
    const salvo = localStorage.getItem("printlog_anos_vida_util");
    return salvo ? Number(salvo) as 5 | 3 | 2 : 5;
  });

  useEffect(() => {
    localStorage.setItem("printlog_anos_vida_util", String(anosVidaUtil));
  }, [anosVidaUtil]);

  const impressoraSelecionada = useMemo(() =>
    estadoImpressoras.impressoras.find(i => i.id === impressoraSelecionadaId),
    [estadoImpressoras.impressoras, impressoraSelecionadaId]
  );

  // Recalcular depreciação automaticamente com base no valor de compra da impressora e anos de vida útil
  useEffect(() => {
    if (impressoraSelecionada) {
      const valorCompra = impressoraSelecionada.valorCompraCentavos || 0;
      const custoHoraCalculado = Math.round(
        (valorCompra / anosVidaUtil) / 12 / 240
      );
      if (armazem.depreciacaoHoraCentavos !== custoHoraCalculado) {
        armazem.setParametro('depreciacaoHoraCentavos', custoHoraCalculado);
      }
    } else {
      if (armazem.depreciacaoHoraCentavos !== 0) {
        armazem.setParametro('depreciacaoHoraCentavos', 0);
      }
    }
  }, [impressoraSelecionada, anosVidaUtil, armazem.depreciacaoHoraCentavos]);
  
  const [buscaMaterial, setBuscaMaterial] = useState("");
  const [buscaInsumo, setBuscaInsumo] = useState("");
  
  const [mostrarPerdas, setMostrarPerdas] = useState(false);
  const [mostrarCustosFixos, setMostrarCustosFixos] = useState(false);
  const [mostrarModelagem, setMostrarModelagem] = useState(false);
  const [mostrarPosProcesso, setMostrarPosProcesso] = useState(false);

  const { autoSalvar, setAutoSalvar } = useSincronizacaoCalculadora({
    armazem,
    nomeProjeto,
    descricaoProjeto,
    clienteProjetoId,
    impressoraSelecionadaId,
    setNomeProjeto,
    setDescricaoProjeto,
    setClienteProjetoId,
    setImpressoraSelecionadaId
  });
  
  // Hook Temporal do Zundo
  const undo = useStore(useArmazemCalculadora.temporal, (state) => state.undo);
  const redo = useStore(useArmazemCalculadora.temporal, (state) => state.redo);
  const pastStates = useStore(useArmazemCalculadora.temporal, (state) => state.pastStates);
  const futureStates = useStore(useArmazemCalculadora.temporal, (state) => state.futureStates);

  // Aprovação de orçamentos ocorre no Kanban (PaginaProjetos) — não mais na Calculadora

  const [gerandoPdf, setGerandoPdf] = useState(false);

  const salvarProjetoHandler = useCallback(async () => {
    if (!nomeProjeto) {
       toast.error("Dê um nome para o projeto antes de salvar!");
       return;
    }
    
    armazem.salvarSnapshot(nomeProjeto, descricaoProjeto, clienteProjetoId);
    
    if (usuario?.uid) {
       try {
          toast.loading("Sincronizando com a nuvem...", { id: "nuvem" });
          
          const { apiPedidos } = await import("@/funcionalidades/producao/projetos/servicos/apiPedidos");
          const { StatusPedido } = await import("@/compartilhado/tipos/modelos");

          const idSalvo = await apiPedidos.criar({
            descricao: nomeProjeto,
            idCliente: clienteProjetoId || "",
            valorCentavos: armazem.resultado.precoSugerido,
            status: StatusPedido.ORCAMENTO,
            idImpressora: impressoraSelecionadaId || undefined,
            tempoMinutos: armazem.tempoMinutosMaquina,
            materiais: armazem.materiaisSelecionados.map(m => ({
              idMaterial: m.id,
              nome: m.nome,
              quantidadeGasta: m.quantidade * armazem.quantidade
            })),
            insumosSecundarios: armazem.insumosSelecionados.map(i => ({
              idInsumo: i.id,
              nome: i.nome,
              quantidade: i.porLote ? i.quantidade : i.quantidade * armazem.quantidade,
              custoUnitarioCentavos: i.custoCentavos
            })),
            configuracoes: {
               snapshot: {
                 id: crypto.randomUUID(),
                 data: new Date().toISOString(),
                 nome: nomeProjeto,
                 descricao: descricaoProjeto,
                 clienteId: clienteProjetoId,
                 parametros: {
                    materiaisSelecionados: armazem.materiaisSelecionados,
                    insumosSelecionados: armazem.insumosSelecionados,
                    itensPosProcesso: armazem.itensPosProcesso,
                    tempoMinutosMaquina: armazem.tempoMinutosMaquina,
                    potenciaWatts: armazem.potenciaWatts,
                    precoKwhCentavos: armazem.precoKwhCentavos,
                    custosAdicionais: armazem.custosAdicionais,
                    depreciacaoHoraCentavos: armazem.depreciacaoHoraCentavos,
                    margemLucroPercentual: armazem.margemLucroPercentual,
                    cobrarEnergia: armazem.cobrarEnergia,
                    cobrarDesgaste: armazem.cobrarDesgaste,
                    cobrarCustosAdicionais: armazem.cobrarCustosAdicionais,
                    cobrarInsumosFixos: armazem.cobrarInsumosFixos,
                    cobrarLogistica: armazem.cobrarLogistica,
                    modoEntrada: armazem.modoEntrada,
                    quantidade: armazem.quantidade,
                    pecasPorMesa: armazem.pecasPorMesa,
                    tempoSetupMinutos: armazem.tempoSetupMinutos,
                    materialPerdidoGramas: armazem.materialPerdidoGramas,
                    tempoPerdidoMinutos: armazem.tempoPerdidoMinutos,
                    insumosFixosCentavos: armazem.insumosFixosCentavos,
                    freteCentavos: armazem.freteCentavos,
                    taxaEcommercePercentual: armazem.taxaEcommercePercentual,
                    taxaFixaVendaCentavos: armazem.taxaFixaVendaCentavos,
                    tempoModelagemMinutos: armazem.tempoModelagemMinutos,
                    valorHoraModelagemCentavos: armazem.valorHoraModelagemCentavos
                 },
                 resultado: armazem.resultado
               }
            }
          }, usuario.uid);
          
          setIdOrcamentoNuvem(idSalvo);
          toast.success("Orçamento salvo e sincronizado!", { id: "nuvem" });
       } catch(e) {
          toast.error("Salvo localmente (Erro na nuvem).", { id: "nuvem" });
       }
    } else {
       toast.success("Orçamento salvo localmente!");
    }
  }, [nomeProjeto, descricaoProjeto, clienteProjetoId, usuario, armazem, impressoraSelecionadaId]);

  useAtalhosTeclado(useMemo(() => [
    { tecla: "s", ctrlOuCmd: true, aoAcionar: () => salvarProjetoHandler() }
  ], [salvarProjetoHandler]));

  const gerarPdfExportacao = async () => {

    try {
      setGerandoPdf(true);
      toast.loading("Montando PDF oficial...", { id: "pdf" });

      const elemento = document.getElementById("recibo-pdf-oculto");
      if (!elemento) throw new Error("Template de PDF não encontrado");

      const canvas = await html2canvas(elemento, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Orcamento-${nomeProjeto || "Cliente"}.pdf`);

      toast.success("PDF gerado com sucesso!", { id: "pdf" });
    } catch (e) {
      console.error(e);
      toast.error("Erro ao gerar PDF.", { id: "pdf" });
    } finally {
      setGerandoPdf(false);
    }
  };

  const [explicacaoIA, setExplicacaoIA] = useState("");

  const sugerirPrecoComIA = async () => {
    try {
      toast.loading("Analisando mercado e custos...", { id: "ia" });
      
      const sugestao = await servicoIA.obterSugestaoPreco({
        custoMaterial: armazem.resultado.custoMaterial / 100,
        custoEnergia: armazem.resultado.custoEnergia / 100,
        custoTrabalho: armazem.resultado.custoAdicionalTotal / 100,
        custoDepreciacao: armazem.resultado.custoDepreciacao / 100,
        lucroDesejadoPercentual: armazem.margemLucroPercentual,
        nomePeca: nomeProjeto || "Projeto 3D",
        pesoGramas: armazem.materiaisSelecionados.reduce((acc, m) => acc + m.quantidade, 0),
        tempoMinutos: armazem.tempoMinutosMaquina
      });
      setExplicacaoIA(sugestao.dica || sugestao.recomendado.justificativa);
      
      toast.success("Preço sugerido pela IA!", { id: "ia" });
    } catch (e) {
      console.error(e);
      toast.error("Falha ao se conectar com o motor de IA.", { id: "ia" });
    }
  };

  const [idOrcamentoNuvem, setIdOrcamentoNuvem] = useState("");

  const urlLinkMagico = idOrcamentoNuvem ? `${window.location.origin}/o/${idOrcamentoNuvem}` : "";

  const gerarLinkPublico = async () => {
    if (!idOrcamentoNuvem) {
       toast.error("Você precisa Salvar o Projeto antes de gerar o Link Mágico!");
       return;
    }
    await navigator.clipboard.writeText(urlLinkMagico);
    toast.success("Link Mágico copiado para a Área de Transferência!");
  };

  // Carrega orçamento da nuvem se vier por link
  useEffect(() => {
    async function carregarNuvem() {
      if (idEdicao && !armazem.jaFoiInicializado) {
        try {
          toast.loading("Baixando orçamento...", { id: "loadNuvem" });
          
          const { servicoBaseApi } = await import("@/compartilhado/servicos/servicoBaseApi");
          const pedido = await servicoBaseApi.get<any>(`/api/pedidos/${idEdicao}`);
          
          if (pedido && pedido.dados_extras) {
             const extras = JSON.parse(pedido.dados_extras);
             if (extras.configuracoes?.snapshot) {
                armazem.carregarSnapshot(extras.configuracoes.snapshot);
                setNomeProjeto(extras.configuracoes.snapshot.nome || "");
                setDescricaoProjeto(extras.configuracoes.snapshot.descricao || "");
                if (extras.configuracoes.snapshot.clienteId) {
                   setClienteProjetoId(extras.configuracoes.snapshot.clienteId);
                }
                setIdOrcamentoNuvem(idEdicao);
                toast.success("Orçamento recuperado com sucesso!", { id: "loadNuvem" });
                return;
             }
          }
          toast.dismiss("loadNuvem");
        } catch(e) {
          console.error(e);
          toast.dismiss("loadNuvem");
        }
      }
    }
    carregarNuvem();
  }, [idEdicao]);

  // Inicialização de Configurações Globais (Só roda se não for edição)
  useEffect(() => {
    if (!idEdicao && !armazem.jaFoiInicializado && !config.carregando) {
      armazem.inicializarComConfiguracoes({
        precoKwhCentavos: config.custoEnergia * 100,
        margemLucroPercentual: config.margemLucro * 100
      });
    }
  }, [idEdicao, armazem.jaFoiInicializado, config.carregando, config.custoEnergia, config.horaOperador, config.margemLucro]);

  // Inicialização de Títulos e Ações do Cabeçalho
  useDefinirCabecalho(useMemo(() => ({
    titulo: idEdicao ? "Editando Precificação" : "Calculadora de Custos",
    subtitulo: "Motor de Orçamentação Avançado",
    ocultarBusca: true,
    ocultarNotificacoes: true,
    elementoAcao: (
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setModalConfirmarReset(true)}
          className="h-9 px-3 rounded-xl bg-card border border-rose-500/20 flex items-center justify-center text-rose-400 hover:text-white hover:bg-rose-500 transition-all shadow-sm gap-2"
          title="Limpar Tudo / Resetar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">Resetar</span>
        </button>
        <div className="w-[1px] h-5 bg-borda-sutil mx-1"></div>
        <button 
          onClick={() => undo()} 
          disabled={pastStates.length === 0}
          className="h-9 px-3 rounded-xl bg-card border border-borda-sutil flex items-center justify-center text-zinc-400 hover:text-cyan-500 hover:border-cyan-500/30 transition-all disabled:opacity-30 disabled:hover:text-zinc-400 disabled:hover:border-borda-sutil shadow-sm"
          title="Desfazer (Ctrl+Z)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
        </button>
        <button 
          onClick={() => redo()} 
          disabled={futureStates.length === 0} 
          className="h-9 px-3 rounded-xl bg-card border border-borda-sutil flex items-center justify-center text-zinc-400 hover:text-cyan-500 hover:border-cyan-500/30 transition-all disabled:opacity-30 disabled:hover:text-zinc-400 disabled:hover:border-borda-sutil shadow-sm"
          title="Refazer (Ctrl+Y)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
        </button>
        <div className="w-[1px] h-5 bg-borda-sutil mx-1"></div>
        <button 
          onClick={() => {
            setAutoSalvar(!autoSalvar);
            toast.success(autoSalvar ? "Salvamento automático desativado" : "Salvamento automático ativado!");
          }}
          className={`h-9 px-3 rounded-xl border flex items-center justify-center transition-all shadow-sm gap-2 text-sm font-medium ${autoSalvar ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-500' : 'bg-card border-borda-sutil text-zinc-400 hover:text-cyan-500 hover:border-cyan-500/30'}`}
          title="Salvamento Automático"
        >
          {autoSalvar ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><polyline points="8 15 12 11 16 15"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
          )}
          <span className="hidden sm:inline">{autoSalvar ? 'Auto' : 'Manual'}</span>
        </button>
        <button 
          onClick={() => {
            armazem.salvarSnapshot(nomeProjeto || "Orçamento sem nome", descricaoProjeto, clienteProjetoId);
            toast.success("Orçamento salvo na versão 2.0!");
          }}
          className="h-9 px-3 rounded-xl bg-card border border-borda-sutil flex items-center justify-center text-zinc-400 hover:text-emerald-500 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all shadow-sm"
          title="Salvar Manualmente"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        </button>
        <div className="w-[1px] h-5 bg-borda-sutil mx-1"></div>
        <button 
          onClick={() => setModalHistoricoAberto(true)}
          className="h-9 w-9 rounded-xl bg-card border border-borda-sutil flex items-center justify-center text-zinc-400 hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shadow-sm"
          title="Histórico de Versões"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </button>
        <button 
          onClick={() => setModalConfigAberto(true)}
          className="h-9 w-9 rounded-xl bg-card border border-borda-sutil flex items-center justify-center text-zinc-400 hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shadow-sm"
          title="Configurações da Calculadora"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>
    )
  }), [idEdicao, pastStates.length, futureStates.length, undo, redo, autoSalvar]));

  // Handlers para Zustand
  const alternarMaterial = useCallback((id: string) => {
    const existe = armazem.materiaisSelecionados.some(m => m.id === id);
    if (existe) {
      armazem.removerMaterial(id);
    } else {
      const mat = materiais.find(m => m.id === id);
      if (mat) {
        armazem.adicionarMaterial({
          id: mat.id,
          instanceId: Math.random().toString(36).substring(2, 15),
          nome: mat.nome,
          cor: mat.cor,
          tipo: mat.tipo,
          tipoMaterial: mat.tipoMaterial || '',
          quantidade: 0,
          precoKgCentavos: Math.round((mat.precoCentavos / mat.pesoGramas) * 1000)
        });
      }
    }
  }, [armazem, materiais]);

  const atualizarQtdMaterial = useCallback((uid: string, qtd: number) => {
    armazem.atualizarMaterial(uid, { quantidade: qtd });
  }, [armazem]);

  const atualizarPrecoMaterial = useCallback((uid: string, precoKg: number) => {
    armazem.atualizarMaterial(uid, { precoKgCentavos: Math.round(precoKg * 100) });
  }, [armazem]);

  const atualizarTempoMaterial = useCallback((uid: string, horas: number, minutos: number, segundos: number = 0) => {
    armazem.atualizarMaterial(uid, { tempoHoras: horas, tempoMinutos: minutos, tempoSegundos: segundos });
    const newState = armazem.materiaisSelecionados.map(m => (m.instanceId || m.id) === uid ? { ...m, tempoHoras: horas, tempoMinutos: minutos, tempoSegundos: segundos } : m);
    const totalMinutos = newState.reduce((acc, m) => acc + (m.tempoHoras || 0) * 60 + (m.tempoMinutos || 0) + (m.tempoSegundos || 0) / 60, 0);
    armazem.setParametro('tempoMinutosMaquina', totalMinutos);
  }, [armazem]);

  const atualizarNomePecaMaterial = useCallback((uid: string, nome: string) => {
    armazem.atualizarMaterial(uid, { nomePeca: nome });
  }, [armazem]);

  const adicionarSubPeca = useCallback((idMaterial: string) => {
    const mat = materiais.find(m => m.id === idMaterial);
    if (mat) {
      armazem.adicionarMaterial({
        id: mat.id,
        instanceId: Math.random().toString(36).substring(2, 15),
        nome: mat.nome,
        cor: mat.cor,
        tipo: mat.tipo,
        tipoMaterial: mat.tipoMaterial || '',
        quantidade: 0,
        precoKgCentavos: Math.round((mat.precoCentavos / mat.pesoGramas) * 1000)
      });
    }
  }, [armazem, materiais]);

  // Atalhos de teclado (Ctrl+Z / Ctrl+Y)
  useEffect(() => {
    const lidarComTeclado = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') { e.preventDefault(); undo(); }
        if (e.key === 'y' || (e.shiftKey && e.key === 'Z')) { e.preventDefault(); redo(); }
      }
    };
    window.addEventListener('keydown', lidarComTeclado);
    return () => window.removeEventListener('keydown', lidarComTeclado);
  }, [undo, redo]);

  return (
    <div className="absolute inset-0 grid grid-cols-1 xl:grid-cols-12 gap-8 overflow-y-auto xl:overflow-hidden px-4 sm:px-6 md:px-12 pb-24 xl:pb-0 bg-background pt-8">
      
      {/* PAINEL ESQUERDO: Lista Completa */}
      <div className="xl:col-span-8 relative space-y-6 h-auto xl:h-full overflow-y-visible xl:overflow-y-auto pb-10 xl:pb-20 px-4 pt-4 -mx-4 -mt-4 scrollbar-hide">
        
        {/* O conteúdo da calculadora começa aqui */}
        {/* Banner Modo da Calculadora */}
        <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-borda-sutil">
          <div className="flex flex-col">
            <h3 className="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Modo Avançado</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-bold uppercase tracking-wider">
              {modoAvancado ? "Exibindo todos os custos, variáveis e logística" : "Exibindo apenas peças, tempo e materiais"}
            </p>
          </div>
          <button 
            onClick={() => setModoAvancado(!modoAvancado)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${modoAvancado ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${modoAvancado ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-8 h-full">
            <CardIdentificacaoProjeto
              buscaCliente={buscaClienteSeletor} setBuscaCliente={setBuscaClienteSeletor}
              abertoSeletorCliente={abertoSeletorCliente} setAbertoSeletorCliente={setAbertoSeletorCliente}
              clientes={estadoClientes.clientes || []} clienteId={clienteProjetoId} setClienteId={(id) => {
                setClienteProjetoId(id);
                const cli = estadoClientes.clientes?.find(c => c.id === id);
                if (cli && cli.canalReferencia) {
                  const canal = perfisMarketplace.find((c: any) => c.nome === cli.canalReferencia);
                  if (canal) {
                    setPerfilAtivo(canal.nome);
                    armazem.setParametro('taxaEcommercePercentual', canal.taxaVariavel || 0);
                    armazem.setParametro('taxaFixaVendaCentavos', canal.taxaFixaCentavos || 0);
                    toast.success(`Taxas do canal ${canal.nome} aplicadas automaticamente!`, { id: "canal-venda" });
                  }
                }
              }}
              criandoNovoCliente={criandoNovoCliente}
              aoCriarNovoCliente={async (nome) => {
                setCriandoNovoCliente(true);
                try {
                  const novo = await acoesClientes.salvarCliente({ 
                    nome, tipo: "B2C", baseLegal: BaseLegalLGPD.EXECUCAO_CONTRATO, finalidadeColeta: "Orçamento", prazoRetencaoMeses: 60
                  } as any);
                  if (novo?.id) { setClienteProjetoId(novo.id); setBuscaClienteSeletor(nome); setAbertoSeletorCliente(false); }
                } finally { setCriandoNovoCliente(false); }
              }}
              nomeProjeto={nomeProjeto} setNomeProjeto={setNomeProjeto}
              descricaoProjeto={descricaoProjeto} setDescricaoProjeto={setDescricaoProjeto}
              modoEntrada={armazem.modoEntrada} setModoEntrada={(v) => armazem.setParametro('modoEntrada', v)}
              quantidade={armazem.quantidade}
            />
          </div>
          <div className="lg:col-span-4 h-full">
            <CardEquipamento
              impressoras={estadoImpressoras.impressoras}
              impressoraSelecionadaId={impressoraSelecionadaId}
              aoSelecionar={(id) => {
                setImpressoraSelecionadaId(id);
                const imp = estadoImpressoras.impressoras.find(i => i.id === id);
                if (imp) {
                  armazem.setParametrosLote({ potenciaWatts: imp.potenciaWatts || 0, depreciacaoHoraCentavos: imp.taxaHoraCentavos || 0 });
                }
              }}
              aoAplicarSugestaoFalha={() => {
                // Aplica 15% do peso total de todos os materiais
                const pesoTotal = armazem.materiaisSelecionados.reduce((soma, m) => soma + m.quantidade, 0);
                const perdaSugerida = Math.round(pesoTotal * 0.15);
                armazem.setParametro('materialPerdidoGramas', perdaSugerida);
                setMostrarPerdas(true); // Abre o card de perdas para mostrar
                toast.success("15% de perda adicionados ao cálculo!");
              }}
              abertoSeletor={abertoSeletorImpressora} setAbertoSeletor={setAbertoSeletorImpressora}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={modoAvancado ? "lg:col-span-2" : "lg:col-span-3"}>
            <CardProducao
              quantidade={armazem.quantidade} setQuantidade={v => armazem.setParametro('quantidade', v)}
              pecasPorMesa={armazem.pecasPorMesa} setPecasPorMesa={v => armazem.setParametro('pecasPorMesa', v)}
              tempo={armazem.tempoMinutosMaquina} setTempo={v => armazem.setParametro('tempoMinutosMaquina', v)}
              modoEntrada={armazem.modoEntrada}
              potencia={armazem.potenciaWatts} setPotencia={v => armazem.setParametro('potenciaWatts', v)}
              precoKwh={armazem.precoKwhCentavos} setPrecoKwh={v => armazem.setParametro('precoKwhCentavos', v)}
              custoEnergia={armazem.resultado.custoEnergia / 100}
              cobrarEnergia={armazem.cobrarEnergia} setCobrarEnergia={v => armazem.setParametro('cobrarEnergia', v)}
              impressoras={estadoImpressoras.impressoras}
              idImpressoraSelecionada={impressoraSelecionadaId}
              aoDetectarTarifa={async () => {
                setModalTarifaAberto(true);
                return null;
              }}
            />
          </div>
          
          {modoAvancado && (
            <div className="lg:col-span-1">
              <CardDepreciacao
                depreciacao={armazem.depreciacaoHoraCentavos}
                cobrarDesgaste={armazem.cobrarDesgaste}
                setCobrarDesgaste={v => armazem.setParametro('cobrarDesgaste', v)}
                anosVidaUtil={anosVidaUtil}
                setAnosVidaUtil={setAnosVidaUtil}
                tempo={armazem.tempoMinutosMaquina}
                quantidade={armazem.quantidade}
                modoEntrada={armazem.modoEntrada}
              />
            </div>
          )}
        </div>

        <section className="space-y-4 mt-4">
          <div className="flex items-center gap-2 px-2">
            <h2 className="text-sm font-black text-white tracking-widest uppercase">Materiais e Insumos</h2>
          </div>
          <div className="flex flex-col gap-6">
            <CardMateriais
              materiais={materiais.filter(m => !m.arquivado && m.nome.toLowerCase().includes(buscaMaterial.toLowerCase()))}
              selecionados={armazem.materiaisSelecionados} alertas={[]} 
              busca={buscaMaterial} setBusca={setBuscaMaterial}
              alternar={alternarMaterial} atualizarQtd={atualizarQtdMaterial}
              atualizarPreco={atualizarPrecoMaterial} atualizarTempo={atualizarTempoMaterial}
              atualizarNomePeca={atualizarNomePecaMaterial} remover={armazem.removerMaterial}
              abrirArmazem={() => setModalArmazemMateriaisAberto(true)} 
              abrirCriar={() => acoesMateriais.abrirEditar(null as any)} 
              alternarFavorito={() => {}} 
              adicionarPeca={adicionarSubPeca}
            />

            <CardInsumos
              insumos={insumosEstoque} selecionados={armazem.insumosSelecionados}
              alertas={[]} busca={buscaInsumo} setBusca={setBuscaInsumo}
              alternar={(insumo: any) => {
                const existe = armazem.insumosSelecionados.some(i => i.id === insumo.id);
                if (existe) {
                  armazem.removerInsumo(insumo.id);
                } else {
                  armazem.adicionarInsumo({
                    id: insumo.id,
                    nome: insumo.nome,
                    quantidade: 1,
                    custoCentavos: insumo.custoMedioUnidade,
                    porLote: false
                  });
                }
              }} 
              atualizarQtd={(id: string, qtd: number) => {
                const selec = armazem.insumosSelecionados;
                const index = selec.findIndex(i => i.id === id);
                if (index !== -1) {
                  const novo = [...selec];
                  novo[index] = { ...novo[index], quantidade: qtd };
                  armazem.setParametro('insumosSelecionados', novo);
                }
              }} 
              remover={armazem.removerInsumo}
              alternarPorLote={(id: string) => {
                const selec = armazem.insumosSelecionados;
                const index = selec.findIndex(i => i.id === id);
                if (index !== -1) {
                  const novo = [...selec];
                  novo[index] = { ...novo[index], porLote: !novo[index].porLote };
                  armazem.setParametro('insumosSelecionados', novo);
                }
              }}
              abrirGerenciar={() => setModalArmazemInsumosAberto(true)}
              abrirNovo={() => acoesInsumos.abrirEditar(null as any)}
              modoEntrada={armazem.modoEntrada} alternarFavorito={() => {}}
            />
          </div>
        </section>

        {modoAvancado && (
          <section className="space-y-4 mt-8">
            <div className="flex items-center gap-2 px-2">
              <h2 className="text-sm font-black text-white tracking-widest uppercase">Serviços e Adicionais</h2>
            </div>
            <div className="flex flex-col gap-6">
              <CardModelagem
                mostrar={mostrarModelagem} setMostrar={setMostrarModelagem}
                tempoModelagem={armazem.tempoModelagemMinutos} setTempoModelagem={v => armazem.setParametro('tempoModelagemMinutos', v)}
                valorHoraModelagem={armazem.valorHoraModelagemCentavos} setValorHoraModelagem={v => armazem.setParametro('valorHoraModelagemCentavos', v)}
                modoEntrada={armazem.modoEntrada}
              />

              <CardPosProcesso
                mostrar={mostrarPosProcesso} setMostrar={setMostrarPosProcesso}
                posProcesso={armazem.itensPosProcesso}
                setPosProcesso={v => {
                  const existingIds = armazem.itensPosProcesso.map(i => i.id);
                  existingIds.forEach(id => armazem.removerPosProcesso(id));
                  v.forEach(i => armazem.adicionarPosProcesso(i));
                }}
                quantidade={armazem.quantidade}
                modoEntrada={armazem.modoEntrada}
              />

              <CardCustosAdicionais
                custosAdicionais={armazem.custosAdicionais || []}
                adicionarCustoAdicional={armazem.adicionarCustoAdicional}
                removerCustoAdicional={armazem.removerCustoAdicional}
                cobrarCustosAdicionais={armazem.cobrarCustosAdicionais}
                setCobrarCustosAdicionais={v => armazem.setParametro('cobrarCustosAdicionais', v)}
                multiplicadorGeral={armazem.quantidade}
              />
            </div>
          </section>
        )}

        <section className="space-y-4 mt-8 mb-8">
          {modoAvancado && (
            <div className="flex items-center gap-2 px-2">
              <h2 className="text-sm font-black text-white tracking-widest uppercase">Logística e Precificação</h2>
            </div>
          )}
          <div className="flex flex-col gap-6">
            {modoAvancado && (
              <>
                <CardPerdas
                  mostrar={mostrarPerdas} setMostrar={setMostrarPerdas}
                  materialPerdido={armazem.materialPerdidoGramas} setMaterialPerdido={v => armazem.setParametro('materialPerdidoGramas', v)}
                  tempoPerdido={armazem.tempoPerdidoMinutos} setTempoPerdido={v => armazem.setParametro('tempoPerdidoMinutos', v)}
                  custoFalha={armazem.resultado.custoFalha}
                  modoEntrada={armazem.modoEntrada}
                />

                <CardCustosFixos
                  mostrar={mostrarCustosFixos} setMostrar={setMostrarCustosFixos}
                  insumosFixos={armazem.insumosFixosCentavos}
                  cobrarInsumosFixos={armazem.cobrarInsumosFixos} setCobrarInsumosFixos={v => armazem.setParametro('cobrarInsumosFixos', v)}
                  itensCustosFixos={armazem.itensCustosFixos || []}
                  setItensCustosFixos={v => armazem.setParametro('itensCustosFixos', v)}
                  modoEntrada={armazem.modoEntrada}
                />

                <CardLogistica
                  perfis={perfisMarketplace}
                  perfilAtivo={perfilAtivo}
                  setPerfilAtivo={(nome) => {
                    setPerfilAtivo(nome);
                    const p = perfisMarketplace.find((x: any) => x.nome === nome);
                    if (p) {
                      armazem.setParametro('taxaEcommercePercentual', p.taxaPontosBase);
                      armazem.setParametro('taxaFixaVendaCentavos', p.fixaCentavos);
                      armazem.setParametro('freteCentavos', p.freteCentavos);
                    } else {
                      armazem.setParametro('taxaEcommercePercentual', 0);
                      armazem.setParametro('taxaFixaVendaCentavos', 0);
                      armazem.setParametro('freteCentavos', 0);
                    }
                  }}
                  taxaEcommerce={armazem.taxaEcommercePercentual}
                  setTaxaEcommerce={v => armazem.setParametro('taxaEcommercePercentual', v)}
                  taxaFixa={armazem.taxaFixaVendaCentavos}
                  setTaxaFixa={v => armazem.setParametro('taxaFixaVendaCentavos', v)}
                  frete={armazem.freteCentavos}
                  setFrete={v => armazem.setParametro('freteCentavos', v)}
                  abrirPerfis={() => setModalCanaisAberto(true)}
                  cobrarLogistica={armazem.cobrarLogistica}
                  setCobrarLogistica={v => armazem.setParametro('cobrarLogistica', v)}
                />
              </>
            )}

            <CardLucro
              margem={armazem.margemLucroPercentual}
              setMargem={v => armazem.setParametro('margemLucroPercentual', v)}
              setCobrarCustosAdicionais={v => armazem.setParametro('cobrarCustosAdicionais', v)}
              setCobrarDesgaste={v => armazem.setParametro('cobrarDesgaste', v)}
              aplicarTemplate={true}
            />
          </div>
        </section>
        
      </div>

      {/* PAINEL DIREITO: Fixo */}
      <div className="xl:col-span-4 xl:h-full flex flex-col justify-start items-center overflow-y-visible scrollbar-hide">
        <PainelResultados
          calculo={armazem.resultado}
          salvarProjeto={salvarProjetoHandler}
          gerarPdf={gerarPdfExportacao}
          gerarLinkMagico={gerarLinkPublico} obterUrlLinkMagico={() => urlLinkMagico}
          carregandoPdf={gerandoPdf}
          materiais={armazem.materiaisSelecionados} insumos={armazem.insumosSelecionados}
          posProcesso={armazem.itensPosProcesso} quantidade={armazem.quantidade}
          insumosFixos={armazem.insumosFixosCentavos} tempo={armazem.tempoMinutosMaquina}
          modoEntrada={armazem.modoEntrada} frete={armazem.freteCentavos}
          taxaFixa={armazem.taxaFixaVendaCentavos} aoSugerirPrecoIA={sugerirPrecoComIA}
          explicacaoIA={explicacaoIA}
        />
      </div>

      {/* Modais V2 */}
      <ModalConfiguracoesV2
        aberto={modalConfigAberto}
        aoFechar={() => setModalConfigAberto(false)}
        eProOuSuperior={eProOuSuperior}
        config={config}
        armazem={armazem}
        aoSalvar={async () => {
          if (usuario?.uid) {
            await config.salvarNoD1(usuario.uid);
            setModalConfigAberto(false);
            toast.success("Configurações sincronizadas!");
          }
        }}
        aoClicarPaywall={() => {
          setRecursoPaywall("Orçamento PDF White-label");
          setModalConfigAberto(false);
          setModalPaywallAberto(true);
        }}
      />

      <ModalHistoricoV2
        aberto={modalHistoricoAberto}
        aoFechar={() => setModalHistoricoAberto(false)}
        historico={armazem.historico}
        aoSalvar={(nome) => {
          armazem.salvarSnapshot(nome, descricaoProjeto, clienteProjetoId);
          toast.success("Orçamento salvo com sucesso!");
        }}
        aoCarregar={(snapshot) => {
          armazem.carregarSnapshot(snapshot);
          setNomeProjeto(snapshot.nome);
          setDescricaoProjeto(snapshot.descricao || "");
          setClienteProjetoId(snapshot.clienteId || "");
          toast.success("Orçamento restaurado!");
        }}
        aoRemover={(id) => {
          armazem.removerSnapshot(id);
          toast.success("Snapshot removido!");
        }}
      />
      
      <ModalUpgradePaywall
        aberto={modalPaywallAberto}
        aoFechar={() => setModalPaywallAberto(false)}
        recurso={recursoPaywall}
        aoFazerUpgrade={() => {
          setModalPaywallAberto(false);
          toast("Redirecionando para a tela de Upgrade...", { icon: 'ℹ️' });
          // window.location.href = '/assinatura'; 
        }}
      />

      {/* Pop-up de Confirmação Customizado */}
      <Dialogo 
        aberto={modalConfirmarReset} 
        aoFechar={() => setModalConfirmarReset(false)} 
        larguraMax="max-w-md"
        esconderCabecalho={true}
      >
        <div className="p-6 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </div>
          
          <div>
            <h3 className="text-lg font-black text-primary dark:text-white mb-2">Resetar Orçamento?</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Tem certeza que deseja apagar todo o orçamento atual e começar do zero? Esta ação limpará todos os materiais, insumos e custos informados.
            </p>
          </div>
          
          <div className="flex gap-3 mt-8">
            <button 
              onClick={() => setModalConfirmarReset(false)}
              className="flex-1 h-12 rounded-xl font-bold text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
            >
              Cancelar
            </button>
            <button 
              onClick={() => {
                armazem.limpar();
                setNomeProjeto("");
                setDescricaoProjeto("");
                setClienteProjetoId("");
                setBuscaClienteSeletor("");
                setImpressoraSelecionadaId("");
                setBuscaMaterial("");
                setBuscaInsumo("");
                setMostrarPerdas(false);
                setMostrarCustosFixos(false);
                setMostrarModelagem(false);
                setMostrarPosProcesso(false);
                toast.success("Orçamento resetado com sucesso!");
                setModalConfirmarReset(false);
              }}
              className="flex-1 h-12 rounded-xl font-bold text-sm bg-rose-500 text-white hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/30"
            >
              Sim, apagar tudo
            </button>
          </div>
        </div>
      </Dialogo>

      {/* Tabela de PDF Oculta para o HTML2Canvas */}
      <div className="fixed overflow-hidden opacity-0 pointer-events-none" style={{ left: '-9999px', top: 0 }}>
        <div id="recibo-pdf-oculto" style={{ width: '800px', padding: '40px', backgroundColor: 'white', color: 'black', fontFamily: 'sans-serif' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#18181b', margin: 0 }}>{config.nomeEstudio || "Estúdio de Impressão 3D"}</h1>
              <p style={{ color: '#71717a', fontSize: '14px', margin: '4px 0 0 0' }}>{""}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#27272a', margin: 0 }}>PROPOSTA COMERCIAL</h2>
              <p style={{ color: '#71717a', fontSize: '14px', margin: '4px 0 0 0' }}>Data: {format(new Date(), "dd/MM/yyyy")}</p>
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontWeight: 'bold', color: '#27272a', fontSize: '18px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', marginBottom: '12px', margin: 0 }}>Detalhes do Projeto</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
              <div><span style={{ color: '#71717a' }}>Projeto:</span> <span style={{ fontWeight: 500, color: '#18181b' }}>{nomeProjeto || "Não especificado"}</span></div>
              <div><span style={{ color: '#71717a' }}>Cliente:</span> <span style={{ fontWeight: 500, color: '#18181b' }}>{estadoClientes.clientes.find(c => c.id === clienteProjetoId)?.nome || "Não especificado"}</span></div>
              <div style={{ gridColumn: 'span 2' }}><span style={{ color: '#71717a' }}>Descrição:</span> <span style={{ fontWeight: 500, color: '#18181b' }}>{descricaoProjeto || "Sem descrição"}</span></div>
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontWeight: 'bold', color: '#27272a', fontSize: '18px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', marginBottom: '12px', margin: 0 }}>Especificações Técnicas</h3>
            <ul style={{ fontSize: '14px', margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {armazem.materiaisSelecionados.map((m, i) => (
                <li key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>- Material: {m.nome} ({m.cor})</span>
                  <span style={{ fontWeight: 500 }}>Consumo: {m.quantidade}g</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontWeight: 'bold', color: '#27272a', fontSize: '18px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', marginBottom: '12px', margin: 0 }}>Resumo Financeiro</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#71717a' }}>Tempo Estimado de Produção:</span> <span style={{ fontWeight: 500, color: '#18181b' }}>{Math.floor(armazem.tempoMinutosMaquina/60)}h {Math.floor(armazem.tempoMinutosMaquina%60)}m</span></div>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#71717a' }}>Quantidade de Peças (Lotes):</span> <span style={{ fontWeight: 500, color: '#18181b' }}>{armazem.quantidade}x</span></div>
               
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 900, marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                 <span style={{ color: '#18181b' }}>VALOR TOTAL:</span> 
                 <span style={{ color: '#0ea5e9' }}>{centavosParaReais(armazem.resultado.precoSugerido)}</span>
               </div>
            </div>
          </div>
          
          <div style={{ marginTop: '48px', textAlign: 'center', fontSize: '12px', color: '#a1a1aa' }}>
             Este orçamento é válido por 15 dias corridos. Os valores podem sofrer alteração caso o modelo 3D original passe por reajustes.
          </div>
        </div>
      </div>
      
      <ModalDetectarTarifa 
          aberto={modalTarifaAberto} 
          aoFechar={() => setModalTarifaAberto(false)} 
          aoAplicarTarifa={(estado, tarifa) => {
            armazem.setParametro('precoKwhCentavos', Math.round(tarifa * 100));
            toast.success(`Tarifa de ${estado} aplicada: R$ ${tarifa.toFixed(2)}/kWh`);
          }}
        />

        <ModalArmazemMateriais
          aberto={modalArmazemMateriaisAberto}
          aoFechar={() => setModalArmazemMateriaisAberto(false)}
          busca={buscaMaterial}
          setBusca={setBuscaMaterial}
          filtroTipo={estadoMateriais.filtro}
          setFiltroTipo={(t) => acoesMateriais.definirFiltro(t)}
          materiaisFiltrados={estadoMateriais.materiaisFiltradosOrdenados}
          selecionados={armazem.materiaisSelecionados}
          aoAlternar={(m) => alternarMaterial(m)}
          aoCriarNovo={() => {
            setModalArmazemMateriaisAberto(false);
            acoesMateriais.abrirEditar(null as any);
          }}
          aoAlternarFavorito={acoesMateriais.alternarFavorito}
        />

        <ModalArmazemInsumos
          aberto={modalArmazemInsumosAberto}
          aoFechar={() => setModalArmazemInsumosAberto(false)}
          busca={buscaInsumo}
          setBusca={setBuscaInsumo}
          insumosFiltrados={estadoInsumos.insumos}
          selecionados={armazem.insumosSelecionados}
          aoAlternar={(insumo: any) => {
            const existe = armazem.insumosSelecionados.some(i => i.id === insumo.id);
            if (existe) {
              armazem.removerInsumo(insumo.id);
            } else {
              armazem.adicionarInsumo({
                id: insumo.id,
                nome: insumo.nome,
                quantidade: 1,
                custoCentavos: insumo.custoMedioUnidade,
                porLote: false
              });
            }
          }}
          aoCriarNovo={() => {
            setModalArmazemInsumosAberto(false);
            acoesInsumos.abrirEditar(null as any);
          }}
          aoAlternarFavorito={() => {}}
        />

        <FormularioMaterial
          aberto={estadoMateriais.modalAberto}
          aoSalvar={acoesMateriais.salvarMaterial}
          aoCancelar={acoesMateriais.fecharEditar}
        />

        <FormularioInsumo
          aberto={estadoInsumos.modalCricaoAberto}
          insumoEditando={estadoInsumos.insumoEditando}
          aoSalvar={(dados) => acoesInsumos.adicionarOuAtualizarInsumo(dados as any)}
          aoCancelar={acoesInsumos.fecharEditar}
        />

      <ModalCanaisVenda
        aberto={modalCanaisAberto}
        aoFechar={() => setModalCanaisAberto(false)}
        hook={{
          perfisMarketplace,
          setPerfisMarketplace,
          perfilAtivo,
          setPerfilAtivo: (nome: string) => {
            setPerfilAtivo(nome);
            const p = perfisMarketplace.find((x: any) => x.nome === nome);
            if (p) {
              armazem.setParametro('taxaEcommercePercentual', p.taxaPontosBase);
              armazem.setParametro('taxaFixaVendaCentavos', p.fixaCentavos);
              armazem.setParametro('freteCentavos', p.freteCentavos);
            } else {
              armazem.setParametro('taxaEcommercePercentual', 0);
              armazem.setParametro('taxaFixaVendaCentavos', 0);
              armazem.setParametro('freteCentavos', 0);
            }
          },
          setTaxaEcommerce: (v: number) => armazem.setParametro('taxaEcommercePercentual', v),
          setTaxaFixa: (v: number) => armazem.setParametro('taxaFixaVendaCentavos', v),
          setFrete: (v: number) => armazem.setParametro('freteCentavos', v)
        }}
        indiceSendoEditado={indiceSendoEditado}
        setIndiceSendoEditado={setIndiceSendoEditado}
        nomeTemporario={nomeTemporario}
        setNomeTemporario={setNomeTemporario}
      />

      {/* Barra Flutuante de Resumo (Sticky Footer) */}
      <div className="xl:hidden fixed bottom-14 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-200 dark:border-white/10 px-4 py-2.5 shadow-[0_-8px_25px_rgba(0,0,0,0.1)] flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Preço Sugerido</span>
          <span className="text-base font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
            {centavosParaReais(armazem.resultado?.precoSugerido || 0)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[9px] font-semibold text-zinc-400 block uppercase">Custo: {centavosParaReais(armazem.resultado?.custoTotalOperacional || 0)}</span>
            <span className="text-[9px] font-semibold text-emerald-500 block uppercase">Lucro: {centavosParaReais(armazem.resultado?.lucroLiquido || 0)}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
            }}
            className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold tracking-wide shadow-md transition-all active:scale-95"
          >
            Ver Detalhes
          </button>
        </div>
      </div>
    </div>
  );
}
