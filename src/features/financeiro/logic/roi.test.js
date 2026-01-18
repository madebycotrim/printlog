import { describe, it, expect } from 'vitest';
import { calcularEstatisticasGlobais, calcularRoiPorImpressora } from './roi';

describe('Lógica Financeira (ROI)', () => {
    const mockProjects = [
        {
            data: {
                status: 'finalizado',
                printerId: "1",
                resultados: {
                    precoComDesconto: 100,
                    lucroBrutoUnitario: 50,
                    custoUnitario: 50,
                    quantidadePecas: 2
                }
            }
        },
        {
            data: {
                status: 'rascunho', // Deve ser ignorado
                printerId: "1",
                resultados: { precoComDesconto: 1000 }
            }
        }
    ];

    const mockPrinters = [
        { id: "1", nome: "Printer A", preco: 200 } // Custo 200
    ];

    describe('calcularEstatisticasGlobais', () => {
        it('deve somar apenas projetos finalizados', () => {
            const stats = calcularEstatisticasGlobais(mockProjects);
            // Projeto 1: 2 peças * 100 = 200 receita. 2 * 50 = 100 custo. 2 * 50 = 100 lucro.
            expect(stats.receitaTotal).toBe(200);
            expect(stats.lucroTotal).toBe(100);
        });
    });

    describe('calcularRoiPorImpressora', () => {
        it('deve calcular ROI corretamente', () => {
            const resultado = calcularRoiPorImpressora(mockProjects, mockPrinters);
            const printerA = resultado[0];

            expect(printerA.id).toBe("1");
            // Lucro gerado: 100. Custo Maquina: 200. ROI: (100/200)*100 = 50%
            expect(printerA.stats.profit).toBe(100);
            expect(printerA.roi).toBe(50);
        });
    });
});
