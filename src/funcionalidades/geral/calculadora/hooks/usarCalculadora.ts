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
  const [tempo, setTempo] = useState<number>(() => {
    const salvo = localStorage.getItem("printlog_calculadora_tempo") || localStorage.getItem("printlog_tempo");
    return salvo ? Number(salvo) : 0;
  });
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
  const [modoEntrada, setModoEntrada] = useState<'unitario' | 'lote'>(() => {
    const salvo = localStorage.getItem("printlog_calculadora_modo_entrada");
    return (salvo as 'unitario' | 'lote') || "unitario";
  });
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
  const [cobrarInsumosFixos, setCobrarInsumosFixos] = useState<boolean>(() => localStorage.getItem("printlog_cobrar_insumos_fixos") !== "false");
  const [cobrarLogistica, setCobrarLogistica] = useState<boolean>(() => localStorage.getItem("printlog_cobrar_logistica") !== "false");
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
  useEffect(() => { localStorage.setItem("printlog_cobrar_insumos_fixos", String(cobrarInsumosFixos)); }, [cobrarInsumosFixos]);
  useEffect(() => { localStorage.setItem("printlog_cobrar_logistica", String(cobrarLogistica)); }, [cobrarLogistica]);
  useEffect(() => { localStorage.setItem("printlog_perfil_ativo", perfilAtivo); }, [perfilAtivo]);
  useEffect(() => { localStorage.setItem("printlog_tipo_operacao", tipoOperacao); }, [tipoOperacao]);

  useEffect(() => { localStorage.setItem("printlog_materiais_selecionados", JSON.stringify(materiaisSelecionados)); }, [materiaisSelecionados]);
  useEffect(() => {
    localStorage.setItem("printlog_calculadora_tempo", String(tempo));
  }, [tempo]);

  useEffect(() => {
    localStorage.setItem("printlog_calculadora_modo_entrada", modoEntrada);
  }, [modoEntrada]);
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
      { nome: "Produto", base: 4, icms: 0, iss: 0 },
      { nome: "Servico", base: 6, icms: 0, iss: 0 },
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

  // --- SINCRONIZAÇÃO AUTOMÁTICA COM ESTOQUE (Real-time Sync) ---
  /**
   * Garante que se o usuário mudar um preço ou nome no estoque (Materiais/Insumos),
   * a calculadora atualize automaticamente os itens que já estavam selecionados.
   */
  useEffect(() => {
    if (materiais.length > 0 && materiaisSelecionados.length > 0) {
      setMateriaisSelecionados(prev => {
        let mudou = false;
        const novaLista = prev.map(sel => {
          const atualizado = materiais.find(m => m.id === sel.id);
          if (!atualizado) return sel;

          const novoPrecoKg = Math.round((atualizado.precoCentavos / atualizado.pesoGramas) * 1000);
          
          if (sel.nome !== atualizado.nome || sel.cor !== atualizado.cor || sel.precoKgCentavos !== novoPrecoKg) {
            mudou = true;
            return {
              ...sel,
              nome: atualizado.nome,
              cor: atualizado.cor,
              precoKgCentavos: novoPrecoKg,
              tipo: atualizado.tipo,
              tipoMaterial: atualizado.tipoMaterial || ""
            };
          }
          return sel;
        });
        return mudou ? novaLista : prev;
      });
    }
  }, [materiais]);

  useEffect(() => {
    if (insumosEstoque.length > 0 && insumosSelecionados.length > 0) {
      setInsumosSelecionados(prev => {
        let mudou = false;
        const novaLista = prev.map(sel => {
          const atualizado = insumosEstoque.find(i => i.id === sel.id);
          if (!atualizado) return sel;

          // O valor já vem em centavos do banco/estado
          const novoCusto = Math.round(atualizado.custoMedioUnidade || 0);

          if (sel.nome !== atualizado.nome || sel.custoCentavos !== novoCusto) {
            mudou = true;
            return {
              ...sel,
              nome: atualizado.nome,
              custoCentavos: novoCusto
            };
          }
          return sel;
        });
        return mudou ? novaLista : prev;
      });
    }
  }, [insumosEstoque]);

  // --- LÓGICA DE CÁLCULO (Sólida) ---
  const calculo = useMemo((): CalculoResultado => {
    const multiplicadorMaterialEMaquina = quantidade;

    const custoMaterialTotalCentavos = materiaisSelecionados.reduce((acc, m) => {
      const pesoTotal = modoEntrada === 'lote' ? m.quantidade : m.quantidade * multiplicadorMaterialEMaquina;
      return acc + (pesoTotal / 1000) * m.precoKgCentavos;
    }, 0);
    const custoInsumosDinamicosCentavos = insumosSelecionados.reduce((acc, i) => {
      const valorBase = i.quantidade * i.custoCentavos;
      return acc + (i.porLote ? valorBase : valorBase * quantidade);
    }, 0);
    
    // Tempo de Máquina
    const horasDecimaisMaquina = modoEntrada === 'lote' ? (tempo / 60) : (tempo / 60) * multiplicadorMaterialEMaquina;
    const custoEnergiaCentavos = cobrarEnergia ? Math.round((potencia / 1000) * horasDecimaisMaquina * precoKwh * 100) : 0;
    const custoDepreciacaoCentavos = cobrarDesgaste ? Math.round(horasDecimaisMaquina * depreciacaoHora * 100) : 0;

    // Cálculo das Perdas Reais (Registro Real Pós-Impressão)
    const custoFilamentoPerdidoCentavos = materiaisSelecionados.reduce((acc, m) => acc + (materialPerdido / 1000) * m.precoKgCentavos, 0);
    const custoTempoPerdidoCentavos = ((tempoPerdido / 60) * depreciacaoHora * 100) + (cobrarEnergia ? Math.round((potencia / 1000) * (tempoPerdido / 60) * precoKwh * 100) : 0);
    const custoFalhaRealCentavos = Math.round(custoFilamentoPerdidoCentavos + custoTempoPerdidoCentavos);

    // Tempo de Operador (Tempo Fixo de Setup por lote)
    const horasDecimaisSetup = tempoSetup / 60;
    const custoMaoDeObraCentavos = cobrarMaoDeObra ? Math.round(horasDecimaisSetup * maoDeObra * 100) : 0;

    const custoPosProcessoCentavos = itensPosProcesso.reduce((t, i) => t + (i.valor * 100), 0) * (modoEntrada === 'lote' ? 1 : quantidade);
    const custoInsumosFixosCentavos = cobrarInsumosFixos ? Math.round(insumosFixos * 100) : 0;
    const custoFreteCentavos = cobrarLogistica ? Math.round(frete * 100) : 0;

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
    const taxaMktPercentual = cobrarLogistica ? taxaEcommerce / 100 : 0;
    const taxaFixaVendaCentavos = cobrarLogistica ? Math.round(taxaFixa * 100) : 0;
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
  }, [materiaisSelecionados, insumosSelecionados, tempo, potencia, precoKwh, margem, maoDeObra, depreciacaoHora, cobrarDesgaste, cobrarMaoDeObra, cobrarEnergia, cobrarImpostos, cobrarInsumosFixos, cobrarLogistica, itensPosProcesso, insumosFixos, frete, perfilAtivo, perfisMarketplace, impostos, icms, iss, quantidade, tempoSetup, taxaFalha, materialPerdido, tempoPerdido, taxaEcommerce, taxaFixa]);

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
        iss,
        cobrarInsumosFixos,
        cobrarLogistica
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
    if (c.cobrarInsumosFixos !== undefined) setCobrarInsumosFixos(c.cobrarInsumosFixos);
    if (c.cobrarLogistica !== undefined) setCobrarLogistica(c.cobrarLogistica);

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
  const gerarPdf = useCallback((nomeEstudioCustom?: string, sloganCustom?: string, nomeCliente?: string, nomeProjeto?: string) => {
    const dataRef = new Date();
    const validade = new Date();
    validade.setDate(dataRef.getDate() + 7);

    // Enriquece com tipoMaterial real do armazem
    const materiaisComTipo = materiaisSelecionados.map(m => ({
      ...m,
      tipoMaterial: m.tipoMaterial || materiais.find(orig => orig.id === m.id)?.tipoMaterial || m.tipo
    }));

    // Calcula percentuais para barras proporcionais
    const totalCustos = calculo.custoTotalOperacional + calculo.taxaMarketplace + calculo.impostoVenda;
    const pctMaterial  = totalCustos > 0 ? Math.round(((calculo.custoMaterial + calculo.custoInsumos) / totalCustos) * 100) : 0;
    const pctMaquina   = totalCustos > 0 ? Math.round(((calculo.custoEnergia + calculo.custoDepreciacao + calculo.custoMaoDeObra + calculo.custoPosProcesso) / totalCustos) * 100) : 0;
    const pctTaxas     = totalCustos > 0 ? Math.round(((calculo.taxaMarketplace + calculo.impostoVenda) / totalCustos) * 100) : 0;

    // Número único do documento (usado no header e nos termos)
    const numDocumento = '#' + Math.floor(1000 + Math.random() * 9000);

    // Tempo formatado
    const tempoFormatado = tempo < 60
      ? tempo + ' min'
      : Math.floor(tempo / 60) + 'h' + (tempo % 60 > 0 ? ' ' + (tempo % 60) + 'min' : '');

    // Data de entrega
    const diasEntrega = estimativaPrazo.diasUteis || 1;
    const dataEntrega = new Date();
    dataEntrega.setDate(dataEntrega.getDate() + diasEntrega);

    const layout = `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Orcamento - ${(nomeEstudioCustom || "Seu Estudio")}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
            @page { size: A4; margin: 0; }
            * { margin: 0; padding: 0; box-sizing: border-box; }

            body {
              font-family: 'Inter', sans-serif;
              color: #111827;
              background: #ffffff;
              min-height: 297mm;
              position: relative;
            }

            body::before {
              content: '';
              position: fixed;
              inset: 0;
              background-image: radial-gradient(circle, #d1d5db 1px, transparent 1px);
              background-size: 22px 22px;
              opacity: 0.35;
              pointer-events: none;
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
              z-index: 0;
            }

            .pagina {
              position: relative;
              z-index: 1;
              max-width: 720px;
              margin: 0 auto;
              padding: 36px 44px 44px;
            }

            /* ── HEADER ─────────────────────────────── */
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              padding-bottom: 20px;
              border-bottom: 2px solid #111827;
              margin-bottom: 24px;
            }
            .logo {
              font-size: 24px;
              font-weight: 900;
              color: #111827;
              text-transform: uppercase;
              letter-spacing: -1px;
              line-height: 1;
            }
            .slogan { font-size: 11px; color: #9ca3af; margin-top: 4px; font-weight: 400; }
            .header-meta { text-align: right; }
            .doc-label { font-size: 9px; font-weight: 500; text-transform: uppercase; letter-spacing: 2px; color: #9ca3af; margin-bottom: 2px; }
            .doc-num { font-size: 18px; font-weight: 800; color: #111827; letter-spacing: -0.5px; }
            .doc-datas { font-size: 10px; color: #9ca3af; margin-top: 4px; line-height: 1.8; font-weight: 400; }

            /* ── 1. PRODUTO (hero) ───────────────────── */
            .hero-produto {
              background: #111827;
              border-radius: 10px;
              padding: 20px 24px;
              margin-bottom: 12px;
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            .hero-label {
              font-size: 9px;
              font-weight: 500;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: #6b7280;
              margin-bottom: 6px;
            }
            .hero-nome {
              font-size: 20px;
              font-weight: 800;
              color: #ffffff;
              letter-spacing: -0.5px;
              margin-bottom: 10px;
            }
            .hero-pills { display: flex; flex-wrap: wrap; gap: 6px; }
            .pill {
              background: rgba(255,255,255,0.08);
              border: 1px solid rgba(255,255,255,0.12);
              border-radius: 20px;
              padding: 3px 10px;
              font-size: 10px;
              font-weight: 600;
              color: #d1d5db;
            }
            .hero-campos { display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 4px; }
            .hero-campo-label { font-size: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #6b7280; margin-bottom: 2px; }
            .hero-campo-valor { font-size: 13px; font-weight: 700; color: #f9fafb; }
            .hero-cliente {
              margin-top: 12px;
              padding-top: 10px;
              border-top: 1px solid rgba(255,255,255,0.08);
              font-size: 10px;
              color: #6b7280;
              font-weight: 400;
            }
            .hero-cliente strong { color: #e5e7eb; font-weight: 600; }

            /* ── 2 + 3. PRECO + TEMPO (lado a lado) ─── */
            .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }

            .card-preco {
              background: #ffffff;
              border: 2px solid #111827;
              border-radius: 10px;
              padding: 18px 20px;
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            .card-label-sm {
              font-size: 9px;
              font-weight: 500;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              color: #9ca3af;
              margin-bottom: 4px;
            }
            .preco-valor {
              font-size: 36px;
              font-weight: 900;
              color: #111827;
              letter-spacing: -2px;
              line-height: 1;
            }
            .preco-contexto {
              font-size: 11px;
              color: #6b7280;
              font-weight: 400;
              margin-top: 4px;
            }
            .preco-unitario {
              margin-top: 8px;
              padding-top: 8px;
              border-top: 1px solid #f3f4f6;
              font-size: 11px;
              color: #374151;
              font-weight: 600;
            }

            /* ── 2+3. STATS ─────────────────────────── */
            .stats-row {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 12px;
              margin-bottom: 12px;
            }
            .stat-card {
              border: 1.5px solid #e5e7eb;
              border-radius: 10px;
              padding: 16px 18px;
              display: flex;
              flex-direction: column;
              gap: 4px;
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            .stat-card.destaque { border: 2px solid #111827; background: #fff; }
            .stat-card.secundario { background: #f9fafb; }
            .stat-valor-grande { font-size: 28px; font-weight: 900; color: #111827; letter-spacing: -1.5px; line-height: 1; }
            .stat-valor-medio { font-size: 20px; font-weight: 800; color: #111827; letter-spacing: -0.5px; line-height: 1; }
            .stat-sub { font-size: 10px; color: #9ca3af; font-weight: 400; margin-top: 4px; }

            /* ── 4. BREAKDOWN (barras) ───────────────── */
            .card-breakdown {
              background: #f9fafb;
              border: 1.5px solid #e5e7eb;
              border-radius: 10px;
              padding: 16px 20px;
              margin-bottom: 20px;
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            .breakdown-titulo {
              font-size: 9px;
              font-weight: 500;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              color: #9ca3af;
              margin-bottom: 14px;
            }
            .barra-item { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
            .barra-label { font-size: 11px; font-weight: 500; color: #374151; width: 110px; flex-shrink: 0; }
            .barra-track { flex: 1; height: 6px; background: #e5e7eb; border-radius: 99px; overflow: hidden; }
            .barra-fill { height: 100%; border-radius: 99px; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            .barra-pct { font-size: 10px; font-weight: 600; color: #9ca3af; width: 32px; text-align: right; flex-shrink: 0; }
            .barra-valor { font-size: 12px; font-weight: 700; color: #111827; width: 64px; text-align: right; flex-shrink: 0; }

            /* ── FOOTER ──────────────────────────────── */
            .footer {
              padding-top: 14px;
              border-top: 1px solid #e5e7eb;
              font-size: 10px;
              color: #9ca3af;
              text-align: center;
              line-height: 1.7;
              font-weight: 400;
            }
          </style>
        </head>
        <body>
          <div class="pagina">

            <!-- HEADER -->
            <div class="header">
              <div>
                <div class="logo">${(nomeEstudioCustom || "Seu Estudio").toUpperCase()}</div>
                ${sloganCustom ? '<div class="slogan">' + sloganCustom + '</div>' : ''}
              </div>
              <div class="header-meta">
                <div class="doc-label">Orcamento</div>
                <div class="doc-num">${numDocumento}</div>
              </div>
            </div>

            <!-- 1. PRODUTO -->
            <div class="hero-produto">
              <div class="hero-nome">${nomeProjeto || 'Item personalizado 3D'}</div>
              <div class="hero-campos">
                ${materiaisComTipo.map(m => `
                <div style="display:flex;flex-direction:column;padding-right:20px;border-right:1px solid rgba(255,255,255,0.08);margin-right:4px;">
                  <span class="hero-campo-label">Material</span>
                  <span class="hero-campo-valor">${m.tipoMaterial}</span>
                </div>
                <div style="display:flex;flex-direction:column;padding-right:20px;border-right:1px solid rgba(255,255,255,0.08);margin-right:4px;">
                  <span class="hero-campo-label">Cor</span>
                  <span class="hero-campo-valor">${m.nome}</span>
                </div>
                <div style="display:flex;flex-direction:column;padding-right:20px;${itensPosProcesso.length > 0 ? 'border-right:1px solid rgba(255,255,255,0.08);margin-right:4px;' : ''}">
                  <span class="hero-campo-label">Peso utilizado</span>
                  <span class="hero-campo-valor">${m.quantidade}${m.tipo === 'FDM' ? 'g' : 'ml'}</span>
                </div>`).join('')}
                ${itensPosProcesso.length > 0 ? `
                <div style="display:flex;flex-direction:column;">
                  <span class="hero-campo-label">Acabamento</span>
                  <span class="hero-campo-valor">${itensPosProcesso.map(i => i.nome).join(', ')}</span>
                </div>` : ''}
              </div>
              <div class="hero-cliente">Para: <strong>${nomeCliente || 'Consumidor Final'}</strong></div>
            </div>

            <!-- 2+3. STATS: TOTAL · POR PECA · PRODUCAO -->
            <div class="stats-row">
              <div class="stat-card destaque">
                <div class="card-label-sm">Total do pedido</div>
                <div class="stat-valor-grande">R$ ${(calculo.precoSugerido / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                <div class="stat-sub">${quantidade} ${quantidade === 1 ? 'peça' : 'peças'} &middot; total do pedido</div>
              </div>
              <div class="stat-card secundario">
                <div class="card-label-sm">${quantidade > 1 ? 'Por peça' : 'Custo de produçao'}</div>
                <div class="stat-valor-medio">R$ ${quantidade > 1 ? ((calculo.precoSugerido / 100) / quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : ((calculo.custoTotalOperacional) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                <div class="stat-sub">${quantidade > 1 ? 'valor unitário' : 'preco sem margem'}</div>
              </div>
              <div class="stat-card secundario">
                <div class="card-label-sm">Producao</div>
                <div class="stat-valor-medio">${tempoFormatado}</div>
                <div class="stat-sub">por peca</div>
              </div>
            </div>

            <div class="card-breakdown">
              <div class="breakdown-titulo">Como o preço foi formado</div>
              <div class="barra-item">
                <span class="barra-label">Material</span>
                <div class="barra-track"><div class="barra-fill" style="width:${pctMaterial}%;background:#111827;"></div></div>
                <span class="barra-pct">${pctMaterial}%</span>
                <span class="barra-valor">R$ ${((calculo.custoMaterial + calculo.custoInsumos) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div class="barra-item">
                <span class="barra-label">Máquina e energia</span>
                <div class="barra-track"><div class="barra-fill" style="width:${pctMaquina}%;background:#374151;"></div></div>
                <span class="barra-pct">${pctMaquina}%</span>
                <span class="barra-valor">R$ ${((calculo.custoEnergia + calculo.custoDepreciacao + calculo.custoMaoDeObra + calculo.custoPosProcesso) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div class="barra-item">
                <span class="barra-label">Frete e taxas</span>
                <div class="barra-track"><div class="barra-fill" style="width:${pctTaxas}%;background:#6b7280;"></div></div>
                <span class="barra-pct">${pctTaxas}%</span>
                <span class="barra-valor">R$ ${((calculo.taxaMarketplace + calculo.impostoVenda) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <!-- TERMOS + ACEITE -->
            <div style="margin-top:28px;border:1.5px solid #e5e7eb;border-radius:10px;overflow:hidden;">

              <!-- cabeçalho dos termos -->
              <div style="background:#f9fafb;padding:12px 18px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;">
                <div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#6b7280;">Termos e Condições</div>
                <div style="font-size:9px;color:#9ca3af;font-weight:500;">Ref. ${numDocumento}</div>
              </div>

              <!-- corpo dos termos -->
              <div style="padding:14px 18px;display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;">
                <div style="font-size:9px;color:#6b7280;line-height:1.6;">
                  <strong style="color:#374151;">Validade</strong> — Este orçamento é válido por 7 dias a partir da data de emissão.
                </div>
                <div style="font-size:9px;color:#6b7280;line-height:1.6;">
                  <strong style="color:#374151;">Pagamento</strong> — Condições e forma de pagamento a combinar no ato da confirmação.
                </div>
                <div style="font-size:9px;color:#6b7280;line-height:1.6;">
                  <strong style="color:#374151;">Alterações</strong> — Mudanças no modelo, material ou quantidade após a aprovação podem alterar o valor.
                </div>
                <div style="font-size:9px;color:#6b7280;line-height:1.6;">
                  <strong style="color:#374151;">Responsabilidade</strong> — A impressão será fiel ao arquivo fornecido pelo cliente. Erros de projeto são de responsabilidade do solicitante.
                </div>
              </div>

              <!-- assinaturas dentro do mesmo card -->
              <div style="border-top:1px solid #e5e7eb;padding:14px 18px 16px;display:flex;gap:16px;">
                <div style="flex:1;border:1.5px dashed #d1d5db;border-radius:8px;padding:12px 14px 10px;">
                  <div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;margin-bottom:44px;">Assinatura do cliente</div>
                  <div style="border-top:1.5px solid #374151;margin-bottom:5px;"></div>
                  <div style="font-size:9px;color:#9ca3af;">${nomeCliente || 'Consumidor Final'} &nbsp;&middot;&nbsp; Data: ____/____/______</div>
                </div>
                <div style="flex:1;border:1.5px dashed #d1d5db;border-radius:8px;padding:12px 14px 10px;">
                  <div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;margin-bottom:44px;">Aceite do orçamento</div>
                  <div style="border-top:1.5px solid #374151;margin-bottom:5px;"></div>
                  <div style="font-size:9px;color:#9ca3af;">${(nomeEstudioCustom || 'Seu Est\u00fadio').toUpperCase()} &nbsp;&middot;&nbsp; V\u00e1lido at\u00e9 ${validade.toLocaleDateString('pt-BR')}</div>
                </div>
              </div>

            </div>

            <div class="footer" style="margin-top:20px; border-top: 1px solid #eee; padding-top: 10px;">
              Este orçamento tem validade de 7 dias &nbsp;&middot;&nbsp; PrintLog &nbsp;&middot;&nbsp; Gerado em ${new Date().toLocaleDateString('pt-BR')}
            </div>
          </div>

          <script>window.onload = () => { window.print(); }</script>
        </body>
      </html>
    `;
    const win = window.open("", "_blank");
    win?.document.write(layout);
    win?.document.close();
  }, [calculo, materiaisSelecionados, materiais, estimativaPrazo, tempo, quantidade, itensPosProcesso]);

  const limpar = useCallback(() => {
    // Limpa apenas dados da peça/projeto
    setMateriaisSelecionados([]);
    setTempo(0);
    setModoEntrada('unitario');
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
    modoEntrada, setModoEntrada,
    potencia, setPotencia,
    precoKwh, setPrecoKwh,
    maoDeObra, setMaoDeObra,
    depreciacaoHora, setDepreciacaoHora,
    cobrarDesgaste, setCobrarDesgaste,
    cobrarMaoDeObra, setCobrarMaoDeObra,
    cobrarEnergia, setCobrarEnergia,
    cobrarImpostos, setCobrarImpostos,
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
