import {
  Cliente,
  RegistroHistoricoCliente,
  StatusComercial,
  BaseLegalLGPD,
} from "@/funcionalidades/comercial/clientes/tipos";
import { StatusPedido } from "@/compartilhado/tipos/modelos";

/**
 * Fabrica um objeto Cliente para testes.
 * @param override Valores para sobrescrever o padrão.
 */
export function fabricarCliente(override?: Partial<Cliente>): Cliente {
  return {
    id: crypto.randomUUID(),
    nome: "Cliente de Teste",
    email: "teste@printlog.com.br",
    telefone: "(11) 99999-9999",
    dataCriacao: new Date(),
    dataAtualizacao: new Date(),
    ltvCentavos: 1550, // R$ 15,50
    totalProdutos: 1,
    fiel: false,
    statusComercial: StatusComercial.PROSPECT,
    idConsentimento: crypto.randomUUID(),
    baseLegal: BaseLegalLGPD.EXECUCAO_CONTRATO,
    finalidadeColeta: "Gestão de pedidos para testes unitários.",
    prazoRetencaoMeses: 60,
    anonimizado: false,
    ...override,
  };
}

/**
 * Fabrica um registro de histórico para testes.
 */
export function fabricarRegistroHistorico(override?: Partial<RegistroHistoricoCliente>): RegistroHistoricoCliente {
  return {
    id: crypto.randomUUID(),
    data: new Date(),
    descricao: "Pedido de Teste",
    valorCentavos: 1000,
    status: StatusPedido.CONCLUIDO,
    ...override,
  };
}
