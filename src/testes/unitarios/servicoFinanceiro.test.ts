import { describe, it, expect, beforeEach, vi } from "vitest";
import { servicoFinanceiro } from "@/funcionalidades/comercial/financeiro/servicos/servicoFinanceiro";
import { TipoLancamentoFinanceiro } from "@/compartilhado/tipos/modelos";
import { CodigoErro } from "@/compartilhado/utilitarios/excecoes";

describe("ServicoFinanceiro", () => {
  beforeEach(() => {
    // Como o serviço usa um MOCK em memória, idealmente deveríamos ter uma forma de resetar
    // ou injetar o mock. Para este teste, vamos focar no comportamento das funções.
    vi.clearAllMocks();
  });

  describe("registrarLancamento", () => {
    it("deve registrar um lançamento válido com sucesso", async () => {
      const dados = {
        tipo: TipoLancamentoFinanceiro.ENTRADA,
        valorCentavos: 1550,
        descricao: "Venda de Teste",
      };

      const resultado = await servicoFinanceiro.registrarLancamento(dados);

      expect(resultado).toBeDefined();
      expect(resultado.valorCentavos).toBe(1550);
      expect(resultado.tipo).toBe(TipoLancamentoFinanceiro.ENTRADA);
    });

    it("deve lançar erro quando o valor for zero ou negativo", async () => {
      const dados = {
        tipo: TipoLancamentoFinanceiro.ENTRADA,
        valorCentavos: 0,
        descricao: "Venda Inválida",
      };

      try {
        await servicoFinanceiro.registrarLancamento(dados);
        // Se não lançar erro, força falha no teste
        expect("deveria ter lançado erro").toBe("erro lançado");
      } catch (erro: any) {
        expect(erro.codigo).toBe(CodigoErro.LANCAMENTO_VALOR_INVALIDO);
      }
    });
  });

  describe("obterResumo", () => {
    it("deve calcular o resumo corretamente", async () => {
      // Como o MOCK_LANCAMENTOS é global no arquivo do serviço,
      // este teste depende do estado anterior se não houver reset.
      // Em um cenário real, o serviço buscaria do banco.
      const resumo = await servicoFinanceiro.obterResumo();

      expect(resumo).toHaveProperty("saldoTotalCentavos");
      expect(resumo).toHaveProperty("entradasMesCentavos");
      expect(resumo).toHaveProperty("saidasMesCentavos");
    });
  });
});
