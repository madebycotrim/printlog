import { z } from "zod";
import { StatusPedido } from "@/compartilhado/tipos/modelos";

export const insumoProjetoSchema = z.object({
  idInsumo: z.string().uuid().or(z.string()),
  nome: z.string().min(1),
  quantidade: z.number().min(0),
  custoUnitarioCentavos: z.number().int().min(0),
});

export const materialProjetoSchema = z.object({
  idMaterial: z.string().uuid().or(z.string()),
  nome: z.string().min(1),
  quantidadeGasta: z.number().min(0),
});

export const itemPosProcessoSchema = z.object({
  id: z.string().uuid().or(z.string()),
  nome: z.string().min(1),
  valor: z.number().min(0),
});

export const criarPedidoSchema = z.object({
  idCliente: z.string().min(1),
  descricao: z.string().min(1),
  valorCentavos: z.number().int().min(0),
  prazoEntrega: z.date().or(z.string().transform((val) => new Date(val))).optional(),
  observacoes: z.string().optional(),
  material: z.string().optional(),
  pesoGramas: z.number().min(0).optional(),
  tempoMinutos: z.number().int().min(0).optional(),
  idImpressora: z.string().uuid().or(z.string()).optional(),
  insumosSecundarios: z.array(insumoProjetoSchema).optional(),
  materiais: z.array(materialProjetoSchema).optional(),
  posProcesso: z.array(itemPosProcessoSchema).optional(),
  configuracoes: z.any().optional(),
  dataInicioAgendada: z.string().optional(),
  posicaoFila: z.number().optional(),
  codigoRastreio: z.string().optional(),
  observacoesPublicas: z.string().optional(),
});

export const atualizarPedidoSchema = criarPedidoSchema.partial().extend({
  id: z.string().min(1),
  status: z.nativeEnum(StatusPedido).optional(),
  dataConclusao: z.date().or(z.string().transform((val) => new Date(val))).optional(),
});

export type CriarPedidoInput = z.infer<typeof criarPedidoSchema>;
export type AtualizarPedidoInput = z.infer<typeof atualizarPedidoSchema>;
