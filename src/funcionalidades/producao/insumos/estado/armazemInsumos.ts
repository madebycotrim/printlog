import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Insumo, CategoriaInsumo } from "@/funcionalidades/producao/insumos/tipos";

export type OrdenacaoInsumo = "nome" | "quantidade" | "atualizacao" | "custo";

interface ArmazemInsumosState {
    insumos: Insumo[];
    carregando: boolean;

    // Filtros e Ordenação
    filtroPesquisa: string;
    filtroCategoria: CategoriaInsumo | "Todas";
    ordenacao: OrdenacaoInsumo;
    ordemInvertida: boolean;

    // Controle de Modais
    modalCricaoAberto: boolean;
    insumoEditando: Insumo | null;

    modalReposicaoAberto: boolean;
    insumoReposicao: Insumo | null;

    modalBaixaAberto: boolean;
    insumoBaixa: Insumo | null;

    modalArquivamentoAberto: boolean;
    insumoArquivamento: Insumo | null;

    modalHistoricoAberto: boolean;
    insumoHistorico: Insumo | null;

    // Ações de Escrita no Banco
    definirInsumos: (lista: Insumo[]) => void;
    adicionarOuAtualizarInsumo: (insumo: Insumo) => void;
    removerInsumo: (id: string) => void;
    definirCarregando: (valor: boolean) => void;

    // Ações de UI (Filtros)
    definirFiltroPesquisa: (termo: string) => void;
    definirFiltroCategoria: (cat: CategoriaInsumo | "Todas") => void;
    definirOrdenacao: (ord: OrdenacaoInsumo) => void;
    inverterOrdem: () => void;

    // Ações de UI (Modais)
    abrirEditar: (insumo?: Insumo) => void;
    fecharEditar: () => void;
    abrirReposicao: (insumo: Insumo) => void;
    fecharReposicao: () => void;
    abrirBaixa: (insumo: Insumo) => void;
    fecharBaixa: () => void;
    abrirArquivamento: (insumo: Insumo) => void;
    fecharArquivamento: () => void;
    abrirHistorico: (insumo: Insumo) => void;
    fecharHistorico: () => void;
}

export const usarArmazemInsumos = create<ArmazemInsumosState>()(
    persist(
        (set) => ({
            insumos: [],
            carregando: false,

            filtroPesquisa: "",
            filtroCategoria: "Todas",
            ordenacao: "atualizacao",
            ordemInvertida: false,

            modalCricaoAberto: false,
            insumoEditando: null,

            modalReposicaoAberto: false,
            insumoReposicao: null,

            modalBaixaAberto: false,
            insumoBaixa: null,

            modalArquivamentoAberto: false,
            insumoArquivamento: null,

            modalHistoricoAberto: false,
            insumoHistorico: null,

            definirInsumos: (lista) => set({ insumos: lista }),

            adicionarOuAtualizarInsumo: (insumo) => set((state) => {
                const existe = state.insumos.find((i) => i.id === insumo.id);
                if (existe) {
                    return { insumos: state.insumos.map((i) => (i.id === insumo.id ? insumo : i)) };
                }
                return { insumos: [...state.insumos, insumo] };
            }),

            removerInsumo: (id) => set((state) => ({
                insumos: state.insumos.filter((i) => i.id !== id)
            })),

            definirCarregando: (valor) => set({ carregando: valor }),

            definirFiltroPesquisa: (termo: string) => set({ filtroPesquisa: termo }),
            definirFiltroCategoria: (cat: CategoriaInsumo | "Todas") => set({ filtroCategoria: cat }),
            definirOrdenacao: (ord: OrdenacaoInsumo) => set({ ordenacao: ord }),
            inverterOrdem: () => set((state: ArmazemInsumosState) => ({ ordemInvertida: !state.ordemInvertida })),

            abrirEditar: (insumo?: Insumo) => set({ modalCricaoAberto: true, insumoEditando: insumo || null }),
            fecharEditar: () => set({ modalCricaoAberto: false, insumoEditando: null }),

            abrirReposicao: (insumo: Insumo) => set({ modalReposicaoAberto: true, insumoReposicao: insumo }),
            fecharReposicao: () => set({ modalReposicaoAberto: false, insumoReposicao: null }),

            abrirBaixa: (insumo: Insumo) => set({ modalBaixaAberto: true, insumoBaixa: insumo }),
            fecharBaixa: () => set({ modalBaixaAberto: false, insumoBaixa: null }),

            abrirArquivamento: (insumo: Insumo) => set({ modalArquivamentoAberto: true, insumoArquivamento: insumo }),
            fecharArquivamento: () => set({ modalArquivamentoAberto: false, insumoArquivamento: null }),

            abrirHistorico: (insumo: Insumo) => set({ modalHistoricoAberto: true, insumoHistorico: insumo }),
            fecharHistorico: () => set({ modalHistoricoAberto: false, insumoHistorico: null })
        }),
        {
            name: "ArmazemInsumos",
            partialize: (state) => ({ insumos: state.insumos }) // Persiste no LocalStorage somente db
        }
    )
);
