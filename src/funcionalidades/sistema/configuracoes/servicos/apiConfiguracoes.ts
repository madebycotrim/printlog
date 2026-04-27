import { servicoBaseApi } from "@/compartilhado/servicos/servicoBaseApi";
import { configuracoesSchema } from "../esquemas";

export type PlanoUsuario = "FREE" | "PRO" | "FUNDADOR";

export interface ConfiguracoesSalvas {
  custoEnergia: string;
  horaMaquina: string;
  horaOperador: string;
  margemLucro: string;
  nomeEstudio?: string;
  sloganEstudio?: string;
  plano?: PlanoUsuario;
  cicloPagamento?: string;
  vencimentoPlano?: string | null;
}

/**
 * Serviço de comunicação com a API de Configurações Operacionais do D1.
 * Refatorado para usar o servicoBaseApi com autenticação segura via Token e validação Zod.
 */
export const apiConfiguracoes = {
  /**
   * Busca as configurações operacionais do usuário no D1 de forma segura.
   */
  async buscar(_usuarioId: string): Promise<ConfiguracoesSalvas> {
    return servicoBaseApi.get<ConfiguracoesSalvas>("/api/configuracoes");
  },

  /**
   * Salva (upsert) as configurações operacionais no D1 com validação de segurança.
   */
  async salvar(dados: ConfiguracoesSalvas, _usuarioId: string): Promise<void> {
    // Validação de segurança no cliente
    const dadosValidados = configuracoesSchema.parse(dados);

    await servicoBaseApi.put("/api/configuracoes", dadosValidados);
  },
};
