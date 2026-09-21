/**
 * Utilitário de Proteção contra Força Bruta e DoS (Rate Limiter em Memória de Borda)
 * Conforme normas de segurança e resiliência.
 */

interface RegistroRateLimit {
  contagem: number;
  expiraEm: number;
}

const memoriaRateLimit = new Map<string, RegistroRateLimit>();

// Limpeza preventiva para evitar vazamento de memória no isolate
function limparRegistrosExpirados(agora: number): void {
  if (memoriaRateLimit.size > 2000) {
    for (const [chave, registro] of memoriaRateLimit.entries()) {
      if (registro.expiraEm <= agora) {
        memoriaRateLimit.delete(chave);
      }
    }
  }
}

/**
 * Verifica se a requisição de um IP para determinado recurso excede o limite.
 * @param ip Endereço IP do cliente (extraído com segurança de cf-connecting-ip)
 * @param recurso Nome do endpoint ou ação protegida
 * @param limiteMaximo Número máximo de requisições permitidas na janela
 * @param janelaMs Janela de tempo em milissegundos (padrão: 60.000ms = 1 minuto)
 */
export function verificarRateLimit(
  ip: string,
  recurso: string,
  limiteMaximo = 30,
  janelaMs = 60_000
): { permitido: boolean; restante: number; segundosParaReset: number } {
  const agora = Date.now();
  limparRegistrosExpirados(agora);

  const chave = `${recurso}:${ip || "anonimo"}`;
  const registro = memoriaRateLimit.get(chave);

  if (!registro || registro.expiraEm <= agora) {
    // Nova janela
    memoriaRateLimit.set(chave, {
      contagem: 1,
      expiraEm: agora + janelaMs,
    });
    return {
      permitido: true,
      restante: limiteMaximo - 1,
      segundosParaReset: Math.ceil(janelaMs / 1000),
    };
  }

  // Janela ativa
  registro.contagem += 1;
  const segundosParaReset = Math.max(1, Math.ceil((registro.expiraEm - agora) / 1000));

  if (registro.contagem > limiteMaximo) {
    return {
      permitido: false,
      restante: 0,
      segundosParaReset,
    };
  }

  return {
    permitido: true,
    restante: limiteMaximo - registro.contagem,
    segundosParaReset,
  };
}
