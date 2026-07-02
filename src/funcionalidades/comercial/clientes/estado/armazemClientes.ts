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

    totalClientes: number;

    // Modais e Controle de UI
    modalAberto: boolean;
    clienteSendoEditado: Cliente | null;
    modalRemoverAberto: boolean;
    clienteSendoRemovido: Cliente | null;
    modalHistoricoAberto: boolean;
    clienteSendoHistorico: Cliente | null;

    // Ações Base
    definirClientes: (clientes: Cliente[], total?: number) => void;
    adicionarPagina: (clientes: Cliente[]) => void;
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

    // Ações de Mutação Local Otimistas
    adicionarOuAtualizarCliente: (cliente: Cliente) => void;
    removerCliente: (id: string) => void;
}

export const useArmazemClientes = create<ArmazemClientesState>()(
    devtools(
        (set) => ({
            clientes: [],
            totalClientes: 0,
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

            definirClientes: (clientes, total) => set({ clientes, totalClientes: total ?? clientes.length }, false, "clientes/definirClientes"),
            adicionarPagina: (novos) => set((state) => {
                const mapIds = new Set(state.clientes.map(i => i.id));
                const unicos = novos.filter(i => !mapIds.has(i.id));
                return { clientes: [...state.clientes, ...unicos] };
            }, false, "clientes/adicionarPagina"),
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

            adicionarOuAtualizarCliente: (cliente) => set((state) => {
                const existe = state.clientes.some((c) => c.id === cliente.id);
                const novas = existe
                    ? state.clientes.map((c) => (c.id === cliente.id ? cliente : c))
                    : [cliente, ...state.clientes];
                return { clientes: novas };
            }, false, "clientes/adicionarOuAtualizarCliente"),

            removerCliente: (id) => set((state) => ({
                clientes: state.clientes.filter((c) => c.id !== id)
            }), false, "clientes/removerCliente"),
        }),
        { name: "ArmazemClientes" }
    )
);
