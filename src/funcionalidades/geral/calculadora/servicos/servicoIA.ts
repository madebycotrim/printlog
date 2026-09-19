import { servicoBaseApi } from "@/compartilhado/servicos/servicoBaseApi";

export interface SugestaoPrecoIA {
  piso: { valor: number; justificativa: string };
  recomendado: { valor: number; justificativa: string };
  premium: { valor: number; justificativa: string };
  dica: string;
}

export interface EntradaIA {
  nomePeca: string;
  pesoGramas: number;
  tempoMinutos: number;
  custoMaterial: number;
  custoEnergia: number;
  custoTrabalho: number;
  custoDepreciacao: number;
  lucroDesejadoPercentual: number;
}

function gerarSugestaoHeuristicaInteligente(dados: EntradaIA): SugestaoPrecoIA {
  const custoBase = dados.custoMaterial + dados.custoEnergia + dados.custoTrabalho + dados.custoDepreciacao;
  const base = custoBase > 0 ? custoBase : 10;
  
  // Piso: custo + 60%
  const valorPiso = Math.round((base * 1.6) * 100) / 100;
  // Recomendado: custo + 110%
  const valorRec = Math.round((base * 2.1) * 100) / 100;
  // Premium: custo + 190%
  const valorPrem = Math.round((base * 2.9) * 100) / 100;

  let dica = "O valor recomendado oferece o melhor equilíbrio entre atratividade comercial e margem líquida sustentável.";
  if (dados.tempoMinutos > 300) {
    dica = "Impressões com mais de 5 horas possuem maior risco de falha térmica. Considere o valor Recomendado ou Premium para cobrir a ociosidade da mesa.";
  } else if (dados.pesoGramas < 35 && dados.pesoGramas > 0) {
    dica = "Para peças leves, o custo do filamento é baixo comparado ao tempo de setup. Evite cobrar abaixo do Piso para garantir rentabilidade operacional.";
  }

  return {
    piso: {
      valor: valorPiso,
      justificativa: "Margem conservadora (~60%). Indicada para grandes lotes, atacado ou revendedores."
    },
    recomendado: {
      valor: valorRec,
      justificativa: "Equilíbrio ótimo de mercado (~110%). Máxima conversão com retorno saudável sobre seu tempo e maquinário."
    },
    premium: {
      valor: valorPrem,
      justificativa: "Margem de valor agregado (~190%). Ideal para pedidos urgentes, acabamento diferenciado ou clientes exigentes."
    },
    dica
  };
}

export const servicoIA = {
  /**
   * Solicita uma sugestão de precificação baseada em IA.
   * Consome o endpoint Cloudflare Workers AI com fallback heurístico resiliente.
   */
  obterSugestaoPreco: async (dados: EntradaIA): Promise<SugestaoPrecoIA> => {
    try {
      const resposta = await servicoBaseApi.post<SugestaoPrecoIA>("/api/ia-sugerir-preco", dados);
      if (resposta && resposta.piso && resposta.recomendado && resposta.premium) {
        return resposta;
      }
      return gerarSugestaoHeuristicaInteligente(dados);
    } catch {
      // Fallback heurístico inteligente caso o backend de IA esteja offline ou sem créditos de neurons
      return gerarSugestaoHeuristicaInteligente(dados);
    }
  },
};
