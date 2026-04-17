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
}

export interface CriarPedidoInput {
  idCliente: string;
  descricao: string;
  valorCentavos: Centavos;
  prazoEntrega?: Date;
  observacoes?: string;
  material?: string;
  pesoGramas?: number;
  tempoMinutos?: number;
  idImpressora?: string;
  insumosSecundarios?: InsumoProjeto[];
}

export interface AtualizarPedidoInput extends Partial<CriarPedidoInput> {
  id: string;
  status?: StatusPedido;
}
