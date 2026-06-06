/**
 * @file useAutoLogout.ts
 * @description Hook de segurança que detecta inatividade do usuário e realiza logout automático.
 * Evita que sessões fiquem abertas indefinidamente em computadores compartilhados/estúdios.
 * @lgpd Base legal: Legítimo Interesse — proteção de sessão contra acesso indevido.
 */

import { useEffect, useRef, useCallback } from "react";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { registrar } from "@/compartilhado/utilitarios/registrador";
import { toast } from "react-hot-toast";

/** Tempo de inatividade antes do logout automático: 30 minutos */
const TEMPO_INATIVIDADE_MS = 30 * 60 * 1000;

/** Eventos que indicam que o usuário está ativo */
const EVENTOS_ATIVIDADE: (keyof DocumentEventMap)[] = [
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
];

/**
 * Hook que monitora atividade do usuário e realiza logout após inatividade prolongada.
 * Deve ser usado dentro de um componente que esteja sempre montado (ex: Layout).
 */
export function useAutoLogout() {
  const { usuario, sair } = useAutenticacao();
  const temporizadorRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const executarLogout = useCallback(async () => {
    if (!usuario) return;

    registrar.warn(
      { rastreioId: usuario.uid, servico: "Seguranca", evento: "AUTO_LOGOUT" },
      `Logout automático por inatividade (${TEMPO_INATIVIDADE_MS / 60000} min)`,
    );

    try {
      toast("Sua sessão expirou por inatividade (30 min).", { icon: "💤", duration: Infinity, id: "auto-logout" });
      await sair(false);
    } catch (erro) {
      registrar.error(
        { rastreioId: "sistema", servico: "Seguranca" },
        "Erro no auto-logout",
        erro,
      );
    }
  }, [usuario, sair]);

  const reiniciarTemporizador = useCallback(() => {
    if (temporizadorRef.current) {
      clearTimeout(temporizadorRef.current);
    }
    temporizadorRef.current = setTimeout(executarLogout, TEMPO_INATIVIDADE_MS);
  }, [executarLogout]);

  useEffect(() => {
    // Só ativa se houver usuário logado
    if (!usuario) return;

    // Inicia o temporizador
    reiniciarTemporizador();

    // Reinicia a cada interação do usuário
    const lidarComAtividade = () => reiniciarTemporizador();

    for (const evento of EVENTOS_ATIVIDADE) {
      document.addEventListener(evento, lidarComAtividade, { passive: true });
    }

    return () => {
      if (temporizadorRef.current) {
        clearTimeout(temporizadorRef.current);
      }
      for (const evento of EVENTOS_ATIVIDADE) {
        document.removeEventListener(evento, lidarComAtividade);
      }
    };
  }, [usuario, reiniciarTemporizador]);
}
