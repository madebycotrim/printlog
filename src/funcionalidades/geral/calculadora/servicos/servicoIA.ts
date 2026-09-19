import { servicoBaseApi } from "@/compartilhado/servicos/servicoBaseApi";

export interface SugestaoEstrategia {
  valor: number;
  justificativa: string;
}

export interface AnaliseTecnicaIA {
  scoreRisco: number; // 1 a 10
  nivelComplexidade: "Baixa" | "Média" | "Alta" | "Crítica";
  alertas: string[];
}

export interface PitchComercialIA {
  textoWhatsApp: string;
}

export interface SugestaoPrecoIA {
  piso: SugestaoEstrategia;
  recomendado: SugestaoEstrategia;
  premium: SugestaoEstrategia;
  express: SugestaoEstrategia;
  analiseTecnica: AnaliseTecnicaIA;
  pitchComercial: PitchComercialIA;
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
  quantidade?: number;
  tipoCliente?: "B2B" | "B2C";
  bandeiraTarifaria?: string;
  materiais?: Array<{ nome: string; quantidade: number; tipo?: string; cor?: string }>;
  posProcesso?: Array<{ nome: string; valor: number }>;
}

function gerarSugestaoHeuristicaInteligente(dados: EntradaIA): SugestaoPrecoIA {
  const custoBase = dados.custoMaterial + dados.custoEnergia + dados.custoTrabalho + dados.custoDepreciacao;
  const base = custoBase > 0 ? custoBase : 8.5;
  const qtd = Math.max(1, dados.quantidade || 1);
  const horas = Math.round((dados.tempoMinutos / 60) * 10) / 10;

  // Análise de materiais técnicos e pós-processo
  const temMaterialTecnico = (dados.materiais || []).some(m => 
    /abs|asa|tpu|flex|resina|nylon|carbon/i.test(m.nome || m.tipo || "")
  );
  const temPosProcesso = (dados.posProcesso || []).length > 0;

  // Fatores multiplicadores ponderados
  const multiplicadorPiso = temMaterialTecnico ? 1.7 : 1.55;
  const multiplicadorRec = temMaterialTecnico ? 2.3 : 2.15;
  const multiplicadorPrem = temMaterialTecnico ? 3.1 : 2.85;

  const valorPiso = Math.max(12, Math.round((base * multiplicadorPiso) * 100) / 100);
  const valorRec = Math.max(18, Math.round((base * multiplicadorRec) * 100) / 100);
  const valorPrem = Math.max(28, Math.round((base * multiplicadorPrem) * 100) / 100);
  const valorExpress = Math.round((valorRec * 1.45) * 100) / 100;

  // Cálculo de Score de Risco (1 a 10)
  let scoreRisco = 2;
  const alertas: string[] = [];

  if (dados.tempoMinutos > 600) {
    scoreRisco += 4;
    alertas.push("Impressão superior a 10 horas: monitore a temperatura ambiente e certifique-se de no-break contra quedas de energia.");
  } else if (dados.tempoMinutos > 300) {
    scoreRisco += 2;
    alertas.push("Tempo prolongado de mesa (> 5h): verifique adesão da primeira camada com brim ou spray fixador.");
  }

  if (temMaterialTecnico) {
    scoreRisco += 3;
    alertas.push("Uso de filamento/resina técnica: atente-se a taxas de retração, umidade do material e ventilação adequada.");
  }

  if (temPosProcesso) {
    scoreRisco += 1;
    alertas.push("Etapas manuais de pós-processamento: reserve tempo de bancada para acabamento de alta fidelidade.");
  }

  scoreRisco = Math.min(10, Math.max(1, scoreRisco));

  let nivelComplexidade: "Baixa" | "Média" | "Alta" | "Crítica" = "Baixa";
  if (scoreRisco >= 8) nivelComplexidade = "Crítica";
  else if (scoreRisco >= 6) nivelComplexidade = "Alta";
  else if (scoreRisco >= 4) nivelComplexidade = "Média";

  let dica = "O valor recomendado oferece o melhor equilíbrio entre conversão rápida e saúde financeira do seu maquinário.";
  if (dados.tipoCliente === "B2B") {
    dica = "Para clientes corporativos (B2B), a previsibilidade de prazo e acabamento técnico sobrepõem o preço unitário. A estratégia Recomendada ou Premium tem excelente aceitação.";
  } else if (dados.tempoMinutos > 360) {
    dica = "Impressões com mais de 6h bloqueiam a mesa por turnos inteiros. Utilize a estratégia Recomendada ou Premium para cobrir a ociosidade do equipamento.";
  }

  // Geração de Pitch Comercial para WhatsApp
  const nomePecaFormatado = dados.nomePeca ? `*${dados.nomePeca}*` : "*seu projeto 3D sob medida*";
  const textoWhatsApp = `Olá! Tudo bem? Segue a proposta detalhada para a fabricação de ${nomePecaFormatado}:

🛠️ *Especificações de Produção:*
• *Tecnologia:* Manufatura Aditiva de Alta Precisão
• *Tempo de Máquina:* ~${horas > 0 ? `${horas}h de impressão contínua` : "produção sob demanda"}
• *Material Homologado:* ${dados.materiais?.[0]?.nome || "Filamento Premium de Alta Resistência"}
${temPosProcesso ? `• *Acabamento:* Tratamento e pós-processamento dedicado incluso\n` : ""}• *Quantidade:* ${qtd} unidade(s)

💰 *Condições Comerciais:*
• *Valor Total:* R$ ${valorRec.toFixed(2).replace('.', ',')}
• *Prazo Estimado:* Produção rápida com inspeção de qualidade peça a peça.

Ficou alguma dúvida ou quer que já coloquemos sua peça na fila de impressão de hoje? 🚀`;

  return {
    piso: {
      valor: valorPiso,
      justificativa: "Margem de volume (~55%). Recomendada para grandes lotes ou revendedores parceiros."
    },
    recomendado: {
      valor: valorRec,
      justificativa: "Equilíbrio ótimo (~115%). Excelente taxa de conversão garantindo lucro limpo e depreciação coberta."
    },
    premium: {
      valor: valorPrem,
      justificativa: "Margem de valor agregado (~185%). Indicada para peças que exigem tolerância rígida, acabamento estético ou clientes exigentes."
    },
    express: {
      valor: valorExpress,
      justificativa: "Taxa de urgência (+45%). Furar fila de impressão e produção prioritária com entrega acelerada."
    },
    analiseTecnica: {
      scoreRisco,
      nivelComplexidade,
      alertas: alertas.length > 0 ? alertas : ["Projeto de baixo risco operacional. Boa repetibilidade e consumo equilibrado."]
    },
    pitchComercial: {
      textoWhatsApp
    },
    dica
  };
}

export const servicoIA = {
  /**
   * Solicita uma sugestão de precificação e análise de risco ao motor de IA.
   * Consome o Cloudflare Workers AI com fallback heurístico maker resiliente.
   */
  obterSugestaoPreco: async (dados: EntradaIA): Promise<SugestaoPrecoIA> => {
    try {
      const resposta = await servicoBaseApi.post<SugestaoPrecoIA>("/api/ia-sugerir-preco", dados);
      if (resposta && resposta.piso && resposta.recomendado && resposta.premium && resposta.express) {
        // Assegura que campos opcionais ou estruturas antigas tenham fallback gracioso
        return {
          piso: resposta.piso,
          recomendado: resposta.recomendado,
          premium: resposta.premium,
          express: resposta.express || {
            valor: Math.round(resposta.recomendado.valor * 1.45 * 100) / 100,
            justificativa: "Produção prioritária em caráter de urgência."
          },
          analiseTecnica: resposta.analiseTecnica || {
            scoreRisco: 3,
            nivelComplexidade: "Média",
            alertas: ["Peça validada para fatiamento com parâmetros padrão."]
          },
          pitchComercial: resposta.pitchComercial || {
            textoWhatsApp: `Olá! Segue o orçamento para o projeto *${dados.nomePeca || 'Peça 3D'}*: R$ ${resposta.recomendado.valor.toFixed(2).replace('.', ',')}. Produção de alta qualidade pronta para fatiamento.`
          },
          dica: resposta.dica || "Preço equilibrado com a média praticada no mercado brasileiro."
        };
      }
      return gerarSugestaoHeuristicaInteligente(dados);
    } catch {
      // Fallback heurístico resiliente em caso de falha de conexão ou timeout
      return gerarSugestaoHeuristicaInteligente(dados);
    }
  },
};

