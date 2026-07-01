import { z } from "zod";

export const registroMovimentacaoInsumoSchema = z.object({
  id: z.string().optional(),
  data: z.string().optional(),
  tipo: z.enum(["Entrada", "Saída"]),
  quantidade: z.number().min(0),
  valorTotal: z.number().min(0).optional(),
  motivo: z.enum(["Consumo", "Descarte", "Avaria", "Ajuste", "Outro"]).optional(),
  observacao: z.string().optional(),
  responsavel: z.string().optional(),
});

export const insumoSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1),
  descricao: z.string().optional().nullable(),
  categoria: z.enum(["Geral", "Embalagem", "Embrulho", "Fixação", "Eletrônica", "Acabamento", "Limpeza", "Proteção", "Outros"]),
  unidadeMedida: z.enum(["un", "ml", "L", "g", "kg", "Rolo", "Caixa", "Par"]),
  quantidadeAtual: z.number().min(0),
  quantidadeMinima: z.number().min(0),
  custoMedioUnidade: z.number().min(0),
  linkCompra: z.string().url().or(z.string()).optional().nullable(),
  marca: z.string().optional().nullable(),
  itemFracionavel: z.boolean().optional().nullable(),
  rendimentoTotal: z.number().optional().nullable(),
  unidadeConsumo: z.string().optional().nullable(),
  icone: z.string().optional().nullable(),
});
