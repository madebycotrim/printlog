import { z } from "zod";

export const configuracoesSchema = z.object({
  custoEnergia: z.string().min(1),
  horaMaquina: z.string().min(1),
  horaOperador: z.string().min(1),
  margemLucro: z.string().min(1),
  nomeEstudio: z.string().optional(),
  sloganEstudio: z.string().optional(),
  plano: z.enum(["FREE", "PRO"]).optional(),
});
