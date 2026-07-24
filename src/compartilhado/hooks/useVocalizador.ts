import { useState, useEffect } from "react";
import { vocalizadorVoz } from "@/compartilhado/utilitarios/vocalizadorVoz";

/**
 * Hook global para controlar a vocalização de tela por voz.
 * Suporta o atalho de teclado Alt + V em todo o sistema.
 */
export function useVocalizador() {
  const [status, setStatus] = useState(() => vocalizadorVoz.obterStatus());

  useEffect(() => {
    const unsub = vocalizadorVoz.subscrever((novoStatus) => {
      setStatus(novoStatus);
    });
    return unsub;
  }, []);

  // Escuta atalho global Alt + V
  useEffect(() => {
    function lidarComAtalho(e: KeyboardEvent) {
      if (e.altKey && (e.key === "v" || e.key === "V")) {
        e.preventDefault();
        vocalizadorVoz.vocalizarTela();
      }
    }
    window.addEventListener("keydown", lidarComAtalho);
    return () => window.removeEventListener("keydown", lidarComAtalho);
  }, []);

  return {
    falando: status.falando,
    pausado: status.pausado,
    vocalizar: (texto?: string) => vocalizadorVoz.vocalizarTela(texto),
    pausarOuContinuar: () => vocalizadorVoz.pausarOuContinuar(),
    parar: () => vocalizadorVoz.parar(),
    definirVelocidade: (vel: number) => vocalizadorVoz.definirVelocidade(vel),
  };
}
