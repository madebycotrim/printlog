/**
 * @file notificacao.ts
 * @description Utilitário centralizado para disparo de toasts estilizados no PrintLog.
 * Padroniza tempos de exibição, ícones e suporte a ações interativas (como Desfazer).
 */

import { toast, type ExternalToast } from "sonner";
import { traduzirTextoGlobal } from "@/compartilhado/utilitarios/tradutorUniversalDOM";

export interface OpcoesNotificacao extends Omit<ExternalToast, "action"> {
  acao?: {
    rotulo: string;
    aoClicar: () => void;
  };
}

function normalizarOpcoes(opcoes?: OpcoesNotificacao): ExternalToast {
  if (!opcoes) return {};
  const { acao, ...resto } = opcoes;
  if (acao) {
    return {
      ...resto,
      action: {
        label: traduzirTextoGlobal(acao.rotulo),
        onClick: acao.aoClicar,
      },
    };
  }
  return resto;
}

export const notificar = {
  /** Notificação de sucesso (verde esmeralda neon) */
  sucesso(mensagem: string, opcoes?: OpcoesNotificacao) {
    return toast.success(traduzirTextoGlobal(mensagem), normalizarOpcoes(opcoes));
  },

  /** Notificação de erro ou falha crítica (rosa/vermelho neon) */
  erro(mensagem: string, opcoes?: OpcoesNotificacao) {
    return toast.error(traduzirTextoGlobal(mensagem), normalizarOpcoes(opcoes));
  },

  /** Notificação de aviso ou alerta operacional (âmbar/laranja neon) */
  aviso(mensagem: string, opcoes?: OpcoesNotificacao) {
    return toast.warning(traduzirTextoGlobal(mensagem), normalizarOpcoes(opcoes));
  },

  /** Notificação informativa geral (azul/ciano neon) */
  info(mensagem: string, opcoes?: OpcoesNotificacao) {
    return toast.info(traduzirTextoGlobal(mensagem), normalizarOpcoes(opcoes));
  },

  /** Notificação de operação em andamento com spinner */
  carregando(mensagem: string, opcoes?: OpcoesNotificacao) {
    return toast.loading(traduzirTextoGlobal(mensagem), normalizarOpcoes(opcoes));
  },

  /** Disparo de notificação genérica ou personalizada com ação rápida (ex: Desfazer) */
  acao(mensagem: string, acao: { rotulo: string; aoClicar: () => void }, opcoes?: Omit<OpcoesNotificacao, "acao">) {
    return toast(traduzirTextoGlobal(mensagem), {
      ...normalizarOpcoes(opcoes),
      action: {
        label: traduzirTextoGlobal(acao.rotulo),
        onClick: acao.aoClicar,
      },
    });
  },

  /** Fecha uma notificação específica por id ou todas se omitido */
  descartar(id?: string | number) {
    toast.dismiss(id);
  },
};
