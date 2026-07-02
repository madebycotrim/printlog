import { InsumoSelecionado, ItemPosProcesso, MaterialSelecionado } from "../tipos";

export interface ParametrosCalculo {
  materiaisSelecionados: MaterialSelecionado[];
  insumosSelecionados: InsumoSelecionado[];
  itensPosProcesso: ItemPosProcesso[];
  tempoMinutosMaquina: number;
  potenciaWatts: number;
  precoKwhCentavos: number;
  maoDeObraHoraCentavos: number;
  depreciacaoHoraCentavos: number;
  margemLucroPercentual: number; // 0-10000 (0-100%)
  
  // Toggles de Cobrança
  cobrarEnergia: boolean;
  cobrarDesgaste: boolean;
  cobrarMaoDeObra: boolean;
  cobrarInsumosFixos: boolean;
  cobrarLogistica: boolean;
  
  // Quantidades / Entradas
  modoEntrada: 'unitario' | 'lote' | 'projeto';
  quantidade: number;
  pecasPorMesa: number;
  
  // Extras
  tempoSetupMinutos: number;
  materialPerdidoGramas: number;
  tempoPerdidoMinutos: number;
  insumosFixosCentavos: number;
  freteCentavos: number;
  taxaEcommercePercentual: number; // 0-10000
  taxaFixaVendaCentavos: number;
  
  tempoModelagemMinutos: number;
  valorHoraModelagemCentavos: number;
  descontoVolumePercentual: number; // 0-100
  precoAlvoCentavos: number;
}

export function executarMotorCalculo(p: ParametrosCalculo) {
  const qtdReal = Math.max(1, p.quantidade);

  const multiplicadorGeral = p.modoEntrada === 'lote' ? 1 : qtdReal;

  const custoMaterialTotalCentavos = p.materiaisSelecionados.reduce((acc, m) => {
    const pesoTotal = m.quantidade * multiplicadorGeral;
    return acc + (pesoTotal / 1000) * m.precoKgCentavos;
  }, 0);

  const custoInsumosDinamicosCentavos = p.insumosSelecionados.reduce((acc, i) => {
    const valorBase = i.quantidade * i.custoCentavos;
    return acc + (i.porLote ? valorBase : valorBase * multiplicadorGeral);
  }, 0);

  const horasDecimaisMaquina = (p.tempoMinutosMaquina / 60) * multiplicadorGeral;
  const custoEnergiaCentavos = p.cobrarEnergia ? Math.round((p.potenciaWatts / 1000) * horasDecimaisMaquina * p.precoKwhCentavos) : 0;
  const custoDepreciacaoCentavos = p.cobrarDesgaste ? Math.round(horasDecimaisMaquina * p.depreciacaoHoraCentavos) : 0;
  
  const materialPerdidoTotal = p.materialPerdidoGramas * multiplicadorGeral;
  const tempoPerdidoTotal = p.tempoPerdidoMinutos * multiplicadorGeral;
  
  const custoFilamentoPerdidoCentavos = p.materiaisSelecionados.reduce((acc, m) => acc + (materialPerdidoTotal / 1000) * m.precoKgCentavos, 0);
  const custoTempoPerdidoCentavos = ((tempoPerdidoTotal / 60) * p.depreciacaoHoraCentavos) + (p.cobrarEnergia ? Math.round((p.potenciaWatts / 1000) * (tempoPerdidoTotal / 60) * p.precoKwhCentavos) : 0);
  const custoFalhaRealCentavos = Math.round(custoFilamentoPerdidoCentavos + custoTempoPerdidoCentavos);
  
  const multiplicadorSetup = p.modoEntrada === 'lote' && p.pecasPorMesa > 0 ? Math.ceil(qtdReal / p.pecasPorMesa) : multiplicadorGeral;
  const custoMaoDeObraCentavos = p.cobrarMaoDeObra ? Math.round(((p.tempoSetupMinutos * multiplicadorSetup) / 60) * p.maoDeObraHoraCentavos) : 0;
  
  const custoPosProcessoCentavos = p.itensPosProcesso.reduce((t, i) => t + (i.valor), 0) * multiplicadorGeral;
  const custoInsumosFixosCentavos = p.cobrarInsumosFixos ? p.insumosFixosCentavos : 0; // Fixos não multiplicam
  const custoFreteCentavos = p.cobrarLogistica ? p.freteCentavos : 0;
  const custoModelagemCentavos = Math.round((p.tempoModelagemMinutos / 60) * p.valorHoraModelagemCentavos);
  
  const custoProducaoTotalCentavos = custoMaterialTotalCentavos + custoEnergiaCentavos + custoMaoDeObraCentavos + custoDepreciacaoCentavos + custoPosProcessoCentavos + custoInsumosDinamicosCentavos + custoInsumosFixosCentavos + custoFalhaRealCentavos;

  const margemPercentual = p.margemLucroPercentual / 10000;
  const taxaMktPercentual = p.cobrarLogistica ? p.taxaEcommercePercentual / 10000 : 0;
  const taxaFixaVendaCentavos = p.cobrarLogistica ? p.taxaFixaVendaCentavos : 0;

  const precoBaseVendaCentavos = custoProducaoTotalCentavos + (custoProducaoTotalCentavos * margemPercentual) + custoFreteCentavos + taxaFixaVendaCentavos + custoModelagemCentavos;
  const denominadorTaxas = 1 - taxaMktPercentual;
  
  const precoSugeridoBrutoCentavos = denominadorTaxas > 0.05 ? Math.round(precoBaseVendaCentavos / denominadorTaxas) : Math.round(precoBaseVendaCentavos * 1.5);
  const valorDescontoCentavos = Math.round(precoSugeridoBrutoCentavos * (p.descontoVolumePercentual / 100));
  const precoSugeridoCentavos = precoSugeridoBrutoCentavos - valorDescontoCentavos;
  
  const precoFinalBaseCalculo = p.precoAlvoCentavos > 0 ? p.precoAlvoCentavos : precoSugeridoCentavos;

  const taxaMktTotalCentavos = Math.round(precoFinalBaseCalculo * taxaMktPercentual + taxaFixaVendaCentavos);
  const lucroLiquidoCentavos = precoFinalBaseCalculo - taxaMktTotalCentavos - custoFreteCentavos - custoProducaoTotalCentavos - custoModelagemCentavos;
  
  return {
    custoMaterial: Math.round(custoMaterialTotalCentavos),
    custoEnergia: custoEnergiaCentavos,
    custoMaoDeObra: custoMaoDeObraCentavos,
    custoDepreciacao: custoDepreciacaoCentavos,
    custoPosProcesso: custoPosProcessoCentavos,
    custoInsumos: custoInsumosDinamicosCentavos + custoInsumosFixosCentavos,
    taxaMarketplace: taxaMktTotalCentavos,
    precoSugerido: precoFinalBaseCalculo,
    precoSugeridoOriginal: precoSugeridoCentavos,
    precoAlvo: p.precoAlvoCentavos > 0 ? p.precoAlvoCentavos : 0,
    lucroLiquido: lucroLiquidoCentavos,
    custoTotalOperacional: custoProducaoTotalCentavos,
    margemReal: precoFinalBaseCalculo > 0 ? (lucroLiquidoCentavos / precoFinalBaseCalculo) * 100 : 0,
    custoFalha: custoFalhaRealCentavos,
    custoModelagem: custoModelagemCentavos,
    valorDesconto: valorDescontoCentavos,
    percentualDesconto: p.descontoVolumePercentual,
    modoEntrada: p.modoEntrada
  };
}
