import { Centavos } from "@/compartilhado/tipos/modelos";

export enum TipoManutencao {
  PREVENTIVA = "Preventiva",
  CORRETIVA = "Corretiva",
  MELHORIA = "Melhoria",
}

export interface Manutencao {
  id: string;
  idUsuario: string;
  idImpressora: string;
  data: Date;
  tipo: TipoManutencao;
  descricao: string;
  custoCentavos: Centavos;
  tempoParadaMinutos: number;
}

export interface PecaDesgaste {
  id: string;
  idUsuario: string;
  idImpressora: string;
  nome: string;
  minutosUsoAtual: number;
  vidaUtilEstimadaMinutos: number;
}

export interface RegistrarManutencaoInput {
  idImpressora: string;
  tipo: TipoManutencao;
  descricao: string;
  custoCentavos: Centavos;
  tempoParadaMinutos: number;
  pecasTrocadas?: string[]; // IDs das peças que foram resetadas nesta manutenção
}
