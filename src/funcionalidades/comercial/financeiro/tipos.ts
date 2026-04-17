import { Centavos, TipoLancamentoFinanceiro } from "@/compartilhado/tipos/modelos";

export interface LancamentoFinanceiro {
  id: string;
  tipo: TipoLancamentoFinanceiro;
  valorCentavos: Centavos;
  descricao: string;
  dataCriacao: Date;
  idUsuario: string;
  categoria?: string;
  idReferencia?: string; // ID de um pedido, compra de insumo, etc.
  idCliente?: string; // ID do cliente vinculado
}

export interface CriarLancamentoInput {
  tipo: TipoLancamentoFinanceiro;
  valorCentavos: Centavos;
  descricao: string;
  categoria?: string;
  idReferencia?: string;
  idCliente?: string;
  data?: Date;
}

export interface ResumoFinanceiro {
  saldoTotalCentavos: Centavos;
  entradasMesCentavos: Centavos;
  saidasMesCentavos: Centavos;
}

export type OrdenacaoFinanceiro = "DATA" | "VALOR" | "DESCRICAO";

export const CATEGORIAS_FINANCEIRO = [
  "Limpeza",
  "Embalagem",
  "Fixação",
  "Eletrônica",
  "Acabamento",
  "Geral",
  "Outros",
] as const;
