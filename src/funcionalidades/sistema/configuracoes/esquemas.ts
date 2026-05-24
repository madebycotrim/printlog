import { z } from "zod";

export const configuracoesSchema = z.object({
  custoEnergia: z.number().int(),
  horaMaquina: z.number().int(),
  horaOperador: z.number().int(),
  margemLucro: z.number().int(),
  nomeEstudio: z.string().optional(),
  sloganEstudio: z.string().optional(),
  logoEstudio: z.string().optional(),
  plano: z.enum(["FREE", "PRO", "FUNDADOR"]).optional(),
});
