/**
 * @file servicoNotificacoes.ts
 * @description Orquestrador de alertas e notificações do sistema.
 * Verifica periodicamente a saúde do parque e prazos de pedidos.
 */

import { Pedido } from "@/funcionalidades/producao/projetos/tipos";
import { Impressora } from "@/funcionalidades/producao/impressoras/tipos";
import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { TipoNotificacao, CategoriaNotificacao } from "@/compartilhado/tipos/notificacoes";
import { useArmazemNotificacoes } from "@/compartilhado/estado/armazemNotificacoes";
import { servicoPredicaoManutencao } from "@/funcionalidades/producao/manutencao/preditiva/servicos/servicoPredicaoManutencao";

export const servicoNotificacoes = {
  /**
   * Varre o sistema em busca de inconsistências ou prazos críticos.
   */
  processarAlertasAutomaticos: (pedidos: Pedido[], impressoras: Impressora[]) => {
    const { adicionarNotificacao, notificacoes } = useArmazemNotificacoes.getState();
    const agora = new Date();

    // 1. Verificação de Pedidos Atrasados
    pedidos.forEach((pedido) => {
      if (pedido.status !== StatusPedido.CONCLUIDO && pedido.status !== StatusPedido.ARQUIVADO && pedido.prazoEntrega) {
        const prazo = new Date(pedido.prazoEntrega);
        if (prazo < agora) {
          // Evita notificações duplicadas para o mesmo evento
          const javaExiste = notificacoes.some(
            (n) => n.idReferencia === pedido.id && n.tipo === TipoNotificacao.CRITICO && !n.lida,
          );

          if (!javaExiste) {
            adicionarNotificacao({
              titulo: "Pedido Atrasado 🚨",
              mensagem: `O pedido #${pedido.id.substring(0, 8)} de ${pedido.nomeCliente || "Cliente"} ultrapassou o prazo.`,
              tipo: TipoNotificacao.CRITICO,
              categoria: CategoriaNotificacao.PEDIDOS,
              idReferencia: pedido.id,
              link: `/producao`,
            });
          }
        }
      }
    });

    // 2. Verificação de Manutenção Crítica
    const agenda = servicoPredicaoManutencao.gerarAgendaPreditiva(impressoras);
    agenda
      .filter((item) => item.status === "critico")
      .forEach((item) => {
        const jaExiste = notificacoes.some(
          (n) => n.idReferencia === item.idImpressora && n.titulo.includes(item.nomeItem) && !n.lida,
        );

        if (!jaExiste) {
          adicionarNotificacao({
            titulo: `Manutenção Crítica: ${item.nomeImpressora}`,
            mensagem: `O item "${item.nomeItem}" atingiu o limite de vida útil.`,
            tipo: TipoNotificacao.CRITICO,
            categoria: CategoriaNotificacao.MANUTENCAO,
            idReferencia: item.idImpressora,
            link: `/impressoras`,
          });
        }
      });
  },
};
