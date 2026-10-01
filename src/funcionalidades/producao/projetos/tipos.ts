import { Centavos, StatusPedido } from "@/compartilhado/tipos/modelos";

/**
 * Representa um insumo específico aplicado a um projeto.
 * Ex: Parafusos, Tintas, Embalagens.
 */
export interface InsumoProjeto {
  idInsumo: string;
  nome: string;
  quantidade: number;
  custoUnitarioCentavos: number; // Snapshot do custo no momento da aplicação
}

export interface MaterialProjeto {
  idMaterial: string;
  nome: string;
  quantidadeGasta: number;
}

export interface ItemPosProcesso {
  id: string;
  nome: string;
  valor: number;
}

export interface ParametrosCalculoPedido {
  potenciaWatts?: number;
  precoKwhCentavos?: number;
  precoKwh?: number;
  tempoHoras?: number;
  tempoMinutos?: number;
  tempoMinutosMaquina?: number;
  [chave: string]: unknown;
}

export interface SnapshotCalculoPedido {
  id?: string;
  data?: string;
  nome?: string;
  descricao?: string;
  clienteId?: string;
  parametros?: ParametrosCalculoPedido;
  resultado?: unknown;
  [chave: string]: unknown;
}

export interface ConfiguracoesPedido {
  snapshot?: SnapshotCalculoPedido;
  potenciaWatts?: number;
  potencia?: number;
  precoKwhCentavos?: number;
  precoKwh?: number;
  tempoHoras?: number;
  tempoMinutos?: number;
  quantidade?: number;
  maoDeObra?: number;
  depreciacaoHora?: number;
  margem?: number;
  [chave: string]: unknown;
}

export interface Pedido {
  id: string;
  idUsuario: string;
  idCliente: string;
  nomeCliente?: string;
  descricao: string;
  status: StatusPedido;
  valorCentavos: Centavos;
  dataCriacao: Date;
  dataConclusao?: Date;
  prazoEntrega?: Date;
  observacoes?: string;
  material?: string;
  pesoGramas?: number;
  tempoMinutos?: number;
  idImpressora?: string; // Novo campo v9.0
  insumosSecundarios?: InsumoProjeto[]; // Novo campo v9.0
  materiais?: MaterialProjeto[]; // Detalhado para abate de estoque
  posProcesso?: ItemPosProcesso[]; // Novo campo v10.0
  configuracoes?: ConfiguracoesPedido; // Baú técnico para restauração total da calculadora
  dataInicioAgendada?: string;
  posicaoFila?: number;
  codigoRastreio?: string;
  observacoesPublicas?: string;
}

export interface CriarPedidoInput {
  id?: string;
  idCliente?: string | null;
  descricao: string;
  status?: StatusPedido;
  valorCentavos: Centavos;
  prazoEntrega?: Date;
  observacoes?: string;
  material?: string;
  pesoGramas?: number;
  tempoMinutos?: number;
  idImpressora?: string;
  insumosSecundarios?: InsumoProjeto[];
  materiais?: MaterialProjeto[];
  posProcesso?: ItemPosProcesso[];
  configuracoes?: ConfiguracoesPedido;
  dataInicioAgendada?: string;
  posicaoFila?: number;
  codigoRastreio?: string;
  observacoesPublicas?: string;
}

export interface AtualizarPedidoInput extends Partial<CriarPedidoInput> {
  id: string;
  status?: StatusPedido;
  dataConclusao?: Date | string | null;
}
