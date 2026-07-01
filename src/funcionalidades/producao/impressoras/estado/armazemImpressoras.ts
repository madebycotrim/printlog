import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Impressora, TecnologiaImpressora } from "@/funcionalidades/producao/impressoras/tipos";
import { OrdenacaoImpressora } from "@/funcionalidades/producao/impressoras/componentes/FiltrosImpressora";

interface ArmazemImpressorasState {
    impressoras: Impressora[];
    carregando: boolean;
    jaCarregou: boolean;
    erro: string | null;
    filtroBusca: string;
    filtroTecnologia: TecnologiaImpressora | "Todas";
    ordenacao: OrdenacaoImpressora;
    ordemInvertida: boolean;

    // Modais e Controle de UI
    modalAberto: boolean;
    modalAposentarAberto: boolean;
    modalGerenciamentoAberto: boolean;
    abaGerenciamentoInicial: "producao" | "manutencao" | "config";
    
    impressoraSendoEditada: Impressora | null;
    impressoraParaAposentar: Impressora | null;
    impressoraGerenciamento: Impressora | null;

    // Ações Base
    definirImpressoras: (impressoras: Impressora[]) => void;
    definirCarregando: (status: boolean) => void;
    definirJaCarregou: (status: boolean) => void;
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
    abrirGerenciamento: (impressora: Impressora, aba?: "producao" | "manutencao" | "config") => void;
    fecharGerenciamento: () => void;

    // Ações de Mutação Local Otimistas
    adicionarOuAtualizarImpressora: (impressora: Impressora) => void;
    removerImpressora: (id: string) => void;
}

export const useArmazemImpressoras = create<ArmazemImpressorasState>()(
    devtools(
        (set) => ({
            impressoras: [],
            carregando: false,
            jaCarregou: false,
            erro: null,
            filtroBusca: "",
            filtroTecnologia: "Todas",
            ordenacao: "NOME",
            ordemInvertida: false,

            modalAberto: false,
            modalAposentarAberto: false,
            modalGerenciamentoAberto: false,
            abaGerenciamentoInicial: "producao",
            
            impressoraSendoEditada: null,
            impressoraParaAposentar: null,
            impressoraGerenciamento: null,

            definirImpressoras: (impressoras) => set({ impressoras }, false, "definirImpressoras"),
            definirCarregando: (status) => set({ carregando: status }, false, "definirCarregando"),
            definirJaCarregou: (status) => set({ jaCarregou: status }, false, "definirJaCarregou"),
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

            abrirGerenciamento: (impressora, aba = "producao") =>
                set({ 
                    modalGerenciamentoAberto: true, 
                    impressoraGerenciamento: impressora,
                    abaGerenciamentoInicial: aba 
                }, false, "impressoras/abrirGerenciamento"),
            fecharGerenciamento: () =>
                set({ 
                    modalGerenciamentoAberto: false, 
                    impressoraGerenciamento: null 
                }, false, "impressoras/fecharGerenciamento"),

            adicionarOuAtualizarImpressora: (impressora) => set((state) => {
                const existe = state.impressoras.some((i) => i.id === impressora.id);
                const novas = existe
                    ? state.impressoras.map((i) => (i.id === impressora.id ? { ...i, ...impressora } : i))
                    : [impressora, ...state.impressoras];
                return { impressoras: novas };
            }, false, "impressoras/adicionarOuAtualizarImpressora"),

            removerImpressora: (id) => set((state) => ({
                impressoras: state.impressoras.filter((i) => i.id !== id)
            }), false, "impressoras/removerImpressora"),
        }),
        { name: "ArmazemImpressoras" }
    )
);
