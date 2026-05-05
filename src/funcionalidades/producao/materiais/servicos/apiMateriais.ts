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

    return dadosInternos.map((m: any) => ({
      id: m.id,
      tipo: m.tipo,
      nome: m.nome,
      tipoMaterial: m.tipo_material,
      fabricante: m.fabricante,
      cor: m.cor,
      precoCentavos: m.preco_centavos,
      pesoGramas: m.peso_gramas,
      estoque: m.estoque_unidades,
      pesoRestanteGramas: m.peso_restante_gramas,
      arquivado: m.arquivado === 1,
      historicoUso: (m.historicoUso || []).map((h: any) => ({
        id: h.id,
        data: h.data,
        nomePeca: h.nome_peca,
        quantidadeGastaGramas: h.quantidade_gasta_gramas,
        tempoImpressaoMinutos: h.tempo_impressao_minutos,
        status: h.status
      }))
    }));
  },

  /**
   * Salva um novo material ou atualiza um existente com validação de segurança
   */
  async salvar(material: Material, _usuarioId: string, eEdicao?: boolean): Promise<void> {
    const metodo = eEdicao === undefined ? (material.id ? "PATCH" : "POST") : (eEdicao ? "PATCH" : "POST");

    // Validação de segurança no cliente
    const dadosValidados = materialSchema.parse(material);

    // Mapeamento inverso para o banco (camelCase -> snake_case)
    const payload = {
      ...dadosValidados,
      tipo_material: material.tipoMaterial,
      preco_centavos: material.precoCentavos,
      peso_gramas: material.pesoGramas,
      estoque_unidades: material.estoque,
      peso_restante_gramas: material.pesoRestanteGramas,
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
    
    // Mapeamento para snake_case (D1)
    const payload: any = { 
      id: material.id,
      tipo: materialValidado.tipo,
      nome: materialValidado.nome,
      tipo_material: materialValidado.tipoMaterial,
      fabricante: materialValidado.fabricante,
      cor: materialValidado.cor,
      preco_centavos: materialValidado.precoCentavos,
      peso_gramas: materialValidado.pesoGramas,
      estoque_unidades: materialValidado.estoque,
      peso_restante_gramas: materialValidado.pesoRestanteGramas,
      arquivado: materialValidado.arquivado !== undefined ? (materialValidado.arquivado ? 1 : 0) : null
    };
    
    // Se houver registro de uso, valida e mapeia
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
