import api from '../../../utils/api';
import { analisarNumero } from "../../../utils/numbers";


/**
 * MOTOR DE CÁLCULO PROFISSIONAL (MÉTODO COMERCIAL)
 * Calcula custos, formação de preço por markup e análise de lucro real.
 */
export function calcularTudo(dadosEntrada = {}) {
    // Helper para extração segura de números
    const obterValor = (caminho, caminhoAlternativo) => {
        const partes = caminho.split('.');
        let valor = dadosEntrada;
        for (const parte of partes) {
            valor = valor?.[parte];
        }
        const resultado = valor !== undefined ? valor : dadosEntrada[caminhoAlternativo];
        return analisarNumero(resultado);
    };

    const quantidade = Math.max(1, obterValor('qtdPecas', 'qtdPecas'));

    // Parâmetros normalizados para o cálculo
    const p = {
        quantidade,
        custoKwh: obterValor('config.custoKwh', 'custoKwh'),
        valorHoraHumana: obterValor('config.valorHoraHumana', 'valorHoraHumana'),
        custoHoraMaquina: obterValor('config.custoHoraMaquina', 'custoHoraMaquina'),
        taxaSetup: obterValor('config.taxaSetup', 'taxaSetup'),
        embalagem: obterValor('custosExtras.embalagem', 'custoEmbalagem'),
        frete: obterValor('custosExtras.frete', 'custoFrete'),
        extras: Array.isArray(dadosEntrada.custosExtras?.lista) ? dadosEntrada.custosExtras.lista.reduce((acc, item) => acc + analisarNumero(item?.valor), 0) : 0,
        margemLucro: obterValor('config.margemLucro', 'margemLucro') / 100,
        imposto: obterValor('config.imposto', 'imposto') / 100,
        taxaMkt: obterValor('vendas.taxaMarketplace', 'taxaMarketplace') / 100,
        taxaMktFixa: obterValor('vendas.taxaMarketplaceFixa', 'taxaMarketplaceFixa'),
        desconto: obterValor('vendas.desconto', 'desconto') / 100,
        taxaFalha: obterValor('config.taxaFalha', 'taxaFalha') / 100,

        tempoImp: obterValor('tempo.impressaoHoras', 'tempoImpressaoHoras') + (obterValor('tempo.impressaoMinutos', 'tempoImpressaoMinutos') / 60),
        tempoTrab: obterValor('tempo.trabalhoHoras', 'tempoTrabalhoHoras') + (obterValor('tempo.trabalhoMinutos', 'tempoTrabalhoMinutos') / 60),
        consumoKw: obterValor('config.consumoKw', 'consumoImpressoraKw')
    };

    // --- CÁLCULO DE MATERIAIS (Suporta Simples e Multi-Material) ---
    let custoMaterialUnitario = 0;
    const slots = Array.isArray(dadosEntrada.material?.slots) ? dadosEntrada.material.slots : [];
    if (slots.length > 0) {
        custoMaterialUnitario = slots.reduce((acc, slot) => {
            const weight = parseFloat(String(slot?.weight || "0").replace(',', '.')) || 0;
            const priceKg = parseFloat(String(slot?.priceKg || "0").replace(',', '.')) || 0;
            const custoSlot = (priceKg / 1000) * weight;
            return acc + (isFinite(custoSlot) ? custoSlot : 0);
        }, 0);
    } else {
        const custoRolo = Math.max(0, obterValor('material.custoRolo', 'custoRolo'));
        const pesoModelo = Math.max(0, obterValor('material.pesoModelo', 'pesoModelo'));
        custoMaterialUnitario = (custoRolo / 1000) * pesoModelo;
    }
    // Garante que o custo material seja não-negativo e finito
    custoMaterialUnitario = isFinite(custoMaterialUnitario) ? Math.max(0, custoMaterialUnitario) : 0;

    // --- CUSTOS OPERACIONAIS UNITÁRIOS ---
    // Garante que todos os valores sejam não-negativos
    const tempoImpSeguro = Math.max(0, p.tempoImp);
    const tempoTrabSeguro = Math.max(0, p.tempoTrab);
    const consumoKwSeguro = Math.max(0, p.consumoKw);
    const custoKwhSeguro = Math.max(0, p.custoKwh);
    const custoHoraMaquinaSeguro = Math.max(0, p.custoHoraMaquina);
    const valorHoraHumanaSeguro = Math.max(0, p.valorHoraHumana);
    const taxaSetupSegura = Math.max(0, p.taxaSetup);

    const custoEnergiaUnit = Math.max(0, (tempoImpSeguro * consumoKwSeguro * custoKwhSeguro) / p.quantidade);
    const custoBaseMaquinaUnit = Math.max(0, (tempoImpSeguro * custoHoraMaquinaSeguro) / p.quantidade);
    const reservaManutencaoUnit = Math.max(0, custoBaseMaquinaUnit * 0.10); // 10% de reserva padrão
    const custoMaoDeObraUnit = Math.max(0, (tempoTrabSeguro * valorHoraHumanaSeguro) / p.quantidade);
    const custoSetupUnit = Math.max(0, taxaSetupSegura / p.quantidade);

    const custoDiretoTotal = Math.max(0, custoMaterialUnitario + custoEnergiaUnit + custoBaseMaquinaUnit + reservaManutencaoUnit + custoMaoDeObraUnit + custoSetupUnit);

    // Aplicação da Taxa de Falha (Risco)
    // Proteção contra divisão por zero: garante que fatorFalhaSeguro seja sempre < 1
    const fatorFalhaSeguro = Math.min(Math.max(p.taxaFalha, 0), 0.99);
    const divisorFalha = Math.max(0.01, 1 - fatorFalhaSeguro); // Garante mínimo de 0.01 para evitar divisão por zero
    const custoComRisco = custoDiretoTotal / divisorFalha;
    const valorRiscoUnitario = Math.max(0, custoComRisco - custoDiretoTotal);

    const custoFixoSaidaUnitario = Math.max(0, p.embalagem) + Math.max(0, p.frete) + (Math.max(0, p.extras) / p.quantidade);
    const custoTotalOperacional = custoComRisco + custoFixoSaidaUnitario;

    // --- FORMAÇÃO DE PREÇO (MARKUP / COST PLUS) ---
    // Agora 'margemLucro' é tratada como MARKUP sobre o custo operacional
    // Fórmula: Preço = ( (CustoOp * (1 + Markup)) + TaxasFixas ) / (1 - Impostos - Comissões%)

    const somaTaxasVenda = Math.min(0.99, Math.max(0, p.imposto + p.taxaMkt));
    const divisorTaxas = Math.max(0.01, 1 - somaTaxasVenda); // Divisor apenas das taxas de venda

    // Markup Multiplier: 50% => 1.5x
    const markupMultiplier = 1 + p.margemLucro;

    const taxaMktFixaUnit = Math.max(0, p.taxaMktFixa) / p.quantidade;

    // Cálculo do Preço Sugerido com base no Markup
    const precoSugerido = Math.max(0, ((custoTotalOperacional * markupMultiplier) + taxaMktFixaUnit) / divisorTaxas);

    const descontoSeguro = Math.min(Math.max(p.desconto, 0), 0.99); // Garante desconto entre 0 e 99%
    const precoComDesconto = Math.max(0, precoSugerido * (1 - descontoSeguro));

    // --- ANÁLISE REAL DE RESULTADOS ---
    const impostoReal = Math.max(0, precoComDesconto * Math.max(0, p.imposto));
    const taxaMktReal = Math.max(0, (precoComDesconto * Math.max(0, p.taxaMkt)) + taxaMktFixaUnit);
    const lucroLiquidoReal = Math.max(0, precoComDesconto - impostoReal - taxaMktReal - custoTotalOperacional);
    const margemEfetivaReal = precoComDesconto > 0.01 ? (lucroLiquidoReal / precoComDesconto) * 100 : 0;

    // Função de arredondamento seguro que protege contra NaN, Infinity e valores negativos
    const arredondar = (num) => {
        if (typeof num !== 'number' || !isFinite(num) || isNaN(num)) return 0;
        const valorSeguro = Math.max(0, num); // Garante que não seja negativo
        return Math.round((valorSeguro + Number.EPSILON) * 100) / 100;
    };

    return {
        custoMaterial: arredondar(custoMaterialUnitario),
        custoEnergia: arredondar(custoEnergiaUnit),
        custoMaquina: arredondar(custoBaseMaquinaUnit),
        reservaManutencao: arredondar(reservaManutencaoUnit),
        custoMaoDeObra: arredondar(custoMaoDeObraUnit),
        custoSetup: arredondar(custoSetupUnit),
        custoEmbalagem: arredondar(Math.max(0, p.embalagem)),
        custoFrete: arredondar(Math.max(0, p.frete)),
        custosExtras: arredondar(Math.max(0, p.extras) / p.quantidade),
        valorRisco: arredondar(valorRiscoUnitario),
        valorImpostos: arredondar(impostoReal),
        valorMarketplace: arredondar(taxaMktReal),
        custoUnitario: arredondar(custoTotalOperacional),
        precoSugerido: arredondar(precoSugerido),
        precoComDesconto: arredondar(precoComDesconto),
        lucroBrutoUnitario: arredondar(lucroLiquidoReal),
        margemEfetivaPct: arredondar(margemEfetivaReal),
        tempoTotalHoras: arredondar(Math.max(0, p.tempoImp)),
        quantidadePecas: Math.max(1, p.quantidade)
    };
}

/**
 * (DEPRECATED) ZUSTAND STORE REMOVIDO
 * Migrado para React Query em src/features/sistema/logic/settingsQueries.js
 */