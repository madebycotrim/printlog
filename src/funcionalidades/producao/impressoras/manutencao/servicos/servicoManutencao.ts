import { Manutencao, PecaDesgaste, RegistrarManutencaoInput } from "../tipos";
import { servicoFinanceiro } from "@/funcionalidades/comercial/financeiro/servicos/servicoFinanceiro";
import { TipoLancamentoFinanceiro } from "@/compartilhado/tipos/modelos";
import { registrar } from "@/compartilhado/utilitarios/registrador";
import { ErroPrintLog, CodigoErro, ErroInterno } from "@/compartilhado/utilitarios/excecoes";

// Mocks para desenvolvimento local
const MOCK_MANUTENCOES: Manutencao[] = [];
const MOCK_PECAS: PecaDesgaste[] = [
  {
    id: "1",
    idUsuario: "user",
    idImpressora: "dummy",
    nome: "Bico 0.4mm",
    minutosUsoAtual: 1200,
    vidaUtilEstimadaMinutos: 18000,
  },
  {
    id: "2",
    idUsuario: "user",
    idImpressora: "dummy",
    nome: "Correia X",
    minutosUsoAtual: 45000,
    vidaUtilEstimadaMinutos: 120000,
  },
  {
    id: "3",
    idUsuario: "user",
    idImpressora: "dummy",
    nome: "Lubrificação Eixos",
    minutosUsoAtual: 8000,
    vidaUtilEstimadaMinutos: 10000,
  },
];

class ServicoManutencao {
  async buscarManutencoes(idImpressora: string): Promise<Manutencao[]> {
    const rastreioId = crypto.randomUUID();
    try {
      await new Promise((resolver) => setTimeout(resolver, 400));
      return MOCK_MANUTENCOES.filter((m) => m.idImpressora === idImpressora).sort(
        (a, b) => b.data.getTime() - a.data.getTime(),
      );
    } catch (erro) {
      registrar.error({ rastreioId, servico: "Manutenção", idImpressora }, "Falha ao buscar manutenções", erro);
      throw new ErroInterno(
        "Erro ao carregar histórico de manutenção.",
        CodigoErro.ERRO_INTERNO,
        { idImpressora },
        erro,
      );
    }
  }

  async buscarPecas(idImpressora: string): Promise<PecaDesgaste[]> {
    const rastreioId = crypto.randomUUID();
    try {
      await new Promise((resolver) => setTimeout(resolver, 300));
      return MOCK_PECAS.map((p) => ({ ...p, idImpressora }));
    } catch (erro) {
      registrar.error({ rastreioId, servico: "Manutenção", idImpressora }, "Falha ao buscar peças de desgaste", erro);
      throw new ErroInterno("Erro ao carregar monitor de peças.", CodigoErro.ERRO_INTERNO, { idImpressora }, erro);
    }
  }

  async registrarManutencao(dados: RegistrarManutencaoInput): Promise<Manutencao> {
    const rastreioId = crypto.randomUUID();
    try {
      await new Promise((resolver) => setTimeout(resolver, 600));

      const novaManutencao: Manutencao = {
        id: crypto.randomUUID(),
        idUsuario: "usuario-logado",
        idImpressora: dados.idImpressora,
        data: new Date(),
        tipo: dados.tipo,
        descricao: dados.descricao,
        custoCentavos: dados.custoCentavos,
        tempoParadaMinutos: dados.tempoParadaMinutos,
      };

      MOCK_MANUTENCOES.push(novaManutencao);

      if (dados.custoCentavos > 0) {
        await servicoFinanceiro.registrarLancamento({
          tipo: TipoLancamentoFinanceiro.SAIDA,
          valorCentavos: dados.custoCentavos,
          descricao: `Manutenção ${dados.tipo}: ${dados.idImpressora}`,
          categoria: "Manutenção",
          idReferencia: novaManutencao.id,
        });
      }

      if (dados.pecasTrocadas && dados.pecasTrocadas.length > 0) {
        MOCK_PECAS.forEach((p) => {
          if (dados.pecasTrocadas?.includes(p.id)) {
            p.minutosUsoAtual = 0;
          }
        });
      }

      registrar.info(
        { rastreioId, servico: "Manutenção", idManutencao: novaManutencao.id },
        "Manutenção registrada com sucesso",
      );
      return novaManutencao;
    } catch (erro) {
      registrar.error({ rastreioId, servico: "Manutenção", dados }, "Erro ao registrar manutenção", erro);
      if (erro instanceof ErroPrintLog) throw erro;
      throw new ErroInterno("Falha ao registrar manutenção no sistema.", CodigoErro.ERRO_INTERNO, {}, erro);
    }
  }
}

export const servicoManutencao = new ServicoManutencao();
