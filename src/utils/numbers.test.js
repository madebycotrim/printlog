import { describe, it, expect } from 'vitest';
import { analisarNumero, formatarMoeda } from './numbers';

describe('Utils: Numbers', () => {
    describe('analisarNumero (Parser)', () => {
        it('deve converter strings BRL (1.234,56) corretamente', () => {
            expect(analisarNumero('1.234,56')).toBe(1234.56);
            expect(analisarNumero('10,5')).toBe(10.5);
            expect(analisarNumero('R$ 150,00')).toBe(150.00);
        });

        it('deve converter strings US (1,234.56) corretamente', () => {
            expect(analisarNumero('1,234.56')).toBe(1234.56);
            expect(analisarNumero('10.5')).toBe(10.5);
            expect(analisarNumero('10.50')).toBe(10.5);
        });

        it('deve lidar com entradas sujas', () => {
            expect(analisarNumero('abc')).toBe(0);
            expect(analisarNumero('')).toBe(0);
            expect(analisarNumero(null)).toBe(0);
            expect(analisarNumero(undefined)).toBe(0);
        });
    });

    describe('formatarMoeda', () => {
        it('deve formatar valores corretamente', () => {
            // OBS: O espaço sem quebra (nbsp) pode variar entre ambientes (Node vs Browser).
            // Vamos verificar se contem o símbolo e o valor.
            const valor = formatarMoeda(1234.56);
            expect(valor).toContain('1.234,56');
            expect(valor).toMatch(/R\$\s?1\.234,56/);
        });
    });
});
