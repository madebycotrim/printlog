import { Material } from "../tipos";
import { servicoBaseApi } from "@/compartilhado/servicos/servicoBaseApi";
import { materialSchema, registroUsoSchema } from "../esquemas";

/**
 * Serviço de integração com o Cloudflare D1 via Pages Functions.
 * Refatorado para usar o servicoBaseApi com autenticação segura via Token e validação Zod.
 */
export const apiMateriais = {
  /**
   * Busca todos os materiais do usuário e mapeia para camelCase
   */
  async listar(_usuarioId: string): Promise<Material[]> {
    const dadosInternos = await servicoBaseApi.get<any[]>("/api/materiais");

    return dadosInternos.map(this.mapearMaterial);
  },

  /**
   * Busca materiais com suporte a paginação e busca no backend (D1)
   */
  async listarPaginado(parametros: { limit: number; offset: number; search?: string }): Promise<{ items: Material[]; total: number }> {
    let url = `/api/materiais?limit=${parametros.limit}&offset=${parametros.offset}`;
    if (parametros.search) {
      url += `&search=${encodeURIComponent(parametros.search)}`;
    }

    const resposta = await servicoBaseApi.get<{ items: any[]; total: number }>(url);
    return {
      items: (resposta.items || []).map(this.mapearMaterial),
      total: resposta.total || 0
    };
  },

  /**
   * Função auxiliar para converter do banco para o Frontend
   */
  mapearMaterial(m: any): Material {
    return {
      id: m.id,
      tipo: m.tipo,
      nome: m.nome,
      tipoMaterial: m.tipo_material ?? undefined,
      fabricante: m.fabricante,
      cor: m.cor,
      precoCentavos: m.preco_centavos ?? undefined,
      pesoGramas: m.peso_gramas ?? undefined,
      estoque: m.estoque_unidades ?? undefined,
      pesoRestanteGramas: m.peso_restante_gramas ?? undefined,
      arquivado: m.arquivado === 1,
      favorito: m.favorito === 1,
      dataCriacao: new Date(m.data_criacao),
      dataAtualizacao: m.data_atualizacao ? new Date(m.data_atualizacao) : new Date(),
      historicoUso: (typeof m.historicoUso === 'string' 
        ? JSON.parse(m.historicoUso) 
        : (m.historicoUso || [])).map((h: any) => ({
        id: h.id,
        data: h.data,
        nomePeca: h.nome_peca || h.nomePeca,
        quantidadeGastaGramas: h.quantidade_gasta_gramas || h.quantidadeGastaGramas,
        status: h.status
      }))
    };
  },

  /**
   * Salva um novo material ou atualiza um existente com validação de segurança
   */
  async salvar(material: Material, _usuarioId: string, eEdicao?: boolean): Promise<void> {
    const metodo = eEdicao === undefined ? (material.id ? "PATCH" : "POST") : (eEdicao ? "PATCH" : "POST");

    // Validação de segurança no cliente
    const dadosValidados = materialSchema.parse(material);

    const payload = {
      ...dadosValidados,
      tipoMaterial: material.tipoMaterial ?? null,
      precoCentavos: material.precoCentavos ?? null,
      pesoGramas: material.pesoGramas ?? null,
      estoque: material.estoque ?? null,
      pesoRestanteGramas: material.pesoRestanteGramas ?? null,
      arquivado: material.arquivado ? 1 : 0
    };

    await servicoBaseApi.requisicao("/api/materiais", {
      method: metodo,
      body: JSON.stringify(payload)
    });
  },

  /**
   * Atualiza peso ou estoque de um material com validação de segurança
   */
  async atualizar(material: Partial<Material> & { id: string }, _usuarioId: string, registroUso?: any): Promise<void> {
    const materialValidado = materialSchema.partial().parse(material);
    
    // Mantém as chaves originais, o Worker espera camelCase!
    const payload: any = { 
      id: material.id,
      tipo: materialValidado.tipo ?? null,
      nome: materialValidado.nome ?? null,
      tipoMaterial: materialValidado.tipoMaterial ?? null,
      fabricante: materialValidado.fabricante ?? null,
      cor: materialValidado.cor ?? null,
      precoCentavos: materialValidado.precoCentavos ?? null,
      pesoGramas: materialValidado.pesoGramas ?? null,
      estoque: materialValidado.estoque ?? null,
      pesoRestanteGramas: materialValidado.pesoRestanteGramas ?? null,
      arquivado: materialValidado.arquivado !== undefined ? (materialValidado.arquivado ? 1 : 0) : null
    };
    
    // Se houver registro de uso, valida e envia separadamente (o Worker processa o INSERT na tabela auxiliar)
    if (registroUso) {
      const registroValidado = registroUsoSchema.parse(registroUso);
      payload.registroUso = {
        data: registroValidado.data,
        nomePeca: registroValidado.nomePeca,
        quantidadeGastaGramas: registroValidado.quantidadeGastaGramas,
        status: registroValidado.status
      };
    }

    await servicoBaseApi.requisicao("/api/materiais", {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  },

  /**
   * Remove um material (arquivamento) de forma segura
   */
  async remover(id: string, _usuarioId: string): Promise<void> {
    await servicoBaseApi.delete(`/api/materiais?id=${id}`);
  }
};
