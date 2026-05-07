export interface MaterialSelecionado {
  id: string;
  nome: string;
  cor: string;
  tipo: "FDM" | "SLA";
  tipoMaterial: string;
  quantidade: number;
  precoKgCentavos: number;
  porLote?: boolean;
}

export interface ItemPosProcesso {
  id: string;
  nome: string;
  valor: number;
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
  taxa: number;
  fixa: number;
  frete?: number;
}

export interface VersaoCalculo {
  id: string;
  data: string;
  nome: string;
  calculo: any;
  configuracoes: any;
}

export interface CalculoResultado {
  custoMaterial: number;
  custoEnergia: number;
  custoMaoDeObra: number;
  custoDepreciacao: number;
  custoPosProcesso: number;
  custoInsumos: number;
  taxaMarketplace: number;
  precoSugerido: number;
  lucroLiquido: number;
  custoTotalOperacional: number;
  margemReal: number;
  custoFalha: number;
}
