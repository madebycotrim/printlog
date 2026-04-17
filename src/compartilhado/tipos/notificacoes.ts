/**
 * @file notificacoes.ts
 * @description Definições de tipos para o sistema de notificações global.
 * Conforme Regra 1.0 (PT-BR) e Regra 9.0 (Arquiteto Sênior).
 */

export enum TipoNotificacao {
  SUCESSO = "sucesso",
  ERRO = "erro",
  AVISO = "aviso",
  INFO = "info",
  CRITICO = "critico",
}

export enum CategoriaNotificacao {
  PRODUCAO = "producao",
  FINANCEIRO = "financeiro",
  MANUTENCAO = "manutencao",
  PEDIDOS = "pedidos",
  SISTEMA = "sistema",
}

export interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: TipoNotificacao;
  categoria: CategoriaNotificacao;
  data: Date;
  lida: boolean;
  link?: string;
  idReferencia?: string; // ID do pedido, impressora, etc.
}
