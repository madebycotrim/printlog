import { create } from "zustand";
import { Pedido } from "../tipos";

interface EstadoPedidos {
    pedidos: Pedido[];
    carregando: boolean;
    termoBusca: string;

    definirPedidos: (pedidos: Pedido[]) => void;
    definirCarregando: (status: boolean) => void;
    definirTermoBusca: (termo: string) => void;
    adicionarPedido: (novo: Pedido) => void;
    atualizarPedidoNoEstado: (id: string, dados: Partial<Pedido>) => void;
    removerPedido: (id: string) => void;
}

export const usarArmazemPedidos = create<EstadoPedidos>((set) => ({
    pedidos: [],
    carregando: true,
    termoBusca: "",

    definirPedidos: (pedidos) => set({ pedidos }),
    definirCarregando: (status) => set({ carregando: status }),
    definirTermoBusca: (termo) => set({ termoBusca: termo }),

    adicionarPedido: (novo) => set((state) => ({
        pedidos: [...state.pedidos, novo]
    })),

    atualizarPedidoNoEstado: (id, dados) => set((state) => ({
        pedidos: state.pedidos.map((p) => (p.id === id ? { ...p, ...dados } : p))
    })),

    removerPedido: (id) => set((state) => ({
        pedidos: state.pedidos.filter((p) => p.id !== id)
    })),
}));
