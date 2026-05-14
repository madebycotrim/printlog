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

  const [historico, setHistorico] = useState<VersaoCalculo[]>(() => 
    armazenamentoSeguro.obter("printlog_historico_calculadora", [])
  );

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
  const salvarSnapshot = (nome: string) => {
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
        taxaEcommerce, taxaFixa // Adicionados aqui
      } 
    };
    const novoHistorico = [novaVersao, ...historico];
    setHistorico(novoHistorico);
    armazenamentoSeguro.definir("printlog_historico_calculadora", novoHistorico);
    toast.success("Snapshot salvo!");
  };

  const carregarSnapshot = (versao: VersaoCalculo) => {
    const c = versao.configuracoes;
    if (!c) return;
    setMateriaisSelecionados(c.materiaisSelecionados || []);
    setTempo(c.tempo || 0);
    setPrecoKwh(c.precoKwh || 0);
    setQuantidade(c.quantidade || 1);
    toast.success(`Carregado: ${versao.nome}`);
  };

  const removerSnapshot = (id: string) => {
    const novo = historico.filter(v => v.id !== id);
    setHistorico(novo);
    armazenamentoSeguro.definir("printlog_historico_calculadora", novo);
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
    const sEstudio = sanitizar(nomeEstudio || 'Orcamento');
    const sSlogan = sanitizar(slogan || '');
    const sCliente = sanitizar(nomeCliente || 'Cliente');
    const sProjeto = sanitizar(nomeProjeto || 'Projeto');
    const sPedido = sanitizar(idPedido || 'N/A');

    const layout = `
      <html>
        <body style="font-family: sans-serif; padding: 40px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="margin: 0;">${sEstudio}</h1>
            <p style="margin: 5px 0; color: #666;">${sSlogan}</p>
          </div>
          <hr />
          <h2>Projeto: ${sProjeto}</h2>
          <p><strong>Cliente:</strong> ${sCliente}</p>
          <p><strong>ID do Pedido:</strong> ${sPedido}</p>
          <div style="margin-top: 40px; font-size: 24px; font-weight: bold;">
            Total: R$ ${(calculo.precoSugerido/100).toFixed(2)}
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    const win = window.open("", "_blank");
    win?.document.write(layout);
    win?.document.close();
  }, [calculo]);

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
