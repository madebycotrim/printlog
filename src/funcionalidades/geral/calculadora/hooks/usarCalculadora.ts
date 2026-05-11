import { useState, useMemo, useEffect, useCallback } from "react";
import { detectarTarifaKwhAutomatico } from "@/compartilhado/utilitarios/tarifas-energia";
import { usarArmazemConfiguracoes } from "@/funcionalidades/sistema/configuracoes/estado/armazemConfiguracoes";
import { usarArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { usarArmazemInsumos } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";
import { usarPedidos } from "@/funcionalidades/producao/projetos/hooks/usarPedidos";
import { usarGerenciadorImpressoras } from "@/funcionalidades/producao/impressoras/hooks/usarGerenciadorImpressoras";
import { toast } from "react-hot-toast";
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
  const [materiaisSelecionados, setMateriaisSelecionados] = useState<MaterialSelecionado[]>(() => {
    const salvo = localStorage.getItem("printlog_materiais_selecionados");
    return salvo ? JSON.parse(salvo) : [];
  });
  const [tempo, setTempo] = useState<number>(() => {
    const salvo = localStorage.getItem("printlog_calculadora_tempo") || localStorage.getItem("printlog_tempo");
    return salvo ? Number(salvo) : 0;
  });
  const [potencia, setPotencia] = useState<number>(() => Number(localStorage.getItem("printlog_potencia")) || 0);
  const [precoKwh, setPrecoKwh] = useState<number>(() => {
    const salvo = localStorage.getItem("printlog_preco_kwh");
    return (salvo !== null && salvo !== "0") ? Number(salvo) : config.custoEnergia;
  });
  const [maoDeObra, setMaoDeObra] = useState<number>(() => {
    const salvo = localStorage.getItem("printlog_mao_de_obra");
    return salvo !== null ? Number(salvo) : config.horaOperador;
  });
  const [depreciacaoHora, setDepreciacaoHora] = useState<number>(() => {
    const salvo = localStorage.getItem("printlog_depreciacao_hora");
    return salvo !== null ? Number(salvo) : config.horaMaquina;
  });
  const [margem, setMargem] = useState<number>(() => {
    const salvo = localStorage.getItem("printlog_margem");
    return salvo !== null ? Number(salvo) : config.margemLucro;
  });
  
  const [quantidade, setQuantidade] = useState<number>(() => Number(localStorage.getItem("printlog_quantidade")) || 0);
  const [modoEntrada, setModoEntrada] = useState<'unitario' | 'lote'>(() => {
    const salvo = localStorage.getItem("printlog_calculadora_modo_entrada");
    return (salvo as 'unitario' | 'lote') || "lote";
  });
  const [tempoSetup, setTempoSetup] = useState<number>(() => {
    const salvo = localStorage.getItem("printlog_tempo_setup");
    return salvo !== null ? Number(salvo) : 0;
  });
  const [taxaFalha, setTaxaFalha] = useState<number>(() => {
    const salvo = localStorage.getItem("printlog_taxa_falha");
    return salvo !== null ? Number(salvo) : 0;
  });
  const [materialPerdido, setMaterialPerdido] = useState<number>(() => Number(localStorage.getItem("printlog_material_perdido")) || 0);
  const [tempoPerdido, setTempoPerdido] = useState<number>(() => Number(localStorage.getItem("printlog_tempo_perdido")) || 0);
  
  const [frete, setFrete] = useState<number>(() => {
    const salvo = localStorage.getItem("printlog_frete");
    return salvo !== null ? Number(salvo) : 0;
  });
  const [insumosFixos, setInsumosFixos] = useState<number>(() => {
    const salvo = localStorage.getItem("printlog_insumos_fixos");
    return salvo !== null ? Number(salvo) : 0;
  });
  const [insumosSelecionados, setInsumosSelecionados] = useState<InsumoSelecionado[]>(() => {
    const salvo = localStorage.getItem("printlog_insumos_selecionados");
    return salvo ? JSON.parse(salvo) : [];
  });
  const [itensPosProcesso, setItensPosProcesso] = useState<ItemPosProcesso[]>(() => {
    const salvo = localStorage.getItem("printlog_itens_pos_processo");
    return salvo ? JSON.parse(salvo) : [];
  });
  
  const [cobrarDesgaste, setCobrarDesgaste] = useState<boolean>(() => localStorage.getItem("printlog_cobrar_desgaste") !== "false");
  const [cobrarMaoDeObra, setCobrarMaoDeObra] = useState<boolean>(() => localStorage.getItem("printlog_cobrar_mao_de_obra") !== "false");
  const [cobrarEnergia, setCobrarEnergia] = useState<boolean>(() => localStorage.getItem("printlog_cobrar_energia") !== "false");
  const [cobrarInsumosFixos, setCobrarInsumosFixos] = useState<boolean>(() => localStorage.getItem("printlog_cobrar_insumos_fixos") !== "false");
  const [cobrarLogistica, setCobrarLogistica] = useState<boolean>(() => localStorage.getItem("printlog_cobrar_logistica") !== "false");
  const [perfilAtivo, setPerfilAtivo] = useState(() => localStorage.getItem("printlog_perfil_ativo") || "Direto");
  const [taxaEcommerce, setTaxaEcommerce] = useState<number>(0);
  const [taxaFixa, setTaxaFixa] = useState<number>(0);



  // Efeitos de persistência
  useEffect(() => { localStorage.setItem("printlog_cobrar_desgaste", String(cobrarDesgaste)); }, [cobrarDesgaste]);
  useEffect(() => { localStorage.setItem("printlog_cobrar_mao_de_obra", String(cobrarMaoDeObra)); }, [cobrarMaoDeObra]);
  useEffect(() => { localStorage.setItem("printlog_cobrar_energia", String(cobrarEnergia)); }, [cobrarEnergia]);
  useEffect(() => { localStorage.setItem("printlog_cobrar_insumos_fixos", String(cobrarInsumosFixos)); }, [cobrarInsumosFixos]);
  useEffect(() => { localStorage.setItem("printlog_cobrar_logistica", String(cobrarLogistica)); }, [cobrarLogistica]);
  useEffect(() => { localStorage.setItem("printlog_perfil_ativo", perfilAtivo); }, [perfilAtivo]);
  useEffect(() => { localStorage.setItem("printlog_materiais_selecionados", JSON.stringify(materiaisSelecionados)); }, [materiaisSelecionados]);
  useEffect(() => { localStorage.setItem("printlog_calculadora_tempo", String(tempo)); }, [tempo]);
  useEffect(() => { localStorage.setItem("printlog_calculadora_modo_entrada", modoEntrada); }, [modoEntrada]);
  useEffect(() => { localStorage.setItem("printlog_potencia", String(potencia)); }, [potencia]);
  useEffect(() => { localStorage.setItem("printlog_preco_kwh", String(precoKwh)); }, [precoKwh]);
  useEffect(() => { localStorage.setItem("printlog_mao_de_obra", String(maoDeObra)); }, [maoDeObra]);
  useEffect(() => { localStorage.setItem("printlog_depreciacao_hora", String(depreciacaoHora)); }, [depreciacaoHora]);
  useEffect(() => { localStorage.setItem("printlog_margem", String(margem)); }, [margem]);
  useEffect(() => { localStorage.setItem("printlog_quantidade", String(quantidade)); }, [quantidade]);
  useEffect(() => { localStorage.setItem("printlog_tempo_setup", String(tempoSetup)); }, [tempoSetup]);
  useEffect(() => { localStorage.setItem("printlog_taxa_falha", String(taxaFalha)); }, [taxaFalha]);
  useEffect(() => { localStorage.setItem("printlog_material_perdido", String(materialPerdido)); }, [materialPerdido]);
  useEffect(() => { localStorage.setItem("printlog_tempo_perdido", String(tempoPerdido)); }, [tempoPerdido]);
  useEffect(() => { localStorage.setItem("printlog_frete", String(frete)); }, [frete]);
  useEffect(() => { localStorage.setItem("printlog_insumos_fixos", String(insumosFixos)); }, [insumosFixos]);
  useEffect(() => { localStorage.setItem("printlog_insumos_selecionados", JSON.stringify(insumosSelecionados)); }, [insumosSelecionados]);
  useEffect(() => { localStorage.setItem("printlog_itens_pos_processo", JSON.stringify(itensPosProcesso)); }, [itensPosProcesso]);

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
    const salvo = localStorage.getItem("printlog_perfis_marketplace");
    if (salvo) {
      try {
        const parsed = JSON.parse(salvo);
        return parsed.map((p: any) => ({
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

  const [historico, setHistorico] = useState<VersaoCalculo[]>(() => {
    const salvo = localStorage.getItem("printlog_historico_calculadora");
    return salvo ? JSON.parse(salvo) : [];
  });

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
    localStorage.setItem("printlog_historico_calculadora", JSON.stringify(novoHistorico));
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
    localStorage.setItem("printlog_historico_calculadora", JSON.stringify(novo));
  };

  const gerarPdf = useCallback((nomeEstudio?: string, slogan?: string, nomeCliente?: string, nomeProjeto?: string, idPedido?: string) => {
    // Lógica simplificada de PDF para manter integridade
    const layout = `
      <html>
        <body style="font-family: sans-serif; padding: 40px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="margin: 0;">${nomeEstudio || 'Orcamento'}</h1>
            <p style="margin: 5px 0; color: #666;">${slogan || ''}</p>
          </div>
          <hr />
          <h2>Projeto: ${nomeProjeto}</h2>
          <p><strong>Cliente:</strong> ${nomeCliente}</p>
          <p><strong>ID do Pedido:</strong> ${idPedido || 'N/A'}</p>
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
