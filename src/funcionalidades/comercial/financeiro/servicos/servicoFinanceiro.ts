import { TipoLancamentoFinanceiro } from "@/compartilhado/tipos/modelos";
import { LancamentoFinanceiro, CriarLancamentoInput, ResumoFinanceiro } from "../tipos";
import { registrar } from "@/compartilhado/utilitarios/registrador";
import { CodigoErro, ErroValidacao, ErroInterno } from "@/compartilhado/utilitarios/excecoes";

/**
 * Modelo sintético de lançamentos financeiros para desenvolvimento local.
 */
const MODELO_LANCAMENTOS: LancamentoFinanceiro[] = [];

class ServicoFinanceiro {
  /**
   * Busca todos os lançamentos financeiros ordenados por data decrescente.
   * @param rastreioId ID de correlação para logs.
   */
  async buscarLancamentos(rastreioId: string = "sistema"): Promise<LancamentoFinanceiro[]> {
    registrar.info({ rastreioId, servico: "ServicoFinanceiro" }, "Buscando lançamentos financeiros");
    await new Promise((resolver) => setTimeout(resolver, 400));
    return [...MODELO_LANCAMENTOS].sort((a, b) => b.dataCriacao.getTime() - a.dataCriacao.getTime());
  }

  /**
   * Registra um novo lançamento financeiro.
   * @param dados Dados do lançamento.
   * @param rastreioId ID de correlação para logs.
   *
   * @lgpd Base legal: Obrigação legal (Art. 7º, II) — retenção 60 meses (Lei 9.430/1996)
   * @lgpd Finalidade: Registro de fluxo de caixa para conformidade fiscal.
   */
  async registrarLancamento(
    dados: CriarLancamentoInput,
    rastreioId: string = "sistema",
  ): Promise<LancamentoFinanceiro> {
    registrar.info(
      { rastreioId, servico: "ServicoFinanceiro", tipo: dados.tipo },
      "Registrando novo lançamento financeiro",
    );

    if (dados.valorCentavos <= 0) {
      registrar.warn(
        { rastreioId, servico: "ServicoFinanceiro", valor: dados.valorCentavos },
        "Tentativa de registro de valor inválido",
      );
      throw new ErroValidacao("O valor do lançamento deve ser maior que zero.", CodigoErro.LANCAMENTO_VALOR_INVALIDO);
    }

    try {
      await new Promise((resolver) => setTimeout(resolver, 500));

      const novoLancamento: LancamentoFinanceiro = {
        id: crypto.randomUUID(),
        idUsuario: "usuario-logado",
        tipo: dados.tipo,
        valorCentavos: Math.abs(dados.valorCentavos),
        descricao: dados.descricao,
        categoria: dados.categoria,
        idReferencia: dados.idReferencia,
        idCliente: dados.idCliente,
        dataCriacao: dados.data || new Date(),
      };

      MODELO_LANCAMENTOS.push(novoLancamento);
      registrar.info({ rastreioId, id: novoLancamento.id }, "Lançamento registrado com sucesso");
      return novoLancamento;
    } catch (erro) {
      registrar.error({ rastreioId, servico: "ServicoFinanceiro" }, "Falha ao registrar lançamento", erro);
      throw new ErroInterno("Erro inesperado ao registrar lançamento financeiro.", CodigoErro.ERRO_INTERNO, {}, erro);
    }
  }

  /**
   * Obtém o resumo financeiro consolidado (saldo total, entradas e saídas do mês).
   * @param rastreioId ID de correlação para logs.
   */
  async obterResumo(rastreioId: string = "sistema"): Promise<ResumoFinanceiro> {
    registrar.info({ rastreioId, servico: "ServicoFinanceiro" }, "Calculando resumo financeiro");
    await new Promise((resolver) => setTimeout(resolver, 300));

    const agora = new Date();
    const primeiroDiaMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

    const resumo = MODELO_LANCAMENTOS.reduce(
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

    return resumo;
  }
}

export const servicoFinanceiro = new ServicoFinanceiro();
