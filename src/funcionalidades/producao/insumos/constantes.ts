import { Package, Gift, Shapes, Wrench, Cpu, Paintbrush, Droplet, Puzzle, Shield } from "lucide-react";

export const CATEGORIAS = [
  { id: "Geral", rotulo: "GERAL", icone: Shapes, corTema: "zinc-500" },
  { id: "Embalagem", rotulo: "EMBALAGEM", icone: Package, corTema: "amber-500" },
  { id: "Embrulho", rotulo: "EMBRULHO", icone: Gift, corTema: "pink-500" },
  { id: "Fixação", rotulo: "FIXAÇÃO", icone: Wrench, corTema: "red-500" },
  { id: "Eletrônica", rotulo: "ELETRÔNICA", icone: Cpu, corTema: "violet-500" },
  { id: "Acabamento", rotulo: "ACABAMENTO", icone: Paintbrush, corTema: "emerald-500" },
  { id: "Limpeza", rotulo: "LIMPEZA", icone: Droplet, corTema: "sky-500" },
  { id: "Proteção", rotulo: "PROTEÇÃO", icone: Shield, corTema: "teal-500" },
  { id: "Outros", rotulo: "OUTROS", icone: Puzzle, corTema: "stone-500" },
];

export const UNIDADES = [
  { valor: "un", rotulo: "UN" },
  { valor: "ml", rotulo: "ML" },
  { valor: "L", rotulo: "L" },
  { valor: "g", rotulo: "G" },
  { valor: "kg", rotulo: "KG" },
  { valor: "Rolo", rotulo: "ROLO" },
  { valor: "Caixa", rotulo: "CX" },
  { valor: "Par", rotulo: "PAR" },
];

export const UNIDADES_CONSUMO = [
  { valor: "m", rotulo: "Metro (m)" },
  { valor: "cm", rotulo: "Centímetro (cm)" },
  { valor: "ml", rotulo: "Mililitro (ml)" },
  { valor: "g", rotulo: "Grama (g)" },
  { valor: "folha", rotulo: "Folha" },
  { valor: "pedaço", rotulo: "Pedaço" },
  { valor: "dose", rotulo: "Dose" },
  { valor: "spray", rotulo: "Spray / Borrifada" },
  { valor: "gota", rotulo: "Gota" },
];

import * as TodosIconesLucide from "lucide-react";

export function obterIconeInsumo(nomeIcone?: string, nomeCategoria?: string) {
  if (nomeIcone && (TodosIconesLucide as any)[nomeIcone]) {
    return (TodosIconesLucide as any)[nomeIcone];
  }
  const categoria = CATEGORIAS.find(c => c.id === nomeCategoria);
  return categoria?.icone || Package;
}
