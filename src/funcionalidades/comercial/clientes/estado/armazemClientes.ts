import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Cliente, OrdenacaoCliente } from "../tipos";

interface ArmazemClientesState {
    clientes: Cliente[];
    carregando: boolean;
    erro: string | null;
    filtroBusca: string;
    ordenacao: OrdenacaoCliente;
    ordemInvertida: boolean;

    // Modais e Controle de UI
    modalAberto: boolean;
    clienteSendoEditado: Cliente | null;
    modalRemoverAberto: boolean;
    clienteSendoRemovido: Cliente | null;
    modalHistoricoAberto: boolean;
    clienteSendoHistorico: Cliente | null;

    // Ações Base
    definirClientes: (clientes: Cliente[]) => void;
    definirCarregando: (status: boolean) => void;
    definirErro: (erro: string | null) => void;

    // Ações de Filtragem
    pesquisar: (termo: string) => void;
    ordenarPor: (ordenacao: OrdenacaoCliente) => void;
    inverterOrdem: () => void;

    // Ações de UI
    abrirEditar: (cliente?: Cliente) => void;
    fecharEditar: () => void;
    abrirRemover: (cliente: Cliente) => void;
    fecharRemover: () => void;
    abrirHistorico: (cliente: Cliente) => void;
    fecharHistorico: () => void;
}

export const usarArmazemClientes = create<ArmazemClientesState>()(
    devtools(
        (set) => ({
            clientes: [],
            carregando: false,
            erro: null,
            filtroBusca: "",
            ordenacao: "RECENTE",
            ordemInvertida: false,

            modalAberto: false,
            clienteSendoEditado: null,
            modalRemoverAberto: false,
            clienteSendoRemovido: null,
            modalHistoricoAberto: false,
            clienteSendoHistorico: null,

            definirClientes: (clientes) => set({ clientes }, false, "clientes/definirClientes"),
            definirCarregando: (status) => set({ carregando: status }, false, "clientes/definirCarregando"),
            definirErro: (erro) => set({ erro }, false, "clientes/definirErro"),

            pesquisar: (termo) => set({ filtroBusca: termo }, false, "clientes/pesquisar"),
            ordenarPor: (ordenacao) => set({ ordenacao }, false, "clientes/ordenarPor"),
            inverterOrdem: () => set((state) => ({ ordemInvertida: !state.ordemInvertida }), false, "clientes/inverterOrdem"),

            abrirEditar: (cliente = null as unknown as Cliente) =>
                set({ modalAberto: true, clienteSendoEditado: cliente }, false, "clientes/abrirEditar"),
            fecharEditar: () =>
                set({ modalAberto: false, clienteSendoEditado: null }, false, "clientes/fecharEditar"),
            abrirRemover: (cliente) =>
                set({ modalRemoverAberto: true, clienteSendoRemovido: cliente }, false, "clientes/abrirRemover"),
            fecharRemover: () =>
                set({ modalRemoverAberto: false, clienteSendoRemovido: null }, false, "clientes/fecharRemover"),
            abrirHistorico: (cliente) =>
                set({ modalHistoricoAberto: true, clienteSendoHistorico: cliente }, false, "clientes/abrirHistorico"),
            fecharHistorico: () =>
                set({ modalHistoricoAberto: false, clienteSendoHistorico: null }, false, "clientes/fecharHistorico"),
        }),
        { name: "ArmazemClientes" }
    )
);
