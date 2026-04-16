import { Centavos, StatusPedido } from "@/compartilhado/tipos/modelos";

/**
 * Bases legais da LGPD (Art. 7º da Lei 13.709/2018).
 * Conforme Regra 9.0.
 */
export enum BaseLegalLGPD {
  CONSENTIMENTO = "consentimento", // Art. 7º, I
  OBRIGACAO_LEGAL = "obrigacao_legal", // Art. 7º, II
  EXECUCAO_CONTRATO = "execucao_contrato", // Art. 7º, V
  INTERESSE_LEGITIMO = "interesse_legitimo", // Art. 7º, IX
}

/**
 * Status do relacionamento comercial (CRM).
 */
export enum StatusComercial {
  PROSPECT = "Prospect",
  ATIVO = "Ativo",
  INATIVO = "Inativo",
  VIP = "VIP",
}

/**
 * Registro individual de histórico para o cliente.
 */
export interface RegistroHistoricoCliente {
  id: string;
  data: Date;
  descricao: string;
  valorCentavos: Centavos;
  status: StatusPedido; // Usando enum canônico conforme Regra 4
}

/**
 * Interface canônica de Cliente conforme Regra 9 (LGPD) e Rule 2 (Nomenclatura).
 *
 * @lgpd Retenção: 5 anos (obrigação fiscal/contábil).
 */
export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  dataCriacao: Date;
  dataAtualizacao: Date;

  // Métricas CRM
  ltvCentavos: Centavos;
  totalProdutos: number;
  fiel: boolean;
  statusComercial: StatusComercial;
  observacoesCRM?: string;
  historico?: RegistroHistoricoCliente[];

  // Colunas Obrigatórias LGPD (Regra 9.0)
  idConsentimento: string;
  baseLegal: BaseLegalLGPD;
  finalidadeColeta: string;
  prazoRetencaoMeses: number;
  anonimizado: boolean;
  dataAnonimizacao?: Date;
}

/** Opções de ordenação para a listagem */
export type OrdenacaoCliente = "NOME" | "RECENTE" | "LTV";
