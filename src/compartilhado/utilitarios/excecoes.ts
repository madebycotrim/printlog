/**
 * @file excecoes.ts
 * @description Hierarquia de erros tipados conforme Regra 10.
 */

export enum CodigoErro {
    // Pedidos / Kanban
    PEDIDO_NAO_ENCONTRADO = 'PEDIDO_001',
    PEDIDO_TRANSICAO_PROIBIDA = 'PEDIDO_002',
    PEDIDO_PRAZO_INVALIDO = 'PEDIDO_003',

    // Fatiamento
    ARQUIVO_FATIAMENTO_INVALIDO = 'FATIA_001',
    FORMATO_NAO_SUPORTADO = 'FATIA_002',
    TAMANHO_EXCEDIDO = 'FATIA_003',

    // Filamento / Estoque
    FILAMENTO_ESTOQUE_INSUFICIENTE = 'FILA_001',
    MATERIAL_NAO_CADASTRADO = 'FILA_002',
    FILAMENTO_NAO_ENCONTRADO = 'FILA_003',

    // Impressora
    IMPRESSORA_NAO_ENCONTRADA = 'IMP_001',
    IMPRESSORA_INDISPONIVEL = 'IMP_002',

    // Financeiro
    LANCAMENTO_VALOR_INVALIDO = 'FIN_001',
    LANCAMENTO_NAO_ENCONTRADO = 'FIN_002',

    // Autenticação
    CREDENCIAIS_INVALIDAS = 'AUTH_001',
    TOKEN_EXPIRADO = 'AUTH_002',
    PERMISSAO_INSUFICIENTE = 'AUTH_003',

    // LGPD
    CONSENTIMENTO_NAO_ENCONTRADO = 'LGPD_001',
    TITULAR_JA_ANONIMIZADO = 'LGPD_002',

    // Sistema
    SERVICO_INDISPONIVEL = 'SYS_001',
    ERRO_INTERNO = 'SYS_002',
}

export class ErroPrintLog extends Error {
    constructor(
        public readonly mensagem: string,
        public readonly codigo: CodigoErro,
        public readonly contexto?: Record<string, unknown>,
        public readonly causaOriginal?: unknown,
    ) {
        super(mensagem);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, ErroPrintLog.prototype);
    }
}

export class ErroValidacao extends ErroPrintLog { } // 400
export class ErroNaoAutenticado extends ErroPrintLog { } // 401
export class ErroPermissao extends ErroPrintLog { } // 403
export class ErroNaoEncontrado extends ErroPrintLog { } // 404
export class ErroConflito extends ErroPrintLog { } // 409
export class ErroExterno extends ErroPrintLog { } // 502
export class ErroInterno extends ErroPrintLog { } // 500

/**
 * Contrato de Resposta de Erro (API)
 */
export interface RespostaErroApi {
    codigo: CodigoErro;
    mensagem: string;      // PT-BR, amigável
    detalhes?: string[];   // campos inválidos — só ErroValidacao
    rastreioId: string;
}
