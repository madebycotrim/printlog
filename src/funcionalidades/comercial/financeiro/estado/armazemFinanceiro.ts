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

    // Ações de Mutação Local Otimistas
    adicionarOuAtualizarLancamento: (lancamento: LancamentoFinanceiro) => void;
    removerLancamentoNoEstado: (id: string) => void;
}

export const useArmazemFinanceiro = create<ArmazemFinanceiroState>()(
    devtools(
        (set) => ({
            lancamentos: [],
            resumo: {
                saldoTotalCentavos: 0,
                entradasMesCentavos: 0,
                saidasMesCentavos: 0,
            },
            carregando: false,
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

            adicionarOuAtualizarLancamento: (l) => set((state) => {
                const existe = state.lancamentos.some((item) => item.id === l.id);
                const antigo = state.lancamentos.find((item) => item.id === l.id);
                
                let saldoDiff = 0;
                let entradaDiff = 0;
                let saidaDiff = 0;
                
                if (antigo) {
                    const fator = antigo.tipo === "entrada" ? 1 : -1;
                    saldoDiff -= (antigo.valorCentavos || 0) * fator;
                    if (antigo.tipo === "entrada") entradaDiff -= (antigo.valorCentavos || 0);
                    else saidaDiff -= (antigo.valorCentavos || 0);
                }
                
                const fatorNovo = l.tipo === "entrada" ? 1 : -1;
                saldoDiff += (l.valorCentavos || 0) * fatorNovo;
                if (l.tipo === "entrada") entradaDiff += (l.valorCentavos || 0);
                else saidaDiff += (l.valorCentavos || 0);

                const novos = existe
                    ? state.lancamentos.map((item) => (item.id === l.id ? l : item))
                    : [l, ...state.lancamentos];

                return {
                    lancamentos: novos,
                    resumo: {
                        saldoTotalCentavos: state.resumo.saldoTotalCentavos + saldoDiff,
                        entradasMesCentavos: state.resumo.entradasMesCentavos + entradaDiff,
                        saidasMesCentavos: state.resumo.saidasMesCentavos + saidaDiff,
                    }
                };
            }, false, "financeiro/adicionarOuAtualizarLancamento"),

            removerLancamentoNoEstado: (id) => set((state) => {
                const l = state.lancamentos.find((item) => item.id === id);
                if (!l) return state;

                const fator = l.tipo === "entrada" ? 1 : -1;
                const saldoDiff = -(l.valorCentavos || 0) * fator;
                const entradaDiff = l.tipo === "entrada" ? -(l.valorCentavos || 0) : 0;
                const saidaDiff = l.tipo === "saida" ? -(l.valorCentavos || 0) : 0;

                return {
                    lancamentos: state.lancamentos.filter((item) => item.id !== id),
                    resumo: {
                        saldoTotalCentavos: state.resumo.saldoTotalCentavos + saldoDiff,
                        entradasMesCentavos: state.resumo.entradasMesCentavos + entradaDiff,
                        saidasMesCentavos: state.resumo.saidasMesCentavos + saidaDiff,
                    }
                };
            }, false, "financeiro/removerLancamentoNoEstado"),
        }),
        { name: "ArmazemFinanceiro" }
    )
);
