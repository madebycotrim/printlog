/**
 * DIAGNÓSTICOS E CÁLCULOS AVANÇADOS - PRINTLOG
 * Transforma dados do D1 em insights de negócio e manutenção.
 */

// --- CONFIGURAÇÕES DE PADRÃO (Caso o usuário não tenha configurado a oficina) ---
const TARIFA_KWH_PADRAO = 0.85; 
const VIDA_UTIL_MAQUINA_HORAS = 5000; // Vida útil estimada para depreciação total

/**
 * Realiza cálculos financeiros de ROI e custo operacional.
 * @param {Object} impressora - Objeto da impressora (já mapeado pela store)
 * @param {Object} configuracoes - Configurações da oficina vindas da useSettingsStore
 */
export const calcularFinanceiroAvancado = (impressora, configuracoes = null) => {
    // Validação inicial para evitar quebra de fluxo
    if (!impressora) return { roiPct: "0", pago: false, custoOperacional: "0.00", lucroLiquido: "0.00" };
    
    // Prioriza o valor do kWh salvo nas configurações, senão usa o padrão
    const tarifaKwh = configuracoes?.custoKwh ? Number(configuracoes.custoKwh) : TARIFA_KWH_PADRAO;

    // Sanitização de dados numéricos para evitar NaN
    const precoCompra = Math.max(0, Number(impressora.price) || 0);
    const rendimentoTotal = Number(impressora.yieldTotal) || 0;
    const horasTotais = Math.max(0, Number(impressora.totalHours) || 0);
    const potenciaKw = (Number(impressora.power) || 0) / 1000;
    
    // 1. Custo de Energia Real (Horas Totais * Consumo em kW * Tarifa)
    const custoEnergia = horasTotais * potenciaKw * tarifaKwh; 
    
    // 2. Depreciação (Custo de desgaste da máquina)
    // A depreciação acumulada é limitada ao preço de compra da máquina
    const depreciacaoAcumulada = precoCompra > 0 
        ? Math.min(precoCompra, (precoCompra / VIDA_UTIL_MAQUINA_HORAS) * horasTotais) 
        : 0;
    
    // 3. Totais e Lucratividade
    const custoOperacionalTotal = custoEnergia + depreciacaoAcumulada;
    const lucroLiquido = rendimentoTotal - custoOperacionalTotal;

    // O ROI é calculado sobre o lucro líquido em relação ao investimento inicial (preço da máquina)
    const roiCalculado = precoCompra > 0 ? ((lucroLiquido / precoCompra) * 100).toFixed(1) : "0";

    return {
        roiPct: roiCalculado,
        pago: precoCompra > 0 && lucroLiquido >= precoCompra,
        custoOperacional: custoOperacionalTotal.toFixed(2),
        lucroLiquido: lucroLiquido.toFixed(2),
        custoEnergia: custoEnergia.toFixed(2),
        depreciacaoAcumulada: depreciacaoAcumulada.toFixed(2)
    };
};

/**
 * Analisa o horímetro e gera alertas de manutenção preventiva.
 * @param {Object} impressora - Objeto da impressora (já mapeado pela store)
 */
export const analisarSaudeImpressora = (impressora) => {
    if (!impressora) return [];

    const horasTotais = Number(impressora.totalHours) || 0;
    const ultimaManutencao = Number(impressora.lastMaintenanceHour) || 0;
    const horasDesdeUltima = Math.max(0, horasTotais - ultimaManutencao);
    
    const regrasManutencao = [
        { id: 'm1', rotulo: 'Limpeza Geral', acao: 'Mesa, bicos e fans', intervalo: 50, severidade: 'low' },
        { id: 'm2', rotulo: 'Correias', acao: 'Check de tensão X/Y', intervalo: 150, severidade: 'medium' },
        { id: 'm3', rotulo: 'Lubrificação', acao: 'Eixos lineares e fusos', intervalo: 300, severidade: 'medium' },
        { id: 'm4', rotulo: 'Nozzle', acao: 'Troca preventiva de bico', intervalo: 600, severidade: 'medium' },
        { id: 'm5', rotulo: 'Revisão Elétrica', acao: 'Aperto de bornes (Risco de Incêndio)', intervalo: 1000, severidade: 'critical' },
        { id: 'm6', rotulo: 'Tubo PTFE', acao: 'Substituição interna', intervalo: 800, severidade: 'medium' }
    ];
    
    return regrasManutencao
        .filter(regra => horasDesdeUltima >= regra.intervalo * 0.9) // O alerta surge quando atinge 90% do intervalo
        .sort((a, b) => {
            const prioridade = { critical: 1, medium: 2, low: 3 };
            return prioridade[a.severidade] - prioridade[b.severidade];
        });
};