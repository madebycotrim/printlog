import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { LancamentoFinanceiro, ResumoFinanceiro, OrdenacaoFinanceiro } from "../tipos";

interface ArmazemFinanceiroState {
    lancamentos: LancamentoFinanceiro[];
    resumo: ResumoFinanceiro;
    carregando: boolean;
    termoBusca: string;
    filtroTipo: string | null;
    ordenacao: OrdenacaoFinanceiro;
    ordemInvertida: boolean;

    // Ações Base
    definirLancamentos: (lancamentos: LancamentoFinanceiro[]) => void;
    definirResumo: (resumo: ResumoFinanceiro) => void;
    definirCarregando: (status: boolean) => void;

    // Ações de Filtragem
    pesquisar: (termo: string) => void;
    definirFiltroTipo: (tipo: string | null) => void;
    ordenarPor: (ordenacao: OrdenacaoFinanceiro) => void;
    inverterOrdem: () => void;
}

export const usarArmazemFinanceiro = create<ArmazemFinanceiroState>()(
    devtools(
        (set) => ({
            lancamentos: [],
            resumo: {
                saldoTotalCentavos: 0,
                entradasMesCentavos: 0,
                saidasMesCentavos: 0,
            },
            carregando: true,
            termoBusca: "",
            filtroTipo: null,
            ordenacao: "DATA",
            ordemInvertida: false,

            definirLancamentos: (lancamentos) => set({ lancamentos }, false, "financeiro/definirLancamentos"),
            definirResumo: (resumo) => set({ resumo }, false, "financeiro/definirResumo"),
            definirCarregando: (status) => set({ carregando: status }, false, "financeiro/definirCarregando"),

            pesquisar: (termo) => set({ termoBusca: termo }, false, "financeiro/pesquisar"),
            definirFiltroTipo: (tipo) => set({ filtroTipo: tipo }, false, "financeiro/definirFiltroTipo"),
            ordenarPor: (ordenacao) => set({ ordenacao }, false, "financeiro/ordenarPor"),
            inverterOrdem: () => set((state) => ({ ordemInvertida: !state.ordemInvertida }), false, "financeiro/inverterOrdem"),
        }),
        { name: "ArmazemFinanceiro" }
    )
);
