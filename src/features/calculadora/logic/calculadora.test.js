import { describe, it, expect } from 'vitest';
import { calcularTudo } from './calculadora';

describe('Calculadora de Preços (calcularTudo)', () => {
    it('deve calcular custos básicos corretamente', () => {
        const input = {
            qtdPecas: 1,
            config: {
                custoKwh: 1.0,           // R$ 1,00 / kWh
                consumoKw: 0.2,          // 200W
                valorHoraHumana: 50.0,   // R$ 50,00 / h
                custoHoraMaquina: 10.0,  // R$ 10,00 / h
                margemLucro: 50,         // 50%
                imposto: 0,
                taxaFalha: 0
            },
            tempo: {
                impressaoHoras: 1,
                impressaoMinutos: 0,     // 1h de impressão
                trabalhoHoras: 1,
                trabalhoMinutos: 0       // 1h de trabalho
            },
            material: {
                custoRolo: 100,          // R$ 100,00 / kg
                pesoModelo: 100          // 100g
            },
            custosExtras: { embalagem: 5, frete: 0, lista: [] },
            vendas: { taxaMarketplace: 0, desconto: 0 }
        };

        const resultado = calcularTudo(input);

        // Verificações
        // Material: 100g * (100/1000) = R$ 10,00
        expect(resultado.custoMaterial).toBe(10.00);

        // Energia: 1h * 0.2kW * R$1.00 = R$ 0,20
        expect(resultado.custoEnergia).toBe(0.20);

        // Maquina: 1h * R$10.00 = R$ 10,00
        expect(resultado.custoMaquina).toBe(10.00);

        // Reserva Manutenção: 10% da maquina = R$ 1,00
        expect(resultado.reservaManutencao).toBe(1.00);

        // Mão de Obra: 1h * R$50.00 = R$ 50,00
        expect(resultado.custoMaoDeObra).toBe(50.00);

        // Embalagem: R$ 5,00
        expect(resultado.custoEmbalagem).toBe(5.00);

        // Custo Total Operacional: 10 + 0.2 + 10 + 1 + 50 + 5 = 76.20
        // custoDiretoTotal = 71.20
        // custoFixoSaida = 5.00
        // Conferir a soma lógica: 10+0.2+10+1+50 = 71.2 + 5 = 76.2
        expect(resultado.custoUnitario).toBe(76.20);
    });

    it('deve aplicar margem de lucro corretamente (Multiplier Markup)', () => {
        // Custo = 100. Markup = 50%. Preço Venda = 100 * (1 + 0.5) = 150.
        const input = {
            qtdPecas: 1,
            config: {
                custoKwh: 0, consumoKw: 0, valorHoraHumana: 0, custoHoraMaquina: 0, taxaSetup: 0,
                margemLucro: 50, // 50%
                imposto: 0, taxaFalha: 0
            },
            tempo: { impressaoHoras: 0, impressaoMinutos: 0, trabalhoHoras: 0, trabalhoMinutos: 0 },
            material: { custoRolo: 1000, pesoModelo: 100 }, // R$ 100,00 custo
            custosExtras: { embalagem: 0, frete: 0 },
            vendas: { taxaMarketplace: 0, desconto: 0 }
        };

        const resultado = calcularTudo(input);
        expect(resultado.custoMaterial).toBe(100.00);
        expect(resultado.custoUnitario).toBe(100.00);
        expect(resultado.precoSugerido).toBe(150.00);
        expect(resultado.lucroBrutoUnitario).toBe(50.00);
    });

    it('deve lidar com entradas inválidas ou zero sem quebrar', () => {
        const input = { qtdPecas: 0 }; // Deve ser tratado como 1
        const resultado = calcularTudo(input);
        expect(resultado.quantidadePecas).toBe(1);
        expect(resultado.custoMaterial).toBe(0);
        expect(resultado.precoSugerido).toBe(0);
    });
});
