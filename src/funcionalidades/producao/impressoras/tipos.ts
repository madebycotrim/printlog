import { Centavos, StatusImpressora } from "../../../compartilhado/tipos/modelos";
export { StatusImpressora };

export enum TipoManutencao {
  PREVENTIVA = "Preventiva",
  CORRETIVA = "Corretiva",
  MELHORIA = "Melhoria",
}

export type TecnologiaImpressora = "FDM" | "SLA" | "DLP" | "LCD";

/** Perfil de impressora proveniente do catálogo público `impressoras.json` (Mapeado) */
export interface PerfilImpressoraCatalogo {
  marca: string;
  modelo: string;
  nome: string;
  consumoKw: number;
  tipo: string;
  imagem: string;
}

export interface RegistroManutencao {
  id: string;
  idImpressora: string;
  data: string;
  tipo: TipoManutencao;
  descricao: string;
  pecasTrocadas?: string;
  custoCentavos: Centavos;
  responsavel: string;
  tempoParadaMinutos: number;
  horasMaquinaNoMomentoMinutos: number;
}

export interface RegistrarManutencaoInput {
  id?: string;
  idImpressora: string;
  tipo: TipoManutencao;
  descricao: string;
  custoCentavos: Centavos;
  tempoParadaMinutos: number;
  pecasTrocadas?: string[];
}

export interface PecaDesgaste {
  id: string;
  idImpressora: string;
  nome: string;
  horasUsoAtualMinutos: number;
  vidaUtilMinutos: number;
  dataUltimaTroca: string;
}

export interface RegistroProducao {
  idProtocolo: string;
  nomeProjeto: string;
  minutosImpressao: number;
  valorGeradoCentavos: Centavos;
  dataConclusao: string;
  sucesso: boolean;
  consumoMaterialGramas?: number;
}

export interface Impressora {
  id: string;
  nome: string;
  tecnologia: TecnologiaImpressora;
  /** Aplicável apenas para tecnologia FDM */
  diametroBicoAtualMm?: number;
  /** Aplicável apenas para tecnologias de Resina (SLA/DLP/LCD) */
  tamanhoTela?: string;
  status: StatusImpressora;
  observacoes?: string;
  /** Marca da fabricante, vinda do catálogo */
  marca?: string;
  /** Modelo base selecionado no catálogo */
  modeloBase?: string;
  /** URL da imagem oficial da impressora */
  imagemUrl?: string;
  /** Consumo em kW/h, vindo do catálogo */
  consumoKw?: number;
  /** Potência em Watts */
  potenciaWatts?: number;
  /** Valor de compra em centavos */
  valorCompraCentavos?: Centavos;
  /** Taxa hora da máquina em centavos (por hora de uso) */
  taxaHoraCentavos?: Centavos;
  /** Horímetro total em minutos de uso acumulado */
  horimetroTotalMinutos?: number;
  /** Intervalo em minutos entre revisões preventivas */
  intervaloRevisaoMinutos?: number;
  /** Rastreamento de consumíveis críticos */
  pecasDesgaste?: PecaDesgaste[];
  /** Histórico de projetos produzidos nesta impressora */
  historicoProducao?: RegistroProducao[];
  /** Histórico de Manutenção da Impressora */
  historicoManutencao?: RegistroManutencao[];
  /** Data da Aposentadoria (Soft Delete) */
  dataAposentadoria?: string;
  dataCriacao: Date;
  dataAtualizacao: Date;

  // ── Métricas de Desempenho e Financeiro ───────────────────────────────────
  /** Total de projetos concluídos nesta impressora */
  totalProjetosConcluidos?: number;
  /** Receita bruta gerada por esta impressora (em centavos) */
  receitaAcumuladaCentavos?: Centavos;
  /** Custo de energia elétrica acumulado (em centavos) */
  custoEnergiaCentavos?: Centavos;
  /** ROI calculado: (receitaAcumulada - custoCompra) / custoCompra * 100 */
  roiPercentual?: number;
}
