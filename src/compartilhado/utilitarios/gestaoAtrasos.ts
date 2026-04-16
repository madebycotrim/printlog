import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { Pedido } from "@/funcionalidades/producao/projetos/tipos";

/**
 * Verifica se um pedido está em atraso.
 * Um pedido é considerado atrasado se o prazo de entrega já passou
 * e ele não está nos estados finais (CONCLUIDO ou ARQUIVADO).
 *
 * Regra v9.0: StatusPedido.ATRASADO é um estado derivado.
 */
export function verificarSeEstaAtrasado(pedido: Pedido): boolean {
  if (!pedido.prazoEntrega) return false;

  // Se já foi concluído ou arquivado, não está mais em atraso (o ciclo encerrou)
  if (pedido.status === StatusPedido.CONCLUIDO || pedido.status === StatusPedido.ARQUIVADO) {
    return false;
  }

  const agora = new Date();
  const prazo = new Date(pedido.prazoEntrega);

  // Definimos o deadline como o FINAL do dia do prazo (23:59:59)
  // para evitar que um pedido apareça como atrasado logo no início do dia do prazo.
  prazo.setHours(23, 59, 59, 999);

  // Se o prazo for menor que agora, está atrasado
  return prazo < agora;
}

/**
 * Filtra uma lista de pedidos retornando apenas os atrasados.
 */
export function filtrarPedidosAtrasados(pedidos: Pedido[]): Pedido[] {
  return pedidos.filter(verificarSeEstaAtrasado);
}
