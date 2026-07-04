import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ArmazemDispositivo {
  modoDesempenho: boolean;
  alternarModoDesempenho: () => void;
}

/**
 * Armazém Local (Device-Specific)
 * Salva configurações que pertencem ao hardware atual (como preferência de performance)
 * e não devem ser sincronizadas entre dispositivos na nuvem.
 */
export const useArmazemDispositivo = create<ArmazemDispositivo>()(
  persist(
    (set) => ({
      modoDesempenho: false,
      alternarModoDesempenho: () => set((state) => ({ modoDesempenho: !state.modoDesempenho })),
    }),
    {
      name: "printlog-device-settings", // Chave no localStorage
    }
  )
);
