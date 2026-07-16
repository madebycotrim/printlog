export interface MaterialSelecionado {
  id: string;
  instanceId?: string;
  nomePeca?: string;
  nome: string;
  cor: string;
  tipo: "FDM" | "SLA";
  tipoMaterial: string;
  quantidade: number;
  precoKgCentavos: number;
  tempoHoras?: number;
  tempoMinutos?: number;
  tempoSegundos?: number;
  porLote?: boolean;
}

export interface ItemPosProcesso {
  id: string;
  nome: string;
  tempoMinutos: number;
  custoMaterialCentavos: number;
}

export interface ItemCustoFixo {
  id: string;
  nome: string;
  valorCentavos: number;
}

export interface InsumoSelecionado {
  id: string;
  nome: string;
  quantidade: number;
  custoCentavos: number;
  porLote?: boolean;
}

export interface PerfilMarketplace {
  nome: string;
  taxaPontosBase: number; // ex: 1500 = 15%
  fixaCentavos: number;
  freteCentavos?: number;
}

export interface VersaoCalculo {
  id: string;
  data: string;
  nome: string;
  calculo: any;
  configuracoes: any;
}

export interface CustoAdicional {
  id: string;
  nome: string;
  valorCentavos: number;
}

export interface CalculoResultado {
  custoMaterial: number;
  modoEntrada: 'unitario' | 'lote' | 'projeto';
  custoEnergia: number;
  custoAdicionalTotal: number;
  custoDepreciacao: number;
  custoPosProcesso: number;
  custoInsumos: number;
  taxaMarketplace: number;  // total = taxaComissao + taxaFixaVenda
  taxaComissao: number;     // parcela percentual sobre o preço
  taxaFixaVenda: number;    // parcela fixa por transação
  custoFrete: number;       // frete já aplicado
  precoSugerido: number;
  precoSugeridoOriginal?: number;
  lucroLiquido: number;
  custoTotalOperacional: number;
  margemReal: number;
  custoFalha: number;
  custoModelagem: number;
}
