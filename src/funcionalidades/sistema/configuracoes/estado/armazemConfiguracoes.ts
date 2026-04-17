import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Interface para as configurações operacionais do estúdio.
 * Conforme Regra de Negócio: Valores armazenados como string formatada para UI, 
 * mas processados como centavos nas utilidades de cálculo (Art. 7º, V - LGPD).
 */
interface ArmazemConfiguracoes {
  custoEnergia: string;
  horaMaquina: string;
  horaOperador: string;
  margemLucro: string;
  
  // Ações para atualizar valores
  definirCustoEnergia: (valor: string) => void;
  definirHoraMaquina: (valor: string) => void;
  definirHoraOperador: (valor: string) => void;
  definirMargemLucro: (valor: string) => void;
  
  /** Reseta as configurações para os padrões de fábrica do sistema */
  resetarParaPadrao: () => void;
}

const VALORES_PADRAO = {
  custoEnergia: "R$ 0,95",
  horaMaquina: "R$ 5,00",
  horaOperador: "R$ 20,00",
  margemLucro: "150,00%",
};

/**
 * Armazém de Configurações Operacionais.
 * Persiste os dados localmente para garantir consistência entre sessões.
 */
export const usarArmazemConfiguracoes = create<ArmazemConfiguracoes>()(
  persist(
    (set) => ({
      ...VALORES_PADRAO,
      
      definirCustoEnergia: (valor) => set({ custoEnergia: valor }),
      definirHoraMaquina: (valor) => set({ horaMaquina: valor }),
      definirHoraOperador: (valor) => set({ horaOperador: valor }),
      definirMargemLucro: (valor) => set({ margemLucro: valor }),
      
      resetarParaPadrao: () => set(VALORES_PADRAO),
    }),
    {
      name: "printlog-config-operacional", // Chave de persistência no localStorage
    }
  )
);
