import { z } from "zod";
import { BaseLegalLGPD, StatusComercial } from "./tipos";

/**
 * Esquema de validação para Clientes (Zod)
 * Segue as regras da LGPD e as necessidades do CRM.
 */
export const esquemaCliente = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, "O nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(1, "O telefone é obrigatório"),
  ltvCentavos: z.number().int().min(0).optional(),
  totalProdutos: z.number().int().min(0).optional(),
  fiel: z.boolean().optional(),
  statusComercial: z.nativeEnum(StatusComercial),
  observacoesCRM: z.string().optional(),
  idConsentimento: z.string().optional(),
  baseLegal: z.nativeEnum(BaseLegalLGPD),
  finalidadeColeta: z.string().min(1, "A finalidade é obrigatória"),
  prazoRetencaoMeses: z.number().int().min(1),
  anonimizado: z.boolean().optional(),
  historico: z.array(z.any()).optional(),
});

/**
 * Tipo extraído do esquema para uso no React Hook Form
 */
export type TipoDadosCliente = z.infer<typeof esquemaCliente>;
