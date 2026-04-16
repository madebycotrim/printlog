/**
 * @file servicoIntegracaoLanding.ts
 * @description Serviço para capturar pedidos vindos da Landing Page e integrá-los ao sistema.
 * @version 1.0 (Fase 2)
 */

import { servicoPedidos } from "@/funcionalidades/producao/projetos/servicos/servicoPedidos";
import { registrar } from "@/compartilhado/utilitarios/registrador";
import { BaseLegalLGPD, StatusComercial } from "../tipos";
import { usarArmazemClientes } from "../estado/armazemClientes";

export interface DadosPedidoLanding {
  nomeCliente: string;
  emailCliente: string;
  telefoneCliente: string;
  descricaoProjeto: string;
  arquivoNome?: string;
}

export const servicoIntegracaoLanding = {
  /**
   * Simula o recebimento de uma requisição da Landing Page.
   * Em produção, isso seria um Webhook ou endpoint de API.
   */
  receberNovoPedido: async (dados: DadosPedidoLanding) => {
    const rastreioId = crypto.randomUUID();
    registrar.info({ rastreioId, email: dados.emailCliente }, "Novo pedido recebido via Landing Page");

    try {
      // 1. Verificar se o cliente já existe
      const storeClientes = usarArmazemClientes.getState();
      let cliente = storeClientes.clientes.find((c) => c.email === dados.emailCliente);

      if (!cliente) {
        // Criar cliente Prospect (LGPD: Consentimento via Formulário)
        cliente = {
          id: crypto.randomUUID(),
          nome: dados.nomeCliente,
          email: dados.emailCliente,
          telefone: dados.telefoneCliente,
          dataCriacao: new Date(),
          dataAtualizacao: new Date(),
          ltvCentavos: 0,
          totalProdutos: 0,
          fiel: false,
          statusComercial: StatusComercial.PROSPECT,
          observacoesCRM: `Originado via Landing Page. Projeto: ${dados.descricaoProjeto}`,

          // LGPD
          idConsentimento: crypto.randomUUID(),
          baseLegal: BaseLegalLGPD.CONSENTIMENTO,
          finalidadeColeta: "Orçamento de projeto via Landing Page",
          prazoRetencaoMeses: 60,
          anonimizado: false,
        };
        storeClientes.definirClientes([...storeClientes.clientes, cliente]);
        registrar.info({ rastreioId, idCliente: cliente.id }, "Novo cliente Prospect criado via Landing Page");
      }

      // 2. Criar o pedido (A_FAZER)
      const novoPedido = await servicoPedidos.criarPedido({
        idCliente: cliente.id,
        descricao: `[LANDING] ${dados.descricaoProjeto}`,
        valorCentavos: 0, // Orçamento pendente
        observacoes: `Arquivo original: ${dados.arquivoNome || "Não informado"}`,
        prazoEntrega: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 dias
      });

      registrar.info({ rastreioId, idPedido: novoPedido.id }, "Pedido da Landing Page integrado com sucesso");
      return { sucesso: true, idPedido: novoPedido.id };
    } catch (erro) {
      registrar.error({ rastreioId, dados }, "Falha ao integrar pedido da Landing Page", erro);
      throw erro;
    }
  },
};
