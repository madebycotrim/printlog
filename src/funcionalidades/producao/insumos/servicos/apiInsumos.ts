import { Insumo, RegistroMovimentacaoInsumo } from "../tipos";
import { servicoBaseApi } from "@/compartilhado/servicos/servicoBaseApi";
import { insumoSchema, registroMovimentacaoInsumoSchema } from "../esquemas";

/**
 * Serviço de integração com o Cloudflare D1 via Pages Functions.
 * Refatorado para usar o servicoBaseApi com autenticação segura via Token e validação Zod.
 */
export const apiInsumos = {
  /**
   * Busca todos os insumos do usuário
   */
  async listar(_usuarioId: string): Promise<Insumo[]> {
    const dados = await servicoBaseApi.get<any[]>("/api/insumos");
    
    // Mapeia de snake_case (D1) para camelCase (Frontend)
    return dados.map(i => ({
      id: i.id,
      nome: i.nome,
      descricao: i.descricao,
      categoria: i.categoria,
      marca: i.marca,
      linkCompra: i.link_compra || i.linkCompra,
      unidadeMedida: i.unidade_medida || i.unidadeMedida,
      unidadeConsumo: i.unidade_consumo || i.unidadeConsumo,
      itemFracionavel: Boolean(i.item_fracionavel ?? i.itemFracionavel),
      rendimentoTotal: i.rendimento_total ?? i.rendimentoTotal,
      quantidadeAtual: i.quantidade_atual ?? i.quantidadeAtual,
      quantidadeMinima: i.quantidade_minima ?? i.quantidadeMinima,
      custoMedioUnidade: i.custo_medio_unidade ?? i.custoMedioUnidade,
      historico: typeof i.historico === 'string' ? JSON.parse(i.historico) : (i.historico || []),
      dataCriacao: new Date(i.data_criacao || i.dataCriacao),
      dataAtualizacao: new Date(i.data_atualizacao || i.dataAtualizacao)
    }));
  },

  /**
   * Salva um novo insumo com validação de segurança e mapeamento para o D1
   */
  async salvar(insumo: Insumo, _usuarioId: string): Promise<void> {
    const dadosValidados = insumoSchema.parse(insumo);
    
    // Mapeia para snake_case antes de enviar para o D1
    const paraBanco = {
      ...dadosValidados,
      id_usuario: _usuarioId,
      link_compra: dadosValidados.linkCompra,
      unidade_medida: dadosValidados.unidadeMedida,
      unidade_consumo: dadosValidados.unidadeConsumo,
      item_fracionavel: dadosValidados.itemFracionavel ? 1 : 0,
      rendimento_total: dadosValidados.rendimentoTotal,
      quantidade_atual: dadosValidados.quantidadeAtual,
      quantidade_minima: dadosValidados.quantidadeMinima,
      custo_medio_unidade: dadosValidados.custoMedioUnidade,
      data_criacao: insumo.dataCriacao.toISOString(),
      data_atualizacao: insumo.dataAtualizacao.toISOString(),
      historico: JSON.stringify(insumo.historico || [])
    };

    await servicoBaseApi.post("/api/insumos", paraBanco);
  },

  /**
   * Atualiza estoque/custo e registra movimentação com validação de segurança
   */
  async atualizar(insumo: Partial<Insumo> & { id: string }, _usuarioId: string, movimentacao?: RegistroMovimentacaoInsumo): Promise<void> {
    const insumoValidado = insumoSchema.partial().parse(insumo);
    const movValidada = movimentacao ? registroMovimentacaoInsumoSchema.parse(movimentacao) : undefined;

    // Mapeia campos de atualização para snake_case
    const paraBanco = {
      id: insumo.id,
      nome: insumoValidado.nome,
      descricao: insumoValidado.descricao,
      categoria: insumoValidado.categoria,
      link_compra: insumoValidado.linkCompra,
      unidade_medida: insumoValidado.unidadeMedida,
      unidade_consumo: insumoValidado.unidadeConsumo,
      item_fracionavel: insumoValidado.itemFracionavel !== undefined ? (insumoValidado.itemFracionavel ? 1 : 0) : undefined,
      rendimento_total: insumoValidado.rendimentoTotal,
      quantidade_atual: insumoValidado.quantidadeAtual,
      quantidade_minima: insumoValidado.quantidadeMinima,
      custo_medio_unidade: insumoValidado.custoMedioUnidade,
      data_atualizacao: new Date().toISOString(),
      movimentacao: movValidada ? {
        ...movValidada,
        valor_total: movValidada.valorTotal
      } : undefined
    };

    await servicoBaseApi.requisicao("/api/insumos", {
      method: "PATCH",
      body: JSON.stringify(paraBanco)
    });
  },

  /**
   * Remove um insumo do banco de dados de forma segura
   */
  async remover(id: string, _usuarioId: string): Promise<void> {
    await servicoBaseApi.delete(`/api/insumos?id=${id}`);
  }
};
