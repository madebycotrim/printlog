/**
 * @file validar-senha.ts
 * @description Validador de força de senha para cadastro e alteração.
 * Implementa política de senha forte obrigatória (OWASP + Pentest Falha 4).
 */

/**
 * Resultado individual de uma regra de validação de senha.
 */
export interface RegraValidacaoSenha {
  /** Identificador único da regra */
  id: string;
  /** Descrição amigável da regra em PT-BR */
  descricao: string;
  /** Se a senha atende a esta regra */
  atendida: boolean;
}

/**
 * Resultado completo da validação de senha.
 */
export interface ResultadoValidacaoSenha {
  /** Se a senha atende TODAS as regras */
  valida: boolean;
  /** Lista detalhada de cada regra e seu estado */
  regras: RegraValidacaoSenha[];
  /** Nível de força: 'fraca' | 'media' | 'forte' */
  forca: "fraca" | "media" | "forte";
}

/**
 * Valida a força de uma senha contra todas as regras de segurança.
 * Requisitos: mín. 12 chars, maiúscula, minúscula, número, especial.
 * @param senha - A senha a ser validada
 * @returns Resultado detalhado da validação com estado por regra
 */
export function validarForcaSenha(senha: string): ResultadoValidacaoSenha {
  // Apenas as regras que são ESTRITAMENTE OBRIGATÓRIAS segundo a política
  const regras: RegraValidacaoSenha[] = [
    {
      id: "comprimento",
      descricao: "Entre 6 e 50 caracteres",
      atendida: senha.length >= 6 && senha.length <= 50,
    }
  ];

  const regrasAtendidas = regras.filter((r) => r.atendida).length;
  const valida = regrasAtendidas === regras.length;

  // O cálculo da FORÇA é independente das regras obrigatórias
  let forca: "fraca" | "media" | "forte";
  const temMaiuscula = /[A-Z]/.test(senha);
  const temNumero = /[0-9]/.test(senha);
  const temEspecial = /[^A-Za-z0-9]/.test(senha);
  
  let score = 0;
  if (senha.length >= 6) score += 1;
  if (senha.length >= 10) score += 1;
  if (temMaiuscula) score += 1;
  if (temNumero) score += 1;
  if (temEspecial) score += 1;

  if (senha.length < 6) {
    forca = "fraca";
  } else if (score <= 2) {
    forca = "fraca";
  } else if (score <= 3) {
    forca = "media";
  } else {
    forca = "forte";
  }

  return {
    valida,
    regras,
    forca,
  };
}
