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

export const MAPA_NOMES_UF: Record<string, string> = {
  'AC': 'AC', 'AL': 'AL', 'AP': 'AP', 'AM': 'AM', 'BA': 'BA', 'CE': 'CE',
  'DF': 'DF', 'ES': 'ES', 'GO': 'GO', 'MA': 'MA', 'MT': 'MT', 'MS': 'MS',
  'MG': 'MG', 'PA': 'PA', 'PB': 'PB', 'PR': 'PR', 'PE': 'PE', 'PI': 'PI',
  'RJ': 'RJ', 'RN': 'RN', 'RS': 'RS', 'RO': 'RO', 'RR': 'RR', 'SC': 'SC',
  'SP': 'SP', 'SE': 'SE', 'TO': 'TO',
  'SAO PAULO': 'SP', 'SÃO PAULO': 'SP', 'RIO DE JANEIRO': 'RJ',
  'MINAS GERAIS': 'MG', 'DISTRITO FEDERAL': 'DF', 'BRASILIA': 'DF', 'BRASÍLIA': 'DF',
  'PARANA': 'PR', 'PARANÁ': 'PR', 'RIO GRANDE DO SUL': 'RS',
  'SANTA CATARINA': 'SC', 'BAHIA': 'BA', 'GOIAS': 'GO', 'GOIÁS': 'GO',
  'ESPIRITO SANTO': 'ES', 'ESPÍRITO SANTO': 'ES', 'CEARA': 'CE', 'CEARÁ': 'CE',
  'PERNAMBUCO': 'PE', 'MARANHAO': 'MA', 'MARANHÃO': 'MA', 'PARA': 'PA', 'PARÁ': 'PA',
  'PARAIBA': 'PB', 'PARAÍBA': 'PB', 'AMAZONAS': 'AM', 'MATO GROSSO': 'MT',
  'MATO GROSSO DO SUL': 'MS', 'RIO GRANDE DO NORTE': 'RN', 'PIAUI': 'PI', 'PIAUÍ': 'PI',
  'ALAGOAS': 'AL', 'SERGIPE': 'SE', 'RONDONIA': 'RO', 'RONDÔNIA': 'RO',
  'TOCANTINS': 'TO', 'ACRE': 'AC', 'AMAPA': 'AP', 'AMAPÁ': 'AP', 'RORAIMA': 'RR'
};

export function normalizarUFBrasil(val?: string | null): string | null {
  if (!val || typeof val !== 'string') return null;
  const limpo = val.trim().toUpperCase();
  if (MAPA_NOMES_UF[limpo]) return MAPA_NOMES_UF[limpo];
  for (const [k, uf] of Object.entries(MAPA_NOMES_UF)) {
    if (limpo.includes(k)) return uf;
  }
  return null;
}


export interface DadosLocalizacaoCloudflare {
  sucesso: boolean;
  origem: string;
  estado: string;
  nomeEstado: string;
  tarifa: number;
  cidade: string;
  pais: string;
  fusoHorario: string;
  dataHoraIso: string;
  dataHoraFormatada: string;
}

/**
 * Consulta a geolocalização, estado, tarifa e data/hora diretamente pelo backend da Cloudflare (/api/detectar-regiao).
 * Toda a inteligência e extração de IP roda na borda da Cloudflare, sem violar CSP e sem expor chamadas a terceiros no cliente.
 */
export const obterDadosLocalizacaoCloudflare = async (): Promise<DadosLocalizacaoCloudflare> => {
  try {
    const res = await fetch('/api/detectar-regiao');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const dados = (await res.json()) as Partial<DadosLocalizacaoCloudflare>;
      if (dados && dados.estado && typeof dados.tarifa === 'number') {
        return {
          sucesso: true,
          origem: dados.origem || 'cloudflare_backend',
          estado: dados.estado,
          nomeEstado: dados.nomeEstado || (NOMES_ESTADOS[dados.estado] ?? dados.estado),
          tarifa: dados.tarifa,
          cidade: dados.cidade || 'São Paulo',
          pais: dados.pais || 'BR',
          fusoHorario: dados.fusoHorario || 'America/Sao_Paulo',
          dataHoraIso: dados.dataHoraIso || new Date().toISOString(),
          dataHoraFormatada: dados.dataHoraFormatada || new Date().toLocaleDateString('pt-BR'),
        };
      }
    }
  } catch {
    // Falha silenciosa de rede/proxy dev
  }

  // Fallback seguro caso o dev server não esteja conectado ao proxy da Cloudflare
  const agora = new Date();
  return {
    sucesso: true,
    origem: 'padrao_local',
    estado: 'SP',
    nomeEstado: 'São Paulo',
    tarifa: TARIFAS_KWH_POR_ESTADO['SP'],
    cidade: 'São Paulo',
    pais: 'BR',
    fusoHorario: 'America/Sao_Paulo',
    dataHoraIso: agora.toISOString(),
    dataHoraFormatada: agora.toLocaleDateString('pt-BR'),
  };
};

export const NOMES_ESTADOS: Record<string, string> = {
  'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas',
  'BA': 'Bahia', 'CE': 'Ceará', 'DF': 'Distrito Federal', 'ES': 'Espírito Santo',
  'GO': 'Goiás', 'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul',
  'MG': 'Minas Gerais', 'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná',
  'PE': 'Pernambuco', 'PI': 'Piauí', 'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte',
  'RS': 'Rio Grande do Sul', 'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina',
  'SP': 'São Paulo', 'SE': 'Sergipe', 'TO': 'Tocantins'
};

/**
 * Detecta a localização do usuário e retorna a tarifa média de kWh via backend Cloudflare.
 */
export const detectarTarifaKwhAutomatico = async (): Promise<{ estado: string; tarifa: number }> => {
  const dados = await obterDadosLocalizacaoCloudflare();
  return {
    estado: dados.estado,
    tarifa: dados.tarifa,
  };
};
