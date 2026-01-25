import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Default to São Paulo if geolocation fails or permission denied
const DEFAULT_COORDS = { lat: -23.5505, long: -46.6333 };

export const useWeather = () => {
    const [coords, setCoords] = useState(null);
    const [permissionDenied, setPermissionDenied] = useState(false);

    useEffect(() => {
        if (!navigator.geolocation) {
            setCoords(DEFAULT_COORDS);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoords({
                    lat: position.coords.latitude,
                    long: position.coords.longitude
                });
            },
            () => {
                setPermissionDenied(true);
                setCoords(DEFAULT_COORDS);
            }
        );
    }, []);

    const fetchWeather = async () => {
        if (!coords) return null;

        // Open-Meteo API (Free, no key required)
        const { data } = await axios.get(
            `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.long}&current_weather=true&hourly=relativehumidity_2m`
        );

        // Obter umidade da hora atual (OpenMeteo fornece array horario)
        const currentHour = new Date().getHours();
        const humidity = data.hourly?.relativehumidity_2m?.[currentHour] || 50;

        return {
            temp: data.current_weather.temperature,
            humidity: humidity,
            isDay: data.current_weather.is_day
        };
    };

    const query = useQuery({
        queryKey: ['weather', coords?.lat, coords?.long],
        queryFn: fetchWeather,
        enabled: !!coords,
        staleTime: 1000 * 60 * 30, // 30 minutos de cache
        refetchOnWindowFocus: false
    });

    return {
        ...query,
        permissionDenied,
        coords
    };
};
