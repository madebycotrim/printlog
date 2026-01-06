import { create } from 'zustand';
import api from '../../../utils/api';
import { parseNumber } from "../../../utils/numbers";

/**
 * MOTOR DE CÁLCULO PROFISSIONAL (MÉTODO COMERCIAL)
 * O desconto aqui funciona como Redutor de Preço e Margem.
 */
export function calcularTudo(dadosEntrada = {}) {
    // Helper para extração segura de números e conversão de vírgula para ponto
    const obterValor = (caminho, caminhoAlternativo) => {
        const partes = caminho.split('.');
        let valor = dadosEntrada;
        for (const parte of partes) {
            valor = valor?.[parte];
        }
        const resultado = valor !== undefined ? valor : dadosEntrada[caminhoAlternativo];
        const stringLimpa = String(resultado || "0").replace(',', '.');
        return parseNumber(stringLimpa) || 0;
    };

    const quantidade = Math.max(1, obterValor('qtdPecas', 'qtdPecas'));

    // Parâmetros normalizados
    const p = {
        quantidade,
        custoKwh: obterValor('config.custoKwh', 'custoKwh'),
        valorHoraHumana: obterValor('config.valorHoraHumana', 'valorHoraHumana'),
        custoHoraMaquina: obterValor('config.custoHoraMaquina', 'custoHoraMaquina'),
        taxaSetup: obterValor('config.taxaSetup', 'taxaSetup'),
        embalagem: obterValor('custosExtras.embalagem', 'custoEmbalagem'),
        frete: obterValor('custosExtras.frete', 'custoFrete'),
        extras: Array.isArray(dadosEntrada.custosExtras?.lista)
            ? dadosEntrada.custosExtras.lista.reduce((acc, item) => acc + (parseFloat(String(item?.valor || "0").replace(',', '.')) || 0), 0)
            : 0,
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

    // --- CÁLCULO DE MATERIAIS ---
    let custoMaterialUnitario = 0;
    const slots = dadosEntrada.material?.slots || [];
    if (slots.length > 0) {
        custoMaterialUnitario = slots.reduce((acc, slot) => {
            const weight = parseFloat(String(slot.weight || "0").replace(',', '.'));
            const priceKg = parseFloat(String(slot.priceKg || "0").replace(',', '.'));
            return acc + ((priceKg / 1000) * weight);
        }, 0);
    } else {
        custoMaterialUnitario = (obterValor('material.custoRolo', 'custoRolo') / 1000) * obterValor('material.pesoModelo', 'pesoModelo');
    }

    // --- CUSTOS OPERACIONAIS ---
    const custoEnergiaUnit = (p.tempoImp * p.consumoKw * p.custoKwh) / p.quantidade;
    const custoBaseMaquinaUnit = (p.tempoImp * p.custoHoraMaquina) / p.quantidade;
    const reservaManutencaoUnit = custoBaseMaquinaUnit * 0.10;
    const custoMaoDeObraUnit = (p.tempoTrab * p.valorHoraHumana) / p.quantidade;
    const custoSetupUnit = p.taxaSetup / p.quantidade;

    const custoDiretoTotal = custoMaterialUnitario + custoEnergiaUnit + custoBaseMaquinaUnit + reservaManutencaoUnit + custoMaoDeObraUnit + custoSetupUnit;

    const fatorFalhaSeguro = Math.min(p.taxaFalha, 0.95);
    const custoComRisco = custoDiretoTotal / (1 - fatorFalhaSeguro);
    const valorRiscoUnitario = custoComRisco - custoDiretoTotal;

    const custoFixoSaidaUnitario = p.embalagem + p.frete + (p.extras / p.quantidade);
    const custoTotalOperacional = custoComRisco + custoFixoSaidaUnitario;

    // --- FORMAÇÃO DE PREÇO (VISÃO COMERCIAL) ---

    // 1. O Divisor de Markup é calculado SEM o desconto para gerar o "Preço de Tabela"
    const somaTaxasELucro = p.imposto + p.taxaMkt + p.margemLucro;
    const divisor = Math.max(0.05, 1 - somaTaxasELucro);

    // 2. Preço Sugerido (Valor de Tabela / Sem desconto)
    const precoSugerido = (custoTotalOperacional + (p.taxaMktFixa / p.quantidade)) / divisor;

    // 3. Preço com Desconto (O valor que o cliente realmente paga)
    const precoComDesconto = precoSugerido * (1 - p.desconto);

    // --- ANÁLISE REAL DE RESULTADOS ---
    // Impostos e Marketplace incidem sobre o preço REAL praticado
    const impostoReal = precoComDesconto * p.imposto;
    const taxaMktReal = (precoComDesconto * p.taxaMkt) + (p.taxaMktFixa / p.quantidade);

    // Lucro Líquido Real: Pode ser negativo se o desconto for agressivo demais
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
        precoSugerido: arredondar(precoSugerido), // Este valor ficará fixo quando você mexer no desconto
        precoComDesconto: arredondar(precoComDesconto), // Este valor vai cair quando você aumentar o %
        lucroBrutoUnitario: arredondar(lucroLiquidoReal),
        margemEfetivaPct: arredondar(margemEfetivaReal),
        tempoTotalHoras: arredondar(p.tempoImp),
        quantidadePecas: p.quantidade
    };
}

/**
 * ZUSTAND STORE: CONFIGURAÇÕES
 */
export const useSettingsStore = create((set) => ({
    settings: {
        custoKwh: "",
        valorHoraHumana: "",
        custoHoraMaquina: "",
        taxaSetup: "",
        consumoKw: "",
        margemLucro: "",
        imposto: "",
        taxaFalha: "",
        desconto: "",
        whatsappTemplate: ""
    },
    isLoading: false,

    fetchSettings: async () => {
        set({ isLoading: true });
        try {
            const { data } = await api.get('/settings');
            const d = Array.isArray(data) ? data[0] : (data?.results ? data.results[0] : data);

            if (d) {
                const mapeado = {
                    custoKwh: String(d.custo_kwh ?? ""),
                    valorHoraHumana: String(d.valor_hora_humana ?? ""),
                    custoHoraMaquina: String(d.custo_hora_maquina ?? ""),
                    taxaSetup: String(d.taxa_setup ?? ""),
                    consumoKw: String(d.consumo_impressora_kw ?? ""),
                    margemLucro: String(d.margem_lucro ?? ""),
                    imposto: String(d.imposto ?? ""),
                    taxaFalha: String(d.taxa_falha ?? ""),
                    desconto: String(d.desconto ?? ""),
                    whatsapp_template: d.whatsapp_template || "Segue o orçamento do projeto *{projeto}*:\n\n💰 Valor: *{valor}*\n⏱️ Tempo estimado: *{tempo}*\n\nPodemos fechar?"
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
            const paraEnviar = {
                custo_kwh: parseNumber(String(dados.custoKwh || 0).replace(',', '.')),
                valor_hora_humana: parseNumber(String(dados.valorHoraHumana || 0).replace(',', '.')),
                custo_hora_maquina: parseNumber(String(dados.custoHoraMaquina || 0).replace(',', '.')),
                taxa_setup: parseNumber(String(dados.taxaSetup || 0).replace(',', '.')),
                consumo_impressora_kw: parseNumber(String(dados.consumoKw || 0).replace(',', '.')),
                margem_lucro: parseNumber(String(dados.margemLucro || 0).replace(',', '.')),
                imposto: parseNumber(String(dados.imposto || 0).replace(',', '.')),
                taxa_falha: parseNumber(String(dados.taxaFalha || 0).replace(',', '.')),
                desconto: parseNumber(String(dados.desconto || 0).replace(',', '.')),
                whatsapp_template: dados.whatsappTemplate || ""
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
