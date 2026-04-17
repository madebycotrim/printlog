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
  const regras: RegraValidacaoSenha[] = [
    {
      id: "comprimento",
      descricao: "Mínimo de 12 caracteres",
      atendida: senha.length >= 12,
    },
    {
      id: "maiuscula",
      descricao: "Pelo menos uma letra maiúscula",
      atendida: /[A-Z]/.test(senha),
    },
    {
      id: "minuscula",
      descricao: "Pelo menos uma letra minúscula",
      atendida: /[a-z]/.test(senha),
    },
    {
      id: "numero",
      descricao: "Pelo menos um número",
      atendida: /[0-9]/.test(senha),
    },
    {
      id: "especial",
      descricao: "Pelo menos um caractere especial (!@#$%...)",
      atendida: /[^A-Za-z0-9]/.test(senha),
    },
  ];

  const regrasAtendidas = regras.filter((r) => r.atendida).length;
  const totalRegras = regras.length;

  let forca: "fraca" | "media" | "forte";
  if (regrasAtendidas <= 2) {
    forca = "fraca";
  } else if (regrasAtendidas < totalRegras) {
    forca = "media";
  } else {
    forca = "forte";
  }

  return {
    valida: regrasAtendidas === totalRegras,
    regras,
    forca,
  };
}
