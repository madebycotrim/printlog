/**
 * @file armazemNotificacoes.ts
 * @description Store Zustand para gestão de notificações globais.
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { Notificacao } from "../tipos/notificacoes";

interface ArmazemNotificacoesState {
  notificacoes: Notificacao[];

  // Ações
  adicionarNotificacao: (notificacao: Omit<Notificacao, "id" | "data" | "lida">) => void;
  marcarComoLida: (id: string) => void;
  marcarTodasComoLidas: () => void;
  limparNotificacoes: () => void;
  removerNotificacao: (id: string) => void;
}

export const usarArmazemNotificacoes = create<ArmazemNotificacoesState>()(
  devtools(
    persist(
      (set) => ({
        notificacoes: [],

        adicionarNotificacao: (dados) =>
          set(
            (estado) => {
              const nova: Notificacao = {
                ...dados,
                id: crypto.randomUUID(),
                data: new Date(),
                lida: false,
              };
              // Mantém apenas as últimas 50 notificações para evitar inchaço do localStorage
              const listaAtualizada = [nova, ...estado.notificacoes].slice(0, 50);
              return { notificacoes: listaAtualizada };
            },
            false,
            "notificacoes/adicionarNotificacao",
          ),

        marcarComoLida: (id) =>
          set(
            (estado) => ({
              notificacoes: estado.notificacoes.map((n) => (n.id === id ? { ...n, lida: true } : n)),
            }),
            false,
            "notificacoes/marcarComoLida",
          ),

        marcarTodasComoLidas: () =>
          set(
            (estado) => ({
              notificacoes: estado.notificacoes.map((n) => ({ ...n, lida: true })),
            }),
            false,
            "notificacoes/marcarTodasComoLidas",
          ),

        limparNotificacoes: () => set({ notificacoes: [] }, false, "notificacoes/limpar"),

        removerNotificacao: (id) =>
          set(
            (estado) => ({
              notificacoes: estado.notificacoes.filter((n) => n.id !== id),
            }),
            false,
            "notificacoes/removerNotificacao",
          ),
      }),
      {
        name: "printlog:notificacoes",
        // Necessário para serializar o Date corretamente
        storage: {
          getItem: (name) => {
            const str = localStorage.getItem(name);
            if (!str) return null;
            const data = JSON.parse(str);
            data.state.notificacoes = data.state.notificacoes.map((n: any) => ({
              ...n,
              data: new Date(n.data),
            }));
            return data;
          },
          setItem: (name, value) => localStorage.setItem(name, JSON.stringify(value)),
          removeItem: (name) => localStorage.removeItem(name),
        },
      },
    ),
    { name: "ArmazemNotificacoes" },
  ),
);
