/**
 * @file analisadorGCode.trabalhador.ts
 * @description Worker para processamento paralelo de arquivos G-Code.
 * Implementa lógica de extração de metadados sem bloquear a UI.
 */

import { CodigoErro } from "../excecoes";

/** Interface de resultado do fatiamento */
export interface ResultadoAnaliseGCode {
  tempoEstimadoMinutos: number;
  pesoEstimadoGramas: number;
  quantidadeLinhas: number;
  fatiadorDetectado: string;
}

// Escutando mensagens da thread principal
self.onmessage = async (evento: MessageEvent<File | string>) => {
  const dados = evento.data;

  try {
    let conteudo = "";
    if (dados instanceof File) {
      conteudo = await dados.text();
    } else {
      conteudo = dados;
    }

    const resultado = analisarConteudo(conteudo);
    self.postMessage({ tipo: "SUCESSO", dados: resultado });
  } catch (erro) {
    self.postMessage({
      tipo: "ERRO",
      codigo: CodigoErro.ARQUIVO_FATIAMENTO_INVALIDO,
      mensagem: "Falha ao processar as coordenadas do arquivo G-Code.",
    });
  }
};

/**
 * Analisa o conteúdo textual do G-Code.
 * Foca em comentários de metadados (mais performático que simular cada movimento).
 */
function analisarConteudo(conteudo: string): ResultadoAnaliseGCode {
  const linhas = conteudo.split("\n");
  let tempoSegundos = 0;
  let pesoGramas = 0;
  let fatiador = "Desconhecido";

  // Regex comuns para diferentes fatiadores
  const regexTempoCura = /;TIME:(\d+)/;

  for (const linha of linhas) {
    // Detecção de Fatiador
    if (linha.includes("Cura_Grand_Unified_Setting_Visibility")) fatiador = "Ultimaker Cura";
    if (linha.includes("PrusaSlicer")) fatiador = "PrusaSlicer";
    if (linha.includes("OrcaSlicer")) fatiador = "OrcaSlicer";

    // Extração de Tempo (Cura)
    const matchTempo = linha.match(regexTempoCura);
    if (matchTempo) {
      tempoSegundos = parseInt(matchTempo[1], 10);
    }

    // Extração de Peso Simplificada (Cura costuma colocar em gramas no final em versões novas)
    if (linha.includes(";File total size:")) {
      /* ... */
    }
  }

  // Fallback: se não achar nos comentários, precisaríamos calcular via G1 (Paralelismo pesado)
  // Para este MVP/Exemplo, retornamos os metadados encontrados ou valores padrão
  return {
    tempoEstimadoMinutos: Math.ceil(tempoSegundos / 60) || 0,
    pesoEstimadoGramas: Math.ceil(pesoGramas) || 0,
    quantidadeLinhas: linhas.length,
    fatiadorDetectado: fatiador,
  };
}
