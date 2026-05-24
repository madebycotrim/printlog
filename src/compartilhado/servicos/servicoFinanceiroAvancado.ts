/**
 * @file servicoFinanceiroAvancado.ts
 * @description Lógica para DRE (Demonstrativo de Resultados) e Fluxo de Caixa Avançado.
 * Conforme Regra 6.0 (Valores em Centavos) e Regra 11.0 (Logs).
 */

import { Centavos, TipoLancamentoFinanceiro } from "@/compartilhado/tipos/modelos";
import { Pedido } from "@/funcionalidades/producao/projetos/tipos";
import { Material } from "@/funcionalidades/producao/materiais/tipos";
import { LancamentoFinanceiro } from "@/funcionalidades/comercial/financeiro/tipos";
import { Impressora } from "@/funcionalidades/producao/impressoras/tipos";

export interface DadosDRE {
  receitaBrutaCentavos: Centavos;
  custoMaterialCentavos: Centavos;
  custoInsumosCentavos: Centavos;
  custoEnergiaCentavos: Centavos;
  depreciacaoCentavos: Centavos;
  custosVariaveisCentavos: Centavos;
  margemContribuicaoCentavos: Centavos;
  despesasFixasCentavos: Centavos;
  lucroLiquidoCentavos: Centavos;
  pontoEquilibrioCentavos: Centavos;
  lucratividadePercentual: number;
}

export interface PontoGraficoMaterial {
  nome: string;
  valor: number;
  cor: string;
}

export interface MetricaTicketMaterial {
  material: string;
  ticketMedioCentavos: Centavos;
  quantidadePedidos: number;
  receitaTotalCentavos: Centavos;
}

export const servicoFinanceiroAvancado = {
  /**
   * Gera o Demonstrativo de Resultados do Exercício (DRE).
   * @param pedidos Lista de pedidos para calcular receita e custos variáveis.
   * @param lancamentos Lançamentos manuais (despesas fixas).
   * @param materiais Lista de materiais para estimar custo médio.
   * @param impressoras Lista de impressoras para depreciação e potência de energia.
   * @param configCustoEnergia Custo de energia por kWh (em centavos).
   */
  gerarDRE: (
    pedidos: Pedido[],
    lancamentos: LancamentoFinanceiro[],
    materiais: Material[],
    impressoras: Impressora[],
    configCustoEnergia: number
  ): DadosDRE => {
    // 1. Receita Bruta (Pedidos Concluídos)
    const receitaBrutaCentavos = pedidos.filter((p) => p.dataConclusao).reduce((acc, p) => acc + p.valorCentavos, 0);

    // 2. Custos Variáveis
    let custoMaterialCentavos = 0;
    let custoInsumosCentavos = 0;
    let custoEnergiaCentavos = 0;
    let depreciacaoCentavos = 0;

    pedidos
      .filter((p) => p.dataConclusao)
      .forEach((p) => {
        // Custo do material (antigo ou array v9)
        if (p.materiais && p.materiais.length > 0) {
          p.materiais.forEach(mat => {
             const materialRef = materiais.find(m => m.id === mat.idMaterial || m.id === (mat as any).id);
             if (materialRef && materialRef.pesoGramas > 0) {
                const custoPorGrama = materialRef.precoCentavos / materialRef.pesoGramas;
                custoMaterialCentavos += custoPorGrama * (mat.quantidadeGasta || 0);
             }
          });
        } else if (p.pesoGramas && p.material) {
          const materialRef = materiais.find((m) => m.nome === p.material);
          if (materialRef && materialRef.pesoGramas > 0) {
            const custoPorGrama = materialRef.precoCentavos / materialRef.pesoGramas;
            custoMaterialCentavos += custoPorGrama * p.pesoGramas;
          }
        }

        // Custo dos Insumos Secundários (v9.0)
        if (p.insumosSecundarios && p.insumosSecundarios.length > 0) {
          const custoInsumos = p.insumosSecundarios.reduce((sum, i) => sum + i.quantidade * (i.custoUnitarioCentavos || 0), 0);
          custoInsumosCentavos += custoInsumos;
        }

        // Custo de Energia e Depreciação (se tiver impressora vinculada e tempo)
        const tempoEfetivo = p.tempoMinutos || (
          p.configuracoes 
            ? ((p.configuracoes.tempoHoras || 0) * 60 + (p.configuracoes.tempoMinutos || 0))
            : 0
        ) || 0;

        if (tempoEfetivo > 0) {
          let potenciaWatts = p.configuracoes?.potenciaWatts || 0;
          let precoKwh = p.configuracoes?.precoKwh || configCustoEnergia;
          let valorCompraCentavos = 0;

          if (p.idImpressora) {
            const imp = impressoras.find((i) => i.id === p.idImpressora);
            if (imp) {
              if (!potenciaWatts) potenciaWatts = imp.potenciaWatts || (imp.consumoKw ? imp.consumoKw * 1000 : 350);
              valorCompraCentavos = imp.valorCompraCentavos || 0;
            }
          }

          if (!potenciaWatts) potenciaWatts = 350; // Fallback para impressora média

          const kw = potenciaWatts / 1000;
          const horas = tempoEfetivo / 60;
          custoEnergiaCentavos += horas * kw * precoKwh;

          if (valorCompraCentavos > 0) {
            depreciacaoCentavos += (tempoEfetivo / 300000) * valorCompraCentavos;
          }
        }
      });

    const custosVariaveisCentavos = custoMaterialCentavos + custoInsumosCentavos + custoEnergiaCentavos + depreciacaoCentavos;

    // 3. Despesas Fixas (Saídas no financeiro que não são vinculadas a pedidos específicos)
    const despesasFixasCentavos = lancamentos
      .filter((l) => l.tipo === TipoLancamentoFinanceiro.SAIDA && !l.idReferencia)
      .reduce((acc, l) => acc + l.valorCentavos, 0);

    const margemContribuicaoCentavos = receitaBrutaCentavos - custosVariaveisCentavos;
    const lucroLiquidoCentavos = margemContribuicaoCentavos - despesasFixasCentavos;

    const lucratividadePercentual =
      receitaBrutaCentavos > 0 ? Math.round((lucroLiquidoCentavos / receitaBrutaCentavos) * 100) : 0;

    // Ponto de Equilíbrio (Break-Even) = Despesas Fixas / Margem de Contribuição %
    const margemContribuicaoPercentual = receitaBrutaCentavos > 0 ? (margemContribuicaoCentavos / receitaBrutaCentavos) : 0;
    const pontoEquilibrioCentavos = margemContribuicaoPercentual > 0 
      ? Math.round(despesasFixasCentavos / margemContribuicaoPercentual) 
      : 0;

    return {
      receitaBrutaCentavos,
      custoMaterialCentavos: Math.round(custoMaterialCentavos),
      custoInsumosCentavos: Math.round(custoInsumosCentavos),
      custoEnergiaCentavos: Math.round(custoEnergiaCentavos),
      depreciacaoCentavos: Math.round(depreciacaoCentavos),
      custosVariaveisCentavos: Math.round(custosVariaveisCentavos),
      margemContribuicaoCentavos: Math.round(margemContribuicaoCentavos),
      despesasFixasCentavos,
      lucroLiquidoCentavos: Math.round(lucroLiquidoCentavos),
      pontoEquilibrioCentavos,
      lucratividadePercentual,
    };
  },

  /**
   * Gera dados para o gráfico de pizza de distribuição por material.
   */
  gerarDistribuicaoMaterial: (pedidos: Pedido[]): PontoGraficoMaterial[] => {
    const mapa: Record<string, number> = {};
    const cores = ["#0ea5e9", "#10b981", "#f59e0b", "#6366f1", "#8b5cf6", "#ec4899", "#ef4444"];

    pedidos
      .filter((p) => p.material)
      .forEach((p) => {
        const mat = p.material!;
        mapa[mat] = (mapa[mat] || 0) + 1;
      });

    return Object.entries(mapa)
      .map(([nome, valor], index) => ({
        nome,
        valor,
        cor: cores[index % cores.length],
      }))
      .sort((a, b) => b.valor - a.valor);
  },

  /**
   * Calcula o Ticket Médio por categoria de material.
   */
  gerarTicketMedioPorMaterial: (pedidos: Pedido[]): MetricaTicketMaterial[] => {
    const mapa: Record<string, { total: number; count: number }> = {};

    // Consideramos apenas pedidos concluídos para refletir o faturamento real
    pedidos
      .filter((p) => p.material && p.dataConclusao)
      .forEach((p) => {
        const mat = p.material!;
        if (!mapa[mat]) mapa[mat] = { total: 0, count: 0 };
        mapa[mat].total += p.valorCentavos;
        mapa[mat].count += 1;
      });

    return Object.entries(mapa)
      .map(([material, dados]) => ({
        material,
        ticketMedioCentavos: Math.round(dados.total / dados.count),
        quantidadePedidos: dados.count,
        receitaTotalCentavos: dados.total,
      }))
      .sort((a, b) => b.ticketMedioCentavos - a.ticketMedioCentavos);
  },

  /**
   * Gera o histórico de faturamento dos últimos 6 meses.
   */
  gerarHistoricoFaturamento: (pedidos: Pedido[]) => {
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const hoje = new Date();
    const ultimos6Meses: { mes: string; faturamentoCentavos: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const dataRef = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mesIndex = dataRef.getMonth();
      const anoCurto = dataRef.getFullYear().toString().slice(-2);

      const faturamento = pedidos
        .filter((p) => {
          if (!p.dataConclusao) return false;
          const d = new Date(p.dataConclusao);
          return d.getMonth() === mesIndex && d.getFullYear() === dataRef.getFullYear();
        })
        .reduce((acc, p) => acc + p.valorCentavos, 0);

      ultimos6Meses.push({
        mes: `${meses[mesIndex]}/${anoCurto}`,
        faturamentoCentavos: faturamento,
      });
    }

    return ultimos6Meses;
  },
};
