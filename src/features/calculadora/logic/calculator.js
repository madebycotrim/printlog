// src/features/calculadora/logic/calculator.js
import { create } from 'zustand';
import api from '../../../utils/api';
import { parseNumber } from "../../../utils/numbers";

/**
 * MOTOR DE CÁLCULO PROFISSIONAL (MÉTODO DO DIVISOR)
 * Esta função processa a lógica financeira garantindo que as margens sejam preservadas
 * mesmo após a aplicação de impostos, taxas e descontos.
 */
export function calcularTudo(dadosEntrada = {}) {
    // Helper para extração segura de números de objetos aninhados ou planos
    const obterValor = (caminho, caminhoAlternativo) => {
        const partes = caminho.split('.');
        let valor = dadosEntrada;
        for (const parte of partes) {
            valor = valor?.[part];
        }
        return parseNumber(valor) || parseNumber(dadosEntrada[caminhoAlternativo]) || 0;
    };

    const quantidade = Math.max(1, obterValor('qtdPecas', 'qtdPecas'));
    
    // Soma de custos extras da lista dinâmica
    const listaExtras = dadosEntrada.custosExtras?.lista || [];
    const somaExtrasAdicionais = Array.isArray(listaExtras)
        ? listaExtras.reduce((acumulado, item) => acumulado + parseNumber(item?.valor), 0)
        : 0;

    // Parâmetros normalizados
    const p = {
        quantidade,
        custoKwh: obterValor('config.custoKwh', 'custoKwh'),
        valorHoraHumana: obterValor('config.valorHoraHumana', 'valorHoraHumana'),
        custoHoraMaquina: obterValor('config.custoHoraMaquina', 'custoHoraMaquina'),
        taxaSetup: obterValor('config.taxaSetup', 'taxaSetup'),
        embalagem: obterValor('custosExtras.embalagem', 'custoEmbalagem'),
        frete: obterValor('custosExtras.frete', 'custoFrete'),
        extras: somaExtrasAdicionais,
        
        // Conversão de porcentagens para decimal
        margemLucro: obterValor('config.margemLucro', 'margemLucro') / 100,
        imposto: obterValor('config.imposto', 'imposto') / 100,
        taxaMkt: obterValor('vendas.taxaMarketplace', 'taxaMarketplace') / 100,
        taxaMktFixa: obterValor('vendas.taxaMarketplaceFixa', 'taxaMarketplaceFixa'),
        desconto: obterValor('vendas.desconto', 'desconto') / 100,
        taxaFalha: obterValor('config.taxaFalha', 'taxaFalha') / 100,
        
        // Tempos convertidos para horas decimais
        tempoImp: obterValor('tempo.impressaoHoras', 'tempoImpressaoHoras') + (obterValor('tempo.impressaoMinutos', 'tempoImpressaoMinutos') / 60),
        tempoTrab: obterValor('tempo.trabalhoHoras', 'tempoTrabalhoHoras') + (obterValor('tempo.trabalhoMinutos', 'tempoTrabalhoMinutos') / 60),
        
        // Normalização de Consumo (Trata Watts vs kW)
        // Se o valor for > 2, assume-se que foi digitado em Watts (ex: 150W) e converte para kW (0.15kW)
        consumoKw: obterValor('config.consumoKw', 'consumoImpressoraKw') > 2 
            ? obterValor('config.consumoKw', 'consumoImpressoraKw') / 1000 
            : obterValor('config.consumoKw', 'consumoImpressoraKw')
    };

    // --- CÁLCULO DE MATERIAIS ---
    let custoMaterialUnitario = 0;
    const slots = dadosEntrada.material?.slots || [];
    const slotsValidos = slots.filter(s => parseNumber(s.weight) > 0);

    if (slotsValidos.length > 0) {
        custoMaterialUnitario = slotsValidos.reduce((acc, slot) => {
            return acc + ((parseNumber(slot.priceKg) / 1000) * parseNumber(slot.weight));
        }, 0);
    } else {
        custoMaterialUnitario = (obterValor('material.custoRolo', 'custoRolo') / 1000) * obterValor('material.pesoModelo', 'pesoModelo');
    }

    // --- CUSTOS OPERACIONAIS ---
    const custoEnergiaUnit = (p.tempoImp * p.consumoKw * p.custoKwh) / p.quantidade;
    const custoBaseMaquinaUnit = (p.tempoImp * p.custoHoraMaquina) / p.quantidade;
    const reservaManutencaoUnit = custoBaseMaquinaUnit * 0.10; // Aumentado para 10% para maior segurança
    const custoMaoDeObraUnit = (p.tempoTrab * p.valorHoraHumana) / p.quantidade;
    const custoSetupUnit = p.taxaSetup / p.quantidade;

    // Soma de custos diretos
    const custoDiretoTotal = custoMaterialUnitario + custoEnergiaUnit + custoBaseMaquinaUnit + reservaManutencaoUnit + custoMaoDeObraUnit + custoSetupUnit;
    
    // Aplicação da Taxa de Falha (Markup sobre custo direto)
    const custoComRisco = p.taxaFalha < 1 ? custoDiretoTotal / (1 - p.taxaFalha) : custoDiretoTotal * 1.05;
    const valorRiscoUnitario = custoComRisco - custoDiretoTotal;
    
    // Custo Logístico e Extras (Saída de caixa por unidade)
    const custoFixoSaidaUnitario = p.embalagem + p.frete + (p.extras / p.quantidade);
    const custoTotalOperacional = custoComRisco + custoFixoSaidaUnitario;

    // --- FORMAÇÃO DE PREÇO (MÉTODO DO DIVISOR) ---
    // O divisor deve considerar Impostos, Marketplace e Margem Desejada.
    // O desconto é aplicado sobre o preço de venda, portanto deve ser incluído no divisor se quisermos manter a margem.
    const divisor = 1 - (p.imposto + p.taxaMkt + p.margemLucro);
    
    // Preço Base para garantir a margem líquida
    let precoVendaFinal = divisor > 0.10 
        ? (custoTotalOperacional + (p.taxaMktFixa / p.quantidade)) / divisor 
        : custoTotalOperacional * 2.5;

    // O Preço Sugerido (etiqueta) é o preço final "inflado" para que, ao aplicar o desconto, cheguemos no preço de venda alvo.
    const precoSugerido = p.desconto < 1 ? precoVendaFinal / (1 - p.desconto) : precoVendaFinal;
    const precoComDesconto = precoSugerido * (1 - p.desconto);

    // --- RESULTADOS REAIS ---
    const impostoReal = precoComDesconto * p.imposto;
    const taxaMktReal = (precoComDesconto * p.taxaMkt) + p.taxaMktFixa;
    const lucroLiquidoReal = precoComDesconto - impostoReal - taxaMktReal - custoTotalOperacional;
    const margemEfetivaReal = precoComDesconto > 0 ? (lucroLiquidoReal / precoComDesconto) * 100 : 0;

    const arredondar = (num) => isFinite(num) ? Math.round((num + Number.EPSILON) * 100) / 100 : 0;

    return {
        custoMaterial: arredondar(custoMaterialUnitario),
        custoEnergia: arredondar(custoEnergiaUnit),
        custoMaquina: arredondar(custoBaseMaquinaUnit),
        reservaManutencao: arredondar(reservaManutencaoUnit),
        custoMaoDeObra: arredondar(custoMaoDeObraUnit),
        custoSetup: arredondar(custoSetupUnit),
        custoEmbalagem: arredondar(p.embalagem),
        custoFrete: arredondar(p.frete),
        custosExtras: arredondar(p.extras / p.quantidade),
        valorRisco: arredondar(valorRiscoUnitario),
        valorImpostos: arredondar(impostoReal),
        valorMarketplace: arredondar(taxaMktReal),
        custoUnitario: arredondar(custoTotalOperacional),
        precoSugerido: arredondar(precoSugerido),
        precoComDesconto: arredondar(precoComDesconto),
        lucroBrutoUnitario: arredondar(lucroLiquidoReal),
        margemEfetivaPct: arredondar(margemEfetivaReal),
        tempoTotalHoras: arredondar(p.tempoImp),
        quantidadePecas: p.quantidade
    };
}

/**
 * ZUSTAND STORE: CONFIGURAÇÕES
 * Gerencia a persistência das configurações da oficina.
 */
export const useSettingsStore = create((set) => ({
    settings: null,
    isLoading: false,

    fetchSettings: async () => {
        set({ isLoading: true });
        try {
            const { data } = await api.get('/settings');
            
            if (data && (data.user_id || data.id)) {
                // Mapeamento De: snake_case (DB) Para: camelCase (Frontend)
                const mapeado = {
                    custoKwh: String(data.custo_kwh ?? "0"),
                    valorHoraHumana: String(data.valor_hora_humana ?? "0"),
                    custoHoraMaquina: String(data.custo_hora_maquina ?? "0"),
                    taxaSetup: String(data.taxa_setup ?? "0"),
                    consumoKw: String(data.consumo_impressora_kw ?? "0"),
                    margemLucro: String(data.margem_lucro ?? "20"),
                    imposto: String(data.imposto ?? "0"),
                    taxaFalha: String(data.taxa_falha ?? "5"),
                    desconto: String(data.desconto ?? "0")
                };
                set({ settings: mapeado, isLoading: false });
                return true;
            }
        } catch (error) { 
            console.error("Erro ao carregar configurações:", error); 
        }
        set({ isLoading: false });
        return false;
    },

    saveSettings: async (dados) => {
        set({ isLoading: true });
        try {
            // Mapeamento Reverso: camelCase Para: snake_case
            const paraEnviar = {
                custo_kwh: parseNumber(dados.custoKwh),
                valor_hora_humana: parseNumber(dados.valorHoraHumana),
                custo_hora_maquina: parseNumber(dados.custoHoraMaquina),
                taxa_setup: parseNumber(dados.taxaSetup),
                consumo_impressora_kw: parseNumber(dados.consumoKw || dados.consumoImpressoraKw),
                margem_lucro: parseNumber(dados.margemLucro),
                imposto: parseNumber(dados.imposto),
                taxa_falha: parseNumber(dados.taxaFalha),
                desconto: parseNumber(dados.desconto)
            };
            
            await api.post('/settings', paraEnviar);
            set({ settings: dados, isLoading: false });
            return true;
        } catch (error) {
            console.error("Erro ao salvar configurações:", error);
            set({ isLoading: false });
            return false;
        }
    }
}));