import { useState, useMemo, useEffect, useCallback } from "react";
import { detectarTarifaKwhAutomatico } from "@/compartilhado/utilitarios/tarifas-energia";
import { usarArmazemConfiguracoes } from "@/funcionalidades/sistema/configuracoes/estado/armazemConfiguracoes";
import { usarArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { usarArmazemInsumos } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";
import { usarPedidos } from "@/funcionalidades/producao/projetos/hooks/usarPedidos";
import { usarGerenciadorImpressoras } from "@/funcionalidades/producao/impressoras/hooks/usarGerenciadorImpressoras";
import { toast } from "react-hot-toast";
import { armazenamentoSeguro } from "@/compartilhado/utilitarios/armazenamento-seguro";
import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { 
  MaterialSelecionado, 
  ItemPosProcesso, 
  InsumoSelecionado, 
  PerfilMarketplace, 
  VersaoCalculo,
  CalculoResultado 
} from "../tipos";
import { servicoBaseApi } from "@/compartilhado/servicos/servicoBaseApi";

export function usarCalculadora() {
  const config = usarArmazemConfiguracoes();
  const { materiais } = usarArmazemMateriais();
  const { insumos: insumosEstoque } = usarArmazemInsumos();
  const { pedidos } = usarPedidos();
  const { estado: estadoImpressoras } = usarGerenciadorImpressoras();
  const impressorasCadastradas = estadoImpressoras.impressoras;

  // --- ESTADOS BASE ---
  const [materiaisSelecionados, setMateriaisSelecionados] = useState<MaterialSelecionado[]>(() => 
    armazenamentoSeguro.obter("printlog_materiais_selecionados", [])
  );
  const [tempo, setTempo] = useState<number>(() => 
    armazenamentoSeguro.obter("printlog_calculadora_tempo", 0) || armazenamentoSeguro.obter("printlog_tempo", 0)
  );
  const [potencia, setPotencia] = useState<number>(() => armazenamentoSeguro.obter("printlog_potencia", 0));
  const [precoKwh, setPrecoKwh] = useState<number>(() => {
    const salvo = armazenamentoSeguro.obter<number | null>("printlog_preco_kwh", null);
    return (salvo !== null && salvo !== 0) ? salvo : config.custoEnergia;
  });
  const [maoDeObra, setMaoDeObra] = useState<number>(() => armazenamentoSeguro.obter("printlog_mao_de_obra", config.horaOperador));
  const [depreciacaoHora, setDepreciacaoHora] = useState<number>(() => armazenamentoSeguro.obter("printlog_depreciacao_hora", config.horaMaquina));
  const [margem, setMargem] = useState<number>(() => armazenamentoSeguro.obter("printlog_margem", config.margemLucro));
  
  const [quantidade, setQuantidade] = useState<number>(() => armazenamentoSeguro.obter("printlog_quantidade", 0));
  const [modoEntrada, setModoEntrada] = useState<'unitario' | 'lote'>(() => armazenamentoSeguro.obter<'unitario' | 'lote'>("printlog_calculadora_modo_entrada", "lote"));
  const [tempoSetup, setTempoSetup] = useState<number>(() => armazenamentoSeguro.obter("printlog_tempo_setup", 0));
  const [taxaFalha, setTaxaFalha] = useState<number>(() => armazenamentoSeguro.obter("printlog_taxa_falha", 0));
  const [materialPerdido, setMaterialPerdido] = useState<number>(() => armazenamentoSeguro.obter("printlog_material_perdido", 0));
  const [tempoPerdido, setTempoPerdido] = useState<number>(() => armazenamentoSeguro.obter("printlog_tempo_perdido", 0));
  
  const [frete, setFrete] = useState<number>(() => armazenamentoSeguro.obter("printlog_frete", 0));
  const [insumosFixos, setInsumosFixos] = useState<number>(() => armazenamentoSeguro.obter("printlog_insumos_fixos", 0));
  const [insumosSelecionados, setInsumosSelecionados] = useState<InsumoSelecionado[]>(() => armazenamentoSeguro.obter("printlog_insumos_selecionados", []));
  const [itensPosProcesso, setItensPosProcesso] = useState<ItemPosProcesso[]>(() => armazenamentoSeguro.obter("printlog_itens_pos_processo", []));
  
  const [cobrarDesgaste, setCobrarDesgaste] = useState<boolean>(() => armazenamentoSeguro.obter("printlog_cobrar_desgaste", true));
  const [cobrarMaoDeObra, setCobrarMaoDeObra] = useState<boolean>(() => armazenamentoSeguro.obter("printlog_cobrar_mao_de_obra", true));
  const [cobrarEnergia, setCobrarEnergia] = useState<boolean>(() => armazenamentoSeguro.obter("printlog_cobrar_energia", true));
  const [cobrarInsumosFixos, setCobrarInsumosFixos] = useState<boolean>(() => armazenamentoSeguro.obter("printlog_cobrar_insumos_fixos", true));
  const [cobrarLogistica, setCobrarLogistica] = useState<boolean>(() => armazenamentoSeguro.obter("printlog_cobrar_logistica", true));
  const [perfilAtivo, setPerfilAtivo] = useState(() => armazenamentoSeguro.obter("printlog_perfil_ativo", "Direto"));
  const [taxaEcommerce, setTaxaEcommerce] = useState<number>(0);
  const [taxaFixa, setTaxaFixa] = useState<number>(0);



  // Efeitos de persistência segura
  useEffect(() => { armazenamentoSeguro.definir("printlog_cobrar_desgaste", cobrarDesgaste); }, [cobrarDesgaste]);
  useEffect(() => { armazenamentoSeguro.definir("printlog_cobrar_mao_de_obra", cobrarMaoDeObra); }, [cobrarMaoDeObra]);
  useEffect(() => { armazenamentoSeguro.definir("printlog_cobrar_energia", cobrarEnergia); }, [cobrarEnergia]);
  useEffect(() => { armazenamentoSeguro.definir("printlog_cobrar_insumos_fixos", cobrarInsumosFixos); }, [cobrarInsumosFixos]);
  useEffect(() => { armazenamentoSeguro.definir("printlog_cobrar_logistica", cobrarLogistica); }, [cobrarLogistica]);
  useEffect(() => { armazenamentoSeguro.definir("printlog_perfil_ativo", perfilAtivo); }, [perfilAtivo]);
  useEffect(() => { armazenamentoSeguro.definir("printlog_materiais_selecionados", materiaisSelecionados); }, [materiaisSelecionados]);
  useEffect(() => { armazenamentoSeguro.definir("printlog_calculadora_tempo", tempo); }, [tempo]);
  useEffect(() => { armazenamentoSeguro.definir("printlog_calculadora_modo_entrada", modoEntrada); }, [modoEntrada]);
  useEffect(() => { armazenamentoSeguro.definir("printlog_potencia", potencia); }, [potencia]);
  useEffect(() => { armazenamentoSeguro.definir("printlog_preco_kwh", precoKwh); }, [precoKwh]);
  useEffect(() => { armazenamentoSeguro.definir("printlog_mao_de_obra", maoDeObra); }, [maoDeObra]);
  useEffect(() => { armazenamentoSeguro.definir("printlog_depreciacao_hora", depreciacaoHora); }, [depreciacaoHora]);
  useEffect(() => { armazenamentoSeguro.definir("printlog_margem", margem); }, [margem]);
  useEffect(() => { armazenamentoSeguro.definir("printlog_quantidade", quantidade); }, [quantidade]);
  useEffect(() => { armazenamentoSeguro.definir("printlog_tempo_setup", tempoSetup); }, [tempoSetup]);
  useEffect(() => { armazenamentoSeguro.definir("printlog_taxa_falha", taxaFalha); }, [taxaFalha]);
  useEffect(() => { armazenamentoSeguro.definir("printlog_material_perdido", materialPerdido); }, [materialPerdido]);
  useEffect(() => { armazenamentoSeguro.definir("printlog_tempo_perdido", tempoPerdido); }, [tempoPerdido]);
  useEffect(() => { armazenamentoSeguro.definir("printlog_frete", frete); }, [frete]);
  useEffect(() => { armazenamentoSeguro.definir("printlog_insumos_fixos", insumosFixos); }, [insumosFixos]);
  useEffect(() => { armazenamentoSeguro.definir("printlog_insumos_selecionados", insumosSelecionados); }, [insumosSelecionados]);
  useEffect(() => { armazenamentoSeguro.definir("printlog_itens_pos_processo", itensPosProcesso); }, [itensPosProcesso]);

  const [impressoraSelecionadaId, setImpressoraSelecionadaId] = useState<string>(() => {
    return localStorage.getItem("printlog_ultima_impressora") || "";
  });

  useEffect(() => {
    if (impressoraSelecionadaId && impressorasCadastradas.length > 0) {
      const imp = impressorasCadastradas.find(i => i.id === impressoraSelecionadaId);
      if (imp) {
        if (imp.potenciaWatts) setPotencia(imp.potenciaWatts);
        if (imp.taxaHoraCentavos) setDepreciacaoHora(imp.taxaHoraCentavos);
        localStorage.setItem("printlog_ultima_impressora", impressoraSelecionadaId);
      }
    }
  }, [impressoraSelecionadaId, impressorasCadastradas]);

  const [perfisMarketplace, setPerfisMarketplace] = useState<PerfilMarketplace[]>(() => {
    const salvo = armazenamentoSeguro.obter<any[] | null>("printlog_perfis_marketplace", null);
    if (salvo) {
      try {
        return salvo.map((p: any) => ({
          nome: p.nome,
          taxaPontosBase: p.taxaPontosBase !== undefined ? p.taxaPontosBase : (p.taxa || 0) * 100,
          fixaCentavos: p.fixaCentavos !== undefined ? p.fixaCentavos : (p.fixa || 0) * 100,
          freteCentavos: p.freteCentavos !== undefined ? p.freteCentavos : (p.frete || 0) * 100
        }));
      } catch (e) {
        console.error("Erro ao migrar perfis:", e);
      }
    }
    return [
      { nome: "Direto", taxaPontosBase: 0, fixaCentavos: 0, freteCentavos: 0 },
      { nome: "M. Livre", taxaPontosBase: 1800, fixaCentavos: 600, freteCentavos: 0 },
      { nome: "Shopee", taxaPontosBase: 2000, fixaCentavos: 300, freteCentavos: 0 },
      { nome: "Site", taxaPontosBase: 500, fixaCentavos: 0, freteCentavos: 0 },
    ];
  });

  useEffect(() => {
    const perfil = perfisMarketplace.find(p => p.nome === perfilAtivo);
    if (perfil) {
      setTaxaEcommerce(perfil.taxaPontosBase);
      setTaxaFixa(perfil.fixaCentavos);
      if (perfil.freteCentavos !== undefined) setFrete(perfil.freteCentavos);
    }
  }, [perfilAtivo, perfisMarketplace]);

  const [historico, setHistorico] = useState<VersaoCalculo[]>([]);

  useEffect(() => {
    const carregarHistorico = async () => {
      try {
        const dados = await servicoBaseApi.get<any[]>("/api/historico");
        if (dados && Array.isArray(dados)) {
          const formatado = dados.map(d => ({
            id: d.id,
            nome: d.nome,
            data: d.criadoEm,
            calculo: d.dados.calculo,
            configuracoes: d.dados.configuracoes
          }));
          setHistorico(formatado);
        }
      } catch (e) {
        console.error("Erro ao carregar histórico", e);
      }
    };
    carregarHistorico();
  }, []);

  // Cálculo de Resultados
  const calculo = useMemo((): CalculoResultado => {
    const custoMaterialTotalCentavos = materiaisSelecionados.reduce((acc, m) => {
      const pesoTotal = modoEntrada === 'lote' ? m.quantidade : m.quantidade * quantidade;
      return acc + (pesoTotal / 1000) * m.precoKgCentavos;
    }, 0);
    const custoInsumosDinamicosCentavos = insumosSelecionados.reduce((acc, i) => {
      const valorBase = i.quantidade * i.custoCentavos;
      return acc + (i.porLote ? valorBase : valorBase * quantidade);
    }, 0);
    const horasDecimaisMaquina = modoEntrada === 'lote' ? (tempo / 60) : (tempo / 60) * quantidade;
    const custoEnergiaCentavos = cobrarEnergia ? Math.round((potencia / 1000) * horasDecimaisMaquina * precoKwh) : 0;
    const custoDepreciacaoCentavos = cobrarDesgaste ? Math.round(horasDecimaisMaquina * depreciacaoHora) : 0;
    const custoFilamentoPerdidoCentavos = materiaisSelecionados.reduce((acc, m) => acc + (materialPerdido / 1000) * m.precoKgCentavos, 0);
    const custoTempoPerdidoCentavos = ((tempoPerdido / 60) * depreciacaoHora) + (cobrarEnergia ? Math.round((potencia / 1000) * (tempoPerdido / 60) * precoKwh) : 0);
    const custoFalhaRealCentavos = Math.round(custoFilamentoPerdidoCentavos + custoTempoPerdidoCentavos);
    const custoMaoDeObraCentavos = cobrarMaoDeObra ? Math.round((tempoSetup / 60) * maoDeObra) : 0;
    const custoPosProcessoCentavos = itensPosProcesso.reduce((t, i) => t + (i.valor), 0) * (modoEntrada === 'lote' ? 1 : quantidade);
    const custoInsumosFixosCentavos = cobrarInsumosFixos ? insumosFixos : 0;
    const custoFreteCentavos = cobrarLogistica ? frete : 0;
    const custoProducaoTotalCentavos = custoMaterialTotalCentavos + custoEnergiaCentavos + custoMaoDeObraCentavos + custoDepreciacaoCentavos + custoPosProcessoCentavos + custoInsumosDinamicosCentavos + custoInsumosFixosCentavos + custoFalhaRealCentavos;
    
    const margemPercentual = margem / 10000;
    const taxaMktPercentual = cobrarLogistica ? taxaEcommerce / 10000 : 0;
    const taxaFixaVendaCentavos = cobrarLogistica ? taxaFixa : 0;
    
    const precoBaseVendaCentavos = custoProducaoTotalCentavos + (custoProducaoTotalCentavos * margemPercentual) + custoFreteCentavos + taxaFixaVendaCentavos;
    const denominadorTaxas = 1 - taxaMktPercentual;
    const precoSugeridoCentavos = denominadorTaxas > 0.05 ? Math.round(precoBaseVendaCentavos / denominadorTaxas) : Math.round(precoBaseVendaCentavos * 1.5);
    const taxaMktTotalCentavos = Math.round(precoSugeridoCentavos * taxaMktPercentual + taxaFixaVendaCentavos);
    const lucroLiquidoCentavos = precoSugeridoCentavos - taxaMktTotalCentavos - custoFreteCentavos - custoProducaoTotalCentavos;
    return {
      custoMaterial: Math.round(custoMaterialTotalCentavos),
      custoEnergia: custoEnergiaCentavos,
      custoMaoDeObra: custoMaoDeObraCentavos,
      custoDepreciacao: custoDepreciacaoCentavos,
      custoPosProcesso: custoPosProcessoCentavos,
      custoInsumos: custoInsumosDinamicosCentavos + custoInsumosFixosCentavos,
      taxaMarketplace: taxaMktTotalCentavos,
      precoSugerido: precoSugeridoCentavos,
      lucroLiquido: lucroLiquidoCentavos,
      custoTotalOperacional: custoProducaoTotalCentavos,
      margemReal: precoSugeridoCentavos > 0 ? (lucroLiquidoCentavos / precoSugeridoCentavos) * 100 : 0,
      custoFalha: custoFalhaRealCentavos
    };
  }, [materiaisSelecionados, insumosSelecionados, tempo, potencia, precoKwh, margem, maoDeObra, depreciacaoHora, cobrarDesgaste, cobrarMaoDeObra, cobrarEnergia, cobrarInsumosFixos, cobrarLogistica, itensPosProcesso, insumosFixos, frete, taxaEcommerce, taxaFixa, quantidade, tempoSetup, materialPerdido, tempoPerdido, modoEntrada]);

  // Alertas de Estoque
  const alertasEstoque = useMemo(() => {
    return materiaisSelecionados.map(sel => {
      const real = materiais.find(m => m.id === sel.id);
      if (!real) return null;
      const totalDisponivel = (real.estoque * real.pesoGramas) + real.pesoRestanteGramas;
      if (sel.quantidade > totalDisponivel) return { materialId: sel.id, nome: sel.nome, falta: sel.quantidade - totalDisponivel, disponivel: totalDisponivel };
      return null;
    }).filter(a => a !== null);
  }, [materiaisSelecionados, materiais]);

  const alertasInsumos = useMemo(() => {
    return insumosSelecionados.map(sel => {
      const real = insumosEstoque.find((i: any) => i.id === sel.id);
      if (!real) return null;
      if (sel.quantidade > real.quantidadeAtual) return { insumoId: sel.id, nome: sel.nome, falta: sel.quantidade - real.quantidadeAtual, disponivel: real.quantidadeAtual };
      return null;
    }).filter(a => a !== null);
  }, [insumosSelecionados, insumosEstoque]);

  const estimativaPrazo = useMemo(() => {
    const minutosOcupados = pedidos.filter(p => p.status === StatusPedido.EM_PRODUCAO || p.status === StatusPedido.A_FAZER).reduce((acc, p) => acc + (p.tempoMinutos || 0), 0);
    const minutosTotais = minutosOcupados + tempo;
    const diasParaAdicionar = Math.ceil(minutosTotais / (8 * 60));
    const dataEstimada = new Date();
    dataEstimada.setDate(dataEstimada.getDate() + diasParaAdicionar);
    return { minutosOcupados, diasUteis: diasParaAdicionar, data: dataEstimada };
  }, [pedidos, tempo]);

  const dadosGraficoPizza = useMemo(() => [
    { name: 'Materiais', value: calculo.custoMaterial, fill: '#38bdf8' },
    { name: 'Energia', value: calculo.custoEnergia, fill: '#fbbf24' },
    { name: 'Trabalho', value: calculo.custoMaoDeObra, fill: '#10b981' },
    { name: 'Fixos', value: calculo.custoInsumos + calculo.custoPosProcesso + calculo.custoDepreciacao, fill: '#f43f5e' },
    { name: 'Lucro', value: Math.max(0, calculo.lucroLiquido), fill: '#34d399' }
  ].filter(d => d.value > 0), [calculo]);

  // Ações
  const salvarSnapshot = async (
    nome: string,
    nomeProjeto?: string,
    descricaoProjeto?: string,
    clienteProjetoId?: string
  ) => {
    const novaVersao: VersaoCalculo = { 
      id: crypto.randomUUID(), 
      data: new Date().toISOString(), 
      nome: nome || `Versão ${historico.length + 1}`, 
      calculo, 
      configuracoes: { 
        materiaisSelecionados, tempo, perfilAtivo, margem, potencia, precoKwh, maoDeObra, depreciacaoHora, 
        quantidade, tempoSetup, materialPerdido, tempoPerdido, frete, insumosFixos, 
        insumosSelecionados, itensPosProcesso, cobrarDesgaste, cobrarMaoDeObra, 
        cobrarEnergia, cobrarInsumosFixos, cobrarLogistica,
        taxaEcommerce, taxaFixa,
        nomeProjeto,
        descricaoProjeto,
        clienteProjetoId,
        impressoraSelecionadaId,
        modoEntrada,
        taxaFalha
      } 
    };
    
    // Atualiza a UI primeiro (Otimista)
    const novoHistorico = [novaVersao, ...historico];
    setHistorico(novoHistorico);

    try {
      await servicoBaseApi.post("/api/historico", {
        id: novaVersao.id,
        nome: novaVersao.nome,
        dados: {
          calculo: novaVersao.calculo,
          configuracoes: novaVersao.configuracoes
        }
      });
      toast.success("Snapshot salvo no banco de dados!");
    } catch (e) {
      console.error("Erro ao salvar snapshot", e);
      toast.error("Falha ao salvar no banco. Tente novamente.");
    }
  };

  const carregarSnapshot = (versao: VersaoCalculo) => {
    const c = versao.configuracoes;
    if (!c) return;
    
    if (c.materiaisSelecionados !== undefined) setMateriaisSelecionados(c.materiaisSelecionados || []);
    if (c.tempo !== undefined) setTempo(c.tempo || 0);
    if (c.perfilAtivo !== undefined) setPerfilAtivo(c.perfilAtivo || "");
    if (c.margem !== undefined) setMargem(c.margem !== undefined && c.margem !== null ? c.margem : 100);
    if (c.potencia !== undefined) setPotencia(c.potencia || 0);
    if (c.precoKwh !== undefined) setPrecoKwh(c.precoKwh || 0);
    if (c.maoDeObra !== undefined) setMaoDeObra(c.maoDeObra || 0);
    if (c.depreciacaoHora !== undefined) setDepreciacaoHora(c.depreciacaoHora || 0);
    if (c.quantidade !== undefined) setQuantidade(c.quantidade || 0);
    if (c.tempoSetup !== undefined) setTempoSetup(c.tempoSetup || 0);
    if (c.taxaFalha !== undefined) setTaxaFalha(c.taxaFalha || 0);
    if (c.materialPerdido !== undefined) setMaterialPerdido(c.materialPerdido || 0);
    if (c.tempoPerdido !== undefined) setTempoPerdido(c.tempoPerdido || 0);
    if (c.frete !== undefined) setFrete(c.frete || 0);
    if (c.insumosFixos !== undefined) setInsumosFixos(c.insumosFixos || 0);
    if (c.insumosSelecionados !== undefined) setInsumosSelecionados(c.insumosSelecionados || []);
    if (c.itensPosProcesso !== undefined) setItensPosProcesso(c.itensPosProcesso || []);
    
    if (c.cobrarDesgaste !== undefined) setCobrarDesgaste(!!c.cobrarDesgaste);
    if (c.cobrarMaoDeObra !== undefined) setCobrarMaoDeObra(!!c.cobrarMaoDeObra);
    if (c.cobrarEnergia !== undefined) setCobrarEnergia(!!c.cobrarEnergia);
    if (c.cobrarInsumosFixos !== undefined) setCobrarInsumosFixos(!!c.cobrarInsumosFixos);
    if (c.cobrarLogistica !== undefined) setCobrarLogistica(!!c.cobrarLogistica);

    if (c.taxaEcommerce !== undefined) setTaxaEcommerce(c.taxaEcommerce || 0);
    if (c.taxaFixa !== undefined) setTaxaFixa(c.taxaFixa || 0);
    if (c.modoEntrada !== undefined) setModoEntrada(c.modoEntrada || "simples");
    if (c.impressoraSelecionadaId !== undefined) setImpressoraSelecionadaId(c.impressoraSelecionadaId || "");

    toast.success(`Carregado: ${versao.nome}`);
  };

  const removerSnapshot = async (id: string) => {
    const novo = historico.filter(v => v.id !== id);
    setHistorico(novo);
    try {
      await servicoBaseApi.delete(`/api/historico?id=${id}`);
      toast.success("Snapshot removido!");
    } catch (e) {
      console.error("Erro ao remover snapshot", e);
      toast.error("Falha ao remover.");
    }
  };

  /**
   * Sanitiza uma string para evitar injeção de HTML/Script.
   */
  const sanitizar = (texto: string) => {
    return texto.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m] || m));
  };

  const gerarPdf = useCallback((nomeEstudio?: string, slogan?: string, nomeCliente?: string, nomeProjeto?: string, idPedido?: string) => {
    // Sanitização de segurança para prevenir XSS no document.write
    const sEstudio = sanitizar(nomeEstudio || 'Meu Estúdio 3D');
    const sSlogan = sanitizar(slogan || 'Impressões 3D de alta qualidade e precisão');
    const sCliente = sanitizar(nomeCliente || 'Consumidor Final');
    const sProjeto = sanitizar(nomeProjeto || 'Projeto Personalizado');
    const sPedido = sanitizar(idPedido || `PROP-${Math.floor(100000 + Math.random() * 900000)}`);

    const dataRef = new Date();
    const validade = new Date();
    validade.setDate(dataRef.getDate() + 7);

    const opcoesData: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
    const emissaoStr = dataRef.toLocaleDateString('pt-BR', opcoesData);
    const validadeStr = validade.toLocaleDateString('pt-BR', opcoesData);


    const horas = Math.floor(tempo / 60);
    const minutos = Math.round(tempo % 60);
    const tempoFormatado = horas > 0 
      ? `${horas}h ${minutos > 0 ? `${minutos}min` : ''}`
      : `${minutos}min`;

    const unitPrice = Math.round(calculo.precoSugerido / Math.max(1, quantidade));

    // Logo: nome da loja todo em negrito, com barra de acento lateral
    const logoHtml = `
      <div style="display:flex; align-items:stretch; gap:10px;">
        <div style="width:3px; background:#0f172a; border-radius:2px; flex-shrink:0;"></div>
        <div style="display:flex; flex-direction:column; gap:2px;">
          <span style="font-size:18px; font-weight:900; text-transform:uppercase; letter-spacing:-0.04em; color:#0f172a; line-height:1;">${sEstudio}</span>
          <span style="font-size:7px; font-weight:600; text-transform:uppercase; letter-spacing:0.16em; color:#64748b;">${sSlogan}</span>
        </div>
      </div>
    `;


    // Renderizar lista de materiais minimalistas
    const listaMateriaisHtml = materiaisSelecionados.length > 0 
      ? materiaisSelecionados.map(m => `
        <span class="spec-tag" style="background-color: #f8fafc;">
          <span class="spec-color-dot" style="background-color: ${m.cor || '#0ea5e9'};"></span>
          <strong>${sanitizar(m.nome)}</strong> 
          <span style="color: #64748b; margin-left: 2px;">${m.quantidade}${m.tipo === 'FDM' ? 'g' : 'ml'} (${m.tipoMaterial || m.tipo})</span>
        </span>
      `).join('')
      : '<span class="tech-empty">Material Padrão</span>';



    // Fator para distribuir o lucro proporcionalmente em cada item de custo
    // Isso faz os valores exibidos somarem ao preço final sem expor a margem
    const custoBase = calculo.custoTotalOperacional > 0 ? calculo.custoTotalOperacional : 1;
    const fatorProporcional = calculo.precoSugerido / custoBase;
    const proporcionar = (centavos: number) => ((centavos * fatorProporcional) / 100).toFixed(2).replace('.', ',');

    const layout = `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Proposta Técnica - ${sProjeto}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
            @page { size: A4; margin: 12mm 14mm; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Inter', sans-serif;
              color: #0f172a;
              background: #fff;
              font-size: 10px;
              line-height: 1.4;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            /* ── CABEÇALHO ── */
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding-bottom: 10px;
              margin-bottom: 10px;
              border-bottom: 1.5px solid #0f172a;
            }
            .meta-grid { display: flex; gap: 16px; text-align: right; }
            .meta-col { display: flex; flex-direction: column; gap: 1px; }
            .meta-label { font-size: 7px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; }
            .meta-val { font-size: 9.5px; font-weight: 700; color: #0f172a; }


            /* ── TÍTULO ABNT ── */
            .doc-title {
              text-align: center;
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              color: #0f172a;
              margin: 9px 0 9px;
              padding-bottom: 6px;
              border-bottom: 1px solid #e2e8f0;
            }

            /* ── SEÇÃO 1: PARTES ── */
            .partes-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 10px;
              padding-bottom: 10px;
              border-bottom: 1px dashed #e2e8f0;
            }
            .parte-label {
              font-size: 7px;
              font-weight: 700;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              margin-bottom: 3px;
            }
            .parte-nome { font-size: 13px; font-weight: 700; color: #0f172a; line-height: 1.1; }
            .parte-sub { font-size: 9px; font-weight: 500; color: #64748b; margin-top: 1px; }

            /* ── SECTION TITLE ── */
            .secao {
              font-size: 7.5px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              color: #0f172a;
              border-bottom: 1px solid #0f172a;
              padding-bottom: 3px;
              margin: 10px 0 6px;
            }

            /* ── TABELA UNIFICADA ── */
            table { width: 100%; border-collapse: collapse; }
            th {
              font-size: 7px;
              font-weight: 700;
              text-transform: uppercase;
              color: #94a3b8;
              letter-spacing: 0.06em;
              padding: 5px 4px 5px 0;
              border-bottom: 1px solid #e2e8f0;
              text-align: left;
            }
            th.r { text-align: right; }
            th.c { text-align: center; }
            td {
              font-size: 9.5px;
              color: #334155;
              padding: 5px 4px 5px 0;
              border-bottom: 1px solid #f1f5f9;
              vertical-align: middle;
            }
            td.r { text-align: right; }
            td.c { text-align: center; }
            .row-header td {
              background: #f8fafc;
              padding: 8px 4px;
              border-bottom: none;
            }
            .row-total td {
              font-weight: 700;
              font-size: 10px;
              color: #0f172a;
              padding: 6px 4px 6px 0;
              border-bottom: 2px solid #e2e8f0;
            }
            .row-sep td {
              padding: 8px 0 3px;
              border-bottom: none;
              font-size: 7px;
              font-weight: 800;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 0.1em;
            }
            .badge {
              display: inline-block;
              font-size: 7.5px;
              font-weight: 600;
              color: #475569;
              background: #e2e8f0;
              padding: 1px 7px;
              border-radius: 100px;
              margin-left: 6px;
            }
            .spec-tag {
              display: inline-block;
              font-size: 7.5px;
              font-weight: 500;
              background: #f1f5f9;
              color: #475569;
              padding: 1px 5px;
              border-radius: 3px;
              border: 1px solid #e2e8f0;
              margin: 1px 2px 1px 0;
            }
            .dot {
              display: inline-block;
              width: 6px; height: 6px;
              border-radius: 50%;
              border: 1px solid rgba(0,0,0,0.1);
              margin-right: 3px;
              vertical-align: middle;
            }

            /* ── TOTAIS ── */
            .totais-wrap {
              display: flex;
              justify-content: flex-end;
              margin-top: 8px;
              margin-bottom: 12px;
            }
            .totais-block { width: 260px; }
            .totais-row {
              display: flex;
              justify-content: space-between;
              font-size: 9.5px;
              color: #64748b;
              margin-bottom: 4px;
            }
            .totais-row .v { font-weight: 600; color: #0f172a; }
            .totais-div { height: 1px; background: #e2e8f0; margin: 6px 0; }
            .totais-final {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .totais-final-label { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; }
            .totais-final-sub { font-size: 7px; color: #94a3b8; margin-top: 1px; }
            .totais-final-val { font-size: 20px; font-weight: 800; line-height: 1; letter-spacing: -0.03em; }

            /* ── ASSINATURAS ── */
            .sig-wrap {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-top: 16px;
              padding-top: 16px;
              border-top: 1px dashed #e2e8f0;
            }
            .sig-box { display: flex; flex-direction: column; align-items: center; }
            .sig-line { width: 200px; height: 1px; background: #94a3b8; margin-bottom: 5px; }
            .sig-name { font-size: 9px; font-weight: 600; color: #0f172a; }
            .sig-role { font-size: 7px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }

            /* ── RODAPÉ ── */
            .footer {
              margin-top: 12px;
              padding-top: 8px;
              border-top: 1px solid #f1f5f9;
              font-size: 7px;
              color: #94a3b8;
              text-align: center;
              line-height: 1.5;
            }
          </style>
        </head>
        <body>
          <!-- CABEÇALHO -->
          <div class="header">
            ${logoHtml}
            <div class="meta-grid">
              <div class="meta-col">
                <span class="meta-label">Proposta nº</span>
                <span class="meta-val">${sPedido}</span>
              </div>
              <div class="meta-col">
                <span class="meta-label">Emissão</span>
                <span class="meta-val">${emissaoStr}</span>
              </div>
              <div class="meta-col">
                <span class="meta-label">Validade</span>
                <span class="meta-val">${validadeStr}</span>
              </div>
            </div>
          </div>

          <!-- TÍTULO -->
          <div class="doc-title">Proposta Técnica e Comercial — Manufatura Aditiva 3D</div>

          <!-- 1. PARTES -->
          <div class="secao">1. Identificação das Partes</div>
          <div class="partes-grid">
            <div>
              <div class="parte-label">Contratante (Cliente)</div>
              <div class="parte-nome">${sCliente}</div>
              <div class="parte-sub">Projeto: ${sProjeto}</div>
            </div>
            <div style="text-align: right;">
              <div class="parte-label">Contratada (Executante)</div>
              <div class="parte-nome" style="font-size: 11px;">${sEstudio}</div>
              <div class="parte-sub">Serviço de Manufatura Aditiva</div>
            </div>
          </div>

          <!-- 2. ESPECIFICAÇÕES + COMPOSIÇÃO DE CUSTOS -->
          <div class="secao">2. Especificações Técnicas &amp; Composição de Custos</div>
          <table>
            <thead>
              <tr>
                <th style="width:52%">Item / Componente</th>
                <th class="c" style="width:14%">Referência</th>
                <th class="r" style="width:17%">Valor Unit.</th>
                <th class="r" style="width:17%">Total</th>
              </tr>
            </thead>
            <tbody>
              <!-- Cabeçalho do serviço -->
              <tr class="row-header">
                <td colspan="4">
                  <span style="font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:0.05em;">Serviço de Manufatura Aditiva 3D</span>
                  <span class="badge">FDM / SLA Alta Resolução</span>
                  <span class="badge">Tempo: ${tempoFormatado}</span>
                  <div style="margin-top:5px; line-height:1.8;">
                    ${listaMateriaisHtml}
                    ${itensPosProcesso.map(p => `<span class="spec-tag">${sanitizar(p.nome)}</span>`).join('')}
                    ${insumosSelecionados.map(i => `<span class="spec-tag">${sanitizar(i.nome)} <strong>×${i.quantidade}</strong></span>`).join('')}
                  </div>
                </td>
              </tr>

              <!-- Valor total do serviço -->
              <tr class="row-total">
                <td>Serviço completo de manufatura aditiva</td>
                <td class="c">${quantidade}x</td>
                <td class="r">R$ ${(unitPrice/100).toFixed(2).replace('.', ',')}</td>
                <td class="r">R$ ${(calculo.precoSugerido/100).toFixed(2).replace('.', ',')}</td>
              </tr>

              <!-- Separador -->
              <tr class="row-sep">
                <td colspan="4">▸ Detalhamento da Composição de Custos (valores incluem encargos operacionais proporcionais)</td>
              </tr>

              <!-- Matéria-Prima -->
              <tr>
                <td>Matéria-Prima &amp; Materiais de Impressão</td>
                <td class="c" style="color:#94a3b8;">${materiaisSelecionados.map(m => `${m.quantidade}${m.tipo === 'FDM' ? 'g' : 'ml'}`).join(' + ') || '—'}</td>
                <td class="r" style="color:#94a3b8;">—</td>
                <td class="r" style="font-weight:600;">R$ ${proporcionar(calculo.custoMaterial)}</td>
              </tr>

              ${calculo.custoEnergia > 0 ? `
              <tr>
                <td>Energia Elétrica Operacional</td>
                <td class="c" style="color:#94a3b8;">${tempoFormatado}</td>
                <td class="r" style="color:#94a3b8;">—</td>
                <td class="r" style="font-weight:600;">R$ ${proporcionar(calculo.custoEnergia)}</td>
              </tr>` : ''}

              ${calculo.custoDepreciacao > 0 ? `
              <tr>
                <td>Depreciação de Equipamento &amp; Desgaste</td>
                <td class="c" style="color:#94a3b8;">${tempoFormatado}</td>
                <td class="r" style="color:#94a3b8;">—</td>
                <td class="r" style="font-weight:600;">R$ ${proporcionar(calculo.custoDepreciacao)}</td>
              </tr>` : ''}

              ${calculo.custoMaoDeObra > 0 ? `
              <tr>
                <td>Mão de Obra Técnica (Setup, Calibração &amp; Acompanhamento)</td>
                <td class="c" style="color:#94a3b8;">—</td>
                <td class="r" style="color:#94a3b8;">—</td>
                <td class="r" style="font-weight:600;">R$ ${proporcionar(calculo.custoMaoDeObra)}</td>
              </tr>` : ''}

              ${calculo.custoPosProcesso > 0 ? `
              <tr>
                <td>Acabamento &amp; Pós-Processamento Manual</td>
                <td class="c" style="color:#94a3b8;">${itensPosProcesso.length} etapa(s)</td>
                <td class="r" style="color:#94a3b8;">—</td>
                <td class="r" style="font-weight:600;">R$ ${proporcionar(calculo.custoPosProcesso)}</td>
              </tr>` : ''}

              ${calculo.custoInsumos > 0 ? `
              <tr>
                <td>Componentes &amp; Insumos Extras</td>
                <td class="c" style="color:#94a3b8;">${insumosSelecionados.length} item(s)</td>
                <td class="r" style="color:#94a3b8;">—</td>
                <td class="r" style="font-weight:600;">R$ ${proporcionar(calculo.custoInsumos)}</td>
              </tr>` : ''}

              ${calculo.custoFalha > 0 ? `
              <tr>
                <td>Encargo Operacional de Processo</td>
                <td class="c" style="color:#94a3b8;">—</td>
                <td class="r" style="color:#94a3b8;">—</td>
                <td class="r" style="font-weight:600;">R$ ${proporcionar(calculo.custoFalha)}</td>
              </tr>` : ''}

              ${calculo.taxaMarketplace > 0 ? `
              <tr>
                <td>Gestão Administrativa &amp; Canais de Distribuição</td>
                <td class="c" style="color:#94a3b8;">—</td>
                <td class="r" style="color:#94a3b8;">—</td>
                <td class="r" style="font-weight:600;">R$ ${proporcionar(calculo.taxaMarketplace)}</td>
              </tr>` : ''}
            </tbody>
          </table>

          <!-- 3. CONDIÇÕES COMERCIAIS -->
          <div class="secao">3. Condições Comerciais &amp; Investimento</div>
          <div class="totais-wrap">
            <div class="totais-block">
              <div class="totais-row">
                <span>Subtotal dos Serviços</span>
                <span class="v">R$ ${(calculo.precoSugerido/100).toFixed(2).replace('.', ',')}</span>
              </div>
              ${frete > 0 ? `
              <div class="totais-row">
                <span>Frete / Logística Externa</span>
                <span class="v">R$ ${(frete/100).toFixed(2).replace('.', ',')}</span>
              </div>` : ''}
              <div class="totais-div"></div>
              <div class="totais-final">
                <div>
                  <div class="totais-final-label">Investimento Total</div>
                  <div class="totais-final-sub">Pagamento: à vista ou Pix</div>
                </div>
                <div class="totais-final-val">R$ ${((calculo.precoSugerido + frete)/100).toFixed(2).replace('.', ',')}</div>
              </div>
            </div>
          </div>

          <!-- 4. ASSINATURAS -->
          <div class="secao">4. Termo de Aceite</div>
          <p style="font-size:8px; color:#475569; margin-bottom:14px; line-height:1.5;">
            As partes declaram estar de acordo com os termos, escopo e composição de custos desta proposta. O início da produção fica condicionado à confirmação formal do aceite.
          </p>
          <div class="sig-wrap">
            <div class="sig-box">
              <div class="sig-line"></div>
              <div class="sig-name">${sEstudio}</div>
              <div class="sig-role">Responsável Técnico / Emissor</div>
            </div>
            <div class="sig-box">
              <div class="sig-line"></div>
              <div class="sig-name">${sCliente}</div>
              <div class="sig-role">Contratante / Aceite Comercial</div>
            </div>
          </div>

          <!-- RODAPÉ -->
          <div class="footer">
            Documento elaborado automaticamente em conformidade com as diretrizes ABNT NBR para propostas técnicas e comerciais. &nbsp;•&nbsp; Gerado por <strong>PrintLog OS Pro</strong>
          </div>

          <script>window.onload = () => { window.print(); }</script>
        </body>
      </html>
    `;

    const win = window.open("", "_blank");
    win?.document.write(layout);
    win?.document.close();
  }, [calculo, materiaisSelecionados, tempo, quantidade, estimativaPrazo, itensPosProcesso, insumosSelecionados, frete, modoEntrada]);

  const limpar = useCallback((silencioso = false) => {
    setMateriaisSelecionados([]);
    setTempo(0);
    setQuantidade(0);
    setInsumosSelecionados([]);
    setItensPosProcesso([]);
    if (!silencioso) toast.success("Resetado!");
  }, []);

  const detectarTarifa = async () => {
    const resultado = await detectarTarifaKwhAutomatico();
    if (resultado) {
      setPrecoKwh(Math.round(resultado.tarifa * 100));
      return resultado;
    }
    return null;
  };

  useEffect(() => { if (precoKwh === 0) detectarTarifa(); }, []);

  const sugerirPrecoIA = useCallback(() => {
    const idToast = toast.loading("IA analisando custos e complexidade...", {
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 'bold'
      },
    });

    setTimeout(() => {
      // 1. Lógica de "Inteligência"
      let novaMargem = margem;
      const precoAtualCentavos = calculo.precoSugerido;
      
      // Regra A: Margem de Segurança (Mínimo 50% de margem real para projetos pequenos)
      if (precoAtualCentavos < 5000 && calculo.margemReal < 50) {
        novaMargem = Math.max(novaMargem, 20000); // Sobe para 200% de margem bruta
      }
      
      // Regra B: Prêmio de Complexidade (Se houver pós-processo, o valor percebido é maior)
      if (itensPosProcesso.length > 0) {
        novaMargem += 3000; // +30% de margem
      }

      // Regra C: Arredondamento Psicológico
      // (Isso é feito via ajuste de margem, mas aqui vamos apenas simular o ajuste estratégico)
      if (calculo.margemReal < 30) {
        novaMargem = Math.max(novaMargem, 12000); // Garante pelo menos 120%
      }

      setMargem(novaMargem);
      
      toast.success("Preço otimizado para máxima rentabilidade! ✨", { 
        id: idToast,
        duration: 3000
      });
    }, 1500);
  }, [calculo, margem, itensPosProcesso, setMargem]);

  return {
    materiaisSelecionados, setMateriaisSelecionados,
    quantidade, setQuantidade,
    tempoSetup, setTempoSetup,
    taxaFalha, setTaxaFalha,
    materialPerdido, setMaterialPerdido,
    tempoPerdido, setTempoPerdido,
    tempo, setTempo,
    modoEntrada, setModoEntrada,
    potencia, setPotencia,
    precoKwh, setPrecoKwh,
    maoDeObra, setMaoDeObra,
    depreciacaoHora, setDepreciacaoHora,
    cobrarDesgaste, setCobrarDesgaste,
    cobrarMaoDeObra, setCobrarMaoDeObra,
    cobrarEnergia, setCobrarEnergia,
    cobrarLogistica, setCobrarLogistica,
    margem, setMargem,
    frete, setFrete,
    insumosFixos, setInsumosFixos,
    cobrarInsumosFixos, setCobrarInsumosFixos,
    insumosSelecionados, setInsumosSelecionados,
    itensPosProcesso, setItensPosProcesso,
    perfilAtivo, setPerfilAtivo,
    taxaEcommerce, setTaxaEcommerce,
    taxaFixa, setTaxaFixa,
    perfisMarketplace, setPerfisMarketplace,
    impressoraSelecionadaId, setImpressoraSelecionadaId,
    historico,
    calculo,
    alertasEstoque,
    alertasInsumos,
    estimativaPrazo,
    dadosGraficoPizza,
    salvarSnapshot,
    carregarSnapshot,
    removerSnapshot,
    gerarPdf,
    limpar,
    detectarTarifa,
    sugerirPrecoIA
  };
}
