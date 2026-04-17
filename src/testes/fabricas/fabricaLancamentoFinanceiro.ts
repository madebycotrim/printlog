import { LancamentoFinanceiro } from "@/funcionalidades/comercial/financeiro/tipos";
import { TipoLancamentoFinanceiro } from "@/compartilhado/tipos/modelos";

/**
 * Fabrica um objeto LancamentoFinanceiro para testes.
 * @param override Valores para sobrescrever o padrão.
 */
export function fabricarLancamentoFinanceiro(override?: Partial<LancamentoFinanceiro>): LancamentoFinanceiro {
  return {
    id: crypto.randomUUID(),
    idUsuario: "usuario-teste",
    tipo: TipoLancamentoFinanceiro.ENTRADA,
    valorCentavos: 1000, // R$ 10,00
    descricao: "Lançamento de Teste",
    dataCriacao: new Date(),
    ...override,
  };
}
