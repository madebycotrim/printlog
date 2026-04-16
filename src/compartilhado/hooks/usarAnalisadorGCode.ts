/**
 * @file usarAnalisadorGCode.ts
 * @description Hook para interagir com o Web Worker de análise de G-Code.
 * Gerencia o ciclo de vida do worker e fornece estados de carregamento e resultado.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { ResultadoAnaliseGCode } from "../utilitarios/trabalhadores/analisadorGCode.trabalhador";
import { registrar } from "../utilitarios/registrador";

interface EstadoAnalise {
  analisando: boolean;
  resultado: ResultadoAnaliseGCode | null;
  erro: string | null;
}

export function usarAnalisadorGCode() {
  const [estado, setEstado] = useState<EstadoAnalise>({
    analisando: false,
    resultado: null,
    erro: null,
  });

  const workerRef = useRef<Worker | null>(null);

  // Limpeza ao desmontar
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const analisarArquivo = useCallback((arquivo: File) => {
    const rastreioId = crypto.randomUUID();
    setEstado((prev) => ({ ...prev, analisando: true, erro: null }));

    // Inicializa o worker se não existir
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL("../utilitarios/trabalhadores/analisadorGCode.trabalhador.ts", import.meta.url),
        { type: "module" },
      );
    }

    const worker = workerRef.current;

    worker.onmessage = (evento) => {
      const { tipo, dados, mensagem } = evento.data;

      if (tipo === "SUCESSO") {
        setEstado({
          analisando: false,
          resultado: dados,
          erro: null,
        });
        registrar.info(
          {
            rastreioId,
            servico: "Fatiamento",
            fatiador: dados.fatiadorDetectado,
          },
          "Análise de G-Code concluída via Web Worker",
        );
      } else {
        setEstado({
          analisando: false,
          resultado: null,
          erro: mensagem,
        });
        registrar.error(
          {
            rastreioId,
            servico: "Fatiamento",
            mensagem,
          },
          "Erro na análise paralela de G-Code",
        );
      }
    };

    worker.onerror = (e) => {
      setEstado({
        analisando: false,
        resultado: null,
        erro: "Erro fatal no processo paralelo.",
      });
      registrar.fatal(
        {
          rastreioId,
          servico: "Fatiamento",
          erro: e,
        },
        "Crash no Web Worker de G-Code",
      );
    };

    // Envia o arquivo para o worker (Processamento paralelo real fora da main thread)
    worker.postMessage(arquivo);
  }, []);

  const limparAnalise = useCallback(() => {
    setEstado({ analisando: false, resultado: null, erro: null });
  }, []);

  return {
    ...estado,
    analisarArquivo,
    limparAnalise,
  };
}
