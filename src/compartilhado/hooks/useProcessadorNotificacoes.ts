/**
 * @file useProcessadorNotificacoes.ts
 * @description Hook para processar alertas automáticos periodicamente.
 */

import { useEffect } from "react";
import { usePedidos } from "@/funcionalidades/producao/projetos/hooks/usePedidos";
import { useArmazemImpressoras } from "@/funcionalidades/producao/impressoras/estado/armazemImpressoras";
import { servicoNotificacoes } from "../servicos/servicoNotificacoes";

export function useProcessadorNotificacoes() {
  const { pedidos } = usePedidos();
  const impressoras = useArmazemImpressoras((s) => s.impressoras);

  useEffect(() => {
    // Processa alertas na montagem e sempre que os dados mudarem significativamente
    if (pedidos.length > 0 || impressoras.length > 0) {
      servicoNotificacoes.processarAlertasAutomaticos(pedidos, impressoras);
    }

    // Configura um intervalo de verificação a cada 5 minutos
    const intervalo = setInterval(
      () => {
        servicoNotificacoes.processarAlertasAutomaticos(pedidos, impressoras);
      },
      1000 * 60 * 5,
    );

    return () => clearInterval(intervalo);
  }, [pedidos, impressoras]);
}
