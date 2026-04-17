import { Material } from "../tipos";

/**
 * Serviço de integração com o Cloudflare D1 via Pages Functions.
 * Responsável por persistir todos os dados de Materiais e Histórico.
 */
export const apiMateriais = {
  /**
   * Busca todos os materiais do usuário
   */
  async listar(usuarioId: string): Promise<Material[]> {
    const resposta = await fetch("/api/materiais", {
      headers: { "x-usuario-id": usuarioId }
    });
    if (!resposta.ok) throw new Error("Falha ao carregar materiais do servidor.");
    return await resposta.json();
  },

  /**
   * Salva um novo material ou atualiza um existente
   */
  async salvar(material: Material, usuarioId: string): Promise<void> {
    const resposta = await fetch("/api/materiais", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-usuario-id": usuarioId 
      },
      body: JSON.stringify(material)
    });
    if (!resposta.ok) throw new Error("Erro ao salvar material no banco de dados.");
  },

  /**
   * Atualiza peso ou estoque de um material
   */
  async atualizar(material: Partial<Material> & { id: string }, usuarioId: string, registroUso?: any): Promise<void> {
    const resposta = await fetch("/api/materiais", {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "x-usuario-id": usuarioId 
      },
      body: JSON.stringify({ ...material, registroUso })
    });
    if (!resposta.ok) throw new Error("Erro ao atualizar dados no banco de dados.");
  },

  /**
   * Remove um material permanentemente
   */
  async remover(id: string, usuarioId: string): Promise<void> {
    const resposta = await fetch(`/api/materiais?id=${id}`, {
      method: "DELETE",
      headers: { "x-usuario-id": usuarioId }
    });
    if (!resposta.ok) throw new Error("Erro ao remover material do banco.");
  }
};
