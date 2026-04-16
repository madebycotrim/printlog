import { Material } from "@/funcionalidades/producao/materiais/tipos";

/**
 * Fábrica para criar objetos de Material sintéticos para testes.
 * Padrão: PLA, 1000g, cor preta.
 */
export function fabricarFilamento(override: Partial<Material> = {}): Material {
    return {
        id: crypto.randomUUID(),
        nome: "Filamento Teste",
        fabricante: "PrintLog Corp",
        tipo: "FDM",
        tipoMaterial: "PLA",
        cor: "Preto",
        pesoGramas: 1000,
        pesoRestanteGramas: 1000,
        estoque: 1,
        precoCentavos: 12000, // R$ 120,00
        historicoUso: [],
        ...override,
    };
}
