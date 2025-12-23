// --- FILE: src/features/calculadora/logic/calculator.js ---
import { parseNumber } from "../../../lib/format";

export function calcularTudo(entradas = {}) {
    // --- 1. NORMALIZAÇÃO DE ENTRADAS ---
    const p = {
        pesoPeca: parseNumber(entradas.pesoModelo),
        qtd: Math.max(1, parseNumber(entradas.qtdPecas)),
        custoRolo: parseNumber(entradas.custoRolo),
        custoKwh: parseNumber(entradas.custoKwh),
        horaHumana: parseNumber(entradas.valorHoraHumana),
        horaMaquina: parseNumber(entradas.custoHoraMaquina),
        taxaSetup: parseNumber(entradas.taxaSetup),
        embalagem: parseNumber(entradas.custoEmbalagem),
        frete: parseNumber(entradas.custoFrete),
        extras: parseNumber(entradas.custosExtras),
        // Tempos
        tImp: parseNumber(entradas.tempoImpressaoHoras) + (parseNumber(entradas.tempoImpressaoMinutos) / 60),
        tTrab: parseNumber(entradas.tempoTrabalhoHoras) + (parseNumber(entradas.tempoTrabalhoMinutos) / 60),
        // Financeiro
        margem: parseNumber(entradas.margemLucro) / 100,
        imposto: parseNumber(entradas.imposto) / 100,
        taxaMkt: parseNumber(entradas.taxaMarketplace) / 100,
        taxaMktFixa: parseNumber(entradas.taxaMarketplaceFixa || 0), // Adicionado taxa fixa (Ex: R$ 6,00 ML)
        desconto: parseNumber(entradas.desconto) / 100,
        falha: parseNumber(entradas.taxaFalha) / 100,
        consumoW: parseNumber(entradas.consumoImpressoraKw) > 10 
            ? parseNumber(entradas.consumoImpressoraKw) / 1000 
            : parseNumber(entradas.consumoImpressoraKw) || 0.15
    };

    // --- 2. CUSTOS DE PRODUÇÃO (SEM ARREDONDAR) ---
    const custoMaterialUnit = (p.custoRolo / 1000) * p.pesoPeca;
    const custoEnergiaUnit = (p.tImp * p.consumoW * p.custoKwh) / p.qtd;
    const custoMaquinaUnit = (p.tImp * p.horaMaquina) / p.qtd;
    const custoMaoDeObraUnit = (p.tTrab * p.horaHumana) / p.qtd;
    const custoSetupUnit = p.taxaSetup / p.qtd;
    
    // Custos Ocultos (Bico, Teflon, Energia de Aquecimento - aprox 5% do custo maq)
    const custoManutencaoOculta = custoMaquinaUnit * 0.05;

    // Soma Base (O que sai do seu bolso para fabricar)
    const custoProducaoDireto = custoMaterialUnit + custoEnergiaUnit + custoMaquinaUnit + 
                               custoMaoDeObraUnit + custoSetupUnit + custoManutencaoOculta;

    // Custo Total de Operação (Incluindo falhas estimadas e logística/extras)
    // Aplicamos a falha sobre o custo de produção
    const custoComRisco = custoProducaoDireto / (1 - p.falha);
    const custoTotalOperacional = custoComRisco + p.embalagem + p.frete + p.extras;

    // --- 3. PRECIFICAÇÃO (ESTILO MARGEM DE CONTRIBUIÇÃO) ---
    // markup fixo sobre o custo + divisor de taxas variáveis
    const divisor = 1 - p.imposto - p.taxaMkt;
    
    let precoSugerido = 0;
    if (divisor > 0.1) {
        // Preço = (Custo Operacional * (1 + Margem Desejada) + Taxa Fixa Mkt) / Divisor
        precoSugerido = (custoTotalOperacional * (1 + p.margem) + p.taxaMktFixa) / divisor;
    } else {
        precoSugerido = custoTotalOperacional * 3; // Fallback para taxas absurdas
    }

    const precoComDesconto = precoSugerido * (1 - p.desconto);

    // --- 4. CÁLCULO DE IMPOSTOS REAIS (Sobre o valor que será vendido) ---
    const valorImpostoReal = precoComDesconto * p.imposto;
    const valorMktReal = (precoComDesconto * p.taxaMkt) + p.taxaMktFixa;
    const valorRiscoReal = custoComRisco - custoProducaoDireto;

    // Lucro Líquido Real (O que sobra no bolso após desconto, impostos e custos)
    const lucroLiquidoReal = precoComDesconto - valorImpostoReal - valorMktReal - custoTotalOperacional;
    const margemEfetivaReal = precoComDesconto > 0 ? (lucroLiquidoReal / precoComDesconto) * 100 : 0;

    // --- 5. RETORNO (SÓ ARREDONDA AQUI) ---
    const round = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

    return {
        // Custos Individuais
        custoMaterial: round(custoMaterialUnit),
        custoEnergia: round(custoEnergiaUnit),
        custoMaquina: round(custoMaquinaUnit + custoManutencaoOculta),
        custoMaoDeObra: round(custoMaoDeObraUnit),
        custoSetup: round(custoSetupUnit),
        custoEmbalagem: round(p.embalagem),
        custoFrete: round(p.frete),
        custosExtras: round(p.extras),
        
        // Indicadores Financeiros
        valorRisco: round(valorRiscoReal),
        valorImpostos: round(valorImpostoReal),
        valorMarketplace: round(valorMktReal),

        // Totais Finais
        custoUnitario: round(custoTotalOperacional), // Custo real de saída
        precoSugerido: round(precoSugerido),
        precoComDesconto: round(precoComDesconto),
        lucroBrutoUnitario: round(lucroLiquidoReal),
        margemEfetivaPct: round(margemEfetivaReal),

        // Metadados
        tempoTotalHoras: round(p.tImp),
        consumoTotalKwh: round(p.tImp * p.consumoW),
        quantidade: p.qtd
    };
}