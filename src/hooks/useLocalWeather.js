// src/hooks/useLocalWeather.js
import { useState } from "react";

export const useLocalWeather = () => {
    const [weather, setWeather] = useState({
        temp: "--",
        humidity: "--",
        loading: false,
        error: null
    });

    const fetchWeather = () => {
        if (!navigator.geolocation) {
            setWeather({ temp: "N/A", humidity: "N/A", loading: false, error: "unsupported" });
            return;
        }

        setWeather(prev => ({ ...prev, loading: true }));

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    const response = await fetch(
                        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m`
                    );
                    const data = await response.json();

                    setWeather({
                        temp: Math.round(data.current.temperature_2m),
                        humidity: Math.round(data.current.relative_humidity_2m),
                        loading: false,
                        error: null
                    });
                } catch (err) {
                    setWeather({ temp: "Err", humidity: "Err", loading: false, error: "api" });
                }
            },
            () => {
                // fallback se negar permissão
                setWeather({ temp: 24, humidity: 45, loading: false, error: "denied" });
            }
        );
    };

    return { ...weather, fetchWeather };
};
 