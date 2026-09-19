import { useState, useEffect } from 'react';

interface DadosClima {
  temperatura: number | null;
  umidade: number | null;
  cidade: string | null;
}

interface EstadoClima extends DadosClima {
  carregando: boolean;
  erro: string | null;
}

const CACHE_KEY = 'printlog_clima_cache';
const CACHE_EXPIRATION_MS = 60 * 60 * 1000; // 1 hora de cache

export function useClimaLocal(): EstadoClima {
  const [estado, setEstado] = useState<EstadoClima>({
    temperatura: null,
    umidade: null,
    cidade: null,
    carregando: true,
    erro: null,
  });

  useEffect(() => {
    async function buscarClima() {
      try {
        // 1. Tenta carregar do cache primeiro
        const cacheRaw = localStorage.getItem(CACHE_KEY);
        if (cacheRaw) {
          const cache = JSON.parse(cacheRaw);
          const expirou = Date.now() - cache.timestamp > CACHE_EXPIRATION_MS;
          
          if (!expirou && cache.dados) {
            setEstado({
              ...cache.dados,
              carregando: false,
              erro: null
            });
            return;
          }
        }

        // 2. Se não tem cache ou expirou, busca a localização de forma segura (HTTPS / Same-Origin)
        let lat: number | null = null;
        let lon: number | null = null;
        let cidade: string | null = null;

        try {
          const resLocal = await fetch('/api/detectar-regiao');
          if (resLocal.ok) {
            const dadosLocal = await resLocal.json();
            if (dadosLocal.sucesso && dadosLocal.dados) {
              lat = dadosLocal.dados.latitude;
              lon = dadosLocal.dados.longitude;
              cidade = dadosLocal.dados.cidade;
            }
          }
        } catch {
          // Ignora e tenta fallback HTTPS
        }

        if (!lat || !lon) {
          try {
            const resFallback = await fetch('https://ipwho.is/');
            if (resFallback.ok) {
              const dadosFallback = await resFallback.json();
              lat = dadosFallback.latitude;
              lon = dadosFallback.longitude;
              cidade = dadosFallback.city;
            }
          } catch {
            // Se falhar, usa coordenadas padrão (São Paulo - BR)
            lat = -23.5505;
            lon = -46.6333;
            cidade = "São Paulo";
          }
        }

        if (!lat || !lon) {
          throw new Error('Coordenadas não encontradas');
        }

        // 3. Busca o clima baseado nas coordenadas
        // Usando Open-Meteo (gratuito, sem necessidade de chave)
        const urlClima = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m`;
        const resClima = await fetch(urlClima);
        if (!resClima.ok) throw new Error('Falha ao obter dados meteorológicos');
        const dadosClima = await resClima.json();

        // Extrai a temperatura atual e a umidade (pegando o primeiro valor horário da umidade que se aproxima do atual)
        const temperatura = Math.round(dadosClima.current_weather.temperature);
        
        // Open-Meteo current_weather não traz umidade diretamente em algumas configurações,
        // então pegamos do array horário do tempo atual
        const indiceHoraAtual = dadosClima.hourly.time.findIndex((t: string) => t === dadosClima.current_weather.time);
        const umidade = indiceHoraAtual !== -1 ? Math.round(dadosClima.hourly.relativehumidity_2m[indiceHoraAtual]) : null;

        const dadosFinais = {
          temperatura,
          umidade,
          cidade,
        };

        // 4. Salva no Cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          dados: dadosFinais,
          timestamp: Date.now()
        }));

        setEstado({
          ...dadosFinais,
          carregando: false,
          erro: null
        });

      } catch (erro) {
        console.error('Erro ao buscar clima:', erro);
        setEstado(prev => ({
          ...prev,
          carregando: false,
          erro: 'Falha na conexão'
        }));
      }
    }

    buscarClima();
  }, []);

  return estado;
}
