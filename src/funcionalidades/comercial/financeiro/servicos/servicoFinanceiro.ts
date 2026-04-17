import { TipoLancamentoFinanceiro } from "@/compartilhado/tipos/modelos";
import { LancamentoFinanceiro, CriarLancamentoInput, ResumoFinanceiro } from "../tipos";
import { registrar } from "@/compartilhado/utilitarios/registrador";
import { apiFinanceiro } from "./apiFinanceiro";

/**
 * Serviço de Negócio para o módulo Financeiro.
 * Gerencia a lógica de lançamentos e cálculos de saldo.
 */
class ServicoFinanceiro {
  async buscarLancamentos(usuarioId: string, rastreioId: string = "sistema"): Promise<LancamentoFinanceiro[]> {
    registrar.info({ rastreioId, servico: "ServicoFinanceiro" }, "Buscando lançamentos no banco");
    return apiFinanceiro.buscarTodos(usuarioId);
  }

  async registrarLancamento(
    dados: CriarLancamentoInput,
    usuarioId: string,
    rastreioId: string = "sistema",
  ): Promise<LancamentoFinanceiro> {
    registrar.info({ rastreioId, servico: "ServicoFinanceiro" }, "Registrando no banco");
    return apiFinanceiro.registrar(dados, usuarioId);
  }

  async obterResumo(usuarioId: string, rastreioId: string = "sistema"): Promise<ResumoFinanceiro> {
    const lancamentos = await apiFinanceiro.buscarTodos(usuarioId);
    
    const agora = new Date();
    const primeiroDiaMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

    return lancamentos.reduce(
      (acumulador, l) => {
        const ehMesAtual = l.dataCriacao >= primeiroDiaMes;

        if (l.tipo === TipoLancamentoFinanceiro.ENTRADA) {
          acumulador.saldoTotalCentavos += l.valorCentavos;
          if (ehMesAtual) acumulador.entradasMesCentavos += l.valorCentavos;
        } else {
          acumulador.saldoTotalCentavos -= l.valorCentavos;
          if (ehMesAtual) acumulador.saidasMesCentavos += l.valorCentavos;
        }

        return acumulador;
      },
      { saldoTotalCentavos: 0, entradasMesCentavos: 0, saidasMesCentavos: 0 } as ResumoFinanceiro,
    );
  }

  async excluirLancamento(id: string, usuarioId: string): Promise<void> {
      await apiFinanceiro.remover(id, usuarioId);
  }
}

export const servicoFinanceiro = new ServicoFinanceiro();
