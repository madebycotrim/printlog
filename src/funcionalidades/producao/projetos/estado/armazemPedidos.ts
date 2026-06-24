import { create } from "zustand";
import { Pedido } from "../tipos";

interface EstadoPedidos {
    pedidos: Pedido[];
    carregando: boolean;
    termoBusca: string;
    jaCarregou: boolean;
    idsBloqueados: string[]; // IDs de pedidos que estão sendo atualizados no momento

    definirPedidos: (pedidos: Pedido[]) => void;
    definirCarregando: (status: boolean) => void;
    definirTermoBusca: (termo: string) => void;
    definirJaCarregou: (status: boolean) => void;
    adicionarPedido: (novo: Pedido) => void;
    atualizarPedidoNoEstado: (id: string, dados: Partial<Pedido>) => void;
    removerPedido: (id: string) => void;
    bloquearId: (id: string) => void;
    desbloquearId: (id: string) => void;
}

export const useArmazemPedidos = create<EstadoPedidos>((set) => ({
    pedidos: [],
    carregando: false,
    termoBusca: "",
    jaCarregou: false,
    idsBloqueados: [],

    definirPedidos: (pedidos) => set({ pedidos }),
    definirCarregando: (status) => set({ carregando: status }),
    definirTermoBusca: (termo) => set({ termoBusca: termo }),
    definirJaCarregou: (status) => set({ jaCarregou: status }),

    adicionarPedido: (novo) => set((state) => ({
        pedidos: [...state.pedidos, novo]
    })),

    atualizarPedidoNoEstado: (id, dados) => set((state) => ({
        pedidos: state.pedidos.map((p) => (p.id === id ? { ...p, ...dados } : p))
    })),

    removerPedido: (id) => set((state) => ({
        pedidos: state.pedidos.filter((p) => p.id !== id)
    })),

    bloquearId: (id) => set((state) => ({
        idsBloqueados: [...state.idsBloqueados, id]
    })),

    desbloquearId: (id) => set((state) => ({
        idsBloqueados: state.idsBloqueados.filter((item) => item !== id)
    })),
}));
