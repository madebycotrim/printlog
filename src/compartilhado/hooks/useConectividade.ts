/**
 * @file useConectividade.ts
 * @description Hook de monitoramento do status de conexão à internet do usuário.
 * Dispara notificações automáticas ao perder e restabelecer a conexão.
 */

import { useEffect, useRef } from "react";
import { notificar } from "@/compartilhado/utilitarios/notificacao";

const ID_TOAST_CONEXAO = "status-conexao-rede";

export function useConectividade() {
  const primeiraMontagemRef = useRef(true);

  useEffect(() => {
    function lidarOffline() {
      notificar.erro("Sem conexão com a internet. Verifique sua rede.", {
        id: ID_TOAST_CONEXAO,
        duration: Infinity,
        description: "Operações que dependem do servidor podem falhar até a reconexão.",
      });
    }

    function lidarOnline() {
      // Ignora na montagem inicial se já estiver online
      if (primeiraMontagemRef.current) {
        primeiraMontagemRef.current = false;
        return;
      }

      notificar.sucesso("Conexão restabelecida!", {
        id: ID_TOAST_CONEXAO,
        duration: 4000,
        description: "A comunicação com o servidor foi normalizada.",
      });
    }

    // Marca montagem inicial concluída
    primeiraMontagemRef.current = false;

    // Se já carregar offline, avisa imediatamente
    if (!navigator.onLine) {
      lidarOffline();
    }

    window.addEventListener("offline", lidarOffline);
    window.addEventListener("online", lidarOnline);

    return () => {
      window.removeEventListener("offline", lidarOffline);
      window.removeEventListener("online", lidarOnline);
    };
  }, []);
}
