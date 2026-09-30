/**
 * Utilitário de Gestão de Dispositivos Confiáveis e Validação 2FA (RFC 6238 TOTP)
 * Permite memorizar dispositivos seguros por 30 dias, evitando solicitações
 * repetitivas de 2FA em navegadores autorizados pelo usuário.
 */

export interface DispositivoConfiavelInfo {
  idDispositivo: string;
  criadoEm: number;
  expiraEm: number;
  email?: string;
}

export const CHAVE_PREFIXO_DISPOSITIVO_CONFIAVEL = "printlog:2fa_dispositivo_confiavel_";
export const CHAVE_LEGADA_DISPOSITIVO_CONFIAVEL = "printlog:2fa_dispositivo_confiavel";
export const CHAVE_2FA_STATUS = "printlog:2fa_ativo";
export const CHAVE_2FA_SEGREDO = "printlog:2fa_segredo";
export const CHAVE_2FA_BACKUP = "printlog:2fa_codigos_backup";
export const CHAVE_SESSAO_VALIDADA = "printlog:2fa_sessao_validada";
export const DIAS_VALIDADE_DISPOSITIVO = 30;

export function obterChaveDispositivo(uid?: string): string {
  return uid ? `${CHAVE_PREFIXO_DISPOSITIVO_CONFIAVEL}${uid}` : CHAVE_LEGADA_DISPOSITIVO_CONFIAVEL;
}

export function obterChave2FAAtivo(uid?: string): string {
  return uid ? `${CHAVE_2FA_STATUS}_${uid}` : CHAVE_2FA_STATUS;
}

export function obterChave2FASegredo(uid?: string): string {
  return uid ? `${CHAVE_2FA_SEGREDO}_${uid}` : CHAVE_2FA_SEGREDO;
}

export function obterChave2FABackup(uid?: string): string {
  return uid ? `${CHAVE_2FA_BACKUP}_${uid}` : CHAVE_2FA_BACKUP;
}

export function obterChaveSessaoValidada(uid?: string): string {
  return uid ? `${CHAVE_SESSAO_VALIDADA}_${uid}` : CHAVE_SESSAO_VALIDADA;
}

/**
 * Checa se o 2FA está ativado para o usuário (ou globalmente em fallback).
 */
export function is2FAAtivo(uid?: string): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;
  
  const statusEspecifico = uid ? localStorage.getItem(obterChave2FAAtivo(uid)) : null;
  const statusGeral = localStorage.getItem(CHAVE_2FA_STATUS);
  const ativo = statusEspecifico === "true" || statusGeral === "true";
  
  if (!ativo) return false;

  // Garante que existe segredo salvo
  const segredo = (uid && localStorage.getItem(obterChave2FASegredo(uid))) || localStorage.getItem(CHAVE_2FA_SEGREDO);
  return !!segredo;
}

/**
 * Retorna o segredo Base32 do 2FA do usuário.
 */
export function obterSegredo2FA(uid?: string): string | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  return (uid && localStorage.getItem(obterChave2FASegredo(uid))) || localStorage.getItem(CHAVE_2FA_SEGREDO);
}

/**
 * Retorna os códigos de recuperação do usuário.
 */
export function obterCodigosBackup2FA(uid?: string): string[] {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = (uid && localStorage.getItem(obterChave2FABackup(uid))) || localStorage.getItem(CHAVE_2FA_BACKUP);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Atualiza os códigos de recuperação restantes após uso de um código de emergência.
 */
export function salvarCodigosBackup2FA(codigos: string[], uid?: string): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  const serializado = JSON.stringify(codigos);
  if (uid) {
    localStorage.setItem(obterChave2FABackup(uid), serializado);
  }
  localStorage.setItem(CHAVE_2FA_BACKUP, serializado);
}

/**
 * Verifica se o dispositivo atual é confiável para este usuário (dentro do prazo de 30 dias).
 */
export function verificarDispositivoConfiavel(uid?: string): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;
  
  const chavesParaTestar = [
    obterChaveDispositivo(uid),
    CHAVE_LEGADA_DISPOSITIVO_CONFIAVEL,
  ];

  for (const chave of chavesParaTestar) {
    try {
      const raw = localStorage.getItem(chave);
      if (!raw) continue;

      const dados: DispositivoConfiavelInfo = JSON.parse(raw);
      if (!dados || typeof dados.expiraEm !== "number") {
        localStorage.removeItem(chave);
        continue;
      }

      const agora = Date.now();
      if (agora > dados.expiraEm) {
        // Expirou após 30 dias
        localStorage.removeItem(chave);
        continue;
      }

      // Válido!
      return true;
    } catch {
      localStorage.removeItem(chave);
    }
  }

  return false;
}

/**
 * Obtém detalhes do dispositivo confiável (tempo restante, etc).
 */
export function obterDetalhesDispositivoConfiavel(uid?: string): {
  idDispositivo: string;
  criadoEm: number;
  expiraEm: number;
  diasRestantes: number;
} | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  
  const chavesParaTestar = [
    obterChaveDispositivo(uid),
    CHAVE_LEGADA_DISPOSITIVO_CONFIAVEL,
  ];

  for (const chave of chavesParaTestar) {
    try {
      const raw = localStorage.getItem(chave);
      if (!raw) continue;

      const dados: DispositivoConfiavelInfo = JSON.parse(raw);
      const agora = Date.now();
      if (!dados.expiraEm || agora > dados.expiraEm) {
        localStorage.removeItem(chave);
        continue;
      }

      const diasRestantes = Math.max(1, Math.ceil((dados.expiraEm - agora) / (24 * 60 * 60 * 1000)));
      return {
        idDispositivo: dados.idDispositivo || "dispositivo_atual",
        criadoEm: dados.criadoEm || agora,
        expiraEm: dados.expiraEm,
        diasRestantes,
      };
    } catch {
      localStorage.removeItem(chave);
    }
  }

  return null;
}

/**
 * Salva o dispositivo atual como confiável por 30 dias.
 */
export function salvarDispositivoConfiavel(uid?: string, email?: string): DispositivoConfiavelInfo {
  let idDispositivo = localStorage.getItem("printlog:device_session_id");
  if (!idDispositivo) {
    idDispositivo = `dev_${crypto.randomUUID().slice(0, 16)}`;
    localStorage.setItem("printlog:device_session_id", idDispositivo);
  }

  const agora = Date.now();
  const expiraEm = agora + DIAS_VALIDADE_DISPOSITIVO * 24 * 60 * 60 * 1000;

  const dados: DispositivoConfiavelInfo = {
    idDispositivo,
    criadoEm: agora,
    expiraEm,
    email: email || undefined,
  };

  const serializado = JSON.stringify(dados);
  if (uid) {
    localStorage.setItem(obterChaveDispositivo(uid), serializado);
  }
  localStorage.setItem(CHAVE_LEGADA_DISPOSITIVO_CONFIAVEL, serializado);

  return dados;
}

/**
 * Remove o status de confiável deste dispositivo.
 */
export function removerDispositivoConfiavel(uid?: string): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  if (uid) {
    localStorage.removeItem(obterChaveDispositivo(uid));
  }
  localStorage.removeItem(CHAVE_LEGADA_DISPOSITIVO_CONFIAVEL);
}

/**
 * Verifica se a sessão atual (guia do navegador) já foi validada com 2FA.
 */
export function isSessaoValidada(uid?: string): boolean {
  if (typeof window === "undefined" || !window.sessionStorage) return false;
  return (
    sessionStorage.getItem(obterChaveSessaoValidada(uid)) === "true" ||
    sessionStorage.getItem(CHAVE_SESSAO_VALIDADA) === "true"
  );
}

/**
 * Marca a sessão atual como validada com 2FA.
 */
export function marcarSessaoValidada(uid?: string): void {
  if (typeof window === "undefined" || !window.sessionStorage) return;
  if (uid) {
    sessionStorage.setItem(obterChaveSessaoValidada(uid), "true");
  }
  sessionStorage.setItem(CHAVE_SESSAO_VALIDADA, "true");
}

/**
 * Limpa o status de sessão validada.
 */
export function limparSessaoValidada(uid?: string): void {
  if (typeof window === "undefined" || !window.sessionStorage) return;
  if (uid) {
    sessionStorage.removeItem(obterChaveSessaoValidada(uid));
  }
  sessionStorage.removeItem(CHAVE_SESSAO_VALIDADA);
}
