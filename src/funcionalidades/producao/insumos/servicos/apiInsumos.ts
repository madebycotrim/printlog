import { Insumo, RegistroMovimentacaoInsumo } from "../tipos";
import { servicoBaseApi } from "@/compartilhado/servicos/servicoBaseApi";
import { insumoSchema, registroMovimentacaoInsumoSchema } from "../esquemas";

const mapearInsumo = (i: any): Insumo => ({
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
  icone: i.icone,
  historico: typeof i.historico === 'string' ? JSON.parse(i.historico) : (i.historico || []),
  dataCriacao: new Date(i.data_criacao || i.dataCriacao),
  dataAtualizacao: new Date(i.data_atualizacao || i.dataAtualizacao)
});

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
    return dados.map(mapearInsumo);
  },

  /**
   * Busca os insumos paginados
   */
  async listarPaginado({ limit, offset, search }: { limit: number, offset: number, search?: string }): Promise<{ items: Insumo[], total: number }> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });
    if (search) {
      params.append("search", search);
    }
    
    const dados = await servicoBaseApi.get<any>(`/api/insumos?${params.toString()}`);
    return {
      items: dados.items.map(mapearInsumo),
      total: dados.total
    };
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
      nome: insumoValidado.nome ?? null,
      descricao: insumoValidado.descricao ?? null,
      categoria: insumoValidado.categoria ?? null,
      icone: insumoValidado.icone ?? null,
      link_compra: insumoValidado.linkCompra ?? null,
      unidade_medida: insumoValidado.unidadeMedida ?? null,
      unidade_consumo: insumoValidado.unidadeConsumo ?? null,
      item_fracionavel: insumoValidado.itemFracionavel !== undefined ? (insumoValidado.itemFracionavel ? 1 : 0) : null,
      rendimento_total: insumoValidado.rendimentoTotal ?? null,
      quantidade_atual: insumoValidado.quantidadeAtual ?? null,
      quantidade_minima: insumoValidado.quantidadeMinima ?? null,
      custo_medio_unidade: insumoValidado.custoMedioUnidade ?? null,
      data_atualizacao: new Date().toISOString(),
      movimentacao: movValidada ? {
        ...movValidada,
        valorTotal: movValidada.valorTotal ?? null
      } : null
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
