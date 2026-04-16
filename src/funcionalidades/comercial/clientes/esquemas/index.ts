import { z } from "zod";
import { StatusComercial, BaseLegalLGPD } from "../tipos";

/**
 * Esquema de validação para cadastro/edição de clientes.
 * Segue restrições de negócio e obrigações LGPD (Regra 9.0).
 */
export const esquemaCliente = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(10, "Telefone inválido (mínimo 10 dígitos)"),

  // CRM
  statusComercial: z.nativeEnum(StatusComercial).default(StatusComercial.PROSPECT),
  observacoesCRM: z.string().optional(),

  // LGPD (Regra 9.0)
  baseLegal: z.nativeEnum(BaseLegalLGPD).default(BaseLegalLGPD.EXECUCAO_CONTRATO),
  finalidadeColeta: z.string().min(10, "A finalidade da coleta deve ser explícita"),
  prazoRetencaoMeses: z.number().int().min(1).default(60), // Padrão fiscal de 5 anos
});

export type TipoDadosCliente = z.infer<typeof esquemaCliente>;
