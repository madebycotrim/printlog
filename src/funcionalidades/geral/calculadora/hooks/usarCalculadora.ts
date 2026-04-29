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
  const [materiaisSelecionados, setMateriaisSelecionados] = useState<MaterialSelecionado[]>([]);
  const [tempo, setTempo] = useState<number>(0);
  const [potencia, setPotencia] = useState<number>(0);
  const [precoKwh, setPrecoKwh] = useState<number>(() => extrairValorNumerico(config.custoEnergia));
  const [maoDeObra, setMaoDeObra] = useState<number>(() => extrairValorNumerico(config.horaOperador));
  const [depreciacaoHora, setDepreciacaoHora] = useState<number>(() => extrairValorNumerico(config.horaMaquina));
  const [margem, setMargem] = useState<number>(() => extrairValorNumerico(config.margemLucro));
  
  // Novas variáveis de Lote e Setup
  const [quantidade, setQuantidade] = useState<number>(1);
  const [tempoSetup, setTempoSetup] = useState<number>(15); // Em minutos
  const [taxaFalha, setTaxaFalha] = useState<number>(10); // Em porcentagem
  const [materialPerdido, setMaterialPerdido] = useState<number>(0); // Gramas
  const [tempoPerdido, setTempoPerdido] = useState<number>(0); // Minutos
  
  const [frete, setFrete] = useState<number>(0);
  const [insumosFixos, setInsumosFixos] = useState<number>(0);
  const [insumosSelecionados, setInsumosSelecionados] = useState<InsumoSelecionado[]>([]);
  const [itensPosProcesso, setItensPosProcesso] = useState<ItemPosProcesso[]>([]);
  
  const [cobrarDesgaste, setCobrarDesgaste] = useState<boolean>(() => localStorage.getItem("printlog_cobrar_desgaste") !== "false");
  const [cobrarMaoDeObra, setCobrarMaoDeObra] = useState<boolean>(() => localStorage.getItem("printlog_cobrar_mao_de_obra") !== "false");
  const [cobrarEnergia, setCobrarEnergia] = useState<boolean>(() => localStorage.getItem("printlog_cobrar_energia") !== "false");
  const [cobrarImpostos, setCobrarImpostos] = useState<boolean>(() => localStorage.getItem("printlog_cobrar_impostos") !== "false");
  const [perfilAtivo, setPerfilAtivo] = useState(() => localStorage.getItem("printlog_perfil_ativo") || "Direto");

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
    const perfil = perfisMarketplace.find(p => p.nome === perfilAtivo);
    const taxaMktPercentual = (perfil?.taxa || 0) / 100;
    const taxaFixaVendaCentavos = Math.round((perfil?.fixa || 0) * 100);
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
  }, [materiaisSelecionados, insumosSelecionados, tempo, potencia, precoKwh, margem, maoDeObra, depreciacaoHora, cobrarDesgaste, cobrarMaoDeObra, cobrarEnergia, cobrarImpostos, itensPosProcesso, insumosFixos, frete, perfilAtivo, perfisMarketplace, impostos, icms, iss, quantidade, tempoSetup, taxaFalha, materialPerdido, tempoPerdido]);

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
        margem
      }
    };
    const novoHistorico = [novaVersao, ...historico];
    setHistorico(novoHistorico);
    localStorage.setItem("printlog_historico_calculadora", JSON.stringify(novoHistorico));
    toast.success("Snapshot salvo no histórico!");
  };

  const carregarSnapshot = (versao: VersaoCalculo) => {
    setMateriaisSelecionados(versao.configuracoes.materiaisSelecionados);
    setTempo(versao.configuracoes.tempo);
    setPerfilAtivo(versao.configuracoes.perfilAtivo);
    setMargem(versao.configuracoes.margem);
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
  const gerarPdf = useCallback(() => {
    const dataRef = new Date();
    const validade = new Date();
    validade.setDate(dataRef.getDate() + 7);

    const layout = `
      <html>
        <head>
          <title>Orçamento PrintLog - ${dataRef.toLocaleDateString('pt-BR')}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1f2937; }
            .header { border-bottom: 4px solid #0ea5e9; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 24px; font-weight: 900; color: #0ea5e9; letter-spacing: -1px; }
            .grid { display: grid; grid-cols: 2; gap: 40px; margin-top: 40px; }
            .valor { font-size: 48px; font-weight: 900; color: #10b981; margin: 20px 0; }
            .label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #6b7280; letter-spacing: 1px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; padding: 12px; border-bottom: 2px solid #f3f4f6; font-size: 11px; text-transform: uppercase; color: #9ca3af; }
            td { padding: 12px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
            .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #f3f4f6; font-size: 10px; color: #9ca3af; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">PRINTLOG.PRO</div>
            <div style="text-align: right">
              <div class="label">Emitido em</div>
              <div style="font-weight: bold">${dataRef.toLocaleDateString('pt-BR')}</div>
            </div>
          </div>
          
          <div style="margin-top: 40px">
            <div class="label">Valor Final do Orçamento</div>
            <div class="valor">R$ ${(calculo.precoSugerido / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>

          <div class="label">Resumo de Materiais</div>
          <table>
            <thead>
              <tr><th>Material</th><th>Tipo</th><th>Quantidade</th></tr>
            </thead>
            <tbody>
              ${materiaisSelecionados.map(m => `<tr><td>${m.nome}</td><td>${m.tipo}</td><td>${m.quantidade}${m.tipo === 'FDM' ? 'g' : 'ml'}</td></tr>`).join('')}
            </tbody>
          </table>

          <div style="margin-top: 30px">
            <div class="label">Prazo Estimado</div>
            <div style="font-weight: bold; font-size: 16px">${estimativaPrazo.data.toLocaleDateString('pt-BR')}</div>
          </div>

          <div class="footer">
            Orçamento válido até ${validade.toLocaleDateString('pt-BR')} • Gerado via PrintLog v2 Professional
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    const win = window.open("", "_blank");
    win?.document.write(layout);
    win?.document.close();
  }, [calculo, materiaisSelecionados, estimativaPrazo]);

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
    gerarPdf
  };
}
