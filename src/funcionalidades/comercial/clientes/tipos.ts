import { Centavos, StatusPedido, BaseLegalLGPD } from "@/compartilhado/tipos/modelos";

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
