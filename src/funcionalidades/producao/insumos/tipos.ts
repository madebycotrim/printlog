export type UnidadeInsumo = "un" | "ml" | "L" | "g" | "kg" | "Rolo" | "Caixa" | "Par";
export type CategoriaInsumo = "Geral" | "Embalagem" | "Embrulho" | "Fixação" | "Eletrônica" | "Acabamento" | "Limpeza" | "Proteção" | "Outros";
export type MotivoBaixaInsumo = "Consumo" | "Descarte" | "Avaria" | "Ajuste" | "Outro";

export interface RegistroMovimentacaoInsumo {
    id: string;
    data: string;
    tipo: "Entrada" | "Saída";
    quantidade: number;
    valorTotal?: number; // Para Entradas
    motivo?: MotivoBaixaInsumo; // Para Saídas
    observacao?: string;
    responsavel?: string; // Futuro
}

export interface Insumo {
    id: string;
    nome: string;
    descricao?: string;
    categoria: CategoriaInsumo;
    unidadeMedida: UnidadeInsumo;

    quantidadeAtual: number;
    quantidadeMinima: number; // Para disparar o alerta de estoque
    custoMedioUnidade: number; // Média de preço ponderada 

    linkCompra?: string;
    marca?: string;
    itemFracionavel?: boolean;
    rendimentoTotal?: number;
    unidadeConsumo?: string;

    historico: RegistroMovimentacaoInsumo[];

    dataCriacao: Date;
    dataAtualizacao: Date;
    favorito?: boolean;
}
