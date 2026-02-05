import { useState, useEffect } from 'react';

export const useLocalWeather = () => {
    const [weather, setWeather] = useState({ temp: null, humidity: null, loading: true, error: null });

    useEffect(() => {
        if (!navigator.geolocation) {
            setWeather(prev => ({ ...prev, loading: false, error: "Geolocalização não suportada" }));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(
                        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m&timezone=auto`
                    );
                    const data = await response.json();

                    setWeather({
                        temp: data.current.temperature_2m,
                        humidity: data.current.relative_humidity_2m,
                        loading: false,
                        error: null
                    });
                } catch (error) {
                    console.error("Erro ao buscar clima:", error);
                    setWeather(prev => ({ ...prev, loading: false, error: "Erro na API de clima" }));
                }
            },
            (error) => {
                // Silently handle denied permission by falling back to default
                // console.debug("Permissão de localização negada/erro, usando padrão:", error);

                // Fallback para São Paulo
                const latitude = -23.5505;
                const longitude = -46.6333;

                fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m&timezone=auto`
                ).then(res => res.json()).then(data => {
                    setWeather({
                        temp: data.current.temperature_2m,
                        humidity: data.current.relative_humidity_2m,
                        loading: false,
                        error: null // Limpa erro pois usamos fallback
                    });
                }).catch(() => {
                    setWeather(prev => ({ ...prev, loading: false, error: "Permissão negada e erro no fallback" }));
                });
            }
        );
    }, []);

    return weather;
};
