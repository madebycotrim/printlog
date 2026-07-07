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
    let estado = null;

    try {
      const res1 = await fetch('https://ipapi.co/json/');
      const dados1 = await res1.json();
      if (dados1.region_code) estado = dados1.region_code;
    } catch (e1) {
      // Fallback para ipwho.is caso ipapi falhe (ex: bloqueadores de anúncio)
      try {
        const res2 = await fetch('https://ipwho.is/');
        const dados2 = await res2.json();
        if (dados2.region_code) estado = dados2.region_code;
      } catch (e2) {
        // Ambas falharam
      }
    }

    if (estado) {
      const tarifa = TARIFAS_KWH_POR_ESTADO[estado];
      if (tarifa) {
        return { estado, tarifa };
      }
    }
    
    return null;
  } catch (erro) {
    return null;
  }
};
