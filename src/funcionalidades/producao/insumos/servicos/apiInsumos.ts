import { Insumo, RegistroMovimentacaoInsumo } from "../tipos";

/**
 * Serviço de integração com o Cloudflare D1 via Pages Functions.
 * Gerencia a persistência de Insumos da Produção.
 */
export const apiInsumos = {
  /**
   * Busca todos os insumos do usuário
   */
  async listar(usuarioId: string): Promise<Insumo[]> {
    const resposta = await fetch("/api/insumos", {
      headers: { "x-usuario-id": usuarioId }
    });
    if (!resposta.ok) throw new Error("Falha ao carregar insumos.");
    return await resposta.json();
  },

  /**
   * Salva um novo insumo
   */
  async salvar(insumo: Insumo, usuarioId: string): Promise<void> {
    const resposta = await fetch("/api/insumos", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-usuario-id": usuarioId 
      },
      body: JSON.stringify(insumo)
    });
    if (!resposta.ok) throw new Error("Erro ao salvar insumo.");
  },

  /**
   * Atualiza estoque/custo e registra movimentação
   */
  async atualizar(insumo: Partial<Insumo> & { id: string }, usuarioId: string, movimentacao?: RegistroMovimentacaoInsumo): Promise<void> {
    const resposta = await fetch("/api/insumos", {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "x-usuario-id": usuarioId 
      },
      body: JSON.stringify({ ...insumo, movimentacao })
    });
    if (!resposta.ok) throw new Error("Erro ao atualizar insumo.");
  },

  /**
   * Remove um insumo do banco de dados
   */
  async remover(id: string, usuarioId: string): Promise<void> {
    const resposta = await fetch(`/api/insumos?id=${id}`, {
      method: "DELETE",
      headers: { "x-usuario-id": usuarioId }
    });
    if (!resposta.ok) throw new Error("Erro ao remover insumo.");
  }
};
