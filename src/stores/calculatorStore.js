import { create } from 'zustand';

export const useCalculatorStore = create((set) => ({
    // Estado Inicial
    dadosFormulario: {
        id: "", // ID do projeto para permitir updates
        nomeProjeto: "",
        clienteId: "",
        qtdPecas: 1,
        material: {
            custoRolo: "",
            pesoModelo: "",
            idFilamentoSelecionado: "",
            slots: []
        },
        tempo: {
            impressaoHoras: "",
            impressaoMinutos: "",
            trabalhoHoras: "",
            trabalhoMinutos: ""
        },
        vendas: {
            canal: "loja",
            taxaMarketplace: "",
            taxaMarketplaceFixa: "",
            desconto: ""
        },
        custosExtras: {
            embalagem: "",
            frete: "",
            lista: []
        },
        config: {
            custoKwh: "",
            valorHoraHumana: "",
            custoHoraMaquina: "",
            taxaSetup: "",
            consumoKw: "",
            margemLucro: "",
            imposto: "",
            taxaFalha: ""
        }
    },

    resetForm: () => set({
        dadosFormulario: {
            id: "",
            nomeProjeto: "",
            clienteId: "",
            qtdPecas: 1,
            material: {
                custoRolo: "",
                pesoModelo: "",
                idFilamentoSelecionado: "",
                slots: []
            },
            tempo: {
                impressaoHoras: "",
                impressaoMinutos: "",
                trabalhoHoras: "",
                trabalhoMinutos: ""
            },
            vendas: {
                canal: "loja",
                taxaMarketplace: "",
                taxaMarketplaceFixa: "",
                desconto: ""
            },
            custosExtras: {
                embalagem: "",
                frete: "",
                lista: []
            },
            config: {
                custoKwh: "",
                valorHoraHumana: "",
                custoHoraMaquina: "",
                taxaSetup: "",
                consumoKw: "",
                margemLucro: "",
                imposto: "",
                taxaFalha: ""
            }
        }
    }),

    // Ações de Atualização
    setDadosFormulario: (novosDados) => set({ dadosFormulario: novosDados }),

    // Snapshot State
    snapshot: null,
    setSnapshot: (snap) => set({ snapshot: snap }),
    clearSnapshot: () => set({ snapshot: null }),

    atualizarCampo: (secao, campo, valor) => set((state) => {
        if (secao && campo) {
            return {
                dadosFormulario: {
                    ...state.dadosFormulario,
                    [secao]: {
                        ...state.dadosFormulario[secao],
                        [campo]: valor
                    }
                }
            };
        } else if (secao && !campo) {
            // Atualização direta na raiz ou objeto inteiro da seção
            return {
                dadosFormulario: {
                    ...state.dadosFormulario,
                    [secao]: valor
                }
            };
        }
        return state;
    }),

    // Computed / Selectors can be derived in components, 
    // but we can also expose a specific getter for results if needed via a hook,
    // or just let components import `calcularTudo` and useMemo on the store state.
}));
