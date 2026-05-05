/**
 * Tabela de tarifas médias de energia elétrica (kWh) por estado brasileiro.
 * Dados ATUALIZADOS em Maio de 2026 baseados no Ranking da ANEEL (Residencial B1).
 */
export const TARIFAS_KWH_POR_ESTADO: Record<string, number> = {
  'AC': 0.874,
  'AL': 0.642,
  'AM': 0.843,
  'AP': 0.825,
  'BA': 0.666,
  'CE': 0.750,
  'DF': 0.82672, // Valor exato informado pelo usuário
  'ES': 0.789,
  'GO': 0.892,
  'MA': 0.843,
  'MG': 0.859,
  'MS': 0.987,
  'MT': 0.899,
  'PA': 0.978,
  'PB': 0.676,
  'PE': 0.649,
  'PI': 0.947,
  'PR': 0.642,
  'RJ': 0.971,
  'RN': 0.776,
  'RO': 0.841,
  'RR': 0.789,
  'RS': 0.822,
  'SC': 0.696,
  'SE': 0.755,
  'SP': 0.759,
  'TO': 0.930,
};

/**
 * Detecta a localização do usuário via IP e retorna a tarifa média de kWh.
 * @returns Promessa com o valor do kWh em Reais.
 */
export const detectarTarifaKwhAutomatico = async (): Promise<{ estado: string; tarifa: number } | null> => {
  try {
    // Usando um serviço gratuito de GeoIP (ip-api.com não precisa de chave para uso básico)
    const resposta = await fetch('http://ip-api.com/json/?fields=status,region');
    const dados = await resposta.json();

    if (dados.status === 'success' && dados.region) {
      const estado = dados.region; // Retorna a UF (ex: SP, RJ...)
      const tarifa = TARIFAS_KWH_POR_ESTADO[estado];
      
      if (tarifa) {
        return { estado, tarifa };
      }
    }
    
    return null;
  } catch (erro) {
    console.error('[detectarTarifaKwh]', erro);
    return null;
  }
};
