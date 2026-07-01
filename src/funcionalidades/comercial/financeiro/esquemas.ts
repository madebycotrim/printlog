import { z } from "zod";
import { TipoLancamentoFinanceiro } from "@/compartilhado/tipos/modelos";

export const criarLancamentoSchema = z.object({
  tipo: z.nativeEnum(TipoLancamentoFinanceiro),
  valorCentavos: z.number().int().min(0),
  descricao: z.string().min(1),
  categoria: z.string().optional(),
  idPedido: z.string().optional(),
  idReferencia: z.string().optional(),
  idCliente: z.string().optional(),
  data: z.date().or(z.string().transform((val) => new Date(val))).optional(),
  id: z.string().optional(),
});
