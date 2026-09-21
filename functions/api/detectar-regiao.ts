/// <reference types="@cloudflare/workers-types" />

/**
 * Endpoint de Localização, Região, Fuso Horário e Tarifa de Energia via Cloudflare Backend.
 * Roda diretamente na borda (Edge Cloudflare) utilizando `request.cf` e headers nativos da Cloudflare.
 */

export const TARIFAS_KWH_POR_ESTADO: Record<string, number> = {
    'AC': 0.874,
    'AL': 0.642,
    'AM': 0.843,
    'AP': 0.825,
    'BA': 0.666,
    'CE': 0.750,
    'DF': 0.82672,
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

export const NOMES_ESTADOS: Record<string, string> = {
    'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas',
    'BA': 'Bahia', 'CE': 'Ceará', 'DF': 'Distrito Federal', 'ES': 'Espírito Santo',
    'GO': 'Goiás', 'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul',
    'MG': 'Minas Gerais', 'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná',
    'PE': 'Pernambuco', 'PI': 'Piauí', 'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte',
    'RS': 'Rio Grande do Sul', 'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina',
    'SP': 'São Paulo', 'SE': 'Sergipe', 'TO': 'Tocantins'
};

const MAPA_NOMES_UF: Record<string, string> = {
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

const MAPA_FUSOS: Record<string, string> = {
    'America/Sao_Paulo': 'SP',
    'America/Manaus': 'AM',
    'America/Belem': 'PA',
    'America/Fortaleza': 'CE',
    'America/Recife': 'PE',
    'America/Bahia': 'BA',
    'America/Cuiaba': 'MT',
    'America/Campo_Grande': 'MS',
    'America/Porto_Velho': 'RO',
    'America/Boa_Vista': 'RR',
    'America/Rio_Branco': 'AC',
    'America/Maceio': 'AL',
};

function extrairUF(val?: string | null): string | null {
    if (!val || typeof val !== 'string') return null;
    const limpo = val.trim().toUpperCase();
    if (MAPA_NOMES_UF[limpo]) return MAPA_NOMES_UF[limpo];
    for (const [k, uf] of Object.entries(MAPA_NOMES_UF)) {
        if (limpo.includes(k)) return uf;
    }
    return null;
}

const CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "private, no-cache, no-store, must-revalidate",
};

export const onRequestOptions: PagesFunction = async () => {
    return new Response(null, {
        status: 204,
        headers: CORS_HEADERS
    });
};

export const onRequestGet: PagesFunction = async (context) => {
    try {
        const { request } = context;
        const cf = (request as any).cf || {};
        const headers = request.headers;

        // 1. Extração nativa via Cloudflare Edge
        let estado = extrairUF(
            cf?.regionCode || 
            cf?.region || 
            headers.get("cf-region-code") || 
            headers.get("cf-region")
        );

        let cidade = cf?.city || headers.get("cf-ipcity") || null;
        let pais = cf?.country || headers.get("cf-ipcountry") || "BR";
        let fusoHorario = cf?.timezone || headers.get("cf-timezone") || "America/Sao_Paulo";
        let postalCode = cf?.postalCode || headers.get("cf-postal-code") || null;
        let latitude = cf?.latitude || headers.get("cf-iplatitude") || null;
        let longitude = cf?.longitude || headers.get("cf-iplongitude") || null;

        // 2. Se não veio região pelo CF, tenta inferir pelo fuso horário
        if (!estado && fusoHorario && MAPA_FUSOS[fusoHorario]) {
            estado = MAPA_FUSOS[fusoHorario];
        }

        // 3. Fallback no servidor via IP do cliente caso o edge não tenha populado a região
        // Confia exclusivamente no cabeçalho protegido cf-connecting-ip gerenciado pela Cloudflare
        const rawIp = headers.get("cf-connecting-ip");
        const IP_REGEX = /^(\d{1,3}\.){3}\d{1,3}$|^([0-9a-fA-F]{1,4}:){1,7}[0-9a-fA-F]{1,4}$/;
        const clientIp = rawIp && IP_REGEX.test(rawIp) ? rawIp : null;

        const ehIpPrivado = clientIp && (
            clientIp === "127.0.0.1" || 
            clientIp.startsWith("192.168.") || 
            clientIp.startsWith("10.") ||
            clientIp.startsWith("172.16.") ||
            clientIp === "::1"
        );

        if (!estado && clientIp && !ehIpPrivado) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);

                const resGeo = await fetch(`https://get.geojs.io/v1/ip/geo/${encodeURIComponent(clientIp)}.json`, {
                    signal: controller.signal,
                    headers: { "User-Agent": "PrintLog-Edge/1.0" }
                });
                clearTimeout(timeoutId);

                if (resGeo.ok) {
                    const dados = await resGeo.json() as any;
                    estado = extrairUF(dados.region || dados.region_code);
                    if (dados.city && !cidade) cidade = dados.city;
                    if (dados.timezone && !fusoHorario) fusoHorario = dados.timezone;
                    if (dados.latitude && !latitude) latitude = dados.latitude;
                    if (dados.longitude && !longitude) longitude = dados.longitude;
                }
            } catch {
                // Em caso de falha de rede ou timeout, fallback seguro sem quebrar
            }
        }

        // 4. Se ainda assim não encontrar, aplica SP como padrão
        const estadoFinal = estado && TARIFAS_KWH_POR_ESTADO[estado] ? estado : "SP";
        const tarifaFinal = TARIFAS_KWH_POR_ESTADO[estadoFinal] ?? 0.759;
        const nomeEstadoFinal = NOMES_ESTADOS[estadoFinal] ?? "São Paulo";

        // 5. Data e Hora geradas pelo servidor Cloudflare
        const agora = new Date();
        const dataHoraIso = agora.toISOString();
        let dataHoraFormatada = dataHoraIso;
        try {
            dataHoraFormatada = new Intl.DateTimeFormat("pt-BR", {
                timeZone: fusoHorario,
                dateStyle: "full",
                timeStyle: "medium"
            }).format(agora);
        } catch {
            dataHoraFormatada = agora.toLocaleString("pt-BR");
        }

        const resposta = {
            sucesso: true,
            origem: "cloudflare_backend",
            estado: estadoFinal,
            nomeEstado: nomeEstadoFinal,
            tarifa: tarifaFinal,
            cidade: cidade || "Não informada",
            pais,
            fusoHorario,
            postalCode,
            latitude,
            longitude,
            dataHoraIso,
            dataHoraFormatada
        };

        return new Response(JSON.stringify(resposta), {
            headers: CORS_HEADERS
        });
    } catch {
        const agora = new Date();
        return new Response(JSON.stringify({
            sucesso: true,
            origem: "cloudflare_backend_fallback",
            estado: "SP",
            nomeEstado: "São Paulo",
            tarifa: TARIFAS_KWH_POR_ESTADO["SP"],
            cidade: "São Paulo",
            pais: "BR",
            fusoHorario: "America/Sao_Paulo",
            dataHoraIso: agora.toISOString(),
            dataHoraFormatada: agora.toLocaleString("pt-BR")
        }), {
            headers: CORS_HEADERS
        });
    }
};

export const onRequest = onRequestGet;
