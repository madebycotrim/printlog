import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Impressora, TecnologiaImpressora } from "@/funcionalidades/producao/impressoras/tipos";
import { OrdenacaoImpressora } from "@/funcionalidades/producao/impressoras/componentes/FiltrosImpressora";

interface ArmazemImpressorasState {
    impressoras: Impressora[];
    carregando: boolean;
    erro: string | null;
    filtroBusca: string;
    filtroTecnologia: TecnologiaImpressora | "Todas";
    ordenacao: OrdenacaoImpressora;
    ordemInvertida: boolean;

    // Modais e Controle de UI
    modalAberto: boolean;
    modalAposentarAberto: boolean;
    modalDetalhesAberto: boolean;
    modalHistoricoAberto: boolean;
    modalManutencaoAberto: boolean;
    modalPecasAberto: boolean;
    modalProducaoAberto: boolean;
    impressoraSendoEditada: Impressora | null;
    impressoraParaAposentar: Impressora | null;
    impressoraEmDetalhes: Impressora | null;
    impressoraHistorico: Impressora | null; // (Esse já existia para Manutencao?) -> Reutilizando ou mantendo.
    impressoraManutencao: Impressora | null;
    impressoraPecas: Impressora | null;
    impressoraProducao: Impressora | null;

    // Ações Base
    definirImpressoras: (impressoras: Impressora[]) => void;
    definirCarregando: (status: boolean) => void;
    definirErro: (erro: string | null) => void;

    // Ações de Filtragem e Ordenação
    pesquisar: (termo: string) => void;
    filtrarPorTecnologia: (tecnologia: TecnologiaImpressora | "Todas") => void;
    ordenarPor: (ordenacao: OrdenacaoImpressora) => void;
    inverterOrdem: () => void;

    // Ações de UI (Modais)
    abrirEditar: (impressora?: Impressora) => void;
    fecharEditar: () => void;
    abrirAposentar: (impressora: Impressora) => void;
    fecharAposentar: () => void;
    abrirDetalhes: (impressora: Impressora) => void;
    fecharDetalhes: () => void;
    abrirHistorico: (impressora: Impressora) => void;
    fecharHistorico: () => void;
    abrirManutencao: (impressora: Impressora) => void;
    fecharManutencao: () => void;
    abrirPecas: (impressora: Impressora) => void;
    fecharPecas: () => void;
    abrirProducao: (impressora: Impressora) => void;
    fecharProducao: () => void;
}

export const usarArmazemImpressoras = create<ArmazemImpressorasState>()(
    devtools(
        (set) => ({
            impressoras: [],
            carregando: false,
            erro: null,
            filtroBusca: "",
            filtroTecnologia: "Todas",
            ordenacao: "NOME",
            ordemInvertida: false,

            modalAberto: false,
            modalAposentarAberto: false, // This line was removed in the snippet, but it should remain.
            modalDetalhesAberto: false,
            modalHistoricoAberto: false, // Esse é manutencao history ?
            modalManutencaoAberto: false,
            modalPecasAberto: false,
            modalProducaoAberto: false,
            impressoraSendoEditada: null,
            impressoraParaAposentar: null,
            impressoraEmDetalhes: null,
            impressoraHistorico: null,
            impressoraManutencao: null,
            impressoraProducao: null,

            definirImpressoras: (impressoras) => set({ impressoras }, false, "definirImpressoras"),
            definirCarregando: (status) => set({ carregando: status }, false, "definirCarregando"),
            definirErro: (erro) => set({ erro }, false, "definirErro"),

            pesquisar: (termo) => set({ filtroBusca: termo }, false, "impressoras/pesquisar"),
            filtrarPorTecnologia: (tecnologia) => set({ filtroTecnologia: tecnologia }, false, "impressoras/filtrarPorTecnologia"),
            ordenarPor: (ordenacao) => set({ ordenacao }, false, "impressoras/ordenarPor"),
            inverterOrdem: () => set((state) => ({ ordemInvertida: !state.ordemInvertida }), false, "impressoras/inverterOrdem"),

            abrirEditar: (impressora = null as unknown as Impressora) =>
                set({ modalAberto: true, impressoraSendoEditada: impressora }, false, "impressoras/abrirEditar"),
            fecharEditar: () =>
                set({ modalAberto: false, impressoraSendoEditada: null }, false, "impressoras/fecharEditar"),

            abrirAposentar: (impressora) =>
                set({ modalAposentarAberto: true, impressoraParaAposentar: impressora }, false, "impressoras/abrirAposentar"),
            fecharAposentar: () =>
                set({ modalAposentarAberto: false, impressoraParaAposentar: null }, false, "impressoras/fecharAposentar"),

            abrirDetalhes: (impressora) =>
                set({ modalDetalhesAberto: true, impressoraEmDetalhes: impressora }, false, "impressoras/abrirDetalhes"),
            fecharDetalhes: () =>
                set({ modalDetalhesAberto: false, impressoraEmDetalhes: null }, false, "impressoras/fecharDetalhes"),

            abrirHistorico: (impressora) =>
                set({ modalHistoricoAberto: true, impressoraHistorico: impressora }, false, "impressoras/abrirHistorico"),
            fecharHistorico: () =>
                set({ modalHistoricoAberto: false, impressoraHistorico: null }, false, "impressoras/fecharHistorico"),

            abrirManutencao: (impressora) =>
                set({ modalManutencaoAberto: true, impressoraManutencao: impressora }, false, "impressoras/abrirManutencao"),
            fecharManutencao: () =>
                set({ modalManutencaoAberto: false, impressoraManutencao: null }, false, "impressoras/fecharManutencao"),

            abrirPecas: (impressora) =>
                set({ modalPecasAberto: true, impressoraPecas: impressora }, false, "impressoras/abrirPecas"),
            fecharPecas: () =>
                set({ modalPecasAberto: false, impressoraPecas: null }, false, "impressoras/fecharPecas"),

            abrirProducao: (impressora) =>
                set({ modalProducaoAberto: true, impressoraProducao: impressora }, false, "impressoras/abrirProducao"),
            fecharProducao: () =>
                set({ modalProducaoAberto: false, impressoraProducao: null }, false, "impressoras/fecharProducao"),
        }),
        { name: "ArmazemImpressoras" }
    )
);
