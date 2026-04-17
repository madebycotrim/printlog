import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { Pedido } from "@/funcionalidades/producao/projetos/tipos";

/**
 * Fábrica para criar objetos de Pedido sintéticos para testes.
 * Segue o Padrão AAA e as Regras de Negócio v9.0.
 */
export function fabricarPedidoImpressao(override: Partial<Pedido> = {}): Pedido {
  return {
    id: crypto.randomUUID(),
    idUsuario: "usuario-teste",
    idCliente: "cliente-teste",
    nomeCliente: "Cliente de Teste",
    descricao: "Descrição do Pedido de Teste",
    status: StatusPedido.A_FAZER,
    valorCentavos: 15000, // R$ 150,00
    dataCriacao: new Date(),
    prazoEntrega: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 dias
    ...override,
  };
}
