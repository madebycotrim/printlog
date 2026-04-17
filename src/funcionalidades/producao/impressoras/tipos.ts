import { Centavos, StatusImpressora } from "../../../compartilhado/tipos/modelos";
export { StatusImpressora };

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
  data: string;
  tipo: "Preventiva" | "Corretiva" | "Melhoria";
  descricao: string;
  pecasTrocadas?: string;
  custoCentavos: Centavos;
  responsavel: string;
  tempoParadaMinutos: number;
  horasMaquinaNoMomentoMinutos: number;
}

export interface PecaDesgaste {
  id: string;
  nome: string;
  minutosTrocado: number;
  vidaUtilEstimadaMinutos: number;
  dataInclusao: string;
}

export interface RegistroProducao {
  idProtocolo: string;
  nomeProjeto: string;
  minutosImpressao: number;
  valorGeradoCentavos: Centavos;
  dataConclusao: string;
  sucesso: boolean;
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
  /** Simulação de histórico de produção vinculada */
  historicoProducao?: RegistroProducao[];
  /** Histórico de Manutenção da Impressora */
  historicoManutencao?: RegistroManutencao[];
  /** Data da Aposentadoria (Soft Delete) */
  dataAposentadoria?: string;
  dataCriacao: Date;
  dataAtualizacao: Date;
}
