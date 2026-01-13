// src/hooks/useLocalWeather.js
import { useState, useEffect, useCallback, useRef } from "react";

/**
 * CONFIGURAÇÕES
 */
const CACHE_KEY = "local_weather_cache";
const CACHE_TTL = 1000 * 60 * 15; // 15 minutos

const FALLBACK = {
  temp: 24,
  humidity: 45
};

export const useLocalWeather = () => {
  const abortRef = useRef(null);
  const mountedRef = useRef(true);

  const [state, setState] = useState({
    temp: null,
    humidity: null,
    loading: true,
    error: null
  });

  const safeSetState = (next) => {
    if (mountedRef.current) {
      setState(next);
    }
  };

  const fetchWeather = useCallback(() => {
    // Cancela requisição anterior
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    safeSetState(prev => ({ ...prev, loading: true, error: null }));

    /**
     * 1️⃣ CACHE LOCAL
     */
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        safeSetState({
          temp: cached.temp,
          humidity: cached.humidity,
          loading: false,
          error: null
        });
        return;
      }
    } catch {
      // cache inválido → ignora
    }

    /**
     * 2️⃣ GEOLOCALIZAÇÃO
     */
    if (!navigator.geolocation) {
      safeSetState({
        ...FALLBACK,
        loading: false,
        error: "geolocation_not_supported"
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,relative_humidity_2m`,
            { signal: controller.signal }
          );

          if (!res.ok) throw new Error("api_error");

          const data = await res.json();

          const payload = {
            temp: Math.round(data.current.temperature_2m),
            humidity: Math.round(data.current.relative_humidity_2m)
          };

          // salva cache
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ ...payload, timestamp: Date.now() })
          );

          safeSetState({
            ...payload,
            loading: false,
            error: null
          });
        } catch (err) {
          if (err.name !== "AbortError") {
            safeSetState({
              ...FALLBACK,
              loading: false,
              error: "weather_fetch_failed"
            });
          }
        }
      },
      (geoError) => {
        safeSetState({
          ...FALLBACK,
          loading: false,
          error: geoError.code === 1
            ? "permission_denied"
            : "gps_error"
        });
      },
      {
        timeout: 10000,
        enableHighAccuracy: false
      }
    );
  }, []);

  /**
   * AUTO FETCH + CLEANUP REAL
   */
  useEffect(() => {
    mountedRef.current = true;
    fetchWeather();

    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, [fetchWeather]);

  return {
    temp: state.temp,
    humidity: state.humidity,
    loading: state.loading,
    error: state.error,
    refreshWeather: fetchWeather
  };
};
