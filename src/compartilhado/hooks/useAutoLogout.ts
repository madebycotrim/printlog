/**
 * @file useAutoLogout.ts
 * @description Hook de segurança que detecta inatividade do usuário e realiza logout automático.
 * Evita que sessões fiquem abertas indefinidamente em computadores compartilhados/estúdios.
 * @lgpd Base legal: Legítimo Interesse — proteção de sessão contra acesso indevido.
 */

import { useEffect, useRef, useCallback } from "react";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { registrar } from "@/compartilhado/utilitarios/registrador";
import { toast } from "sonner";

/** Tempo de inatividade antes do logout automático: 30 minutos */
const TEMPO_INATIVIDADE_MS = 30 * 60 * 1000;

/** Tempo para aviso prévio antes do logout: 29 minutos (1 minuto antes) */
const TEMPO_AVISO_PREVIO_MS = 29 * 60 * 1000;

/** Eventos que indicam que o usuário está ativo */
const EVENTOS_ATIVIDADE: (keyof DocumentEventMap)[] = [
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
];

/**
 * Hook que monitora atividade do usuário e realiza logout após inatividade prolongada.
 * Inclui aviso prévio de 1 minuto (grace period) permitindo manter a sessão aberta.
 * Deve ser usado dentro de um componente que esteja sempre montado (ex: Layout).
 */
export function useAutoLogout() {
  const { usuario, sair } = useAutenticacao();
  const temporizadorLogoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const temporizadorAvisoRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reiniciarTemporizadorRef = useRef<() => void>(() => {});

  const executarLogout = useCallback(async () => {
    if (!usuario) return;

    toast.dismiss("aviso-auto-logout");

    registrar.warn(
      { rastreioId: usuario.uid, servico: "Seguranca", evento: "AUTO_LOGOUT" },
      `Logout automático por inatividade (${TEMPO_INATIVIDADE_MS / 60000} min)`,
    );

    try {
      toast("Sua sessão expirou por inatividade (30 min).", { icon: "💤", duration: 5000, id: "auto-logout" });
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
    if (temporizadorLogoutRef.current) {
      clearTimeout(temporizadorLogoutRef.current);
    }
    if (temporizadorAvisoRef.current) {
      clearTimeout(temporizadorAvisoRef.current);
    }

    toast.dismiss("aviso-auto-logout");

    // Agenda o aviso prévio 1 minuto antes
    temporizadorAvisoRef.current = setTimeout(() => {
      toast.warning("Sua sessão irá expirar em 1 minuto por inatividade.", {
        id: "aviso-auto-logout",
        duration: 59000,
        action: {
          label: "Continuar conectado",
          onClick: () => {
            reiniciarTemporizadorRef.current?.();
          },
        },
      });
    }, TEMPO_AVISO_PREVIO_MS);

    // Agenda o logout efetivo
    temporizadorLogoutRef.current = setTimeout(executarLogout, TEMPO_INATIVIDADE_MS);
  }, [executarLogout]);

  useEffect(() => {
    reiniciarTemporizadorRef.current = reiniciarTemporizador;
  }, [reiniciarTemporizador]);

  useEffect(() => {
    // Só ativa se houver usuário logado
    if (!usuario) return;

    // Inicia o temporizador
    reiniciarTemporizador();

    // Reinicia a cada interação do usuário com throttle de 10s para não sobrecarregar a thread principal
    let ultimaAtividade = Date.now();
    const lidarComAtividade = () => {
      const agora = Date.now();
      if (agora - ultimaAtividade > 10000) {
        ultimaAtividade = agora;
        reiniciarTemporizador();
      }
    };

    for (const evento of EVENTOS_ATIVIDADE) {
      document.addEventListener(evento, lidarComAtividade, { passive: true });
    }

    return () => {
      if (temporizadorLogoutRef.current) {
        clearTimeout(temporizadorLogoutRef.current);
      }
      if (temporizadorAvisoRef.current) {
        clearTimeout(temporizadorAvisoRef.current);
      }
      toast.dismiss("aviso-auto-logout");

      for (const evento of EVENTOS_ATIVIDADE) {
        document.removeEventListener(evento, lidarComAtividade);
      }
    };
  }, [usuario, reiniciarTemporizador]);
}
