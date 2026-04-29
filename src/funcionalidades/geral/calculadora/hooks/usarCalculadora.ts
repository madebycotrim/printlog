import { useState, useMemo, useEffect, useCallback } from "react";
import { usarArmazemConfiguracoes } from "@/funcionalidades/sistema/configuracoes/estado/armazemConfiguracoes";
import { usarArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { usarArmazemInsumos } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";
import { usarPedidos } from "@/funcionalidades/producao/projetos/hooks/usarPedidos";
import { extrairValorNumerico } from "@/compartilhado/utilitarios/formatadores";
import { toast } from "react-hot-toast";
import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { 
  MaterialSelecionado, 
  ItemPosProcesso, 
  InsumoSelecionado, 
  PerfilMarketplace, 
  PerfilFiscal,
  VersaoCalculo,
  CalculoResultado 
} from "../tipos";

export function usarCalculadora() {
  const config = usarArmazemConfiguracoes();
  const { materiais } = usarArmazemMateriais();
  const { insumos: insumosEstoque } = usarArmazemInsumos();
  const { pedidos } = usarPedidos();

  // --- ESTADOS BASE ---
  const [materiaisSelecionados, setMateriaisSelecionados] = useState<MaterialSelecionado[]>(() => {
    const salvo = localStorage.getItem("printlog_materiais_selecionados");
    return salvo ? JSON.parse(salvo) : [];
  });
  const [tempo, setTempo] = useState<number>(() => Number(localStorage.getItem("printlog_tempo")) || 0);
  const [potencia, setPotencia] = useState<number>(() => Number(localStorage.getItem("printlog_potencia")) || 0);
  const [precoKwh, setPrecoKwh] = useState<number>(() => {
    const salvo = localStorage.getItem("printlog_preco_kwh");
    return salvo !== null ? Number(salvo) : extrairValorNumerico(config.custoEnergia);
  });
  const [maoDeObra, setMaoDeObra] = useState<number>(() => {
    const salvo = localStorage.getItem("printlog_mao_de_obra");
    return salvo !== null ? Number(salvo) : extrairValorNumerico(config.horaOperador);
  });
  const [depreciacaoHora, setDepreciacaoHora] = useState<number>(() => {
    const salvo = localStorage.getItem("printlog_depreciacao_hora");
    return salvo !== null ? Number(salvo) : extrairValorNumerico(config.horaMaquina);
  });
  const [margem, setMargem] = useState<number>(() => {
    const salvo = localStorage.getItem("printlog_margem");
    return salvo !== null ? Number(salvo) : extrairValorNumerico(config.margemLucro);
  });
  
  // Novas variáveis de Lote e Setup
  const [quantidade, setQuantidade] = useState<number>(() => Number(localStorage.getItem("printlog_quantidade")) || 1);
  const [tempoSetup, setTempoSetup] = useState<number>(() => {
    const salvo = localStorage.getItem("printlog_tempo_setup");
    return salvo !== null ? Number(salvo) : 15;
  });
  const [taxaFalha, setTaxaFalha] = useState<number>(() => {
    const salvo = localStorage.getItem("printlog_taxa_falha");
    return salvo !== null ? Number(salvo) : 10;
  });
  const [materialPerdido, setMaterialPerdido] = useState<number>(() => Number(localStorage.getItem("printlog_material_perdido")) || 0);
  const [tempoPerdido, setTempoPerdido] = useState<number>(() => Number(localStorage.getItem("printlog_tempo_perdido")) || 0);
  
  const [frete, setFrete] = useState<number>(() => Number(localStorage.getItem("printlog_frete")) || 0);
  const [insumosFixos, setInsumosFixos] = useState<number>(() => Number(localStorage.getItem("printlog_insumos_fixos")) || 0);
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
  const [cobrarImpostos, setCobrarImpostos] = useState<boolean>(() => localStorage.getItem("printlog_cobrar_impostos") !== "false");
  const [perfilAtivo, setPerfilAtivo] = useState(() => localStorage.getItem("printlog_perfil_ativo") || "Direto");
  const [taxaEcommerce, setTaxaEcommerce] = useState<number>(0);
  const [taxaFixa, setTaxaFixa] = useState<number>(0);

  // --- ESTADOS FISCAIS ---
  const [tipoOperacao, setTipoOperacao] = useState(() => localStorage.getItem("printlog_tipo_operacao") || "mei"); 
  const [impostos, setImpostos] = useState(0);
  const [icms, setIcms] = useState(0); 
  const [iss, setIss] = useState(0);

  // Efeitos para persistir preconfigurações no LocalStorage
  useEffect(() => { localStorage.setItem("printlog_cobrar_desgaste", String(cobrarDesgaste)); }, [cobrarDesgaste]);
  useEffect(() => { localStorage.setItem("printlog_cobrar_mao_de_obra", String(cobrarMaoDeObra)); }, [cobrarMaoDeObra]);
  useEffect(() => { localStorage.setItem("printlog_cobrar_energia", String(cobrarEnergia)); }, [cobrarEnergia]);
  useEffect(() => { localStorage.setItem("printlog_cobrar_impostos", String(cobrarImpostos)); }, [cobrarImpostos]);
  useEffect(() => { localStorage.setItem("printlog_perfil_ativo", perfilAtivo); }, [perfilAtivo]);
  useEffect(() => { localStorage.setItem("printlog_tipo_operacao", tipoOperacao); }, [tipoOperacao]);

  useEffect(() => { localStorage.setItem("printlog_materiais_selecionados", JSON.stringify(materiaisSelecionados)); }, [materiaisSelecionados]);
  useEffect(() => { localStorage.setItem("printlog_tempo", String(tempo)); }, [tempo]);
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

  /**
   * Perfis fiscais padrão simplificados para o público alvo.
   */
  const [perfisFiscais, setPerfisFiscais] = useState<PerfilFiscal[]>(() => {
    const salvo = localStorage.getItem("printlog_perfis_fiscais");
    let listaPadrao = [
      { nome: "MEI", base: 0, icms: 0, iss: 0 },
      { nome: "CPF", base: 10, icms: 0, iss: 0 },
      { nome: "Produto", base: 0, icms: 4, iss: 0 },
      { nome: "Servico", base: 0, icms: 0, iss: 5 },
    ];

    if (salvo) {
      try {
        let salvos = JSON.parse(salvo);
        
        // Garante que o perfil CPF exista na lista salva
        if (!salvos.some((p: PerfilFiscal) => p.nome.toLowerCase() === "cpf")) {
          salvos = [{ nome: "CPF", base: 10, icms: 0, iss: 0 }, ...salvos];
        }

        // Remove Industrialização se existir e migra os valores antigos
        return salvos
          .filter((p: PerfilFiscal) => p.nome.toLowerCase() !== "industrializacao")
          .map((p: PerfilFiscal) => {
            if (p.nome === "Produto" && p.icms === 18) return { ...p, icms: 4 };
            return p;
          });
      } catch (erro) {
        console.error("[usarCalculadora] Erro ao carregar perfis fiscais salvos:", erro);
        return listaPadrao;
      }
    }
    return listaPadrao;
  });

  // Sincroniza os impostos sempre que o tipo de operação mudar ou perfis forem atualizados
  useEffect(() => {
    const perfilAtual = perfisFiscais.find(p => p.nome.toLowerCase() === tipoOperacao.toLowerCase());
    if (perfilAtual) {
      setImpostos(perfilAtual.base);
      setIcms(perfilAtual.icms);
      setIss(perfilAtual.iss);
    }
  }, [tipoOperacao, perfisFiscais]);

  // Salvar perfis fiscais no localStorage sempre que mudarem
  useEffect(() => {
    localStorage.setItem("printlog_perfis_fiscais", JSON.stringify(perfisFiscais));
  }, [perfisFiscais]);

  const [impressoraSelecionadaId, setImpressoraSelecionadaId] = useState<string>(() => {
    return localStorage.getItem("printlog_ultima_impressora") || "";
  });

  const [perfisMarketplace, setPerfisMarketplace] = useState<PerfilMarketplace[]>(() => {
    const salvo = localStorage.getItem("printlog_perfis_marketplace");
    if (salvo) return JSON.parse(salvo);
    return [
      { nome: "Direto", taxa: 0, fixa: 0, frete: 0, ins: 0, imp: 6 },
      { nome: "M. Livre", taxa: 18, fixa: 6, frete: 0, ins: 2, imp: 6 },
      { nome: "Shopee", taxa: 20, fixa: 3, frete: 0, ins: 1.5, imp: 6 },
      { nome: "Site", taxa: 5, fixa: 0, frete: 0, ins: 5, imp: 6 },
    ];
  });

  // Salvar perfis de marketplace no localStorage sempre que mudarem
  useEffect(() => {
    localStorage.setItem("printlog_perfis_marketplace", JSON.stringify(perfisMarketplace));
  }, [perfisMarketplace]);

  useEffect(() => {
    const perfil = perfisMarketplace.find(p => p.nome === perfilAtivo);
    if (perfil) {
      setTaxaEcommerce(perfil.taxa);
      setTaxaFixa(perfil.fixa);
    } else {
      setTaxaEcommerce(0);
      setTaxaFixa(0);
    }
  }, [perfilAtivo, perfisMarketplace]);

  // --- FEATURE 2: HISTÓRICO/VERSIONAMENTO ---
  const [historico, setHistorico] = useState<VersaoCalculo[]>(() => {
    const salvo = localStorage.getItem("printlog_historico_calculadora");
    return salvo ? JSON.parse(salvo) : [];
  });

  // --- SINCRONIZAÇÃO CONFIGS ---
  useEffect(() => {
    if (!config.carregando) {
      setPrecoKwh(extrairValorNumerico(config.custoEnergia));
      setMaoDeObra(extrairValorNumerico(config.horaOperador));
      setDepreciacaoHora(extrairValorNumerico(config.horaMaquina));
      setMargem(extrairValorNumerico(config.margemLucro));
    }
  }, [config.custoEnergia, config.horaOperador, config.horaMaquina, config.margemLucro, config.carregando]);

  // --- LÓGICA DE CÁLCULO (Sólida) ---
  const calculo = useMemo((): CalculoResultado => {
    const multiplicadorMaterialEMaquina = quantidade;

    const custoMaterialTotalCentavos = materiaisSelecionados.reduce((acc, m) => acc + (m.quantidade / 1000) * m.precoKgCentavos, 0) * multiplicadorMaterialEMaquina;
    const custoInsumosDinamicosCentavos = insumosSelecionados.reduce((acc, i) => acc + (i.quantidade * i.custoCentavos), 0) * quantidade;
    
    // Tempo de Máquina
    const horasDecimaisMaquina = (tempo / 60) * multiplicadorMaterialEMaquina;
    const custoEnergiaCentavos = cobrarEnergia ? Math.round((potencia / 1000) * horasDecimaisMaquina * precoKwh * 100) : 0;
    const custoDepreciacaoCentavos = cobrarDesgaste ? Math.round(horasDecimaisMaquina * depreciacaoHora * 100) : 0;

    // Cálculo das Perdas Reais (Registro Real Pós-Impressão)
    const custoFilamentoPerdidoCentavos = materiaisSelecionados.reduce((acc, m) => acc + (materialPerdido / 1000) * m.precoKgCentavos, 0);
    const custoTempoPerdidoCentavos = ((tempoPerdido / 60) * depreciacaoHora * 100) + (cobrarEnergia ? Math.round((potencia / 1000) * (tempoPerdido / 60) * precoKwh * 100) : 0);
    const custoFalhaRealCentavos = Math.round(custoFilamentoPerdidoCentavos + custoTempoPerdidoCentavos);

    // Tempo de Operador (Tempo Fixo de Setup por lote)
    const horasDecimaisSetup = tempoSetup / 60;
    const custoMaoDeObraCentavos = cobrarMaoDeObra ? Math.round(horasDecimaisSetup * maoDeObra * 100) : 0;

    const custoPosProcessoCentavos = itensPosProcesso.reduce((t, i) => t + (i.valor * 100), 0) * quantidade;
    const custoInsumosFixosCentavos = Math.round(insumosFixos * 100);
    const custoFreteCentavos = Math.round(frete * 100);

    const custoProducaoTotalCentavos = 
      custoMaterialTotalCentavos + 
      custoEnergiaCentavos + 
      custoMaoDeObraCentavos + 
      custoDepreciacaoCentavos + 
      custoPosProcessoCentavos + 
      custoInsumosDinamicosCentavos + 
      custoInsumosFixosCentavos +
      custoFalhaRealCentavos;

    const margemPercentual = margem / 100;
    const taxaMktPercentual = taxaEcommerce / 100;
    const taxaFixaVendaCentavos = Math.round(taxaFixa * 100);
    const impostoPercentual = cobrarImpostos ? (impostos + icms + iss) / 100 : 0;

    const lucroDesejadoCentavos = Math.round(custoProducaoTotalCentavos * margemPercentual);
    const precoBaseVendaCentavos = custoProducaoTotalCentavos + lucroDesejadoCentavos + custoFreteCentavos + taxaFixaVendaCentavos;
    const denominadorTaxas = 1 - taxaMktPercentual - impostoPercentual;

    const precoSugeridoCentavos = denominadorTaxas > 0.05 
      ? Math.round(precoBaseVendaCentavos / denominadorTaxas)
      : Math.round(precoBaseVendaCentavos * 1.5);

    const taxaMktTotalCentavos = Math.round(precoSugeridoCentavos * taxaMktPercentual + taxaFixaVendaCentavos);
    const impostoTotalCentavos = cobrarImpostos ? Math.round(precoSugeridoCentavos * impostoPercentual) : 0;
    
    const custoTotalVariavelCentavos = custoProducaoTotalCentavos - custoMaoDeObraCentavos;
    const lucroLiquidoCentavos = precoSugeridoCentavos - taxaMktTotalCentavos - impostoTotalCentavos - custoFreteCentavos - custoTotalVariavelCentavos - custoMaoDeObraCentavos;

    const margemRealSobreVenda = precoSugeridoCentavos > 0 ? (lucroLiquidoCentavos / precoSugeridoCentavos) * 100 : 0;

    return {
      custoMaterial: Math.round(custoMaterialTotalCentavos),
      custoEnergia: custoEnergiaCentavos,
      custoMaoDeObra: custoMaoDeObraCentavos,
      custoDepreciacao: custoDepreciacaoCentavos,
      custoPosProcesso: custoPosProcessoCentavos,
      custoInsumos: custoInsumosDinamicosCentavos + custoInsumosFixosCentavos,
      taxaMarketplace: taxaMktTotalCentavos,
      impostoVenda: impostoTotalCentavos,
      precoSugerido: precoSugeridoCentavos,
      lucroLiquido: lucroLiquidoCentavos,
      custoTotalOperacional: custoProducaoTotalCentavos,
      margemReal: margemRealSobreVenda,
      custoFalha: custoFalhaRealCentavos
    };
  }, [materiaisSelecionados, insumosSelecionados, tempo, potencia, precoKwh, margem, maoDeObra, depreciacaoHora, cobrarDesgaste, cobrarMaoDeObra, cobrarEnergia, cobrarImpostos, itensPosProcesso, insumosFixos, frete, perfilAtivo, perfisMarketplace, impostos, icms, iss, quantidade, tempoSetup, taxaFalha, materialPerdido, tempoPerdido, taxaEcommerce, taxaFixa]);

  // --- FEATURE 3: ALERTA DE ESTOQUE ---
  const alertasEstoque = useMemo(() => {
    return materiaisSelecionados.map(sel => {
      const real = materiais.find(m => m.id === sel.id);
      if (!real) return null;
      const totalDisponivel = (real.estoque * real.pesoGramas) + real.pesoRestanteGramas;
      if (sel.quantidade > totalDisponivel) {
        return {
          materialId: sel.id,
          nome: sel.nome,
          falta: sel.quantidade - totalDisponivel,
          disponivel: totalDisponivel
        };
      }
      return null;
    }).filter(a => a !== null);
  }, [materiaisSelecionados, materiais]);

  const alertasInsumos = useMemo(() => {
    return insumosSelecionados.map(sel => {
      const real = insumosEstoque.find((i: any) => i.id === sel.id);
      if (!real) return null;
      if (sel.quantidade > real.quantidadeAtual) {
        return {
          insumoId: sel.id,
          nome: sel.nome,
          falta: sel.quantidade - real.quantidadeAtual,
          disponivel: real.quantidadeAtual
        };
      }
      return null;
    }).filter(a => a !== null);
  }, [insumosSelecionados, insumosEstoque]);

  // --- FEATURE 4: ESTIMATIVA DE PRAZO ---
  const estimativaPrazo = useMemo(() => {
    // Projetos em andamento ou aguardando
    const minutosOcupados = pedidos
      .filter(p => p.status === StatusPedido.EM_PRODUCAO || p.status === StatusPedido.A_FAZER)
      .reduce((acc, p) => acc + (p.tempoMinutos || 0), 0);
    
    const minutosTotais = minutosOcupados + tempo;
    const diasParaAdicionar = Math.ceil(minutosTotais / (8 * 60)); // 8h de trabalho por dia
    
    const dataEstimada = new Date();
    dataEstimada.setDate(dataEstimada.getDate() + diasParaAdicionar);
    
    return {
      minutosOcupados,
      diasUteis: diasParaAdicionar,
      data: dataEstimada
    };
  }, [pedidos, tempo]);

  // --- FEATURE 2: LÓGICA DE HISTÓRICO ---
  const salvarSnapshot = (nome: string) => {
    const novaVersao: VersaoCalculo = {
      id: crypto.randomUUID(),
      data: new Date().toISOString(),
      nome: nome || `Versão ${historico.length + 1}`,
      calculo,
      configuracoes: {
        materiaisSelecionados,
        tempo,
        perfilAtivo,
        margem,
        potencia,
        precoKwh,
        maoDeObra,
        depreciacaoHora,
        quantidade,
        tempoSetup,
        taxaFalha,
        materialPerdido,
        tempoPerdido,
        frete,
        insumosFixos,
        insumosSelecionados,
        itensPosProcesso,
        cobrarDesgaste,
        cobrarMaoDeObra,
        cobrarEnergia,
        cobrarImpostos,
        tipoOperacao,
        impostos,
        icms,
        iss
      }
    };
    const novoHistorico = [novaVersao, ...historico];
    setHistorico(novoHistorico);
    localStorage.setItem("printlog_historico_calculadora", JSON.stringify(novoHistorico));
    toast.success("Snapshot salvo no histórico!");
  };

  const carregarSnapshot = (versao: VersaoCalculo) => {
    const c = versao.configuracoes;
    if (!c) {
      toast.error("Configurações do snapshot corrompidas.");
      return;
    }
    if (c.materiaisSelecionados !== undefined) setMateriaisSelecionados(c.materiaisSelecionados);
    if (c.tempo !== undefined) setTempo(c.tempo);
    if (c.perfilAtivo !== undefined) setPerfilAtivo(c.perfilAtivo);
    if (c.margem !== undefined) setMargem(c.margem);
    
    if (c.potencia !== undefined) setPotencia(c.potencia);
    if (c.precoKwh !== undefined) setPrecoKwh(c.precoKwh);
    if (c.maoDeObra !== undefined) setMaoDeObra(c.maoDeObra);
    if (c.depreciacaoHora !== undefined) setDepreciacaoHora(c.depreciacaoHora);
    if (c.quantidade !== undefined) setQuantidade(c.quantidade);
    if (c.tempoSetup !== undefined) setTempoSetup(c.tempoSetup);
    if (c.taxaFalha !== undefined) setTaxaFalha(c.taxaFalha);
    if (c.materialPerdido !== undefined) setMaterialPerdido(c.materialPerdido);
    if (c.tempoPerdido !== undefined) setTempoPerdido(c.tempoPerdido);
    if (c.frete !== undefined) setFrete(c.frete);
    if (c.insumosFixos !== undefined) setInsumosFixos(c.insumosFixos);
    if (c.insumosSelecionados !== undefined) setInsumosSelecionados(c.insumosSelecionados);
    if (c.itensPosProcesso !== undefined) setItensPosProcesso(c.itensPosProcesso);
    if (c.cobrarDesgaste !== undefined) setCobrarDesgaste(c.cobrarDesgaste);
    if (c.cobrarMaoDeObra !== undefined) setCobrarMaoDeObra(c.cobrarMaoDeObra);
    if (c.cobrarEnergia !== undefined) setCobrarEnergia(c.cobrarEnergia);
    if (c.cobrarImpostos !== undefined) setCobrarImpostos(c.cobrarImpostos);
    if (c.tipoOperacao !== undefined) setTipoOperacao(c.tipoOperacao);
    if (c.impostos !== undefined) setImpostos(c.impostos);
    if (c.icms !== undefined) setIcms(c.icms);
    if (c.iss !== undefined) setIss(c.iss);

    toast.success(`Carregado: ${versao.nome}`);
  };

  const removerSnapshot = (id: string) => {
    const novo = historico.filter(v => v.id !== id);
    setHistorico(novo);
    localStorage.setItem("printlog_historico_calculadora", JSON.stringify(novo));
  };

  // --- FEATURE 5: DADOS PARA GRÁFICOS ---
  const dadosGraficoPizza = useMemo(() => [
    { name: 'Materiais', value: calculo.custoMaterial, fill: '#38bdf8' },
    { name: 'Energia', value: calculo.custoEnergia, fill: '#fbbf24' },
    { name: 'Trabalho', value: calculo.custoMaoDeObra, fill: '#10b981' },
    { name: 'Custos Fixos', value: calculo.custoInsumos + calculo.custoPosProcesso + calculo.custoDepreciacao, fill: '#f43f5e' },
    { name: 'Impostos/Taxas', value: calculo.taxaMarketplace + calculo.impostoVenda, fill: '#94a3b8' },
    { name: 'Lucro Líquido', value: Math.max(0, calculo.lucroLiquido), fill: '#34d399' }
  ].filter(d => d.value > 0), [calculo]);

  // --- FEATURE 1: EXPORTAÇÃO PDF ---
  const gerarPdf = useCallback((nomeEstudioCustom?: string, sloganCustom?: string, nomeCliente?: string) => {
    const dataRef = new Date();
    const validade = new Date();
    validade.setDate(dataRef.getDate() + 7);

    const layout = `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Orçamento Formal - ${dataRef.toLocaleDateString('pt-BR')}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
            @page {
              size: A4;
              margin: 30mm 20mm 30mm 30mm;
            }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Inter', sans-serif; 
              color: #111827; 
              background-color: #ffffff;
              line-height: 1.6;
              padding: 20px;
            }

            .container {
              max-width: 800px;
              margin: 0 auto;
            }

            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-start; 
              border-bottom: 2px solid #111827; 
              padding-bottom: 24px;
              margin-bottom: 40px;
            }
            
            .logo { 
              font-size: 24px; 
              font-weight: 900; 
              color: #111827; 
              text-transform: uppercase;
              letter-spacing: -1px;
            }
            
            .slogan {
              font-size: 12px;
              color: #4b5563;
              font-weight: 500;
              margin-top: 4px;
            }

            .meta-dados { 
              text-align: right; 
              font-size: 12px;
              color: #374151;
            }
            .meta-dados strong { color: #111827; }

            .secao-titulo { 
              font-size: 12px; 
              font-weight: 900; 
              text-transform: uppercase; 
              color: #111827; 
              letter-spacing: 1px; 
              margin-top: 30px;
              margin-bottom: 15px;
              border-bottom: 1px solid #111827;
              padding-bottom: 5px;
            }

            /* TABELAS NORMAS ABNT */
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 30px; 
              border-top: 2px solid #111827;
              border-bottom: 2px solid #111827;
            }
            th { 
              text-align: left; 
              padding: 10px 8px; 
              border-bottom: 1px solid #111827; 
              font-size: 11px; 
              text-transform: uppercase; 
              color: #111827; 
              font-weight: 700;
            }
            td { 
              padding: 10px 8px; 
              font-size: 12px; 
              color: #1f2937;
            }

            .preco-card {
              border: 2px solid #111827;
              padding: 20px;
              margin-bottom: 40px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              background-color: #f9fafb;
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            
            .preco-label {
              font-size: 12px;
              font-weight: 800;
              color: #111827;
            }

            .preco-valor { 
              font-size: 32px; 
              font-weight: 900; 
              color: #111827; 
            }

            .detalhes {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin-bottom: 30px;
            }
            
            .detalhe-item {
              padding: 12px 0;
            }
            .detalhe-item strong {
              display: block;
              font-size: 11px;
              color: #4b5563;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 4px;
            }
            .detalhe-item span {
              font-size: 14px;
              font-weight: 700;
              color: #111827;
            }

            .footer { 
              margin-top: 50px;
              padding-top: 20px; 
              border-top: 1px solid #e5e7eb; 
              font-size: 10px; 
              color: #6b7280; 
              text-align: center; 
              line-height: 1.6;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div>
                <div class="logo">${(nomeEstudioCustom || "Seu Estúdio").toUpperCase()}</div>
                ${sloganCustom ? `<div class="slogan">${sloganCustom}</div>` : ''}
              </div>
              <div class="meta-dados">
                <div><strong>ORÇAMENTO DE SERVIÇO</strong></div>
                <div>Proposta: #${Math.floor(1000 + Math.random() * 9000)}</div>
                <div>Emissão: ${dataRef.toLocaleDateString('pt-BR')}</div>
                <div>Validade: ${validade.toLocaleDateString('pt-BR')}</div>
              </div>
            </div>

          <div class="container">
            <div class="header" style="align-items: center; border-bottom: 2px solid #111827; padding-bottom: 30px; margin-bottom: 30px;">
              <div>
                <div class="logo">${(nomeEstudioCustom || "Seu Estúdio").toUpperCase()}</div>
                ${sloganCustom ? `<div class="slogan">${sloganCustom}</div>` : ''}
              </div>
              <div style="text-align: right;">
                <div style="font-size: 11px; font-weight: 800; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Valor Total do Orçamento</div>
                <div style="font-size: 40px; font-weight: 900; color: #111827; line-height: 1.1;">R$ ${(calculo.precoSugerido / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 40px; font-size: 12px; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px;">
              <div>
                <strong style="color: #111827; text-transform: uppercase; font-size: 11px; display: block; margin-bottom: 4px;">Identificação do Cliente:</strong>
                <span style="font-size: 15px; font-weight: 700; color: #111827;">${nomeCliente || "Consumidor Final"}</span>
              </div>
              <div style="text-align: right;">
                <div><strong>Orçamento:</strong> #${Math.floor(1000 + Math.random() * 9000)}</div>
                <div><strong>Emissão:</strong> ${dataRef.toLocaleDateString('pt-BR')}</div>
                <div><strong>Validade:</strong> ${validade.toLocaleDateString('pt-BR')}</div>
              </div>
            </div>
            
            <div class="secao-titulo" style="border: none; padding: 0; font-size: 14px; font-weight: 900; letter-spacing: 0px; margin-bottom: 10px;">Detalhamento do Pedido</div>
            <table>
              <thead>
                <tr>
                  <th>Descrição Detalhada do Item</th>
                  <th>Qtd</th>
                  <th>Valor Unitário</th>
                  <th style="text-align: right">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong style="font-size: 13px;">Serviço de Manufatura Aditiva sob Encomenda</strong>
                    <div style="font-size: 11px; color: #4b5563; margin-top: 4px; line-height: 1.4;">
                      <strong>Composição técnica da peça:</strong><br>
                      • Material: ${materiaisSelecionados.length > 0 ? materiaisSelecionados.map(m => `${m.nome} (${m.quantidade}${m.tipo === 'FDM' ? 'g' : 'ml'})`).join(', ') : 'Material Padrão'}<br>
                      • Tempo total de impressão: ${tempo} hora(s)
                    </div>
                  </td>
                  <td>${quantidade}</td>
                  <td>R$ ${((calculo.precoSugerido / 100) / quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style="text-align: right; font-weight: 700;">R$ ${(calculo.precoSugerido / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; margin-top: 30px; border-top: 1px solid #111827; padding-top: 20px; margin-bottom: 20px;">
              <div>
                <div style="font-size: 11px; font-weight: 900; text-transform: uppercase; color: #111827; margin-bottom: 12px; letter-spacing: 0.5px;">3. Breakdown de Custos Transparente</div>
                <div style="font-size: 11px; color: #4b5563; line-height: 1.6;">
                  • Insumos & Materiais: <strong style="color: #111827">R$ ${((calculo.custoMaterial + calculo.custoInsumos) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong><br>
                  • Engenharia & Processamento: <strong style="color: #111827">R$ ${((calculo.custoEnergia + calculo.custoDepreciacao + calculo.custoMaoDeObra + calculo.custoPosProcesso) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong><br>
                  • Logística & Taxas Operacionais: <strong style="color: #111827">R$ ${((calculo.taxaMarketplace + calculo.impostoVenda) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                </div>
              </div>

              <div>
                <div style="font-size: 11px; font-weight: 900; text-transform: uppercase; color: #111827; margin-bottom: 12px; letter-spacing: 0.5px;">5. Prazo de Produção</div>
                <div style="font-size: 11px; color: #4b5563; line-height: 1.6;">
                  • Tempo de impressão estimado: <strong style="color: #111827">${tempo} hora(s)</strong><br>
                  • Tempo de pós-processamento: <strong style="color: #111827">${itensPosProcesso.length > 0 ? `${itensPosProcesso.length * 0.5} hora(s)` : '0.5 hora(s)'}</strong><br>
                  • Prazo total de entrega: <strong style="color: #111827">${estimativaPrazo.diasUteis || 1} dias úteis</strong>
                </div>
              </div>
            </div>

            <div style="border-top: 1px solid #111827; padding-top: 20px; margin-bottom: 30px;">
              <div style="font-size: 11px; font-weight: 900; text-transform: uppercase; color: #111827; margin-bottom: 12px; letter-spacing: 0.5px;">6. Opções Configuráveis</div>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; font-size: 11px; color: #4b5563;">
                <div>• <strong>Urgência:</strong> Prazo reduzido (+20% sobre o total)</div>
                <div>• <strong>Cor alternativa:</strong> Variação de insumos sob consulta</div>
                <div>• <strong>Acabamento premium:</strong> Lixamento/verniz extra</div>
                <div>• <strong>Quantidade:</strong> Descontos progressivos escaláveis</div>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; margin-top: 20px; margin-bottom: 40px;">
              <div style="width: 300px; border-top: 2px solid #111827; padding-top: 15px;">
                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px;">
                  <span style="color: #4b5563;">Subtotal:</span>
                  <span style="font-weight: 700; color: #111827;">R$ ${(calculo.precoSugerido / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: 900; color: #111827; border-top: 1px solid #e5e7eb; padding-top: 8px;">
                  <span>TOTAL FINAL:</span>
                  <span>R$ ${(calculo.precoSugerido / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div class="footer">
              Este documento foi gerado eletronicamente e não requer assinatura física. <br>
              Os preços e prazos descritos acima podem sofrer variações caso haja alteração de escopo.
            </div>
          </div>

          <script>
            window.onload = () => {
              window.print();
            }
          </script>
        </body>
      </html>
    `;
    const win = window.open("", "_blank");
    win?.document.write(layout);
    win?.document.close();
  }, [calculo, materiaisSelecionados, estimativaPrazo]);

  const limpar = useCallback(() => {
    // Limpa apenas dados da peça/projeto
    setMateriaisSelecionados([]);
    setTempo(0);
    setQuantidade(1);
    setMaterialPerdido(0);
    setTempoPerdido(0);
    setFrete(0);
    setInsumosFixos(0);
    setInsumosSelecionados([]);
    setItensPosProcesso([]);
    
    // Mantém as configurações operacionais da máquina e estúdio para não perder produtividade
    toast.success("Orçamento resetado! Mantivemos seus dados operacionais.");
  }, []);

  return {
    // Estados
    materiaisSelecionados, setMateriaisSelecionados,
    quantidade, setQuantidade,
    tempoSetup, setTempoSetup,
    taxaFalha, setTaxaFalha,
    materialPerdido, setMaterialPerdido,
    tempoPerdido, setTempoPerdido,
    tempo, setTempo,
    potencia, setPotencia,
    precoKwh, setPrecoKwh,
    maoDeObra, setMaoDeObra,
    depreciacaoHora, setDepreciacaoHora,
    cobrarDesgaste, setCobrarDesgaste,
    cobrarMaoDeObra, setCobrarMaoDeObra,
    cobrarEnergia, setCobrarEnergia,
    cobrarImpostos, setCobrarImpostos,
    margem, setMargem,
    frete, setFrete,
    insumosFixos, setInsumosFixos,
    insumosSelecionados, setInsumosSelecionados,
    itensPosProcesso, setItensPosProcesso,
    perfilAtivo, setPerfilAtivo,
    taxaEcommerce, setTaxaEcommerce,
    taxaFixa, setTaxaFixa,
    perfisMarketplace, setPerfisMarketplace,
    perfisFiscais, setPerfisFiscais,
    tipoOperacao, setTipoOperacao,
    impostos, setImpostos,
    icms, setIcms,
    iss, setIss,
    impressoraSelecionadaId, setImpressoraSelecionadaId,
    historico,
    
    // Resultados
    calculo,
    alertasEstoque,
    alertasInsumos,
    estimativaPrazo,
    dadosGraficoPizza,
    
    // Ações
    salvarSnapshot,
    carregarSnapshot,
    removerSnapshot,
    gerarPdf,
    limpar
  };
}
