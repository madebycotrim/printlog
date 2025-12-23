// src/hooks/useLocalWeather.js
import { useState, useEffect, useCallback } from "react";

export const useLocalWeather = () => {
    const [weather, setWeather] = useState({
        temp: null,
        humidity: null,
        loading: true,
        error: null
    });

    const fetchWeather = useCallback(async () => {
        if (!navigator.geolocation) {
            setWeather(prev => ({ 
                ...prev, 
                loading: false, 
                error: "Geolocalização não suportada" 
            }));
            return;
        }

        setWeather(prev => ({ ...prev, loading: true, error: null }));

        // AbortController para cancelar a requisição se o componente for desmontado
        const controller = new AbortController();

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    const response = await fetch(
                        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m`,
                        { signal: controller.signal }
                    );

                    if (!response.ok) throw new Error("Falha na API");

                    const data = await response.json();

                    setWeather({
                        temp: Math.round(data.current.temperature_2m),
                        humidity: Math.round(data.current.relative_humidity_2m),
                        loading: false,
                        error: null
                    });
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        setWeather(prev => ({ 
                            ...prev, 
                            loading: false, 
                            error: "Erro ao buscar dados do clima" 
                        }));
                    }
                }
            },
            (geoError) => {
                // Fallback amigável se o usuário negar ou houver erro de GPS
                console.warn("Geolocalização negada ou falhou, usando padrão.");
                setWeather({
                    temp: 24,
                    humidity: 45,
                    loading: false,
                    error: geoError.code === 1 ? "permission_denied" : "gps_error"
                });
            },
            { timeout: 10000, enableHighAccuracy: false } // Opções de GPS
        );

        return () => controller.abort();
    }, []);

    // Busca automaticamente ao montar o componente
    useEffect(() => {
        fetchWeather();
    }, [fetchWeather]);

    return { ...weather, fetchWeather };
};