// src/hooks/useDebounce.js
import { useState, useEffect, useRef } from "react";

/**
 * useDebounce
 *
 * @param {*} value        Valor a ser debounced
 * @param {number} delay   Tempo em ms (default: 220)
 * @param {boolean} enabled Ativa/desativa o debounce (default: true)
 */
export default function useDebounce(value, delay = 220, enabled = true) {
  const [debounced, setDebounced] = useState(value);
  const firstRun = useRef(true);

  useEffect(() => {
    // Primeira renderização: aplica imediatamente
    if (firstRun.current) {
      firstRun.current = false;
      setDebounced(value);
      return;
    }

    // Se debounce estiver desligado, atualiza direto
    if (!enabled) {
      setDebounced(value);
      return;
    }

    // Evita updates desnecessários
    if (value === debounced) return;

    const timer = setTimeout(() => {
      setDebounced(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay, enabled, debounced]);

  return debounced;
}
